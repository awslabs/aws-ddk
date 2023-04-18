import * as cdk from "aws-cdk-lib";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as events from "aws-cdk-lib/aws-events";
import * as events_targets from "aws-cdk-lib/aws-events-targets";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambda_event_sources from "aws-cdk-lib/aws-lambda-event-sources";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { DataStage, DataStageProps } from "../pipelines/stage";

/**
 * Properties for the Lambda Function created by `SqsToLambdaStage`.
 */
export interface SqsToLambdaStageFunctionProps extends lambda.FunctionProps {
  /**
   * Amount of errored function invocations before triggering CloudWatch alarm.
   * @default 5
   */
  readonly errorsAlarmThreshold?: number;
  /**
   * The number of periods over which data is compared to the specified threshold.
   * @default 1
   */
  readonly errorsEvaluationPeriods?: number;
  /**
   * Comparison operator for evaluating alarms.
   * @default cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD
   */
  readonly errorsComparisonOperator?: cloudwatch.ComparisonOperator;
}

/**
 * Properties for `SqsToLambdaStage`.
 */
export interface SqsToLambdaStageProps extends DataStageProps {
  /**
   * Preexisting Lambda Function to use in stage.
   * If not provided, a new function will be created.
   */
  readonly lambdaFunction?: lambda.IFunction;
  /**
   * Properties for the Lambda Function that will be created by this construct
   * (if `lambdaFunction` is not provided).
   */
  readonly lambdaFunctionProps?: SqsToLambdaStageFunctionProps;
  /**
   * Preexisting SQS Queue to use in stage.
   * If not provided, a new queue will be created.
   */
  readonly sqsQueue?: sqs.IQueue;
  /**
   * Properties for the SQS Queue that will be created by this construct
   * (if `sqsQueue` is not provided).
   */
  readonly sqsQueueProps?: sqs.QueueProps;

  /**
   * The maximum number of records retrieved from the event source at the function invocation time.
   * @default 10
   */
  readonly batchSize?: number;
  /**
   * The maximum amount of time to gather records before invoking the function.
   * Valid Range: Minimum value of 0 minutes, maximum value of 5 minutes.
   * Default: - no batching window.
   */
  readonly maxBatchingWindow?: cdk.Duration;
  /**
   * Determines if DLQ is enabled.
   * @default false
   */
  readonly dlqEnabled?: boolean;
  /**
   * The number of times a message can be unsuccessfully dequeued before
   * being moved to the dead-letter queue.
   * @default 1
   */
  readonly maxReceiveCount?: number;
  /**
   * Message Group ID for messages sent to this queue.
   * Required for FIFO queues.
   */
  readonly messageGroupId?: string;
}

/**
 * Stage implements an Amazon SQS queue connected to an AWS Lambda function, with an optional DLQ.
 */
export class SqsToLambdaStage extends DataStage {
  readonly targets?: events.IRuleTarget[];
  readonly eventPattern?: events.EventPattern;

  readonly function: lambda.IFunction;
  readonly queue: sqs.IQueue;
  readonly deadLetterQueue?: sqs.Queue;

  /**
   * Constructs `SqsToLambdaStage`.
   * @param scope Scope within which this construct is defined.
   * @param id Identifier of the stage.
   * @param props Properties for the stage.
   */
  constructor(scope: Construct, id: string, props: SqsToLambdaStageProps) {
    super(scope, id, props);

    const eventSource = `${id}-event-source`;
    const eventDetailType = `${id}-event-type`;

    if (props.lambdaFunction) {
      this.function = props.lambdaFunction;
    } else if (props.lambdaFunctionProps) {
      const functionProps: SqsToLambdaStageFunctionProps = props.lambdaFunctionProps;

      this.function = new lambda.Function(this, "Process Function", {
        timeout: functionProps.timeout ?? cdk.Duration.seconds(120),
        memorySize: functionProps.memorySize ?? 256,
        environment: {
          EVENT_SOURCE: eventSource,
          EVENT_DETAIL_TYPE: eventDetailType,
          ...(functionProps.environment ?? {}),
        },
        ...functionProps,
      });
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
        ...props.sqsQueueProps,
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
