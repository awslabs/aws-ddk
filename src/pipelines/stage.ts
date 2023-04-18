import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as events from "aws-cdk-lib/aws-events";
import * as events_targets from "aws-cdk-lib/aws-events-targets";
import * as iam from "aws-cdk-lib/aws-iam";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";

/**
 * Properties for the base abstract stage.
 */
export interface StageProps {
  /**
   * Name of the stage.
   */
  readonly name?: string;
  /**
   * Description of the stage.
   */
  readonly description?: string;
}

/**
 * Abstract class representing a stage.
 */
export abstract class Stage extends Construct {
  /**
   * Name of the stage.
   */
  public readonly name?: string;
  /**
   * Description of the stage.
   */
  public readonly description?: string;

  /**
   * Input targets for the stage.
   *
   * Targets are used by Event Rules to describe what should be invoked when a rule matches an event.
   */
  abstract readonly targets?: events.IRuleTarget[];
  /**
   * Output event pattern of the stage.
   *
   * Event pattern describes the structure of output event(s) produced by this stage.
   * Event Rules use event patterns to select events and route them to targets.
   */
  abstract readonly eventPattern?: events.EventPattern;

  /**
   * Constructs the stage.
   * @param scope Scope within which this construct is defined.
   * @param id Identifier of the stage.
   * @param props Properties for the stage.
   */
  constructor(scope: Construct, id: string, props: StageProps) {
    super(scope, id);

    this.name = props.name;
    this.description = props.description;
  }
}

/**
 * Properties for the `DataStage`.
 */
export interface DataStageProps extends StageProps {
  /**
   * Enable/Disable all alarms in a DataStage.
   *
   * @default true
   */
  readonly alarmsEnabled?: boolean;
}

/**
 * Properties for the alarm being added to the DataStage.
 */
export interface AlarmProps {
  /**
   * Metric to use for creating the stage's CloudWatch Alarm.
   */
  readonly metric: cloudwatch.IMetric;
  /**
   * Comparison operator to use for alarm.
   *
   * @default GREATER_THAN_THRESHOLD
   */
  readonly comparisonOperator?: cloudwatch.ComparisonOperator;
  /**
   * The value against which the specified alarm statistic is compared.
   * @default 5
   */
  readonly evaluationPeriods?: number;
  /**
   * The number of periods over which data is compared to the specified threshold.
   * @default 1
   */
  readonly threshold?: number;
}

/**
 * Class that represents a data stage within a data pipeline.
 *
 * To create a DataStage, inherit from this class, add infrastructure required by the stage,
 * and implement `eventPatterns` and `targets` properties.
 *
 * @example
 * class MyStage extends DataStage:
 *   readonly queue: sqs.Queue;
 *
 *   constructor(scope: Construct, id: string, props: MyStageProps) {
 *      super(scope, id, props);
 *
 *      this.queue = sqs.Queue(this, "Queue");
 *
 *      this.eventPatterns = {
 *        detail_type: ["my-detail-type"],
 *      };
 *      this.targets = [new events_targets.SqsQueue(this.queue)];
 *   }
 */
export abstract class DataStage extends Stage {
  /**
   * List of CloudWatch Alarms linked to the stage.
   */
  readonly cloudwatchAlarms: cloudwatch.Alarm[];
  /**
   * Flag indicating whether the alarms are enabled for this stage.
   */
  readonly alarmsEnabled: boolean;

  /**
   * Constructs the stage.
   * @param scope Scope within which this construct is defined.
   * @param id Identifier of the stage.
   * @param props Properties for the stage.
   */
  constructor(scope: Construct, id: string, props: DataStageProps) {
    super(scope, id, props);

    this.alarmsEnabled = props.alarmsEnabled ?? true;
    this.cloudwatchAlarms = [];
  }

  /**
   * Add a CloudWatch alarm for the DataStage.
   * @param id Identifier of the CloudWatch Alarm.
   * @param props Properties for the alarm.
   * @returns this DataStage.
   */
  addAlarm(id: string, props: AlarmProps): DataStage {
    if (this.alarmsEnabled) {
      this.cloudwatchAlarms.push(
        new cloudwatch.Alarm(this, id, {
          metric: props.metric,
          comparisonOperator: props.comparisonOperator ?? cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
          threshold: props.threshold ?? 1,
          evaluationPeriods: props.evaluationPeriods ?? 1,
        }),
      );
    }
    return this;
  }
}

