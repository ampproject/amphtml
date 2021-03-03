/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {map} from '../src/utils/object';

/**
 * Registry for A4A (AMP Ads for AMPHTML pages) "is supported" predicates.
 * If an ad network, {@code ${NETWORK}}, is registered in this object, then the
 * {@code <amp-ad type="${NETWORK}">} implementation will look up its predicate
 * here. If there is a predicate and it and returns {@code true}, then
 * {@code amp-ad} will attempt to render the ad via the A4A pathway (fetch
 * ad creative via early XHR CORS request; verify that it is validated AMP;
 * and then render directly in the host page by splicing into the host DOM).
 * Otherwise, it will attempt to render the ad via the existing "3p iframe"
 * pathway (delay load into a cross-domain iframe).
 *
 * @type {!Object<string, function(!Window, !Element): boolean>}
 */
let a4aRegistry;

/**
 * Returns the a4a registry map
 * @return {Object}
 */
export function getA4ARegistry() {
  if (!a4aRegistry) {
    a4aRegistry = map({
      'adsense': () => true,
      'adzerk': () => true,
      'doubleclick': () => true,
      'fake': () => true,
      'nws': () => true,
      'valueimpression': () => true,
      // TODO: Add new ad network implementation "is enabled" functions here.
      // Note: if you add a function here that requires a new "import", above,
      // you'll probably also need to add an exception to
      // build-system/test-configs/dep-check-config.js in the
      // "filesMatching: 'ads/**/*.js'" rule.
    });
  }

  return a4aRegistry;
}

/**
 * An object mapping signing server names to their corresponding URLs.
 * @type {!Object<string, string>}
 */
export const signingServerURLs = {
  'google': 'https://cdn.ampproject.org/amp-ad-verifying-keyset.json',
  'google-dev': 'https://cdn.ampproject.org/amp-ad-verifying-keyset-dev.json',
};
