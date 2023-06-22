import * as integration from "@aws-cdk/integ-tests-alpha";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { RequireApproval } from "aws-cdk-lib/cloud-assembly-schema";

import { MWAAEnvironment } from "../src";

interface MWAAEnvironmentTestStackProps extends cdk.StackProps {}

class MWAAEnvironmentTestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MWAAEnvironmentTestStackProps) {
    super(scope, id, props);

    new MWAAEnvironment(this, "airflow-pipeline", {
      vpcCidr: "10.55.0.0/16",
      name: "integ-test",
      maxWorkers: 5,
      dagFiles: ["./dags/"],
    });
  }
}

const app = new cdk.App();
new integration.IntegTest(app, "Airflow Environment Stack Integration Tests", {
    testCases: [
      new MWAAEnvironmentTestStack(app, "AirflowEnvironment", {}),
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
