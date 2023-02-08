import * as cdk from "aws-cdk-lib";
import * as constructs from "constructs";

class ConfiguratorAspect implements cdk.IAspect {
  private readonly resourceType: string;
  private readonly propertyName: string;
  private readonly propertyValue: any;

  constructor(resourceType: string, propertyName: string, propertyValue: any) {
    this.resourceType = resourceType;
    this.propertyName = propertyName;
    this.propertyValue = propertyValue;
  }
  public visit(node: constructs.IConstruct): void {
    if (cdk.CfnResource.isCfnResource(node) && node.cfnResourceType == this.resourceType) {
      node.addPropertyOverride(this.propertyName, this.propertyValue);
    }
  }
}

export class Configurator {
  private readonly config: any;
  constructor(scope: constructs.Construct, configData: any) {
    this.config = configData;
    for (const environment in this.config["environments"]) {
      for (const attribute in this.config[environment]) {
        if (attribute == "resources") {
          for (const resourceType in this.config[environment]["resources"]) {
            console.log("I have found a property to override")
            const propertyName = Object.keys(this.config[environment]["resources"][resourceType])[0];
            cdk.Aspects.of(scope).add(new ConfiguratorAspect(
              resourceType,
              propertyName, 
              this.config[environment]["resources"][resourceType][propertyName], 
            ));
          }
        }
      }
    }

  }
}
