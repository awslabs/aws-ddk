import * as codecommit from "aws-cdk-lib/aws-codecommit";
import * as iam from "aws-cdk-lib/aws-iam";
import * as pipelines from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";
import { getCodeArtifactPublishPolicyStatements } from "./utils";

export interface GetSynthActionProps {
  readonly codePipelineSource?: pipelines.IFileSetProducer;
  readonly cdkVersion?: string;
  readonly partition?: string;
  readonly region?: string;
  readonly account?: string;
  readonly rolePolicyStatements?: iam.PolicyStatement[];
  readonly codeartifactRepository?: string;
  readonly codeartifactDomain?: string;
  readonly codeartifactDomainOwner?: string;
  readonly additionalInstallCommands?: string[];
}

export interface CodeCommitSourceActionProps {
  readonly repositoryName: string;
  readonly branch: string;
  readonly props?: pipelines.ConnectionSourceOptions;
}

export function getCodeCommitSourceAction(
  scope: Construct,
  props: CodeCommitSourceActionProps,
): pipelines.CodePipelineSource {
  return pipelines.CodePipelineSource.codeCommit(
    codecommit.Repository.fromRepositoryName(scope, props.repositoryName, props.repositoryName),
    props.branch,
    props.props,
  );
}

export function getSynthAction(props: GetSynthActionProps): pipelines.CodeBuildStep {
  var installCommands;
  installCommands = [`npm install -g aws-cdk@${props.cdkVersion ? props.cdkVersion : "latest"}`];

  // if (all([codeArtifactRepository, codeArtifactDomain, codeArtifactDomainOwner])) {
  //   if (!rolePolicyStatements) {
  //     rolePolicyStatements = _get_codeartifact_read_policy_statements(partition, region, account, codeArtifactDomain, codeArtifactRepository);
  //   }

  //   install_commands.psuh(`aws codeartifact login --tool pip --repository ${codeArtifactRepository} --domain ${codeArtifactDomain} --domain-owner ${codeArtifactDomainOwner}`);
  // }
  if (props.additionalInstallCommands != undefined && props.additionalInstallCommands.length > 0) {
    installCommands = installCommands.concat(props.additionalInstallCommands); // will need to be replaced with `npm install aws-ddk-core@${version}` when available
  }
  return new pipelines.CodeBuildStep("Synth", {
    input: props.codePipelineSource,
    installCommands: installCommands,
    commands: ["cdk synth"],
    rolePolicyStatements: props.rolePolicyStatements,
  });
}

export function getCfnNagAction(
  fileSetProducer: pipelines.IFileSetProducer,
  stageName: string = "CFNNag",
): pipelines.ShellStep {
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

  return new pipelines.ShellStep(stageName, {
    input: fileSetProducer,
    installCommands: ["gem install cfn-nag"],
    commands: [
      'fnames=$(find ./ -type f -name "*.template.json")',
      "for f in $fnames; do cfn_nag_scan --input-path $f; done",
    ],
  });
}

export function getBanditAction(
  codePipelineSource: pipelines.CodePipelineSource,
  stageName: string = "Bandit",
): pipelines.ShellStep {
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

  return new pipelines.ShellStep(stageName, {
    input: codePipelineSource,
    installCommands: ["pip install bandit"],
    commands: ["bandit -r -ll -ii ."],
  });
}

export function getTestsAction(
  fileSetProducer: pipelines.IFileSetProducer,
  commands: string[] = ["./test.sh"],
  installCommands: string[] = ["pip install -r requirements-dev.txt", "pip install -r requirements.txt"],
  stageName: string = "Tests",
) {
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

  return new pipelines.ShellStep(stageName, {
    input: fileSetProducer,
    installCommands: installCommands,
    commands: commands,
  });
}

export interface CodeArtifactPublishActionProps {
  readonly partition: string;
  readonly region: string;
  readonly account: string;
  readonly codeartifactRepository: string;
  readonly codeartifactDomain: string;
  readonly codeartifactDomainOwner: string;
  readonly codePipelineSource?: pipelines.CodePipelineSource;
  readonly rolePolicyStatements?: iam.PolicyStatement[];
}

export function getCodeArtifactPublishAction(
  partition: string,
  region: string,
  account: string,
  codeartifactRepository: string,
  codeartifactDomain: string,
  codeartifactDomainOwner: string,
  codePipelineSource?: pipelines.CodePipelineSource,
  rolePolicyStatements: iam.PolicyStatement[] = getCodeArtifactPublishPolicyStatements(
    partition,
    region,
    account,
    codeartifactDomain,
    codeartifactRepository,
  ),
): pipelines.CodeBuildStep {
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
    rolePolicyStatements ??
    getCodeArtifactPublishPolicyStatements(partition, region, account, codeartifactDomain, codeartifactRepository);

  return new pipelines.CodeBuildStep("BuildAndUploadArtifact", {
    input: codePipelineSource,
    buildEnvironment: {
      environmentVariables: {
        DOMAIN: {
          value: codeartifactDomain,
        },
        OWNER: {
          value: codeartifactDomainOwner,
        },
        REPOSITORY: {
          value: codeartifactRepository,
        },
      },
    },
    installCommands: [
      "pip install wheel twine",
      "pip install -U -r requirements.txt",
      "python setup.py bdist_wheel",
      "export VERSION=$(python setup.py --version)",
      "export PACKAGE=$(python setup.py --name)",
      "aws codeartifact login --tool twine --domain ${DOMAIN} --domain-owner ${OWNER} --repository ${REPOSITORY}",
    ],
    commands: ["twine upload --repository codeartifact dist/${PACKAGE}-${VERSION}-py3-none-any.whl"],
    rolePolicyStatements: rolePolicyStatements,
  });
}
