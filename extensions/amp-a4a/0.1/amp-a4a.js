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
  is3pThrottled,
  getAmpAdRenderOutsideViewport,
  incrementLoadingAds,
} from '../../amp-ad/0.1/concurrent-load';
import {signingServerURLs} from '../../../ads/_a4a-config';
import {createElementWithAttributes} from '../../../src/dom';
import {cancellation, isCancellation} from '../../../src/error';
import {
  installAnchorClickInterceptor,
} from '../../../src/anchor-click-interceptor';
import {
  installFriendlyIframeEmbed,
  setFriendlyIframeEmbedVisible,
} from '../../../src/friendly-iframe-embed';
import {isLayoutSizeDefined} from '../../../src/layout';
import {isAdPositionAllowed} from '../../../src/ad-helper';
import {dev, user, duplicateErrorIfNecessary} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {isArray, isObject, isEnumValue} from '../../../src/types';
import {some} from '../../../src/utils/promise';
import {utf8Decode} from '../../../src/utils/bytes';
import {viewerForDoc} from '../../../src/services';
import {xhrFor} from '../../../src/services';
import {endsWith} from '../../../src/string';
import {platformFor} from '../../../src/services';
import {cryptoFor} from '../../../src/crypto';
import {isExperimentOn} from '../../../src/experiments';
import {setStyle} from '../../../src/style';
import {assertHttpsUrl} from '../../../src/url';
import {handleClick} from '../../../ads/alp/handler';
import {
  getDefaultBootstrapBaseUrl,
  generateSentinel,
} from '../../../src/3p-frame';
import {
  installUrlReplacementsForEmbed,
} from '../../../src/service/url-replacements-impl';
import {extensionsFor} from '../../../src/services';
import {A4AVariableSource} from './a4a-variable-source';
// TODO(tdrl): Temporary.  Remove when we migrate to using amp-analytics.
import {getTimingDataAsync} from '../../../src/service/variable-source';
import {getContextMetadata} from '../../../src/iframe-attributes';
import {isInExperiment} from '../../../ads/google/a4a/traffic-experiments';

/** @type {string} */
const METADATA_STRING = '<script type="application/json" amp-ad-metadata>';

/** @type {string} */
const METADATA_STRING_NO_QUOTES =
      '<script type=application/json amp-ad-metadata>';

// TODO(tdrl): Temporary, while we're verifying whether SafeFrame is an
// acceptable solution to the 'Safari on iOS doesn't fetch iframe src from
// cache' issue.  See https://github.com/ampproject/amphtml/issues/5614
/** @type {string} */
export const DEFAULT_SAFEFRAME_VERSION = '1-0-8';

/** @type {string} @visibleForTesting */
export const RENDERING_TYPE_HEADER = 'X-AmpAdRender';

/** @type {string} @visibleForTesting */
export const SAFEFRAME_VERSION_HEADER = 'X-AmpSafeFrameVersion';

/** @type {string} */
const TAG = 'amp-a4a';

/** @type {string} */
const NO_CONTENT_RESPONSE = 'NO-CONTENT-RESPONSE';

/** @enum {string} */
export const XORIGIN_MODE = {
  CLIENT_CACHE: 'client_cache',
  SAFEFRAME: 'safeframe',
  NAMEFRAME: 'nameframe',
};

/** @type {!Object} @private */
const SHARED_IFRAME_PROPERTIES = {
  frameborder: '0',
  allowfullscreen: '',
  allowtransparency: '',
  scrolling: 'no',
  marginwidth: '0',
  marginheight: '0',
};

/** @typedef {{
 *    creative: ArrayBuffer,
 *    signature: ?Uint8Array,
 *    size: ?{width: number, height: number}
 *  }} */
export let AdResponseDef;

/** @typedef {{
      minifiedCreative: string,
      customElementExtensions: !Array<string>,
      customStylesheets: !Array<{href: string}>
    }} */
let CreativeMetaDataDef;

/**
 * A set of public keys for a single AMP signing service.  A single service may
 * return more than one key if, e.g., they're rotating keys and they serve
 * the current and upcoming keys.  A CryptoKeysDef stores one or more
 * (promises to) keys, in the order given by the return value from the
 * signing service.
 *
 * @typedef {{serviceName: string, keys: !Array<!Promise<!../../../src/crypto.PublicKeyInfoDef>>}}
 */
let CryptoKeysDef;

/**
 * The public keys for all signing services.  This is an array of promises,
 * one per signing service, in the order given by the array returned by
 * #getSigningServiceNames().  Each entry resolves to the keys returned by
 * that service, represented by a `CryptoKeysDef` object.
 *
 * @typedef {Array<!Promise<!CryptoKeysDef>>}
 */
let AllServicesCryptoKeysDef;

/** @private */
export const LIFECYCLE_STAGES = {
  // Note: Use strings as values here, rather than numbers, so that "0" does
  // not test as `false` later.
  adSlotCleared: '-1',
  urlBuilt: '1',
  adRequestStart: '2',
  adRequestEnd: '3',
  extractCreativeAndSignature: '4',
  adResponseValidateStart: '5',
  renderFriendlyStart: '6',  // TODO(dvoytenko): this signal and similar are actually "embed-create", not "render-start".
  renderCrossDomainStart: '7',
  renderFriendlyEnd: '8',
  renderCrossDomainEnd: '9',
  preAdThrottle: '10',
  renderSafeFrameStart: '11',
  throttled3p: '12',
  adResponseValidateEnd: '13',
  xDomIframeLoaded: '14',
  friendlyIframeLoaded: '15',
  adSlotCollapsed: '16',
  adSlotUnhidden: '17',
  layoutAdPromiseDelay: '18',
  signatureVerifySuccess: '19',
  networkError: '20',
  friendlyIframeIniLoad: '21',
  visHalf: '22',
  visHalfIniLoad: '23',
  firstVisible: '24',
  visLoadAndOneSec: '25',
  iniLoad: '26',
  resumeCallback: '27',
  visIniLoad: '29',
};

/**
 * Utility function that ensures any error thrown is handled by optional
 * onError handler (if none provided or handler throws, error is swallowed and
 * undefined is returned).
 * @param {!Function} fn to protect
 * @param {T=} inThis An optional object to use as the 'this' object
 *    when calling the function.  If not provided, undefined is bound as this
 *    when calling function.
 * @param {function(this:T, !Error, ...*):?=} onError function given error
 *    and arguments provided to function call.
 * @return {!Function} protected function
 * @template T
 * @visibleForTesting
 */
export function protectFunctionWrapper(
    fn, inThis = undefined, onError = undefined) {
  return (...fnArgs) => {
    try {
      return fn.apply(inThis, fnArgs);
    } catch (err) {
      if (onError) {
        try {
          // Ideally we could use [err, ...var_args] but linter disallows
          // spread so instead using unshift :(
          fnArgs.unshift(err);
          return onError.apply(inThis, fnArgs);
        } catch (captureErr) {
          // swallow error if error handler throws.
        }
      }
      // In the event of no optional on error function or its execution throws,
      // return undefined.
      return undefined;
    }
  };
};

