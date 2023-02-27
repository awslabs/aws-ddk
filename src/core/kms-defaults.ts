import * as cdk from "aws-cdk-lib";
import * as kms from "aws-cdk-lib/aws-kms";
import { overrideProps } from "./utils";

export function assignKmsKeyProps(props: kms.KeyProps) {
  const defaultProps: Partial<kms.KeyProps> = {
    enableKeyRotation: true,
    pendingWindow: cdk.Duration.days(30),
  };

  return overrideProps(defaultProps, props);
}
