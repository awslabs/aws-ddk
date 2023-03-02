import * as cdk from "aws-cdk-lib";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as events from "aws-cdk-lib/aws-events";
import * as events_targets from "aws-cdk-lib/aws-events-targets";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambda_event_sources from "aws-cdk-lib/aws-lambda-event-sources";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { LambdaDefaults } from "../core/lambda-defaults";
import { DataStage, DataStageProps } from "../pipelines/stage";

export interface SqsToLambdaStageFunctionProps extends lambda.FunctionProps {
  readonly errorsAlarmThreshold?: number;
  readonly errorsEvaluationPeriods?: number;
  readonly errorsComparisonOperator?: cloudwatch.ComparisonOperator;
}

export interface SqsToLambdaStageProps extends DataStageProps {
  readonly lambdaFunction?: lambda.IFunction;
  readonly lambdaFunctionProps?: SqsToLambdaStageFunctionProps;
  readonly sqsQueue?: sqs.IQueue;
  readonly sqsQueueProps?: sqs.QueueProps;

  readonly batchSize?: number;
  readonly maxBatchingWindow?: cdk.Duration;
  readonly dlqEnabled?: boolean;
  readonly maxReceiveCount?: number;
  readonly messageGroupId?: string;
}

export class SqsToLambdaStage extends DataStage {
  readonly targets?: events.IRuleTarget[];
  readonly eventPattern?: events.EventPattern;

  readonly function: lambda.IFunction;
  readonly queue: sqs.IQueue;
  readonly deadLetterQueue?: sqs.Queue;

  constructor(scope: Construct, id: string, props: SqsToLambdaStageProps) {
    super(scope, id, props);

    const eventSource = `${id}-event-source`;
    const eventDetailType = `${id}-event-type`;

    if (props.lambdaFunction) {
      this.function = props.lambdaFunction;
    } else if (props.lambdaFunctionProps) {
      const functionProps: SqsToLambdaStageFunctionProps = props.lambdaFunctionProps;

      this.function = new lambda.Function(
        this,
        "Process Function",
        LambdaDefaults.functionProps({
          code: functionProps.code,
          runtime: functionProps.runtime,
          handler: functionProps.handler,
          timeout: functionProps.timeout,
          memorySize: functionProps.memorySize,
          layers: functionProps.layers,
          role: functionProps.role,
          environment: {
            EVENT_SOURCE: eventSource,
            EVENT_DETAIL_TYPE: eventDetailType,
            ...(functionProps.environment ?? {}),
          },
        }),
      );
    } else {
      throw TypeError("'lambdaFunction' or 'lambdaFunctionProps' must be set to instantiate this stage");
    }

    // Enable the function to publish events to the default EventBus
    this.function.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["events:PutEvents"],
        resources: ["*"],
      }),
    );

    const dlqEnabled = props.dlqEnabled ?? false;
    if (dlqEnabled == true) {
      this.deadLetterQueue = new sqs.Queue(this, "Dead Letter Queue", {
        fifo: props.sqsQueueProps?.fifo ? props.sqsQueueProps?.fifo : undefined,
      });
    }

    if (props.sqsQueue) {
      this.queue = props.sqsQueue;
    } else {
      this.queue = new sqs.Queue(this, "Queue", {
        visibilityTimeout: props.sqsQueueProps?.visibilityTimeout ?? cdk.Duration.minutes(2),
        deadLetterQueue: this.deadLetterQueue
          ? {
              queue: this.deadLetterQueue,
              maxReceiveCount: props.maxReceiveCount ?? 1,
            }
          : undefined,
        fifo: props.sqsQueueProps?.fifo ? props.sqsQueueProps?.fifo : undefined,
      });
    }

    this.function.addEventSource(
      new lambda_event_sources.SqsEventSource(this.queue, {
        batchSize: props.batchSize,
        maxBatchingWindow: props.maxBatchingWindow,
      }),
    );

    this.addAlarm("Process Function Errors", {
      metric: this.function.metricErrors(),
      threshold: props.lambdaFunctionProps?.errorsAlarmThreshold ?? 5,
      evaluationPeriods: props.lambdaFunctionProps?.errorsEvaluationPeriods ?? 1,
      comparisonOperator:
        props.lambdaFunctionProps?.errorsComparisonOperator ?? cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });

    this.eventPattern = {
      source: [eventSource],
      detailType: [eventDetailType],
    };

    if (this.queue.fifo && !props.messageGroupId) {
      throw TypeError("'messageGroupId' must be set to when target is a fifo queue");
    }

    this.targets = this.queue.fifo
      ? [new events_targets.SqsQueue(this.queue, { messageGroupId: props.messageGroupId })]
      : [new events_targets.SqsQueue(this.queue)];
  }
}
