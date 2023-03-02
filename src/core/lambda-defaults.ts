import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { overrideProps } from "./utils";

export class LambdaDefaults {
  public static functionProps(props: lambda.FunctionProps) {
    const defaultProps: Partial<lambda.FunctionProps> = {
      memorySize: 256,
      timeout: cdk.Duration.seconds(120),
    };

    return overrideProps(defaultProps, props);
  }
}
