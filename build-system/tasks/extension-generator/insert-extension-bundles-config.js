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

const bundlesConfigJs = 'build-system/compile/bundles.config.js';

/**
 * Inserts an extension entry into bundles.config.js
 *
 * ```
 *    const extensionBundles = [
 *      ...,
 *   +  {
 *   +    name: "amp-foo",
 *   +    version: "1.0",
 *   +  }
 *      ...,
 *    ]
 * ```
 * @param {{name: string, version: string, latestVersion: (string|undefined)}} bundle
 * @return {string}
 */
function insertExtensionBundlesConfig(bundle) {
  // stringify twice to escape into string:
  // {"name": "foo"} -> "{\"name\": \"foo\"}"
  const insertExtensionBundleArg = JSON.stringify(JSON.stringify(bundle));

  execOrThrow(
    [
      'npx jscodeshift',
      `--transform ${__dirname}/jscodeshift/insert-extension-bundles-config.js`,
      `--insertExtensionBundle ${insertExtensionBundleArg}`,
      bundlesConfigJs,
    ].join(' ')
  );

  execOrThrow(
    `./node_modules/prettier/bin-prettier.js --write ${bundlesConfigJs}`
  );
}

module.exports = {insertExtensionBundlesConfig};
