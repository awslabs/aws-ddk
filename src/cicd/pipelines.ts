import * as cdk from "aws-cdk-lib";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import * as codestarnotifications from "aws-cdk-lib/aws-codestarnotifications";
import * as iam from "aws-cdk-lib/aws-iam";
import * as kms from "aws-cdk-lib/aws-kms";
import * as sns from "aws-cdk-lib/aws-sns";
import * as pipelines from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";
import { CICDActions } from "./actions";
import { toTitleCase } from "./utils";
import { BaseStack, BaseStackProps } from "../base";
import { Configurator } from "../config";

/**
 * Properties for the source action.
 */
export interface SourceActionProps {
  /**
   * Override source action.
   */
  readonly sourceAction?: pipelines.CodePipelineSource;
  /**
   * Name of the SCM repository.
   */
  readonly repositoryName: string;
  /**
   * Branch of the SCM repository.
   */
  readonly branch?: string;
}

/**
 * Properties for the synth action.
 */
export interface SynthActionProps {
  /**
   * CDK versio to use during the synth action.
   *
   * @default "latest"
   */
  readonly cdkVersion?: string;
  /**
   * Name of the CodeArtifact repository to pull artifacts from.
   */
  readonly codeartifactRepository?: string;
  /**
   *  Name of the CodeArtifact domain.
   */
  readonly codeartifactDomain?: string;
  /**
   * CodeArtifact domain owner account.
   */
  readonly codeartifactDomainOwner?: string;
  /**
   * Environment variables to set.
   */
  readonly env?: { [key: string]: any };
  /**
   * Additional policies to add to the synth action role.
   */
  readonly rolePolicyStatements?: iam.PolicyStatement[];
  /**
   *  Override synth action.
   */
  readonly synthAction?: pipelines.CodeBuildStep;
  /**
   * Additional install commands.
   */
  readonly additionalInstallCommands?: string[];
  /**
   * Additional command line arguements to append to the install command of the `cdk_langauge` that is specified.
   *
   * @default - No command line arguments are appended
   */
  readonly cdkLanguageCommandLineArguments?: { [key: string]: string };
}

/**
 * Properties for adding an application stage.
 */
export interface AddApplicationStageProps {
  /**
   * Identifier of the stage.
   */
  readonly stageId: string;
  /**
   * Application stage instance.
   */
  readonly stage: cdk.Stage;
  /**
   * Configure manual approvals.
   * @default false
   */
  readonly manualApprovals?: boolean;
}

/**
 * Properties for adding an application wave.
 */
export interface AddApplicationWaveProps {
  /**
   * Identifier of the wave.
   */
  readonly stageId: string;
  /**
   * Application stage instance.
   */
  readonly stages: cdk.Stage[];
  /**
   * Configure manual approvals.
   * @default false
   */
  readonly manualApprovals?: boolean;
}

/**
 * Properties for adding a security lint stage.
 */
export interface AddSecurityLintStageProps {
  /**
   * Name of the stage.
   */
  readonly stageName?: string;
  /**
   * Cloud assembly file set producer.
   */
  readonly cloudAssemblyFileSet?: pipelines.IFileSetProducer;
  /**
   * Fail Codepipeline Build Action on failed results from CfnNag scan.
   */
  readonly cfnNagFailBuild?: boolean;
}

/**
 * Properties for adding a test stage.
 */
export interface AddTestStageProps {
  /**
   * Name of the stage.
   */
  readonly stageName?: string;
  /**
   * Cloud assembly file set.
   */
  readonly cloudAssemblyFileSet?: pipelines.IFileSetProducer;
  /**
   * Additional commands to run in the test.
   * @default "./test.sh"
   */
  readonly commands?: string[];
}

/**
 * Properties for adding notifications.
 */
export interface AddNotificationsProps {
  /**
   * Override notification rule.
   */
  readonly notificationRule?: codestarnotifications.NotificationRule;
}

/**
 * Properties for adding a custom stage.
 */
export interface AddCustomStageProps {
  /**
   * Name of the stage.
   */
  readonly stageName: string;
  /**
   * Steps to add to this stage. List of Step objects.
   *
   * See [Documentation on aws_cdk.pipelines.Step](https://docs.aws.amazon.com/cdk/api/v1/python/aws_cdk.pipelines/Step.html)
   * for more detail.
   */
  readonly steps: pipelines.Step[];
}

/**
 * CICD Pipeline Stack properties.
 */
