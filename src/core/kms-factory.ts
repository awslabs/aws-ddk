import * as cdk from "aws-cdk-lib";
import * as kms from "aws-cdk-lib/aws-kms";
import { Construct } from "constructs";

import { overrideProps } from "./utils";

export class KmsFactory {
  public static key(scope: Construct, id: string, props: kms.KeyProps) {
    const defaultProps: Partial<kms.KeyProps> = {
      enableKeyRotation: true,
      pendingWindow: cdk.Duration.days(30),
    };

    const mergedProps = overrideProps(defaultProps, props);
    return new kms.Key(scope, id, mergedProps);
  }
}
