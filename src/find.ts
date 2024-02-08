import { createReadStream } from "fs";
import { createInterface } from "readline/promises";
import chalk from "chalk";
import { logger } from "./logger.js";
import type { ConfigurationRule } from "./types.js";

export interface FindResult {
	lineNumber: number;
	detectedWord: string;
}

export async function find(filename: string, deniedWords: Array<ConfigurationRule>, allowedWords?: Array<ConfigurationRule>) {
	return new Promise<FindResult | null>((resolve, reject) => {
		const readStream = createReadStream(filename);
		const readLineInterface = createInterface({
			input: readStream,
			crlfDelay: Infinity,
		});

		let result: FindResult | null = null;
		let lineNumber = 0;

		readLineInterface.on("line", line => {
			lineNumber++;
			for (const deniedWord of deniedWords) {
				const detectedWord = detectWord(line, deniedWord);
				if (detectedWord == null) continue;

				if (allowedWords) {
					const allowed = allowedWords.find(allowedWord => detectWord(line, allowedWord));
					if (allowed) {
						logger.info(
							chalk.gray(
								`  ⚠️ '${detectedWord}' was rejected by '${deniedWord}', but it was exceptionally skipped by '${allowed}'.`,
							),
						);
						continue;
					}
				}

				result = {
					detectedWord,
					lineNumber,
				};

				// 一度でも見つかれば即座に終了
				readLineInterface.close();
				break;
			}
		});

		readLineInterface.on("error", error => {
			reject(error);
		});

		readLineInterface.on("close", () => {
			resolve(result);
		});
	});
}

function detectWord(str: string, rule: ConfigurationRule) {
	if (typeof rule === "string") {
		if (str.includes(rule)) {
			return rule;
		}
	} else if (rule instanceof RegExp && rule.test(str)) {
		const m = str.match(rule)!;
		return m[0];
	}

	return null;
}
