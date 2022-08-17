import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import * as iam from 'aws-cdk-lib/aws-iam';
import { BaseStack } from '../src';

test('Test Base Stack', () => {
  const app = new cdk.App();
  const testStack = new BaseStack(app, 'Stack', {
    env: {
      account: '1111111111',
      region: 'us-west-2',
    },
  });

  new iam.Role(testStack, 'Role', {
    assumedBy: new iam.ServicePrincipal('sns.amazonaws.com'),
  });

  const template = Template.fromStack(testStack);

  template.hasResourceProperties('AWS::IAM::Role', {
    PermissionsBoundary: Match.objectLike({
      'Fn::Join': [
        '',
        [
          'arn:',
          {
            Ref: 'AWS::Partition',
          },
          ':iam::',
          {
            Ref: 'AWS::AccountId',
          },
          ':policy/ddk-hnb659fds-permissions-boundary-',
          {
            Ref: 'AWS::AccountId',
          },
          '-',
          {
            Ref: 'AWS::Region',
          },
        ],
      ],
    }),
  });
});