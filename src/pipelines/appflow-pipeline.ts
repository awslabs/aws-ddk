import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as mwaa from "aws-cdk-lib/aws-mwaa";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

import { S3Factory } from "../core/s3-factory";

export interface AppflowPipelineProps {
  /**
   * An environment name that is prefixed to resource names
   */
  readonly environmentName?: string;
  /**
   * The maximum number of workers that can run in the environment
   */
  readonly maxWorkerNodes?: number;
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
}

export class AppflowDataPipeline extends Construct {
  readonly environmentName: string;
  readonly maxWorkerNodes: number;
  readonly dagProcessingLogs: string;
  readonly schedulerLogsLevel: string;
  readonly taskLogsLevel: string;
  readonly workerLogsLevel: string;
  readonly webserverLogsLevel: string;
  readonly vpc: ec2.IVpc;
  readonly s3Bucket: s3.IBucket;
  readonly mwaaEnvironment: mwaa.CfnEnvironment;

  constructor(scope: Construct, id: string, props: AppflowPipelineProps) {
    super(scope, id);

    this.environmentName = props.environmentName ?? "MWAAEnvironment";
    this.maxWorkerNodes = props.maxWorkerNodes ?? 2;
    this.dagProcessingLogs = props.dagProcessingLogs ?? "INFO";
    this.schedulerLogsLevel = props.schedulerLogsLevel ?? "INFO";
    this.taskLogsLevel = props.taskLogsLevel ?? "INFO";
    this.workerLogsLevel = props.workerLogsLevel ?? "INFO";
    this.webserverLogsLevel = props.webserverLogsLevel ?? "INFO";

    if (props.vpcId) {
      this.vpc = ec2.Vpc.fromLookup(scope, "VPC", { vpcId: props.vpcId });
    } else if (props.vpcCidr) {
      this.vpc = this.createVpc(scope, this.environmentName, props.vpcCidr);
    } else {
      throw new Error("One of 'vpcId' or 'vpcCidr' must be provided");
    }

    const securityGroup = new ec2.SecurityGroup(scope, `${props.environmentName} Security Group`, {
      securityGroupName: `${props.environmentName} Security Group`,
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
              `arn:aws:airflow:${cdk.Stack.of(scope).region}:${cdk.Stack.of(scope).account}:environment/${
                props.environmentName
              }`,
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
            conditions: [
              {
                StringLike: {
                  "kms:ViaService": [`sqs.${cdk.Stack.of(scope).region}.amazonaws.com`],
                },
              },
            ],
          }),
        ],
      }),
    );

    this.mwaaEnvironment = new mwaa.CfnEnvironment(this, "MWAA Environment", {
      name: `${props.environmentName}`,
      sourceBucketArn: this.s3Bucket.bucketArn,
      executionRoleArn: mwaaExecutionRole.roleArn,
      dagS3Path: "dags",
      networkConfiguration: {
        securityGroupIds: [securityGroup.securityGroupId],
        subnetIds: [this.vpc.privateSubnets.toString()],
      },
      webserverAccessMode: "PUBLIC_ONLY",
      maxWorkers: props.maxWorkerNodes,
      loggingConfiguration: {
        dagProcessingLogs: {
          enabled: true,
          logLevel: props.dagProcessingLogs,
        },
        schedulerLogs: {
          enabled: true,
          logLevel: props.schedulerLogsLevel,
        },
        taskLogs: {
          enabled: true,
          logLevel: props.taskLogsLevel,
        },
        webserverLogs: {
          enabled: true,
          logLevel: props.webserverLogsLevel,
        },
        workerLogs: {
          enabled: false,
          logLevel: props.workerLogsLevel,
        },
      },
    });
  }
  createVpc(scope: Construct, environmentName: string, vpcCidr: string): ec2.IVpc {
    const resourceName = `${environmentName}-MWAA`;
    const vpcCIDRMask = +vpcCidr.split("/");
    if (vpcCIDRMask > 20 || vpcCIDRMask < 16) {
      throw new Error("Vpc Cidr Range must of size >=16 and <=20");
    }
    const subnetCIDRMask = vpcCIDRMask + 8;
    const vpc = new ec2.Vpc(scope, "Vpc", {
      ipAddresses: ec2.IpAddresses.cidr(vpcCidr),
      enableDnsSupport: true,
      enableDnsHostnames: true,
      vpcName: resourceName,
      subnetConfiguration: [
        {
          name: "Public Subnet 1",
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: subnetCIDRMask,
        },
        {
          name: "Public Subnet 2",
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: subnetCIDRMask,
        },
        {
          name: "Private Subnet 1",
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: subnetCIDRMask,
        },
        {
          name: "Private Subnet 2",
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: subnetCIDRMask,
        },
      ],
    });

    return vpc;
  }
}
