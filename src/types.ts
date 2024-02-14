export type ConfigurationRuleEntry = string | RegExp;

export interface ConfigurationRule {
	deny: Array<ConfigurationRuleEntry>;
	allow: Array<ConfigurationRuleEntry>;
}

export interface Configuration {
	rules: Record<string, Partial<ConfigurationRule>>;
}
