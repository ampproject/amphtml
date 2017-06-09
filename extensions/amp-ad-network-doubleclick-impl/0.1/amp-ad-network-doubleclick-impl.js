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
  DEFAULT_SAFEFRAME_VERSION,
  assignAdUrlToError,
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
  lineDelimitedStreamer,
  metaJsonCreativeGrouper,
} from '../../../ads/google/a4a/line-delimited-response-handler';
import {stringHash32} from '../../../src/crypto';
import {removeElement} from '../../../src/dom';
import {tryParseJson} from '../../../src/json';
import {dev, user} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {extensionsFor, xhrFor} from '../../../src/services';
import {isExperimentOn} from '../../../src/experiments';
import {domFingerprintPlain} from '../../../src/utils/dom-fingerprint';
import {insertAnalyticsElement} from '../../../src/analytics';
import {setStyles} from '../../../src/style';
import {utf8Encode} from '../../../src/utils/bytes';
import {isCancellation} from '../../../src/error';
import {RefreshManager} from '../../amp-a4a/0.1/refresh-manager';

/** @type {string} */
const TAG = 'amp-ad-network-doubleclick-impl';

/** @const {string} */
const DOUBLECLICK_BASE_URL =
    'https://securepubads.g.doubleclick.net/gampad/ads';

/** @private @const {!Object<string,string>} */
const PAGE_LEVEL_PARAMS_ = {
  'gdfp_req': '1',
  'sfv': DEFAULT_SAFEFRAME_VERSION,
  'u_sd': window.devicePixelRatio,
};

/**
 * @const {string}
 * @visibileForTesting
 */
export const TFCD = 'tagForChildDirectedTreatment';

/** @private {?Promise} */
let sraRequests = null;

/**
 * Array of functions used to combine block level request parameters for SRA
 * request.
 * @private @const
 * {!Array<!function(!Array<AmpAdNetworkDoubleclickImpl>):?Object<string,string>}
 */
