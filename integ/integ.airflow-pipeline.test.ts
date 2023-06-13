import * as integration from "@aws-cdk/integ-tests-alpha";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { RequireApproval } from "aws-cdk-lib/cloud-assembly-schema";

import { AirflowDataPipeline } from "../src";

interface AirflowDataPipelineTestStackProps extends cdk.StackProps {}

class AirflowDataPipelineTestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AirflowDataPipelineTestStackProps) {
    super(scope, id, props);

    new AirflowDataPipeline(this, "airflow-pipeline", {
      vpcCidr: "10.55.0.0/16",
      name: "integ-test",
      maxWorkers: 5,
      dagFiles: ["./integ/dags/"],
    });
  }
}

const app = new cdk.App();
new integration.IntegTest(app, "Airflow Data Pipeline Stack Integration Tests", {
    testCases: [
      new AirflowDataPipelineTestStack(app, "AirflowDataPipeline", {}),
    ],
    diffAssets: true,
    stackUpdateWorkflow: true,
    cdkCommandOptions: {
      deploy: {
        args: {
          requireApproval: RequireApproval.NEVER,
          json: true,
        },
      },
      destroy: {
        args: {
          force: true,
        },
      },
    },
});
