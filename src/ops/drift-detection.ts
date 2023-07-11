import { Duration, Stack } from 'aws-cdk-lib';
import { Alarm, ComparisonOperator, CreateAlarmOptions, Metric, TreatMissingData, Unit } from 'aws-cdk-lib/aws-cloudwatch';
import * as events from 'aws-cdk-lib/aws-events';
import * as eventsTargets from 'aws-cdk-lib/aws-events-targets';
import { Effect, ManagedPolicy, Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { DetectDriftFunction } from './detect-drift-function';


export interface DriftDetectionProps {

  /**
   * List of stack to monitor for CloudFormation drifts
   * Either stacks or stackNames are required (though not both)
   */
  readonly stacks?: Stack[];

  /**
   * List of stack names to monitor for CloudFormation drifts.
   * Either stacks or stackNames are required (though not both)
   */
  readonly stackNames?: string[];

  /**
   * Run drift detection every X duration.
   *
   * @default Duration.hours(1)
   */
  readonly runEvery?: Duration;

  /**
   * Namespace of published metric
   *
   * @default 'DriftDetection'
   */
  readonly metricNamespace?: string;

  /**
   * Options to create alarm
   *
   * @default alarm on 1 drifted stacks or more, for 3 data points, for
   */
  readonly alarmOptions?: CreateAlarmOptions;

}

export class DriftDetection extends Construct {

  public readonly alarm: Alarm;

  constructor(scope: Construct, id: string, props: DriftDetectionProps = {}) {
    super(scope, id);

    if ((props.stacks !== undefined && props.stacks.length > 0) && (props.stackNames !== undefined && props.stackNames.length > 0)) {
      throw new Error('Must have either stacks or stackNames, not both');
    }
    const supportedDuration = [1, 3, 6, 12, 24];
    if (props.runEvery !== undefined && !supportedDuration.includes(props.runEvery.toHours({ integral: false }))) {
      throw new Error('runEvery must be either 1, 3, 6, 12 or 24 hours');
    }

    const stacks = props.stacks?.map(stack => stack.stackName) ?? props.stackNames;
    const metricNamespace = props.metricNamespace ?? 'DriftDetection';
    const detectDriftLambda = new DetectDriftFunction(this, 'DetectDriftLambda', {
      environment: {
        metricNamespace: metricNamespace,
        ... stacks ? { stackNames: stacks.join(',') } : {},
      },
      timeout: Duration.minutes(5),
    });

    const runEvery = props.runEvery ?? Duration.hours(1);
    new events.Rule(this, 'DetectDriftRule', {
      targets: [new eventsTargets.LambdaFunction(detectDriftLambda)],
      schedule: events.Schedule.rate(runEvery),
      enabled: true,
    });

    const alarmOptions = props.alarmOptions ?? {
      alarmName: 'DriftDetected',
      threshold: 0,
      evaluationPeriods: 1,
      treatMissingData: TreatMissingData.IGNORE,
      comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
    };

    this.alarm = new Alarm(this, 'DriftAlarm', {
      metric: new Metric({
        metricName: 'DriftedStacks',
        namespace: metricNamespace,
        period: this.getClosestCloudWatchMetricPeriod(runEvery),
        statistic: "avg",
        unit: Unit.COUNT,
      }),
      ...alarmOptions,
    });

    const lambdaHandlerPolicy = new Policy(this, 'LambdaHandlerPolicy', {
      policyName: 'DetectDriftLambdaPolicy',
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            'cloudformation:ListStackResources',
            'cloudformation:DescribeStackDriftDetectionStatus',
            'cloudformation:DetectStackDrift',
            'cloudformation:DetectStackResourceDrift',
            'cloudwatch:PutMetricData',
          ],
          resources: ['*'],
        }),
      ],
    });
    const readOnlyAccessPolicy = ManagedPolicy.fromAwsManagedPolicyName('ReadOnlyAccess');
    detectDriftLambda.role!.attachInlinePolicy(lambdaHandlerPolicy);
    detectDriftLambda.role!.addManagedPolicy(readOnlyAccessPolicy);
  }

  /**
   * CloudWatch supported period values are: 1 hour, 6 hours, 1 day, 7 days, 30 days.
   * Other durations will transform to one of the supported period values
   *
   * @return Duration - the closest CloudWatch period.
   */
  private getClosestCloudWatchMetricPeriod(duration: Duration) {
    const timeConversionOptions = { integral: false };
    let durationInHours = duration.toHours(timeConversionOptions);

    if ([1, 6, 24].includes(durationInHours)) {
      return duration;
    } else if (durationInHours === 3) {
      return Duration.hours(6);
    } else if (durationInHours === 12) {
      return Duration.hours(24);
    } else {
      throw Error('Unexpected duration');
    }
  }

}