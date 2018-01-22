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
import {is3pThrottled} from '../../amp-ad/0.1/concurrent-load';
import {RTC_VENDORS} from '../../amp-a4a/0.1/callout-vendors';
import {
  experimentFeatureEnabled,
  DOUBLECLICK_EXPERIMENT_FEATURE,
  DOUBLECLICK_UNCONDITIONED_EXPERIMENTS,
  UNCONDITIONED_CANONICAL_FF_HOLDBACK_EXP_NAME,
} from './doubleclick-a4a-config';
import {
  isInManualExperiment,
} from '../../../ads/google/a4a/traffic-experiments';
import {
  googleAdUrl,
  truncAndTimeUrl,
  googleBlockParameters,
  googlePageParameters,
  isCdnProxy,
  isReportingEnabled,
  AmpAnalyticsConfigDef,
  extractAmpAnalyticsConfig,
  getCsiAmpAnalyticsConfig,
  getCsiAmpAnalyticsVariables,
  groupAmpAdsByType,
  addCsiSignalsToAmpAnalyticsConfig,
  QQID_HEADER,
  getEnclosingContainerTypes,
  ValidAdContainerTypes,
  maybeAppendErrorParameter,
  getIdentityToken,
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
import {
  installAnchorClickInterceptor,
} from '../../../src/anchor-click-interceptor';
import {stringHash32} from '../../../src/string';
import {removeElement, createElementWithAttributes} from '../../../src/dom';
import {getData} from '../../../src/event-helper';
import {tryParseJson} from '../../../src/json';
import {dev, user} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {isObject} from '../../../src/types';
import {Services} from '../../../src/services';
import {domFingerprintPlain} from '../../../src/utils/dom-fingerprint';
import {insertAnalyticsElement} from '../../../src/extension-analytics';
import {setStyles} from '../../../src/style';
import {utf8Encode} from '../../../src/utils/bytes';
import {deepMerge, dict} from '../../../src/utils/object';
import {isCancellation} from '../../../src/error';
import {isSecureUrl, parseUrl, parseQueryString} from '../../../src/url';
import {VisibilityState} from '../../../src/visibility-state';
import {
  isExperimentOn,
  /* eslint no-unused-vars: 0 */ ExperimentInfo,
  getExperimentBranch,
  randomlySelectUnsetExperiments,
} from '../../../src/experiments';
import {isLayoutSizeDefined, Layout} from '../../../src/layout';
import {
  getRefreshManager,
  RefreshManager,
  DATA_ATTR_NAME,
} from '../../amp-a4a/0.1/refresh-manager';
import {
  addExperimentIdToElement,
} from '../../../ads/google/a4a/traffic-experiments';
import {RTC_ERROR_ENUM} from '../../amp-a4a/0.1/real-time-config-manager';
import '../../amp-a4a/0.1/real-time-config-manager';

/** @type {string} */
const TAG = 'amp-ad-network-doubleclick-impl';

/** @const {string} */
const DOUBLECLICK_BASE_URL =
    'https://securepubads.g.doubleclick.net/gampad/ads';

/** @private @enum {number} */
const RTC_ATI_ENUM = {
  RTC_SUCCESS: 2,
  RTC_FAILURE: 3,
};

/** @visibleForTesting @const {string} */
export const CORRELATOR_CLEAR_EXP_NAME = 'dbclk-correlator-clear';

/** @visibleForTesting @enum {string} */
export const CORRELATOR_CLEAR_EXP_BRANCHES = {
  CONTROL: '22302764',
  EXPERIMENT: '22302765',
};

/**
 * @const {string}
 * @visibileForTesting
 */
export const TFCD = 'tagForChildDirectedTreatment';

/** @const {string} */
export const SAFEFRAME_ORIGIN = 'https://tpc.googlesyndication.com';

/** @private {?Promise} */
let sraRequests = null;

/** @typedef {{
      adUrl: !Promise<string>,
      lineItemId: string,
      creativeId: string,
      slotId: string,
      slotIndex: string,
    }} */
let TroubleshootData;

/** @private {?JsonObject} */
let windowLocationQueryParameters;

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
      `${instance.initialSize_.width}x${instance.initialSize_.height}`).join()};
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
  instances => getFirstInstanceValue_(instances,
      instance => instance.buildIdentityParams_()),
];

/**
 * Used to manage messages for different fluid ad slots.
 *
 * Maps a sentinel value to an object consisting of the impl to which that
 * sentinel value belongs and the corresponding message handler for that impl.
 * @type{!Object<string, !{instance: !AmpAdNetworkDoubleclickImpl, connectionEstablished: boolean}>}
 */
const fluidListeners = {};

/**
 * @param {!Event} event
 * @private
 */
