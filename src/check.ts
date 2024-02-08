import { basename, join, relative } from "path";
import chalk from "chalk";
import micromatch from "micromatch";
import { find } from "./find.js";
import { logger } from "./logger.js";
import type { Configuration } from "./types.js";

export interface CheckOptions {
	configuration: Configuration;
}

export async function check(base: string, filepaths: string[], options?: CheckOptions) {
	const configuration = options?.configuration;
	if (!configuration) return;

	for (const filepath of filepaths) {
		const absoluteFilepath = join(base, filepath);
		const relativeFilepath = relative(base, filepath);
		const filename = basename(filepath);

		logger.log(`${chalk.gray(relativeFilepath)}`);

		for (const key of Object.keys(configuration)) {
			if (!micromatch.isMatch(filename, key)) continue;

			const deniedWords = configuration[key].deny;
			if (!deniedWords) continue;

			const found = await find(absoluteFilepath, deniedWords, configuration[key].allow);
			if (found) {
				throw new Error(
					`Denied word detected: ${chalk.yellow(found.detectedWord)}\n  ${chalk.gray(`in ${absoluteFilepath}:${found.lineNumber}`)}`,
				);
			}
		}
	}
}
