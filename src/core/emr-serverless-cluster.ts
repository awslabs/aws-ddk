import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as emr from "aws-cdk-lib/aws-emrserverless";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

import { S3Factory } from "./s3-factory";
import { overrideProps } from "./utils";

export interface EMRServerlessClusterProps extends emr.CfnApplicationProps {
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
   * Security Group
   */
  readonly securityGroup?: ec2.SecurityGroup;
  /**
   * Additional policy statements to add to the emr role
   */
  readonly additionalPolicyStatements?: iam.PolicyStatement[];
}

export class EMRServerlessCluster extends Construct {
  readonly vpc?: ec2.IVpc;
  readonly s3Bucket: s3.IBucket;
  readonly emrServerlessApplication: emr.CfnApplication;
  readonly securityGroup?: ec2.SecurityGroup;
  readonly networkConfiguration: emr.CfnApplication.NetworkConfigurationProperty;

  constructor(scope: Construct, id: string, props: EMRServerlessClusterProps) {
    super(scope, id);

    const name = props.name ?? "DDKEmrServerlessCluster";

    if (props.vpcId) {
      this.vpc = ec2.Vpc.fromLookup(scope, "VPC", { vpcId: props.vpcId });
    } else if (props.vpcCidr) {
      this.vpc = this.createVpc(scope, name, props.vpcCidr);
    } else {
      throw new Error("One of 'vpcId' or 'vpcCidr' must be provided");
    }

    if (this.vpc) {
      this.securityGroup =
        props.securityGroup ??
        new ec2.SecurityGroup(scope, "EMR Serverless Security Group", {
          securityGroupName: `EMR Serverless Security Group`,
          description: "Security group with a self-referencing inbound rule.",
          vpc: this.vpc,
        });
      this.securityGroup.addIngressRule(this.securityGroup, ec2.Port.allTraffic(), "Self referencing rule");
    }
    if (props.s3Bucket) {
      this.s3Bucket = props.s3Bucket;
    } else {
      this.s3Bucket = S3Factory.bucket(this, "EMR Serverless Cluster Bucket", {
        versioned: true,
      });
    }

    const emrServerlessRole = new iam.Role(scope, "EMR Serverless Cluster Role", {
      assumedBy: new iam.ServicePrincipal("emr-serverless.amazonaws.com"),
      path: "/service-role/",
    });
    emrServerlessRole.addManagedPolicy(
      new iam.ManagedPolicy(this, "MWAA Execution Policy", {
        statements: [
          new iam.PolicyStatement({
            actions: ["s3:GetObject*", "s3:ListBucket"],
            resources: ["arn:aws:s3:::*.elasticmapreduce", "arn:aws:s3:::*.elasticmapreduce/*"],
          }),
          new iam.PolicyStatement({
            actions: ["s3:DeleteObject", "s3:PutObject", "s3:GetObject*", "s3:GetBucket*", "s3:List*"],
            resources: [this.s3Bucket.bucketArn, `${this.s3Bucket.bucketArn}/*`],
          }),
          new iam.PolicyStatement({
            actions: [
              "glue:GetDatabase",
              "glue:CreateDatabase",
              "glue:GetDataBases",
              "glue:CreateTable",
              "glue:GetTable",
              "glue:UpdateTable",
              "glue:DeleteTable",
              "glue:GetTables",
              "glue:GetPartition",
              "glue:GetPartitions",
              "glue:CreatePartition",
              "glue:BatchCreatePartition",
              "glue:GetUserDefinedFunctions",
            ],
            resources: ["*"],
          }),
        ],
      }),
    );

    if (props.additionalPolicyStatements) {
      props.additionalPolicyStatements.forEach((statement) => {
        emrServerlessRole.addToPolicy(statement);
      });
    }

    if (!props.networkConfiguration && this.vpc && this.securityGroup) {
      this.networkConfiguration = {
        securityGroupIds: [this.securityGroup.securityGroupId],
        subnetIds: this.vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }).subnetIds,
      };
    } else {
      this.networkConfiguration = {};
    }

    const defaultProps: Partial<emr.CfnApplicationProps> = {
      networkConfiguration: this.networkConfiguration,
    };

    const mergedProps = overrideProps(defaultProps, props);

    this.emrServerlessApplication = new emr.CfnApplication(this, "DDK EMR Serverless Application", {
      ...mergedProps,
    });
  }
  createVpc(scope: Construct, resourceName: string, vpcCidr: string): ec2.IVpc {
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
