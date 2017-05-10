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
import {isExperimentOn} from '../../../src/experiments';
import {
  extractGoogleAdCreativeAndSignature,
  googleAdUrl,
  isGoogleAdsA4AValidEnvironment,
  extractAmpAnalyticsConfig,
  addCsiSignalsToAmpAnalyticsConfig,
} from '../../../ads/google/a4a/utils';
import {
  googleLifecycleReporterFactory,
  setGoogleLifecycleVarsFromHeaders,
} from '../../../ads/google/a4a/google-data-reporter';
import {removeElement} from '../../../src/dom';
import {getMode} from '../../../src/mode';
import {stringHash32} from '../../../src/crypto';
import {dev} from '../../../src/log';
import {extensionsFor} from '../../../src/services';
import {domFingerprintPlain} from '../../../src/utils/dom-fingerprint';
import {
  computedStyle,
  setStyles,
} from '../../../src/style';
import {viewerForDoc} from '../../../src/services';
import {AdsenseSharedState} from './adsense-shared-state';
import {insertAnalyticsElement} from '../../../src/analytics';
import {
  getAdSenseAmpAutoAdsExpBranch,
} from '../../../ads/google/adsense-amp-auto-ads';

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

    /**
     * Config to generate amp-analytics element for active view reporting.
     * @type {?JsonObject}
     * @private
     */
    this.ampAnalyticsConfig_ = null;

    /** @private {!../../../src/service/extensions-impl.Extensions} */
    this.extensions_ = extensionsFor(this.win);

    /** @private {?({width, height}|../../../src/layout-rect.LayoutRectDef)} */
    this.size_ = null;

    /** @private {?Element} */
    this.ampAnalyticsElement_ = null;

    /** @private {?../../../src/service/xhr-impl.FetchResponseHeaders} */
    this.responseHeaders_ = null;
  }

  /** @override */
  isValidElement() {
    return !!this.element.getAttribute('data-ad-client') &&
        isGoogleAdsA4AValidEnvironment(this.win) && this.isAmpAdElement();
  }

  /** @override */
  getAdUrl() {
    // TODO: Check for required and allowed parameters. Probably use
    // validateData, from 3p/3p/js, after moving it someplace common.
    const startTime = Date.now();
    const global = this.win;
    let adClientId = this.element.getAttribute('data-ad-client');
    // Ensure client id format: lower case with 'ca-' prefix.
    adClientId = adClientId.toLowerCase();
    if (adClientId.substring(0, 3) != 'ca-') {
      adClientId = 'ca-' + adClientId;
    }
    const visibilityState = viewerForDoc(this.getAmpDoc())
        .getVisibilityState();
    const adTestOn = this.element.getAttribute('data-adtest') ||
        isInManualExperiment(this.element);
    const width = Number(this.element.getAttribute('width'));
    const height = Number(this.element.getAttribute('height'));
    // Need to ensure these are numbers since width can be set to 'auto'.
    // Checking height just in case.
    this.size_ = isExperimentOn(this.win, 'as-use-attr-for-format')
        && !isNaN(width) && width > 0 && !isNaN(height) && height > 0
        ? {width, height}
        : this.getIntersectionElementLayoutBox();
    const format = `${this.size_.width}x${this.size_.height}`;
    const slotId = this.element.getAttribute('data-amp-slot-index');
    // data-amp-slot-index is set by the upgradeCallback method of amp-ad.
    // TODO(bcassels): Uncomment the assertion, fixing the tests.
    // But not all tests arrange to call upgradeCallback.
    // dev().assert(slotId != undefined);
    const adk = this.adKey_(format);
    this.uniqueSlotId_ = slotId + adk;
    const sharedStateParams = sharedState.addNewSlot(
        format, this.uniqueSlotId_, adClientId);
    const parameters = {
      'client': adClientId,
      format,
      'w': this.size_.width,
      'h': this.size_.height,
      'adtest': adTestOn ? 'on' : null,
      adk,
      'raru': 1,
      'bc': global.SVGElement && global.document.createElementNS ? '1' : null,
      'ctypes': this.getCtypes_(),
      'host': this.element.getAttribute('data-ad-host'),
      'to': this.element.getAttribute('data-tag-origin'),
      'pv': sharedStateParams.pv,
      'channel': this.element.getAttribute('data-ad-channel'),
      'vis': visibilityStateCodes[visibilityState] || '0',
      'wgl': global['WebGLRenderingContext'] ? '1' : '0',
      'asnt': this.sentinel,
      'dff': computedStyle(this.win, this.element)['font-family'],
      'prev_fmts': sharedStateParams.prevFmts || null,
    };

    const experimentIds = [];
    const ampAutoAdsBranch = getAdSenseAmpAutoAdsExpBranch(this.win);
    if (ampAutoAdsBranch) {
      experimentIds.push(ampAutoAdsBranch);
    }

    return googleAdUrl(
        this, ADSENSE_BASE_URL, startTime, parameters, experimentIds);
  }

  /** @override */
  extractCreativeAndSignature(responseText, responseHeaders) {
    setGoogleLifecycleVarsFromHeaders(responseHeaders, this.lifecycleReporter_);
    this.ampAnalyticsConfig_ = extractAmpAnalyticsConfig(this, responseHeaders);
    this.responseHeaders_ = responseHeaders;
    if (this.ampAnalyticsConfig_) {
      // Load amp-analytics extensions
      this.extensions_./*OK*/loadExtension('amp-analytics');
    }
    return extractGoogleAdCreativeAndSignature(responseText, responseHeaders)
        .then(adResponse => {
          adResponse.size = this.size_;
          return Promise.resolve(adResponse);
        });
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

  /**
   * @return {!../../../ads/google/a4a/performance.BaseLifecycleReporter}
   */
  initLifecycleReporter() {
    return googleLifecycleReporterFactory(this);
  }

  /** @override */
  onCreativeRender(isVerifiedAmpCreative) {
    super.onCreativeRender(isVerifiedAmpCreative);
    if (this.ampAnalyticsConfig_) {
      dev().assert(!this.ampAnalyticsElement_);
      dev().assert(this.responseHeaders_);
      addCsiSignalsToAmpAnalyticsConfig(
          this.win,
          this.element,
          this.ampAnalyticsConfig_,
          this.responseHeaders_,
          isVerifiedAmpCreative,
          this.lifecycleReporter_.getDeltaTime(),
          this.lifecycleReporter_.getInitTime());
      this.ampAnalyticsElement_ =
          insertAnalyticsElement(this.element, this.ampAnalyticsConfig_, true);
    }

    this.lifecycleReporter_.addPingsForVisibility(this.element);

    setStyles(dev().assertElement(this.iframe), {
      width: `${this.size_.width}px`,
      height: `${this.size_.height}px`,
    });
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
    if (this.ampAnalyticsElement_) {
      removeElement(this.ampAnalyticsElement_);
      this.ampAnalyticsElement_ = null;
    }
    this.ampAnalyticsConfig_ = null;
    this.responseHeaders_ = null;
  }

  /** @override */
  getPreconnectUrls() {
    return ['https://googleads.g.doubleclick.net'];
  }
}

AMP.registerElement('amp-ad-network-adsense-impl', AmpAdNetworkAdsenseImpl);
