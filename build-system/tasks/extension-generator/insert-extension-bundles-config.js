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
const {execOrThrow} = require('../../common/exec');
const {readJsonSync, writeJsonSync} = require('fs-extra');

const extensionBundlesJson =
  'build-system/compile/bundles.config.extensions.json';

/**
 * Inserts an extension entry into bundles.config.extensions.json
 *
 * @param {{
 *   name: string,
 *   version: string,
 *   latestVersion?: (string|undefined)
 *   options: ({hasCss: boolean}|undefined)
 * }} bundle
 */
function insertExtensionBundlesConfig(bundle) {
  const extensionBundles = readJsonSync(extensionBundlesJson);

  const existingOrNull = extensionBundles.find(
    ({name}) => name === bundle.name
  );

  extensionBundles.push({
    ...bundle,
    latestVersion:
      (existingOrNull && existingOrNull.latestVersion) ||
      bundle.latestVersion ||
      bundle.version,
  });

  writeJsonSync(
    extensionBundlesJson,
    extensionBundles.sort((a, b) => {
      if (!a.name) {
        return 1;
      }
      if (!b.name) {
        return -1;
      }
      return a.name.localeCompare(b.name);
    })
  );

  execOrThrow(
    `npx prettier --write ${extensionBundlesJson}`,
    'Could not format extension bundle'
  );
}

module.exports = {insertExtensionBundlesConfig};
