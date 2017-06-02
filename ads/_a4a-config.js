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

import {
  adsenseIsA4AEnabled,
} from '../extensions/amp-ad-network-adsense-impl/0.1/adsense-a4a-config';
import {
  doubleclickIsA4AEnabled,
} from
'../extensions/amp-ad-network-doubleclick-impl/0.1/doubleclick-a4a-config';
import {
  fakeIsA4AEnabled,
} from
'../extensions/amp-ad-network-fake-impl/0.1/fake-a4a-config';
import {
  tripleliftIsA4AEnabled,
} from
'../extensions/amp-ad-network-triplelift-impl/0.1/triplelift-a4a-config';
import {
  cloudflareIsA4AEnabled,
} from
'../extensions/amp-ad-network-cloudflare-impl/0.1/cloudflare-a4a-config';
import {
  gmosspIsA4AEnabled,
} from
'../extensions/amp-ad-network-gmossp-impl/0.1/gmossp-a4a-config';
import {getMode} from '../src/mode';
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
 * @type {!Object<!string, !function(!Window, !Element): boolean>}
 */
export const a4aRegistry = map({
  'adsense': adsenseIsA4AEnabled,
  'doubleclick': doubleclickIsA4AEnabled,
  'triplelift': tripleliftIsA4AEnabled,
  'cloudflare': cloudflareIsA4AEnabled,
  'gmossp': gmosspIsA4AEnabled,
  // TODO: Add new ad network implementation "is enabled" functions here.  Note:
  // if you add a function here that requires a new "import", above, you'll
  // probably also need to add a whitelist exception to
  // build-system/dep-check-config.js in the "filesMatching: 'ads/**/*.js' rule.
});

// Note: the 'fake' ad network implementation is only for local testing.
// Normally, ad networks should add their *IsA4AEnabled callback directly
// to the a4aRegistry, above.  Ad network implementations should NOT use
// getMode() in this file.  If they need to check getMode() state, they
// should do so inside their *IsA4AEnabled callback.
if (getMode().localDev || getMode().test) {
  a4aRegistry['fake'] = fakeIsA4AEnabled;
}

/**
 * An object mapping signing server names to their corresponding URLs.
 * @type {!Object<string, string>}
 */
export const signingServerURLs = {
  'google': 'https://cdn.ampproject.org/amp-ad-verifying-keyset.json',
  'google-dev': 'https://cdn.ampproject.org/amp-ad-verifying-keyset-dev.json',
  'cloudflare': 'https://amp.cloudflare.com/amp-ad-verifying-keyset.json',
  'cloudflare-dev': 'https://amp.cloudflare.com/amp-ad-verifying-keyset-dev.json',
};

/** @type {!../extensions/amp-a4a/0.1/refresh-manager.RefreshConfig} */
const DEFAULT_REFRESH_CONFIG = {
  visiblePercentageMin: 50,
  totalTimeMin: 0,
  continuousTimeMin: 5000,
  refreshInterval: 5000,
};

/**
 * An object mapping networks to refresh configuratons. No mapping implies the
 * network has not opted in to become refresh-eligible. See
 * ../extensions/amp-a4a/0.1/refresh-manager for the RefreshConfig definition.
 *
 * @type {!Object<string, !../extensions/amp-a4a/0.1/refresh-manager.RefreshConfig>}
 */
export const refreshConfigs = {
  'doubleclick': DEFAULT_REFRESH_CONFIG,
};
