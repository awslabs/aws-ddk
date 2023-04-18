import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { Configuration, getStackSynthesizer } from "../config";

/**
 * Properties of `BaseStack`.
 */
export interface BaseStackProps extends cdk.StackProps {
  /**
   * ARN of the permissions boundary managed policy.
   */
  readonly permissionsBoundaryArn?: string;
  /**
   * Identifier of the environment.
   *
   * @default "dev"
   */
  readonly environmentId?: string;
  /**
   * Configuration or path to file which contains the configuration.
   */
  readonly config?: string | Configuration;
}

export interface PermissionsBoundaryProps {
  readonly environmentId?: string;
  readonly prefix?: string;
  readonly qualifier?: string;
}

/**
 * Base Stack to inherit from.
 *
 * Includes configurable termination protection, synthesizer, permissions boundary and tags.
 */
export class BaseStack extends cdk.Stack {
  public static createDefaultPermissionsBoundary(
    scope: Construct,
    id: string,
    props: PermissionsBoundaryProps,
  ): iam.IManagedPolicy {
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

  /**
   * Create a stack.
   *
   * Includes termination protection settings, multi-level (application, environment,
   * and stack-level) tags, and permissions boundary.
   * @param scope Scope within which this construct is defined.
   * @param id Identifier of the stack.
   * @param props Stack properties.
   */
  constructor(scope: Construct, id: string, props: BaseStackProps) {
    const environmentId = props.environmentId ? props.environmentId : "dev";
    const synthesizer = props.synthesizer
      ? props.synthesizer
      : getStackSynthesizer({ environmentId: environmentId, config: props.config });

    super(scope, id, { synthesizer: synthesizer, ...props });

    if (props.permissionsBoundaryArn) {
      iam.PermissionsBoundary.of(scope).apply(
        iam.ManagedPolicy.fromManagedPolicyArn(this, "Permissions Boundary", props.permissionsBoundaryArn),
      );
    }
  }

  /**
   * Create a CloudFormation Export for a string value
   *
   * Returns a string representing the corresponding `Fn.importValue()`
   * expression for this Export. You can control the name for the export by
   * passing the `name` option.
   *
   * If you don't supply a value for `name`, the value you're exporting must be
   * a Resource attribute (for example: `bucket.bucketName`) and it will be
   * given the same name as the automatic cross-stack reference that would be created
   * if you used the attribute in another Stack.
   *
   * One of the uses for this method is to *remove* the relationship between
   * two Stacks established by automatic cross-stack references. It will
   * temporarily ensure that the CloudFormation Export still exists while you
   * remove the reference from the consuming stack. After that, you can remove
   * the resource and the manual export.
   */
  exportValue(exportedValue: any, options?: cdk.ExportValueOptions): string {
    return super.exportValue(exportedValue, options);
  }
}
