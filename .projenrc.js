const { awscdk, javascript } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'AWS Professional Services',
  authorAddress: 'aws-proserve-orion-dev@amazon.com',

  cdkVersion: '2.38.1',
  defaultReleaseBranch: 'main',
  release: false,
  name: 'aws-ddk-core',
  description: 'AWS DataOps Development Kit',
  repositoryUrl: 'https://github.com/awslabs/aws-ddk',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */

  // Artifact config: Python
  publishToPypi: {
    distName: 'aws-ddk-core',
    module: 'aws_ddk_core',
  },

  prettier: true,
  prettierOptions: {
    settings: {
      singleQuote: true,
      trailingComma: javascript.TrailingComma.ALL,
      printWidth: 120,
    },
  },

  gitignore: ['.vscode/'],
});

project.synth();
