import * as path from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

/**
 * Props for DetectDriftFunction
 */
export interface DetectDriftFunctionProps extends lambda.FunctionOptions {
}

/**
 * An AWS Lambda function which executes src/detect-drift.
 */
export class DetectDriftFunction extends lambda.Function {
  constructor(scope: Construct, id: string, props?: DetectDriftFunctionProps) {
    super(scope, id, {
      description: 'src/detect-drift.lambda.ts',
      ...props,
      runtime: new lambda.Runtime('nodejs16.x', lambda.RuntimeFamily.NODEJS),
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../assets/detect-drift.lambda')),
    });
    this.addEnvironment('AWS_NODEJS_CONNECTION_REUSE_ENABLED', '1', { removeInEdge: true });
  }
}