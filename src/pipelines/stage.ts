import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as events from 'aws-cdk-lib/aws-events';
import { SfnStateMachine } from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import { IChainable } from 'aws-cdk-lib/aws-stepfunctions';
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
}

export interface StateMachineStageProps extends StageProps {
  readonly definition: IChainable;
  readonly stateMachineInput?: {};
  readonly additionalRolePolicyStatements?: iam.PolicyStatement[];
  readonly stateMachineFailedExecutionsAlarmThreshold?: number;
  readonly stateMachineFailedExecutionsAlarmEvaluationPeriods?: number;
}

export interface AlarmProps {
  readonly metric: cloudwatch.IMetric;
  readonly comparisonOperator?: cloudwatch.ComparisonOperator;
  readonly evaluationPeriods?: number;
  readonly threshold?: number;
}


export abstract class DataStage extends Stage {
  readonly cloudwatchAlarms: cloudwatch.Alarm[];

  constructor(scope: Construct, id: string, props: DataStageProps) {
    super(scope, id, props);

    this.cloudwatchAlarms = [];
  }

  addAlarm(id: string, props: AlarmProps): DataStage {
    this.cloudwatchAlarms.push(new cloudwatch.Alarm(this, id, {
      metric: props.metric,
      comparisonOperator: props.comparisonOperator ?? cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      threshold: props.threshold ?? 5,
      evaluationPeriods: props.evaluationPeriods ?? 1,
    }));
    return this;
  }
}

export class StateMachineStage extends DataStage {
  public stateMachine?: sfn.StateMachine;
  public stateMachineInput?: {};
  /*
  DataStage with helper methods to simplify StateMachine stages creation.
  */
  constructor(scope: Construct, id: string, props: StateMachineStageProps) {
    /*
    Create a stage.
    Parameters
    ----------
    scope : Construct
    Scope within which this construct is defined
    id : str
    Identifier of the stage
    name : Optional[str]
    Name of the stage
    description :  Optional[str]
    Description of the stage
    */
    super(scope, id, props);
    this.stateMachineInput = props.stateMachineInput;
    this.stateMachine = new sfn.StateMachine(this, id, {
      definition: props.definition
    });

    const eventSource = `${id}-event-source`;
    const eventDetailType = `${id}-event-type`;

    if (props.additionalRolePolicyStatements) {
      for (var statement, _pj_c = 0, _pj_a = props.additionalRolePolicyStatements, _pj_b = _pj_a.length; _pj_c < _pj_b; _pj_c += 1) {
        statement = _pj_a[_pj_c];

        this.stateMachine.addToRolePolicy(statement);
      }
    }

    this.addAlarm(`${id}-sm-failed-exec`, {
        metric: this.stateMachine.metricFailed(),
        threshold: props.stateMachineFailedExecutionsAlarmThreshold,
        evaluationPeriods: props.stateMachineFailedExecutionsAlarmEvaluationPeriods,
      }
    )
  
    this.eventPattern = {
        source: "aws.states",
        detailType: ["Step Functions Execution Status Change"],
        detail: {
          "status": ["SUCCEEDED"],
          "stateMachineArn": [this.stateMachine.stateMachineArn]
        }
    }
  }


  getTargets() {
    /*
    Get input targets of the stage.
    Targets are used by Event Rules to describe what should be invoked when a rule matches an event.
    Returns
    -------
    targets : Optional[List[IRuleTarget]]
    List of targets
    */
    return [new SfnStateMachine(this.stateMachine, {
      "input": events.RuleTargetInput.fromObject(this.stateMachineInput)
    })];
  }

}
