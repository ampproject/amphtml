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

// Because AdSense and DoubleClick are both operated by Google and their A4A
// implementations share some behavior in common, part of the logic for this
// implementation is located in the ads/google/a4a directory rather than here.
// Most other ad networks will want to put their A4A code entirely in the
// extensions/amp-ad-network-${NETWORK_NAME}-impl directory.

import {AmpA4A} from '../../amp-a4a/0.1/amp-a4a';
import {
  extractGoogleAdCreativeAndSignature,
  getGoogleAdSlotCounter,
  googleAdUrl,
  isGoogleAdsA4AValidEnvironment,
} from '../../../ads/google/a4a/utils';
import {timer} from '../../../src/timer';

/** @const {string} */
const DOUBLECLICK_BASE_URL =
    'https://securepubads.g.doubleclick.net/gampad/ads';

export class AmpAdNetworkDoubleclickImpl extends AmpA4A {

  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);
  }

  /** @override */
  isValidElement() {
    return isGoogleAdsA4AValidEnvironment(this.getWin()) &&
        this.isInAmpAdTag() &&
        !document.querySelector('meta[name=amp-3p-iframe-src]');
  }

  /** @override */
  getAdUrl() {
    const startTime = timer.now();
    const global = this.getWin();
    const slotNumber = getGoogleAdSlotCounter(global).nextSlotNumber();
    const slotRect = this.getIntersectionElementLayoutBox();
    const rawJson = this.element.getAttribute('json');
    const jsonParameters = rawJson ? JSON.parse(rawJson) : {};
    const tfcd = jsonParameters['tfcd'];
    return googleAdUrl(this, DOUBLECLICK_BASE_URL, startTime, slotNumber, [
      {name: 'iu', value: this.element.getAttribute('data-slot')},
      {name: 'co', value: jsonParameters['cookieOptOut'] ? '1' : null},
      {name: 'gdfp_req', value: '1'},
      {name: 'impl', value: 'ifr'},
      {name: 'sfv', value: 'A'},
      {name: 'sz', value: `${slotRect.width}x${slotRect.height}`},
      {name: 'tfcd', value: tfcd == undefined ? null : tfcd},
      {name: 'u_sd', value: global.devicePixelRatio},
    ], [
      {
        name: 'scp',
        value: serializeTargeting(
            jsonParameters['targeting'] || null,
            jsonParameters['categoryExclusions'] || null),
      },
    ]);
  }

  /** @override */
  extractCreativeAndSignature(responseText, responseHeaders) {
    return extractGoogleAdCreativeAndSignature(responseText, responseHeaders);
  }

}

AMP.registerElement(
    'amp-ad-network-doubleclick-impl', AmpAdNetworkDoubleclickImpl);

/**
 * @param {?Object<string, (!Array<string>|string)>} targeting
 * @param {?(!Array<string>|string)} value
 * @return {?string}
 */
function serializeTargeting(targeting, categoryExclusions) {
  if (!targeting) {
    return null;
  }
  const serialized = Object.keys(targeting).map(
      key => serializeItem(key, targeting[key]));
  if (categoryExclusions) {
    serialized.push(serializeItem('excl_cat', categoryExclusions));
  }
  return serialized.join('&');
}

/**
 * @param {string} key
 * @param {(!Array<string>|string)} value
 * @return {string}
 */
function serializeItem(key, value) {
  const serializedKey = encodeURIComponent(key);
  const serializedValue = Array.isArray(value) ?
      value.map(encodeURIComponent).join(',') : encodeURIComponent(value);
  return `${serializedKey}=${serializedValue}`;
}
