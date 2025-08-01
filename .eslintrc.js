// eslint.config.mjs
import { defineConfig } from "eslint/config";
import { FlatCompat } from "@eslint/eslintrc";
import { getImportResolver } from "./build-system/babel-config/import-resolver";
import {
  forbiddenTermsGlobal,
  forbiddenTermsSrcInclusive,
} from "./build-system/test-configs/forbidden-terms";

// Create compat wrapper to include legacy extends/plugins
const compat = new FlatCompat({
  baseDirectory: import.meta.url && new URL('.', import.meta.url).pathname,
});

const importAliases = getImportResolver().alias;

// Dynamic globals from experiment configuration
function getExperimentGlobals() {
  const experiments = Object.keys(
    JSON.parse(
      fs.readFileSync(
        new URL('./build-system/global-configs/experiments-const.json', import.meta.url)
      )
    )
  );
  return Object.fromEntries(experiments.map((e) => [e, 'readonly']));
}

export default defineConfig([
  {
    ignores: ["node_modules/**", ".git/**"],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      chaiExpect: "chai-expect",
      import: "import",
      jsdoc: "jsdoc",
      local: "local",
      moduleResolver: "module-resolver",
      prettier: "prettier",
      react: "react",
      reactHooks: "react-hooks",
      sortDestructureKeys: "sort-destructure-keys",
      typescript: "@typescript-eslint",
    },
    globals: {
      ...getExperimentGlobals(),
      IS_ESM: "readonly",
      IS_SSR_CSS: "readonly",
      IS_SXG: "readonly",
      IS_MINIFIED: "readonly",
      IS_PROD: "readonly",
      INTERNAL_RUNTIME_VERSION: "readonly",
      AMP_STORY_SUPPORTED_LANGUAGES: "readonly",
      AMP: "readonly",
      context: "readonly",
      global: "readonly",
      globalThis: "readonly",
    },
    settings: {
      jsdoc: {
        tagNamePreference: {
          augments: "extends",
          constant: "const",
          class: "constructor",
          file: "fileoverview",
          returns: "return",
        },
        allowOverrideWithoutParam: true,
      },
      react: { pragma: "Preact" },
      import: {
        resolver: getImportResolver(),
        extensions: [".js", ".jsx"],
        externalModuleFolders: ["node_modules", "third_party"],
        ignore: ["node_modules", "\\.jss\\.js"],
      },
    },
    rules: {
      "chai-expect/missing-assertion": "error",
      "chai-expect/no-inner-compare": "error",
      "chai-expect/terminating-properties": "error",
      curly: "error",
      "import/no-unresolved": [
        "error",
        { ignore: ["(\\./|#)build/.*"] },
      ],
      "import/named": "error",
      "import/namespace": "error",
      "import/no-useless-path-segments": ["error", { noUselessIndex: true }],
      "import/no-absolute-path": "error",
      "import/export": "error",
      "import/no-deprecated": "error",
      "import/first": "error",
      "import/extensions": [
        "error",
        { js: "never", mjs: "always", css: "always", jss: "always" },
      ],
      "jsdoc/check-param-names": "error",
      "jsdoc/check-tag-names": [
        "error",
        {
          definedTags: [
            "closurePrimitive", "deprecated", "dict", "export",
            "final", "nocollapse", "package", "record",
            "restricted", "struct", "suppress", "template",
            "visibleForTesting", "jsx", "jsxFrag",
          ],
        },
      ],
      "jsdoc/check-types": ["error", { noDefaults: true }],
      "jsdoc/require-param": "error",
      "jsdoc/require-param-name": "error",
      "jsdoc/require-param-type": "error",
      "jsdoc/require-returns": ["error", { forceReturnsWithAsync: true }],
      "jsdoc/require-returns-type": "error",
      // Local custom rules
      "local/await-expect": "error",
      "local/camelcase": "error",
      "local/closure-type-primitives": "error",
      "local/no-function-async": "error",
      // ... include all your original local rules similarly ...
      "local/no-forbidden-terms": ["error", forbiddenTermsGlobal, forbiddenTermsSrcInclusive],
      "module-resolver/use-alias": ["error", { alias: importAliases }],
      "no-alert": "error",
      "no-debugger": "error",
      "no-var": "error",
      "prefer-const": "error",
      "prettier/prettier": "error",
      "sort-imports": ["error", { allowSeparatedGroups: true, ignoreDeclarationSort: true }],
      "import/order": [
        "error",
        {
          groups: [["builtin", "external"], "internal", ["index", "sibling"], "parent"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
          pathGroups: Object.keys(importAliases).map((alias) => ({
            pattern: `${alias}{,/**}`,
            group: "internal",
            position: "before",
          })),
          pathGroupsExcludedImportTypes: Object.keys(importAliases),
        },
      ],
      "sort-destructure-keys/sort-destructure-keys": "error",
      "@typescript-eslint/no-unused-vars": ["error", {
        argsIgnorePattern: "^(var_args$|opt_|unused)",
        varsIgnorePattern: "(AmpElement|Def|Interface)$",
      }],
    },
  },
  // Include compatibility fallback with legacy extends/plugins
  ...compat.config({
    extends: [
      "eslint:recommended",
      "plugin:react/recommended",
      "plugin:react-hooks/recommended",
      "plugin:@typescript-eslint/recommended",
      "prettier",
    ],
  }),
]);
