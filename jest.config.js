export default {
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: ["./src/**/*.ts", "!./src/__tests__/**/*.ts"],
  coverageReporters: ["lcov"],
  moduleFileExtensions: ["ts", "js"],
  extensionsToTreatAsEsm: [".ts"],
  cache: false, // FIXME: ts-jest と mock-fs の相性が悪いのか、キャッシュを有効にすると2度目以降のテストに失敗することがあるためやむなく無効に
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.jest.json",
        useESM: true,
      },
    ],
  },
  testMatch: ["<rootDir>/src/__tests__/*.test.ts"],
};
