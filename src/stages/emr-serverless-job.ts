import * as cdk from "aws-cdk-lib";
import { Duration } from "aws-cdk-lib";
import * as events from "aws-cdk-lib/aws-events";
import * as iam from "aws-cdk-lib/aws-iam";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import { StateMachineStage, StateMachineStageProps } from "../pipelines";
/**
 * Properties of the EMR Serverless Job stage.
 */
export interface EMRServerlessJobStageProps extends StateMachineStageProps {
  /**
   * EMR Serverless Application Id.
   */
  readonly applicationId: string;
  /**
   * EMR Execution Role Arn.
   */
  readonly executionRoleArn: string;
  /**
   * The job driver for the job run.
   * This is a Tagged Union structure.
   * Only one of the following top level
   * keys can be set: 'sparkSubmit', 'hive'
   */
  readonly jobDriver: { [key: string]: any };
  /**
   * Duration to wait between polling job status.
   * Defaults to 30 seconds.
   */
  readonly jobExecutionStatusCheckPeriod?: cdk.Duration;
  /**
   * Additional properties to pass to 'emrserverless:StartJobRun'.
   * https://docs.aws.amazon.com/emr-serverless/latest/APIReference/API_StartJobRun.html
   */
  readonly startJobRunProps?: { [key: string]: any };
}

/**
 * Stage that contains a step function that runs an EMR Job.
 */
export class EMRServerlessJobStage extends StateMachineStage {
  readonly targets?: events.IRuleTarget[];
  readonly eventPattern?: events.EventPattern;
  readonly stateMachine: sfn.StateMachine;

  /**
   * Constructs EMRServerlessJobStage.
   * @param scope Scope within which this construct is defined.
   * @param id Identifier of the stage.
   * @param props Properties for the stage.
   */
  constructor(scope: Construct, id: string, props: EMRServerlessJobStageProps) {
    super(scope, id, props);

    const stack = cdk.Stack.of(this);
    const emrApplicationArn = `arn:${stack.partition}:emr-serverless:${stack.region}:${stack.account}:/applications/${props.applicationId}`;
    const jobExecutionStatusWait = new sfn.Wait(this, "Wait Before Checking Job Status", {
      time: sfn.WaitTime.duration(props.jobExecutionStatusCheckPeriod ?? Duration.seconds(30)),
    });

    const runJobTask = new tasks.CallAwsService(this, "Start Job Run", {
      service: "emrserverless",
      action: "startJobRun",
      iamResources: [emrApplicationArn],
      parameters: {
        ApplicationId: props.applicationId,
        ExecutionRoleArn: props.executionRoleArn,
        JobDriver: props.jobDriver,
        ClientToken: Math.random().toString(36),
        ...props.startJobRunProps,
      },
    });

    const getJobTask = new tasks.CallAwsService(scope, "Get Job Status", {
      service: "emrserverless",
      action: "getJobRun",
      resultPath: "$.JobStatus",
      iamResources: [emrApplicationArn],
      parameters: {
        "ApplicationId.$": "$.ApplicationId",
        "JobRunId.$": "$.JobRunId",
      },
    });

    const successState = new sfn.Succeed(this, "Success State");
    const failState = new sfn.Fail(this, "Fail State");
    const retryChain = jobExecutionStatusWait.next(getJobTask);
    const jobStatusChoice = new sfn.Choice(scope, "Job Status Choice")
      .when(sfn.Condition.stringEquals("$.JobStatus.JobRun.State", "SUCCESS"), successState)
      .when(
        sfn.Condition.or(
          sfn.Condition.stringEquals("$.JobStatus.JobRun.State", "FAILED"),
          sfn.Condition.stringEquals("$.JobStatus.JobRun.State", "CANCELLED"),
        ),
        failState,
      )
      .otherwise(retryChain);

    const definition = runJobTask.next(getJobTask).next(jobStatusChoice);

    ({
      eventPattern: this.eventPattern,
      targets: this.targets,
      stateMachine: this.stateMachine,
    } = this.createStateMachine({ definition: definition, ...props }));
    this.stateMachine.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["emr-serverless:StartJobRun", "emr-serverless:GetJobRun"],
        resources: [emrApplicationArn, `${emrApplicationArn}/jobruns/*`],
      }),
    );
    this.stateMachine.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["iam:PassRole"],
        resources: [props.executionRoleArn],
      }),
    );
  }
}
