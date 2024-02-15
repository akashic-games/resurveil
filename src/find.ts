import { createReadStream } from "node:fs";
import { createInterface } from "readline/promises";
import chalk from "chalk";
import { logger } from "./logger.js";
import type { ConfigurationRuleEntry } from "./types.js";

export interface FindResult {
	lineNumber: number;
	detectedWord: string;
}

export async function find(
	filename: string,
	deniedWords: Array<ConfigurationRuleEntry>,
	allowedWords?: Array<ConfigurationRuleEntry>,
): Promise<FindResult | null> {
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
								`  ⚠️ line ${lineNumber}: '${line}' contained '${deniedWord}', but it was exceptionally skipped due to the rules of '${allowed}'`,
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

function detectWord(str: string, rule: ConfigurationRuleEntry): string | null {
	if (typeof rule === "string") {
		if (str.includes(rule)) {
			return rule;
		}
	} else if (rule instanceof RegExp) {
		if (rule.test(str)) {
			const m = str.match(rule)!;
			return m[0];
		}
	}

	return null;
}
