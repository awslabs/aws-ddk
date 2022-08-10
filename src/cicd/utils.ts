import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

export interface getCodeartifactProps {
  partition: string;
  region: string;
  account: string;
  domain: string;
  repository: string;
}

export function getCodeartifactReadPolicyStatements(
  props: getCodeartifactProps
) {
  return [
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        "codeartifact:DescribeDomain",
        "codeartifact:GetAuthorizationToken",
        "codeartifact:ListRepositoriesInDomain",
      ],
      resources: [
        `arn:${props.partition}:codeartifact:${props.region}:${props.account}:domain/${props.domain}`,
      ],
    }),
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        "codeartifact:GetRepositoryEndpoint",
        "codeartifact:ReadFromRepository",
      ],
      resources: [
        `arn:${props.partition}:codeartifact:${props.region}:${props.account}:repository/${props.domain}/${props.repository}`,
      ],
    }),
    new PolicyStatement({
      effect: Effect.ALLOW,
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

export function getCodeartifactPublishPolicyStatements(
  props: getCodeartifactProps
) {
  return [
    new PolicyStatement({
      actions: [
        "codeartifact:DescribeDomain",
        "codeartifact:GetAuthorizationToken",
        "codeartifact:ListRepositoriesInDomain",
      ],
      effect: Effect.ALLOW,
      resources: [
        `arn:${props.partition}:codeartifact:${props.region}:${props.account}:domain/${props.domain}`,
      ],
    }),
    new PolicyStatement({
      actions: [
        "codeartifact:GetRepositoryEndpoint",
        "codeartifact:ReadFromRepository",
      ],
      effect: Effect.ALLOW,
      resources: [
        `arn:${props.partition}:codeartifact:${props.region}:${props.account}:repository/${props.domain}/${props.repository}`,
      ],
    }),
    new PolicyStatement({
      actions: ["codeartifact:PublishPackageVersion"],
      effect: Effect.ALLOW,
      resources: ["*"],
    }),
    new PolicyStatement({
      actions: ["sts:GetServiceBearerToken"],
      effect: Effect.ALLOW,
      resources: ["*"],
      conditions: {
        StringEquals: {
          "sts:AWSServiceName": "codeartifact.amazonaws.com",
        },
      },
    }),
  ];
}

export function toTitleCase(str: string) {
  return str.toLowerCase().replace(/\b(\w)/g, (s) => s.toUpperCase());
}
