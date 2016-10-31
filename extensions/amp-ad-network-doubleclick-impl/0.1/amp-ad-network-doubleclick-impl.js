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
  isInManualExperiment,
} from '../../../ads/google/a4a/traffic-experiments';
import {
  extractGoogleAdCreativeAndSignature,
  googleAdUrl,
  isGoogleAdsA4AValidEnvironment,
  getCorrelator,
} from '../../../ads/google/a4a/utils';
import {getLifecycleReporter} from '../../../ads/google/a4a/performance';

/** @const {string} */
const DOUBLECLICK_BASE_URL =
    'https://securepubads.g.doubleclick.net/gampad/ads';

export class AmpAdNetworkDoubleclickImpl extends AmpA4A {

  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);

    /**
     * @type {!../../../ads/google/a4a/performance.GoogleAdLifecycleReporter}
     */
    this.lifecycleReporter_ = this.lifecycleReporter_ ||
        this.initLifecycleReporter();
  }

  /** @override */
  isValidElement() {
    return isGoogleAdsA4AValidEnvironment(this.win, this.element) &&
        this.isAmpAdElement() &&
        // Ensure not within remote.html iframe.
        !document.querySelector('meta[name=amp-3p-iframe-src]');
  }

  /** @override */
  getAdUrl() {
    const startTime = Date.now();
    const global = this.win;
    const slotId = this.element.getAttribute('data-amp-slot-index');
    const slotIdNumber = Number(slotId);
    const correlator = getCorrelator(global, slotId);
    const slotRect = this.getIntersectionElementLayoutBox();
    const rawJson = this.element.getAttribute('json');
    const jsonParameters = rawJson ? JSON.parse(rawJson) : {};
    const tfcd = jsonParameters['tfcd'];
    const adTestOn = isInManualExperiment(this.element);
    return googleAdUrl(this, DOUBLECLICK_BASE_URL, startTime, slotIdNumber, [
      {name: 'iu', value: this.element.getAttribute('data-slot')},
      {name: 'co', value: jsonParameters['cookieOptOut'] ? '1' : null},
      {name: 'gdfp_req', value: '1'},
      {name: 'd_imp', value: '1'},
      {name: 'impl', value: 'ifr'},
      {name: 'sfv', value: 'A'},
      {name: 'sz', value: `${slotRect.width}x${slotRect.height}`},
      {name: 'tfcd', value: tfcd == undefined ? null : tfcd},
      {name: 'u_sd', value: global.devicePixelRatio},
      {name: 'adtest', value: adTestOn},
      {name: 'ifi', value: slotIdNumber},
      {name: 'c', value: correlator},

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

  /** @override */
  emitLifecycleEvent(eventName, opt_associatedEventData) {
    this.lifecycleReporter_ = this.lifecycleReporter_ ||
        this.initLifecycleReporter();
    switch (eventName) {
      case 'adRequestEnd':
        const fetchResponse = opt_associatedEventData;
        const qqid = fetchResponse.headers.get(
            this.lifecycleReporter_.QQID_HEADER);
        this.lifecycleReporter_.setQqid(qqid);
        break;
      case 'adSlotCleared':
        this.lifecycleReporter_.sendPing(eventName);
        this.lifecycleReporter_.reset();
        this.element.setAttribute('data-amp-slot-index',
            this.win.ampAdSlotIdCounter++);
        this.lifecycleReporter_ = this.initLifecycleReporter();
        return;
      case 'adSlotBuilt':
      case 'urlBuilt':
      case 'adRequestStart':
      case 'extractCreativeAndSignature':
      case 'adResponseValidateStart':
      case 'renderFriendlyStart':
      case 'renderCrossDomainStart':
      case 'renderFriendlyEnd':
      case 'renderCrossDomainEnd':
      case 'preAdThrottle':
      case 'renderSafeFrameStart':
        break;
      default:
    }
    this.lifecycleReporter_.sendPing(eventName);
  }

  /**
   * @return {!../../../ads/google/a4a/performance.GoogleAdLifecycleReporter}
   */
  initLifecycleReporter() {
    const reporter =
        /** @type {!../../../ads/google/a4a/performance.GoogleAdLifecycleReporter} */
        (getLifecycleReporter(this, 'a4a', undefined,
                              this.element.getAttribute(
                                  'data-amp-slot-index')));
    return reporter;
  }
}

AMP.registerElement(
    'amp-ad-network-doubleclick-impl', AmpAdNetworkDoubleclickImpl);

/**
 * @param {?Object<string, (!Array<string>|string)>} targeting
 * @param {?(!Array<string>|string)} categoryExclusions
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
