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
  AmpAnalyticsConfigDef,
  extractAmpAnalyticsConfig,
} from '../../../ads/google/a4a/utils';
import {getMultiSizeDimensions} from '../../../ads/google/utils';
import {
  googleLifecycleReporterFactory,
  setGoogleLifecycleVarsFromHeaders,
} from '../../../ads/google/a4a/google-data-reporter';
import {stringHash32} from '../../../src/crypto';
import {dev} from '../../../src/log';
import {extensionsFor} from '../../../src/services';
import {isExperimentOn} from '../../../src/experiments';
import {domFingerprintPlain} from '../../../src/utils/dom-fingerprint';
import {insertAnalyticsElement} from '../../../src/analytics';
import {setStyles} from '../../../src/style';

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

    /**
     * Config to generate amp-analytics element for active view reporting.
     * @type {?JSONType}
     * @private
     */
    this.ampAnalyticsConfig_ = null;

    /** @private {!../../../src/service/extensions-impl.Extensions} */
    this.extensions_ = extensionsFor(this.win);

    /** @private {../../../src/service/xhr-impl.FetchResponseHeaders} */
    this.responseHeaders_ = null;

    /** @private {?({width, height}|../../../src/layout-rect.LayoutRectDef)} */
    this.size_ = null;
  }

  /** @override */
  isValidElement() {
    return isGoogleAdsA4AValidEnvironment(this.win) && this.isAmpAdElement() &&
        // Ensure not within remote.html iframe.
        !document.querySelector('meta[name=amp-3p-iframe-src]');
  }

  /** @override */
  getAdUrl() {
    // TODO: Check for required and allowed parameters. Probably use
    // validateData, from 3p/3p/js, after noving it someplace common.
    const startTime = Date.now();
    const global = this.win;
    const width = Number(this.element.getAttribute('width'));
    const height = Number(this.element.getAttribute('height'));
    // If dc-use-attr-for-format experiment is on, we want to make our attribute
    // check to be more strict.
    const useAttributesForSize =
        isExperimentOn(this.win, 'dc-use-attr-for-format')
        ? !isNaN(width) && width > 0 && !isNaN(height) && height > 0
        : width && height;
    this.size_ = useAttributesForSize
        ? {width, height}
        : this.getIntersectionElementLayoutBox();
    let sizeStr = `${this.size_.width}x${this.size_.height}`;
    const rawJson = this.element.getAttribute('json');
    const jsonParameters = rawJson ? JSON.parse(rawJson) : {};
    const tfcd = jsonParameters['tagForChildDirectedTreatment'];
    const adTestOn = isInManualExperiment(this.element);

    const multiSizeDataStr = this.element.getAttribute('data-multi-size');
    if (multiSizeDataStr) {
      const multiSizeValidation = this.element
          .getAttribute('data-multi-size-validation') || 'true';
      // The following call will check all specified multi-size dimensions,
      // verify that they meet all requirements, and then return all the valid
      // dimensions in an array.
      const dimensions = getMultiSizeDimensions(
          multiSizeDataStr,
          Number(this.element.getAttribute('width')),
          Number(this.element.getAttribute('height')),
          multiSizeValidation == 'true');
      sizeStr += '|' + dimensions
          .map(dimension => dimension.join('x'))
          .join('|');
    }

    return googleAdUrl(this, DOUBLECLICK_BASE_URL, startTime, [
      {name: 'iu', value: this.element.getAttribute('data-slot')},
      {name: 'co', value: jsonParameters['cookieOptOut'] ? '1' : null},
      {name: 'adk', value: this.adKey_(sizeStr)},
      {name: 'gdfp_req', value: '1'},
      {name: 'impl', value: 'ifr'},
      {name: 'sfv', value: 'A'},
      {name: 'sz', value: sizeStr},
      {name: 'tfcd', value: tfcd == undefined ? null : tfcd},
      {name: 'u_sd', value: global.devicePixelRatio},
      {name: 'adtest', value: adTestOn ? 'on' : null},
      {name: 'asnt', value: this.sentinel},
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
    setGoogleLifecycleVarsFromHeaders(responseHeaders, this.lifecycleReporter_);
    this.ampAnalyticsConfig_ = extractAmpAnalyticsConfig(
        this,
        responseHeaders,
        this.lifecycleReporter_.getDeltaTime(),
        this.lifecycleReporter_.getInitTime());
    if (this.ampAnalyticsConfig_) {
      // Load amp-analytics extensions
      this.extensions_./*OK*/loadExtension('amp-analytics');
    }
    const adResponsePromise =
        extractGoogleAdCreativeAndSignature(responseText, responseHeaders);
    return adResponsePromise.then(adResponse => {
      // If the server returned a size, use that, otherwise use the size that
      // we sent in the ad request.
      if (adResponse.size) {
        this.size_ = adResponse.size;
      } else {
        adResponse.size = this.size_;
      }
      this.handleResize_(adResponse.size.width, adResponse.size.height);
      return Promise.resolve(adResponse);
    });
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
    this.ampAnalyticsConfig_ = null;
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
      insertAnalyticsElement(this.element, this.ampAnalyticsConfig_, true);
    }

    this.lifecycleReporter_.addPingsForVisibility(this.element);

    setStyles(dev().assertElement(this.iframe), {
      width: `${this.size_.width}px`,
      height: `${this.size_.height}px`,
    });
  }

  /**
   * @param {string} size
   * @return {string} The ad unit hash key string.
   * @private
   */
  adKey_(size) {
    const element = this.element;
    const domFingerprint = domFingerprintPlain(element);
    const slot = element.getAttribute('data-slot') || '';
    const multiSize = element.getAttribute('data-multi-size') || '';
    const string = `${slot}:${size}:${multiSize}:${domFingerprint}`;
    return stringHash32(string);
  }

  /**
   * Attempts to resize the ad, if the returned size is smaller than the primary
   * dimensions.
   * @param {number} width
   * @param {number} height
   * @private
   */
  handleResize_(width, height) {
    const pWidth = this.element.getAttribute('width');
    const pHeight = this.element.getAttribute('height');
    // We want to resize only if neither returned dimension is larger than its
    // primary counterpart, and if at least one of the returned dimensions
    // differ from its primary counterpart.
    if ((width != pWidth || height != pHeight)
        && (width <= pWidth && height <= pHeight)) {
      this.attemptChangeSize(height, width).catch(() => {});
    }
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
  const serialized = targeting ?
      Object.keys(targeting).map(key => serializeItem(key, targeting[key])) :
      [];
  if (categoryExclusions) {
    serialized.push(serializeItem('excl_cat', categoryExclusions));
  }
  return serialized.length ? serialized.join('&') : null;
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
