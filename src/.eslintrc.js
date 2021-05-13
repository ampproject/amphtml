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
const {isCiBuild} = require('../build-system/common/ci');

module.exports = {
  'rules': {
    'local/no-global': 2,

    'import/no-restricted-paths': [
      'error',
      {
        'zones': [
          {
            // Disallow importing AMP dependencies into core
            'target': 'src/core',
            'from': 'src',
            'except': ['./core'],
          },
          {
            // Disallow importing AMP dependencies into preact/Bento
            'target': 'src/preact',
            'from': 'src',
            'except': ['./core', './context', './preact'],
          },
          {
            // Disallow importing AMP dependencies into context module
            // TODO(rcebulko): Try to migrate src/context into src/preact
            'target': 'src/context',
            'from': 'src',
            'except': ['./core', './context'],
          },
          {
            // Disallow importing non-core dependencies into polyfills
            'target': 'src/polyfills',
            'from': 'src',
            'except': ['./core', './polyfills'],
          },
        ],
      },
    ],
  },
  // Exclusions where imports are necessary or have not yet been migrated;
  // Do not add to this list
  'overrides': [
    {
      'files': [
        './preact/base-element.js',
        './preact/slot.js',
        './context/node.js',
        './polyfills/fetch.js',
        './polyfills/get-bounding-client-rect.js',
        // TEMPORARY, follow tracking issue #33631
        './preact/component/3p-frame.js',
      ],
      'rules': {'import/no-restricted-paths': isCiBuild() ? 0 : 1},
    },
    {
      'files': [
        './core/window.extern.js',
        './polyfills/custom-elements.extern.js',
      ],
      'rules': {'local/no-global': 0},
    },
  ],
};
