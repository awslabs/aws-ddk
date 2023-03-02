import * as cdk from "aws-cdk-lib";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import * as codestarnotifications from "aws-cdk-lib/aws-codestarnotifications";
import * as iam from "aws-cdk-lib/aws-iam";
import * as sns from "aws-cdk-lib/aws-sns";
import * as pipelines from "aws-cdk-lib/pipelines";
import { Construct, IConstruct } from "constructs";
import { CICDActions } from "./actions";
import { toTitleCase } from "./utils";
import { BaseStack } from "../base";
import { Configurator } from "../config";

export interface SourceActionProps {
  readonly sourceAction?: pipelines.CodePipelineSource;
  readonly repositoryName: string;
  readonly branch?: string;
}

export interface SynthActionProps {
  readonly cdkVersion?: string;
  readonly codeartifactRepository?: string;
  readonly codeartifactDomain?: string;
  readonly codeartifactDomainOwner?: string;
  readonly rolePolicyStatements?: iam.PolicyStatement[];
  readonly synthAction?: pipelines.CodeBuildStep;
  readonly additionalInstallCommands?: string[];
}

export interface AddApplicationStageProps {
  readonly stageId: string;
  readonly stage: cdk.Stage;
  readonly manualApprovals?: boolean;
}

export interface AddApplicationWaveProps {
  readonly stageId: string;
  readonly stages: cdk.Stage[];
  readonly manualApprovals?: boolean;
}

export interface AddSecurityLintStageProps {
  readonly stageName?: string;
  readonly cloudAssemblyFileSet?: pipelines.IFileSetProducer;
}

export interface AddTestStageProps {
  readonly stageName?: string;
  readonly cloudAssemblyFileSet?: pipelines.IFileSetProducer;
  readonly commands?: string[];
}

export interface AddNotificationsProps {
  readonly notificationRule?: codestarnotifications.NotificationRule;
}

export interface AddCustomStageProps {
  readonly stageName: string;
  readonly steps: pipelines.Step[];
}

export interface CICDPipelineStackProps extends cdk.StackProps {
  readonly environmentId?: string;
  readonly pipelineName?: string;
  readonly configPath?: string;
  readonly config?: object;
}

export interface AdditionalPipelineProps {
  readonly assetPublishingCodeBuildDefaults?: pipelines.CodeBuildOptions;
  readonly cliVersion?: string;
  readonly codeBuildDefaults?: pipelines.CodeBuildOptions;
  readonly codePipeline?: codepipeline.Pipeline;
  readonly dockerCredentials?: pipelines.DockerCredential[];
  readonly dockerEnabledForSelfMutation?: boolean;
  readonly dockerEnabledForSynth?: boolean;
  readonly publishAssetsInParallel?: boolean;
  readonly reuseCrossRegionSupportStacks?: boolean;
  readonly selfMutation?: boolean;
  readonly selfMutationCodeBuildDefaults?: pipelines.CodeBuildOptions;
  readonly synthCodeBuildDefaults?: pipelines.CodeBuildOptions;
}

export class CICDPipelineStack extends BaseStack {
  readonly environmentId?: string;
  readonly pipelineName?: string;
  readonly pipelineId?: string;
  readonly config: Configurator;
  public notificationRule?: codestarnotifications.NotificationRule;
  public pipeline?: pipelines.CodePipeline;
  public pipelineKey?: IConstruct;
  public sourceAction?: pipelines.CodePipelineSource;
  public synthAction?: pipelines.CodeBuildStep;

  constructor(scope: Construct, id: string, props: CICDPipelineStackProps) {
    super(scope, id, props);

    this.environmentId = props.environmentId;
    this.pipelineName = props.pipelineName;
    this.pipelineId = id;
    const config = props.configPath ?? props.config ?? "./ddk.json";
    this.config = new Configurator(this, config, this.environmentId);
  }

  addSourceAction(props: SourceActionProps) {
    var branch = props.branch ?? "main";
    this.sourceAction =
      props.sourceAction ||
      CICDActions.getCodeCommitSourceAction(this, {
        repositoryName: props.repositoryName,
        branch: branch,
      });
    return this;
  }

  buildPipeline(props: AdditionalPipelineProps = {}) {
    if (this.synthAction === undefined) {
      throw new Error("Pipeline cannot be built without a synth action.");
    }
    this.pipeline = new pipelines.CodePipeline(this, "DDKCodePipeline", {
      synth: this.synthAction,
      crossAccountKeys: true,
      pipelineName: this.pipelineName,
      ...props,
    });
    return this;
  }

