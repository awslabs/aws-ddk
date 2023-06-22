import * as integration from "@aws-cdk/integ-tests-alpha";
import * as cdk from "aws-cdk-lib";
import { Duration } from "aws-cdk-lib";
import * as appflow from "aws-cdk-lib/aws-appflow";
import { Construct } from "constructs";
import { RequireApproval } from "aws-cdk-lib/cloud-assembly-schema";

import { AppFlowIngestionStage } from "../../src";
import { StateMachineStageProps } from "../../src/pipelines/stage";

interface AppFlowIngestionStageTestStackProps extends StateMachineStageProps {
  readonly flowName?: string;
  readonly flowExecutionStatusCheckPeriod?: Duration;
  readonly destinationFlowConfig?: appflow.CfnFlow.DestinationFlowConfigProperty;
  readonly sourceFlowConfig?: appflow.CfnFlow.SourceFlowConfigProperty;
  readonly flowTasks?: appflow.CfnFlow.TaskProperty[];
}

class AppFlowIngestionStageTestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AppFlowIngestionStageTestStackProps) {
    super(scope, id, props);

    new AppFlowIngestionStage(this, "Stage", {
      ...props,
    });
  }
}

const app = new cdk.App();
new integration.IntegTest(app, "Glue Transform Stage Integration Tests", {
    testCases: [
      new AppFlowIngestionStageTestStack(app, "AppflowIngestionTest", {
        flowName: "dummy-appflow-flow",
      }),
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
