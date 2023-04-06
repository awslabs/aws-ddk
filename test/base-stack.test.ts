import { assert } from "console";
import path from "path";
import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as lambda from "aws-cdk-lib/aws-lambda";

import { BaseStack, SqsToLambdaStage } from "../src";

test("Base Stack No Bootstrap Config", () => {
  const sampleConfig = {
    environments: {
      dev: {},
    },
  };
  const app = new cdk.App();
  const stack = new BaseStack(app, "my-stack", { config: sampleConfig });

  new SqsToLambdaStage(stack, "Stage", {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      memorySize: 512,
      runtime: lambda.Runtime.PYTHON_3_9,
    },
  });

  const expectedValues = {
    qualifier: "hnb659fds",
    bucketName: "cdk-hnb659fds-assets-${AWS::AccountId}-${AWS::Region}",
    repositoryName: "cdk-hnb659fds-container-assets-${AWS::AccountId}-${AWS::Region}",
    _deployRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-deploy-role-${AWS::AccountId}-${AWS::Region}",
    _cloudFormationExecutionRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-cfn-exec-role-${AWS::AccountId}-${AWS::Region}",
    fileAssetPublishingRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-file-publishing-role-${AWS::AccountId}-${AWS::Region}",
    imageAssetPublishingRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-image-publishing-role-${AWS::AccountId}-${AWS::Region}",
    lookupRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-lookup-role-${AWS::AccountId}-${AWS::Region}",
  };
  for (const attribute in expectedValues) {
    assert(
      stack.synthesizer[attribute as keyof typeof stack.synthesizer] ===
        expectedValues[attribute as keyof typeof expectedValues],
    );
  }
});

test("Base Stack Global Bootstrap Minimal Config", () => {
  const sampleConfig = {
    bootstrap: {
      qualifier: "abcdefgh",
    },
    environments: {
      dev: {},
    },
  };
  const app = new cdk.App();
  const stack = new BaseStack(app, "my-stack", { config: sampleConfig });

  new SqsToLambdaStage(stack, "Stage", {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      memorySize: 512,
      runtime: lambda.Runtime.PYTHON_3_9,
    },
  });
  const expectedValues = {
    qualifier: "hnb659fds",
    bucketName: "cdk-hnb659fds-assets-${AWS::AccountId}-${AWS::Region}",
    repositoryName: "cdk-hnb659fds-container-assets-${AWS::AccountId}-${AWS::Region}",
    _deployRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-deploy-role-${AWS::AccountId}-${AWS::Region}",
    _cloudFormationExecutionRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-cfn-exec-role-${AWS::AccountId}-${AWS::Region}",
    fileAssetPublishingRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-file-publishing-role-${AWS::AccountId}-${AWS::Region}",
    imageAssetPublishingRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-image-publishing-role-${AWS::AccountId}-${AWS::Region}",
    lookupRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-lookup-role-${AWS::AccountId}-${AWS::Region}",
    bucketPrefix: "",
    dockerTagPrefix: "",
    bootstrapStackVersionSsmParameter: "/cdk-bootstrap/hnb659fds/version",
  };
  for (const attribute in expectedValues) {
    assert(
      stack.synthesizer[attribute as keyof typeof stack.synthesizer] ===
        expectedValues[attribute as keyof typeof expectedValues],
    );
  }
});

