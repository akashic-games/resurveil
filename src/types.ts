export type ConfigurationRule = string | RegExp;

interface ConfigurationRulePerFile {
	deny: Array<ConfigurationRule>;
	allow: Array<ConfigurationRule>;
}

export interface Configuration {
	rules: Record<string, Partial<ConfigurationRulePerFile>>;
}
