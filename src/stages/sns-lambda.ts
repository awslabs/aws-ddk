import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as events from "aws-cdk-lib/aws-events";
import * as events_targets from "aws-cdk-lib/aws-events-targets";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambda_event_sources from "aws-cdk-lib/aws-lambda-event-sources";
import * as sns from "aws-cdk-lib/aws-sns";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { secureSnsTopicPolicy } from "../core/sns-defaults";
import { DataStage, DataStageProps } from "../pipelines/stage";

export interface SnsToLambdaStageFunctionProps extends lambda.FunctionProps {
  readonly errorsAlarmThreshold?: number;
  readonly errorsEvaluationPeriods?: number;
  readonly errorsComparisonOperator?: cloudwatch.ComparisonOperator;
}

export interface SnsToLambdaStageProps extends DataStageProps {
  readonly lambdaFunction?: lambda.IFunction;
  readonly lambdaFunctionProps?: SnsToLambdaStageFunctionProps;
  readonly snsTopic?: sns.ITopic;
  readonly snsTopicProps?: sns.TopicProps;

  readonly filterPolicy?: { [attribute: string]: sns.SubscriptionFilter };
  readonly dlqEnabled?: boolean;
  readonly disableDefaultTopicPolicy?: boolean;
}

export class SnsToLambdaStage extends DataStage {
  readonly targets?: events.IRuleTarget[];
  readonly eventPattern?: events.EventPattern;

  readonly function: lambda.IFunction;
  readonly topic: sns.ITopic;
  readonly deadLetterQueue?: sqs.Queue;

  constructor(scope: Construct, id: string, props: SnsToLambdaStageProps) {
    super(scope, id, props);

    const eventSource = `${id}-event-source`;
    const eventDetailType = `${id}-event-type`;

    if (props.lambdaFunction) {
      this.function = props.lambdaFunction;
    } else if (props.lambdaFunctionProps) {
      const functionProps: SnsToLambdaStageFunctionProps = props.lambdaFunctionProps;

      this.function = new lambda.Function(this, "Process Function", {
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

    this.deadLetterQueue = props.dlqEnabled ? new sqs.Queue(this, "Dead Letter Queue", {}) : undefined;
    this.topic = props.snsTopic ? props.snsTopic : new sns.Topic(this, "Topic", { ...props.snsTopicProps });
    if (this.topic.fifo) {
      throw TypeError("FIFO SNS Topics are unsupported for Lambda Triggers");
    }
    if (!props.disableDefaultTopicPolicy) {
      secureSnsTopicPolicy(this.topic);
    }

    this.function.addEventSource(
      new lambda_event_sources.SnsEventSource(this.topic, {
        deadLetterQueue: this.deadLetterQueue,
        filterPolicy: props.filterPolicy ?? {},
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

    this.targets = [new events_targets.SnsTopic(this.topic, {})];
  }
}
