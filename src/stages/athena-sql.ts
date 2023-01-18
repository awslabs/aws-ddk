import * as events from "aws-cdk-lib/aws-events";
import * as kms from "aws-cdk-lib/aws-kms";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import { StateMachineStage, StateMachineStageProps } from "../pipelines/stage";

export interface AthenaToSQLStageProps extends StateMachineStageProps {
  readonly queryString: string;
  readonly workGroup?: string;
  readonly catalogName?: string;
  readonly databaseName?: string;
  readonly outputLocation?: s3.Location;
  readonly encryptionOption?: tasks.EncryptionOption;
  readonly encryptionKey?: kms.Key;
}

export class AthenaSQLStage extends StateMachineStage {
  readonly targets?: events.IRuleTarget[];
  readonly eventPattern?: events.EventPattern;
  readonly stateMachine: sfn.StateMachine;

  constructor(scope: Construct, id: string, props: AthenaToSQLStageProps) {
    super(scope, id, props);

    const { queryString, workGroup, catalogName, databaseName, outputLocation } = props;

    const encryptionOption = props.encryptionOption ?? tasks.EncryptionOption.S3_MANAGED;
    const encryptionKey = props.encryptionKey;

    const startQueryExec = new tasks.AthenaStartQueryExecution(this, "Start Query Exec", {
      queryString: queryString,
      integrationPattern: sfn.IntegrationPattern.RUN_JOB,
      queryExecutionContext: {
        catalogName: catalogName,
        databaseName: databaseName,
      },
      resultConfiguration: {
        encryptionConfiguration: {
          encryptionOption: encryptionOption,
          encryptionKey: encryptionKey,
        },
        outputLocation: outputLocation,
      },
      workGroup: workGroup,
    });

    const definition = startQueryExec.next(new sfn.Succeed(this, "Success"));

    [this.eventPattern, this.targets, this.stateMachine] = this.createStateMachine(definition, props);
  }
}
