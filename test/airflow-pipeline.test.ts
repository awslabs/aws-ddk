import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as s3 from "aws-cdk-lib/aws-s3";

import { AirflowDataPipeline } from "../src";

test("AirflowDataPipeline Basic", () => {
  const stack = new cdk.Stack();

  new AirflowDataPipeline(stack, "airflow-pipeline", {
    vpcCidr: "10.44.0.0/16",
  });
  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::MWAA::Environment", {
    Name: "MWAAEnvironment",
    MaxWorkers: 2,
  });
  template.resourceCountIs("AWS::IAM::Role", 1);
  template.hasResourceProperties("AWS::S3::Bucket", {});
  template.hasResourceProperties("AWS::EC2::VPC", {
    CidrBlock: "10.44.0.0/16",
  });
  template.resourceCountIs("AWS::EC2::Subnet", 4);
  template.resourceCountIs("AWS::EC2::NatGateway", 2);
  template.resourceCountIs("AWS::EC2::Route", 4);
  template.resourceCountIs("AWS::EC2::InternetGateway", 1);
  template.resourceCountIs("AWS::EC2::VPCGatewayAttachment", 1);
});

test("AirflowDataPipeline Existing Vpc & Bucket", () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "dummy-stack", {
    env: {
      account: "123456789012",
      region: "us-east-1",
    },
  });
  new AirflowDataPipeline(stack, "airflow-pipeline", {
    vpcId: "vpc-01234567",
    s3Bucket: new s3.Bucket(stack, "my-dummy-bucket", {}),
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::MWAA::Environment", {});
  template.hasResourceProperties("AWS::IAM::Role", {});
  template.resourceCountIs("AWS::EC2::VPC", 0);
});

test("Vpc Cidr or Id must be provided", () => {
  const stack = new cdk.Stack();
  expect(() => {
    new AirflowDataPipeline(stack, "Stage", {});
  }).toThrowError("One of 'vpcId' or 'vpcCidr' must be provided");
});

test("Invalid Vpc Cidr: Too Large", () => {
  const stack = new cdk.Stack();
  expect(() => {
    new AirflowDataPipeline(stack, "Stage", {
      vpcCidr: "10.0.0.0/15",
    });
  }).toThrowError("Vpc Cidr Range must of size >=16 and <=20");
});

test("Invalid Vpc Cidr: Too Small", () => {
  const stack = new cdk.Stack();
  expect(() => {
    new AirflowDataPipeline(stack, "Stage", {
      vpcCidr: "10.0.0.0/21",
    });
  }).toThrowError("Vpc Cidr Range must of size >=16 and <=20");
});

test("AirflowDataPipeline All Settings", () => {
  const stack = new cdk.Stack();

  new AirflowDataPipeline(stack, "airflow-pipeline", {
    vpcCidr: "10.44.0.0/16",
    environmentName: "my-environment",
    maxWorkerNodes: 5,
    dagProcessingLogs: "ERROR",
    schedulerLogsLevel: "ERROR",
    taskLogsLevel: "ERROR",
    workerLogsLevel: "ERROR",
    webserverLogsLevel: "ERROR",
    dagS3Path: "foobar",
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::MWAA::Environment", {
    DagS3Path: "foobar",
  });
  template.hasResourceProperties("AWS::IAM::Role", {});
  template.hasResourceProperties("AWS::S3::Bucket", {});
  template.hasResourceProperties("AWS::EC2::VPC", {});
});
