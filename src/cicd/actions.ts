import { Repository } from 'aws-cdk-lib/aws-codecommit';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import {
  CodeBuildStep,
  CodePipelineSource,
  ConnectionSourceOptions,
  IFileSetProducer,
  ShellStep,
} from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { getCodeartifactPublishPolicyStatements } from './utils';

export interface GetSynthActionProps {
  readonly codePipelineSource?: IFileSetProducer;
  readonly cdkVersion?: string;
  readonly partition?: string;
  readonly region?: string;
  readonly account?: string;
  readonly rolePolicyStatements?: PolicyStatement[];
  readonly codeartifactRepository?: string;
  readonly codeartifactDomain?: string;
  readonly codeartifactDomainOwner?: string;
}

export interface CodeCommitSourceActionProps {
  readonly scope: Construct;
  readonly repositoryName: string;
  readonly branch: string;
  readonly props?: ConnectionSourceOptions;
}

export function getCodeCommitSourceAction(props: CodeCommitSourceActionProps) {
  return CodePipelineSource.codeCommit(
    Repository.fromRepositoryName(
      props.scope,
      props.repositoryName,
      props.repositoryName,
    ),
    props.branch,
    props.props,
  );
}

export function getSynthAction(props: GetSynthActionProps) {
  var installCommands;
  installCommands = [
    `npm install -g aws-cdk@${props.cdkVersion ? props.cdkVersion : ''}`,
  ];

  // if (all([codeArtifactRepository, codeArtifactDomain, codeArtifactDomainOwner])) {
  //   if (!rolePolicyStatements) {
  //     rolePolicyStatements = _get_codeartifact_read_policy_statements(partition, region, account, codeArtifactDomain, codeArtifactRepository);
  //   }

  //   install_commands.psuh(`aws codeartifact login --tool pip --repository ${codeArtifactRepository} --domain ${codeArtifactDomain} --domain-owner ${codeArtifactDomainOwner}`);
  // }

  installCommands.push('pip install -r requirements.txt');
  return new CodeBuildStep('Synth', {
    input: props.codePipelineSource,
    installCommands: installCommands,
    commands: ['cdk synth'],
    rolePolicyStatements: props.rolePolicyStatements,
  });
}

export interface CfnNagActionProps {
  readonly fileSetProducer: IFileSetProducer;
  readonly stageName?: string;
}

export function getCfnNagAction(props: CfnNagActionProps) {
  /*
  Get CFN Nag action.
   Parameters
  ----------
  fileSetProducer: Optional[IFileSetProducer]
  File set to run security scan on
  stageName: Optional[str]
  Name for stage. Default is 'CFNNag'
   Returns
  -------
  action : ShellStep
  Codebuild step
  */

  var stageName = props.stageName ?? 'CFNNag';

  return new ShellStep(stageName, {
    input: props.fileSetProducer,
    installCommands: ['gem install cfn-nag'],
    commands: [
      "fnames=$(find ./ -type f -name '*.template.json')",
      'for f in $fnames; do cfn_nag_scan --input-path $f; done',
    ],
  });
}

export interface BanditActionProps {
  readonly codePipelineSource: CodePipelineSource;
  readonly stageName?: string;
}

export function getBanditAction(props: BanditActionProps) {
  /*
  Get Bandit action.
   Parameters
  ----------
  codePipelineSource: CodePipelineSource
  Code Pipeline source stage
  stageName: Optional[str]
  Name for stage. Default is 'Bandit'
   Returns
  -------
  action : CodeBuildStep
  Synth action
  */

  var stageName = props.stageName ?? 'Bandit';

  return new ShellStep(stageName, {
    input: props.codePipelineSource,
    installCommands: ['pip install bandit'],
    commands: ['bandit -r -ll -ii .'],
  });
}

export interface TestsActionProps {
  readonly fileSetProducer: IFileSetProducer;
  readonly commands?: string[];
  readonly installCommands?: string[];
  readonly stageName?: string;
}

export function getTestsAction(props: TestsActionProps) {
  /*
  Return shell script action that runs tests.
   Parameters
  ----------
  scope : Construct
  Scope within which this construct is defined
  fileSetProducer: [IFileSetProducer]
  File set to run tests on
  commands: Optional[List[str]]
  Additional commands to run in the test. Defaults to './test.sh' otherwise
  installCommands: Optional[List[str]]
  Override install commands. Default is: `'pip install -r requirements-dev.txt', 'pip install -r requirements.txt'`
  stageName: Optional[str]
  Name for stage. Default is 'Tests'
   Returns
  -------
  action : ShellStep
  Test action
  */
  var installCommands = props.installCommands ?? [
    'pip install -r requirements-dev.txt',
    'pip install -r requirements.txt',
  ];
  var commands = props.commands ?? ['./test.sh'];
  var stageName = props.stageName ?? 'Tests';
  return new ShellStep(stageName, {
    input: props.fileSetProducer,
    installCommands: installCommands,
    commands: commands,
  });
}

export interface CodeartifactPublishActionProps {
  readonly partition: string;
  readonly region: string;
  readonly account: string;
  readonly codeartifactRepository: string;
  readonly codeartifactDomain: string;
  readonly codeartifactDomainOwner: string;
  readonly codePipelineSource?: CodePipelineSource;
  readonly rolePolicyStatements?: PolicyStatement[];
}

export function getCodeartifactPublishAction(
  props: CodeartifactPublishActionProps,
) {
  /*
  Get CodeArtifact upload action. This action builds Python wheel, and uploads it to CodeArtifact repository.
   Parameters
  ----------
  partition: str
  AWS partition
  region: str
  AWS region name
  account: str
  AWS account
  codeartifactRepository: str
  Name of the CodeArtifact repository to upload to
  codeartifactDomain: str
  Name of the CodeArtifact domain
  codeartifactDomainOwner: str
  CodeArtifact domain owner account
  codePipelineSource: Optional[CodePipelineSource]
  Code Pipeline source stage
  rolePolicyStatements: Optional[List[PolicyStatement]]
  Additional policies to add to the upload action role
   Returns
  -------
  action : CodeBuildStep
  Upload action
  */
  var rolePolicyStatements =
    props.rolePolicyStatements ??
    getCodeartifactPublishPolicyStatements({
      partition: props.partition,
      region: props.region,
      account: props.account,
      domain: props.codeartifactDomain,
      repository: props.codeartifactRepository,
    });

  return new CodeBuildStep('BuildAndUploadArtifact', {
    input: props.codePipelineSource,
    buildEnvironment: {
      environmentVariables: {
        DOMAIN: {
          value: props.codeartifactDomain,
        },
        OWNER: {
          value: props.codeartifactDomainOwner,
        },
        REPOSITORY: {
          value: props.codeartifactRepository,
        },
      },
    },
    installCommands: [
      'pip install wheel twine',
      'pip install -U -r requirements.txt',
      'python setup.py bdist_wheel',
      'export VERSION=$(python setup.py --version)',
      'export PACKAGE=$(python setup.py --name)',
      'aws codeartifact login --tool twine --domain ${DOMAIN} --domain-owner ${OWNER} --repository ${REPOSITORY}',
    ],
    commands: [
      'twine upload --repository codeartifact dist/${PACKAGE}-${VERSION}-py3-none-any.whl',
    ],
    rolePolicyStatements: rolePolicyStatements,
  });
}
