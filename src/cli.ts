#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import { program } from "commander";
import { check } from "./check.js";
import { resolveConfiguration } from "./configuration.js";
import { LogLevel, logger } from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(join(__dirname, "../package.json"), { encoding: "utf-8" }));

program
	.name("resurveil")
	.description(pkg.description)
	.version(pkg.version)
	.argument("<input files>", "files to surveil")
	.option("-c, --config <string>", "configuration path or directory", ".")
	.option("--quiet", "prevent output logs", false)
	.option("--ignore-no-config", "ignore the existence of the configuration file", false)
	.parse(process.argv);

const options = program.opts();

logger.level = options.quiet ? LogLevel.Error : LogLevel.All;

async function main(): Promise<void> {
	if (!program.args.length && !options.ignoreCheck) {
		throw new Error(`No files are specified.`);
	}
	const cwd = process.cwd();
	const configurationPath = join(cwd, options.config);
	const configuration = await resolveConfiguration(configurationPath);
	if (!configuration) {
		if (!options.ignoreNoConfig) {
			throw new Error(`Configuration file not specified.`);
		}
		logger.log(`${chalk.yellow("⚠")} Skipped the check`);
	} else {
		await check(cwd, program.args, { configuration });
		logger.log(`${chalk.green("✔")} All checks are fine`);
	}
}

main().catch(error => {
	const message = error instanceof Error ? error.message : `unknown error: ${error}`;
	logger.error(`${chalk.red("✘")} ${message}`);
	process.exitCode = 1;
});
