import * as cdk from "aws-cdk-lib";
import * as databrew from "aws-cdk-lib/aws-databrew";
import * as events from "aws-cdk-lib/aws-events";
import * as iam from "aws-cdk-lib/aws-iam";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";

import { StateMachineStage, StateMachineStageProps } from "../pipelines/stage";

/**
 * Properties for `DataBrewTransformStage`.
 */
export interface DataBrewTransformStageProps extends StateMachineStageProps {
  /**
   * The name of a preexisting DataBrew job to run. If None, a DataBrew job is created.
   */
  readonly jobName?: string;
  /**
   * The Arn of the job execution role. Required if job_name is None.
   */
  readonly jobRoleArn?: string;
  /**
   * The type of job to run.  Required if job_name is None.
   */
  readonly jobType?: string;
  /**
   * The name of the dataset to use for the job.
   */
  readonly datasetName?: string;
  /**
   * Whether to create the DataBrew job or not.
   */
  readonly createJob?: boolean;
  /**
   * One or more artifacts that represent the AWS Glue Data Catalog output from running the job.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-datacatalogoutputs
   */
  readonly dataCatalogOutputs?: databrew.CfnJob.DataCatalogOutputProperty[];
  /**
   * Represents a list of JDBC database output objects which defines the output destination for a DataBrew recipe job to write into.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-databaseoutputs
   */
  readonly databaseOutputs?: databrew.CfnJob.DatabaseOutputProperty[];
  /**
   * The Amazon Resource Name (ARN) of an encryption key that is used to protect the job output. For more information, see [Encrypting data written by DataBrew jobs](https://docs.aws.amazon.com/databrew/latest/dg/encryption-security-configuration.html)
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-encryptionkeyarn
   */
  readonly encryptionKeyArn?: string;
  /**
   * The encryption mode for the job, which can be one of the following:
   *
   * - `SSE-KMS` - Server-side encryption with keys managed by AWS KMS .
   * - `SSE-S3` - Server-side encryption with keys managed by Amazon S3.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-encryptionmode
   */
  readonly encryptionMode?: string;
  /**
   * A sample configuration for profile jobs only, which determines the number of rows on which the profile job is run. If a `JobSample` value isn't provided, the default value is used. The default value is CUSTOM_ROWS for the mode parameter and 20,000 for the size parameter.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-jobsample
   */
  readonly jobSample?: databrew.CfnJob.JobSampleProperty;
  /**
   * The current status of Amazon CloudWatch logging for the job.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-logsubscription
   */
  readonly logSubscription?: string;
  /**
   * The maximum number of nodes that can be consumed when the job processes data.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-maxcapacity
   */
  readonly maxCapacity?: number;
  /**
   * The maximum number of times to retry the job after a job run fails.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-maxretries
   */
  readonly maxRetries?: number;
  /**
   * `AWS::DataBrew::Job.OutputLocation`
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-outputlocation
   */
  readonly outputLocation?: databrew.CfnJob.OutputLocationProperty;
  /**
   * The output properties for the job.
   */
  readonly outputs?: databrew.CfnJob.OutputProperty[];
  /**
   * Configuration for profile jobs. Configuration can be used to select columns, do evaluations, and override default parameters of evaluations. When configuration is undefined, the profile job will apply default settings to all supported columns.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-profileconfiguration
   */
  readonly profileConfiguration?: databrew.CfnJob.ProfileConfigurationProperty;
  /**
   * The name of the project that the job is associated with.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-projectname
   */
  readonly projectName?: string;
  /**
   * The recipe to be used by the DataBrew job which is a series of data transformation steps.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-recipe
   */
  readonly recipe?: databrew.CfnJob.RecipeProperty;
  /**
   * Metadata tags that have been applied to the job.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-tags
   */
  readonly tags?: cdk.CfnTag[];
  /**
   * The job's timeout in minutes. A job that attempts to run longer than this timeout period ends with a status of `TIMEOUT` .
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-timeout
   */
  readonly timeout?: number;
  /**
   * List of validation configurations that are applied to the profile job.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-validationconfigurations
   */
  readonly validationConfigurations?: databrew.CfnJob.ValidationConfigurationProperty[];
}

/**
 * Stage that contains a step function that runs DataBrew job.
 */
export class DataBrewTransformStage extends StateMachineStage {
  readonly targets?: events.IRuleTarget[];
  readonly eventPattern?: events.EventPattern;
  readonly stateMachine: sfn.StateMachine;
  readonly job?: databrew.CfnJob;
  readonly jobName: string;
  readonly createJob: boolean;

  /**
   * Constructs `DataBrewTransformStage`.
   * @param scope Scope within which this construct is defined.
   * @param id Identifier of the stage.
   * @param props Properties for the stage.
   */
  constructor(scope: Construct, id: string, props: DataBrewTransformStageProps) {
    super(scope, id, props);

    this.jobName = props.jobName ? props.jobName : `${id}-job`;
    this.createJob = props.jobName && !props.createJob ? false : true;

    if (this.createJob) {
      if (!props.jobType) {
        throw new Error("if 'jobType' is a required property when creating a new DataBrew job");
      }
      this.job = new databrew.CfnJob(this, "DataBrew Job", {
        name: this.jobName,
        roleArn: props.jobRoleArn ? props.jobRoleArn : this.createDefaultDataBrewJobRole().roleArn,
        type: props.jobType,
        datasetName: props.datasetName,
        dataCatalogOutputs: props.dataCatalogOutputs,
        databaseOutputs: props.databaseOutputs,
        encryptionKeyArn: props.encryptionKeyArn,
        encryptionMode: props.encryptionMode,
        jobSample: props.jobSample,
        logSubscription: props.logSubscription,
        maxCapacity: props.maxCapacity,
        maxRetries: props.maxRetries,
        outputLocation: props.outputLocation,
        outputs: props.outputs,
        profileConfiguration: props.profileConfiguration,
        projectName: props.projectName,
        recipe: props.recipe,
        tags: props.tags,
        timeout: props.timeout,
        validationConfigurations: props.validationConfigurations,
      });
    }
    const startJobRun = new tasks.GlueDataBrewStartJobRun(this, "Start DataBrew Job", {
      name: this.job ? this.job.name : this.jobName,
      integrationPattern: sfn.IntegrationPattern.RUN_JOB,
    });

    const definition = startJobRun.next(new sfn.Succeed(this, "success"));

    ({
      eventPattern: this.eventPattern,
      targets: this.targets,
      stateMachine: this.stateMachine,
    } = this.createStateMachine(definition, props));
  }

  private createDefaultDataBrewJobRole(): iam.Role {
    return new iam.Role(this, "DataBrew Job Role", {
      assumedBy: new iam.ServicePrincipal("databrew.amazonaws.com"),
      description: "Default DataBrew Job Role created by the AWS DDK",
      managedPolicies: [
        iam.ManagedPolicy.fromManagedPolicyName(
          this,
          "DataBrew Service Role Policy",
          "service-role/AWSGlueDataBrewServiceRole",
        ),
      ],
    });
  }
}