test("Base Stack Global Bootstrap Full Config", () => {
  const sampleConfig = {
    bootstrap: {
      qualifier: "abcdefgh",
      bucket_name: "ddk-abcdefgh-assets-000000000000-us-west-2",
      repositoryName: "ddk-abcdefgh--container-assets-000000000000-us-west-2",
      _deployRoleArn: "arn:aws:iam::000000000000:role/ddk-abcdefgh--deploy-role-000000000000-us-west-2",
      _cloudFormationExecutionRoleArn:
        "arn:aws:iam::000000000000:role/ddk-abcdefgh-cfn-exec-role-000000000000-us-west-2",
      fileAssetPublishingRoleArn:
        "arn:aws:iam::000000000000:role/ddk-abcdefgh-file-publishing-role-000000000000-us-west-2",
      imageAssetPublishingRoleArn:
        "arn:aws:iam::000000000000:role/ddk-abcdefgh-image-publishing-role-000000000000-us-west-2",
      lookupRoleArn: "arn:aws:iam::000000000000:role/ddk-abcdefgh-lookup-role-000000000000-us-west-2",
    },
    environments: {
      dev: {},
    },
  };
  const app = new cdk.App();
  const stack = new BaseStack(app, "my-stack", { config: sampleConfig });

  new SqsToLambdaStage(stack, "Stage", {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      memorySize: 512,
      runtime: lambda.Runtime.PYTHON_3_9,
    },
  });
  const expectedValues = {
    qualifier: "hnb659fds",
    bucketName: "cdk-hnb659fds-assets-${AWS::AccountId}-${AWS::Region}",
    repositoryName: "cdk-hnb659fds-container-assets-${AWS::AccountId}-${AWS::Region}",
    _deployRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-deploy-role-${AWS::AccountId}-${AWS::Region}",
    _cloudFormationExecutionRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-cfn-exec-role-${AWS::AccountId}-${AWS::Region}",
    fileAssetPublishingRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-file-publishing-role-${AWS::AccountId}-${AWS::Region}",
    imageAssetPublishingRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-image-publishing-role-${AWS::AccountId}-${AWS::Region}",
    lookupRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-lookup-role-${AWS::AccountId}-${AWS::Region}",
    bucketPrefix: "",
    dockerTagPrefix: "",
    bootstrapStackVersionSsmParameter: "/cdk-bootstrap/hnb659fds/version",
  };
  for (const attribute in expectedValues) {
    assert(
      stack.synthesizer[attribute as keyof typeof stack.synthesizer] ===
        expectedValues[attribute as keyof typeof expectedValues],
    );
  }
});

test("Base Stack Environment Bootstrap Minimal Config", () => {
  const sampleConfig = {
    environments: {
      dev: {
        bootstrap: {
          qualifier: "abcdefgh",
        },
      },
    },
  };
  const app = new cdk.App();
  const stack = new BaseStack(app, "my-stack", { config: sampleConfig, environmentId: "dev" });

  new SqsToLambdaStage(stack, "Stage", {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      memorySize: 512,
      runtime: lambda.Runtime.PYTHON_3_9,
    },
  });
  const expectedValues = {
    qualifier: "abcdefgh",
    bucketName: "cdk-abcdefgh-assets-${AWS::AccountId}-${AWS::Region}",
    repositoryName: "cdk-abcdefgh-container-assets-${AWS::AccountId}-${AWS::Region}",
    _deployRoleArn: "arn:aws:iam::undefined:role/ddk-dev-abcdefgh-deploy-undefined-undefined",
    _cloudFormationExecutionRoleArn: "arn:aws:iam::undefined:role/ddk-dev-abcdefgh-cfn-exec-undefined-undefined",
    fileAssetPublishingRoleArn: "arn:aws:iam::undefined:role/ddk-dev-abcdefgh-file-publish-undefined-undefined",
    imageAssetPublishingRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-abcdefgh-image-publishing-role-${AWS::AccountId}-${AWS::Region}",
    lookupRoleArn: "arn:aws:iam::undefined:role/ddk-dev-abcdefgh-lookup-undefined-undefined",
    bucketPrefix: "",
    dockerTagPrefix: "",
    bootstrapStackVersionSsmParameter: "/cdk-bootstrap/abcdefgh/version",
  };
  for (const attribute in expectedValues) {
    assert(
      stack.synthesizer[attribute as keyof typeof stack.synthesizer] ===
        expectedValues[attribute as keyof typeof expectedValues],
    );
  }
});

