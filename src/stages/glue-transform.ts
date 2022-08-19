import * as glueAlpha from '@aws-cdk/aws-glue-alpha';
import * as glue from 'aws-cdk-lib/aws-glue';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';
import { StateMachineStage, StateMachineStageProps } from '../pipelines/stage';

export interface GlueTransformStageProps extends StateMachineStageProps {
  readonly job?: glueAlpha.Job;
  readonly jobName: string;
  readonly jobArgs?: { [key: string]: any };
  readonly crawlerName?: string;
  readonly cfnCrawler?: glue.CfnCrawler;
}

export class GlueTransformStage extends StateMachineStage {
  private readonly job?: glueAlpha.Job;
  private readonly jobName?: string;
  private readonly jobArgs?: { [key: string]: any };
  private readonly crawlerName?: string;
  private readonly cfnCrawler?: glue.CfnCrawler;

  constructor(scope: Construct, id: string, props: GlueTransformStageProps) {
    super(scope, id, props);

    this.job = props.job;
    this.jobName = props.jobName;
    this.jobArgs = props.jobArgs;
    this.crawlerName = props.crawlerName;
    this.cfnCrawler = props.cfnCrawler;

    if (this.jobName == undefined && this.job == undefined) {
      throw TypeError("Either 'jobName' or 'job' is required");
    }
    if (this.crawlerName == undefined && this.cfnCrawler == undefined) {
      throw TypeError("Either 'crawlerName' or 'cfnCrawler' is required");
    }
  }

  protected createStateMachineSteps(): sfn.IChainable {

    const startJobRun = new tasks.GlueStartJobRun(
      this,
      'Start Job Run',
      {
        glueJobName: this.jobName ?? this.job?.jobName ?? '',
        integrationPattern: sfn.IntegrationPattern.RUN_JOB,
        arguments: this.jobArgs ? sfn.TaskInput.fromObject(this.jobArgs) : undefined,
        resultPath: sfn.JsonPath.DISCARD,
      },
    );

    const crawlOjbect = new sfn.CustomState(
      this,
      'Crawl Object',
      {
        stateJson: {
          Type: 'Task',
          Resource: 'arn:aws:states:::aws-sdk:glue:startCrawler',
          Parameters: { Name: this.crawlerName ?? this.cfnCrawler?.name },
          Catch: [{ ErrorEquals: ['Glue.CrawlerRunningException'], Next: 'success' }],
        },
      },
    );

    return startJobRun.next(crawlOjbect.next(new sfn.Succeed(this, 'Success')));
  }
}
