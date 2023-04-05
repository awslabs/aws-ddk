import * as glue_alpha from "@aws-cdk/aws-glue-alpha";
import * as cdk from "aws-cdk-lib";
import * as events from "aws-cdk-lib/aws-events";
import * as glue from "aws-cdk-lib/aws-glue";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import { GlueFactory } from "../core/glue-factory";
import { StateMachineStage, StateMachineStageProps } from "../pipelines/stage";

export interface GlueTransformStageProps extends StateMachineStageProps {
  readonly jobName?: string;
  readonly jobProps?: glue_alpha.JobProps;
  readonly jobRunArgs?: { [key: string]: any };
  readonly crawlerName?: string;
  readonly crawlerRole?: string;
  readonly databaseName?: string;
  readonly targets?: glue.CfnCrawler.TargetsProperty;
  readonly crawlerProps?: glue.CfnCrawlerProps;
  readonly crawlerAllowFailure?: boolean;
  readonly stateMachineRetryMaxAttempts?: number;
  readonly stateMachineRetryBackoffRate?: number;
  readonly stateMachineRetryInterval?: cdk.Duration;
}

export class GlueTransformStage extends StateMachineStage {
  readonly targets?: events.IRuleTarget[];
  readonly eventPattern?: events.EventPattern;
  readonly stateMachine: sfn.StateMachine;
  readonly glueJob: glue_alpha.IJob;
  readonly crawler?: glue.CfnCrawler;

  constructor(scope: Construct, id: string, props: GlueTransformStageProps) {
    super(scope, id, props);

    this.glueJob = this.getGlueJob(scope, id, props);
    const jobRunArgs = props.jobRunArgs;

    this.crawler = props.crawlerName ? undefined : this.getCrawler(props);
    const crawlerName = this.crawler ? this.crawler.ref : props.crawlerName;

    const startJobRun = new tasks.GlueStartJobRun(this, "Start Job Run", {
      glueJobName: this.glueJob.jobName,
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

    crawlObject.addRetry({
      errors: ["Glue.CrawlerRunningException"],
      maxAttempts: props.stateMachineRetryMaxAttempts ?? 3,
      backoffRate: props.stateMachineRetryBackoffRate ?? 2,
      interval: props.stateMachineRetryInterval ?? cdk.Duration.seconds(1),
    });

    const crawlerAllowFailure = props.crawlerAllowFailure ?? true;
    if (crawlerAllowFailure) {
      crawlObject.addCatch(successTask, { errors: ["Glue.CrawlerRunningException"] });
    }

    const definition = startJobRun.next(crawlObject.next(successTask));

    ({
      eventPattern: this.eventPattern,
      targets: this.targets,
      stateMachine: this.stateMachine,
    } = this.createStateMachine(definition, props));
  }

  private getGlueJob(scope: Construct, id: string, props: GlueTransformStageProps): glue_alpha.IJob {
    if (props.jobName) {
      return glue_alpha.Job.fromJobAttributes(this, `${id} Job`, {
        jobName: props.jobName,
      });
    }

    if (!props.jobProps) {
      throw TypeError("'jobName' or 'jobProps' must be set to instantiate this stage");
    }

    return GlueFactory.job(scope, `${id} Job`, {
      ...props.jobProps,
    });
  }

  private getCrawler(props: GlueTransformStageProps): glue.CfnCrawler {
    const role = props.crawlerRole ?? props.crawlerProps?.role;
    if (!role) {
      throw TypeError("Crawler Role must be set either by 'crawlerRole' or 'crawlerProps.role");
    }

    const targets = props.targets ?? props.crawlerProps?.targets;
    if (!targets) {
      throw TypeError("Crawler Targets must be set either by 'targets' or 'crawlerProps.targets");
    }

    const crawler = new glue.CfnCrawler(this, "Crawler", {
      role: role,
      databaseName: props.databaseName,
      targets: targets,
      ...props.crawlerProps,
    });
    return crawler;
  }
}
