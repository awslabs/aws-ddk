import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as events from 'aws-cdk-lib/aws-events';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';
import { DataStage } from './stage';

export interface DataPipelineProps {
  readonly name?: string;
  readonly description?: string;
}

export interface AddStageProps {
  readonly stage: DataStage;
  readonly skipRule?: boolean;
  readonly overrideRule?: events.IRule;
}

export interface AddRuleProps {
  readonly id?: string;
  readonly eventPattern?: events.EventPattern;
  readonly eventTargets?: events.IRuleTarget[];
  readonly overrideRule?: events.IRule;
}

export class DataPipeline extends Construct {
  readonly name?: string;
  readonly description?: string;

  private previousStage?: DataStage;
  private rules: events.IRule[];
  private notificationsTopic?: sns.ITopic;

  constructor(scope: Construct, id: string, props: DataPipelineProps) {
    super(scope, id);

    this.name = props.name;
    this.description = props.description;

    this.rules = [];
  }

  addStage(props: AddStageProps): DataPipeline {
    const { stage } = props;
    const skipRule = props.skipRule ?? false;

    if (props.overrideRule) {
      this.addRule({ overrideRule: props.overrideRule });
    } else if (this.previousStage && skipRule === false) {
      this.addRule({
        id: `${stage.node.id} Rule`,
        eventPattern: this.previousStage?.eventPattern,
        eventTargets: stage.targets,
      });
    }

    if (this.notificationsTopic && stage.cloudwatchAlarms) {
      const topic = this.notificationsTopic;
      stage.cloudwatchAlarms.forEach(alarm => {
        alarm.addAlarmAction(new SnsAction(topic));
      });
    }

    this.previousStage = stage;
    return this;
  }

  addRule(props: AddRuleProps): DataPipeline {
    this.rules.push(props.overrideRule ? props.overrideRule : new events.Rule(this, props.id!, {
      eventPattern: props.eventPattern,
      targets: props.eventTargets,
    }));

    return this;
  }

  addNotifications(notificationsTopic?: sns.ITopic): DataPipeline {
    this.notificationsTopic = notificationsTopic ?? new sns.Topic(this, 'Notifications');
    return this;
  }
}