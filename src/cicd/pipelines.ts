import { Stack, StackProps, Stage } from 'aws-cdk-lib';
import { DetailType, NotificationRule } from 'aws-cdk-lib/aws-codestarnotifications';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Topic } from 'aws-cdk-lib/aws-sns';
import {
  CodeBuildStep,
  CodePipeline,
  CodePipelineProps,
  CodePipelineSource,
  IFileSetProducer,
  ManualApprovalStep,
  Step,
  Wave,
} from 'aws-cdk-lib/pipelines';
import { Construct, IConstruct } from 'constructs';
import { getBanditAction, getCfnNagAction, getCodeCommitSourceAction, getSynthAction, getTestsAction } from './actions';
import { toTitleCase } from './utils';

export interface SourceActionProps {
  readonly sourceAction?: CodePipelineSource;
  readonly repositoryName: string;
  readonly branch?: string;
}

export interface SynthActionProps {
  readonly cdkVersion?: string;
  readonly codeartifactRepository?: string;
  readonly codeartifactDomain?: string;
  readonly codeartifactDomainOwner?: string;
  readonly rolePolicyStatements?: PolicyStatement[];
  readonly synthAction?: CodeBuildStep;
  readonly additionalInstallCommands?: string[];
}

export interface AddApplicationStageProps {
  readonly stageId: string;
  readonly stage: Stage;
  readonly manualApprovals?: boolean;
}

export interface AddApplicationWaveProps {
  readonly stageId: string;
  readonly stages: Stage;
  readonly manualApprovals?: boolean;
}

export interface AddSecurityLintStageProps {
  readonly stageName?: string;
  readonly cloudAssemblyFileSet?: IFileSetProducer;
}

export interface AddTestStageProps {
  readonly stageName?: string;
  readonly cloudAssemblyFileSet?: IFileSetProducer;
  readonly commands?: string[];
}

export interface AddNotificationsProps {
  readonly notificationRule?: NotificationRule;
}

export interface AddCustomStageProps {
  readonly stageName: string;
  readonly steps: Step[];
}

export class CICDPipelineStack extends Stack {
  readonly environmentId?: string;
  readonly pipelineName?: string;
  readonly pipelineId?: string;
  readonly pipelineProps?: CodePipelineProps;
  public notificationRule?: NotificationRule;
  public pipeline?: CodePipeline;
  public pipelineKey?: IConstruct;
  public sourceAction?: CodePipelineSource;
  public synthAction?: CodeBuildStep;

  constructor(
    scope: Construct,
    id: string,
    environmentId: string,
    pipelineName: string,
    pipelineProps: CodePipelineProps,
    props?: StackProps,
  ) {
    super(scope, id, props);

    this.environmentId = environmentId;
    this.pipelineName = pipelineName;
    this.pipelineId = id;
    this.pipelineProps = pipelineProps;
  }

  addSourceAction(props: SourceActionProps) {
    var branch = props.branch ?? 'main';
    this.sourceAction =
      props.sourceAction ||
      getCodeCommitSourceAction(this, {
        repositoryName: props.repositoryName,
        branch: branch,
      });
    return this;
  }

  buildPipeline() {
    /*
    Build the pipeline structure.
     Returns
    -------
    pipeline : CICDPipelineStack
    CICDPipelineStack
    */

    if (this.synthAction === undefined) {
      throw new Error('Pipeline cannot be built without a synth action.');
    }
    this.pipeline = new CodePipeline(this, 'DDKCodePipeline', {
      synth: this.synthAction,
      crossAccountKeys: true,
      pipelineName: this.pipelineName,
      //this.pipelineProps,
    });
    return this;
  }

  addSynthAction(props: SynthActionProps) {
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
      throw new Error('`.buildPipeline()` needs to be called first before adding application stages to the pipeline.');
    }
    var manualApprovals = props.manualApprovals ?? false; // || this._config.get_env_config(stage_id).get('manual_approvals');

    if (manualApprovals) {
      this.pipeline?.addStage(props.stage, {
        pre: [new ManualApprovalStep('PromoteTo' + toTitleCase(props.stageId))],
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
      throw new Error('`.buildPipeline()` needs to be called first before adding application stages to the pipeline.');
    }
    var manualApprovals = props.manualApprovals ?? false; // || this._config.get_env_config(stage_id).get('manual_approvals');

    var wave = new Wave(props.stageId);
    if (manualApprovals) {
      wave.addPre(new ManualApprovalStep('PromoteTo' + toTitleCase(props.stageId)));
    }

    Object.entries(props.stages).forEach(([_, value]) => {
      wave.addStage(value);
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
      throw new Error('Source Action Must Be configured before calling this method.');
    }
    if (this.pipeline?.cloudAssemblyFileSet === undefined) {
      throw new Error('No cloudAssemblyFileSet configured, source action needs to be configured for this pipeline.');
    }

    var stageName = props.stageName ?? 'SecurityLint';
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
    var stageName = props.stageName ?? 'Tests';
    var cloudAssemblyFileSet = props.cloudAssemblyFileSet ?? this.pipeline?.cloudAssemblyFileSet;
    var commands = props.commands ?? ['./test.sh'];

    if (cloudAssemblyFileSet === undefined) {
      throw new Error('No cloudAssemblyFileSet configured, source action needs to be configured for this pipeline.');
    }

    this.pipeline?.addWave(stageName || 'Tests', {
      post: [getTestsAction(cloudAssemblyFileSet, commands)],
    });

    return this;
  }

  addNotifications(props: AddNotificationsProps) {
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
      throw new Error('`.buildPipeline()` needs to be called first before adding application stages to the pipeline.');
    }

    this.notificationRule =
      props.notificationRule ??
      new NotificationRule(this, 'Notification', {
        detailType: DetailType.BASIC,
        events: ['codepipeline-pipeline-pipeline-execution-failed'],
        source: this.pipeline?.pipeline,
        targets: [new Topic(this, 'ExecutionFailedNotifications')], // Implement config defined topic later on
      });
    return this;
  }

  // addChecks() {
  //   /*
  //   Add checks to the pipeline (e.g. linting, security, tests...).
  //     Returns
  //   -------
  //   pipeline : CICDPipelineStack
  //   CICD pipeline
  //   */
  //   if (this._config.get_env_config(this.environment_id).get('execute_security_lint')) {
  //     this.add_security_lint_stage();
  //   }

  //   if (this._config.get_env_config(this.environment_id).get('execute_tests')) {
  //     this.add_test_stage();
  //   }

  //   return this;
  // }

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
