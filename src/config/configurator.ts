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
  constructor(scope: constructs.Construct, configData: any, environmentId?: string) {
    this.config = configData;
    for (const environment in this.config.environments) {
      if (environment == environmentId) {
        for (const attribute in this.config.environments[environment]) {
          if (attribute == "resources") {
            for (const resourceType in this.config.environments[environment].resources) {
              for (const property in this.config.environments[environment].resources[resourceType]) {
                cdk.Aspects.of(scope).add(
                  new ConfiguratorAspect(
                    resourceType,
                    property,
                    this.config.environments[environment].resources[resourceType][property],
                  ),
                );
              }
            }
          }
        }
      }
    }
  }
}
