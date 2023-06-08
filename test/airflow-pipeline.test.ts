import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";

import { AirflowDataPipeline } from "../src";

test("AirflowDataPipeline", () => {
  const stack = new cdk.Stack();

  new AirflowDataPipeline(stack, "airflow-pipeline", {
    vpcCidr: "10.44.0.0/16"
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::MWAA::Environment", {  
  });
  template.hasResourceProperties("AWS::IAM::Role", {
  });
  template.hasResourceProperties("AWS::S3::Bucket", {
  });
  template.hasResourceProperties("AWS::EC2::VPC", {
  });
}
);