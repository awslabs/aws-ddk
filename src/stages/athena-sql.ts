import * as events from "aws-cdk-lib/aws-events";
import * as eventsTargets from "aws-cdk-lib/aws-events-targets";
import * as kms from "aws-cdk-lib/aws-kms";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import { StateMachineStage, StateMachineStageProps } from "../pipelines/stage";

/**
 * Properties for `AthenaSQLStage`.
 */
export interface AthenaToSQLStageProps extends StateMachineStageProps {
  /**
   * SQL queries that will be started.
   */
  readonly queryString?: Array<string>;
  /**
   * dynamic path in statemachine for SQL query to be started.
   */
  readonly queryStringPath?: string;
  /**
   * flag to determine parallel or sequential execution
   * @default false
   */
  readonly parallel?: boolean;
  /**
   * Athena workgroup name.
   */
  readonly workGroup?: string;
  /**
   * Catalog name.
   */
  readonly catalogName?: string;
  /**
   * Database name.
   */
  readonly databaseName?: string;
  /**
   * Output S3 location
   */
  readonly outputLocation?: s3.Location;
  /**
   * Encryption KMS key.
   */
  readonly encryptionKey?: kms.Key;
  /**
   * Encryption configuration.
   */
  readonly encryptionOption?: tasks.EncryptionOption;
}

/**
 * Stage that contains a step function that execute Athena SQL query.
 */
export class AthenaSQLStage extends StateMachineStage {
  readonly targets?: events.IRuleTarget[];
  readonly eventPattern?: events.EventPattern;
  readonly stateMachine: sfn.StateMachine;
  readonly stateMachineInput?: { [key: string]: any };
  readonly eventBridgeEventPath?: string;

  /**
   * Constructs `AthenaSQLStage`.
   * @param scope Scope within which this construct is defined.
   * @param id Identifier of the stage.
   * @param props Properties for the stage.
   */
  constructor(scope: Construct, id: string, props: AthenaToSQLStageProps) {
    super(scope, id, props);

    this.stateMachineInput = props.stateMachineInput;

    if (props.queryString && props.queryStringPath) {
      throw TypeError("For this stage provide one of queryString or queryStringPath parameter, not both");
    }
    const queryStringInput = props.queryStringPath ? sfn.JsonPath.stringAt(props.queryStringPath) : props.queryString;
    if (!queryStringInput) {
      throw TypeError("For this stage one of queryString or queryStringPath parameter is required");
    }

    var cnt = 0;
    if (props.queryString) {
      if (props.parallel) {
        var athenaQueryExec: any = new sfn.Parallel(this, "All Jobs");
        for (var query of queryStringInput) {
          const addStep = this.getAthenaStartQueryExecutionStep(query, props, cnt);
          var athenaQueryExec = athenaQueryExec.branch(addStep);
          cnt = cnt + 1;
        }
      } else {
        var athenaQueryExec: any = undefined;
        for (var query of queryStringInput) {
          const addStep = this.getAthenaStartQueryExecutionStep(query, props, cnt);
          var athenaQueryExec = athenaQueryExec ? athenaQueryExec.next(addStep) : addStep;
          cnt = cnt + 1;
        }
      }
    } else {
      var athenaQueryExec: any = this.getAthenaStartQueryExecutionStep(queryStringInput, props, cnt);
    }

    const definition = athenaQueryExec.next(new sfn.Succeed(this, "Success"));

    ({ eventPattern: this.eventPattern, stateMachine: this.stateMachine } = this.createStateMachine({definition: definition, ...props}));
    this.targets = [
      new eventsTargets.SfnStateMachine(this.stateMachine, {
        input: props.queryString
          ? events.RuleTargetInput.fromObject(this.stateMachineInput)
          : events.RuleTargetInput.fromEventPath("$.detail"),
      }),
    ];
  }

  private getAthenaStartQueryExecutionStep(
    queryStringInput: any,
    props: AthenaToSQLStageProps,
    cnt: number,
  ): tasks.AthenaStartQueryExecution {
    const encryptionOption = props.encryptionOption ?? tasks.EncryptionOption.S3_MANAGED;
    const encryptionKey = props.encryptionKey;
    const startQueryExec = new tasks.AthenaStartQueryExecution(this, `Query Exec ${cnt}`, {
      queryString: queryStringInput,
      integrationPattern: sfn.IntegrationPattern.RUN_JOB,
      queryExecutionContext: {
        catalogName: props.catalogName,
        databaseName: props.databaseName,
      },
      resultConfiguration: {
        encryptionConfiguration: {
          encryptionOption: encryptionOption,
          encryptionKey: encryptionKey,
        },
        outputLocation: props.outputLocation,
      },
      workGroup: props.workGroup,
    });

    return startQueryExec;
  }
}
