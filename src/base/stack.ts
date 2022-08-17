import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

const BOOTSTRAP_PREFIX = 'ddk';
const BOOTSTRAP_QUALIFIER = 'hnb659fds';

export interface BaseStackProps extends cdk.StackProps {
  permissionBoundaryArn?: string;
}

export class BaseStack extends cdk.Stack {
  private static buildRoleArn(name: string): string {
    return `arn:${cdk.Aws.PARTITION}:iam::${cdk.Aws.ACCOUNT_ID}:role/${BOOTSTRAP_PREFIX}-${BOOTSTRAP_QUALIFIER}-${name}-${cdk.Aws.ACCOUNT_ID}-${cdk.Aws.REGION}`;
  }

  constructor(scope: Construct, id: string, props: BaseStackProps) {
    const synthesizer = props.synthesizer ?? new cdk.DefaultStackSynthesizer({
      qualifier: BOOTSTRAP_QUALIFIER,
      fileAssetsBucketName: `${BOOTSTRAP_PREFIX}-${BOOTSTRAP_QUALIFIER}-assets-${cdk.Aws.ACCOUNT_ID}-${cdk.Aws.REGION}`,
      bootstrapStackVersionSsmParameter: `/${BOOTSTRAP_PREFIX}/${BOOTSTRAP_QUALIFIER}/bootstrap-version`,
      deployRoleArn: BaseStack.buildRoleArn('deploy'),
      fileAssetPublishingRoleArn: BaseStack.buildRoleArn('file-publish'),
      cloudFormationExecutionRole: BaseStack.buildRoleArn('cfn-exec'),
      lookupRoleArn: BaseStack.buildRoleArn('lookup'),
    });

    super(scope, id, {
      ...props,
      synthesizer: synthesizer,
      terminationProtection: props.terminationProtection ?? true,
    });

    const permissionBoundaryArn = props.permissionBoundaryArn
      ?? `arn:${cdk.Aws.PARTITION}:iam::${cdk.Aws.ACCOUNT_ID}:policy/${BOOTSTRAP_PREFIX}-${BOOTSTRAP_QUALIFIER}-permissions-boundary-${cdk.Aws.ACCOUNT_ID}-${cdk.Aws.REGION}`;

    iam.PermissionsBoundary.of(this).apply(
      iam.ManagedPolicy.fromManagedPolicyArn(this, 'Permissions Boundary', permissionBoundaryArn),
    );
  }
}