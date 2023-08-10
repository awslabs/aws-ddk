import { readFileSync, existsSync } from "fs";
import * as cdk from "aws-cdk-lib";
import * as constructs from "constructs";
import { parse } from "yaml";

const ddkBootstrapConfigKey = "bootstrap";
const bootstrapPrefix = "ddk";
const bootstrapQualifier = "hnb659fds";
const defaultAccountId = process.env.CDK_DEFAULT_ACCOUNT;
const defaultRegion = process.env.CDK_DEFAULT_REGION;

export interface EnvironmentConfiguration {
  readonly account?: string;
  readonly region?: string;
  readonly resources?: { [key: string]: any };
  readonly tags?: { [key: string]: string };
  readonly bootstrap?: { [key: string]: string };
  readonly props?: { [key: string]: string };
}

export interface Configuration {
  readonly environments: { [id: string]: EnvironmentConfiguration };
  readonly account?: string;
  readonly region?: string;
  readonly tags?: { [key: string]: string };
  readonly bootstrap?: { [key: string]: string };
  readonly ddkBootstrapConfigKey?: string;
  readonly props?: { [key: string]: string };
}

function readJson(path: string): Configuration {
  try {
    const rawdata = readFileSync(path, "utf-8");
    return JSON.parse(rawdata);
  } catch (err) {
    return { environments: {} };
  }
}
function readYaml(path: string): Configuration {
  try {
    const rawdata = readFileSync(path, "utf-8");
    return parse(rawdata);
  } catch (err) {
    return { environments: {} };
  }
}
function readConfigFile(path: string): Configuration {
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
export interface GetConfigProps {
  readonly config?: string | Configuration;
}

export function getConfig(props: GetConfigProps): Configuration | null {
  if (props.config) {
    if (typeof props.config == "string") {
      return readConfigFile(props.config);
    } else {
      return props.config;
    }
  } else {
    const path = "./ddk.json";
    if (existsSync(path)) {
      return readConfigFile(path);
    }
    return null;
  }
}

export function getEnvironment(config: Configuration | string, environmentId?: string): cdk.Environment {
  const configData = getConfig({ config: config });

  if (!configData) {
    throw TypeError("Config not defined.");
  }

  if (configData?.environments && environmentId) {
    return {
      account: configData.environments[environmentId].account,
      region: configData.environments[environmentId].region,
    };
  }

  return {
    account: configData.account,
    region: configData.region,
  };
}

interface getStackSynthesizerProps {
  readonly config?: string | Configuration;
  readonly environmentId: string;
}

export function getStackSynthesizer(props: getStackSynthesizerProps): cdk.IStackSynthesizer {
  const configData = getConfig({ config: props.config });

  const accountId =
    configData && props.environmentId ? configData.environments[props.environmentId].account : defaultAccountId;

  const region =
    configData && props.environmentId ? configData.environments[props.environmentId].region : defaultRegion;

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
        : `${prefix}-${props.environmentId}-${qualifier}-assets-${accountId}-${region}`,
      bootstrapStackVersionSsmParameter: bootstrapConfig.stack_version_ssm_parameter
        ? bootstrapConfig.stack_version_ssm_parameter
        : `/${prefix}/${props.environmentId}/${qualifier}/bootstrap-version`,
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
  /**
   * Relative path to config file. Defaults to './ddk.json'
   */
  readonly configPath?: string;
  /**
   * Environment identifier
   */
  readonly environmentId: string;
}

export interface GetTagsProps {
  /**
   * Relative path to config file. Defaults to './ddk.json'
   */
  readonly configPath?: string;
  /**
   * Environment identifier
   */
  readonly environmentId?: string;
}

export interface GetEnvironmentProps {
  /**
   * Relative path to config file. Defaults to './ddk.json'
   */
  readonly configPath?: string;
  /**
   * Environment identifier.
   */
  readonly environmentId?: string;
}

export class Configurator {
  public static getEnvConfig(props: GetEnvConfigProps): EnvironmentConfiguration {
    const config = getConfig({ config: props.configPath });

    if (!config || !config.environments) {
      throw TypeError("Config not defined.");
    }

    return config.environments[props.environmentId];
  }

  public static getTags(props: GetTagsProps): { [key: string]: string } {
    const configPath = props.configPath ?? "./ddk.json";
    const config = getConfig({ config: configPath });

    if (!config || !config.environments) {
      throw TypeError("Config not defined.");
    }

    if (props.environmentId && config.environments) {
      return config.environments[props.environmentId].tags ?? {};
    }

    if (config.tags) {
      return config.tags;
    }

    return {};
  }

  public static getEnvironment(props: GetEnvironmentProps): cdk.Environment {
    const configPath = props.configPath ?? "./ddk.json";
    const config = getConfig({ config: configPath });

    if (!config) {
      throw TypeError("Config not defined.");
    }

    if (config.environments && props.environmentId) {
      return {
        account: config.environments[props.environmentId].account,
        region: config.environments[props.environmentId].region,
      };
    }

    return {
      account: config.account,
      region: config.region,
    };
  }

  public static getConfig(props: GetConfigProps): Configuration | undefined {
    if (props.config) {
      if (typeof props.config == "string") {
        return readConfigFile(props.config);
      } else {
        return props.config;
      }
    } else {
      const path = "./ddk.json";
      if (existsSync(path)) {
        return readConfigFile(path);
      }
      return undefined;
    }
  }

  public readonly config: Configuration;
  public readonly environmentId?: string;

  constructor(scope: constructs.Construct, config: string | Configuration, environmentId?: string) {
    this.config = getConfig({ config: config }) ?? { environments: {} };
    this.environmentId = environmentId;

    if (environmentId && this.config.environments) {
      // Tags
      const tags = {
        ...this.config.tags,
        ...(this.config.environments[environmentId]?.tags ?? {}),
      };
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
    if (!this.environmentId) return null;
    if (!this.config.environments) return null;

    const stageConfig = this.config.environments[this.environmentId] as { [key: string]: any };

    if (!stageConfig) return null;
    if (!(attribute in stageConfig)) return null;

    return stageConfig[attribute];
  }
}
