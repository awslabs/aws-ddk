import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

export function getCodeArtifactReadPolicyStatements(
  partition: string,
  region: string,
  account: string,
  domain: string,
  repository: string,
): PolicyStatement[] {
  return [
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'codeartifact:DescribeDomain',
        'codeartifact:GetAuthorizationToken',
        'codeartifact:ListRepositoriesInDomain',
      ],
      resources: [`arn:${partition}:codeartifact:${region}:${account}:domain/${domain}`],
    }),
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['codeartifact:GetRepositoryEndpoint', 'codeartifact:ReadFromRepository'],
      resources: [`arn:${partition}:codeartifact:${region}:${account}:repository/${domain}/${repository}`],
    }),
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['sts:GetServiceBearerToken'],
      resources: ['*'],
      conditions: {
        StringEquals: {
          'sts:AWSServiceName': 'codeartifact.amazonaws.com',
        },
      },
    }),
  ];
}

export function getCodeArtifactPublishPolicyStatements(
  partition: string,
  region: string,
  account: string,
  domain: string,
  repository: string,
): PolicyStatement[] {
  return [
    new PolicyStatement({
      actions: [
        'codeartifact:DescribeDomain',
        'codeartifact:GetAuthorizationToken',
        'codeartifact:ListRepositoriesInDomain',
      ],
      effect: Effect.ALLOW,
      resources: [`arn:${partition}:codeartifact:${region}:${account}:domain/${domain}`],
    }),
    new PolicyStatement({
      actions: ['codeartifact:GetRepositoryEndpoint', 'codeartifact:ReadFromRepository'],
      effect: Effect.ALLOW,
      resources: [`arn:${partition}:codeartifact:${region}:${account}:repository/${domain}/${repository}`],
    }),
    new PolicyStatement({
      actions: ['codeartifact:PublishPackageVersion'],
      effect: Effect.ALLOW,
      resources: ['*'],
    }),
    new PolicyStatement({
      actions: ['sts:GetServiceBearerToken'],
      effect: Effect.ALLOW,
      resources: ['*'],
      conditions: {
        StringEquals: {
          'sts:AWSServiceName': 'codeartifact.amazonaws.com',
        },
      },
    }),
  ];
}

export function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b(\w)/g, (s) => s.toUpperCase());
}
