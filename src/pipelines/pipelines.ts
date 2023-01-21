import * as cloudwatch_actions from "aws-cdk-lib/aws-cloudwatch-actions";
import * as events from "aws-cdk-lib/aws-events";
import * as sns from "aws-cdk-lib/aws-sns";
import { Construct } from "constructs";
import { DataStage, Stage } from "./stage";

export interface DataPipelineProps {
  readonly name?: string;
  readonly description?: string;
}

export interface AddStageProps {
  readonly stage: Stage;
  readonly skipRule?: boolean;
  readonly overrideRule?: events.IRule;
  readonly ruleName?: string;
  readonly schedule?: events.Schedule;
}

export interface AddRuleProps {
  readonly id?: string;
  readonly eventPattern?: events.EventPattern;
  readonly eventTargets?: events.IRuleTarget[];
  readonly overrideRule?: events.IRule;
  readonly ruleName?: string;
  readonly schedule?: events.Schedule;
}

export class DataPipeline extends Construct {
  readonly name?: string;
  readonly description?: string;

  private previousStage?: Stage;
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
      this.addRule({ overrideRule: props.overrideRule, schedule: props.schedule });
    } else if (this.previousStage && skipRule === false) {
      if (stage.targets === undefined) {
        throw new Error(
          "DataPipeline stage is missing a targets. Unless the rule between stages is overridden, every stage except for the first one must be a DataStage with a defined list of targets.",
        );
      }

      this.addRule({
        id: `${stage.node.id} Rule`,
        eventPattern: this.previousStage?.eventPattern,
        eventTargets: stage.targets,
        schedule: props.schedule,
      });
    }

    if (this.notificationsTopic && stage instanceof DataStage) {
      const topic = this.notificationsTopic;
      stage.cloudwatchAlarms.forEach((alarm) => {
        alarm.addAlarmAction(new cloudwatch_actions.SnsAction(topic));
      });
    }

    this.previousStage = stage;
    return this;
  }

  addRule(props: AddRuleProps): DataPipeline {
    this.rules.push(
      props.overrideRule
        ? props.overrideRule
        : props.schedule
        ? new events.Rule(this, props.id!, {
            schedule: props.schedule,
            targets: props.eventTargets,
            ruleName: props.ruleName,
          })
        : new events.Rule(this, props.id!, {
            eventPattern: props.eventPattern,
            targets: props.eventTargets,
            ruleName: props.ruleName,
          }),
    );

    return this;
  }

  addNotifications(notificationsTopic?: sns.ITopic): DataPipeline {
    this.notificationsTopic = notificationsTopic ?? new sns.Topic(this, "Notifications");
    return this;
  }
}
