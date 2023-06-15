import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as mwaa from "aws-cdk-lib/aws-mwaa";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

import { S3Factory } from "./s3-factory";

export interface AirflowPipelineProps extends mwaa.CfnEnvironmentProps {
  /**
   * Log level for DagProcessing
   */
  readonly dagProcessingLogs?: string;
  /**
   * Log level for SchedulerLogs
   */
  readonly schedulerLogsLevel?: string;
  /**
   * Log level for TaskLogs
   */
  readonly taskLogsLevel?: string;
  /**
   * Log level for WorkerLogs
   */
  readonly workerLogsLevel?: string;
  /**
   * Log level for WebserverLogs
   */
  readonly webserverLogsLevel?: string;
  /**
   * Existing vpc id
   */
  readonly vpcId?: string;
  /**
   * The IP range (CIDR notation) for this VPC
   */
  readonly vpcCidr?: string;
  /**
   * S3 Bucket
   */
  readonly s3Bucket?: s3.IBucket;
  /**
   * File(s) to be uploaded to dags location in s3 bucket.
   */
  readonly dagFiles?: string[];
  /**
   * Requirements file to be uploaded to plugin path in S3. 'requirementsS3Path' must be specified as well.
   */
  readonly requirementsFile?: string;
  /**
   * Plugin file to be uploaded to plugin path in S3. 'pluginsS3Path' must be specified as well.
   */
  readonly pluginFile?: string;
  /**
   * Additional policy statements to add to the airflow execution role
   */
  readonly additionalPolicyStatements?: iam.PolicyStatement[];
}

export class AirflowDataPipeline extends Construct {
  readonly dagProcessingLogs: string;
  readonly schedulerLogsLevel: string;
  readonly taskLogsLevel: string;
  readonly workerLogsLevel: string;
  readonly webserverLogsLevel: string;
  readonly vpc: ec2.IVpc;
  readonly s3Bucket: s3.IBucket;
  readonly mwaaEnvironment: mwaa.CfnEnvironment;
  readonly dagS3Path: string;
  readonly pluginFile?: s3deploy.BucketDeployment;

  constructor(scope: Construct, id: string, props: AirflowPipelineProps) {
    super(scope, id);

    this.dagProcessingLogs = props.dagProcessingLogs ?? "INFO";
    this.schedulerLogsLevel = props.schedulerLogsLevel ?? "INFO";
    this.taskLogsLevel = props.taskLogsLevel ?? "INFO";
    this.workerLogsLevel = props.workerLogsLevel ?? "INFO";
    this.webserverLogsLevel = props.webserverLogsLevel ?? "INFO";
    this.dagS3Path = props.dagS3Path ?? "dags";

    if (props.vpcId) {
      this.vpc = ec2.Vpc.fromLookup(scope, "VPC", { vpcId: props.vpcId });
    } else if (props.vpcCidr) {
      this.vpc = this.createVpc(scope, props.name, props.vpcCidr);
    } else {
      throw new Error("One of 'vpcId' or 'vpcCidr' must be provided");
    }

    const securityGroup = new ec2.SecurityGroup(scope, `${props.name} Security Group`, {
      securityGroupName: `${props.name} Security Group`,
      description: "Security group with a self-referencing inbound rule.",
      vpc: this.vpc,
    });
    securityGroup.addIngressRule(securityGroup, ec2.Port.allTraffic(), "Self referencing rule");

    if (props.s3Bucket) {
      this.s3Bucket = props.s3Bucket;
    } else {
      this.s3Bucket = S3Factory.bucket(this, "Environment Bucket", {
        versioned: true,
      });
    }

    if (props.dagFiles) {
      var sources: s3deploy.ISource[] = [];
      props.dagFiles.forEach((location) => {
        sources.push(s3deploy.Source.asset(location));
      });
      new s3deploy.BucketDeployment(this, "Deploy Dag Files", {
        sources: sources,
        destinationBucket: this.s3Bucket,
        destinationKeyPrefix: this.dagS3Path,
      });
    }

    if (props.pluginFile) {
      if (props.pluginsS3Path) {
        this.pluginFile = new s3deploy.BucketDeployment(this, "Deploy Plugin File", {
          sources: [s3deploy.Source.asset(props.pluginFile)],
          destinationBucket: this.s3Bucket,
          destinationKeyPrefix: props.pluginsS3Path,
        });
      } else {
        throw new Error("'pluginsS3Path' must be specified if a 'pluginFile' is specified.");
      }
    }

    if (props.requirementsFile) {
      if (props.requirementsS3Path) {
        this.pluginFile = new s3deploy.BucketDeployment(this, "Deploy Requirements File", {
          sources: [
            s3deploy.Source.asset(props.requirementsFile.split("/").slice(0, -1).join("/"), {
              exclude: ["**", `!${props.requirementsFile.split("/")[-1]}`],
            }),
          ],
          destinationBucket: this.s3Bucket,
          destinationKeyPrefix: props.requirementsS3Path,
        });
      } else {
        throw new Error("'requirementsS3Path' must be specified if a 'requirementsFile' is specified.");
      }
    }

    const mwaaExecutionRole = new iam.Role(scope, "MWAA Execution Role", {
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal("airflow.amazonaws.com"),
        new iam.ServicePrincipal("airflow-env.amazonaws.com"),
      ),
      path: "/service-role/",
    });
    mwaaExecutionRole.addManagedPolicy(
      new iam.ManagedPolicy(this, "MWAA Execution Policy", {
        statements: [
          new iam.PolicyStatement({
            actions: ["airflow:PublishMetrics"],
            resources: [
              `arn:aws:airflow:${cdk.Stack.of(scope).region}:${cdk.Stack.of(scope).account}:environment/${props.name}`,
            ],
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.DENY,
            actions: ["s3:ListAllMyBuckets"],
            resources: [this.s3Bucket.bucketArn, `${this.s3Bucket.bucketArn}/*`],
          }),
          new iam.PolicyStatement({
            actions: ["s3:GetObject*", "s3:GetBucket*", "s3:List*"],
            resources: [this.s3Bucket.bucketArn, `${this.s3Bucket.bucketArn}/*`],
          }),
          new iam.PolicyStatement({
            actions: ["logs:DescribeLogGroups"],
            resources: ["*"],
          }),
          new iam.PolicyStatement({
            actions: [
              "logs:CreateLogStream",
              "logs:CreateLogGroup",
              "logs:PutLogEvents",
              "logs:GetLogEvents",
              "logs:GetLogRecord",
              "logs:GetLogGroupFields",
              "logs:GetQueryResults",
              "logs:DescribeLogGroups",
            ],
            resources: [
              `arn:aws:logs:${cdk.Stack.of(scope).region}:${cdk.Stack.of(scope).account}:log-group:airflow-${
                cdk.Stack.of(scope).stackName
              }*`,
            ],
          }),
          new iam.PolicyStatement({
            actions: ["cloudwatch:PutMetricData"],
            resources: ["*"],
          }),
          new iam.PolicyStatement({
            actions: [
              "sqs:ChangeMessageVisibility",
              "sqs:DeleteMessage",
              "sqs:GetQueueAttributes",
              "sqs:GetQueueUrl",
              "sqs:ReceiveMessage",
              "sqs:SendMessage",
            ],
            resources: [`arn:aws:sqs:${cdk.Stack.of(scope).region}:*:airflow-celery-*`],
          }),
          new iam.PolicyStatement({
            actions: ["kms:Decrypt", "kms:DescribeKey", "kms:GenerateDataKey*", "kms:Encrypt"],
            notResources: [`arn:aws:kms:*:${cdk.Stack.of(scope).account}:key/*`],
            conditions: {
              StringLike: {
                "kms:ViaService": [`sqs.${cdk.Stack.of(scope).region}.amazonaws.com`],
              },
            },
          }),
        ],
      }),
    );

