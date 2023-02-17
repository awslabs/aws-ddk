import * as glue_alpha from "@aws-cdk/aws-glue-alpha";
import * as cdk from "aws-cdk-lib";
import * as events from "aws-cdk-lib/aws-events";
import * as glue from "aws-cdk-lib/aws-glue";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import { assignGlueJobProps } from "../core/glue-defaults";
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

    const glueJob = this.getGlueJob(scope, id, props);
    const jobRunArgs = props.jobRunArgs;
    const crawlerName = this.getCrawlerName(props);

    const startJobRun = new tasks.GlueStartJobRun(this, "Start Job Run", {
      glueJobName: glueJob.jobName,
      integrationPattern: sfn.IntegrationPattern.RUN_JOB,
      arguments: jobRunArgs ? sfn.TaskInput.fromObject(jobRunArgs) : undefined,
      resultPath: sfn.JsonPath.DISCARD,
    });

    const stack = cdk.Stack.of(this);
    const crawlObject = new tasks.CallAwsService(this, "Crawl Object", {
      service: "glue",
      action: "startCrawler",
      parameters: {
        Name: crawlerName,
      },
      iamResources: [`arn:${stack.partition}:glue:${stack.region}:${stack.account}:crawler/${crawlerName}`],
    });

    const successTask = new sfn.Succeed(this, "Success");

    crawlObject.addCatch(successTask, {
      errors: ["Glue.CrawlerRunningException"],
    });

    const definition = startJobRun.next(crawlObject.next(successTask));

    ({
      eventPattern: this.eventPattern,
      targets: this.targets,
      stateMachine: this.stateMachine,
    } = this.createStateMachine(definition, props));
  }

  private getGlueJob(scope: Construct, id: string, props: GlueTransformStageProps): glue_alpha.IJob {
    if (props.jobName) {
      return glue_alpha.Job.fromJobAttributes(this, "Glue Job", {
        jobName: props.jobName,
      });
    }

    if (!props.jobProps) {
      throw TypeError("'jobName' or 'jobProps' must be set to instantiate this stage");
    }

    return new glue_alpha.Job(
      this,
      "Glue Job",
      assignGlueJobProps(scope, `${id} Job`, {
        ...props.jobProps,
      }),
    );
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
