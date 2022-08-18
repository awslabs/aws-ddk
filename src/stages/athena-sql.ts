import * as kms from 'aws-cdk-lib/aws-kms';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';
import { StateMachineStage, StateMachineStageProps } from '../pipelines/stage';

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

  private readonly queryString: string;

  private readonly workGroup?: string;
  private readonly catalogName?: string;
  private readonly databaseName?: string;

  private readonly outputLocation?: s3.Location;

  private readonly encryptionOption: tasks.EncryptionOption;
  private readonly encryptionKey?: kms.Key;

  constructor(scope: Construct, id: string, props: AthenaToSQLStageProps) {
    super(scope, id, props);

    this.queryString = props.queryString;

    this.workGroup = props.workGroup;
    this.catalogName = props.catalogName;
    this.databaseName = props.databaseName;

    this.outputLocation = props.outputLocation;

    this.encryptionOption = props.encryptionOption ?? tasks.EncryptionOption.S3_MANAGED;
    this.encryptionKey = props.encryptionKey;
  }

  protected createStateMachineSteps(): sfn.IChainable {
    const startQueryExec = new tasks.AthenaStartQueryExecution(
      this,
      'Start Query Exec',
      {
        queryString: this.queryString,
        integrationPattern: sfn.IntegrationPattern.RUN_JOB,
        queryExecutionContext: {
          catalogName: this.catalogName,
          databaseName: this.databaseName,
        },
        resultConfiguration: {
          encryptionConfiguration: {
            encryptionOption: this.encryptionOption,
            encryptionKey: this.encryptionKey,
          },
          outputLocation: this.outputLocation,
        },
        workGroup: this.workGroup,
      },
    );

    return startQueryExec.next(new sfn.Succeed(this, 'Success'));
  }
}
