import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import * as s3 from "aws-cdk-lib/aws-s3";

import { EMRServerlessCluster } from "../src";

test("EMR Serverless Cluster Existing Vpc & Bucket", () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "dummy-stack", {
    env: {
      account: "123456789012",
      region: "us-east-1",
    },
  });
  new EMRServerlessCluster(stack, "MWAA-pipeline", {
    releaseLabel: "emr-6.11.0",
    type: "SPARK",
    name: "MyEMRApp",
    vpcId: "vpc-01234567",
    s3Bucket: new s3.Bucket(stack, "my-dummy-bucket", {}),
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::EMRServerless::Application", {});
  template.hasResourceProperties("AWS::IAM::Role", {});
  template.resourceCountIs("AWS::EC2::VPC", 0);
});

test("EMR Serverless Cluster New Vpc & Bucket", () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "dummy-stack", {
    env: {
      account: "123456789012",
      region: "us-east-1",
    },
  });
  new EMRServerlessCluster(stack, "EMR App", {
    releaseLabel: "emr-6.11.0",
    type: "SPARK",
    name: "MyEMRApp",
    vpcCidr: "10.40.0.0/16",
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::EMRServerless::Application", {
    Name: "MyEMRApp",
    NetworkConfiguration: {
      SecurityGroupIds: Match.anyValue(),
      SubnetIds: [Match.anyValue(), Match.anyValue(), Match.anyValue()],
    },
  });
  template.hasResourceProperties("AWS::IAM::Role", {});
  template.resourceCountIs("AWS::EC2::VPC", 1);
  template.hasResourceProperties("AWS::EC2::VPC", {
    CidrBlock: "10.40.0.0/16",
  });
  template.resourceCountIs("AWS::EC2::Subnet", 6);
  template.resourceCountIs("AWS::EC2::NatGateway", 3);
  template.resourceCountIs("AWS::EC2::Route", 6);
  template.resourceCountIs("AWS::EC2::InternetGateway", 1);
  template.resourceCountIs("AWS::EC2::VPCGatewayAttachment", 1);
  template.resourceCountIs("AWS::S3::Bucket", 1);
});

test("Vpc Cidr or Id must be provided", () => {
  const stack = new cdk.Stack();
  expect(() => {
    new EMRServerlessCluster(stack, "Stage", { name: "EmrApp", releaseLabel: "emr-6.11.0", type: "SPARK" });
  }).toThrowError("One of 'vpcId' or 'vpcCidr' must be provided");
});

test("Invalid Vpc Cidr: Too Large", () => {
  const stack = new cdk.Stack();
  expect(() => {
    new EMRServerlessCluster(stack, "Stage", {
      name: "EmrApp",
      releaseLabel: "emr-6.11.0",
      type: "SPARK",
      vpcCidr: "10.0.0.0/15",
    });
  }).toThrowError("Vpc Cidr Range must of size >=16 and <=20");
});

test("Invalid Vpc Cidr: Too Small", () => {
  const stack = new cdk.Stack();
  expect(() => {
    new EMRServerlessCluster(stack, "Stage", {
      name: "EmrApp",
      releaseLabel: "emr-6.11.0",
      type: "SPARK",
      vpcCidr: "10.0.0.0/21",
    });
  }).toThrowError("Vpc Cidr Range must of size >=16 and <=20");
});
