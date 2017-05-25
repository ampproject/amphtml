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
  truncAndTimeUrl,
  googleBlockParameters,
  googlePageParameters,
  isGoogleAdsA4AValidEnvironment,
  AmpAnalyticsConfigDef,
  extractAmpAnalyticsConfig,
  groupAmpAdsByType,
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
import {extensionsFor, xhrFor} from '../../../src/services';
import {isExperimentOn} from '../../../src/experiments';
import {domFingerprintPlain} from '../../../src/utils/dom-fingerprint';
import {insertAnalyticsElement} from '../../../src/analytics';
import {setStyles} from '../../../src/style';
import {utf8Encode} from '../../../src/utils/bytes';
import {cancellation, isCancellation} from '../../../src/error';

/** @type {string} */
const TAG = 'amp-ad-network-doubleclick-impl';

/** @const {string} */
const DOUBLECLICK_BASE_URL =
    'https://securepubads.g.doubleclick.net/gampad/ads';

/** @private @const {!Object<string,string>} */
const PAGE_LEVEL_PARAMS_ = {
  'gdfp_req': '1',
  'sfv': 'A',
};

/** @private @const {string} */
const TFCD_ = 'tagForChildDirectedTreatment';

/** @private {?Promise} */
let SraRequests = null;

/**
 * @private @const
 * {!Array<!function(AmpAdNetworkDoubleclickImpl>):?Object<string,string>}
 */
