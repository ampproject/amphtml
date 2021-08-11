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
'use strict';

// Babel cannot directly return a valid css file.
// Therefore we provide and export this options object to allow extraction
// of the created css file via side effect from running babel.transfrorm().
const jssOptions = {css: 'REPLACED_BY_BABEL'};

/**
 * Gets the config for transforming a JSS file to CSS
 * Only used to generate CSS files for Bento components.
 *
 * @return {!Object}
 */
function getJssConfig() {
  return {
    plugins: [
      ['./build-system/babel-plugins/babel-plugin-transform-jss', jssOptions],
    ],
  };
}

module.exports = {
  getJssConfig,
  jssOptions,
};
