import fs from "fs";
import { unlink } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { jest } from "@jest/globals";
import mock from "mock-fs";
import { findConfigurationFileFromDir, importConfiguration, normalize, resolveConfiguration } from "../configuration.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// FIXME: `existSync()` など Node 20 + mock-fs において一部メソッドがモックがされないことがある。
jest.spyOn(fs, "existsSync").mockImplementation(path => {
	try {
		fs.statSync(path);
		return true;
	} catch {
		return false;
	}
});

describe("importConfiguration", () => {
	const deny = ["denied-word1", "denied-word2", /denied\-regexp\\d/];
	const allow = ["allowed-word1", "allowed-word2", /allowed\-regexp\\d/];
	const denyMd = ["denied-md-word1", "denied-md-word2", /denied\-md\-regexp\\d/];
	const allowMd = ["allowed-md-word1", "allowed-md-word2", /allowed\-md\-regexp\\d/];

	it("can import config.cjs", async () => {
		const config = await importConfiguration(join(__dirname, "./fixtures/config.cjs"));
		const rules = config.rules!;
		expect(Object.keys(rules).length).toBe(2);
		expect(rules["*"].deny).toEqual(deny);
		expect(rules["*"].allow).toEqual(allow);
		expect(rules["*.md"].deny).toEqual(denyMd);
		expect(rules["*.md"].allow).toEqual(allowMd);
	});

	it("can import config.mjs", async () => {
		const config = await importConfiguration(join(__dirname, "./fixtures/config.mjs"));
		const rules = config.rules!;
		expect(Object.keys(rules).length).toBe(2);
		expect(rules["*"].deny).toEqual(deny);
		expect(rules["*"].allow).toEqual(allow);
		expect(rules["*.md"].deny).toEqual(denyMd);
		expect(rules["*.md"].allow).toEqual(allowMd);
	});

	it("should reject the unknown extension configuration file", async () => {
		await expect(importConfiguration(join(__dirname, "./fixtures/config.ts"))).rejects.toThrow();
	});

	it("should reject the relative path configuration", async () => {
		await expect(importConfiguration("./fixtures/config.ts")).rejects.toThrow();
	});
});

describe("resolveConfiguration", () => {
	it("should resolve the configuration directory", async () => {
		expect(await resolveConfiguration(".")).toBeNull();
		expect(await resolveConfiguration(join(__dirname, "fixtures"))).toEqual({ rules: { "*.js": { deny: [], allow: [] } } });
	});

	it("should throw error if a non-existent file is specified", async () => {
		await expect(resolveConfiguration("not-found-config.js")).rejects.toThrow();
	});
});

describe("normalize", () => {
	it("can normalize the configuration", () => {
		expect(normalize({})).toEqual({ rules: {} });
		expect(normalize({ rules: { "*": {} } })).toEqual({ rules: { "*": { deny: [], allow: [] } } });
	});

	it("should throw error if invalid configuration is specified", async () => {
		expect(() =>
			normalize({
				rules: {
					"*": {
						// @ts-ignore: invalid type
						deny: "deniedWords",
					},
				},
			}),
		).toThrow();

		expect(() =>
			normalize({
				rules: {
					"*": {
						deny: [
							"denied-word1",
							"denied-word2",
							/denied\-regexp\\d/,
							// @ts-ignore: invalid type
							0,
						],
					},
				},
			}),
		).toThrow();

		expect(() =>
			normalize({
				rules: {
					"*": {
						// @ts-ignore: invalid type
						allow: () => void 0,
					},
				},
			}),
		).toThrow();

		expect(() =>
			normalize({
				rules: {
					"*": {
						allow: [
							"allowed-word1",
							"allowed-word2",
							/allowed\-regexp\\d/,
							// @ts-ignore: invalid type
							false,
						],
					},
				},
			}),
		).toThrow();
	});
});

describe("findConfigurationFileFromDir", () => {
	beforeEach(() => {
		mock({
			"resurveilrc.js": "",
			"resurveilrc.cjs": "",
			"resurveilrc.mjs": "",
			"resurveil-config.js": "",
			"resurveil-config.cjs": "",
			"resurveil-config.mjs": "",
		});
	});
	afterEach(() => {
		mock.restore();
	});

	it("check priority", async () => {
		expect(await findConfigurationFileFromDir(["."])).toBe("resurveilrc.js");
		await unlink("resurveilrc.js");
		expect(await findConfigurationFileFromDir(["."])).toBe("resurveilrc.cjs");
		await unlink("resurveilrc.cjs");
		expect(await findConfigurationFileFromDir(["."])).toBe("resurveilrc.mjs");
		await unlink("resurveilrc.mjs");
		expect(await findConfigurationFileFromDir(["."])).toBe("resurveil-config.js");
		await unlink("resurveil-config.js");
		expect(await findConfigurationFileFromDir(["."])).toBe("resurveil-config.cjs");
		await unlink("resurveil-config.cjs");
		expect(await findConfigurationFileFromDir(["."])).toBe("resurveil-config.mjs");
	});
});
