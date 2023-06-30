import * as cdk from "aws-cdk-lib";
import * as events from "aws-cdk-lib/aws-events";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";

import { StateMachineStage, StateMachineStageProps } from "../src";

class TestSFNStage extends StateMachineStage {
  readonly targets?: events.IRuleTarget[];
  readonly eventPattern?: events.EventPattern;
  readonly stateMachine: sfn.StateMachine;

  constructor(scope: Construct, id: string, props: StateMachineStageProps) {
    super(scope, id, props);
    ({
      eventPattern: this.eventPattern,
      targets: this.targets,
      stateMachine: this.stateMachine,
    } = this.createStateMachine({
      definition: props.definition,
      definitionFile: props.definitionFile,
      ...props,
    }));
  }
}

test("State Machine Stage Definition File", () => {
  const stack = new cdk.Stack();
  new TestSFNStage(stack, "MySFN", {
    definitionFile: "./test/test-sfn-config.json",
  });
});

test("State Machine Stage Definition String", () => {
  const stack = new cdk.Stack();
  new TestSFNStage(stack, "MySFN", {
    definition: '{"StartAt":"Pass","States":{"Pass":{"Type":"Pass","End":true}}}',
  });
});

test("SFN No Definition", () => {
  const stack = new cdk.Stack();
  expect(() => {
    new TestSFNStage(stack, "MySFN", {});
  }).toThrowError("One of 'definition' or 'definitionFile' must be provided.");
});

test("SFN Redundant Definitions", () => {
  const stack = new cdk.Stack();
  expect(() => {
    new TestSFNStage(stack, "MySFN", {
      definition: '{"StartAt":"Pass","States":{"Pass":{"Type":"Pass","End":true}}}',
      definitionFile: "./test/test-sfn-config.json",
    });
  }).toThrowError("Only one of 'definition' or 'definitionFile' should be provided.");
});
