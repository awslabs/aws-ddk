import * as cdk from "aws-cdk-lib";
import * as databrew from "aws-cdk-lib/aws-databrew";
import * as events from "aws-cdk-lib/aws-events";
import * as iam from "aws-cdk-lib/aws-iam";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";

import { StateMachineStage, StateMachineStageProps } from "../pipelines/stage";

export interface DataBrewTransformStageProps extends StateMachineStageProps {
  readonly jobName?: string;
  readonly jobRoleArn?: string;
  readonly jobType?: string;
  readonly datasetName?: string;
  readonly createJob?: boolean;
  readonly dataCatalogOutputs?: databrew.CfnJob.DataCatalogOutputProperty[];
  readonly databaseOutputs?: databrew.CfnJob.DatabaseOutputProperty[];
  readonly encryptionKeyArn?: string;
  readonly encryptionMode?: string;
  readonly jobSample?: databrew.CfnJob.JobSampleProperty;
  readonly logSubscription?: string;
  readonly maxCapacity?: number;
  readonly maxRetries?: number;
  readonly outputLocation?: databrew.CfnJob.OutputLocationProperty;
  readonly outputs?: databrew.CfnJob.OutputProperty[];
  readonly profileConfiguration?: databrew.CfnJob.ProfileConfigurationProperty;
  readonly projectName?: string;
  readonly recipe?: databrew.CfnJob.RecipeProperty;
  readonly tags?: cdk.CfnTag[];
  readonly timeout?: number;
  readonly validationConfigurations?: databrew.CfnJob.ValidationConfigurationProperty[];
}

export class DataBrewTransformStage extends StateMachineStage {
  readonly targets?: events.IRuleTarget[];
  readonly eventPattern?: events.EventPattern;
  readonly stateMachine: sfn.StateMachine;
  readonly job?: databrew.CfnJob;
  readonly jobName: string;
  readonly createJob: boolean;

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