const BLOCK_SRA_COMBINERS_ = [
  instances => {
    const uniqueIuNames = [];
    const prevIusEncoded = [];
    instances.forEach(instance => {
      const iu = dev().assert(instance.element.getAttribute('data-slot'));
      const componentNames = (iu || '').split('/');
      let encodedName = '';
      for (let i = 0; i < componentNames.length; i++) {
        if (i > 0) {
          encodedName += '/';
        }
        if (componentNames[i] == '') {
          continue;
        }
        let nameFound = false;
        for (let j = 0; j < uniqueIuNames.length; j++) {
          if (componentNames[i] == uniqueIuNames[j]) {
            nameFound = true;
            break;
          }
        }
        if (!nameFound) {
          uniqueIuNames.push(componentNames[i]);
        }
        for (let j = 0; j < uniqueIuNames.length; j++) {
          // find index of component name.
          if (componentNames[i] == uniqueIuNames[j]) {
            encodedName += j;
            break;
          }
        }
      }
      prevIusEncoded.push(encodedName);
    });
    return {
      'iu_parts': uniqueIuNames.join(),
      'enc_prev_ius': prevIusEncoded.join(),
    };
  },
  instances => {
    // Although declared at a block-level, this is actually page level so
    // return true if ANY indicate cookie opt out.
    for (let i = 0; i < instances.length; i++) {
      if (instances.jsonTargeting_ &&
          instances.jsonTargeting_['cookieOptOut']) {
        return {'co': '1'};
      }
    }
    return null;
  },
  instances => {
    return {'adks': instances.map(instance => instance.adKey_).join()};
  },
  instances => {
    return {'prev_iu_szs': instances.map(instance =>
      `${instance.size_.width}x${instance.size_.height}`).join()};
  },
  instances => {
    // Although declared at a block-level, this is actually page level so
    // return true if ANY indicate TFCD.
    for (let i = 0; i < instances.length; i++) {
      const instance = instances[i];
      if (instance.jsonTargeting_ && instance.jsonTargeting_[TFCD_]) {
        return {'tfcd': instance.jsonTargeting_[TFCD_]};
      }
    }
    return null;
  },
  instances => {
    // Although declared at a block-level, this is actually page level so
    // return true if ANY indicate TFCD.
    for (let i = 0; i < instances.length; i++) {
      const instance = instances[i];
      if (isInManualExperiment(instance.element)) {
        return {'adtest': 'on'};
      }
    }
    return null;
  },
  instances => {
    const scps = [];
    instances.forEach(instance => {
      if (!instance.jsonTargeting_) {
        return;
      }
      scps.push(serializeTargeting(
          instance.jsonTargeting_['targeting'] || null,
          instance.jsonTargeting_['categoryExclusions'] || null));
    });
    return scps.length ? {'prev_scp': scps.join('|')} : null;
  },
  instances => {
    const eids = {};
    instances.forEach(instance => {
      const currEids = instance.element.getAttribute('data-experiment-id');
      if (currEids) {
        currEids.split(',').forEach(eid => eids[eid] = 1);
      }
    });
    return Object.keys(eids).length ? {'eid': Object.keys(eids).join()} : null;
  },
];

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

    /** @private {!Object<string,*>}*/
    this.jsonTargeting_ = null;

    /** @private {number} */
    this.adKey_ = 0;

    // TODO(keithwrightbos) - how can pub enable?
    /** @private @const {boolean} */
    this.useSra_ = getMode().localDev && /(\?|&)force_sra=true(&|$)/.test(
        this.win.location.search);

    /** @private {?function(?../../../src/service/xhr-impl.FetchResponse)} */
    this.sraResponseResolver_ = null;

    /** @private {!function<?Error>} */
    this.sraResponseRejecter_ = null;

    /** @private {!Promise<?../../../src/service/xhr-impl.FetchResponse>} */
    this.sraResponsePromise_ = new Promise((resolver, rejecter) => {
      this.sraResponseResolver_ = resolver;
      this.sraResponseRejecter_ = rejecter;
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
      this.blockLevelParamsResolver_(null);
    }
    return valid;
  }

  /**
   * Constructs block-level url parameters with side effect of setting
   * size_, jsonTargeting_, and adKey_ fields.
   * @return {!Object<string,string|boolean|number>}
   */
  getBlockParameters_() {
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
    this.jsonTargeting_ = rawJson ? JSON.parse(rawJson) : {};
    const tfcd = this.jsonTargeting_[TFCD_];
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
    this.adKey_ = this.generateAdKey_(sizeStr);
    return Object.assign({
      'iu': this.element.getAttribute('data-slot'),
      'co': this.jsonTargeting_['cookieOptOut'] ? '1' : null,
      'adk': this.adKey_,
      'sz': sizeStr,
      'tfcd': tfcd == undefined ? null : tfcd,
      'adtest': isInManualExperiment(this.element) ? 'on' : null,
      'scp': serializeTargeting(
          this.jsonTargeting_['targeting'] || null,
          this.jsonTargeting_['categoryExclusions'] || null),
    }, googleBlockParameters(this));;
  }

  /** @override */
  getAdUrl() {
    if (this.iframe) {
      dev().warn(TAG, `Frame already exists, sra: ${this.useSra_}`);
      this.adUrlResolver_('');
      return '';
    }
    // TODO: SRA unnecessarily builds ad url?

    // TODO: Check for required and allowed parameters. Probably use
    // validateData, from 3p/3p/js, after noving it someplace common.
    const startTime = Date.now();
    return getPageLevelParameters_(this.win, this.getAmpDoc(), startTime)
      .then(pageLevelParameters =>
        googleAdUrl(this, DOUBLECLICK_BASE_URL, startTime,
          Object.assign(this.getBlockParameters_(), pageLevelParameters)));
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
    this.jsonTargeting_ = null;
    // TODO: handle SRA!
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
  generateAdKey_(size) {
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
    // Wait for SRA request which will ncall response promise when this block's
    // response has been returned.
    this.initiateSraRequests_();
    // Null response indicates single slot should execute using non-SRA method.
    return this.sraResponsePromise_.then(
      response => response || super.sendXhrRequest(adUrl));
  }

  /**
   * Executes SRA request via the following steps:
   * - create only one executor per page
   * - get all doubleclick amp-ad instances on the page
   * - group by networkID allowing for separate SRA requests
   * - for each grouping, construct SRA request
   * - handle chunks for streaming response for each block
   * @private
   */
  initiateSraRequests_() {
    if (SraRequests) {
      return;
    }
    // Use incrementing of the first slot's promiseId as indication of
    // unlayoutCallback execution.  Assume that if called for one slot, it will
    // be called for all and we should cancel SRA execution.
    const promiseId = this.promiseId;
    const checkStillCurrent = () => {
      if (promiseId != this.promiseId) {
        throw cancellation();
      }
      return true;
    };
    SraRequests = groupAmpAdsByType(
        this.win, this.element.getAttribute('type'), getNetworkId_)
      .then(groupIdToBlocksAry => {
        checkStillCurrent();
        Object.keys(groupIdToBlocksAry).forEach(networkId => {
          const blocks = dev().assert(groupIdToBlocksAry[networkId]);
          // TODO: filter blocks with SRA disabled?
          return Promise.all(blocks).then(instances => {
            // Determine if more than one block for this element, if not do not
            // set sra request promise which results in sending as
            // non-SRA request (benefit is it allows direct cache method).
            dev().assert(instances.length);
            if (instances.length == 1) {
              dev().info(TAG, `single block in network ${networkId}`);
              instances[0].sraResponseResolver_(null);
              return;
            }
            // Construct and send SRA request.
            // Chunk hanlder called with metadata and creative for each slot
            // in order of URLs given.  Construct promise for each slot
            // such that its resolver will be called.
            const sraRequestAdUrlResolvers =
              instances.map(instance => instance.sraResponseResolver_);
            // TODO(keithwrightbos) - how do we handle per slot 204 response?
            return constructSRARequest_(this.win, this.getAmpDoc(), instances)
              .then(sraUrl => checkStillCurrent() && fetchLineDelimitedChunks(
                xhrFor(this.win),
                sraUrl,
                (creative, headers) => {
                  checkStillCurrent();
                  // Force safeframe rendering method.
                  headers[RENDERING_TYPE_HEADER] = XORIGIN_MODE.SAFEFRAME;
                  // Need to convert to FetchResponse object?
                  const fetchResponseHeaders =
                    /** @type {?../../../src/service/xhr-impl.FetchResponseHeaders} */
                    ({
                      get: name => headers[name],
                      has: name => !!headers[name],
                    });
                  const fetchResponse =
                    /** @type {?../../../src/service/xhr-impl.FetchResponse} */
                    ({
                      headers: fetchResponseHeaders,
                      arrayBuffer: () => utf8Encode(creative),
                    });
                  sraRequestAdUrlResolvers.shift()(fetchResponse);
                },
                {
                  mode: 'cors',
                  method: 'GET',
                  credentials: 'include',
                }))
                .catch(error => {
                  const canceled = isCancellation(error);
                  if (!canceled) {
                    user().error(TAG, 'SRA request failure', error, instances);
                  }
                  // Collapse all slots on failure so long as they are not
                  // cancellation.
                  instances.forEach(instance => {
                    // Reset ad url to ensure layoutCallback does not fallback
                    // to frame get which would lose SRA guarantees.
                    // TODO(keithwrightbos): publisher should indicate if
                    // explicit is required!
                    instance.adUrl = null;
                    if (!canceled) {
                      instance.forceCollapse();
                    }
                    instance.sraResponseRejecter_(error);
                  });
                });
          });
        });
      });
  }
}

