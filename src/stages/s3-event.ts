import * as events from "aws-cdk-lib/aws-events";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { EventStage, EventStageProps } from "../pipelines/stage";

export interface S3EventStageProps extends EventStageProps {
  readonly eventNames: string[];
  readonly bucket: s3.IBucket | s3.IBucket[];
  readonly keyPrefix?: string | string[];
}

export class S3EventStage extends EventStage {
  readonly eventPattern?: events.EventPattern;

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
