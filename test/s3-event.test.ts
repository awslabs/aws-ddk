import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';

import { S3EventStage } from '../src';

test('S3EventStage created the event pattern without a prefix', () => {
  const stack = new cdk.Stack();
  const bucket = new s3.Bucket(stack, 'Bucket');

  const stage = new S3EventStage(stack, 'Stage', {
    bucket: bucket,
    eventNames: ['Object Created'],
  });

  expect(stage.eventPattern).toEqual({
    source: ['aws.s3'],
    detail: {
      bucket: {
        name: bucket.bucketName,
      },
    },
    detailType: ['Object Created'],
  });
});

test('S3EventStage created the event pattern with a prefix', () => {
  const stack = new cdk.Stack();
  const bucket = new s3.Bucket(stack, 'Bucket');

  const stage = new S3EventStage(stack, 'Stage', {
    bucket: bucket,
    eventNames: ['Object Deleted'],
    keyPrefix: 'test/',
  });

  expect(stage.eventPattern).toEqual({
    source: ['aws.s3'],
    detail: {
      bucket: {
        name: bucket.bucketName,
      },
      object: {
        key: [
          {
            prefix: 'test/',
          },
        ],
      },
    },
    detailType: ['Object Deleted'],
  });
});

test('S3EventStage created the event pattern for multiple event types', () => {
  const stack = new cdk.Stack();
  const bucket = new s3.Bucket(stack, 'Bucket');

  const stage = new S3EventStage(stack, 'Stage', {
    bucket: bucket,
    eventNames: ['Object Created', 'Object Deleted'],
  });

  expect(stage.eventPattern).toEqual({
    source: ['aws.s3'],
    detail: {
      bucket: {
        name: bucket.bucketName,
      },
    },
    detailType: ['Object Created', 'Object Deleted'],
  });
});