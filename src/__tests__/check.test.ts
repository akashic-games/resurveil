import mock from "mock-fs";
import { check } from "../check.js";
import type { Configuration } from "../types.js";

describe("check", () => {
	beforeEach(() => {
		// prettier-ignore
		mock({
			base: {
				"index.txt":
					"test1\n" +
					"test2\n" +
					"test3\n",
				"index.md":
					"test4\n" +
					"test5\n" +
					"test6\n",
				"index.html":
					"test7\n" +
					"test8\n" +
					"test9\n",
			},
		});
	});
	afterEach(() => {
		mock.restore();
	});

	it("can check the files", async () => {
		const configuration: Configuration = {
			rules: {
				"*.txt": {
					deny: [/test*/],
					allow: [/test[12]/],
				},
				"*.md": {
					deny: [/test*/],
					allow: [/test[4]/],
				},
			},
		};
		await expect(check("base", ["index.txt", "index.md"])).rejects.toThrow();
		await expect(check("base", ["index.txt", "index.md"], { configuration })).rejects.toThrow();
		await expect(check("base", ["index.html"], { configuration })).resolves.toBeUndefined();
	});
});
