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
// import {dev} from '../../../src/log';
import {
  extractGoogleAdCreativeAndSignature,
  googleAdUrl,
  isGoogleAdsA4AValidEnvironment,
} from '../../../ads/google/a4a/utils';
import {
  googleLifecycleReporterFactory,
  setGoogleLifecycleVarsFromHeaders,
} from '../../../ads/google/a4a/google-data-reporter';
import {getMode} from '../../../src/mode';
import {stringHash32} from '../../../src/crypto';
import {domFingerprintPlain} from '../../../src/utils/dom-fingerprint';
import {viewerForDoc} from '../../../src/viewer';
import {AdsenseSharedState} from './adsense-shared-state';

/** @const {string} */
const ADSENSE_BASE_URL = 'https://googleads.g.doubleclick.net/pagead/ads';

/**
 * See `VisibilityState` enum.
 * @const {!Object<string, string>}
 */
const visibilityStateCodes = {
  'visible': '1',
  'hidden': '2',
  'prerender': '3',
  'unloaded': '5',
};

/**
 * Shared state for AdSense ad slots. This is used primarily for ad request url
 * parameters that depend on previous slots.
 * @const {!AdsenseSharedState}
 */
const sharedState = new AdsenseSharedState();

/** @visibleForTesting */
export function resetSharedState() {
  sharedState.reset();
}

export class AmpAdNetworkAdsenseImpl extends AmpA4A {

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

    /**
     * A unique identifier for this slot.
     * Not initialized until getAdUrl() is called; updated upon each invocation
     * of getAdUrl().
     * @private {?string}
     */
    this.uniqueSlotId_ = null;
  }

  /** @override */
  isValidElement() {
    return isGoogleAdsA4AValidEnvironment(this.win) && this.isAmpAdElement();
  }

  /** @override */
  getAdUrl() {
    // TODO: Check for required and allowed parameters. Probably use
    // validateData, from 3p/3p/js, after moving it someplace common.
    const startTime = Date.now();
    const global = this.win;
    const adClientId = this.element.getAttribute('data-ad-client');
    const slotRect = this.getIntersectionElementLayoutBox();
    const visibilityState = viewerForDoc(this.getAmpDoc())
        .getVisibilityState();
    const adTestOn = this.element.getAttribute('data-adtest') ||
        isInManualExperiment(this.element);
    const format = `${slotRect.width}x${slotRect.height}`;
    const slotId = this.element.getAttribute('data-amp-slot-index');
    // data-amp-slot-index is set by the upgradeCallback method of amp-ad.
    // TODO(bcassels): Uncomment the assertion, fixing the tests.
    // But not all tests arrange to call upgradeCallback.
    // dev().assert(slotId != undefined);
    const adk = this.adKey_(format);
    this.uniqueSlotId_ = slotId + adk;
    const sharedStateParams = sharedState.addNewSlot(
        format, this.uniqueSlotId_, adClientId);

    const paramList = [
      {name: 'client', value: adClientId},
      {name: 'format', value: format},
      {name: 'w', value: slotRect.width},
      {name: 'h', value: slotRect.height},
      {name: 'adtest', value: adTestOn},
      {name: 'adk', value: adk},
      {
        name: 'bc',
        value: global.SVGElement && global.document.createElementNS ?
            '1' : null,
      },
      {name: 'ctypes', value: this.getCtypes_()},
      {name: 'host', value: this.element.getAttribute('data-ad-host')},
      {name: 'to', value: this.element.getAttribute('data-tag-origin')},
      {name: 'pv', value: sharedStateParams.pv},
      {name: 'channel', value: this.element.getAttribute('data-ad-channel')},
      {name: 'vis', value: visibilityStateCodes[visibilityState] || '0'},
      {name: 'wgl', value: global['WebGLRenderingContext'] ? '1' : '0'},
    ];

    if (sharedStateParams.prevFmts) {
      paramList.push({name: 'prev_fmts', value: sharedStateParams.prevFmts});
    }

    return googleAdUrl(
        this, ADSENSE_BASE_URL, startTime, paramList, []);
  }

  /** @override */
  extractCreativeAndSignature(responseText, responseHeaders) {
    setGoogleLifecycleVarsFromHeaders(responseHeaders, this.lifecycleReporter_);
    return extractGoogleAdCreativeAndSignature(responseText, responseHeaders);
  }

  /**
   * @param {string} format
   * @return {string} The ad unit hash key string.
   * @private
   */
  adKey_(format) {
    const element = this.element;
    const slot = element.getAttribute('data-ad-slot') || '';
    const string = `${slot}:${format}:${domFingerprintPlain(element)}`;
    return stringHash32(string);
  }

  /**
   * @return {?string}
   * @private
   */
  getCtypes_() {
    if (!getMode().localDev) {
      return null;
    }
    const ctypesReMatch = /[?&]force_a4a_ctypes=([^&]+)/.exec(
        this.win.location.search);
    // If the RE passes, then length is necessarily > 1.
    if (ctypesReMatch) {
      return ctypesReMatch[1];
    }
    return null;
  }

  /** @override */
  emitLifecycleEvent(eventName, opt_extraVariables) {
    if (opt_extraVariables) {
      this.lifecycleReporter_.setPingParameters(opt_extraVariables);
    }
    this.lifecycleReporter_.sendPing(eventName);
  }

  /** @override */
  unlayoutCallback() {
    super.unlayoutCallback();
    this.element.setAttribute('data-amp-slot-index',
        this.win.ampAdSlotIdCounter++);
    this.lifecycleReporter_ = this.initLifecycleReporter();
    if (this.uniqueSlotId_) {
      sharedState.removeSlot(this.uniqueSlotId_);
    }
  }


  /**
   * @return {!../../../ads/google/a4a/performance.GoogleAdLifecycleReporter}
   */
  initLifecycleReporter() {
    return googleLifecycleReporterFactory(this);
  }
}

AMP.registerElement('amp-ad-network-adsense-impl', AmpAdNetworkAdsenseImpl);
