import * as iam from "aws-cdk-lib/aws-iam";

export function getCodeArtifactReadPolicyStatements(
  partition: string,
  region: string,
  account: string,
  domain: string,
  repository: string,
): iam.PolicyStatement[] {
  return [
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "codeartifact:DescribeDomain",
        "codeartifact:GetAuthorizationToken",
        "codeartifact:ListRepositoriesInDomain",
      ],
      resources: [`arn:${partition}:codeartifact:${region}:${account}:domain/${domain}`],
    }),
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["codeartifact:GetRepositoryEndpoint", "codeartifact:ReadFromRepository"],
      resources: [`arn:${partition}:codeartifact:${region}:${account}:repository/${domain}/${repository}`],
    }),
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["sts:GetServiceBearerToken"],
      resources: ["*"],
      conditions: {
        StringEquals: {
          "sts:AWSServiceName": "codeartifact.amazonaws.com",
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
): iam.PolicyStatement[] {
  return [
    new iam.PolicyStatement({
      actions: [
        "codeartifact:DescribeDomain",
        "codeartifact:GetAuthorizationToken",
        "codeartifact:ListRepositoriesInDomain",
      ],
      effect: iam.Effect.ALLOW,
      resources: [`arn:${partition}:codeartifact:${region}:${account}:domain/${domain}`],
    }),
    new iam.PolicyStatement({
      actions: ["codeartifact:GetRepositoryEndpoint", "codeartifact:ReadFromRepository"],
      effect: iam.Effect.ALLOW,
      resources: [`arn:${partition}:codeartifact:${region}:${account}:repository/${domain}/${repository}`],
    }),
    new iam.PolicyStatement({
      actions: ["codeartifact:PublishPackageVersion"],
      effect: iam.Effect.ALLOW,
      resources: ["*"],
    }),
    new iam.PolicyStatement({
      actions: ["sts:GetServiceBearerToken"],
      effect: iam.Effect.ALLOW,
      resources: ["*"],
      conditions: {
        StringEquals: {
          "sts:AWSServiceName": "codeartifact.amazonaws.com",
        },
      },
    }),
  ];
}

export function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b(\w)/g, (s) => s.toUpperCase());
}
