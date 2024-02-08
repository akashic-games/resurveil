export default {
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: ["./src/**/*.ts", "!./src/__tests__/**/*.ts"],
  coverageReporters: ["lcov"],
  moduleFileExtensions: ["ts", "js"],
  extensionsToTreatAsEsm: [".ts"],
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
