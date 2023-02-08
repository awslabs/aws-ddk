// import * as cdk from "aws-cdk-lib";
// import path from "path";
// import { Construct, IConstruct } from "constructs";

const testJsonConfig = {
  "environments": {
    "dev": {
        "account": "222222222222",
        "region": "us-east-1",
        "resources": {
            "S3::BUCKET": {"versioned": false, "removal_policy": "destroy"}
        }
    }
  }
}

interface jsonConfigProps {
  readonly data: object;
}

class jsonConfig {
  readonly configData: object;
  readonly environments: object[];
  constructor(id: string, props: jsonConfigProps) {
    
    this.configData = props.data;
    console.log(this.configData["environments"])


  }
}


new jsonConfig("default", {data: testJsonConfig});

// export class awsConfigurator {

// }