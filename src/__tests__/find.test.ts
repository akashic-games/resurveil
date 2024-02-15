import mock from "mock-fs";
import { find } from "../find.js";

describe("find", () => {
	beforeEach(() => {
		mock({});
	});
	afterEach(() => {
		mock.restore();
	});

	it("can find the words", async () => {
		mock({
			// prettier-ignore
			"text.txt":
				"sample\n" +
				"text\n" +
				"data\n" +
				"for\n" +
				"foo\n" +
				"bar\n",
		});

		expect(await find("text.txt", [])).toBeNull();
		expect(await find("text.txt", ["for"])).toEqual({ detectedWord: "for", lineNumber: 4 });
		expect(await find("text.txt", [/b.r/])).toEqual({ detectedWord: "bar", lineNumber: 6 });
		expect(await find("text.txt", [/b.r/], ["bar"])).toBeNull();
	});
});
