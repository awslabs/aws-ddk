import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

const BOOTSTRAP_PREFIX = 'ddk';
const BOOTSTRAP_QUALIFIER = 'hnb659fds';

const PH_REGION = '${{AWS::Region}}';
const PH_ACCOUNT_ID = '${{AWS::AccountId}}';
const PH_PARTITION = '${{AWS::Partition}}';

export interface BaseStackProps extends cdk.StackProps {
  readonly permissionBoundaryArn?: string;
}

export class BaseStack extends cdk.Stack {
  private static buildRoleArn(name: string): string {
    // These role ARNs are built for the stack synthesize step.
    // At this time, the stack is not generated and therefore we cannot rely on stack-based tokens (like cdk.Aws.ACCOUNT_ID).
    // Therefore we are relying on placeholder variables like AWS::AccountId.
    return `arn:${PH_PARTITION}:iam::${PH_ACCOUNT_ID}:role/${BOOTSTRAP_PREFIX}-${BOOTSTRAP_QUALIFIER}-${name}-${PH_ACCOUNT_ID}-${PH_REGION}`;
  }

  constructor(scope: Construct, id: string, props: BaseStackProps = {}) {

    const synthesizer = props.synthesizer ?? new cdk.DefaultStackSynthesizer({
      qualifier: BOOTSTRAP_QUALIFIER,
      fileAssetsBucketName: `${BOOTSTRAP_PREFIX}-${BOOTSTRAP_QUALIFIER}-assets-${PH_ACCOUNT_ID}-${PH_REGION}`,
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
      ?? `arn:${this.partition}:iam::${this.account}:policy/${BOOTSTRAP_PREFIX}-${BOOTSTRAP_QUALIFIER}-permissions-boundary-${this.account}-${this.region}`;

    iam.PermissionsBoundary.of(this).apply(
      iam.ManagedPolicy.fromManagedPolicyArn(this, 'Permissions Boundary', permissionBoundaryArn),
    );
  }
}