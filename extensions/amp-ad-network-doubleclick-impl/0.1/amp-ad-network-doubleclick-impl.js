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

import {
  AmpA4A,
  RENDERING_TYPE_HEADER,
  XORIGIN_MODE,
} from '../../amp-a4a/0.1/amp-a4a';
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
import {
  fetchLineDelimitedChunks,
} from '../../../ads/google/a4a/line-delimited-response-handler';
import {stringHash32} from '../../../src/crypto';
import {removeElement} from '../../../src/dom';
import {dev, user} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {extensionsFor, resourcesForDoc, xhrFor} from '../../../src/services';
import {isExperimentOn} from '../../../src/experiments';
import {domFingerprintPlain} from '../../../src/utils/dom-fingerprint';
import {insertAnalyticsElement} from '../../../src/analytics';
import {setStyles} from '../../../src/style';
import {utf8Encode} from '../../../src/utils/bytes';

/** @type {string} */
const TAG = 'amp-ad-network-doubleclick-impl';

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

    /** @private {?Element} */
    this.ampAnalyticsElement_ = null;

    // TODO(keithwrightbos) - how can pub enable?
    /** @private @const {boolean} */
    this.useSra_ = getMode().localDev && /[?&]force_sra=true[&|$])/.test(
        this.win.location.search);

    /** @private {?function(string)} */
    this.adUrlResolver_ = null;

    /** @private {!Promise<string>} */
    this.adUrlPromise_ = new Promise(resolver => {
      this.adUrlResolver_ = resolver;
    });
  }

  /** @override */
  isValidElement() {
    const valid = isGoogleAdsA4AValidEnvironment(this.win) &&
      this.isAmpAdElement() &&
      // Ensure not within remote.html iframe.
      !document.querySelector('meta[name=amp-3p-iframe-src]');
    if (!valid) {
      // Resolve ad url promise to ensure invalid elements do not delay SRA
      // request.
      this.adUrlResolver_('');
    }
    return valid;
  }

  /** @override */
  getAdUrl() {
    if (this.iframe) {
      dev().warn(TAG, `Frame already exists, sra: ${this.useSra_}`);
      this.adUrlResolver_(url);
      return '';
    }
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

    const url = googleAdUrl(this, DOUBLECLICK_BASE_URL, startTime, [
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
    this.adUrlResolver_(url);
    return url;
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
    if (this.ampAnalyticsElement_) {
      removeElement(this.ampAnalyticsElement_);
      this.ampAnalyticsElement_ = null;
    }
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
      dev().assert(!this.ampAnalyticsElement_);
      this.ampAnalyticsElement_ =
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

  /** @override */
  sendXhrRequest(adUrl) {
    if (!this.useSra_) {
      return super.sendXhrRequest(adUrl);
    }
    // TODO(keithwrightbos) - additional CSI ping including SRA delay time
    // and number of slots
    return this.waitForSraResponse_().then(adUrlToSlotResponsePromise => {
      dev().assert(adUrlToSlotResponsePromise[adUrl]);
      return adUrlToSlotResponsePromise[adUrl].then(response => {
        const {creative, headers} = response;
        // Force safeframe rendering method.
        headers[RENDERING_TYPE_HEADER] = XORIGIN_MODE.SAFEFRAME;
        // Need to convert to FetchResponse object?
        const fetchResponseHeaders =
          /** @type {?../../../src/service/xhr-impl.FetchResponseHeaders} */({
            get: name => headers[name],
            has: name => !!headers[name],
          });
        return /** @type {?../../../src/service/xhr-impl.FetchResponse} */({
          headers: fetchResponseHeaders,
          arrayBuffer: utf8Encode(creative),
        });
      });
    });
  }

  /**
   * Executes SRA request via the following steps:
   * - wait for each slot's ad url to be constructed
   * - group by network ID
   * - construct SRA request for each network ID
   * - execute SRA request for each network ID using line delimited streamed
   *    response format
   * - construct ad URL to slot response object (metadata and string)
   * @return {Promise<!Object<string,!Promise<!{creative, headers}>>>}
   * @private
   */
  waitForSraResponse_() {
    const type = this.element.getAttribute('type');
    // TODO(keithwrightbos) - race conditions?! what if slot is cancelled
    // in the middle of SRA callback?  How do we clean this up?
    // What if creative was AMP and therefore not destroyed in unlayoutCallback?
    // Ensure that network failure does not cause Frame GET.
    return (this.win['sra_ad_urls_promise'] = this.win['sra_ad_urls_promise'] ||
      // TODO(keithwrightbos) - possible optimization would be to prescan
      // iu values and group in advance saving the need to construct urls.
      resourcesForDoc(this.element).getMeasuredResources(this.win,
        r => r.element.tagName == 'AMP-AD' &&
          r.element.getAttribute('type') == type)
        .then(resources => Promise.all(
          resources.map(r => r.element.getImpl().then(
            // Note that ad url promise could be null if isValidElement returns
            // false.
            instance => instance.adUrlPromise_)))
        .then(adUrls => {
          // Group ad urls by inventory url, network ID.
          const networkIdToUrls = {};
          adUrls.forEach(adUrl => {
            // Ignore empty ad URL as this is indicating invalid element.
            if (!adUrl) {
              return;
            }
            let networkId = /&iu=%2F(\d+)/.exec(adUrl);
            // In case of inability to get networkId, store as 0.
            networkId = networkId && networkId.length ?
              Number(networkId[0]) : 0;
            (networkIdToUrls[networkId] || (networkIdToUrls[networkId] = []))
              .push(adUrl);
          });
          // Send XHR request for each SRA url.
          const adUrlToSlotResponsePromise = {};
          Object.keys(networkIdToUrls).forEach(networkId => {
            // Chunk hanlder called with metadata and creative for each slot
            // in order of URLs given.  Construct promise for each slot
            // such that its resolver will be called.
            const sraRequestAdUrlResolver = [];
            networkIdToUrls[networkId].forEach(currUrl => {
              adUrlToSlotResponsePromise[currUrl] = new Promise(resolver => {
                sraRequestAdUrlResolver.push(resolver);
              });
            });
            // TODO(keithwrightbos) - how do we handle per slot 204 response?
            fetchLineDelimitedChunks(
              xhrFor(this.win),
              constructSRARequest_(networkIdToUrls[networkId]),
              (creative, metadata) => {
                sraRequestAdUrlResolver.shift()(creative, metadata);
              },
              {
                mode: 'cors',
                method: 'GET',
                credentials: 'include',
              }).catch(err => {
                user().error(TAG, 'SRA request failure', err);
                // TODO(keithwrightbos): collapse all slots on failure?
              });
          });
          return adUrlToSlotResponsePromise;
        })));
  }
}

AMP.registerElement(
    'amp-ad-network-doubleclick-impl', AmpAdNetworkDoubleclickImpl);

/**
 * @param {!Array<string>} adUrls for each block to be included.
 * @return {string} SRA request URL
 * @private
 */
function constructSRARequest_(adUrls) {
  return adUrls[0];
}
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
