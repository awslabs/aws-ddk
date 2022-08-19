import path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';

import { DataPipeline, S3EventStage, SqsToLambdaStage } from '../src';

test('Basic DataPipeline', () => {
  const stack = new cdk.Stack();

  const bucket = new s3.Bucket(stack, 'Bucket');

  const s3EventStage = new S3EventStage(stack, 'S3 Event Stage', {
    eventNames: ['Object Created'],
    bucket: bucket,
  });

  const sqsToLambdaStage = new SqsToLambdaStage(stack, 'SQS To Lambda Stage', {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, '/../src/')),
      handler: 'commons.handlers.lambda_handler',
    },
    dlqEnabled: true,
  });

  const pipeline = new DataPipeline(stack, 'Pipeline', {});

  pipeline.addNotifications().addStage({ stage: s3EventStage }).addStage({ stage: sqsToLambdaStage });

  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::SNS::Topic', 1);

  template.resourceCountIs('AWS::Events::Rule', 1);
  template.hasResourceProperties('AWS::Events::Rule', {
    State: 'ENABLED',
    EventPattern: Match.objectLike({
      'detail-type': s3EventStage.eventPattern?.detailType,
      source: s3EventStage.eventPattern?.source,
    }),
    Targets: Match.arrayEquals([
      Match.objectLike({
        Arn: {
          'Fn::GetAtt': [stack.resolve((sqsToLambdaStage.queue.node.defaultChild as cdk.CfnElement).logicalId), 'Arn'],
        },
      }),
    ]),
  });
});

test('DataPipeline cannot have a Stage without targets in the middle', () => {
  const stack = new cdk.Stack();

  const bucket = new s3.Bucket(stack, 'Bucket');

  const s3EventStage = new S3EventStage(stack, 'S3 Event Stage', {
    eventNames: ['Object Created'],
    bucket: bucket,
  });

  const sqsToLambdaStage = new SqsToLambdaStage(stack, 'SQS To Lambda Stage', {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, '/../src/')),
      handler: 'commons.handlers.lambda_handler',
    },
    dlqEnabled: true,
  });

  const pipeline = new DataPipeline(stack, 'Pipeline', {});

  pipeline.addNotifications().addStage({ stage: sqsToLambdaStage });

  expect(() => {
    pipeline.addStage({ stage: s3EventStage });
  }).toThrowError();
});
