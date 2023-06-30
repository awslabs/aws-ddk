import * as cdk from "aws-cdk-lib";
import * as events from "aws-cdk-lib/aws-events";
import * as iam from "aws-cdk-lib/aws-iam";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import { StateMachineStage, StateMachineStageProps } from "../pipelines/stage";

/**
 * Properties for `RedshiftDataApiStage`.
 */
export interface RedshiftDataApiStageProps extends StateMachineStageProps {
  /**
   * Identifier of the Redshift cluster.
   */
  readonly redshiftClusterIdentifier: string;
  /**
   * List of SQL statements to execute.
   */
  readonly sqlStatements: string[];
  /**
   * Name of the database in Redshift.
   *
   * @default "dev"
   */
  readonly databaseName?: string;
  /**
   * Database user.
   *
   * @default "awsuser"
   */
  readonly databaseUser?: string;
  /**
   * Waiting time between checking whether the statements have finished executing.
   *
   * @default cdk.Duration.seconds(15)
   */
  readonly pollingTime?: cdk.Duration;
}

/**
 * Stage that contains a step function that executes Redshift Data API statements.
 */
export class RedshiftDataApiStage extends StateMachineStage {
  readonly targets?: events.IRuleTarget[];
  readonly eventPattern?: events.EventPattern;
  readonly stateMachine: sfn.StateMachine;
  readonly stateMachineInput?: { [key: string]: any };
  readonly eventBridgeEventPath?: string;

  /**
   * Constructs `RedshiftDataApiStage`.
   * @param scope Scope within which this construct is defined.
   * @param id Identifier of the stage.
   * @param props Properties for the stage.
   */
  constructor(scope: Construct, id: string, props: RedshiftDataApiStageProps) {
    super(scope, id, props);

    this.stateMachineInput = props.stateMachineInput;
    const stack = cdk.Stack.of(this);
    const databaseName = props.databaseName ?? "dev";
    const databaseUser = props.databaseUser ?? "awsuser";
    const redshiftClusterArn = `arn:aws:redshift:${stack.region}:${stack.account}:cluster:${props.redshiftClusterIdentifier}`;
    const redshiftDatabaseArn = `arn:aws:redshift:${stack.region}:${stack.account}:dbname:${props.redshiftClusterIdentifier}/${databaseName}`;
    const redshiftUserArn = `arn:aws:redshift:${stack.region}:${stack.account}:dbuser:${props.redshiftClusterIdentifier}/${databaseUser}`;
    const pollingTime = props.pollingTime ?? cdk.Duration.seconds(15);

    const batchExecuteStatement = new tasks.CallAwsService(this, `${id} Execute Statement on Redshift`, {
      service: "redshiftdata",
      action: "batchExecuteStatement",
      iamResources: [redshiftClusterArn],
      parameters: {
        ClusterIdentifier: props.redshiftClusterIdentifier,
        Database: databaseName,
        Sqls: props.sqlStatements,
        DbUser: databaseUser,
      },
      resultPath: "$.sql_output",
    });
    const wait = new sfn.Wait(this, "wait", {
      time: sfn.WaitTime.duration(pollingTime),
    });

    const describeStatement = new tasks.CallAwsService(this, `${id} Describe Statement on Redshift`, {
      service: "redshiftdata",
      action: "describeStatement",
      iamResources: [redshiftClusterArn],
      parameters: {
        "Id.$": "$.sql_output.Id",
      },
      resultPath: "$.sql_output",
    });

    const definition = batchExecuteStatement
      .next(wait)
      .next(describeStatement)
      .next(
        new sfn.Choice(this, "check status")
          .when(sfn.Condition.stringEquals("$.sql_output.Status", "FAILED"), new sfn.Fail(this, "failure"))
          .when(sfn.Condition.stringEquals("$.sql_output.Status", "FINISHED"), new sfn.Succeed(this, "success"))
          .otherwise(wait),
      );

    ({ eventPattern: this.eventPattern, stateMachine: this.stateMachine } = this.createStateMachine({
      definition: definition,
      ...props,
    }));
    this.stateMachine.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "redshift-data:BatchExecuteStatement",
          "redshift-data:ListStatements",
          "redshift-data:GetStatementResult",
          "redshift-data:DescribeStatement",
          "redshift-data:ExecuteStatement",
        ],
        resources: ["*"],
      }),
    );
    this.stateMachine.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["redshift:GetClusterCredentials"],
        resources: [redshiftClusterArn, redshiftDatabaseArn, redshiftUserArn],
      }),
    );
  }
}
