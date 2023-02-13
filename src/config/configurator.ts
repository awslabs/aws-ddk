import { readFileSync } from "fs";
import * as cdk from "aws-cdk-lib";
import * as constructs from "constructs";
import { parse } from "yaml";

interface ConfiguratorAspectProps {
  readonly propertyName: string;
  readonly propertyValue: any;
  readonly resourceType?: string;
  readonly resourceId?: string;
}

class ConfiguratorAspect implements cdk.IAspect {
  private readonly propertyName: string;
  private readonly propertyValue: any;
  private readonly resourceType: any;
  private readonly resourceId: any;

  constructor(props: ConfiguratorAspectProps) {
    this.resourceType = props.resourceType;
    this.propertyName = props.propertyName;
    this.propertyValue = props.propertyValue;
    this.resourceId = props.resourceId;
  }
  public visit(node: constructs.IConstruct): void {
    if (this.resourceType && cdk.CfnResource.isCfnResource(node) && node.cfnResourceType == this.resourceType) {
      node.addPropertyOverride(this.propertyName, this.propertyValue);
    }

    if (this.resourceId && cdk.CfnResource.isCfnResource(node)) {
      node.addPropertyOverride(this.propertyName, this.propertyValue);
    }
  }
}

export class Configurator {
  private readonly config: any;
  constructor(scope: constructs.Construct, config: string | object, environmentId: string) {
    this.config = typeof config == "object" ? config : this.readConfigFile(config);

    // Tags
    const tags = { ...this.config.tags, ...this.config.environments[environmentId].tags };
    this.tagConstruct(scope, tags);

    // Environment Based
    const environment = this.config.environments[environmentId];
    for (const attribute in environment) {
      if (attribute == "resources") {
        for (const resourceIdentifier in environment.resources) {
          const regexp = new RegExp("^AWS::.*::.*$");
          var resourceIdentifierArgument;
          if (regexp.test(resourceIdentifier)) {
            resourceIdentifierArgument = {
              resourceType: resourceIdentifier,
            };
          } else {
            resourceIdentifierArgument = {
              resourceId: resourceIdentifier,
            };
          }
          for (const property in environment.resources[resourceIdentifier]) {
            cdk.Aspects.of(scope).add(
              new ConfiguratorAspect({
                propertyName: property,
                propertyValue: environment.resources[resourceIdentifier][property],
                ...resourceIdentifierArgument,
              }),
            );
          }
        }
      }
    }
  }
  readJson(path: string): object {
    const rawdata = readFileSync(path, "utf-8");
    return JSON.parse(rawdata);
  }
  readYaml(path: string): object {
    const rawdata = readFileSync(path, "utf-8");
    return parse(rawdata);
  }
  readConfigFile(path: string): object {
    if (path.includes(".json")) {
      return this.readJson(path);
    } else if (path.includes(".yaml") || path.includes(".yml")) {
      return this.readYaml(path);
    } else {
      throw TypeError("Config file must be in YAML or JSON format");
    }
  }
  tagConstruct(scope: constructs.Construct, tags: { [key: string]: string }): void {
    if (tags) {
      Object.entries(tags).forEach(([key, value]) => cdk.Tags.of(scope).add(key, value));
    }
  }
}
