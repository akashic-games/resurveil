import fs from "fs";
import { stat } from "fs/promises";
import { homedir } from "os";
import { basename, extname, isAbsolute, join } from "path";
import chalk from "chalk";
import { defaultConfigurationFileNames, supportedConfigurationFileExtensions } from "./constants.js";
import { logger } from "./logger.js";
import type { Configuration } from "./types.js";

export async function importConfiguration(path: string): Promise<Configuration> {
	if (!isAbsolute(path)) throw new Error("Cannot import exception absolute path");
	if (!supportedConfigurationFileExtensions.includes(extname(path))) throw new Error(`Not supported the extension: ${basename(path)}`);
	const config = (await import(path)) as { default: Configuration } | Configuration;
	// @ts-ignore
	return normalize(config.default ? config.default : config);
}

export function normalize(configuration: Configuration = {}): Configuration {
	for (const key of Object.keys(configuration)) {
		const c = configuration[key];

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

	return configuration;
}

export async function findConfigurationFileFromDir(paths: string[]) {
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

export async function resolveConfiguration(path: string) {
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
