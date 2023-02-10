import * as events from "aws-cdk-lib/aws-events";
import * as events_targets from "aws-cdk-lib/aws-events-targets";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { SqsToLambdaStage, SqsToLambdaStageProps } from "./sqs-lambda";
import { secureSnsTopicPolicy } from "../core/sns-defaults";

export interface SnsToLambdaStageProps extends SqsToLambdaStageProps {
  readonly snsTopic?: sns.ITopic;
  readonly snsTopicProps?: sns.TopicProps;
  readonly filterPolicy?: { [attribute: string]: sns.SubscriptionFilter };
  readonly snsDlqEnabled?: boolean;
  readonly rawMessageDelivery?: boolean;
  readonly disableDefaultTopicPolicy?: boolean;
}

export class SnsSqsToLambdaStage extends SqsToLambdaStage {
  readonly targets?: events.IRuleTarget[];
  readonly eventPattern?: events.EventPattern;

  readonly topic: sns.ITopic;
  readonly snsDeadLetterQueue?: sqs.Queue;

  constructor(scope: Construct, id: string, props: SnsToLambdaStageProps) {
    super(scope, id, props);

    this.snsDeadLetterQueue = props.snsDlqEnabled ? new sqs.Queue(this, "SNS Dead Letter Queue", {}) : undefined;
    this.topic = props.snsTopic ? props.snsTopic : new sns.Topic(this, "Topic", { ...props.snsTopicProps });
    if (this.topic.fifo) {
      throw TypeError("FIFO SNS Topics are unsupported for Lambda Triggers");
    }
    if (!props.disableDefaultTopicPolicy) {
      secureSnsTopicPolicy(this.topic);
    }

    this.topic.addSubscription(
      new subscriptions.SqsSubscription(this.queue, {
        deadLetterQueue: this.deadLetterQueue,
        filterPolicy: props.filterPolicy ?? {},
        rawMessageDelivery: props.rawMessageDelivery ?? undefined,
      }),
    );

    this.targets = [new events_targets.SnsTopic(this.topic, {})];
  }
}
