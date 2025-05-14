/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  plugins: [
    "@typescript-eslint",
  ],
  extends: ["@repo/eslint-config/next.js", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  rules: {
    semi: "off",
    quotes: "off",
    "turbo/no-undeclared-env-vars": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error"]
  },
};
