module.exports = {
  root: true,
  extends: ["@akashic/eslint-config", "prettier"],
  plugins: ["prettier"],
  parserOptions: {
    project: "tsconfig.eslint.json",
    sourceType: "module",
  },
  ignorePatterns: ["*.js", "*.cjs", "*.mjs", "**/*.d.ts"],
};
