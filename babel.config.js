/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS-IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Global configuration file for the babelify transform.
 *
 * Notes: From https://babeljs.io/docs/en/plugins#plugin-ordering:
 * 1. Plugins run before Presets.
 * 2. Plugin ordering is first to last.
 * 3. Preset ordering is reversed (last to first).
 */

'use strict';

const minimist = require('minimist');
const {isTravisBuild} = require('./build-system/travis');
const argv = minimist(process.argv.slice(2));

const isDist = argv._.includes('dist');
const {esm} = argv;
const noModuleTarget = {
  'browsers': isTravisBuild()
    ? ['Last 2 versions', 'safari >= 9']
    : ['Last 2 versions'],
};

const moduleTarget = {
  'esmodules': true,
};

// eslint-disable-next-line local/no-module-exports
module.exports = function(api) {
  api.cache(true);
  // `dist` builds do not use any of the default settings below until its
  // an esm build. (Both Multipass and Singlepass)
  if (isDist && !esm) {
    return {};
  }
  return {
    'presets': [
      [
        '@babel/preset-env',
        {
          'modules': isDist ? false : 'commonjs',
          'loose': true,
          'targets': esm ? moduleTarget : noModuleTarget,
        },
      ],
    ],
    'compact': false,
    'sourceType': 'module',
  };
};
