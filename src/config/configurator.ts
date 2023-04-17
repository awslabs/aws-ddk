import { readFileSync, existsSync } from "fs";
import * as cdk from "aws-cdk-lib";
import * as constructs from "constructs";
import { parse } from "yaml";

const ddkBootstrapConfigKey = "bootstrap";
const bootstrapPrefix = "ddk";
const bootstrapQualifier = "hnb659fds";
const accountId = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION;

function readJson(path: string): object {
  try {
    const rawdata = readFileSync(path, "utf-8");
    return JSON.parse(rawdata);
  } catch (err) {
    return {};
  }
}
function readYaml(path: string): object {
  try {
    const rawdata = readFileSync(path, "utf-8");
    return parse(rawdata);
  } catch (err) {
    return {};
  }
}
function readConfigFile(path: string): object {
  if (path.includes(".json")) {
    return readJson(path);
  } else if (path.includes(".yaml") || path.includes(".yml")) {
    return readYaml(path);
  } else {
    throw TypeError("Config file must be in YAML or JSON format");
  }
}
function setRemovalPolicy(value: string, node: cdk.CfnResource): void {
  if (value.toLowerCase() == "destroy") {
    node.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
  } else if (value.toLowerCase() == "retain") {
    node.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);
  } else if (value.toLowerCase() == "snapshot") {
    node.applyRemovalPolicy(cdk.RemovalPolicy.SNAPSHOT);
  } else {
    throw new Error(`${value} is not a valid removal policy type. Must be one of ['DESTROY', 'RETAIN', & 'SNAPSHOT']`);
  }
}
interface getConfigProps {
  readonly config?: string | object;
}
export function getConfig(props: getConfigProps): any {
  const configData: any = props.config
    ? typeof props.config == "object"
      ? props.config
      : readConfigFile(props.config)
    : existsSync("./ddk.json")
    ? readConfigFile("./ddk.json")
    : undefined;
  return configData;
}

export function getEnvironment(config: object | string, environmentId?: string): any {
  const configData = getConfig({ config: config });
  return configData.environments && environmentId
    ? {
        env: {
          account: configData.environments[environmentId].account,
          region: configData.environments[environmentId].region,
        },
      }
    : { env: { account: configData.account, region: configData.region } };
}

interface getStackSynthesizerProps {
  readonly config?: string | object;
  readonly environmentId: string;
}
export function getStackSynthesizer(props: getStackSynthesizerProps): cdk.IStackSynthesizer {
  const configData = getConfig({ config: props.config });

  const bootstrapConfig: any = configData
    ? configData.ddkBootstrapConfigKey
      ? configData.ddkBootstrapConfigKey
      : props.environmentId in configData.environments &&
        ddkBootstrapConfigKey in configData.environments[props.environmentId]
      ? configData.environments[props.environmentId][ddkBootstrapConfigKey]
      : undefined
    : undefined;
  if (bootstrapConfig) {
    const qualifier = bootstrapConfig.qualifier ? bootstrapConfig.qualifier : bootstrapQualifier;
    const prefix = bootstrapConfig.prefix ? bootstrapConfig.prefix : bootstrapPrefix;
    return new cdk.DefaultStackSynthesizer({
      qualifier: qualifier,
      fileAssetsBucketName: bootstrapConfig.file_assets_bucket_name
        ? bootstrapConfig.file_assets_bucket_name
        : undefined,
      bootstrapStackVersionSsmParameter: bootstrapConfig.stack_version_ssm_parameter
        ? bootstrapConfig.stack_version_ssm_parameter
        : undefined,
      deployRoleArn: bootstrapConfig.deploy_role
        ? bootstrapConfig.deploy_role
        : `arn:aws:iam::${accountId}:role/${prefix}-${props.environmentId}-${qualifier}-deploy-${accountId}-${region}`,
      fileAssetPublishingRoleArn: bootstrapConfig.file_publish_role
        ? bootstrapConfig.file_publish_role
        : `arn:aws:iam::${accountId}:role/${prefix}-${props.environmentId}-${qualifier}-file-publish-${accountId}-${region}`,
      cloudFormationExecutionRole: bootstrapConfig.cfn_execution_role
        ? bootstrapConfig.cfn_execution_role
        : `arn:aws:iam::${accountId}:role/${prefix}-${props.environmentId}-${qualifier}-cfn-exec-${accountId}-${region}`,
      lookupRoleArn: bootstrapConfig.lookup_role
        ? bootstrapConfig.lookup_role
        : `arn:aws:iam::${accountId}:role/${prefix}-${props.environmentId}-${qualifier}-lookup-${accountId}-${region}`,
    });
  } else {
    return new cdk.DefaultStackSynthesizer();
  }
}

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
      if (this.propertyName == "RemovalPolicy") {
        setRemovalPolicy(this.propertyValue, node);
      } else {
        node.addPropertyOverride(this.propertyName, this.propertyValue);
      }
    }

    const nodePathItemRegex = new RegExp(`^(.*\/)?(${this.resourceId}\/Resource)(\/.*)?$`);

    if (this.resourceId && cdk.CfnResource.isCfnResource(node) && nodePathItemRegex.test(node.node.path)) {
      if (this.propertyName == "RemovalPolicy") {
        setRemovalPolicy(this.propertyValue, node);
      } else {
        node.addPropertyOverride(this.propertyName, this.propertyValue);
      }
    }
  }
}

export interface GetEnvConfigProps {
  readonly configPath: string;
  readonly environmentId: string;
}

export interface GetTagsProps {
  readonly configPath: string;
  readonly environmentId?: string;
}

export interface GetEnvironmentProps {
  readonly configPath: string;
  readonly environmentId?: string;
}

export class Configurator {
  public static getEnvConfig(props: GetEnvConfigProps): any {
    const config = getConfig({ config: props.configPath });
    return config.environments ? config.environments[props.environmentId] : undefined;
  }
  public static getTags(props: GetTagsProps): any {
    const config = getConfig({ config: props.configPath });
    return props.environmentId
      ? config.environments
        ? config.environments[props.environmentId].tags
        : {}
      : config.tags
      ? config.tags
      : {};
  }
  public static getEnvironment(props: GetEnvironmentProps): any {
    const config = getConfig({ config: props.configPath });
    return config.environments && props.environmentId
      ? {
          env: {
            account: config.environments[props.environmentId].account,
            region: config.environments[props.environmentId].region,
          },
        }
      : {
          env: {
            account: config.account,
            region: config.region,
          },
        };
  }
  public readonly config: any;
  public readonly environmentId?: string;
  constructor(scope: constructs.Construct, config: string | object, environmentId?: string) {
    this.config = getConfig({ config: config });
    this.environmentId = environmentId;

    if (environmentId && this.config.environments) {
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
  }
  tagConstruct(scope: constructs.Construct, tags: { [key: string]: string }): void {
    if (tags) {
      Object.entries(tags).forEach(([key, value]) => cdk.Tags.of(scope).add(key, value));
    }
  }
  getConfigAttribute(attribute: string): any {
    return this.environmentId && this.config.environments && this.config.environments[this.environmentId][attribute]
      ? this.config.environments[this.environmentId][attribute]
      : undefined;
  }
}
