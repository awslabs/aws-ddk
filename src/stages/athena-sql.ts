import * as kms from 'aws-cdk-lib/aws-kms';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';
import { StateMachineStage, StateMachineStageProps } from '../pipelines/stage';

export interface AthenaToSQLStageProps extends StateMachineStageProps {
  readonly queryString: string;
  readonly workGroup?: string;
  readonly catalogName?: string;
  readonly databaseName?: string;
  readonly outputBucketName?: string;
  readonly outputObjectKey?: string;
  readonly encryptionOption?: tasks.EncryptionOption;
  readonly encryptionKey?: kms.Key;
}

export class AthenaSQLStage extends StateMachineStage {
  /*
  Class that represents a Athena SQL DDK DataStage.
  */

  constructor(scope: Construct, id: string, props: AthenaToSQLStageProps) {
    super(scope, id, props);

    var startQueryExec = new tasks.AthenaStartQueryExecution(
      this,
      'start-query-exec',
      {
        queryString: props.queryString,
        integrationPattern: sfn.IntegrationPattern.RUN_JOB,
        queryExecutionContext: {
          catalogName: props.catalogName,
          databaseName: props.databaseName,
        },
        resultConfiguration: {
          encryptionConfiguration: {
            encryptionOption:
              props.encryptionOption ?? tasks.EncryptionOption.S3_MANAGED,
            encryptionKey: props.encryptionKey,
          },
          outputLocation:
            props.outputBucketName && props.outputObjectKey
              ? {
                  bucketName: props.outputBucketName,
                  objectKey: props.outputObjectKey,
                }
              : undefined,
        },
        workGroup: props.workGroup,
      },
    );
    this.buildStateMachine(
      id,
      startQueryExec.next(new sfn.Succeed(this, 'success')),
      {
        stateMachineInput: props.stateMachineInput,
        additionalRolePolicyStatements: props.additionalRolePolicyStatements,
        stateMachineFailedExecutionsAlarmThreshold:
          props.stateMachineFailedExecutionsAlarmThreshold,
        stateMachineFailedExecutionsAlarmEvaluationPeriods:
          props.stateMachineFailedExecutionsAlarmEvaluationPeriods,
      },
    );
  }
}
