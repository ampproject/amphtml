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
  'parser': 'babel-eslint',
  'plugins': [
    'chai-expect',
    'google-camelcase',
    'jsdoc',
    'local',
    'notice',
    'prettier',
    'react',
    'react-hooks',
    'sort-imports-es6-autofix',
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
  },
  'rules': {
    'chai-expect/missing-assertion': 2,
    'chai-expect/no-inner-compare': 2,
    'chai-expect/terminating-properties': 2,
    'curly': 2,
    'google-camelcase/google-camelcase': 2,
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
          'noinline',
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
    'jsdoc/require-returns': 2,
    'jsdoc/require-returns-type': 2,
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
    'local/no-for-of-statement': 2,
    'local/no-function-async': 2,
    'local/no-function-generator': 2,
    'local/no-global': 0,
    'local/no-has-own-property-method': 2,
    'local/no-import': 2,
    'local/no-import-meta': 2,
    'local/no-import-rename': 2,
    'local/no-is-amp-alt': 2,
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
    'no-warning-comments': [
      2,
      {
        'terms': ['do not submit'],
        'location': 'anywhere',
      },
    ],
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
    'sort-imports-es6-autofix/sort-imports-es6': [
      2,
      {
        'ignoreCase': false,
        'ignoreMemberSort': false,
        'memberSyntaxSortOrder': ['none', 'all', 'multiple', 'single'],
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
      ],
      'rules': {
        'require-jsdoc': 0,
        'local/always-call-chai-methods': 2,
        'local/no-bigint': 0,
        'local/no-dynamic-import': 0,
        'local/no-function-async': 0,
        'local/no-function-generator': 0,
        'local/no-import-meta': 0,
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
      'files': ['babel.config.js', '**/.eslintrc.js'],
      'globals': {
        'module': false,
        'process': false,
        'require': false,
      },
      'rules': {
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
  ],
};
