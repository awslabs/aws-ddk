import * as glue from "@aws-cdk/aws-glue-alpha";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { overrideProps } from "./utils";

export enum GlueJobType {
  PY_SPARK_ETL_JOB = "PySparkEtlJob",
  PYTHON_SHELL_JOB = "PythonShellJob",
  PY_SPARK_STREAMING_JOB = "PySparkStreamingJob",
  PY_SPARK_FLEX_ETL_JOB = "PySparkFlexEtlJob",
  SCALA_SPARK_ETL_JOB = "ScalaSparkEtlJob",
  SCALA_SPARK_FLEX_ETL_JOB = "ScalaSparkFlexEtlJob",
  SCALA_SPARK_STREAMING_JOB = "ScalaSparkStreamingJob",
}

export interface GlueFactoryProps {
  readonly glueJobType: String;
  readonly glueJobProperties:
    | glue.PySparkEtlJobProps
    | glue.PythonShellJobProps
    | glue.PySparkStreamingJobProps
    | glue.PySparkFlexEtlJobProps
    | glue.ScalaSparkEtlJobProps
    | glue.ScalaSparkFlexEtlJobProps
    | glue.ScalaSparkStreamingJobProps;
}

export class GlueFactory {
  public static job(scope: Construct, id: string, props: GlueFactoryProps) {
    const securityConfiguration = !props.glueJobProperties.securityConfiguration
      ? new glue.SecurityConfiguration(scope, `${id}-security-configuration`, {
          s3Encryption: {
            mode: glue.S3EncryptionMode.S3_MANAGED,
          },
        })
      : undefined;
    const defaultProps: Partial<glue.JobProperties> = {
      maxConcurrentRuns: 1,
      maxRetries: 1,
      timeout: cdk.Duration.hours(10),
      securityConfiguration: securityConfiguration,
    };

    const mergedProps = overrideProps(defaultProps, props.glueJobProperties);
    //return new glue.Job(scope, id, mergedProps);
    switch (props.glueJobType) {
      case GlueJobType.PY_SPARK_ETL_JOB:
        return new glue.PySparkEtlJob(scope, id, mergedProps);
      case GlueJobType.PYTHON_SHELL_JOB:
        return new glue.PythonShellJob(scope, id, mergedProps);
      case GlueJobType.PY_SPARK_STREAMING_JOB:
        return new glue.PySparkStreamingJob(scope, id, mergedProps);
      case GlueJobType.PY_SPARK_FLEX_ETL_JOB:
        return new glue.PySparkFlexEtlJob(scope, id, mergedProps);
      case GlueJobType.SCALA_SPARK_ETL_JOB:
        return new glue.ScalaSparkEtlJob(scope, id, mergedProps);
      case GlueJobType.SCALA_SPARK_FLEX_ETL_JOB:
        return new glue.ScalaSparkFlexEtlJob(scope, id, mergedProps);
      case GlueJobType.SCALA_SPARK_STREAMING_JOB:
        return new glue.ScalaSparkStreamingJob(scope, id, mergedProps);

      default:
        throw new Error("Invalid Glue Job Type");
    }
  }
}