test("Base Stack Environment Bootstrap Full Config", () => {
  const sampleConfig = {
    environments: {
      dev: {
        bootstrap: {
          qualifier: "abcdefgh",
          bucket_name: "ddk-abcdefgh-assets-000000000000-us-west-2",
          repositoryName: "ddk-abcdefgh--container-assets-000000000000-us-west-2",
          _deployRoleArn: "arn:aws:iam::000000000000:role/ddk-abcdefgh--deploy-role-000000000000-us-west-2",
          _cloudFormationExecutionRoleArn:
            "arn:aws:iam::000000000000:role/ddk-abcdefgh-cfn-exec-role-000000000000-us-west-2",
          fileAssetPublishingRoleArn:
            "arn:aws:iam::000000000000:role/ddk-abcdefgh-file-publishing-role-000000000000-us-west-2",
          imageAssetPublishingRoleArn:
            "arn:aws:iam::000000000000:role/ddk-abcdefgh-image-publishing-role-000000000000-us-west-2",
          lookupRoleArn: "arn:aws:iam::000000000000:role/ddk-abcdefgh-lookup-role-000000000000-us-west-2",
        },
      },
    },
  };
  const app = new cdk.App();
  const stack = new BaseStack(app, "my-stack", { config: sampleConfig, environmentId: "dev" });

  new SqsToLambdaStage(stack, "Stage", {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      memorySize: 512,
      runtime: lambda.Runtime.PYTHON_3_9,
    },
  });
  const expectedValues = {
    qualifier: "abcdefgh",
    bucketName: "cdk-abcdefgh-assets-${AWS::AccountId}-${AWS::Region}",
    repositoryName: "cdk-abcdefgh-container-assets-${AWS::AccountId}-${AWS::Region}",
    _deployRoleArn: "arn:aws:iam::undefined:role/ddk-dev-abcdefgh-deploy-undefined-undefined",
    _cloudFormationExecutionRoleArn: "arn:aws:iam::undefined:role/ddk-dev-abcdefgh-cfn-exec-undefined-undefined",
    fileAssetPublishingRoleArn: "arn:aws:iam::undefined:role/ddk-dev-abcdefgh-file-publish-undefined-undefined",
    imageAssetPublishingRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-abcdefgh-image-publishing-role-${AWS::AccountId}-${AWS::Region}",
    lookupRoleArn: "arn:aws:iam::undefined:role/ddk-dev-abcdefgh-lookup-undefined-undefined",
    bucketPrefix: "",
    dockerTagPrefix: "",
    bootstrapStackVersionSsmParameter: "/cdk-bootstrap/abcdefgh/version",
  };
  for (const attribute in expectedValues) {
    assert(
      stack.synthesizer[attribute as keyof typeof stack.synthesizer] ===
        expectedValues[attribute as keyof typeof expectedValues],
    );
  }
});

test("Base Stack Bootstrap Empty Config", () => {
  const sampleConfig = {
    bootstrap: {},
    environments: {
      dev: {},
    },
  };
  const app = new cdk.App();
  const stack = new BaseStack(app, "my-stack", { config: sampleConfig });

  new SqsToLambdaStage(stack, "Stage", {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      memorySize: 512,
      runtime: lambda.Runtime.PYTHON_3_9,
    },
  });
  const expectedValues = {
    qualifier: "hnb659fds",
    bucketName: "cdk-hnb659fds-assets-${AWS::AccountId}-${AWS::Region}",
    repositoryName: "cdk-hnb659fds-container-assets-${AWS::AccountId}-${AWS::Region}",
    _deployRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-deploy-role-${AWS::AccountId}-${AWS::Region}",
    _cloudFormationExecutionRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-cfn-exec-role-${AWS::AccountId}-${AWS::Region}",
    fileAssetPublishingRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-file-publishing-role-${AWS::AccountId}-${AWS::Region}",
    imageAssetPublishingRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-image-publishing-role-${AWS::AccountId}-${AWS::Region}",
    lookupRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-lookup-role-${AWS::AccountId}-${AWS::Region}",
    bucketPrefix: "",
    dockerTagPrefix: "",
    bootstrapStackVersionSsmParameter: "/cdk-bootstrap/hnb659fds/version",
  };
  for (const attribute in expectedValues) {
    assert(
      stack.synthesizer[attribute as keyof typeof stack.synthesizer] ===
        expectedValues[attribute as keyof typeof expectedValues],
    );
  }
});

