import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";

import { MWAAEnvironment } from "../src";

test("MWAAEnvironment Basic", () => {
  const stack = new cdk.Stack();

  new MWAAEnvironment(stack, "MWAA-environment", {
    name: "MWAAEnvironment",
    vpcCidr: "10.44.0.0/16",
  });
  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::MWAA::Environment", {
    Name: "MWAAEnvironment",
    NetworkConfiguration: {
      SecurityGroupIds: Match.anyValue(),
      SubnetIds: [Match.anyValue(), Match.anyValue()],
    },
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

test("MWAAEnvironment Existing Vpc & Bucket", () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "dummy-stack", {
    env: {
      account: "123456789012",
      region: "us-east-1",
    },
  });
  new MWAAEnvironment(stack, "MWAA-pipeline", {
    name: "MWAAEnvironment",
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
    new MWAAEnvironment(stack, "Stage", { name: "MWAAEnvironment" });
  }).toThrowError("One of 'vpcId' or 'vpcCidr' must be provided");
});

test("Invalid Vpc Cidr: Too Large", () => {
  const stack = new cdk.Stack();
  expect(() => {
    new MWAAEnvironment(stack, "Stage", {
      name: "MWAAEnvironment",
      vpcCidr: "10.0.0.0/15",
    });
  }).toThrowError("Vpc Cidr Range must of size >=16 and <=20");
});

test("Invalid Vpc Cidr: Too Small", () => {
  const stack = new cdk.Stack();
  expect(() => {
    new MWAAEnvironment(stack, "Stage", {
      name: "MWAAEnvironment",
      vpcCidr: "10.0.0.0/21",
    });
  }).toThrowError("Vpc Cidr Range must of size >=16 and <=20");
});

test("Plugin Path not specified", () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "dummy-stack", {
    env: {
      account: "123456789012",
      region: "us-east-1",
    },
  });
  expect(() => {
    new MWAAEnvironment(stack, "Stage", {
      name: "MWAAEnvironment",
      vpcId: "vpc-xxxxxx",
      pluginFile: "./test/mwaa/plugins/plugins.zip",
    });
  }).toThrowError("'pluginsS3Path' must be specified if a 'pluginFile' is specified.");
});

test("Requirements Path not specified", () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "dummy-stack", {
    env: {
      account: "123456789012",
      region: "us-east-1",
    },
  });
  expect(() => {
    new MWAAEnvironment(stack, "Stage", {
      name: "MWAAEnvironment",
      vpcId: "vpc-xxxxxx",
      requirementsFile: "./test/mwaa/requirements.txt",
    });
  }).toThrowError("'requirementsS3Path' must be specified if a 'requirementsFile' is specified.");
});

test("MWAAEnvironment All Settings", () => {
  const stack = new cdk.Stack();

  new MWAAEnvironment(stack, "MWAA-pipeline", {
    vpcCidr: "10.44.0.0/16",
    name: "my-environment",
    maxWorkers: 5,
    dagProcessingLogs: "ERROR",
    schedulerLogsLevel: "ERROR",
    taskLogsLevel: "ERROR",
    workerLogsLevel: "ERROR",
    webserverLogsLevel: "ERROR",
    dagS3Path: "foobar",
    dagFiles: ["./test/mwaa/dags/"],
    pluginFile: "./test/mwaa/plugins/plugins.zip",
    pluginsS3Path: "plugins/plugins.zip",
    requirementsFile: "./test/mwaa/requirements.txt",
    requirementsS3Path: "requirements.txt",
    additionalPolicyStatements: [
      new iam.PolicyStatement({
        actions: ["MWAA:CreateCliToken"],
        resources: ["*"],
      }),
    ],
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::MWAA::Environment", {
    DagS3Path: "foobar",
  });
  template.hasResourceProperties("AWS::IAM::Role", {});
  template.hasResourceProperties("AWS::S3::Bucket", {});
  template.hasResourceProperties("AWS::EC2::VPC", {});
});

test("Multiple MWAAEnvironment", () => {
  const stack = new cdk.Stack();

  new MWAAEnvironment(stack, "First MWAA-environment", {
    name: "First MWAAEnvironment",
    vpcCidr: "10.44.0.0/16",
  });

  new MWAAEnvironment(stack, "Second MWAA-environment", {
    name: "Second MWAAEnvironment",
    vpcCidr: "10.45.0.0/16",
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::MWAA::Environment", {
    Name: "First MWAAEnvironment",
    NetworkConfiguration: {
      SecurityGroupIds: Match.anyValue(),
      SubnetIds: [Match.anyValue(), Match.anyValue()],
    },
  });

  template.hasResourceProperties("AWS::MWAA::Environment", {
    Name: "Second MWAAEnvironment",
    NetworkConfiguration: {
      SecurityGroupIds: Match.anyValue(),
      SubnetIds: [Match.anyValue(), Match.anyValue()],
    },
  });

  template.resourceCountIs("AWS::IAM::Role", 2);
  template.hasResourceProperties("AWS::S3::Bucket", {});
  template.hasResourceProperties("AWS::EC2::VPC", {
    CidrBlock: "10.44.0.0/16",
  });
  template.resourceCountIs("AWS::EC2::Subnet", 8);
  template.resourceCountIs("AWS::EC2::NatGateway", 4);
  template.resourceCountIs("AWS::EC2::Route", 8);
  template.resourceCountIs("AWS::EC2::InternetGateway", 2);
  template.resourceCountIs("AWS::EC2::VPCGatewayAttachment", 2);
});
