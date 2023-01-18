import * as glue_alpha from "@aws-cdk/aws-glue-alpha";
import * as events from "aws-cdk-lib/aws-events";
import * as glue from "aws-cdk-lib/aws-glue";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import { StateMachineStage, StateMachineStageProps } from "../pipelines/stage";

export interface GlueTransformStageProps extends StateMachineStageProps {
  readonly jobName?: string;
  readonly jobProps?: glue_alpha.JobProps;
  readonly jobRunArgs?: { [key: string]: any };
  readonly crawlerName?: string;
  readonly crawlerProps?: glue.CfnCrawlerProps;
}

export class GlueTransformStage extends StateMachineStage {
  readonly targets?: events.IRuleTarget[];
  readonly eventPattern?: events.EventPattern;
  readonly stateMachine: sfn.StateMachine;

  constructor(scope: Construct, id: string, props: GlueTransformStageProps) {
    super(scope, id, props);

    const glueJob = this.getGlueJob(props);
    const jobRunArgs = props.jobRunArgs;
    const crawlerName = this.getCrawlerName(props);

    const startJobRun = new tasks.GlueStartJobRun(this, "Start Job Run", {
      glueJobName: glueJob.jobName,
      integrationPattern: sfn.IntegrationPattern.RUN_JOB,
      arguments: jobRunArgs ? sfn.TaskInput.fromObject(jobRunArgs) : undefined,
      resultPath: sfn.JsonPath.DISCARD,
    });

    const crawlObject = new sfn.CustomState(this, "Crawl Object", {
      stateJson: {
        Type: "Task",
        Resource: "arn:aws:states:::aws-sdk:glue:startCrawler",
        Parameters: { Name: crawlerName },
        Catch: [{ ErrorEquals: ["Glue.CrawlerRunningException"], Next: "Success" }],
      },
    });

    const definition = startJobRun.next(crawlObject.next(new sfn.Succeed(this, "Success")));

    [this.eventPattern, this.targets, this.stateMachine] = this.createStateMachine(definition, props);
  }

  private getGlueJob(props: GlueTransformStageProps): glue_alpha.IJob {
    if (props.jobName) {
      return glue_alpha.Job.fromJobAttributes(this, "Glue Job", {
        jobName: props.jobName,
      });
    }

    if (!props.jobProps) {
      throw TypeError("'jobName' or 'jobProps' must be set to instantiate this stage");
    }

    return new glue_alpha.Job(this, "Glue Job", props.jobProps);
  }

  private getCrawlerName(props: GlueTransformStageProps): string {
    if (props.crawlerName) {
      return props.crawlerName;
    }

    if (!props.crawlerProps) {
      throw TypeError("'crawlerName' or 'crawlerProps' must be set to instantiate this stage");
    }

    const crawler = new glue.CfnCrawler(this, "Crawler", props.crawlerProps);
    return crawler.ref;
  }
}