test("Base Stack Permissions Boundary", () => {
  const app = new cdk.App();

  const stack = new BaseStack(app, "my-stack", {
    environmentId: "dev",
    permissionsBoundaryArn: "arn:aws:iam:000000000000:role/foobar",
  });

  new SqsToLambdaStage(stack, "Stage", {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      memorySize: 512,
      runtime: lambda.Runtime.PYTHON_3_9,
    },
  });
});

test("Test Permissions Boundary Creation and Usage in BaseStack", () => {
  const app = new cdk.App();
  const bootstrapStack = new cdk.Stack(app, "my-bootstrap-stack");
  const permissionsBoundary = BaseStack.createDefaultPermissionsBoundary(
    bootstrapStack,
    "DDK Default Permissions Boundary",
    {},
  );
  const stack = new BaseStack(app, "my-stack", {
    environmentId: "dev",
    permissionsBoundaryArn: permissionsBoundary.managedPolicyArn,
  });

  new SqsToLambdaStage(stack, "Stage", {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      memorySize: 512,
      runtime: lambda.Runtime.PYTHON_3_9,
    },
  });
  const bootstrapTemplate = Template.fromStack(bootstrapStack);
  bootstrapTemplate.resourceCountIs("AWS::IAM::ManagedPolicy", 1);
  const stackTemplate = Template.fromStack(stack);
  stackTemplate.hasResourceProperties("AWS::IAM::Role", {
    PermissionsBoundary: {
      Ref: "DDKDefaultPermissionsBoundary6721F63A",
    },
  });
});

test("Permissions Boundary Creation Full", () => {
  const app = new cdk.App();
  const bootstrapStack = new cdk.Stack(app, "my-bootstrap-stack");
  BaseStack.createDefaultPermissionsBoundary(bootstrapStack, "DDK Default Permissions Boundary", {
    prefix: "custom",
    environmentId: "stage",
    qualifier: "abcdefgh",
  });

  const bootstrapTemplate = Template.fromStack(bootstrapStack);
  bootstrapTemplate.resourceCountIs("AWS::IAM::ManagedPolicy", 1);
});

test("Bring Your Own Stack Synthesizer", () => {
  const app = new cdk.App();

  const stack = new BaseStack(app, "my-stack", {
    environmentId: "dev",
    permissionsBoundaryArn: "arn:aws:iam:000000000000:role/foobar",
    synthesizer: new cdk.DefaultStackSynthesizer(),
  });

  new SqsToLambdaStage(stack, "Stage", {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      memorySize: 512,
      runtime: lambda.Runtime.PYTHON_3_9,
    },
  });
  const expectedValues = {
    qualifier: "hnb659fds",
    bucketName: "cdk-hnb659fds-assets-${AWS::AccountId}-${AWS::Region}",
    repositoryName: "cdk-hnb659fds-container-assets-${AWS::AccountId}-${AWS::Region}",
    _deployRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-deploy-role-${AWS::AccountId}-${AWS::Region}",
    _cloudFormationExecutionRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-cfn-exec-role-${AWS::AccountId}-${AWS::Region}",
    fileAssetPublishingRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-file-publishing-role-${AWS::AccountId}-${AWS::Region}",
    imageAssetPublishingRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-image-publishing-role-${AWS::AccountId}-${AWS::Region}",
    lookupRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-lookup-role-${AWS::AccountId}-${AWS::Region}",
    bucketPrefix: "",
    dockerTagPrefix: "",
    bootstrapStackVersionSsmParameter: "/cdk-bootstrap/hnb659fds/version",
  };
  for (const attribute in expectedValues) {
    assert(
      stack.synthesizer[attribute as keyof typeof stack.synthesizer] ===
        expectedValues[attribute as keyof typeof expectedValues],
    );
  }
});

test("Additional Stack Props", () => {
  const app = new cdk.App();

  new BaseStack(app, "my-stack", {
    environmentId: "dev",
    description: "My Description",
    stackName: "MyStack",
  });
});
