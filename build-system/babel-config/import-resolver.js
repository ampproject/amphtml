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
'use strict';

const path = require('path');

/**
 * Plugin config for import mapping (in compilation only, not browser).
 * @return {!Array<string|Object>}
 */
function getImportResolver() {
  return [
    'module-resolver',
    {
      'root': [path.resolve('.')],
      'alias': {
        // DO NOT ADD TO THIS
        '#core': './src/core',
        '#extensions': './extensions',
        '#polyfills': './src/polyfills',
      },
    },
  ];
}

module.exports = {getImportResolver};
