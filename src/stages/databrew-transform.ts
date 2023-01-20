import * as databrew from "aws-cdk-lib/aws-databrew";
import * as events from "aws-cdk-lib/aws-events";
import * as iam from "aws-cdk-lib/aws-iam";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";

import { StateMachineStage, StateMachineStageProps } from "../pipelines/stage";

export interface DataBrewTransformStageProps extends StateMachineStageProps {
  readonly jobName?: string;
  readonly jobRoleArn?: string;
  readonly jobType?: string;
  readonly datasetName?: string;
  readonly recipe?: databrew.CfnJob.RecipeProperty;
  readonly outputs?: databrew.CfnJob.OutputProperty[];
  readonly createJob?: boolean;
}

export class DataBrewTransformStage extends StateMachineStage {
  readonly targets?: events.IRuleTarget[];
  readonly eventPattern?: events.EventPattern;
  readonly stateMachine: sfn.StateMachine;
  readonly job?: databrew.CfnJob;
  readonly jobName: string;
  readonly createJob: boolean;

  constructor(scope: Construct, id: string, props: DataBrewTransformStageProps) {
    super(scope, id, props);

    const { jobName, jobRoleArn, jobType, datasetName, recipe, outputs, createJob } = props;
    this.jobName = jobName ? jobName : `${id}-job`;
    this.createJob = jobName && !createJob ? false : true;

    if (this.createJob) {
      if (!jobType) {
        throw new Error("if 'jobType' is a required property when creating a new DataBrew job");
      }
      this.job = new databrew.CfnJob(this, "DataBrew Job", {
        name: this.jobName,
        roleArn: jobRoleArn ? jobRoleArn : this.createDefaultDataBrewJobRole().roleArn,
        type: jobType,
        datasetName: datasetName,
        recipe: recipe,
        outputs: outputs,
      });
    }
    const startJobRun = new tasks.GlueDataBrewStartJobRun(this, "Start DataBrew Job", {
      name: this.job ? this.job.name : this.jobName,
      integrationPattern: sfn.IntegrationPattern.RUN_JOB,
    });

    const definition = startJobRun.next(new sfn.Succeed(this, "success"));

    ({
      eventPattern: this.eventPattern,
      targets: this.targets,
      stateMachine: this.stateMachine,
    } = this.createStateMachine(definition, props));
  }

  private createDefaultDataBrewJobRole(): iam.Role {
    return new iam.Role(this, "DataBrew Job Role", {
      assumedBy: new iam.ServicePrincipal("databrew.amazonaws.com"),
      description: "Default DataBrew Job Role created by the AWS DDK",
      managedPolicies: [
        iam.ManagedPolicy.fromManagedPolicyName(
          this,
          "DataBrew Service Role Policy",
          "service-role/AWSGlueDataBrewServiceRole",
        ),
      ],
    });
  }
}