export interface CICDPipelineStackProps extends BaseStackProps {
  /**
   * Name of the pipeline.
   */
  readonly pipelineName?: string;
  /**
   * Language of the CDK construct definitions.
   *
   * @default "typescript"
   */
  readonly cdkLanguage?: string;
}

/**
 * Additional properties for building the CodePipeline.
 */
export interface AdditionalPipelineProps {
  /**
   * Additional customizations to apply to the asset publishing CodeBuild projects
   *
   * @default - Only `codeBuildDefaults` are applied
   */
  readonly assetPublishingCodeBuildDefaults?: pipelines.CodeBuildOptions;
  /**
   * CDK CLI version to use in self-mutation and asset publishing steps
   *
   * @default latest version
   */
  readonly cliVersion?: string;
  /**
   * Customize the CodeBuild projects created for this pipeline
   *
   * @default - All projects run non-privileged build, SMALL instance, LinuxBuildImage.STANDARD_6_0
   */
  readonly codeBuildDefaults?: pipelines.CodeBuildOptions;
  /**
   * An existing Pipeline to be reused and built upon.
   *
   * @default - a new underlying pipeline is created.
   */
  readonly codePipeline?: codepipeline.Pipeline;
  /**
   * A list of credentials used to authenticate to Docker registries.
   *
   * Specify any credentials necessary within the pipeline to build, synth, update, or publish assets.
   *
   * @default []
   */
  readonly dockerCredentials?: pipelines.DockerCredential[];
  /**
   * Enable Docker for the self-mutate step
   *
   * @default false
   */
  readonly dockerEnabledForSelfMutation?: boolean;
  /**
   * Enable Docker for the 'synth' step
   *
   * @default false
   */
  readonly dockerEnabledForSynth?: boolean;
  /**
   * Publish assets in multiple CodeBuild projects

   *
   * @default true
   */
  readonly publishAssetsInParallel?: boolean;
  /**
   * Reuse the same cross region support stack for all pipelines in the App.
   *
   * @default - true (Use the same support stack for all pipelines in App)
   */
  readonly reuseCrossRegionSupportStacks?: boolean;
  /**
   * Whether the pipeline will update itself
   *
   * This needs to be set to `true` to allow the pipeline to reconfigure
   * itself when assets or stages are being added to it, and `true` is the
   * recommended setting.
   *
   * You can temporarily set this to `false` while you are iterating
   * on the pipeline itself and prefer to deploy changes using `cdk deploy`.
   *
   * @default true
   */
  readonly selfMutation?: boolean;
  /**
   * Additional customizations to apply to the self mutation CodeBuild projects
   *
   * @default - Only `codeBuildDefaults` are applied
   */
  readonly selfMutationCodeBuildDefaults?: pipelines.CodeBuildOptions;
  /**
   * Additional customizations to apply to the synthesize CodeBuild projects
   *
   * @default - Only `codeBuildDefaults` are applied
   */
  readonly synthCodeBuildDefaults?: pipelines.CodeBuildOptions;
}

/**
 * Create a stack that contains DDK Continuous Integration and Delivery (CI/CD) pipeline.

  The pipeline is based on
  [CDK self-mutating pipeline](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.pipelines-readme.html)
  but includes several DDK-specific features, including:

  - Ability to configure some properties via JSON config e.g. manual approvals for application stages
  - Defaults for source/synth - CodeCommit & cdk synth, with ability to override them
  - Ability to connect to private artifactory to pull artifacts from at synth
  - Security best practices - ensures pipeline buckets block non-SSL, and are KMS-encrypted with rotated keys
  - Builder interface to avoid chunky constructor methods

  The user should be able to reuse the pipeline in multiple DDK applications hoping to save LOC.

  @example
  const stack = new CICDPipelineStack(app, "dummy-pipeline", { environmentId: "dev", pipelineName: "dummy-pipeline" })
    .addSourceAction({ repositoryName: "dummy-repository" })
    .addSynthAction()
    .buildPipeline()
    .add_checks()
    .addStage({ stageId: "dev", stage: devStage, manualApprovals: true })
    .synth()
    .add_notifications();
 */
export class CICDPipelineStack extends BaseStack {
  readonly environmentId?: string;
  readonly pipelineName?: string;
  readonly pipelineId?: string;
  readonly config: Configurator;
  readonly cdkLanguage: string;