function fluidMessageListener_(event) {
  const data = tryParseJson(getData(event));
  if (event.origin != SAFEFRAME_ORIGIN || !data) {
    return;
  }
  if (data['e']) {
    // This is a request to establish a postmessaging connection.
    const listener = fluidListeners[data['e']];
    if (!listener) {
      dev().warn(TAG, `Listener for sentinel ${data['e']} not found.`);
      return;
    }
    if (!listener.connectionEstablished) {
      listener.instance.connectFluidMessagingChannel();
      listener.connectionEstablished = true;
    }
    return;
  }
  const payload = tryParseJson(data['p']);
  if (!payload || !payload['sentinel']) {
    return;
  }
  const listener = fluidListeners[payload['sentinel']];
  if (!listener) {
    dev().warn(TAG, `Listener for sentinel ${payload['sentinel']} not found.`);
    return;
  }
  if (data['s'] != 'creative_geometry_update') {
    return;
  }
  listener.instance.receiveMessageForFluid_(payload);
}

/** @final */
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
    this.extensions_ = Services.extensionsFor(this.win);

    /** @private {?string} */
    this.qqid_ = null;

    /** @private {?({width: number, height: number}|../../../src/layout-rect.LayoutRectDef)} */
    this.initialSize_ = null;

    /** @private {?{width: number, height: number}} */
    this.returnedSize_ = null;

    /** @private {?Element} */
    this.ampAnalyticsElement_ = null;

    /** @private {?Object<string,*>}*/
    this.jsonTargeting_ = null;

    /** @private {number} */
    this.adKey_ = 0;

    // TODO(keithwrightbos) - how can pub enable?
    /** @protected @const {boolean} */
    this.useSra = getMode().localDev && /(\?|&)force_sra=true(&|$)/.test(
        this.win.location.search) ||
        !!this.win.document.querySelector(
            'meta[name=amp-ad-doubleclick-sra]') ||
        experimentFeatureEnabled(this.win, DOUBLECLICK_EXPERIMENT_FEATURE.SRA);


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

    /** @private {number} */
    this.ifi_ = 0;

    /** @private {boolean} */
    this.isFluid_ = false;

    /** @private {?string} */
    this.fluidImpressionUrl_ = null;

    /** @private {?Promise<!../../../ads/google/a4a/utils.IdentityToken>} */
    this.identityTokenPromise_ = null;

    /** @type {?../../../ads/google/a4a/utils.IdentityToken} */
    this.identityToken = null;

    /** @private {boolean} */
    this.preloadSafeframe_ = true;

    /** @private {!TroubleshootData} */
    this.troubleshootData_ = /** @type {!TroubleshootData} */ ({});

    /**
     * @private {?boolean} whether preferential rendered AMP creative, null
     * indicates no creative render.
     */
    this.isAmpCreative_ = null;

    /** @private {boolean} */
    this.isIdleRender_ = false;
  }

  /** @override */
  idleRenderOutsideViewport() {
    const vpRange =
        parseInt(this.postAdResponseExperimentFeatures['render-idle-vp'], 10);
    // Disable if publisher has indicated a non-default loading strategy.
    if (isNaN(vpRange) || this.element.getAttribute('data-loading-strategy')) {
      return false;
    }
    this.isIdleRender_ = true;
    return vpRange;
  }

  /** @override */
  isLayoutSupported(layout) {
    this.isFluid_ = layout == Layout.FLUID;
    return this.isFluid_ || isLayoutSizeDefined(layout);
  }

  /** @override */
  isValidElement() {
    /**
     * isValidElement used to also check that we are in a valid A4A environment,
     * however this is not necessary as that is checked by doubleclickIsA4AEnabled,
     * which is always called as part of the upgrade path from an amp-ad element
     * to an amp-ad-doubleclick element. Thus, if we are an amp-ad, we can be sure
     * that it has been verified.
     */
    return this.isAmpAdElement() &&
      // Ensure not within remote.html iframe.
      !this.win.document.querySelector('meta[name=amp-3p-iframe-src]');
  }

  /** @override */
  delayAdRequestEnabled() {
    return experimentFeatureEnabled(
        this.win, DOUBLECLICK_EXPERIMENT_FEATURE.DELAYED_REQUEST);
  }

  /** @override */
  buildCallback() {
    super.buildCallback();
    this.identityTokenPromise_ = Services.viewerForDoc(this.getAmpDoc())
        .whenFirstVisible()
        .then(() => getIdentityToken(this.win, this.getAmpDoc()));
    this.troubleshootData_.slotId = this.element.getAttribute('data-slot');
    this.troubleshootData_.slotIndex =
        this.element.getAttribute('data-amp-slot-index');
    if (this.win['dbclk_a4a_viz_change']) {
      // Only create one per page but ensure all slots get experiment
      // selection.
      const expId = getExperimentBranch(this.win, CORRELATOR_CLEAR_EXP_NAME);
      if (expId) {
        // If experiment was already selected, add to element to ensure it is
        // included in request.
        addExperimentIdToElement(expId, this.element);
      }
      return;
    }
    this.win['dbclk_a4a_viz_change'] = true;

    const sfPreloadExpName = 'a4a-safeframe-preloading-off';
    const experimentInfoMap =
        /** @type {!Object<string, !ExperimentInfo>} */ ({});
    experimentInfoMap[sfPreloadExpName] = {
      isTrafficEligible: () => true,
      branches: ['21061135', '21061136'],
    };
    randomlySelectUnsetExperiments(this.win, experimentInfoMap);
    const sfPreloadExpId = getExperimentBranch(this.win, sfPreloadExpName);
    if (sfPreloadExpId) {
      addExperimentIdToElement(sfPreloadExpId, this.element);
      this.preloadSafeframe_ = sfPreloadExpId == '21061135';
    }

    const viewer = Services.viewerForDoc(this.getAmpDoc());
    viewer.onVisibilityChanged(() => {
      if (viewer.getVisibilityState() != VisibilityState.PAUSED ||
          this.useSra || !this.win.ampAdPageCorrelator) {
        // Do not allow experiment selection if SRA or correlator was not set.
        return;
      }
      // Select into correlator clear experiment of pause visibility change.
      // Should execute prior to resumeCallback.
      // TODO(keithwrightbos,glevitzy) - determine behavior for correlator
      // interaction with refresh.
      const experimentInfoMap =
          /** @type {!Object<string, !ExperimentInfo>} */ ({});
      experimentInfoMap[CORRELATOR_CLEAR_EXP_NAME] = {
        isTrafficEligible: () => true,
        branches: ['22302764','22302765'],
      };
      randomlySelectUnsetExperiments(this.win, experimentInfoMap);
      const expId = getExperimentBranch(this.win, CORRELATOR_CLEAR_EXP_NAME);
      if (expId) {
        // Adding to experiment id will cause it to be included in subsequent ad
        // requests.
        addExperimentIdToElement(expId, this.element);
        if (expId === CORRELATOR_CLEAR_EXP_BRANCHES.EXPERIMENT) {
          // TODO(keithwrightbos) - do not clear if at least one slot on the page
          // is an AMP creative that survived unlayoutCallback in order to
          // ensure competitive exclusion/roadblocking.  Note this only applies
          // to non-backfill inventory.
          dev().info(TAG, 'resetting page correlator');
          this.win.ampAdPageCorrelator = null;
        }
      }
    });
  }

  /**
   * Handles Fluid-related messages dispatched from SafeFrame.
   * @param {!JsonObject} payload
   * @private
   */
  receiveMessageForFluid_(payload) {
    let newHeight;
    if (!payload || !(newHeight = parseInt(payload['height'], 10))) {
      // TODO(levitzky) Add actual error handling here.
      this.forceCollapse();
      return;
    }
    this.attemptChangeHeight(newHeight)
        .then(() => this.onFluidResize_())
        .catch(() => {
          // TODO(levitzky) Add more error handling here
          this.forceCollapse();
        });
  }

  /** @override */
  shouldPreferentialRenderWithoutCrypto() {
    dev().assert(!isCdnProxy(this.win));
    return !experimentFeatureEnabled(
        this.win, DOUBLECLICK_UNCONDITIONED_EXPERIMENTS.CANONICAL_HLDBK_EXP,
        UNCONDITIONED_CANONICAL_FF_HOLDBACK_EXP_NAME);
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

  /** @return {!Object<string,string|boolean|number>} */
  getPageParameters_() {
    return {
      'gdfp_req': '1',
      'sfv': DEFAULT_SAFEFRAME_VERSION,
      'u_sd': this.win.devicePixelRatio,
      'gct': this.getLocationQueryParameterValue('google_preview') || null,
    };
  }

  /**
   * Constructs block-level url parameters with side effect of setting
   * size_, jsonTargeting_, and adKey_ fields.
   * @return {!Object<string,string|boolean|number>}
   */
  getBlockParameters_() {
    dev().assert(this.initialSize_);
    dev().assert(this.jsonTargeting_);
    let sizeStr = this.isFluid_ ?
      '320x50' : `${this.initialSize_.width}x${this.initialSize_.height}`;
    const tfcd = this.jsonTargeting_ && this.jsonTargeting_[TFCD];
    const multiSizeDataStr = this.element.getAttribute('data-multi-size');
    if (multiSizeDataStr) {
      if (this.element.getAttribute('layout') == 'responsive') {
        // TODO(levitzky) Define the behavior and remove this warning.
        user().warn(TAG, 'Behavior of multi-size and responsive layout is ' +
            'currently not well defined. Proceed with caution.');
      }
      const multiSizeValidation = this.element
          .getAttribute('data-multi-size-validation') || 'true';
      // The following call will check all specified multi-size dimensions,
      // verify that they meet all requirements, and then return all the valid
      // dimensions in an array.
      const dimensions = getMultiSizeDimensions(
          multiSizeDataStr,
          this.initialSize_.width,
          this.initialSize_.height,
          multiSizeValidation == 'true',
          this.isFluid_);
      sizeStr += '|' + dimensions
          .map(dimension => dimension.join('x'))
          .join('|');
    }
    this.win['ampAdGoogleIfiCounter'] = this.win['ampAdGoogleIfiCounter'] || 1;
    this.ifi_ = (this.isRefreshing && this.ifi_) ||
        this.win['ampAdGoogleIfiCounter']++;
    return Object.assign({
      'iu': this.element.getAttribute('data-slot'),
      'co': this.jsonTargeting_ &&
          this.jsonTargeting_['cookieOptOut'] ? '1' : null,
      'adk': this.adKey_,
      'sz': sizeStr,
      'output': 'html',
      'impl': 'ifr',
      'tfcd': tfcd == undefined ? null : tfcd,
      'adtest': isInManualExperiment(this.element) ? 'on' : null,
      'scp': serializeTargeting_(
          (this.jsonTargeting_ && this.jsonTargeting_['targeting']) || null,
          (this.jsonTargeting_ &&
            this.jsonTargeting_['categoryExclusions']) || null),
      'ifi': this.ifi_,
      'rc': this.refreshCount_ || null,
      'frc': Number(this.fromResumeCallback) || null,
      'fluid': this.isFluid_ ? 'height' : null,
    }, googleBlockParameters(this));
  }

  /**
   * Populate's block-level state for ad URL construction.
   * @visibileForTesting
   */
  populateAdUrlState() {
    // Allow for pub to override height/width via override attribute.
    const width = Number(this.element.getAttribute('data-override-width')) ||
      Number(this.element.getAttribute('width'));
    const height = Number(this.element.getAttribute('data-override-height')) ||
      Number(this.element.getAttribute('height'));
    this.initialSize_ = this.isFluid_ ? {width: 0, height: 0} :
      (width && height ?
        // width/height could be 'auto' in which case we fallback to measured.
        {width, height} : this.getIntersectionElementLayoutBox());
    this.jsonTargeting_ =
      tryParseJson(this.element.getAttribute('json')) || {};
    this.adKey_ = this.generateAdKey_(
        `${this.initialSize_.width}x${this.initialSize_.height}`);
  }

  /** @override */
  getAdUrl(opt_rtcResponsesPromise) {
    if (this.iframe && !this.isRefreshing) {
      dev().warn(TAG, `Frame already exists, sra: ${this.useSra}`);
      return '';
    }
    opt_rtcResponsesPromise = opt_rtcResponsesPromise || Promise.resolve();
    // TODO(keithwrightbos): SRA blocks currently unnecessarily generate full
    // ad url.  This could be optimized however non-SRA ad url is required to
    // fallback to non-SRA if single block.
    this.populateAdUrlState();
    // TODO: Check for required and allowed parameters. Probably use
    // validateData, from 3p/3p/js, after noving it someplace common.
    const startTime = Date.now();
    const identityPromise = Services.timerFor(this.win)
        .timeoutPromise(1000, this.identityTokenPromise_)
        .catch(err => {
          // On error/timeout, proceed.
          return /**@type {!../../../ads/google/a4a/utils.IdentityToken}*/({});
        });
    const urlPromise = Promise.all([opt_rtcResponsesPromise, identityPromise])
        .then(results => {
          const rtcParams = this.mergeRtcResponses_(results[0]);
          this.identityToken = results[1];
          return googleAdUrl(
              this, DOUBLECLICK_BASE_URL, startTime, Object.assign(
                  this.getBlockParameters_(), rtcParams,
                  this.buildIdentityParams_(), this.getPageParameters_()));
        });
    this.troubleshootData_.adUrl = urlPromise;
    return urlPromise;
  }

  /**
   * @return {!Object<string,string>}
   * @private
   */
  buildIdentityParams_() {
    return this.identityToken ? {
      adsid: this.identityToken.token || null,
      jar: this.identityToken.jar || null,
      pucrd: this.identityToken.pucrd || null,
    } : {};
  }

  /**
   * Merges all of the rtcResponses into the JSON targeting and
   * category exclusions.
   * @param {?Array<!rtcResponseDef>} rtcResponseArray
   * @private
   */
  mergeRtcResponses_(rtcResponseArray) {
    if (!rtcResponseArray) {
      return null;
    }
    const artc = [];
    const ati = [];
    const ard = [];
    let exclusions;
    rtcResponseArray.forEach(rtcResponse => {
      // Only want to send errors for requests we actually sent.
      if (rtcResponse.error &&
          rtcResponse.error != RTC_ERROR_ENUM.MALFORMED_JSON_RESPONSE &&
          rtcResponse.error != RTC_ERROR_ENUM.NETWORK_FAILURE &&
          rtcResponse.error != RTC_ERROR_ENUM.TIMEOUT) {
        return;
      }
      artc.push(rtcResponse.rtcTime);
      ati.push(!rtcResponse.error ? RTC_ATI_ENUM.RTC_SUCCESS :
        RTC_ATI_ENUM.RTC_FAILURE);
      ard.push(rtcResponse.callout);
      if (rtcResponse.response) {
        if (rtcResponse.response['targeting']) {
          const rewrittenResponse = this.rewriteRtcKeys_(
              rtcResponse.response['targeting'],
              rtcResponse.callout);
          this.jsonTargeting_['targeting'] =
              !!this.jsonTargeting_['targeting'] ?
                deepMerge(this.jsonTargeting_['targeting'],
                    rewrittenResponse) :
                rewrittenResponse;
        }
        if (rtcResponse.response['categoryExclusions']) {
          if (!exclusions) {
            exclusions = {};
            if (this.jsonTargeting_['categoryExclusions']) {
              this.jsonTargeting_['categoryExclusions'].forEach(exclusion => {
                exclusions[exclusion] = true;
              });
            }
          }
          rtcResponse.response['categoryExclusions'].forEach(exclusion => {
            exclusions[exclusion] = true;
          });
        }
      }
    });
    if (exclusions) {
      this.jsonTargeting_['categoryExclusions'] = Object.keys(exclusions);
    }
    return {'artc': artc.join() || null, 'ati': ati.join(), 'ard': ard.join()};
  }

  /** @override */
  getCustomRealTimeConfigMacros_() {
    /**
     * This whitelist allow attributes on the amp-ad element to be used as
     * macros for constructing the RTC URL. Add attributes here, in lowercase,
     * to make them available.
     */
    const whitelist = {
      'height': true,
      'width': true,
      'data-slot': true,
      'data-multi-size': true,
      'data-multi-size-validation': true,
      'data-override-width': true,
      'data-override-height': true,
    };
    return {
      PAGEVIEWID: () => Services.documentInfoForDoc(this.element).pageViewId,
      HREF: () => this.win.location.href,
      TGT: () =>
        JSON.stringify(
            (tryParseJson(
                this.element.getAttribute('json')) || {})['targeting']),
      ATTR: name => {
        if (!whitelist[name.toLowerCase()]) {
          dev().warn('TAG', `Invalid attribute ${name}`);
        } else {
          return this.element.getAttribute(name);
        }
      },
    };
  }

  /**
   * Appends the callout value to the keys of response to prevent a collision
   * case caused by multiple vendors returning the same keys.
   * @param {!Object<string, string>} response
   * @param {string} callout
   * @return {!Object<string, string>}
   * @private
   */
  rewriteRtcKeys_(response, callout) {
    // Only perform this substitution for vendor-defined URLs.
    if (!RTC_VENDORS[callout] || RTC_VENDORS[callout].disableKeyAppend) {
      return response;
    }
    const newResponse = {};
    Object.keys(response).forEach(key => {
      newResponse[`${key}_${callout}`] = response[key];
    });
    return newResponse;
  }

  /** @override */
  onNetworkFailure(error, adUrl) {
    dev().info(TAG, 'network error, attempt adding of error parameter', error);
    return {adUrl: maybeAppendErrorParameter(adUrl, 'n')};
  }

  /** @override */
  extractSize(responseHeaders) {
    setGoogleLifecycleVarsFromHeaders(responseHeaders, this.lifecycleReporter_);
    this.ampAnalyticsConfig_ = extractAmpAnalyticsConfig(this, responseHeaders);
    this.qqid_ = responseHeaders.get(QQID_HEADER);
    this.troubleshootData_.creativeId =
        responseHeaders.get('google-creative-id');
    this.troubleshootData_.lineItemId =
        responseHeaders.get('google-lineitem-id');
    if (this.ampAnalyticsConfig_) {
      // Load amp-analytics extensions
      this.extensions_./*OK*/installExtensionForDoc(
          this.getAmpDoc(), 'amp-analytics');
    }

    if (this.isFluid_) {
      this.fluidImpressionUrl_ = responseHeaders.get('X-AmpImps');
    } else {
      this.fireDelayedImpressions(responseHeaders.get('X-AmpImps'));
      this.fireDelayedImpressions(responseHeaders.get('X-AmpRSImps'), true);
    }
    // If the server returned a size, use that, otherwise use the size that we
    // sent in the ad request.
    let size = super.extractSize(responseHeaders);
    if (size) {
      this.returnedSize_ = size;
      this.handleResize_(size.width, size.height);
    } else {
      size = this.getSlotSize();
    }
    return size;
  }

  /**
   * Returns the width and height of the slot as defined by the width and height
   * attributes, or the dimensions as computed by
   * getIntersectionElementLayoutBox.
   * @return {{width: number, height: number}|../../../src/layout-rect.LayoutRectDef}
   */
  getSlotSize() {
    const width = Number(this.element.getAttribute('width'));
    const height = Number(this.element.getAttribute('height'));
    return width && height
      ? {width, height}
      // width/height could be 'auto' in which case we fallback to measured.
      : this.getIntersectionElementLayoutBox();
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
    this.isAmpCreative_ = null;
    this.isIdleRender_ = false;
    // Reset SRA requests to allow for resumeCallback to re-fetch
    // ad requests.  Assumes that unlayoutCallback will be called for all slots
    // in rapid succession (meaning onLayoutMeasure initiated promise chain
    // will not be started until resumeCallback).
    sraRequests = null;
    const sraInitializer = this.initializeSraPromise_();
    this.sraResponseResolver = sraInitializer.resolver;
    this.sraResponseRejector = sraInitializer.rejector;
    this.sraResponsePromise_ = sraInitializer.promise;
    this.qqid_ = null;
  }

  /** @override */
  layoutCallback() {
    const registerFluidAndExec = () => {
      if (this.isFluid_) {
        this.registerListenerForFluid_();
      }
      return super.layoutCallback();
    };
    if (this.postAdResponseExperimentFeatures['render-idle-throttle'] &&
        this.isIdleRender_) {
      return this.isVerifiedAmpCreativePromise().then(verified => {
        // Control concurrent loading of non-AMP creatives executed via
        // idleRenderOutsideViewport as doing so within
        // idleRenderOutsideViewport would impose at least 5 second delay due to
        // scheduler constraints.
        const throttleFn = () => !verified && is3pThrottled(this.win) ?
          Services.timerFor(this.win).delay(throttleFn, 1000) :
          registerFluidAndExec();
        return throttleFn();
      });
    }
    return registerFluidAndExec();
  }

  /** @override  */
  unlayoutCallback() {
    switch (this.postAdResponseExperimentFeatures['unlayout_exp']) {
      case 'all':
        // Ensure all creatives are removed.
        this.isAmpCreative_ = false;
        break;
      case 'remain':
        if (this.qqid_ && this.isAmpCreative_ === null) {
          // Ad response received but not yet rendered.  Note that no fills
          // would fall into this case even if layoutCallback has executed.
          // Assume high probability of continued no fill therefore do not
          // tear down.
          dev().info(TAG, 'unlayoutCallback - unrendered creative can remain');
          return false;
        }
    }
    if (!this.useSra && this.isAmpCreative_) {
      // Allow non-AMP creatives to remain unless SRA.
      return false;
    }
    const superResult = super.unlayoutCallback();
    this.maybeRemoveListenerForFluid();
    return superResult;
  }

  /**
   * Postmessages an initial message to the fluid creative.
   * @visibleForTesting
   */
  connectFluidMessagingChannel() {
    dev().assert(this.iframe.contentWindow,
        'Frame contentWindow unavailable.');
    this.iframe.contentWindow./*OK*/postMessage(
        JSON.stringify(dict({'message': 'connect', 'c': 'sfchannel1'})),
        SAFEFRAME_ORIGIN);
  }

  /**
   * Fires a delayed impression and notifies the Fluid creative that its
   * container has been resized.
   * @private
   */
  onFluidResize_() {
    if (this.fluidImpressionUrl_) {
      this.fireDelayedImpressions(this.fluidImpressionUrl_);
      this.fluidImpressionUrl_ = null;
    }
    dev().assert(this.iframe.contentWindow,
        'Frame contentWindow unavailable.');
    this.iframe.contentWindow./*OK*/postMessage(
        JSON.stringify(dict({'message': 'resize-complete', 'c': 'sfchannel1'})),
        SAFEFRAME_ORIGIN);
  }

  /** @override */
  refresh(refreshEndCallback) {
    this.refreshCount_++;
    return super.refresh(refreshEndCallback);
  }

  /**
   * @return {!../../../ads/google/a4a/performance.BaseLifecycleReporter}
   */
  initLifecycleReporter() {
    return googleLifecycleReporterFactory(this);
  }

  /** @override */
  onCreativeRender(creativeMetaData) {
    super.onCreativeRender(creativeMetaData);
    this.isAmpCreative_ = !!creativeMetaData;
    if (creativeMetaData &&
        !creativeMetaData.customElementExtensions.includes('amp-ad-exit')) {
      // Capture phase click handlers on the ad if amp-ad-exit not present
      // (assume it will handle capture).
      dev().assert(this.iframe);
      installAnchorClickInterceptor(
          this.getAmpDoc(), this.iframe.contentWindow);
    }
    if (this.ampAnalyticsConfig_) {
      dev().assert(!this.ampAnalyticsElement_);
      if (isReportingEnabled(this)) {
        addCsiSignalsToAmpAnalyticsConfig(
            this.win,
            this.element,
            this.ampAnalyticsConfig_,
            this.qqid_,
            !!creativeMetaData,
            this.lifecycleReporter_.getDeltaTime(),
            this.lifecycleReporter_.getInitTime());
      }
      this.ampAnalyticsElement_ =
          insertAnalyticsElement(this.element, this.ampAnalyticsConfig_, true);
    }
    if (this.isRefreshing) {
      dev().assert(this.refreshManager_);
      this.refreshManager_.initiateRefreshCycle();
      this.isRefreshing = false;
      this.isRelayoutNeededFlag = false;
    }

    this.lifecycleReporter_.addPingsForVisibility(this.element);

    // Force size of frame to match creative or, if creative size is unknown,
    // the slot. This ensures that the creative is centered in the former case,
    // and not truncated in the latter.
    const size = this.returnedSize_ || this.getSlotSize();
    const isMultiSizeFluid = this.isFluid_ && this.returnedSize_ &&
        // TODO(@glevitzky, 11583) Remove this clause once we stop sending back
        // the size header for fluid ads. Fluid size headers always come back as
        // 0x0.
        !(size.width == 0 && size.height == 0);
    setStyles(dev().assertElement(this.iframe), {
      width: `${size.width}px`,
      height: `${size.height}px`,
      position: isMultiSizeFluid ? 'relative' : null,
    });
    if (isMultiSizeFluid) {
      // This is a fluid + multi-size request, where the returned creative is
      // multi-size. The slot needs to not be styled with width: 100%, or the
      // creative will be centered instead of left-aligned.
      this.element.removeAttribute('height');
      setStyles(this.element, {width: `${size.width}px`});
    }

    this.refreshManager_ = this.refreshManager_ ||
        getRefreshManager(this, () => {
          if (this.useSra) {
            user().warn(TAG, 'Refresh not compatible with SRA.');
            return false;
          }
          if (getEnclosingContainerTypes(this.element).filter(container =>
            container != ValidAdContainerTypes['AMP-CAROUSEL'] &&
                container != ValidAdContainerTypes['AMP-STICKY-AD']).length) {
            user().warn(TAG,
                'Refresh not compatible with ad-containers, except for ' +
                'AMP-CAROUSEL and AMP-STICKY-AD');
            return false;
          }
          return true;
        });

    this.postTroubleshootMessage();
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
    if (this.isFluid_ ||
        (width != pWidth || height != pHeight) &&
        (width <= pWidth && height <= pHeight)) {
      this.attemptChangeSize(height, width).catch(() => {});
    }
  }

  /** @override */
  sendXhrRequest(adUrl) {
    if (!this.useSra) {
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
   * @param {string} impressions
   * @param {boolean=} scrubReferer
   * @visibleForTesting
   */
  fireDelayedImpressions(impressions, scrubReferer) {
    if (!impressions) {
      return;
    }
    impressions.split(',').forEach(url => {
      try {
        if (!isSecureUrl(url)) {
          dev().warn(TAG, `insecure impression url: ${url}`);
          return;
        }
        // Create amp-pixel and append to document to send impression.
        this.win.document.body.appendChild(
            createElementWithAttributes(
                this.win.document,
                'amp-pixel',
                dict({
                  'src': url,
                  'referrerpolicy': scrubReferer ? 'no-referrer' : '',
                })));
      } catch (unusedError) {}
    });
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
                            'Ignoring instance without ad promise as ' +
                            'likely invalid',
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
                    dev().assert(sraRequestAdUrlResolvers.shift())(
                        fetchResponse);
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
                    return Services.xhrFor(this.win).fetch(sraUrl, {
                      mode: 'cors',
                      method: 'GET',
                      credentials: 'include',
                    });
                  })
                  .then(response => {
                    checkStillCurrent();
                    return lineDelimitedStreamer(
                        this.win, response, slotCallback);
                  })
                  .catch(error => {
                    assignAdUrlToError(/** @type {!Error} */(error), sraUrl);
                    const canceled = isCancellation(error);
                    if (!canceled) {
                      this.user().error(TAG, 'SRA request failure', error);
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
    const urls = ['https://partner.googleadservices.com'];
    if (this.preloadSafeframe_) {
      urls.push(SAFEFRAME_ORIGIN);
    }
    return urls;
  }

  /** @override */
  getNonAmpCreativeRenderingMethod(headerValue) {
    return this.isFluid_ ? XORIGIN_MODE.SAFEFRAME :
      super.getNonAmpCreativeRenderingMethod(headerValue);
  }


  /**
   * Note that location is parsed once on first access and cached.
   * @param {string} parameterName
   * @return {string|undefined} parameter value from window.location.search
   * @visibleForTesting
   */
  getLocationQueryParameterValue(parameterName) {
    windowLocationQueryParameters = windowLocationQueryParameters ||
        parseQueryString((this.win.location && this.win.location.search) || '');
    return windowLocationQueryParameters[parameterName];
  }

  /** @override */
  getAdditionalContextMetadata() {
    const attributes = dict({});
    if (this.isFluid_) {
      attributes['uid'] = 1;
      attributes['hostPeerName'] = this.win.location.origin;
      // The initial geometry isn't used for anything important, but it is
      // expected, so we pass this string with all zero values.
      attributes['initialGeometry'] = JSON.stringify(
          dict({
            'windowCoords_t': 0,
            'windowCoords_r': 0,
            'windowCoords_b': 0,
            'windowCoords_l': 0,
            'frameCoords_t': 0,
            'frameCoords_r': 0,
            'frameCoords_b': 0,
            'frameCoords_l': 0,
            'styleZIndex': 'auto',
            'allowedExpansion_t': 0,
            'allowedExpansion_r': 0,
            'allowedExpansion_b': 0,
            'allowedExpansion_l': 0,
            'xInView': 0,
            'yInView': 0,
          }));
      attributes['permissions'] = JSON.stringify(
          dict({
            'expandByOverlay': false,
            'expandByPush': false,
            'readCookie': false,
            'writeCookie': false,
          }));
      attributes['metadata'] = JSON.stringify(
          dict({
            'shared': {
              'sf_ver': this.safeframeVersion,
              'ck_on': 1,
              'flash_ver': '26.0.0',
            },
          }));
      attributes['reportCreativeGeometry'] = true;
      attributes['isDifferentSourceWindow'] = false;
      attributes['sentinel'] = this.sentinel;
    }
    return attributes;
  }

  /** @private  */
  registerListenerForFluid_() {
    fluidListeners[this.sentinel] = fluidListeners[this.sentinel] || {
      instance: this,
      connectionEstablished: false,
    };
    if (Object.keys(fluidListeners).length == 1) {
      this.win.addEventListener('message', fluidMessageListener_, false);
    }
  }

  /** @visibleForTesting */
  maybeRemoveListenerForFluid() {
    if (!this.isFluid_) {
      return;
    }
    delete fluidListeners[this.sentinel];
    if (!Object.keys(fluidListeners).length) {
      this.win.removeEventListener('message', fluidMessageListener_);
    }
  }

  /**
   * Emits a postMessage containing information about this slot to the DFP
   * Troubleshoot UI. A promise is returned if a message is posted, otherwise
   * null is returned. The promise is returned only for test convenience.
   *
   * @return {?Promise}
   * @visibleForTesting
   */
  postTroubleshootMessage() {
    if (!this.win.opener || !/[?|&]dfpdeb/.test(this.win.location.search)) {
      return null;
    }
    dev().assert(this.troubleshootData_.adUrl, 'ad URL does not exist yet');
    return this.troubleshootData_.adUrl.then(adUrl => {
      const slotId = this.troubleshootData_.slotId + '_' +
          this.troubleshootData_.slotIndex;
      const payload = dict({
        'gutData': JSON.stringify(dict({
          'events': [{
            'timestamp': Date.now(),
            'slotid': slotId,
            'messageId': 4,
          }],
          'slots': [{
            'contentUrl': adUrl || '',
            'id': slotId,
            'leafAdUnitName': this.troubleshootData_.slotId,
            'domId': slotId,
            'lineItemId': this.troubleshootData_.lineItemId,
            'creativeId': this.troubleshootData_.creativeId,
          }],
        })),
        'userAgent': navigator.userAgent,
        'referrer': this.win.location.href,
        'messageType': 'LOAD',
      });
      this.win.opener./*OK*/postMessage(payload, '*');
    });
  }

  /** @override */
  getA4aAnalyticsVars(analyticsTrigger) {
    return getCsiAmpAnalyticsVariables(analyticsTrigger, this, this.qqid_);
  }

  /** @override */
  getA4aAnalyticsConfig() {
    return getCsiAmpAnalyticsConfig();
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpAdNetworkDoubleclickImpl);
});


/** @visibleForTesting */
export function resetSraStateForTesting() {
  sraRequests = null;
}

/** @visibleForTesting */
export function resetLocationQueryParametersForTesting() {
  windowLocationQueryParameters = null;
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
export function constructSRARequest_(win, doc, instances) {
  // TODO(bradfrizzell): Need to add support for RTC.
  dev().assert(instances && instances.length);
  const startTime = Date.now();
  return googlePageParameters(win, doc, startTime)
      .then(googPageLevelParameters => {
        const blockParameters = constructSRABlockParameters(instances);
        return truncAndTimeUrl(DOUBLECLICK_BASE_URL,
            Object.assign(blockParameters, googPageLevelParameters,
                instances[0].getPageParameters_()),
            startTime);
      });
}

/**
 * @param {!Array<!AmpAdNetworkDoubleclickImpl>} instances
 * @visibileForTesting
 */
export function constructSRABlockParameters(instances) {
  const parameters = {'output': 'ldjh', 'impl': 'fifs'};
  BLOCK_SRA_COMBINERS_.forEach(
      combiner => Object.assign(parameters, combiner(instances)));
  return parameters;
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
 * @param {function(AmpAdNetworkDoubleclickImpl):?T} extractFn
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
