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
  private readonly jobName: string;
  private readonly jobArgs?: { [key: string]: any };
  private readonly crawlerName: string;

  constructor(scope: Construct, id: string, props: GlueTransformStageProps) {
    super(scope, id, props);

    this.jobName = props.jobName;
    this.jobArgs = props.jobArgs;
    this.crawlerName = props.crawlerName;
  }

  protected createStateMachineSteps(): sfn.IChainable {
    const startJobRun = new tasks.GlueStartJobRun(this, 'Start Job Run', {
      glueJobName: this.jobName,
      integrationPattern: sfn.IntegrationPattern.RUN_JOB,
      arguments: this.jobArgs ? sfn.TaskInput.fromObject(this.jobArgs) : undefined,
      resultPath: sfn.JsonPath.DISCARD,
    });

    const crawlObject = new sfn.CustomState(this, 'Crawl Object', {
      stateJson: {
        Type: 'Task',
        Resource: 'arn:aws:states:::aws-sdk:glue:startCrawler',
        Parameters: { Name: this.crawlerName },
        Catch: [{ ErrorEquals: ['Glue.CrawlerRunningException'], Next: 'Success' }],
      },
    });

    return startJobRun.next(crawlObject.next(new sfn.Succeed(this, 'Success')));
  }
}
