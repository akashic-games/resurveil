import fs from "node:fs";
import { stat } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, extname, isAbsolute, join } from "node:path";
import chalk from "chalk";
import { defaultConfigurationFileNames, supportedConfigurationFileExtensions } from "./constants.js";
import { logger } from "./logger.js";
import type { Configuration } from "./types.js";

export async function importConfiguration(path: string): Promise<Configuration> {
	if (!isAbsolute(path)) throw new Error("Cannot import exception absolute path");
	if (!supportedConfigurationFileExtensions.includes(extname(path))) throw new Error(`Not supported the extension: ${basename(path)}`);
	const config = (await import(path)) as { default: Configuration } | Configuration;
	return normalize(("default" in config ? config.default : config) as Configuration);
}

export function normalize(configuration: Partial<Configuration> = {}): Configuration {
	if (!configuration.rules) {
		configuration.rules = {};
	}

	for (const key of Object.keys(configuration.rules)) {
		const c = configuration.rules[key];

		if (c.deny != null) {
			if (!Array.isArray(c.deny)) {
				throw new Error(`"${key}".deny is invalid. Only supported for array.`);
			}
			for (let i = 0; i < c.deny.length; i++) {
				const rule = c.deny[i];
				if (typeof rule !== "string" && !(rule instanceof RegExp)) {
					throw new Error(`"${key}".deny[${i}] is invalid. Only supported for string or RegExp.`);
				}
			}
		} else {
			c.deny = [];
		}

		if (c.allow != null) {
			if (!Array.isArray(c.allow)) {
				throw new Error(`"${key}".allow is invalid. Only supported for array.`);
			}
			for (let i = 0; i < c.allow.length; i++) {
				const rule = c.allow[i];
				if (typeof rule !== "string" && !(rule instanceof RegExp)) {
					throw new Error(`"${key}".allow[${i}] is invalid. Only supported for string or RegExp.`);
				}
			}
		} else {
			c.allow = [];
		}
	}

	return configuration as Configuration;
}

export async function findConfigurationFileFromDir(paths: string[]): Promise<string | null> {
	for (const path of paths) {
		for (const configurationFileName of defaultConfigurationFileNames) {
			for (const ext of supportedConfigurationFileExtensions) {
				const configurationPath = join(path, `${configurationFileName}${ext}`);
				if (fs.existsSync(configurationPath)) return configurationPath;
			}
		}
	}

	return null;
}

export async function resolveConfiguration(path: string): Promise<Configuration | null> {
	if (!fs.existsSync(path)) {
		throw new Error(`${path} is not exists`);
	}

	const status = await stat(path);
	if (!status.isDirectory()) {
		return importConfiguration(path);
	}

	const configurationPath = await findConfigurationFileFromDir([path, homedir()]);
	if (configurationPath) {
		logger.info(chalk.gray(`configuration file: ${configurationPath}`));
		return importConfiguration(configurationPath);
	}

	return null;
}