  addSynthAction(props: SynthActionProps = {}) {
    this.synthAction =
      props.synthAction ||
      CICDActions.getSynthAction({
        codePipelineSource: this.sourceAction,
        cdkVersion: props.cdkVersion,
        partition: this.partition,
        region: this.region,
        account: this.account,
        rolePolicyStatements: props.rolePolicyStatements,
        codeartifactRepository: props.codeartifactRepository,
        codeartifactDomain: props.codeartifactDomain,
        codeartifactDomainOwner: props.codeartifactDomainOwner,
        additionalInstallCommands: props.additionalInstallCommands,
      });
    return this;
  }

  addStage(props: AddApplicationStageProps) {
    if (this.pipeline === undefined) {
      throw new Error("`.buildPipeline()` needs to be called first before adding application stages to the pipeline.");
    }
    const manualApprovals = props.manualApprovals ?? this.config.getConfigAttribute("manual_approvals") ?? false;

    if (manualApprovals) {
      this.pipeline?.addStage(props.stage, {
        pre: [new pipelines.ManualApprovalStep("PromoteTo" + toTitleCase(props.stageId))],
      });
    } else {
      this.pipeline?.addStage(props.stage, {});
    }

    return this;
  }

  addWave(props: AddApplicationWaveProps) {
    if (this.pipeline === undefined) {
      throw new Error("`.buildPipeline()` needs to be called first before adding application stages to the pipeline.");
    }
    const manualApprovals = props.manualApprovals ?? this.config.getConfigAttribute("manual_approvals") ?? false;

    var wave = new pipelines.Wave(props.stageId);
    if (manualApprovals) {
      wave.addPre(new pipelines.ManualApprovalStep("PromoteTo" + toTitleCase(props.stageId)));
    }

    props.stages.forEach((stage) => {
      wave.addStage(stage);
    });

    this.pipeline?.addWave(props.stageId, wave);
    return this;
  }

  addSecurityLintStage(props: AddSecurityLintStageProps) {
    if (this.sourceAction === undefined) {
      throw new Error("Source Action Must Be configured before calling this method.");
    }
    if (this.pipeline?.cloudAssemblyFileSet === undefined) {
      throw new Error("No cloudAssemblyFileSet configured, source action needs to be configured for this pipeline.");
    }

    var stageName = props.stageName ?? "SecurityLint";
    var cloudAssemblyFileSet = props.cloudAssemblyFileSet ?? this.pipeline?.cloudAssemblyFileSet;

    this.pipeline?.addWave(stageName, {
      post: [CICDActions.getCfnNagAction(cloudAssemblyFileSet), CICDActions.getBanditAction(this.sourceAction)],
    });

    return this;
  }

  addTestStage(props: AddTestStageProps) {
    var stageName = props.stageName ?? "Tests";
    var cloudAssemblyFileSet = props.cloudAssemblyFileSet ?? this.pipeline?.cloudAssemblyFileSet;
    var commands = props.commands ?? ["./test.sh"];

    if (cloudAssemblyFileSet === undefined) {
      throw new Error("No cloudAssemblyFileSet configured, source action needs to be configured for this pipeline.");
    }

    this.pipeline?.addWave(stageName || "Tests", {
      post: [CICDActions.getTestsAction(cloudAssemblyFileSet, commands)],
    });

    return this;
  }

  addNotifications(props: AddNotificationsProps = {}) {
    if (this.pipeline === undefined) {
      throw new Error("`.buildPipeline()` needs to be called first before adding notifications to the pipeline.");
    }

    const topic =
      this.environmentId && this.config.getConfigAttribute("notifications_topic_arn")
        ? sns.Topic.fromTopicArn(
            this,
            "ExecutionFailedNotifications",
            this.config.getConfigAttribute("notifications_topic_arn"),
          )
        : new sns.Topic(this, "ExecutionFailedNotifications");
    this.notificationRule =
      props.notificationRule ??
      new codestarnotifications.NotificationRule(this, "Notification", {
        detailType: codestarnotifications.DetailType.BASIC,
        events: ["codepipeline-pipeline-pipeline-execution-failed"],
        source: this.pipeline?.pipeline,
        targets: [topic],
      });
    return this;
  }

  addChecks() {
    this.addSecurityLintStage({});
    this.addTestStage({});
    return this;
  }

  addCustomStage(props: AddCustomStageProps) {
    this.pipeline?.addWave(props.stageName, {
      post: props.steps,
    });

    return this;
  }

  synth() {
    this.pipeline?.buildPipeline();
    this.pipelineKey = this.pipeline?.pipeline.artifactBucket.encryptionKey?.node.defaultChild ?? undefined;

    // if (this.pipelineKey) {
    //   this.pipelineKey = true;
    // }
    return this;
  }
}