  public notificationRule?: codestarnotifications.NotificationRule;
  public pipeline?: pipelines.CodePipeline;
  public pipelineKey?: kms.CfnKey;
  public sourceAction?: pipelines.CodePipelineSource;
  public synthAction?: pipelines.CodeBuildStep;

  /**
   * Creates a new CICD Pipeline stack.
   *
   * @param scope Parent of this stack, usually an `App` or a `Stage`, but could be any construct.
   * @param id The construct ID of this stack. If `stackName` is not explicitly
   * defined, this id (and any parent IDs) will be used to determine the
   * physical ID of the stack.
   * @param props Stack properties.
   */
  constructor(scope: Construct, id: string, props: CICDPipelineStackProps) {
    super(scope, id, props);

    this.environmentId = props.environmentId;
    this.pipelineName = props.pipelineName;
    this.pipelineId = id;

    const config = props.config ?? "./ddk.json";
    this.config = new Configurator(this, config, this.environmentId);

    this.cdkLanguage = props.cdkLanguage ?? "typescript";
  }

  /**
   * Add source action.
   *
   * @param props Source action properties.
   * @returns reference to this pipeline.
   */
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

  /**
   * Build the pipeline structure.
   * @param props Additional pipeline properties.
   * @returns reference to this pipeline.
   */
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

  /**
   * Add synth action. During synth can connect and pull artifacts from a private artifactory.
   * @param props Synth action properties.
   * @returns reference to this pipeline.
   */
  addSynthAction(props: SynthActionProps = {}) {
    const languageInstallCommands: any = {
      typescript: "npm install",
      python: "pip install -r requirements.txt",
    };

    let languageInstallCommand = languageInstallCommands[this.cdkLanguage];
    if (props.cdkLanguageCommandLineArguments) {
      for (const [argument, value] of Object.entries(props.cdkLanguageCommandLineArguments)) {
        languageInstallCommand += ` ${argument} ${value}`;
      }
    }

    this.synthAction =
      props.synthAction ||
      CICDActions.getSynthAction({
        codePipelineSource: this.sourceAction,
        cdkVersion: props.cdkVersion,
        partition: this.partition,
        region: this.region,
        account: this.account,
        env: props.env,
        rolePolicyStatements: props.rolePolicyStatements,
        codeartifactRepository: props.codeartifactRepository,
        codeartifactDomain: props.codeartifactDomain,
        codeartifactDomainOwner: props.codeartifactDomainOwner,
        additionalInstallCommands: props.additionalInstallCommands
          ? [languageInstallCommand].concat(props.additionalInstallCommands)
          : [languageInstallCommand],
      });
    return this;
  }

  /**
   * Add application stage to the CICD pipeline. This stage deploys your application infrastructure.
   * @param props Application stage properties.
   * @returns reference to this pipeline.
   */
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

  /**
   * Add multiple application stages in parallel to the CICD pipeline.
   * @param props Application wave properties.
   * @returns reference to this pipeline.
   */
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

  /**
   * Add linting - cfn-nag, and bandit.
   * @param props Security lint properties.
   * @returns reference to this pipeline.
   */
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
      post: [
        CICDActions.getCfnNagAction(cloudAssemblyFileSet, "CFNNag", props.cfnNagFailBuild),
        CICDActions.getBanditAction(this.sourceAction),
      ],
    });

    return this;
  }

  /**
   * Add test - e.g. pytest.
   * @param props Test stage properties.
   * @returns reference to this pipeline.
   */
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

  /**
   * Add pipeline notifications.
   * Create notification rule that sends events to the specified SNS topic.
   * @param props Notification properties.
   * @returns reference to this pipeline.
   */
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

  /**
   * Add checks to the pipeline (e.g. linting, security, tests...).
   * @returns reference to this pipeline.
   */
  addChecks() {
    this.addSecurityLintStage({});
    this.addTestStage({});
    return this;
  }

  /**
   * Add custom stage to the pipeline.
   * @param props Properties for adding a custom stage.
   * @returns reference to this pipeline.
   */
  addCustomStage(props: AddCustomStageProps) {
    this.pipeline?.addWave(props.stageName, {
      post: props.steps,
    });

    return this;
  }

  /**
   * Synthesize the pipeline.
   * @returns reference to this pipeline.
   */
  synth() {
    this.pipeline?.buildPipeline();
    this.pipelineKey = this.pipeline?.pipeline.artifactBucket.encryptionKey?.node.defaultChild as kms.CfnKey;
    this.pipelineKey.addPropertyOverride("EnableKeyRotation", true);

    return this;
  }
}
