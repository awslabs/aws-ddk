import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as events from 'aws-cdk-lib/aws-events';
import * as events_targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import { Construct } from 'constructs';

export interface StageProps {
  readonly name?: string;
  readonly description?: string;
}

export abstract class Stage extends Construct {
  public readonly name?: string;
  public readonly description?: string;

  abstract readonly targets?: events.IRuleTarget[];
  abstract readonly eventPattern?: events.EventPattern;

  constructor(scope: Construct, id: string, props: StageProps) {
    super(scope, id);

    this.name = props.name;
    this.description = props.description;
  }
}

export interface DataStageProps extends StageProps {
  readonly alarmsEnabled?: boolean;
}

export interface AlarmProps {
  readonly metric: cloudwatch.IMetric;
  readonly comparisonOperator?: cloudwatch.ComparisonOperator;
  readonly evaluationPeriods?: number;
  readonly threshold?: number;
}

export abstract class DataStage extends Stage {
  readonly cloudwatchAlarms: cloudwatch.Alarm[];
  readonly alarmsEnabled: boolean;

  constructor(scope: Construct, id: string, props: DataStageProps) {
    super(scope, id, props);

    this.alarmsEnabled = props.alarmsEnabled ?? true;
    this.cloudwatchAlarms = [];
  }

  addAlarm(id: string, props: AlarmProps): DataStage {
    if (this.alarmsEnabled) {
      this.cloudwatchAlarms.push(
        new cloudwatch.Alarm(this, id, {
          metric: props.metric,
          comparisonOperator: props.comparisonOperator ?? cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
          threshold: props.threshold ?? 5,
          evaluationPeriods: props.evaluationPeriods ?? 1,
        }),
      );
    }
    return this;
  }
}

export interface StateMachineStageProps extends StageProps {
  readonly stateMachineInput?: { [key: string]: any };
  readonly additionalRolePolicyStatements?: iam.PolicyStatement[];
  readonly stateMachineFailedExecutionsAlarmThreshold?: number;
  readonly stateMachineFailedExecutionsAlarmEvaluationPeriods?: number;
  readonly alarmsEnabled?: boolean;
}

export abstract class StateMachineStage extends DataStage {
  abstract readonly stateMachine: sfn.StateMachine;

  constructor(scope: Construct, id: string, props: StateMachineStageProps) {
    super(scope, id, props);
  }

  protected createStateMachine(
    definition: sfn.IChainable,
    props: StateMachineStageProps,
  ): [events.EventPattern, events.IRuleTarget[], sfn.StateMachine] {
    const stateMachine = new sfn.StateMachine(this, 'State Machine', {
      definition: definition,
    });

    if (props.additionalRolePolicyStatements) {
      props.additionalRolePolicyStatements.forEach((s) => {
        stateMachine.addToRolePolicy(s);
      });
    }

    this.addAlarm('State Machine Failure Alarm', {
      metric: stateMachine.metricFailed(),
      threshold: props.stateMachineFailedExecutionsAlarmThreshold,
      evaluationPeriods: props.stateMachineFailedExecutionsAlarmEvaluationPeriods,
    });

    const stateMachineInput = props.stateMachineInput ?? {};
    const eventPattern = {
      source: ['aws.states'],
      detailType: ['Step Functions Execution Status Change'],
      detail: {
        status: ['SUCCEEDED'],
        stateMachineArn: [stateMachine.stateMachineArn],
      },
    };
    const targets = [
      new events_targets.SfnStateMachine(stateMachine, {
        input: events.RuleTargetInput.fromObject(stateMachineInput),
      }),
    ];

    return [eventPattern, targets, stateMachine];
  }
}
export interface EventStageProps extends StageProps {}

export abstract class EventStage extends Stage {
  readonly targets?: events.IRuleTarget[];

  constructor(scope: Construct, id: string, props: EventStageProps) {
    super(scope, id, props);

    this.targets = undefined;
  }
}