AMP.registerElement(
    'amp-ad-network-doubleclick-impl', AmpAdNetworkDoubleclickImpl);

/**
 * @param {!Element} element
 * @return {string} networkId from data-ad-slot attribute.
 * @private
 */
function getNetworkId_(element) {
  const networkId = /^\/(\d+)/.exec(
    dev().assertString(element.getAttribute('data-slot')));
  // TODO: guarantee data-ad-slot format as part of isValidElement?
  return networkId ? networkId[1] : '';
}


/**
 * @param {!Window} win
 * @param {!Document} doc
 * @param {!Array<!AmpAdNetworkDoubleclickImpl>} instances
 * @return {!Promise<string>} SRA request URL
 * @private
 */
function constructSRARequest_(win, doc, instances) {
  const startTime = Date.now();
  return getPageLevelParameters_(win, doc, startTime, true)
    .then(pageLevelParameters => {
      const parameters = {};
      BLOCK_SRA_COMBINERS_.forEach(
        combiner => Object.assign(parameters, combiner(instances)));
      return truncAndTimeUrl(DOUBLECLICK_BASE_URL,
        Object.assign(parameters, pageLevelParameters), startTime);
    });
}

/**
 * @param {!Window} win
 * @param {!Document} doc
 * @param {number} startTime
 * @param {boolean=} isSra
 * @return {!Promise<!Object<string,string|number|boolean>>}
 */
function getPageLevelParameters_(win, doc, startTime, isSra) {
  return googlePageParameters(win, doc, startTime, 'ldjh')
    .then(pageLevelParameters => {
      const parameters = Object.assign({}, PAGE_LEVEL_PARAMS_);
      parameters['impl'] = isSra ? 'fifs' : 'ifr';
      return Object.assign(parameters, pageLevelParameters);
    });
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
