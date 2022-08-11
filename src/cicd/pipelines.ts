import { Stack, StackProps, Stage } from 'aws-cdk-lib';
import {
  DetailType,
  NotificationRule,
} from 'aws-cdk-lib/aws-codestarnotifications';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Topic } from 'aws-cdk-lib/aws-sns';
import {
  CodeBuildStep,
  CodePipeline,
  CodePipelineSource,
  IFileSetProducer,
  ManualApprovalStep,
  Step,
} from 'aws-cdk-lib/pipelines';
import { Construct, IConstruct } from 'constructs';
import {
  getBanditAction,
  getCfnNagAction,
  getCodeCommitSourceAction,
  getSynthAction,
  getTestsAction,
} from './actions';
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
}

export interface AddStageProps {
  readonly stageId: string;
  readonly stage: Stage;
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
    props?: StackProps,
  ) {
    super(scope, id, props);

    this.environmentId = environmentId;
    this.pipelineName = pipelineName;
    this.pipelineId = id;
  }

  addSourceAction(props: SourceActionProps) {
    var branch = props.branch ?? 'main';
    this.sourceAction =
      props.sourceAction ||
      getCodeCommitSourceAction({
        scope: this,
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
    this.pipeline = new CodePipeline(this, 'DDKCodePipeline', {
      synth: this.synthAction!,
      crossAccountKeys: true,
      pipelineName: this.pipelineName,
      //cliVersion: Handle when Config() is decided on
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
      });
    return this;
  }

  addStage(props: AddStageProps) {
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

    var stageName = props.stageName ?? 'SecurityLint';
    var cloudAssemblyFileSet =
      props.cloudAssemblyFileSet ?? this.pipeline?.cloudAssemblyFileSet;

    this.pipeline?.addWave(stageName, {
      post: [
        getCfnNagAction({
          fileSetProducer: cloudAssemblyFileSet!,
        }),
        getBanditAction({
          codePipelineSource: this.sourceAction!,
        }),
      ],
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
    var cloudAssemblyFileSet =
      props.cloudAssemblyFileSet ?? this.pipeline?.cloudAssemblyFileSet;
    var commands = props.commands ?? ['./test.sh'];

    this.pipeline?.addWave(stageName || 'Tests', {
      post: [
        getTestsAction({
          fileSetProducer: cloudAssemblyFileSet!,
          commands: commands,
        }),
      ],
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

    this.notificationRule =
      props.notificationRule ??
      new NotificationRule(this, 'notification', {
        detailType: DetailType.BASIC,
        events: ['codepipeline-pipeline-pipeline-execution-failed'],
        source: this.pipeline?.pipeline!,
        targets: [
          new Topic(
            this,
            `${this.pipelineName}-${this.environmentId}-notifications`,
            {
              topicName: `${this.pipelineName}-${this.environmentId}-notifications`,
            },
          ),
        ], // Implement config defined topic later on
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
