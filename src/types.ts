export type ConfigurationRule = string | RegExp;

interface ConfigurationRulePerFile {
	deny: Array<ConfigurationRule>;
	allow: Array<ConfigurationRule>;
}

export type Configuration = Record<string, Partial<ConfigurationRulePerFile>>;