/**
 * Properties of a state machine stage.
 */
export interface StateMachineStageProps extends StageProps {
  /**
   * Input of the state machine.
   */
  readonly stateMachineInput?: { [key: string]: any };
  /**
   * Name of the state machine.
   */
  readonly stateMachineName?: string;
  /**
   * Additional IAM policy statements to add to the state machine role.
   */
  readonly additionalRolePolicyStatements?: iam.PolicyStatement[];
  /**
   * The number of failed state machine executions before triggering CW alarm.
   * @default 1
   */
  readonly stateMachineFailedExecutionsAlarmThreshold?: number;
  /**
   * The number of periods over which data is compared to the specified threshold.
   * @default 1
   */
  readonly stateMachineFailedExecutionsAlarmEvaluationPeriods?: number;
  /**
   * Enable/Disable all alarms in the stage.
   * @default true
   */
  readonly alarmsEnabled?: boolean;
}

export interface CreateStateMachineResult {
  readonly eventPattern: events.EventPattern;
  readonly targets: events.IRuleTarget[];
  readonly stateMachine: sfn.StateMachine;
}

/**
 * DataStage with helper methods to simplify StateMachine stages creation.
 */
export abstract class StateMachineStage extends DataStage {
  /**
   * State machine.
   */
  abstract readonly stateMachine: sfn.StateMachine;

  /**
   * Constructs state machine stage.
   * @param scope Scope within which this construct is defined.
   * @param id Identifier of the stage.
   * @param props Properties for the stage.
   */
  constructor(scope: Construct, id: string, props: StateMachineStageProps) {
    super(scope, id, props);
  }

  /**
   * Constructs a state machine from the definition.
   * @param definition Steps for the state machine.
   * @param props State machine stage properties.
   * @returns Dictionary with event pattern, targets and state machine construct.
   */
  protected createStateMachine(definition: sfn.IChainable, props: StateMachineStageProps): CreateStateMachineResult {
    const stateMachine = new sfn.StateMachine(this, "State Machine", {
      definition: definition,
      stateMachineName: props.stateMachineName,
    });

    if (props.additionalRolePolicyStatements) {
      props.additionalRolePolicyStatements.forEach((s) => {
        stateMachine.addToRolePolicy(s);
      });
    }

    this.addAlarm("State Machine Failure Alarm", {
      metric: stateMachine.metricFailed(),
      threshold: props.stateMachineFailedExecutionsAlarmThreshold,
      evaluationPeriods: props.stateMachineFailedExecutionsAlarmEvaluationPeriods,
    });

    const stateMachineInput = props.stateMachineInput;
    const eventPattern = {
      source: ["aws.states"],
      detailType: ["Step Functions Execution Status Change"],
      detail: {
        status: ["SUCCEEDED"],
        stateMachineArn: [stateMachine.stateMachineArn],
      },
    };
    const targets = [
      new events_targets.SfnStateMachine(stateMachine, {
        input: events.RuleTargetInput.fromObject(stateMachineInput),
      }),
    ];

    return {
      eventPattern,
      targets,
      stateMachine,
    };
  }
}

/**
 * Properties for the event stage.
 */
export interface EventStageProps extends StageProps {}

/**
 * Class that represents an event stage within a data pipeline.
 *
 * To create an EventStage, inherit from this class, add infrastructure required by the stage,
 * and implement the `eventPattern` property.
 *
 * The `targets` property will be set to null.
 *
 * @example
 * class MyStage extends EventStage:
 *   constructor(scope: Construct, id: string, props: MyStageProps) {
 *      super(scope, id, props);
 *
 *      this.eventPatterns = {
 *        source: ["aws.s3"],
 *        detail: props.detail,
 *        detail_type: props.detail_type,
 *      };
 *   }
 */
export abstract class EventStage extends Stage {
  readonly targets?: events.IRuleTarget[];

  /**
   * Constructs event stage.
   * @param scope Scope within which this construct is defined.
   * @param id Identifier of the stage.
   * @param props Properties for the stage.
   */
  constructor(scope: Construct, id: string, props: EventStageProps) {
    super(scope, id, props);

    this.targets = undefined;
  }
}
