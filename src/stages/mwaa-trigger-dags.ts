import * as cdk from "aws-cdk-lib";
import * as events from "aws-cdk-lib/aws-events";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import { StateMachineStage, StateMachineStageProps } from "../pipelines/stage";

/**
 * Properties of the MWAA Trigger Dags stage.
 */
export interface MWAATriggerDagsStageProps extends StateMachineStageProps {
  /**
   * Name of airflow environment.
   */
  readonly mwaaEnvironmentName: string;
  /**
   * Name of dag(s) to trigger.
   */
  readonly dags: string[];
  /**
   * Time to wait between execution status checks.
   * @default aws_cdk.Duration.seconds(15)
   */
  readonly statusCheckPeriod?: cdk.Duration;
}

export interface MWAALambdasResult {
  readonly triggerLambda: lambda.Function;
  readonly statusLambda: lambda.Function;
}

/**
 * Stage that contains a step function that runs a Managed Apache Airflow (MWAA) dag or set of dags .
 */
export class MWAATriggerDagsStage extends StateMachineStage {
  readonly targets?: events.IRuleTarget[];
  readonly eventPattern?: events.EventPattern;
  readonly stateMachine: sfn.StateMachine;
  readonly mwaaEnvironmentName: string;

  /**
   * Constructs MWAATriggerDagsStage.
   * @param scope Scope within which this construct is defined.
   * @param id Identifier of the stage.
   * @param props Properties for the stage.
   */
  constructor(scope: Construct, id: string, props: MWAATriggerDagsStageProps) {
    super(scope, id, props);

    this.mwaaEnvironmentName = props.mwaaEnvironmentName;

    const lambdas = this.buildLambdas();

    const definition = new sfn.Parallel(this, "Parallel States");
    for (const dag in props.dags) {
      const dagId = props.dags[dag];
      const waitTask = new sfn.Wait(this, `Wait Before Checking ${dagId} Status`, {
        time: sfn.WaitTime.duration(props.statusCheckPeriod ?? cdk.Duration.seconds(15)),
      });
      definition.branch(
        new tasks.LambdaInvoke(this, `Trigger Dag ${dagId}`, {
          lambdaFunction: lambdas.triggerLambda,
          payload: sfn.TaskInput.fromObject({ dag_id: dagId }),
        })
          .next(waitTask)
          .next(
            new tasks.LambdaInvoke(this, `Get Dag ${dagId} Execution Status`, {
              lambdaFunction: lambdas.statusLambda,
              payload: sfn.TaskInput.fromObject({ dag_id: dagId }),
            }).next(
              new sfn.Choice(this, `Check ${dagId} Execution Status`)
                .when(sfn.Condition.stringEquals("$.Payload", "success"), new sfn.Succeed(this, `${dagId} success`))
                .when(
                  sfn.Condition.stringEquals("$.Payload", "failed"),
                  new sfn.Fail(this, `${dagId} failure`, { error: "DagExecutionFailed" }),
                )
                .otherwise(waitTask),
            ),
          ),
      );
    }

    ({
      eventPattern: this.eventPattern,
      targets: this.targets,
      stateMachine: this.stateMachine,
    } = this.createStateMachine(definition, props));
  }

  private buildLambdas(): MWAALambdasResult {
    const lambdaRole = new iam.Role(this, `MWAA Stage Lambda Role`, {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      description: "lambda role to trigger airflow dag execution",
    });

    // Enable the functions to get flow execution records
    lambdaRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["airflow:CreateCliToken"],
        resources: ["*"],
      }),
    );

    const triggerLambda = new lambda.Function(this, "Trigger Dag Lambda", {
      code: lambda.Code.fromInline(`
# Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License").
# You may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import boto3
import http.client
import base64
import ast
from datetime import datetime 
import json

execution_date = datetime.today().strftime('%Y-%m-%d')
mwaa_env_name = "${this.mwaaEnvironmentName}"

client = boto3.client('mwaa')

def run_api_call(conn, payload, headers):
    print(f"running command: {payload}")
    conn.request("POST", "/aws_mwaa/cli", payload, headers)
    res = conn.getresponse()
    data = res.read()
    dict_str = data.decode("UTF-8")
    mydata = ast.literal_eval(dict_str)
    return base64.b64decode(mydata['stdout'])
    
def lambda_handler(event, context):
    # get web token
    mwaa_cli_token = client.create_cli_token(
        Name=mwaa_env_name
    )

    dag_id = event['dag_id']
    
    conn = http.client.HTTPSConnection(mwaa_cli_token['WebServerHostname'])
    headers = {
      'Authorization': 'Bearer ' + mwaa_cli_token['CliToken'],
      'Content-Type': 'text/plain'
    }

    run_api_call(conn, f"dags trigger {dag_id}", headers)
        `),
      handler: "index.lambda_handler",
      role: lambdaRole,
      runtime: lambda.Runtime.PYTHON_3_9,
      memorySize: 256,
      timeout: cdk.Duration.seconds(60),
    });

    const statusLambda = new lambda.Function(this, "Check Dag Status Lambda", {
      code: lambda.Code.fromInline(`
# Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License").
# You may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import boto3
import http.client
import base64
import ast
from datetime import datetime 
import json

execution_date = datetime.today().strftime('%Y-%m-%d')
mwaa_env_name = "${this.mwaaEnvironmentName}"

client = boto3.client('mwaa')

def run_api_call(conn, payload, headers):
    print(f"running command: {payload}")
    conn.request("POST", "/aws_mwaa/cli", payload, headers)
    res = conn.getresponse()
    data = res.read()
    dict_str = data.decode("UTF-8")
    mydata = ast.literal_eval(dict_str)
    return base64.b64decode(mydata['stdout'])
    
def lambda_handler(event, context):
    # get web token
    mwaa_cli_token = client.create_cli_token(
        Name=mwaa_env_name
    )
  
    dag_id = event['dag_id']

    conn = http.client.HTTPSConnection(mwaa_cli_token['WebServerHostname'])
    headers = {
      'Authorization': 'Bearer ' + mwaa_cli_token['CliToken'],
      'Content-Type': 'text/plain'
    }

    results = json.loads(run_api_call(conn, f"dags list-runs -d {dag_id} -o json -s {execution_date}", headers))
    for result in results:
        return result['state']
        break
        `),
      handler: "index.lambda_handler",
      role: lambdaRole,
      runtime: lambda.Runtime.PYTHON_3_9,
      memorySize: 256,
      timeout: cdk.Duration.seconds(60),
    });

    return {
      triggerLambda,
      statusLambda,
    };
  }
}
