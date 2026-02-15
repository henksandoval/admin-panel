// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const rxjsX = require("eslint-plugin-rxjs-x");
const prettierConfig = require("eslint-config-prettier");

module.exports = tseslint.config(
  // Global ignores
  {
    ignores: [
      "dist/**",
      ".angular/**",
      "node_modules/**",
      "coverage/**",
    ],
  },

  // Base ESLint recommended
  eslint.configs.recommended,

  // TypeScript files configuration
  {
    files: ["**/*.ts"],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      ...angular.configs.tsRecommended,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    processor: angular.processInlineTemplates,
    plugins: {
      "rxjs-x": rxjsX,
    },
    rules: {
      // Angular selectors
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],

      // Angular best practices
      "@angular-eslint/prefer-standalone": "error",
      "@angular-eslint/prefer-signals": "warn",

      // TypeScript type safety
      "@typescript-eslint/explicit-function-return-type": [
        "warn",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",

      // General code quality
      "no-console": "warn",

      // RxJS best practices
      "rxjs-x/no-implicit-any-catch": "error",
      "rxjs-x/no-subject-value": "error",
      "rxjs-x/no-unsafe-takeuntil": "warn",
    },
  },

  // HTML template files configuration
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  },

  // Prettier config last to disable conflicting rules
  prettierConfig
);
