import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as events from 'aws-cdk-lib/aws-events';
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
