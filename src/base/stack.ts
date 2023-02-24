import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { getStackSynthesizer } from "../config";

export interface BaseStackProps {
  readonly terminationProtection?: boolean | undefined;
  readonly permissionsBoundaryArn?: string;
  readonly synthesizer?: cdk.IStackSynthesizer;
  readonly environmentId?: string;
  readonly config?: string | object;
}

export class BaseStack extends cdk.Stack {
  readonly terminationProtection?: boolean | undefined;

  constructor(scope: Construct, id: string, props: BaseStackProps) {
    const environmentId = props.environmentId ? props.environmentId : "dev";
    const synthesizer = props.synthesizer
      ? props.synthesizer
      : getStackSynthesizer({ environmentId: environmentId, config: props.config });

    super(scope, id, { synthesizer: synthesizer, terminationProtection: props.terminationProtection });

    if (props.permissionsBoundaryArn) {
      iam.PermissionsBoundary.of(scope).apply(
        iam.ManagedPolicy.fromManagedPolicyArn(this, "Permissions Boundary", props.permissionsBoundaryArn),
      );
    }
  }
}

export interface PermissionsBoundaryProps {
  readonly environmentId?: string;
  readonly prefix?: string;
  readonly qualifier?: string;
}

export function createDefaultPermissionsBoundary(scope: Construct, id: string, props: PermissionsBoundaryProps) {
  const prefix = props.prefix ?? "ddk";
  const environmentId = props.environmentId ?? "dev";
  const qualifier = props.environmentId ?? "hnb659fds";

  const policyStatements = [
    new iam.PolicyStatement({
      effect: iam.Effect.DENY,
      actions: ["s3:PutAccountPublicAccessBlock"],
      resources: ["*"],
    }),
    new iam.PolicyStatement({
      effect: iam.Effect.DENY,
      actions: [
        "iam:CreatePolicyVersion",
        "iam:DeletePolicy",
        "iam:DeletePolicyVersion",
        "iam:SetDefaultPolicyVersion",
      ],
      resources: [
        `arn:${cdk.Stack.of(scope).partition}:iam::${
          cdk.Stack.of(scope).account
        }:policy/${prefix}-${environmentId}-${qualifier}-permissions-boundary-${cdk.Stack.of(scope).account}-${
          cdk.Stack.of(scope).region
        }`,
      ],
    }),
    new iam.PolicyStatement({
      effect: iam.Effect.DENY,
      actions: ["iam:DeleteRolePermissionsBoundary"],
      resources: [`arn:${cdk.Stack.of(scope).partition}:iam::${cdk.Stack.of(scope).account}:role/*`],
      conditions: {
        "ForAnyValue:StringEquals": {
          "iam:PermissionsBoundary": `arn:${cdk.Stack.of(scope).partition}:iam::${
            cdk.Stack.of(scope).account
          }:policy/${prefix}-${environmentId}-${qualifier}-permissions-boundary-${cdk.Stack.of(scope).account}-${
            cdk.Stack.of(scope).region
          }`,
        },
      },
    }),
    new iam.PolicyStatement({
      effect: iam.Effect.DENY,
      actions: ["iam:PutRolePermissionsBoundary"],
      resources: [`arn:${cdk.Stack.of(scope).partition}:iam::${cdk.Stack.of(scope).account}:role/*`],
      conditions: {
        "ForAnyValue:StringNotEquals": {
          "iam:PermissionsBoundary": `arn:${cdk.Stack.of(scope).partition}:iam::${
            cdk.Stack.of(scope).account
          }:policy/${prefix}-${environmentId}-${qualifier}-permissions-boundary-${cdk.Stack.of(scope).account}-${
            cdk.Stack.of(scope).region
          }`,
        },
      },
    }),
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["*"],
      resources: ["*"],
    }),
  ];
  return new iam.ManagedPolicy(scope, id, {
    statements: policyStatements,
    managedPolicyName: `${prefix}-${environmentId}-${qualifier}-permissions-boundary-${cdk.Stack.of(scope).account}-${
      cdk.Stack.of(scope).region
    }`,
    description: "AWS-DDK: Deny dangerous actions that could escalate privilege or cause security incident",
  });
}
