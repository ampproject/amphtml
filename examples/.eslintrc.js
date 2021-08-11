/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

module.exports = {
  'rules': {
    'jsdoc/check-param-names': 0,
    'jsdoc/check-tag-names': 0,
    'jsdoc/check-types': 0,
    'jsdoc/require-param-name': 0,
    'jsdoc/require-param-type': 0,
    'jsdoc/require-param': 0,
    'jsdoc/require-returns-type': 0,
    'jsdoc/require-returns': 0,
    'local/no-array-destructuring': 0,
    'local/no-bigint': 0,
    'local/no-deep-destructuring': 0,
    'local/no-dynamic-import': 0,
    'local/no-es2015-number-props': 0,
    'local/no-export-side-effect': 0,
    'local/no-forbidden-terms': 0,
    'local/no-function-async': 0,
    'local/no-function-generator': 0,
    'local/no-global': 0,
    'local/no-has-own-property-method': 0,
    'local/no-import-meta': 0,
    'local/no-import-rename': 0,
    'local/no-import': 0,
    'local/no-invalid-this': 0,
    'local/no-is-amp-alt': 0,
    'local/no-log-array': 0,
    'local/no-mixed-operators': 0,
    'local/no-module-exports': 0,
    'local/no-rest': 0,
    'local/no-spread': 0,
    'local/no-static-this': 0,
    'local/no-style-display': 0,
    'local/no-style-property-setting': 0,
    'local/no-unload-listener': 0,
    'local/preact': 0,
    'local/prefer-deferred-promise': 0,
    'local/prefer-destructuring': 0,
    'local/prefer-spread-props': 0,
    'local/prefer-unnested-spread-objects': 0,
    'local/private-prop-names': 0,
    'local/query-selector': 0,
    'require-jsdoc': 0,
  },
  'overrides': [
    {
      'files': ['!visual-tests/**/*.js'],
      'rules': {
        'no-undef': 0,
        'no-unused-vars': 0,
        'no-var': 0,
        'warnings': 0,
      },
    },
    {
      'files': ['visual-tests/**/*.js'],
      'env': {
        'node': true,
      },
    },
  ],
};
