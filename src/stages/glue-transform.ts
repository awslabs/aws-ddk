import * as events from 'aws-cdk-lib/aws-events';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';
import { StateMachineStage, StateMachineStageProps } from '../pipelines/stage';

export interface GlueTransformStageProps extends StateMachineStageProps {
  readonly jobName: string;
  readonly jobArgs?: { [key: string]: any };
  readonly crawlerName: string;
}

export class GlueTransformStage extends StateMachineStage {
  readonly targets?: events.IRuleTarget[];
  readonly eventPattern?: events.EventPattern;
  readonly stateMachine: sfn.StateMachine;

  constructor(scope: Construct, id: string, props: GlueTransformStageProps) {
    super(scope, id, props);

    const jobName = props.jobName;
    const jobArgs = props.jobArgs;
    const crawlerName = props.crawlerName;

    const startJobRun = new tasks.GlueStartJobRun(this, 'Start Job Run', {
      glueJobName: jobName,
      integrationPattern: sfn.IntegrationPattern.RUN_JOB,
      arguments: jobArgs ? sfn.TaskInput.fromObject(jobArgs) : undefined,
      resultPath: sfn.JsonPath.DISCARD,
    });

    const crawlObject = new sfn.CustomState(this, 'Crawl Object', {
      stateJson: {
        Type: 'Task',
        Resource: 'arn:aws:states:::aws-sdk:glue:startCrawler',
        Parameters: { Name: crawlerName },
        Catch: [{ ErrorEquals: ['Glue.CrawlerRunningException'], Next: 'Success' }],
      },
    });

    const definition = startJobRun.next(crawlObject.next(new sfn.Succeed(this, 'Success')));

    [this.eventPattern, this.targets, this.stateMachine] = this.createStateMachine(definition, props);
  }
}
