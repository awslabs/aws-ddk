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
  readonly env?: { ["string"]: string }
}

export interface CodeCommitSourceActionProps {
  readonly repositoryName: string;
  readonly branch: string;
  readonly props?: pipelines.ConnectionSourceOptions;
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

export class CICDActions {
  public static getCodeCommitSourceAction(
    scope: Construct,
    props: CodeCommitSourceActionProps,
  ): pipelines.CodePipelineSource {
    return pipelines.CodePipelineSource.codeCommit(
      codecommit.Repository.fromRepositoryName(scope, props.repositoryName, props.repositoryName),
      props.branch,
      props.props,
    );
  }

  public static getSynthAction(props: GetSynthActionProps): pipelines.CodeBuildStep {
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
      env: props.env
    });
  }

  public static getCfnNagAction(
    fileSetProducer: pipelines.IFileSetProducer,
    stageName: string = "CFNNag",
    failBuild?: boolean,
  ): pipelines.ShellStep {
    return new pipelines.ShellStep(stageName, {
      input: fileSetProducer,
      installCommands: ["gem install cfn-nag"],
      env: {
        FAIL_BUILD: failBuild ? "true" : "false",
      },
      commands: [
        'cfn_nag_scan --input-path ./ --template-pattern ".*.template.json" && scan_result="SUCCESS" || echo scan_result="FAILED"',
        'if [[ "$FAIL_BUILD" = "true" && "$scan_result" = "FAILED" ]]; then printf "\n\nFailing pipeline as possible insecure configurations were detected\n\n" && exit 1; fi',
      ],
    });
  }

  public static getBanditAction(
    codePipelineSource: pipelines.CodePipelineSource,
    stageName: string = "Bandit",
  ): pipelines.ShellStep {
    return new pipelines.ShellStep(stageName, {
      input: codePipelineSource,
      installCommands: ["pip install bandit"],
      commands: ["bandit -r -ll -ii ."],
    });
  }

  public static getTestsAction(
    fileSetProducer: pipelines.IFileSetProducer,
    commands: string[] = ["./test.sh"],
    installCommands: string[] = ["pip install -r requirements-dev.txt", "pip install -r requirements.txt"],
    stageName: string = "Tests",
  ) {
    return new pipelines.ShellStep(stageName, {
      input: fileSetProducer,
      installCommands: installCommands,
      commands: commands,
    });
  }

  public static getCodeArtifactPublishAction(
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
}
