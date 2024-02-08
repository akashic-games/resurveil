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
		expect(Object.keys(config).length).toBe(2);
		expect(config["*"].deny).toEqual(deny);
		expect(config["*"].allow).toEqual(allow);
		expect(config["*.md"].deny).toEqual(denyMd);
		expect(config["*.md"].allow).toEqual(allowMd);
	});

	it("can import config.mjs", async () => {
		const config = await importConfiguration(join(__dirname, "./fixtures/config.mjs"));
		expect(Object.keys(config).length).toBe(2);
		expect(config["*"].deny).toEqual(deny);
		expect(config["*"].allow).toEqual(allow);
		expect(config["*.md"].deny).toEqual(denyMd);
		expect(config["*.md"].allow).toEqual(allowMd);
	});

	it("should reject the unknown extension configuration file", async () => {
		await expect(importConfiguration(join(__dirname, "./fixtures/config.ts"))).rejects.toThrow();
	});

	it("should reject the relative path configuration", async () => {
		await expect(importConfiguration("./fixtures/config.ts")).rejects.toThrow();
	});
});

describe("resolveConfiguration", () => {
	beforeEach(() => {
		mock({
			"/path": {
				to: {
					"resurveilrc.mjs": `export default { "*.js": {} }`,
				},
			},
		});
	});
	afterEach(() => {
		mock.restore();
	});

	it("should resolve the configuration directory", async () => {
		expect(await resolveConfiguration(".")).toBeNull();
		expect(await resolveConfiguration("/path/to")).toEqual({ "*.js": { deny: [], allow: [] } });
	});

	it("should throw error if a non-existent file is specified", async () => {
		await expect(resolveConfiguration("not-found-config.js")).rejects.toThrow();
	});
});

describe("normalize", () => {
	it("can normalize the configuration", () => {
		expect(normalize({})).toEqual({});
		expect(normalize({ "*": {} })).toEqual({ "*": { deny: [], allow: [] } });
	});

	it("should throw error if invalid configuration is specified", async () => {
		expect(() =>
			normalize({
				"*": {
					// @ts-ignore: invalid type
					deny: "deniedWords",
				},
			}),
		).toThrow();

		expect(() =>
			normalize({
				"*": {
					deny: [
						"denied-word1",
						"denied-word2",
						/denied\-regexp\\d/,
						// @ts-ignore: invalid type
						0,
					],
				},
			}),
		).toThrow();

		expect(() =>
			normalize({
				"*": {
					// @ts-ignore: invalid type
					allow: () => void 0,
				},
			}),
		).toThrow();

		expect(() =>
			normalize({
				"*": {
					allow: [
						"allowed-word1",
						"allowed-word2",
						/allowed\-regexp\\d/,
						// @ts-ignore: invalid type
						false,
					],
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
