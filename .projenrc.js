const { awscdk } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'AWS Professional Services',
  authorAddress: 'aws-proserve-opensource@amazon.com',

  cdkVersion: '2.1.0',
  release: false,
  defaultReleaseBranch: 'main',
  name: 'aws-ddk-dev',
  description: 'AWS DataOps Development Kit',
  repositoryUrl: 'https://github.com/awslabs/aws-ddk',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});

project.gitignore.exclude('.vscode/');

project.synth();