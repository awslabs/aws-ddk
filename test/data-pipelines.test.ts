import path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import { DataPipeline, SqsToLambdaStage } from '../src';


test('Basic DataPipeline', () => {
  const stack = new cdk.Stack();

  const stage1 = new SqsToLambdaStage(stack, 'SQS To Lambda Stage 1', {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, '/../src/')),
      handler: 'commons.handlers.lambda_handler',
      memorySize: cdk.Size.mebibytes(512),
      layers: [
        lambda.LayerVersion.fromLayerVersionArn(stack, 'Layer', 'arn:aws:lambda:us-east-1:222222222222:layer:dummy:1'),
      ],
    },
  });

  const stage2 = new SqsToLambdaStage(stack, 'SQS To Lambda Stage 2', {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, '/../src/')),
      handler: 'commons.handlers.lambda_handler',
    },
    dlqEnabled: true,
  });

  const pipeline = new DataPipeline(stack, 'Pipeline', {});

  pipeline.addNotifications().addStage({ stage: stage1 }).addStage({ stage: stage2 });

  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::SNS::Topic', 1);

  template.resourceCountIs('AWS::Events::Rule', 1);
  template.hasResourceProperties('AWS::Events::Rule', {
    State: 'ENABLED',
    EventPattern: Match.objectLike({
      'detail-type': stage1.eventPattern?.detailType,
      'source': stage1.eventPattern?.source,
    }),
    Targets: Match.arrayEquals([
      Match.objectLike({
        Arn: {
          'Fn::GetAtt': [
            stack.resolve((stage2.queue.node.defaultChild as cdk.CfnElement).logicalId),
            'Arn',
          ],
        },
      }),
    ]),
  });
});