export class AmpA4A extends AMP.BaseElement {
  // TODO: Add more error handling throughout code.
  // TODO: Handle creatives that do not fill.

  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);
    dev().assert(AMP.AmpAdUIHandler);
    dev().assert(AMP.AmpAdXOriginIframeHandler);

    /** @private {?Promise<?CreativeMetaDataDef>} */
    this.adPromise_ = null;

    /**
     * @private {number} unique ID of the currently executing promise to allow
     * for cancellation.
     */
    this.promiseId_ = 0;

    /** {?Object} */
    this.config = null;

    /** @private {?string} */
    this.adUrl_ = null;

    /** @private {?../../../src/friendly-iframe-embed.FriendlyIframeEmbed} */
    this.friendlyIframeEmbed_ = null;

    /** {?AMP.AmpAdUIHandler} */
    this.uiHandler = null;

    /** @private {?AMP.AmpAdXOriginIframeHandler} */
    this.xOriginIframeHandler_ = null;

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = this.getVsync();

    /** @private {boolean} whether creative has been verified as AMP */
    this.isVerifiedAmpCreative_ = false;

    /** @private @const {!../../../src/service/crypto-impl.Crypto} */
    this.crypto_ = cryptoFor(this.win);

    /** @private {?ArrayBuffer} */
    this.creativeBody_ = null;

    /**
     * Initialize this with the slot width/height attributes, and override
     * later with what the network implementation returns via
     * extractCreativeAndSignature. Note: Either value may be 'auto' (i.e.,
     * non-numeric).
     *
     * @private {?({width, height}|../../../src/layout-rect.LayoutRectDef)}
     */
    this.creativeSize_ = {
      width: this.element.getAttribute('width'),
      height: this.element.getAttribute('height'),
    };

    /** @private {?../../../src/layout-rect.LayoutRectDef} */
    this.originalSlotSize_ = null;

    /**
     * Note(keithwrightbos) - ensure the default here is null so that ios
     * uses safeframe when response header is not specified.
     * @private {?XORIGIN_MODE}
     */
    this.experimentalNonAmpCreativeRenderMethod_ =
      platformFor(this.win).isIos() ? XORIGIN_MODE.SAFEFRAME : null;

    /**
     * Gets a notion of current time, in ms.  The value is not necessarily
     * absolute, so should be used only for computing deltas.  When available,
     * the performance system will be used; otherwise Date.now() will be
     * returned.
     *
     * @const {function():number}
     * @private
     */
    this.getNow_ = (this.win.performance && this.win.performance.now) ?
        this.win.performance.now.bind(this.win.performance) : Date.now;

    /**
     * Protected version of emitLifecycleEvent that ensures error does not
     * cause promise chain to reject.
     * @private {function(string, !Object=)}
     */
    this.protectedEmitLifecycleEvent_ = protectFunctionWrapper(
      this.emitLifecycleEvent, this,
      (err, varArgs) => {
        dev().error(TAG, this.element.getAttribute('type'),
            'Error on emitLifecycleEvent', err, varArgs) ;
      });

    /** @const {string} */
    this.sentinel = generateSentinel(window);

    /**
     * Used to indicate whether this slot should be collapsed or not. Marked
     * true if the ad response has status 204, is null, or has a null
     * arrayBuffer.
     * @private {boolean}
     */
    this.isCollapsed_ = false;

    /**
     * Frame in which the creative renders (friendly if validated AMP, xdomain
     * otherwise).
     * {?HTMLIframeElement}
     */
    this.iframe = null;

    /**
     * TODO(keithwrightbos) - remove once resume behavior is verified.
     * {boolean} whether most recent ad request was generated as part
     *    of resume callback.
     */
    this.fromResumeCallback = false;


    const type = (this.element.getAttribute('type') || 'notype').toLowerCase();
    /**
     * @private @const{boolean} whether request should only be sent when slot is
     *    within renderOutsideViewport distance.
     */
    this.delayRequestEnabled_ =
      (type == 'adsense' && isInExperiment(this.element, '117152655')) ||
      (type == 'doubleclick' && isInExperiment(this.element, '117152665'));

    /** @private {string} */
    this.safeframeVersion_ = DEFAULT_SAFEFRAME_VERSION;
  }

  /** @override */
  getPriority() {
    // Priority used for scheduling preload and layout callback.  Because
    // AMP creatives will be injected as part of the promise chain created
    // within onLayoutMeasure, this is only relevant to non-AMP creatives
    // therefore we want this to match the 3p priority.
    return 2;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.uiHandler = new AMP.AmpAdUIHandler(this);
    if (!this.win.ampA4aValidationKeys) {
      // Without the following variable assignment, there's no way to apply a
      // type annotation to a win-scoped variable, so the type checker doesn't
      // catch type errors here.  This no-op allows us to enforce some type
      // expectations.  The const assignment will hopefully be optimized
      // away by the compiler.  *fingers crossed*
      /** @type {!AllServicesCryptoKeysDef} */
      const forTypeSafety = this.getKeyInfoSets_();
      this.win.ampA4aValidationKeys = forTypeSafety;
    }
  }

  /** @override */
  renderOutsideViewport() {
    // Ensure non-verified AMP creatives are throttled.
    if (!this.isVerifiedAmpCreative_ && is3pThrottled(this.win)) {
      this.protectedEmitLifecycleEvent_('throttled3p');
      return false;
    }
    // Otherwise the ad is good to go.
    const elementCheck = getAmpAdRenderOutsideViewport(this.element);
    return elementCheck !== null ?
        elementCheck : super.renderOutsideViewport();
  }

  /**
   * To be overridden by network specific implementation indicating if element
   * (and environment generally) are valid for sending XHR queries.
   * @return {boolean} whether element is valid and ad request should be
   *    sent.  If false, no ad request is sent and slot will be collapsed if
   *    possible.
   */
  isValidElement() {
    return true;
  }

  /**
   * Returns preconnect urls for A4A. Ad network should overwrite in their
   * Fast Fetch implementation and return an array of urls for the runtime to
   * preconnect to.
   * @return {!Array<string>}
   */
  getPreconnectUrls() {
    return [];
  }

  /**
   * Returns prefetch urls for A4A. Ad network should overwrite in their
   * Fast Fetch implementation and return an array of urls for the runtime to
   * prefetch.
   * @return {!Array<string>}
   */
  getPrefetchUrls() {
    return [];
  }

  /**
   * Returns true if this element was loaded from an amp-ad element.  For use by
   * network-specific implementations that don't want to allow themselves to be
   * embedded directly into a page.
   * @return {boolean}
   */
  isAmpAdElement() {
    return this.element.tagName == 'AMP-AD' ||
        this.element.tagName == 'AMP-EMBED';
  }

  /**
   * Prefetches and preconnects URLs related to the ad using adPreconnect
   * registration which assumes ad request domain used for 3p is applicable.
   * @param {boolean=} unusedOnLayout
   * @override
   */
  preconnectCallback(unusedOnLayout) {
    this.preconnect.preload(this.getSafeframePath_());
    this.preconnect.preload(getDefaultBootstrapBaseUrl(this.win, 'nameframe'));
    const preconnect = this.getPreconnectUrls();

    // NOTE(keithwrightbos): using onLayout to indicate if preconnect should be
    // given preferential treatment.  Currently this would be false when
    // relevant (i.e. want to preconnect on or before onLayoutMeasure) which
    // causes preconnect to delay for 1 sec (see custom-element#preconnect)
    // therefore hard coding to true.
    // NOTE(keithwrightbos): Does not take isValidElement into account so could
    // preconnect unnecessarily, however it is assumed that isValidElement
    // matches amp-ad loader predicate such that A4A impl does not load.
    if (preconnect) {
      preconnect.forEach(p => {
        this.preconnect.url(p, true);
      });
    }
  }

  /** @override */
  resumeCallback() {
    // FIE that was not destroyed on unlayoutCallback does not require a new
    // ad request.
    if (this.friendlyIframeEmbed_) {
      return;
    }
    this.protectedEmitLifecycleEvent_('resumeCallback');
    this.fromResumeCallback = true;
    // If layout of page has not changed, onLayoutMeasure will not be called
    // so do so explicitly.
    const resource = this.getResource();
    if (resource.hasBeenMeasured() && !resource.isMeasureRequested()) {
      this.onLayoutMeasure();
    }
  }

  /**
   * @return {!../../../src/service/resource.Resource}
   * @visibileForTesting
   */
  getResource() {
    return this.element.getResources().getResourceForElement(this.element);
  }

  /**
   * @return {boolean} whether adPromise was initialized (indicator of
   *    element validity).
   * @protected
   */
  hasAdPromise() {
    return !!this.adPromise_;
  }

  /**
   * @return {boolean} whether environment/element should initialize ad request
   *    promise chain.
   * @private
   */
  shouldInitializePromiseChain_() {
    if (!this.crypto_.isCryptoAvailable()) {
      return false;
    }
    const slotRect = this.getIntersectionElementLayoutBox();
    if (slotRect.height == 0 || slotRect.width == 0) {
      dev().fine(
        TAG, 'onLayoutMeasure canceled due height/width 0', this.element);
      return false;
    }
    if (!isAdPositionAllowed(this.element, this.win)) {
      user().warn(TAG, `<${this.element.tagName}> is not allowed to be ` +
        `placed in elements with position:fixed: ${this.element}`);
      return false;
    }
    // OnLayoutMeasure can be called when page is in prerender so delay until
    // visible.  Assume that it is ok to call isValidElement as it should
    // only being looking at window, immutable properties (i.e. location) and
    // its element ancestry.
    if (!this.isValidElement()) {
      // TODO(kjwright): collapse?
      user().warn(TAG, this.element.getAttribute('type'),
          'Amp ad element ignored as invalid', this.element);
      return false;
    }
    return true;
  }

  /** @override */
  onLayoutMeasure() {
    if (this.xOriginIframeHandler_) {
      this.xOriginIframeHandler_.onLayoutMeasure();
    }
    if (this.adPromise_ || !this.shouldInitializePromiseChain_()) {
      return;
    }
    // If in localDev `type=fake` Ad specifies `force3p`, it will be forced
    // to go via 3p.
    if (getMode().localDev &&
        this.element.getAttribute('type') == 'fake' &&
        this.element.getAttribute('force3p') == 'true') {
      this.adUrl_ = this.getAdUrl();
      this.adPromise_ = Promise.resolve();
      return;
    }

    // Increment unique promise ID so that if its value changes within the
    // promise chain due to cancel from unlayout, the promise will be rejected.
    ++this.promiseId_;

    // Shorthand for: reject promise if current promise chain is out of date.
    const checkStillCurrent = this.verifyStillCurrent();

    // Return value from this chain: True iff rendering was "successful"
    // (i.e., shouldn't try to render later via iframe); false iff should
    // try to render later in iframe.
    // Cases to handle in this chain:
    //   - Everything ok  => Render; return true
    //   - Empty network response returned => Don't render; return true
    //   - Can't parse creative out of response => Don't render; return false
    //   - Can parse, but creative is empty => Don't render; return true
    //   - Validation fails => return false
    //   - Rendering fails => return false
    //   - Chain cancelled => don't return; drop error
    //   - Uncaught error otherwise => don't return; percolate error up
    this.adPromise_ = viewerForDoc(this.getAmpDoc()).whenFirstVisible()
        .then(() => {
          checkStillCurrent();
          // See if experiment that delays request until slot is within
          // renderOutsideViewport. Within render outside viewport will not
          // resolve if already within viewport thus the check for already
          // meeting the definition as opposed to waiting on the promise.
          if (this.delayRequestEnabled_ &&
              !this.getResource().renderOutsideViewport()) {
            return this.getResource().whenWithinRenderOutsideViewport();
          }
        })
        // This block returns the ad URL, if one is available.
        /** @return {!Promise<?string>} */
        .then(() => {
          checkStillCurrent();
          if (this.delayRequestEnabled_) {
            dev().info(TAG, 'ad request being built');
          }
          return /** @type {!Promise<?string>} */ (this.getAdUrl());
        })
        // This block returns the (possibly empty) response to the XHR request.
        /** @return {!Promise<?Response>} */
        .then(adUrl => {
          checkStillCurrent();
          this.adUrl_ = adUrl;
          this.protectedEmitLifecycleEvent_('urlBuilt');
          return adUrl && this.sendXhrRequest(adUrl);
        })
        // The following block returns either the response (as a {bytes, headers}
        // object), or null if no response is available / response is empty.
        /** @return {?Promise<?{bytes: !ArrayBuffer, headers: !Headers}>} */
        .then(fetchResponse => {
          checkStillCurrent();
          this.protectedEmitLifecycleEvent_('adRequestEnd');
          // If the response is null, we want to return null so that
          // unlayoutCallback will attempt to render via x-domain iframe,
          // assuming ad url or creative exist.
          if (!fetchResponse) {
            return null;
          }
          // If the response has response code 204, or arrayBuffer is null,
          // collapse it.
          if (!fetchResponse.arrayBuffer || fetchResponse.status == 204) {
            this.forceCollapse();
            return Promise.reject(NO_CONTENT_RESPONSE);
          }
          // TODO(tdrl): Temporary, while we're verifying whether SafeFrame is
          // an acceptable solution to the 'Safari on iOS doesn't fetch
          // iframe src from cache' issue.  See
          // https://github.com/ampproject/amphtml/issues/5614
          const method = fetchResponse.headers.get(RENDERING_TYPE_HEADER) ||
              this.experimentalNonAmpCreativeRenderMethod_;
          this.experimentalNonAmpCreativeRenderMethod_ = method;
          if (method && !isEnumValue(XORIGIN_MODE, method)) {
            dev().error('AMP-A4A', `cross-origin render mode header ${method}`);
          }
          const safeframeVersionHeader =
            fetchResponse.headers.get(SAFEFRAME_VERSION_HEADER);
          if (/^[0-9-]+$/.test(safeframeVersionHeader) &&
              safeframeVersionHeader != DEFAULT_SAFEFRAME_VERSION) {
            this.safeframeVersion_ = safeframeVersionHeader;
            this.preconnect.preload(this.getSafeframePath_());
          }
          // Note: Resolving a .then inside a .then because we need to capture
          // two fields of fetchResponse, one of which is, itself, a promise,
          // and one of which isn't.  If we just return
          // fetchResponse.arrayBuffer(), the next step in the chain will
          // resolve it to a concrete value, but we'll lose track of
          // fetchResponse.headers.
          return fetchResponse.arrayBuffer().then(bytes => {
            if (bytes.byteLength == 0) {
              // The server returned no content. Instead of displaying a blank
              // rectangle, we collapse the slot instead.
              this.forceCollapse();
              return Promise.reject(NO_CONTENT_RESPONSE);
            }
            return {
              bytes,
              headers: fetchResponse.headers,
            };
          });
        })
        // This block returns the ad creative and signature, if available; null
        // otherwise.
        /**
         * @return {!Promise<?{AdResponseDef}>}
         */
        .then(responseParts => {
          checkStillCurrent();
          if (responseParts) {
            this.protectedEmitLifecycleEvent_('extractCreativeAndSignature');
          }
          return responseParts && this.extractCreativeAndSignature(
              responseParts.bytes, responseParts.headers);
        })
        // This block returns the ad creative if it exists and validates as AMP;
        // null otherwise.
        /** @return {!Promise<?ArrayBuffer>} */
        .then(creativeParts => {
          checkStillCurrent();
          // Keep a handle to the creative body so that we can render into
          // SafeFrame or NameFrame later, if necessary.  TODO(tdrl): Temporary,
          // while we
          // assess whether this is the right solution to the Safari+iOS iframe
          // src cache issue.  If we decide to keep a SafeFrame-like solution,
          // we should restructure the promise chain to pass this info along
          // more cleanly, without use of an object variable outside the chain.
          if (!creativeParts) {
            return Promise.resolve();
          }
          this.creativeSize_ = creativeParts.size || this.creativeSize_;
          if (this.experimentalNonAmpCreativeRenderMethod_ !=
              XORIGIN_MODE.CLIENT_CACHE &&
              creativeParts.creative) {
            this.creativeBody_ = creativeParts.creative;
          }
          if (!creativeParts.signature) {
            return Promise.resolve();
          }
          this.protectedEmitLifecycleEvent_('adResponseValidateStart');
          return this.verifyCreativeSignature_(
              creativeParts.creative, creativeParts.signature)
              .then(creative => {
                if (creative) {
                  return creative;
                }

                user().error(TAG, this.element.getAttribute('type'),
                    'Unable to validate AMP creative against key providers');
                // Attempt to re-fetch the keys in case our locally cached
                // batch has expired.
                this.win.ampA4aValidationKeys = this.getKeyInfoSets_();
                return this.verifyCreativeSignature_(
                    creativeParts.creative, creativeParts.signature);
              });
        })
        .then(creative => {
          checkStillCurrent();
          // Need to know if creative was verified as part of render outside
          // viewport but cannot wait on promise.  Sadly, need a state a
          // variable.
          this.isVerifiedAmpCreative_ = !!creative;
          // TODO(levitzky) If creative comes back null, we should consider re-
          // fetching the signing server public keys and try the verification
          // step again.
          return creative && utf8Decode(creative);
        })
        // This block returns CreativeMetaDataDef iff the creative was verified
        // as AMP and could be properly parsed for friendly iframe render.
        /** @return {?CreativeMetaDataDef} */
        .then(creativeDecoded => {
          checkStillCurrent();
          // Note: It's critical that #getAmpAdMetadata_ be called
          // on precisely the same creative that was validated
          // via #validateAdResponse_.  See GitHub issue
          // https://github.com/ampproject/amphtml/issues/4187
          let creativeMetaDataDef;
          if (!creativeDecoded ||
            !(creativeMetaDataDef = this.getAmpAdMetadata_(creativeDecoded))) {
            return null;
          }
          // Update priority.
          this.updatePriority(0);
          // Load any extensions; do not wait on their promises as this
          // is just to prefetch.
          const extensions = extensionsFor(this.win);
          creativeMetaDataDef.customElementExtensions.forEach(
            extensionId => extensions.loadExtension(extensionId));
          return creativeMetaDataDef;
        })
        .catch(error => {
          if (error == NO_CONTENT_RESPONSE) {
            return {
              minifiedCreative: '',
              customElementExtensions: [],
              customStylesheets: [],
            };
          }
          // If error in chain occurs, report it and return null so that
          // layoutCallback can render via cross domain iframe assuming ad
          // url or creative exist.
          this.promiseErrorHandler_(error);
          return null;
        });
  }

  /**
   * Attempts to validate the creative signature against every key currently in
   * our possession. This should never be called before at least one key fetch
   * attempt is made.
   *
   * @param {!ArrayBuffer} creative
   * @param {!Uint8Array} signature
   * @return {!Promise<!ArrayBuffer>} The creative.
   */
  verifyCreativeSignature_(creative, signature) {
    if (getMode().localDev) {
      // localDev mode allows "FAKESIG" signature for the "fake" network.
      if (signature == 'FAKESIG' &&
          this.element.getAttribute('type') == 'fake') {
        return Promise.resolve(creative);
      }
    }

    // For each signing service, we have exactly one Promise,
    // keyInfoSetPromise, that holds an Array of Promises of signing keys.
    // So long as any one of these signing services can verify the
    // signature, then the creative is valid AMP.
    /** @type {!AllServicesCryptoKeysDef} */
    const keyInfoSetPromises = this.win.ampA4aValidationKeys;
    // Track if verification found, as it will ensure that promises yet to
    // resolve will "cancel" as soon as possible saving unnecessary resource
    // allocation.
    let verified = false;
    return some(keyInfoSetPromises.map(keyInfoSetPromise => {
      // Resolve Promise into an object containing a 'keys' field, which
      // is an Array of Promises of signing keys.  *whew*
      return keyInfoSetPromise.then(keyInfoSet => {
        // As long as any one individual key of a particular signing
        // service, keyInfoPromise, can verify the signature, then the
        // creative is valid AMP.
        if (verified) {
          return Promise.reject('noop');
        }
        return some(keyInfoSet.keys.map(keyInfoPromise => {
          // Resolve Promise into signing key.
          return keyInfoPromise.then(keyInfo => {
            if (verified) {
              return Promise.reject('noop');
            }
            if (!keyInfo) {
              return Promise.reject('Promise resolved to null key.');
            }
            const signatureVerifyStartTime = this.getNow_();
            // If the key exists, try verifying with it.
            return this.crypto_.verifySignature(
                new Uint8Array(creative),
                signature,
                keyInfo)
                .then(isValid => {
                  if (isValid) {
                    verified = true;
                    this.protectedEmitLifecycleEvent_(
                        'signatureVerifySuccess', {
                          'met.delta.AD_SLOT_ID': Math.round(
                              this.getNow_() - signatureVerifyStartTime),
                          'signingServiceName.AD_SLOT_ID': keyInfo.serviceName,
                        });
                    return creative;
                  }
                  // Only report if signature is expected to match, given that
                  // multiple key providers could have been specified.
                  // Note: the 'keyInfo &&' check here is not strictly
                  // necessary, because we checked that above.  But
                  // Closure type compiler can't seem to recognize that, so
                  // this guarantees it to the compiler.
                  if (keyInfo &&
                      this.crypto_.verifyHashVersion(signature, keyInfo)) {
                    user().error(TAG, this.element.getAttribute('type'),
                        'Key failed to validate creative\'s signature',
                        keyInfo.serviceName, keyInfo.cryptoKey);
                  }
                  // Reject to ensure the some operation waits for other
                  // possible providers to properly verify and resolve.
                  return Promise.reject(
                      `${keyInfo.serviceName} key failed to verify`);
                },
                err => {
                  dev().error(
                    TAG, this.element.getAttribute('type'), keyInfo.serviceName,
                    err, this.element);
                });
          });
        }))
        // some() returns an array of which we only need a single value.
        .then(returnedArray => returnedArray[0], () => {
          // Rejection occurs if all keys for this provider fail to validate.
          return Promise.reject(
              `All keys for ${keyInfoSet.serviceName} failed to verify`);
        });
      });
    }))
    .then(returnedArray => {
      this.protectedEmitLifecycleEvent_('adResponseValidateEnd');
      return returnedArray[0];
    }, () => {
      // rejection occurs if all providers fail to verify.
      this.protectedEmitLifecycleEvent_('adResponseValidateEnd');
      return Promise.reject('No validation service could verify this key');
    });
  }

  /**
   * Handles uncaught errors within promise flow.
   * @param {*} error
   * @param {boolean=} opt_ignoreStack
   * @private
   */
  promiseErrorHandler_(error, opt_ignoreStack) {
    if (isCancellation(error)) {
      // Rethrow if cancellation.
      throw error;
    }

    if (error && error.message) {
      error = duplicateErrorIfNecessary(/** @type {!Error} */(error));
    } else {
      error = new Error('unknown error ' + error);
    }
    if (opt_ignoreStack) {
      error.ignoreStack = opt_ignoreStack;
    }

    // Add `type` to the message. Ensure to preserve the original stack.
    const type = this.element.getAttribute('type') || 'notype';
    if (error.message.indexOf(`${TAG}: ${type}:`) != 0) {
      error.message = `${TAG}: ${type}: ${error.message}`;
    }

    // Additional arguments.
    assignAdUrlToError(/** @type {!Error} */(error), this.adUrl_);

    if (getMode().development || getMode().localDev || getMode().log) {
      user().error(TAG, error);
    } else {
      user().warn(TAG, error);
      // Report with 1% sampling as an expected dev error.
      if (Math.random() < 0.01) {
        dev().expectedError(TAG, error);
      }
    }
  }

  /** @override */
  layoutCallback() {
    // Promise may be null if element was determined to be invalid for A4A.
    if (!this.adPromise_) {
      if (this.shouldInitializePromiseChain_()) {
        dev().error(TAG, 'Null promise in layoutCallback');
      }
      return Promise.resolve();
    }
    // There's no real throttling with A4A, but this is the signal that is
    // most comparable with the layout callback for 3p ads.
    this.protectedEmitLifecycleEvent_('preAdThrottle');
    const layoutCallbackStart = this.getNow_();
    const checkStillCurrent = this.verifyStillCurrent();
    // Promise chain will have determined if creative is valid AMP.
    return this.adPromise_.then(creativeMetaData => {
      checkStillCurrent();
      const delta = this.getNow_() - layoutCallbackStart;
      this.protectedEmitLifecycleEvent_('layoutAdPromiseDelay', {
        layoutAdPromiseDelay: Math.round(delta),
        isAmpCreative: !!creativeMetaData,
      });
      if (this.isCollapsed_) {
        return Promise.resolve();
      }
      // If this.iframe already exists, bail out here. This should only happen in
      // testing context, not in production.
      if (this.iframe) {
        this.protectedEmitLifecycleEvent_('iframeAlreadyExists');
        return Promise.resolve();
      }
      if (!creativeMetaData) {
        // Non-AMP creative case, will verify ad url existence.
        return this.renderNonAmpCreative_();
      }
      // Must be an AMP creative.
      return this.renderAmpCreative_(creativeMetaData)
          .catch(err => {
            checkStillCurrent();
            // Failed to render via AMP creative path so fallback to non-AMP
            // rendering within cross domain iframe.
            user().error(TAG, this.element.getAttribute('type'),
                         'Error injecting creative in friendly frame', err);
            this.promiseErrorHandler_(err);
            return this.renderNonAmpCreative_();
          });
    }).catch(error => {
      this.promiseErrorHandler_(error);
      throw cancellation();
    });
  }

  /** @override **/
  attemptChangeSize(newHeight, newWidth) {
    // Store original size of slot in order to allow re-expansion on
    // unlayoutCallback so that it is reverted to original size in case
    // of resumeCallback.
    this.originalSlotSize_ = this.originalSlotSize_ || this.getLayoutBox();
    return super.attemptChangeSize(newHeight, newWidth).catch(() => {});
  }

  /** @override  */
  unlayoutCallback() {
    if (this.friendlyIframeEmbed_) {
      return false;
    }
    // Increment promiseId to cause any pending promise to cancel.
    this.promiseId_++;
    this.protectedEmitLifecycleEvent_('adSlotCleared');
    this.uiHandler.applyUnlayoutUI();
    if (this.originalSlotSize_) {
      super.attemptChangeSize(
        this.originalSlotSize_.height, this.originalSlotSize_.width)
        .then(() => {
          this.originalSlotSize_ = null;
        })
        .catch(err => {
          // TODO(keithwrightbos): if we are unable to revert size, on next
          // trigger of promise chain the ad request may fail due to invalid
          // slot size.  Determine how to handle this case.
          dev().warn(TAG, 'unable to revert to original size', err);
        });
    }

    this.isCollapsed_ = false;

    // Allow embed to release its resources.
    if (this.friendlyIframeEmbed_) {
      this.friendlyIframeEmbed_.destroy();
      this.friendlyIframeEmbed_ = null;
    }

    // Remove rendering frame, if it exists.
    if (this.iframe && this.iframe.parentElement) {
      this.iframe.parentElement.removeChild(this.iframe);
      this.iframe = null;
    }

    this.adPromise_ = null;
    this.adUrl_ = null;
    this.creativeBody_ = null;
    this.isVerifiedAmpCreative_ = false;
    this.fromResumeCallback = false;
    this.experimentalNonAmpCreativeRenderMethod_ =
        platformFor(this.win).isIos() ? XORIGIN_MODE.SAFEFRAME : null;
    if (this.xOriginIframeHandler_) {
      this.xOriginIframeHandler_.freeXOriginIframe();
      this.xOriginIframeHandler_ = null;
    }
    return true;
  }

  /** @override  */
  viewportCallback(inViewport) {
    if (this.friendlyIframeEmbed_) {
      setFriendlyIframeEmbedVisible(this.friendlyIframeEmbed_, inViewport);
    }
    if (this.xOriginIframeHandler_) {
      this.xOriginIframeHandler_.viewportCallback(inViewport);
    }
  }

  /** @override */
  createPlaceholderCallback() {
    return this.uiHandler.createPlaceholder();
  }

  /**
   * Gets the Ad URL to send an XHR Request to.  To be implemented
   * by network.
   * @return {!Promise<string>|string}
   */
  getAdUrl() {
    throw new Error('getAdUrl not implemented!');
  }

  /**
   * Resets ad url state to null, used to prevent frame get fallback if error
   * is thrown after url construction but prior to layoutCallback.
   */
  resetAdUrl() {
    this.adUrl_ = null;
  }

  /**
   * @return {!function()} function that when called will verify if current
   *    ad retrieval is current (meaning unlayoutCallback was not executed).
   *    If not, will throw cancellation exception;
   * @throws {Error}
   */
  verifyStillCurrent() {
    const promiseId = this.promiseId_;
    return () => {
      if (promiseId != this.promiseId_) {
        throw cancellation();
      }
    };
  }

  /**
   * Extracts creative and verification signature (if present) from
   * XHR response body and header.  To be implemented by network.
   *
   * In the returned value, the `creative` field should be an `ArrayBuffer`
   * containing the utf-8 encoded bytes of the creative itself, while the
   * `signature` field should be a `Uint8Array` containing the raw signature
   * bytes.  The `signature` field may be null if no signature was available
   * for this creative / the creative is not valid AMP.
   *
   * @param {!ArrayBuffer} unusedResponseArrayBuffer content as array buffer
   * @param {!../../../src/service/xhr-impl.FetchResponseHeaders} unusedResponseHeaders
   *   XHR service FetchResponseHeaders object containing the response
   *   headers.
   * @return {!Promise<!AdResponseDef>}
   */
  extractCreativeAndSignature(unusedResponseArrayBuffer,
      unusedResponseHeaders) {
    throw new Error('extractCreativeAndSignature not implemented!');
  }

  /**
   * Forces the UI Handler to collapse this slot.
   * @visibleForTesting
   */
  forceCollapse() {
    dev().assert(this.uiHandler);
    // Store original size to allow for reverting on unlayoutCallback so that
    // subsequent pageview allows for ad request.
    this.originalSlotSize_ = this.originalSlotSize_ || this.getLayoutBox();
    this.uiHandler.applyNoContentUI();
    this.isCollapsed_ = true;
  }

  /**
   * Callback executed when creative has successfully rendered within the
   * publisher page but prior to load (or ini-load for friendly frame AMP
   * creative render).  To be overridden by network implementations as needed.
   *
   * @param {boolean} isVerifiedAmpCreative whether or not the creative was
   *    verified as AMP and therefore given preferential treatment.
   */
  onCreativeRender(isVerifiedAmpCreative) {
    if (isVerifiedAmpCreative) {
      this.protectedEmitLifecycleEvent_('renderFriendlyEnd');
    }
  }

  /**
   * @param {!Element} iframe that was just created.  To be overridden for
   * testing.
   * @visibleForTesting
   */
  onCrossDomainIframeCreated(iframe) {
    dev().info(TAG, this.element.getAttribute('type'),
        `onCrossDomainIframeCreated ${iframe}`);
  }

  /**
   * Send ad request, extract the creative and signature from the response.
   * @param {string} adUrl Request URL to send XHR to.
   * @return {!Promise<?../../../src/service/xhr-impl.FetchResponse>}
   * @protected
   */
  sendXhrRequest(adUrl) {
    this.protectedEmitLifecycleEvent_('adRequestStart');
    const xhrInit = {
      mode: 'cors',
      method: 'GET',
      credentials: 'include',
    };
    return xhrFor(this.win)
        .fetch(adUrl, xhrInit)
        .catch(unusedReason => {
          // If an error occurs, let the ad be rendered via iframe after delay.
          // TODO(taymonbeal): Figure out a more sophisticated test for deciding
          // whether to retry with an iframe after an ad request failure or just
          // give up and render the fallback content (or collapse the ad slot).
          this.protectedEmitLifecycleEvent_('networkError');
          return null;
        });
  }

  /**
   * To be overridden by network specific implementation indicating which
   * signing service(s) is to be used.
   * @return {!Array<string>} A list of signing services.
   */
  getSigningServiceNames() {
    return getMode().localDev ? ['google', 'google-dev'] : ['google'];
  }

  /**
   * Retrieves all public keys, as specified in _a4a-config.js.
   * None of the (inner or outer) promises returned by this function can reject.
   *
   * @return {!AllServicesCryptoKeysDef}
   * @private
   */
  getKeyInfoSets_() {
    if (!this.crypto_.isCryptoAvailable()) {
      return [];
    }
    return this.getSigningServiceNames().map(serviceName => {
      dev().assert(getMode().localDev || !endsWith(serviceName, '-dev'));
      const url = signingServerURLs[serviceName];
      const currServiceName = serviceName;
      if (url) {
        // Delay request until document is not in a prerender state.
        return viewerForDoc(this.getAmpDoc()).whenFirstVisible()
          .then(() => xhrFor(this.win).fetchJson(url, {
            mode: 'cors',
            method: 'GET',
            // Set ampCors false so that __amp_source_origin is not
            // included in XHR CORS request allowing for keyset to be cached
            // across pages.
            ampCors: false,
            credentials: 'omit',
          }).then(res => res.json()).then(jwkSetObj => {
            const result = {serviceName: currServiceName};
            if (isObject(jwkSetObj) && Array.isArray(jwkSetObj.keys) &&
                jwkSetObj.keys.every(isObject)) {
              result.keys = jwkSetObj.keys;
            } else {
              user().error(TAG, this.element.getAttribute('type'),
                  `Invalid response from signing server ${currServiceName}`,
                  this.element);
              result.keys = [];
            }
            return result;
          })).then(jwkSet => {
            return {
              serviceName: jwkSet.serviceName,
              keys: jwkSet.keys.map(jwk =>
                  this.crypto_.importPublicKey(jwkSet.serviceName, jwk)
                  .catch(err => {
                    user().error(TAG, this.element.getAttribute('type'),
                        `error importing keys for: ${jwkSet.serviceName}`,
                        err, this.element);
                    return null;
                  })),
            };
          }).catch(err => {
            user().error(
                TAG, this.element.getAttribute('type'), err, this.element);
            // TODO(a4a-team): This is a failure in the initial attempt to get
            // the keys, probably b/c of a network condition.  We should
            // re-trigger key fetching later.
            return {serviceName: currServiceName, keys: []};
          });
      } else {
        // The given serviceName does not have a corresponding URL in
        // _a4a-config.js.
        const reason = `Signing service '${serviceName}' does not exist.`;
        user().error(
            TAG, this.element.getAttribute('type'), reason, this.element);
        return Promise.resolve({serviceName: currServiceName, keys: []});
      }
    });
  }

  /**
   * Render non-AMP creative within cross domain iframe.
   * @return {Promise<boolean>} Whether the creative was successfully rendered.
   * @private
   */
  renderNonAmpCreative_() {
    if (this.element.getAttribute('disable3pfallback') == 'true') {
      user().warn(TAG, this.element.getAttribute('type'),
        'fallback to 3p disabled');
      return Promise.resolve(false);
    }
    this.promiseErrorHandler_(
        new Error('fallback to 3p'),
        /* ignoreStack */ true);
    // Haven't rendered yet, so try rendering via one of our
    // cross-domain iframe solutions.
    const method = this.experimentalNonAmpCreativeRenderMethod_;
    let renderPromise = Promise.resolve(false);
    if ((method == XORIGIN_MODE.SAFEFRAME ||
         method == XORIGIN_MODE.NAMEFRAME) &&
        this.creativeBody_) {
      renderPromise = this.renderViaNameAttrOfXOriginIframe_(
          this.creativeBody_);
      this.creativeBody_ = null;  // Free resources.
    } else if (this.adUrl_) {
      assertHttpsUrl(this.adUrl_, this.element);
      renderPromise = this.renderViaCachedContentIframe_(this.adUrl_);
    } else {
      // Ad URL may not exist if buildAdUrl throws error or returns empty.
      // If error occurred, it would have already been reported but let's
      // report to user in case of empty.
      user().warn(TAG, this.element.getAttribute('type'),
        'No creative or URL available -- A4A can\'t render any ad');
    }
    incrementLoadingAds(this.win, renderPromise);
    return renderPromise;
  }

  /**
   * Render a validated AMP creative directly in the parent page.
   * @param {!CreativeMetaDataDef} creativeMetaData Metadata required to render
   *     AMP creative.
   * @return {!Promise} Whether the creative was successfully rendered.
   * @private
   */
  renderAmpCreative_(creativeMetaData) {
    dev().assert(creativeMetaData.minifiedCreative,
        'missing minified creative');
    dev().assert(!!this.element.ownerDocument, 'missing owner document?!');
    this.protectedEmitLifecycleEvent_('renderFriendlyStart');
    // Create and setup friendly iframe.
    this.iframe = /** @type {!HTMLIFrameElement} */(
        createElementWithAttributes(
            /** @type {!Document} */(this.element.ownerDocument), 'iframe', {
              // NOTE: It is possible for either width or height to be 'auto',
              // a non-numeric value.
              height: this.creativeSize_.height,
              width: this.creativeSize_.width,
              frameborder: '0',
              allowfullscreen: '',
              allowtransparency: '',
              scrolling: 'no',
            }));
    this.applyFillContent(this.iframe);
    const fontsArray = [];
    if (creativeMetaData.customStylesheets) {
      creativeMetaData.customStylesheets.forEach(s => {
        const href = s['href'];
        if (href) {
          fontsArray.push(href);
        }
      });
    }
    const checkStillCurrent = this.verifyStillCurrent();
    return installFriendlyIframeEmbed(
        this.iframe, this.element, {
          host: this.element,
          url: this.adUrl_,
          html: creativeMetaData.minifiedCreative,
          extensionIds: creativeMetaData.customElementExtensions || [],
          fonts: fontsArray,
        }, embedWin => {
          installUrlReplacementsForEmbed(this.getAmpDoc(), embedWin,
            new A4AVariableSource(this.getAmpDoc(), embedWin));
        }).then(friendlyIframeEmbed => {
          checkStillCurrent();
          this.friendlyIframeEmbed_ = friendlyIframeEmbed;
          setFriendlyIframeEmbedVisible(
              friendlyIframeEmbed, this.isInViewport());
          // Ensure visibility hidden has been removed (set by boilerplate).
          const frameDoc = friendlyIframeEmbed.iframe.contentDocument ||
              friendlyIframeEmbed.win.document;
          setStyle(frameDoc.body, 'visibility', 'visible');
          // Capture phase click handlers on the ad.
          installAnchorClickInterceptor(
              this.getAmpDoc(), friendlyIframeEmbed.win);
          // Bubble phase click handlers on the ad.
          this.registerAlpHandler_(friendlyIframeEmbed.win);
          // Capture timing info for friendly iframe load completion.
          getTimingDataAsync(
              friendlyIframeEmbed.win,
              'navigationStart', 'loadEventEnd').then(delta => {
                checkStillCurrent();
                this.protectedEmitLifecycleEvent_('friendlyIframeLoaded', {
                  'navStartToLoadEndDelta.AD_SLOT_ID': Math.round(delta),
                });
              }).catch(err => {
                dev().error(TAG, this.element.getAttribute('type'),
                  'getTimingDataAsync for renderFriendlyEnd failed: ', err);
              });
          protectFunctionWrapper(this.onCreativeRender, this, err => {
            dev().error(TAG, this.element.getAttribute('type'),
                'Error executing onCreativeRender', err);
          })(true);
          // It's enough to wait for "ini-load" signal because in a FIE case
          // we know that the embed no longer consumes significant resources
          // after the initial load.
          return friendlyIframeEmbed.whenIniLoaded();
        }).then(() => {
          checkStillCurrent();
          // Capture ini-load ping.
          this.protectedEmitLifecycleEvent_('friendlyIframeIniLoad');
        });
  }

  /**
   * Shared functionality for cross-domain iframe-based rendering methods.
   * @param {!Object<string, string>} attributes The attributes of the iframe.
   * @return {!Promise} awaiting load event for ad frame
   * @private
   */
  iframeRenderHelper_(attributes) {
    const mergedAttributes = Object.assign(attributes, {
      height: this.creativeSize_.height,
      width: this.creativeSize_.width,
    });

    if (this.sentinel) {
      mergedAttributes['data-amp-3p-sentinel'] = this.sentinel;
    }
    this.iframe = createElementWithAttributes(
        /** @type {!Document} */ (this.element.ownerDocument),
        'iframe', Object.assign(mergedAttributes, SHARED_IFRAME_PROPERTIES));
    // TODO(keithwrightbos): noContentCallback?
    this.xOriginIframeHandler_ = new AMP.AmpAdXOriginIframeHandler(this);
    // Iframe is appended to element as part of xorigin frame handler init.
    // Executive onCreativeRender after init to ensure it can get reference
    // to frame but prior to load to allow for earlier access.
    const frameLoadPromise =
        this.xOriginIframeHandler_.init(this.iframe, /* opt_isA4A */ true);
    protectFunctionWrapper(this.onCreativeRender, this, err => {
      dev().error(TAG, this.element.getAttribute('type'),
          'Error executing onCreativeRender', err);
    })(false);
    return frameLoadPromise;
  }

  /**
   * Creates iframe whose src matches that of the ad URL.  The response should
   * have been cached causing the browser to render without callout.  However,
   * it is possible for cache miss to occur which can be detected server-side
   * by missing ORIGIN header.
   *
   * Note: As of 2016-10-18, the fill-from-cache assumption appears to fail on
   * Safari-on-iOS, which issues a fresh network request, even though the
   * content is already in cache.
   *
   * @param {string} adUrl  Ad request URL, as sent to #sendXhrRequest (i.e.,
   *    before any modifications that XHR module does to it.)
   * @return {!Promise} awaiting ad completed insertion.
   * @private
   */
  renderViaCachedContentIframe_(adUrl) {
    this.protectedEmitLifecycleEvent_('renderCrossDomainStart');
    return this.iframeRenderHelper_({
      src: xhrFor(this.win).getCorsUrl(this.win, adUrl),
      name: JSON.stringify(
          getContextMetadata(this.win, this.element, this.sentinel)),
    });
  }

  /**
   * Render the creative via some "cross domain iframe that accepts the creative
   * in the name attribute".  This could be SafeFrame or the AMP-native
   * NameFrame.
   *
   * @param {!ArrayBuffer} creativeBody
   * @return {!Promise} awaiting load event for ad frame
   * @private
   */
  renderViaNameAttrOfXOriginIframe_(creativeBody) {
    const method = this.experimentalNonAmpCreativeRenderMethod_;
    dev().assert(method == XORIGIN_MODE.SAFEFRAME ||
        method == XORIGIN_MODE.NAMEFRAME,
        'Unrecognized A4A cross-domain rendering mode: %s', method);
    this.protectedEmitLifecycleEvent_('renderSafeFrameStart');
    const checkStillCurrent = this.verifyStillCurrent();
    return utf8Decode(creativeBody).then(creative => {
      checkStillCurrent();
      let srcPath;
      let name = '';
      switch (method) {
        case XORIGIN_MODE.SAFEFRAME:
          srcPath = this.getSafeframePath_() + '?n=0';
          break;
        case XORIGIN_MODE.NAMEFRAME:
          srcPath = getDefaultBootstrapBaseUrl(this.win, 'nameframe');
          // Name will be set for real below in nameframe case.
          break;
        default:
          // Shouldn't be able to get here, but...  Because of the assert, above,
          // we can only get here in non-dev mode, so give user feedback.
          user().error('A4A', 'A4A received unrecognized cross-domain name'
              + ' attribute iframe rendering mode request: %s.  Unable to'
              + ' render a creative for'
              + ' slot %s.', method, this.element.getAttribute('id'));
          return Promise.reject('Unrecognized rendering mode request');
      }
      // TODO(bradfrizzell): change name of function and var
      let contextMetadata = getContextMetadata(
          this.win, this.element, this.sentinel);
      // TODO(bradfrizzell) Clean up name assigning.
      if (method == XORIGIN_MODE.NAMEFRAME) {
        contextMetadata['creative'] = creative;
        name = JSON.stringify(contextMetadata);
      } else if (method == XORIGIN_MODE.SAFEFRAME) {
        contextMetadata = JSON.stringify(contextMetadata);
        name = `${this.safeframeVersion_};${creative.length};${creative}` +
            `${contextMetadata}`;
      }
      return this.iframeRenderHelper_({src: srcPath, name});
    });
  }

  /**
   *
   * Throws {@code SyntaxError} if the metadata block delimiters are missing
   * or corrupted or if the metadata content doesn't parse as JSON.
   * @param {string} creative from which CSS is extracted
   * @return {?CreativeMetaDataDef} Object result of parsing JSON data blob inside
   *     the metadata markers on the ad text, or null if no metadata markers are
   *     found.
   * @private
   * TODO(keithwrightbos@): report error cases
   */
  getAmpAdMetadata_(creative) {
    let metadataString = METADATA_STRING;
    let metadataStart = creative.lastIndexOf(METADATA_STRING);
    if (metadataStart < 0) {
      metadataString = METADATA_STRING_NO_QUOTES;
      metadataStart = creative.lastIndexOf(METADATA_STRING_NO_QUOTES);
    }
    if (metadataStart < 0) {
      // Couldn't find a metadata blob.
      dev().warn(TAG, this.element.getAttribute('type'),
          'Could not locate start index for amp meta data in: %s', creative);
      return null;
    }
    const metadataEnd = creative.lastIndexOf('</script>');
    if (metadataEnd < 0) {
      // Couldn't find a metadata blob.
      dev().warn(TAG, this.element.getAttribute('type'),
          'Could not locate closing script tag for amp meta data in: %s',
          creative);
      return null;
    }
    try {
      const metaDataObj = JSON.parse(
        creative.slice(metadataStart + metadataString.length, metadataEnd));
      const ampRuntimeUtf16CharOffsets =
        metaDataObj['ampRuntimeUtf16CharOffsets'];
      if (!isArray(ampRuntimeUtf16CharOffsets) ||
          ampRuntimeUtf16CharOffsets.length != 2 ||
          typeof ampRuntimeUtf16CharOffsets[0] !== 'number' ||
          typeof ampRuntimeUtf16CharOffsets[1] !== 'number') {
        throw new Error('Invalid runtime offsets');
      }
      const metaData = {};
      if (metaDataObj['customElementExtensions']) {
        metaData.customElementExtensions =
          metaDataObj['customElementExtensions'];
        if (!isArray(metaData.customElementExtensions)) {
          throw new Error(
              'Invalid extensions', metaData.customElementExtensions);
        }
      } else {
        metaData.customElementExtensions = [];
      }
      if (metaDataObj['customStylesheets']) {
        // Expect array of objects with at least one key being 'href' whose
        // value is URL.
        metaData.customStylesheets = metaDataObj['customStylesheets'];
        const errorMsg = 'Invalid custom stylesheets';
        if (!isArray(metaData.customStylesheets)) {
          throw new Error(errorMsg);
        }
        metaData.customStylesheets.forEach(stylesheet => {
          if (!isObject(stylesheet) || !stylesheet['href'] ||
              typeof stylesheet['href'] !== 'string' ||
              !/^https:\/\//i.test(stylesheet['href'])) {
            throw new Error(errorMsg);
          }
        });
      }
      // TODO(keithwrightbos): OK to assume ampRuntimeUtf16CharOffsets is before
      // metadata as its in the head?
      metaData.minifiedCreative =
        creative.slice(0, ampRuntimeUtf16CharOffsets[0]) +
        creative.slice(ampRuntimeUtf16CharOffsets[1], metadataStart) +
        creative.slice(metadataEnd + '</script>'.length);
      return metaData;
    } catch (err) {
      dev().warn(
          TAG, this.element.getAttribute('type'), 'Invalid amp metadata: %s',
          creative.slice(metadataStart + METADATA_STRING.length, metadataEnd));
      return null;
    }
  }

  /**
   * Registers a click handler for "A2A" (AMP-to-AMP navigation where the AMP
   * viewer navigates to an AMP destination on our behalf.
   * @param {!Window} iframeWin
   */
  registerAlpHandler_(iframeWin) {
    if (!isExperimentOn(this.win, 'alp-for-a4a')) {
      return;
    }
    iframeWin.document.documentElement.addEventListener('click', event => {
      handleClick(event, url => {
        viewerForDoc(this.getAmpDoc()).navigateTo(url, 'a4a');
      });
    });
  }

  /**
   * @return {string} full url to safeframe implementation.
   * @private
   */
  getSafeframePath_() {
    return 'https://tpc.googlesyndication.com/safeframe/' +
      `${this.safeframeVersion_}/html/container.html`;
  }

  /**
   * Receive collapse notifications and record lifecycle events for them.
   *
   * @param unusedElement {!AmpElement}
   * @override
   */
  collapsedCallback(unusedElement) {
    this.protectedEmitLifecycleEvent_('adSlotCollapsed');
  }

  /**
   * To be overriden by network specific implementation.
   * This function will be called for each lifecycle event as specified in the
   * LIFECYCLE_STAGES enum declaration.  It may additionally pass extra
   * variables of the form { name: val }.  It is up to the subclass what to
   * do with those variables.
   *
   * @param {string} unusedEventName
   * @param {!Object<string, string|number>=} opt_extraVariables
   */
  emitLifecycleEvent(unusedEventName, opt_extraVariables) {}
}

/**
 * Attachs query string portion of ad url to error.
 * @param {!Error} error
 * @param {string} adUrl
 */
export function assignAdUrlToError(error, adUrl) {
  if (!adUrl || (error.args && error.args['au'])) {
    return;
  }
  const adQueryIdx = adUrl.indexOf('?');
  if (adQueryIdx == -1) {
    return;
  }
  (error.args || (error.args = {}))['au'] =
    adUrl.substring(adQueryIdx + 1, adQueryIdx + 251);
};
