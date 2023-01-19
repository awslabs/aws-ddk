const { awscdk, javascript, DependencyType } = require("projen");

const CDK_VERSION = "2.61.0";

const project = new awscdk.AwsCdkConstructLibrary({
  author: "AWS Professional Services",
  authorAddress: "aws-proserve-orion-dev@amazon.com",

  cdkVersion: CDK_VERSION,
  defaultReleaseBranch: "main",
  release: false,
  name: "aws-ddk-core",
  description: "AWS DataOps Development Kit",
  repositoryUrl: "https://github.com/awslabs/aws-ddk",

  // Artifact config: Python
  publishToPypi: {
    distName: "aws-ddk-core",
    module: "aws_ddk_core",
  },

  prettier: true,
  prettierOptions: {
    settings: {
      trailingComma: javascript.TrailingComma.ALL,
      printWidth: 120,
    },
  },

  gitignore: [".vscode/", "*.code-workspace", ".python-version", ".DS_Store"],
});

// Experimental modules
[
  "@aws-cdk/aws-kinesisfirehose-alpha",
  "@aws-cdk/aws-kinesisfirehose-destinations-alpha",
  "@aws-cdk/aws-glue-alpha",
].forEach((dep) => {
  project.deps.addDependency(`${dep}@^${CDK_VERSION}-alpha.0`, DependencyType.PEER);
  project.deps.addDependency(`${dep}@${CDK_VERSION}-alpha.0`, DependencyType.DEVENV);
});

// Other Bundled dependencies
["deepmerge@4.0.0"].forEach((dep) => {
  project.addBundledDeps(dep);
});

project.eslint.addRules({
  "prettier/prettier": ["error", { singleQuote: false }],
});

project.synth();