const BLOCK_SRA_COMBINERS_ = [
  instances => {
    const uniqueIuNames = {};
    let uniqueIuNamesCount = 0;
    const prevIusEncoded = [];
    instances.forEach(instance => {
      const iu = dev().assert(instance.element.getAttribute('data-slot'));
      const componentNames = (iu || '').split('/');
      const encodedNames = [];
      for (let i = 0; i < componentNames.length; i++) {
        if (componentNames[i] == '') {
          continue;
        }
        let index = uniqueIuNames[componentNames[i]];
        if (index == undefined) {
          uniqueIuNames[componentNames[i]] = (index = uniqueIuNamesCount++);
        }
        encodedNames.push(index);
      }
      prevIusEncoded.push(encodedNames.join('/'));
    });
    return {
      'iu_parts': Object.keys(uniqueIuNames).join(),
      'enc_prev_ius': prevIusEncoded.join(),
    };
  },
  // Although declared at a block-level, this is actually page level so
  // return true if ANY indicate cookie opt out.
  instances => getFirstInstanceValue_(instances, instance => {
    return instance.jsonTargeting_ &&
        instance.jsonTargeting_['cookieOptOut'] ? {'co': '1'} : null;
  }),
  instances => {
    return {'adks': instances.map(instance => instance.adKey_).join()};
  },
  instances => {
    return {'prev_iu_szs': instances.map(instance =>
      `${instance.size_.width}x${instance.size_.height}`).join()};
  },
  // Although declared at a block-level, this is actually page level so
  // return true if ANY indicate TFCD.
  instances => getFirstInstanceValue_(instances, instance => {
    return instance.jsonTargeting_ && instance.jsonTargeting_[TFCD] ?
      {'tfcd': instance.jsonTargeting_[TFCD]} : null;
  }),
  // Although declared at a block-level, this is actually page level so
  // return true if ANY indicate manual experiment.
  instances => getFirstInstanceValue_(instances, instance => {
    return isInManualExperiment(instance.element) ? {'adtest': 'on'} : null;
  }),
  instances => {
    const scps = [];
    instances.forEach(instance => {
      if (!instance.jsonTargeting_) {
        return;
      }
      scps.push(serializeTargeting_(
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
     * @type {?JsonObject}
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

    /** @private {?Object<string,*>}*/
    this.jsonTargeting_ = null;

    /** @private {number} */
    this.adKey_ = 0;

    // TODO(keithwrightbos) - how can pub enable?
    /** @private @const {boolean} */
    this.useSra_ = getMode().localDev && /(\?|&)force_sra=true(&|$)/.test(
        this.win.location.search);

    const sraInitializer = this.initializeSraPromise_();
    /** @protected {?function(?../../../src/service/xhr-impl.FetchResponse)} */
    this.sraResponseResolver = sraInitializer.resolver;

    /** @protected {?function(*)} */
    this.sraResponseRejector = sraInitializer.rejector;

    /** @private {!Promise<?../../../src/service/xhr-impl.FetchResponse>} */
    this.sraResponsePromise_ = sraInitializer.promise;

    /** @private {?RefreshManager} */
    this.refreshManager_ = null;

    /** @private {number} */
    this.refreshCount_ = 0;
  }

  /** @override */
  isValidElement() {
    return isGoogleAdsA4AValidEnvironment(this.win) &&
      this.isAmpAdElement() &&
      // Ensure not within remote.html iframe.
      !document.querySelector('meta[name=amp-3p-iframe-src]');
  }

  /**
   * @return {!{
   *  resolver: ?function(?../../../src/service/xhr-impl.FetchResponse),
   *  rejector: ?function(*),
   *  promise: !Promise<?../../../src/service/xhr-impl.FetchResponse>,
   * }}
   * @private
   */
  initializeSraPromise_() {
    let resolver = null;
    let rejector = null;
    const promise = new Promise((inResolver, inRejector) => {
      resolver = inResolver;
      rejector = inRejector;
    });
    return {resolver, rejector, promise};
  }

  /**
   * Constructs block-level url parameters with side effect of setting
   * size_, jsonTargeting_, and adKey_ fields.
   * @return {!Object<string,string|boolean|number>}
   */
  getBlockParameters_() {
    dev().assert(this.size_);
    dev().assert(this.jsonTargeting_);
    let sizeStr = `${this.size_.width}x${this.size_.height}`;
    const tfcd = this.jsonTargeting_ && this.jsonTargeting_[TFCD];
    const multiSizeDataStr = this.element.getAttribute('data-multi-size');
    if (multiSizeDataStr) {
      const multiSizeValidation = this.element
          .getAttribute('data-multi-size-validation') || 'true';
      // The following call will check all specified multi-size dimensions,
      // verify that they meet all requirements, and then return all the valid
      // dimensions in an array.
      const dimensions = getMultiSizeDimensions(
          multiSizeDataStr,
          this.size_.width, this.size_.height,
          multiSizeValidation == 'true',
          /* Use strict mode only in non-refresh case */ !this.isRefreshing);
      sizeStr += '|' + dimensions
          .map(dimension => dimension.join('x'))
          .join('|');
    }
    return Object.assign({
      'iu': this.element.getAttribute('data-slot'),
      'co': this.jsonTargeting_ &&
          this.jsonTargeting_['cookieOptOut'] ? '1' : null,
      'adk': this.adKey_,
      'sz': sizeStr,
      'tfcd': tfcd == undefined ? null : tfcd,
      'adtest': isInManualExperiment(this.element) ? 'on' : null,
      'scp': serializeTargeting_(
          (this.jsonTargeting_ && this.jsonTargeting_['targeting']) || null,
          (this.jsonTargeting_ &&
            this.jsonTargeting_['categoryExclusions']) || null),
      'rc': this.refreshCount_ ? this.refreshCount_ : null,
    }, googleBlockParameters(this));
  }

  /**
   * Populate's block-level state for ad URL construction.
   * @visibileForTesting
   */
  populateAdUrlState() {
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
    this.jsonTargeting_ =
      tryParseJson(this.element.getAttribute('json')) || {};
    this.adKey_ =
      this.generateAdKey_(`${this.size_.width}x${this.size_.height}`);
  }

  /** @override */
  getAdUrl() {
    if (this.iframe && !this.isRefreshing) {
      dev().warn(TAG, `Frame already exists, sra: ${this.useSra_}`);
      return '';
    }
    // TODO(keithwrightbos): SRA blocks currently unnecessarily generate full
    // ad url.  This could be optimized however non-SRA ad url is required to
    // fallback to non-SRA if single block.
    this.populateAdUrlState();
    // TODO: Check for required and allowed parameters. Probably use
    // validateData, from 3p/3p/js, after noving it someplace common.
    const startTime = Date.now();
    return getPageLevelParameters_(this.win, this.getAmpDoc(), startTime)
        .then(pageLevelParameters =>
        googleAdUrl(this, DOUBLECLICK_BASE_URL, startTime,
            Object.assign(this.getBlockParameters_(), pageLevelParameters),
          ['108809080']));
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
  tearDownSlot() {
    super.tearDownSlot();
    this.element.setAttribute('data-amp-slot-index',
        this.win.ampAdSlotIdCounter++);
    this.lifecycleReporter_ = this.initLifecycleReporter();
    if (this.ampAnalyticsElement_) {
      removeElement(this.ampAnalyticsElement_);
      this.ampAnalyticsElement_ = null;
    }
    this.ampAnalyticsConfig_ = null;
    this.jsonTargeting_ = null;
    // Reset SRA requests to allow for resumeCallback to re-fetch
    // ad requests.  Assumes that unlayoutCallback will be called for all slots
    // in rapid succession (meaning onLayoutMeasure initiated promise chain
    // will not be started until resumeCallback).
    sraRequests = null;
    const sraInitializer = this.initializeSraPromise_();
    this.sraResponseResolver = sraInitializer.resolver;
    this.sraResponseRejector = sraInitializer.rejector;
    this.sraResponsePromise_ = sraInitializer.promise;
  }

  /** @override */
  layoutCallback() {
    const superReturnValue = super.layoutCallback();
    if (!this.refreshManager_) {
      // Will initiate the refresh lifecycle iff the slot has been enabled to
      // do so through an appropriate data attribute, or a page-level meta tag.
      this.refreshManager_ = new RefreshManager(this);
      if (this.refreshManager_.isRefreshable()) {
        this.refreshManager_.initiateRefreshCycle();
      }
    }
    return superReturnValue;
  }

  /**
   * @param {function()} refreshEndCallback
   *
   * @override
   */
  refresh(refreshEndCallback) {
    super.refresh(refreshEndCallback);
    this.refreshCount_++;
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
    // Wait for SRA request which will call response promise when this block's
    // response has been returned.
    this.initiateSraRequests();
    // Null response indicates single slot should execute using non-SRA method.
    return this.sraResponsePromise_.then(
        response => response || super.sendXhrRequest(adUrl));
  }

  /**
   * Groups slots by type and networkId from data-slot parameter.  Exposed for
   * ease of testing.
   * @return {!Promise<!Object<string,!Array<!Promise<!../../../src/base-element.BaseElement>>>>}
   * @visibileForTesting
   */
  groupSlotsForSra() {
    return groupAmpAdsByType(
        this.win, this.element.getAttribute('type'), getNetworkId);
  }

  /**
   * Executes SRA request via the following steps:
   * - create only one executor per page
   * - get all doubleclick amp-ad instances on the page
   * - group by networkID allowing for separate SRA requests
   * - for each grouping, construct SRA request
   * - handle chunks for streaming response for each block
   * @visibileForTesting
   */
  initiateSraRequests() {
    if (sraRequests) {
      return;
    }
    // Use cancellation of the first slot's promiseId as indication of
    // unlayoutCallback execution.  Assume that if called for one slot, it will
    // be called for all and we should cancel SRA execution.
    const checkStillCurrent = this.verifyStillCurrent();
    sraRequests = this.groupSlotsForSra()
      .then(groupIdToBlocksAry => {
        checkStillCurrent();
        Object.keys(groupIdToBlocksAry).forEach(networkId => {
          const blocks = dev().assert(groupIdToBlocksAry[networkId]);
          // TODO: filter blocks with SRA disabled?
          Promise.all(blocks).then(instances => {
            dev().assert(instances.length);
            checkStillCurrent();
            // Exclude any instances that do not have an adPromise_ as this
            // indicates they were invalid.
            const typeInstances =
              /** @type {!Array<!AmpAdNetworkDoubleclickImpl>}*/(instances)
              .filter(instance => {
                const isValid = instance.hasAdPromise();
                if (!isValid) {
                  dev().info(TAG,
                      'Ignoring instance without ad promise as likely invalid',
                      instance.element);
                }
                return isValid;
              });
            if (!typeInstances.length) {
              // Only contained invalid elements.
              return;
            }
            // Determine if more than one block for this element, if not do not
            // set sra request promise which results in sending as
            // non-SRA request (benefit is it allows direct cache method).
            if (typeInstances.length == 1) {
              dev().info(TAG, `single block in network ${networkId}`);
              typeInstances[0].sraResponseResolver(null);
              return;
            }
            // Construct and send SRA request.
            // Chunk hanlder called with metadata and creative for each slot
            // in order of URLs given.  Construct promise for each slot
            // such that its resolver will be called.
            const sraRequestAdUrlResolvers =
              typeInstances.map(instance => instance.sraResponseResolver);
            const slotCallback = metaJsonCreativeGrouper(
                (creative, headersObj, done) => {
                  checkStillCurrent();
                // Force safeframe rendering method.
                  headersObj[RENDERING_TYPE_HEADER] = XORIGIN_MODE.SAFEFRAME;
                // Construct pseudo fetch response to be passed down the A4A
                // promise chain for this block.
                  const headers =
                  /** @type {?../../../src/service/xhr-impl.FetchResponseHeaders} */
                  ({
                    get: name => headersObj[name],
                    has: name => !!headersObj[name],
                  });
                  const fetchResponse =
                  /** @type {?../../../src/service/xhr-impl.FetchResponse} */
                  ({
                    headers,
                    arrayBuffer: () => utf8Encode(creative),
                  });
                // Pop head off of the array of resolvers as the response
                // should match the order of blocks declared in the ad url.
                // This allows the block to start rendering while the SRA
                // response is streaming back to the client.
                  dev().assert(sraRequestAdUrlResolvers.shift())(fetchResponse);
                // If done, expect array to be empty (ensures ad response
                // included data for all slots).
                  if (done && sraRequestAdUrlResolvers.length) {
                    dev().warn(TAG, 'Premature end of SRA response',
                        sraRequestAdUrlResolvers.length, sraUrl);
                  }
                });
            // TODO(keithwrightbos) - how do we handle per slot 204 response?
            let sraUrl;
            return constructSRARequest_(
                this.win, this.getAmpDoc(), typeInstances)
              .then(sraUrlIn => {
                checkStillCurrent();
                sraUrl = sraUrlIn;
                return xhrFor(this.win).fetch(sraUrl, {
                  mode: 'cors',
                  method: 'GET',
                  credentials: 'include',
                });
              })
              .then(response => {
                checkStillCurrent();
                return lineDelimitedStreamer(this.win, response, slotCallback);
              })
              .catch(error => {
                assignAdUrlToError(/** @type {!Error} */(error), sraUrl);
                const canceled = isCancellation(error);
                if (!canceled) {
                  user().error(TAG, 'SRA request failure', error);
                }
                // Collapse all slots on failure so long as they are not
                // cancellation.
                typeInstances.forEach(instance => {
                  // Reset ad url to ensure layoutCallback does not fallback to
                  // frame get which would lose SRA guarantees.
                  // TODO(keithwrightbos): publisher should indicate if
                  // explicit is required!
                  instance.resetAdUrl();
                  if (!canceled) {
                    instance.attemptCollapse();
                  }
                  instance.sraResponseRejector(error);
                });
              });
          });
        });
      });
  }

  getPreconnectUrls() {
    return ['https://partner.googleadservices.com',
      'https://tpc.googlesyndication.com'];
  }
}

AMP.registerElement(
    'amp-ad-network-doubleclick-impl', AmpAdNetworkDoubleclickImpl);


/** @visibileForTesting */
export function resetSraStateForTesting() {
  sraRequests = null;
}

/**
 * @param {!Element} element
 * @return {string} networkId from data-ad-slot attribute.
 * @visibileForTesting
 */
export function getNetworkId(element) {
  const networkId = /^(?:\/)?(\d+)/.exec(
      dev().assertString(element.getAttribute('data-slot')));
  // TODO: guarantee data-ad-slot format as part of isValidElement?
  return networkId ? networkId[1] : '';
}


/**
 * @param {!Window} win
 * @param {!Node|!../../../src/service/ampdoc-impl.AmpDoc} doc
 * @param {!Array<!AmpAdNetworkDoubleclickImpl>} instances
 * @return {!Promise<string>} SRA request URL
 */
function constructSRARequest_(win, doc, instances) {
  const startTime = Date.now();
  return getPageLevelParameters_(win, doc, startTime, true)
      .then(pageLevelParameters => {
        const blockParameters = constructSRABlockParameters(instances);
        return truncAndTimeUrl(DOUBLECLICK_BASE_URL,
            Object.assign(blockParameters, pageLevelParameters), startTime);
      });
}

/**
 * @param {!Array<!AmpAdNetworkDoubleclickImpl>} instances
 * @visibileForTesting
 */
export function constructSRABlockParameters(instances) {
  const parameters = {};
  BLOCK_SRA_COMBINERS_.forEach(
      combiner => Object.assign(parameters, combiner(instances)));
  return parameters;
}

/**
 * @param {!Window} win
 * @param {!Node|!../../../src/service/ampdoc-impl.AmpDoc} doc
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
 * @private
 */
function serializeTargeting_(targeting, categoryExclusions) {
  const serialized = targeting ?
      Object.keys(targeting).map(key => serializeItem_(key, targeting[key])) :
      [];
  if (categoryExclusions) {
    serialized.push(serializeItem_('excl_cat', categoryExclusions));
  }
  return serialized.length ? serialized.join('&') : null;
}

/**
 * @param {string} key
 * @param {(!Array<string>|string)} value
 * @return {string}
 * @private
 */
function serializeItem_(key, value) {
  const serializedValue =
    (Array.isArray(value) ? value : [value]).map(encodeURIComponent).join();
  return `${encodeURIComponent(key)}=${serializedValue}`;
}

/**
 * @param {!Array<!AmpAdNetworkDoubleclickImpl>} instances
 * @param {!function(AmpAdNetworkDoubleclickImpl):?T} extractFn
 * @return {?T} value of first instance with non-null/undefined value or null
 *    if none can be found
 * @template T
 * @private
 */
function getFirstInstanceValue_(instances, extractFn) {
  for (let i = 0; i < instances.length; i++) {
    const val = extractFn(instances[i]);
    if (val) {
      return val;
    }
  }
  return null;
}
