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

/**
 * Get extensions to be published on npm
 * @return {Array<any>}
 */
function getExtensions() {
  const bundles = require('../compile/bundles.config.extensions.json');
  const extensions = bundles
    .filter((bundle) => bundle.options?.npm)
    .map((bundle) => ({
      'extension': bundle.name,
      'version': bundle.version,
    }));
  return extensions;
}

/**
 * Get semver from extension version and amp version
 * @param {string} extensionVersion
 * @param {string} ampVersion
 * @return {string}
 */
function getSemver(extensionVersion, ampVersion) {
  const major = extensionVersion.split('.', 2)[0];
  const minor = ampVersion.slice(0, 10);
  const patch = Number(ampVersion.slice(-3)); // npm trims leading zeroes in patch number, so mimic this in package.json
  return `${major}.${minor}.${patch}`;
}

module.exports = {
  getExtensions,
  getSemver,
};
