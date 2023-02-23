import * as cdk from "aws-cdk-lib";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import * as codestarnotifications from "aws-cdk-lib/aws-codestarnotifications";
import * as iam from "aws-cdk-lib/aws-iam";
import * as sns from "aws-cdk-lib/aws-sns";
import * as pipelines from "aws-cdk-lib/pipelines";
import { Construct, IConstruct } from "constructs";
import { getBanditAction, getCfnNagAction, getCodeCommitSourceAction, getSynthAction, getTestsAction } from "./actions";
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
    const config = props.configPath ? props.configPath : props.config ? props.config : "./ddk.json";
    this.config = new Configurator(this, config, this.environmentId);
  }

  addSourceAction(props: SourceActionProps) {
    var branch = props.branch ?? "main";
    this.sourceAction =
      props.sourceAction ||
      getCodeCommitSourceAction(this, {
        repositoryName: props.repositoryName,
        branch: branch,
      });
    return this;
  }

  buildPipeline(props: AdditionalPipelineProps = {}) {
    /*
    Build the pipeline structure.
     Returns
    -------
    pipeline : CICDPipelineStack
    CICDPipelineStack
    */

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
      getSynthAction({
        codePipelineSource: this.sourceAction,
        cdkVersion: props.cdkVersion, // replace with config later on
        partition: this.partition,
        region: this.region,
        account: this.account,
        rolePolicyStatements: props.rolePolicyStatements,
        codeartifactRepository: props.codeartifactRepository, // || this._artifactory_config.get('repository'),
        codeartifactDomain: props.codeartifactDomain, // || this._artifactory_config.get('domain'),
        codeartifactDomainOwner: props.codeartifactDomainOwner, //|| this._artifactory_config.get('domain_owner')
        additionalInstallCommands: props.additionalInstallCommands,
      });
    return this;
  }

  addStage(props: AddApplicationStageProps) {
    /*
    Add application stage to the CICD pipeline. This stage deploys your application infrastructure.
      Parameters
    ----------
    stageId: str
    Identifier of the stage
    stage: Stage
    Application stage instance
    manualApprovals: Optional[bool]
    Configure manual approvals. False by default
      Returns
    -------
    pipeline : CICDPipelineStack
    CICDPipelineStack
    */
    if (this.pipeline === undefined) {
      throw new Error("`.buildPipeline()` needs to be called first before adding application stages to the pipeline.");
    }
    const manualApprovals = props.manualApprovals
      ? props.manualApprovals
      : this.environmentId
      ? this.config.getEnvConfig("manual_approvals")
      : false;

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
    /*
    Add multiple application stages in parallel to the CICD pipeline. This stage deploys your application infrastructure.
      Parameters
    ----------
    stageId: str
    Identifier of the wave
    stages: Stage[]
    Application stage instance
    manualApprovals: Optional[bool]
    Configure manual approvals. False by default
      Returns
    -------
    pipeline : CICDPipelineStack
    CICDPipelineStack
    */
    if (this.pipeline === undefined) {
      throw new Error("`.buildPipeline()` needs to be called first before adding application stages to the pipeline.");
    }
    const manualApprovals = props.manualApprovals
      ? props.manualApprovals
      : this.environmentId
      ? this.config.getEnvConfig("manual_approvals")
      : false;

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
    /*
    Add linting - cfn-nag, and bandit.
      Parameters
    ----------
    stage_name: Optional[str]
    Name of the stage
    cloudAssemblyFileSet: Optional[IFileSetProducer]
    Cloud assembly file set producer
      Returns
    -------
    pipeline : CICDPipeline
    CICD pipeline
    */

    if (this.sourceAction === undefined) {
      throw new Error("Source Action Must Be configured before calling this method.");
    }
    if (this.pipeline?.cloudAssemblyFileSet === undefined) {
      throw new Error("No cloudAssemblyFileSet configured, source action needs to be configured for this pipeline.");
    }

    var stageName = props.stageName ?? "SecurityLint";
    var cloudAssemblyFileSet = props.cloudAssemblyFileSet ?? this.pipeline?.cloudAssemblyFileSet;

    this.pipeline?.addWave(stageName, {
      post: [getCfnNagAction(cloudAssemblyFileSet), getBanditAction(this.sourceAction)],
    });

    return this;
  }

  addTestStage(props: AddTestStageProps) {
    /*
    Add test - e.g. pytest.
      Parameters
    ----------
    stage_name: Optional[str]
    Name of the stage
    cloudAssemblyFileSet: Optional[IFileSetProducer]
    Cloud assembly file set
    commands: Optional[List[str]]
    Additional commands to run in the test. Defaults to './test.sh' otherwise
      Returns
    -------
    pipeline : CICDPipelineStack
    CICD pipeline
    */
    var stageName = props.stageName ?? "Tests";
    var cloudAssemblyFileSet = props.cloudAssemblyFileSet ?? this.pipeline?.cloudAssemblyFileSet;
    var commands = props.commands ?? ["./test.sh"];

    if (cloudAssemblyFileSet === undefined) {
      throw new Error("No cloudAssemblyFileSet configured, source action needs to be configured for this pipeline.");
    }

    this.pipeline?.addWave(stageName || "Tests", {
      post: [getTestsAction(cloudAssemblyFileSet, commands)],
    });

    return this;
  }

  addNotifications(props: AddNotificationsProps = {}) {
    /*
    Add pipeline notifications. Create notification rule that sends events to the specified SNS topic.
      Parameters
    ----------
    notificationRule: Optional[NotificationRule]
    Override notification rule
      Returns
    -------
    pipeline : CICDPipeline
    CICD pipeline
    */
    if (this.pipeline === undefined) {
      throw new Error("`.buildPipeline()` needs to be called first before adding notifications to the pipeline.");
    }

    const topic = this.environmentId
      ? this.config.getEnvConfig("notifications_topic_arn")
        ? sns.Topic.fromTopicArn(
            this,
            "ExecutionFailedNotifications",
            this.config.getEnvConfig("notifications_topic_arn"),
          )
        : new sns.Topic(this, "ExecutionFailedNotifications")
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
    /*
    Add checks to the pipeline (e.g. linting, security, tests...).
      Returns
    -------
    pipeline : CICDPipelineStack
    CICD pipeline
    */
    this.addSecurityLintStage({});
    this.addTestStage({});
    return this;
  }

  addCustomStage(props: AddCustomStageProps) {
    /*
    Add custom stage to the pipeline.
      Parameters
    ----------
    stageName: str
    Name of the stage
    steps: List[Step]
    Steps to add to this stage. List of Step().
    See `Documentation on aws-cdk.pipelines.Step`
    <https://docs.aws.amazon.com/cdk/api/v1/python/aws-cdk.pipelines/Step.html>`_ for more detail.
      Returns
    -------
    pipeline : CICDPipeline
    CICD pipeline
    */
    this.pipeline?.addWave(props.stageName, {
      post: props.steps,
    });

    return this;
  }

  synth() {
    /*
    Synthesize the pipeline.
     It is not possible to modify the pipeline after calling this method.
     Returns
    -------
    pipeline : CICDPipelineStack
    CICDPipelineStack
    */
    this.pipeline?.buildPipeline();

    // this.pipelineKey = this.pipeline.pipeline.artifactBucket.encryptionKey.node.defaultChild || null;
    // this.pipelineKey.enableKeyRotation = true;
    return this;
  }
}
