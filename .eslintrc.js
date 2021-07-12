/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const fs = require('fs');

const {
  forbiddenTermsGlobal,
  forbiddenTermsSrcInclusive,
} = require('./build-system/test-configs/forbidden-terms');
const {
  getImportResolver,
} = require('./build-system/babel-config/import-resolver');

const importAliases = getImportResolver().alias;

/**
 * Dynamically extracts experiment globals from the config file.
 *
 * @return {!Object}
 */
function getExperimentGlobals() {
  const experiments = Object.keys(
    JSON.parse(
      fs.readFileSync('build-system/global-configs/experiments-const.json')
    )
  );
  const globals = {};
  experiments.forEach((experiment) => (globals[experiment] = 'readonly'));
  return globals;
}

module.exports = {
  'root': true,
  'parser': '@babel/eslint-parser',
  'plugins': [
    'chai-expect',
    'google-camelcase',
    'import',
    'jsdoc',
    'local',
    'module-resolver',
    'notice',
    'prettier',
    'react',
    'react-hooks',
    'sort-destructure-keys',
    'sort-requires',
  ],
  'env': {
    'es6': true,
    'browser': true,
  },
  'parserOptions': {
    'ecmaVersion': 6,
    'jsx': true,
    'sourceType': 'module',
  },
  'globals': {
    ...getExperimentGlobals(),
    'IS_ESM': 'readonly',
    'IS_SXG': 'readonly',
    'IS_MINIFIED': 'readonly',
    'IS_FORTESTING': 'readonly',
    'INTERNAL_RUNTIME_VERSION': 'readonly',
    'AMP': 'readonly',
    'context': 'readonly',
    'global': 'readonly',
    'globalThis': 'readonly',
  },
  'settings': {
    'jsdoc': {
      'tagNamePreference': {
        'augments': 'extends',
        'constant': 'const',
        'class': 'constructor',
        'file': 'fileoverview',
        'returns': 'return',
      },
      'allowOverrideWithoutParam': true,
    },
    'react': {
      'pragma': 'Preact',
    },
    'import/resolver': {
      // This makes it possible to eventually enable the built-in import linting
      // rules to detect invalid imports, imports of things that aren't
      // exported, etc.
      'babel-module': getImportResolver(),
    },
    'import/extensions': ['.js', '.jsx'],
    'import/external-module-folders': ['node_modules', 'third_party'],
    'import/ignore': [
      'node_modules',
      // Imports of `CSS` from JSS files are created at build time
      '\\.jss\\.js',
    ],
  },
  'reportUnusedDisableDirectives': true,
  'rules': {
    'chai-expect/missing-assertion': 2,
    'chai-expect/no-inner-compare': 2,
    'chai-expect/terminating-properties': 2,
    'curly': 2,
    'google-camelcase/google-camelcase': 2,

    // Rules restricting/standardizing import statements
    'import/no-unresolved': [
      'error',
      {
        // Ignore unresolved imports of build files
        'ignore': ['(\\./|#)build/.*'],
      },
    ],
    'import/named': 2,
    'import/namespace': 2,
    'import/no-useless-path-segments': ['error', {'noUselessIndex': true}],
    'import/no-absolute-path': 2,
    'import/export': 2,
    'import/no-deprecated': 2,
    'import/first': 2,
    'import/extensions': [
      'error',
      {
        'js': 'never',
        'mjs': 'always',
        'css': 'always',
        'jss': 'always',
      },
    ],
    // TODO(rcebulko): enable
    'import/no-mutable-exports': 0,
    'import/no-default-export': 0,

    // Rules validating JSDoc syntax, separate from type-checking
    'jsdoc/check-param-names': 2,
    'jsdoc/check-tag-names': [
      2,
      {
        'definedTags': [
          'closurePrimitive',
          'deprecated',
          'dict',
          'export',
          'final',
          'nocollapse',
          'package',
          'record',
          'restricted',
          'struct',
          'suppress',
          'template',
          'visibleForTesting',
          'jsx',
          'jsxFrag',
        ],
      },
    ],
    'jsdoc/check-types': [
      2,
      {
        'noDefaults': true,
      },
    ],
    'jsdoc/require-param': 2,
    'jsdoc/require-param-name': 2,
    'jsdoc/require-param-type': 2,
    'jsdoc/require-returns': [2, {forceReturnsWithAsync: true}],
    'jsdoc/require-returns-type': 2,

    // Custom repo rules defined in build-system/eslint-rules
    'local/await-expect': 2,
    'local/closure-type-primitives': 2,
    'local/dict-string-keys': 2,
    'local/get-mode-usage': 2,
    'local/html-template': 2,
    'local/is-experiment-on': 2,
    'local/json-configuration': 2,
    'local/jss-animation-name': 2,
    'local/no-array-destructuring': 2,
    'local/no-arrow-on-register-functions': 2,
    'local/no-bigint': 2,
    'local/no-deep-destructuring': 2,
    'local/no-duplicate-import': 2,
    'local/no-duplicate-name-typedef': 2,
    'local/no-dynamic-import': 2,
    'local/no-es2015-number-props': 2,
    'local/no-export-side-effect': 2,
    'local/no-forbidden-terms': [
      2,
      forbiddenTermsGlobal,
      forbiddenTermsSrcInclusive,
    ],
    'local/no-function-async': 2,
    'local/no-function-generator': 2,
    'local/no-global': 0,
    'local/no-has-own-property-method': 2,
    'local/no-import': 2,
    'local/no-import-meta': 2,
    'local/no-import-rename': 2,
    'local/no-invalid-this': 2,
    'local/no-log-array': 2,
    'local/no-mixed-interpolation': 2,
    'local/no-mixed-operators': 2,
    'local/no-module-exports': 2,
    'local/no-rest': 2,
    'local/no-spread': 2,
    'local/no-static-this': 2,
    'local/no-style-display': 2,
    'local/no-style-property-setting': 2,
    'local/no-swallow-return-from-allow-console-error': 2,
    'local/no-unload-listener': 2,
    'local/objstr-literal': 2,
    'local/preact': 2,
    'local/prefer-deferred-promise': 0,
    'local/prefer-destructuring': 2,
    'local/prefer-spread-props': 2,
    'local/prefer-unnested-spread-objects': 2,
    'local/private-prop-names': 2,
    'local/query-selector': 2,
    'local/todo-format': 0,
    'local/unused-private-field': 2,
    'local/vsync': 0,
    'local/window-property-name': 2,

    'module-resolver/use-alias': ['error', {'alias': importAliases}],
    'no-alert': 2,
    'no-cond-assign': 2,
    'no-debugger': 2,
    'no-div-regex': 2,
    'no-dupe-keys': 2,
    'no-eval': 2,
    'no-extend-native': 2,
    'no-extra-bind': 2,
    'no-implicit-coercion': [
      2,
      {
        'boolean': false,
      },
    ],
    'no-implied-eval': 2,
    'no-iterator': 2,
    'no-lone-blocks': 2,
    'no-native-reassign': 2,
    'no-redeclare': 2,
    'no-restricted-globals': [2, 'error', 'event', 'Animation'],
    'no-script-url': 2,
    'no-self-compare': 2,
    'no-sequences': 2,
    'no-throw-literal': 2,
    'no-unused-expressions': 0,
    'no-unused-vars': [
      2,
      {
        'argsIgnorePattern': '^(var_args$|opt_|unused)',
        'varsIgnorePattern': '(AmpElement|Def|Interface)$',
      },
    ],
    'no-useless-call': 2,
    'no-useless-concat': 2,
    'no-undef': 2,
    'no-var': 2,
    'notice/notice': [
      2,
      {
        'mustMatch': 'Copyright 20\\d{2} The AMP HTML Authors\\.',
        'templateFile': 'build-system/common/LICENSE-TEMPLATE.txt',
        'messages': {
          'whenFailedToMatch': 'Missing or incorrect license header',
        },
      },
    ],
    'object-shorthand': [
      2,
      'properties',
      {
        'avoidQuotes': true,
      },
    ],
    'prefer-const': 2,
    'prettier/prettier': 2,
    'radix': 2,
    'react/jsx-uses-react': 2,
    'react/jsx-uses-vars': 2,
    'react-hooks/rules-of-hooks': 2,
    'react-hooks/exhaustive-deps': 2,
    'require-jsdoc': [
      2,
      {
        'require': {
          'FunctionDeclaration': true,
          'MethodDefinition': true,
          'ClassDeclaration': false,
          'ArrowFunctionExpression': false,
          'FunctionExpression': false,
        },
      },
    ],
    'sort-destructure-keys/sort-destructure-keys': 2,
    'import/order': [
      // Disabled for now, so individual folders can opt-in one PR at a time and
      // minimize disruption/merge conflicts
      0,
      {
        // Split up imports groups with exactly one newline
        'newlines-between': 'always',
        // Sort imports within each group alphabetically, ignoring case
        'alphabetize': {
          'order': 'asc',
          'caseInsensitive': true,
        },

        'pathGroups': [
          // Define each import alias (#core, #preact, etc.) as its own group.
          ...Object.keys(importAliases).map((alias) => ({
            // Group imports from `#alias/foobar` and `#alias` together.
            'pattern': `${alias}{,/**}`,
            'group': 'internal',
            'position': 'before',
          })),
        ],
        'pathGroupsExcludedImportTypes': Object.keys(importAliases),

        // Order the input groups first as builtins, then #internal, followed by
        // same-directory and submodule imports, then relative imports that
        // reach into parent directories.
        'groups': [
          // import * as Preact from '#preact/index'
          ['builtin', 'external'],
          'internal',
          ['index', 'sibling'],
          'parent',
        ],
      },
    ],
    'sort-imports': [
      2,
      {
        'allowSeparatedGroups': true,
        'ignoreDeclarationSort': true,
      },
    ],
    'sort-requires/sort-requires': 2,
  },
  'overrides': [
    {
      'files': [
        'test/**/*.js',
        'extensions/**/test/**/*.js',
        'extensions/**/test-e2e/*.js',
        'ads/**/test/**/*.js',
        'testing/**/*.js',
        'build-system/**/test/*.js',
      ],
      'rules': {
        'require-jsdoc': 0,
        'local/always-call-chai-methods': 2,
        'local/no-bigint': 0,
        'local/no-dynamic-import': 0,
        'local/no-function-async': 0,
        'local/no-function-generator': 0,
        'local/no-import-meta': 0,
        'local/no-invalid-this': 0,
        'jsdoc/check-param-names': 0,
        'jsdoc/check-tag-names': 0,
        'jsdoc/check-types': 0,
        'jsdoc/require-param': 0,
        'jsdoc/require-param-name': 0,
        'jsdoc/require-param-type': 0,
        'jsdoc/require-returns': 0,
        'jsdoc/require-returns-type': 0,
      },
      'globals': {
        'it': false,
        'chai': false,
        'expect': false,
        'describe': false,
        'beforeEach': false,
        'afterEach': false,
        'before': false,
        'after': false,
        'assert': false,
        'describes': true,
        'allowConsoleError': false,
        'expectAsyncConsoleError': false,
        'restoreAsyncErrorThrows': false,
        'stubAsyncErrorThrows': false,
        'Key': false,
      },
    },
    {
      'files': ['**/test-*', '**/*_test.js', '**/testing/**'],
      'rules': {
        'local/no-forbidden-terms': [2, forbiddenTermsGlobal],
      },
    },
    {
      'files': ['**/storybook/*.js'],
      'settings': {
        'import/core-modules': [
          '@storybook/addon-knobs',
          '@storybook/addon-a11y',
          '@ampproject/storybook-addon',
        ],
      },
      'rules': {
        'local/no-forbidden-terms': [2, forbiddenTermsGlobal],
        'require-jsdoc': 0,
      },
    },
    {
      'files': [
        '**/.eslintrc.js',
        'amp.js',
        'babel.config.js',
        'package-scripts.js',
      ],
      'globals': {
        'module': false,
        'process': false,
        'require': false,
      },
      'rules': {
        'local/no-forbidden-terms': 0,
        'local/no-module-exports': 0,
      },
    },
    {
      'files': ['**/*.extern.js', '**/*.type.js'],
      'rules': {
        'no-var': 0,
        'no-undef': 0,
        'no-unused-vars': 0,
        'prefer-const': 0,
        'require-jsdoc': 0,
        'jsdoc/check-tag-names': 0,
        'local/closure-type-primitives': 0,
        'local/no-duplicate-name-typedef': 0,
        'google-camelcase/google-camelcase': 0,
      },
    },
    {
      'files': ['**/rollup.config.js'],
      'settings': {
        'import/core-modules': [
          '@rollup/plugin-alias',
          'rollup-plugin-babel',
          'rollup-plugin-cleanup',
        ],
      },
    },
  ],
};