    if (props.additionalPolicyStatements) {
      props.additionalPolicyStatements.forEach((statement) => {
        mwaaExecutionRole.addToPolicy(statement);
      });
    }

    this.mwaaEnvironment = new mwaa.CfnEnvironment(this, "MWAA Environment", {
      sourceBucketArn: this.s3Bucket.bucketArn,
      executionRoleArn: mwaaExecutionRole.roleArn,
      dagS3Path: this.dagS3Path,
      networkConfiguration: {
        securityGroupIds: [securityGroup.securityGroupId],
        subnetIds: this.vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }).subnetIds,
      },
      webserverAccessMode: "PUBLIC_ONLY",
      loggingConfiguration: {
        dagProcessingLogs: {
          enabled: true,
          logLevel: this.dagProcessingLogs,
        },
        schedulerLogs: {
          enabled: true,
          logLevel: this.schedulerLogsLevel,
        },
        taskLogs: {
          enabled: true,
          logLevel: this.taskLogsLevel,
        },
        webserverLogs: {
          enabled: true,
          logLevel: this.webserverLogsLevel,
        },
        workerLogs: {
          enabled: false,
          logLevel: this.workerLogsLevel,
        },
      },
      ...props,
    });
  }
  createVpc(scope: Construct, environmentName: string, vpcCidr: string): ec2.IVpc {
    const resourceName = `${environmentName}-MWAA`;
    const vpcCIDRMask = +vpcCidr.split("/")[1];
    if (vpcCIDRMask > 20 || vpcCIDRMask < 16) {
      throw new Error("Vpc Cidr Range must of size >=16 and <=20");
    }
    const subnetCIDRMask = vpcCIDRMask + 4;
    const vpc = new ec2.Vpc(scope, "Vpc", {
      ipAddresses: ec2.IpAddresses.cidr(vpcCidr),
      enableDnsSupport: true,
      enableDnsHostnames: true,
      vpcName: resourceName,
      subnetConfiguration: [
        {
          name: "Public",
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: subnetCIDRMask,
        },
        {
          name: "Private",
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: subnetCIDRMask,
        },
      ],
    });

    return vpc;
  }
}
