import * as events from "aws-cdk-lib/aws-events";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { EventStage, EventStageProps } from "../pipelines/stage";

/**
 * Properties for `S3EventStage`.
 */
export interface S3EventStageProps extends EventStageProps {
  /**
   * The list of events to capture, for example: ["Object Created"].
   *
   * @link https://docs.aws.amazon.com/AmazonS3/latest/userguide/EventBridge.html
   */
  readonly eventNames: string[];
  /**
   * S3 Bucket or list of buckets.
   * Amazon EventBridge notifications must be enabled on the bucket in order to use this construct.
   */
  readonly bucket: s3.IBucket | s3.IBucket[];
  /**
   * The S3 prefix or list of prefixes. Capture root level prefix ("/") by default.
   */
  readonly keyPrefix?: string | string[];
}

/**
 * Stage implements an S3 event pattern based on event names, a bucket name and optional key prefix.
 * Amazon EventBridge notifications must be enabled on the bucket in order to use this construct.
 */
export class S3EventStage extends EventStage {
  readonly eventPattern?: events.EventPattern;

  /**
   * Constructs `S3EventStage`.
   * @param scope Scope within which this construct is defined.
   * @param id Identifier of the stage.
   * @param props Properties for the stage.
   */
  constructor(scope: Construct, id: string, props: S3EventStageProps) {
    super(scope, id, props);

    if (Array.isArray(props.bucket)) {
      var buckets = props.bucket;
    } else {
      var buckets = [props.bucket];
    }

    var detail: { [key: string]: any } = {
      bucket: {
        name: Array.from(buckets, (bucket) => bucket.bucketName),
      },
    };

    if (props.keyPrefix) {
      if (typeof props.keyPrefix === "string") {
        var prefixes = [props.keyPrefix];
      } else {
        var prefixes = props.keyPrefix;
      }
      detail.object = {
        key: prefixes.map((p) => ({ prefix: p })),
      };
    }

    this.eventPattern = {
      source: ["aws.s3"],
      detail: detail,
      detailType: props.eventNames,
    };
  }
}
