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
  allowRenderOutsideViewport,
  incrementLoadingAds,
} from '../../amp-ad/0.1/concurrent-load';
import {adConfig} from '../../../ads/_config';
import {signingServerURLs} from '../../../ads/_a4a-config';
import {
  closestByTag,
  removeChildren,
  createElementWithAttributes,
} from '../../../src/dom';
import {cancellation} from '../../../src/error';
import {installFriendlyIframeEmbed} from '../../../src/friendly-iframe-embed';
import {isLayoutSizeDefined} from '../../../src/layout';
import {isAdPositionAllowed} from '../../../src/ad-helper';
import {dev, user} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {isArray, isObject} from '../../../src/types';
import {urlReplacementsForDoc} from '../../../src/url-replacements';
import {some} from '../../../src/utils/promise';
import {utf8Decode} from '../../../src/utils/bytes';
import {viewerForDoc} from '../../../src/viewer';
import {xhrFor} from '../../../src/xhr';
import {endsWith} from '../../../src/string';
import {platformFor} from '../../../src/platform';
import {
  importPublicKey,
  isCryptoAvailable,
  verifySignature,
  PublicKeyInfoDef,
} from './crypto-verifier';
import {isExperimentOn} from '../../../src/experiments';
import {setStyle} from '../../../src/style';
import {handleClick} from '../../../ads/alp/handler';
import {AdDisplayState} from '../../../extensions/amp-ad/0.1/amp-ad-ui';
import {installUrlReplacementsForEmbed,}
    from '../../../src/service/url-replacements-impl';
import {A4AVariableSource} from './a4a-variable-source';

/** @private @const {string} */
const ORIGINAL_HREF_ATTRIBUTE = 'data-a4a-orig-href';

/**
 * @param {*} ary
 * @return {boolean} whether input is array of 2 numeric elements.
 * @private
 */
function isValidOffsetArray(ary) {
  return isArray(ary) && ary.length == 2 &&
      typeof ary[0] === 'number' &&
      typeof ary[1] === 'number';
}

/** @type {string} */
const METADATA_STRING = '<script type="application/json" amp-ad-metadata>';

// TODO(tdrl): Temporary, while we're verifying whether SafeFrame is an
// acceptable solution to the 'Safari on iOS doesn't fetch iframe src from
// cache' issue.  See https://github.com/ampproject/amphtml/issues/5614
/** @type {string} */
const SAFEFRAME_VERSION = '1-0-4';
/** @type {string} */
const SAFEFRAME_IMPL_PATH =
    'https://tpc.googlesyndication.com/safeframe/' + SAFEFRAME_VERSION +
    '/html/container.html';
/** @type {string} @visibleForTesting */
export const RENDERING_TYPE_HEADER = 'X-AmpAdRender';
/** @type {!Object} @private */
const SHARED_IFRAME_PROPERTIES = {
  frameborder: '0',
  allowfullscreen: '',
  allowtransparency: '',
  scrolling: 'no',
  marginwidth: '0',
  marginheight: '0',
};

/** @typedef {{creative: ArrayBuffer, signature: ?Uint8Array}} */
export let AdResponseDef;

/** @typedef {{
      minifiedCreative: string,
      customElementExtensions: Array<string>,
      customStylesheets: Array<string>
    }} */
let CreativeMetaDataDef;

/** @private */
export const LIFECYCLE_STAGES = {
  // Note: Use strings as values here, rather than numbers, so that "0" does
  // not test as `false` later.
  adSlotBuilt: '0',
  urlBuilt: '1',
  adRequestStart: '2',
  adRequestEnd: '3',
  extractCreativeAndSignature: '4',
  adResponseValidateStart: '5',
  renderFriendlyStart: '6',
  renderCrossDomainStart: '7',
  renderFriendlyEnd: '8',
  renderCrossDomainEnd: '9',
  preAdThrottle: '10',
  renderSafeFrameStart: '11',
  adSlotCleared: '20',
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

    /** @private {?Promise<!boolean>} */
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

    /** {?AMP.AmpAdUIHandler} */
    this.uiHandler = null;

    /** @private {?AMP.AmpAdXOriginIframeHandler} */
    this.xOriginIframeHandler_ = null;

    /** @private {boolean} */
    this.rendered_ = false;

    /** @private {boolean} whether layoutMeasure has been executed. */
    this.layoutMeasureExecuted_ = false;

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = this.getVsync();

    if (!this.win.ampA4aValidationKeys) {
      /** @private {!Array<!Promise<!Array<!Promise<?PublicKeyInfoDef>>>>} */
      this.win.ampA4aValidationKeys = this.getKeyInfoSets_();
    }

    // TODO(tdrl): Temporary, while we're verifying whether this is an
    // acceptable solution to the 'Safari on iOS doesn't fetch iframe src
    // from cache' issue.  See https://github.com/ampproject/amphtml/issues/5614
    /** @private {?ArrayBuffer} */
    this.creativeBody_ = null;
    /**
     * Note(keithwrightbos) - ensure the default here is null so that ios
     * uses safeframe when response header is not specified.
     * @private {?string}
     */
    this.experimentalNonAmpCreativeRenderMethod_ =
      platformFor(this.win).isIos() ? 'safeframe' : null;

    this.emitLifecycleEvent('adSlotBuilt');
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
    const adType = this.element.getAttribute('type');
    this.config = adConfig[adType] || {};
    this.uiHandler = new AMP.AmpAdUIHandler(this);
    this.uiHandler.init();
  }

  /** @override */
  renderOutsideViewport() {
    // Only relevant if non-AMP as AMP creative will be injected within
    // buildCallback promise chain.
    // If another ad is currently loading we only load ads that are currently
    // in viewport.
    const allowRender = allowRenderOutsideViewport(this.element, this.win);
    if (allowRender !== true) {
      return allowRender;
    }
    // Otherwise the ad is good to go.
    return super.renderOutsideViewport();
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
    // TODO(tdrl): Temporary, while we're verifying whether SafeFrame is an
    // acceptable solution to the 'Safari on iOS doesn't fetch iframe src from
    // cache' issue.  See https://github.com/ampproject/amphtml/issues/5614
    this.preconnect.url(SAFEFRAME_IMPL_PATH);
    if (!this.config) {
      return;
    }
    const preconnect = this.config.preconnect;
    // NOTE(keithwrightbos): using onLayout to indicate if preconnect should be
    // given preferential treatment.  Currently this would be false when
    // relevant (i.e. want to preconnect on or before onLayoutMeasure) which
    // causes preconnect to delay for 1 sec (see custom-element#preconnect)
    // therefore hard coding to true.
    // NOTE(keithwrightbos): Does not take isValidElement into account so could
    // preconnect unnecessarily, however it is assumed that isValidElement
    // matches amp-ad loader predicate such that A4A impl does not load.
    if (typeof preconnect == 'string') {
      this.preconnect.url(preconnect, true);
    } else if (preconnect) {
      preconnect.forEach(p => {
        this.preconnect.url(p, true);
      });
    }
  }

  /** @override */
  onLayoutMeasure() {
    if (this.xOriginIframeHandler_) {
      this.xOriginIframeHandler_.onLayoutMeasure();
    }
    if (this.layoutMeasureExecuted_ || !isCryptoAvailable()) {
      // onLayoutMeasure gets called multiple times.
      return;
    }
    this.layoutMeasureExecuted_ = true;
    user().assert(isAdPositionAllowed(this.element, this.win),
        '<%s> is not allowed to be placed in elements with ' +
        'position:fixed: %s', this.element.tagName, this.element);
    // OnLayoutMeasure can be called when page is in prerender so delay until
    // visible.  Assume that it is ok to call isValidElement as it should
    // only being looking at window, immutable properties (i.e. location) and
    // its element ancestry.
    if (!this.isValidElement()) {
      // TODO(kjwright): collapse?
      user().warn('AMP-A4A', 'Amp ad element ignored as invalid', this.element);
      return;
    }

    // Increment unique promise ID so that if its value changes within the
    // promise chain due to cancel from unlayout, the promise will be rejected.
    this.promiseId_++;
    const promiseId = this.promiseId_;
    // Shorthand for: reject promise if current promise chain is out of date.
    const checkStillCurrent = promiseId => {
      if (promiseId != this.promiseId_) {
        throw cancellation();
      }
    };

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
        // This block returns the ad URL, if one is available.
        /** @return {!Promise<?string>} */
        .then(() => {
          checkStillCurrent(promiseId);
          return /** @type {!Promise<?string>} */ (this.getAdUrl());
        })
        // This block returns the (possibly empty) response to the XHR request.
        /** @return {!Promise<?Response>} */
        .then(adUrl => {
          checkStillCurrent(promiseId);
          this.adUrl_ = adUrl;
          this.emitLifecycleEvent('urlBuilt', adUrl);
          return adUrl && this.sendXhrRequest_(adUrl);
        })
        // The following block returns either the response (as a {bytes, headers}
        // object), or null if no response is available / response is empty.
        /** @return {?Promise<?{bytes: !ArrayBuffer, headers: !Headers}>} */
        .then(fetchResponse => {
          checkStillCurrent(promiseId);
          if (!fetchResponse || !fetchResponse.arrayBuffer) {
            return null;
          }
          this.emitLifecycleEvent('adRequestEnd', fetchResponse);
          // TODO(tdrl): Temporary, while we're verifying whether SafeFrame is
          // an acceptable solution to the 'Safari on iOS doesn't fetch
          // iframe src from cache' issue.  See
          // https://github.com/ampproject/amphtml/issues/5614
          this.experimentalNonAmpCreativeRenderMethod_ =
              fetchResponse.headers.get(RENDERING_TYPE_HEADER) ||
              this.experimentalNonAmpCreativeRenderMethod_;
          // Note: Resolving a .then inside a .then because we need to capture
          // two fields of fetchResponse, one of which is, itself, a promise,
          // and one of which isn't.  If we just return
          // fetchResponse.arrayBuffer(), the next step in the chain will
          // resolve it to a concrete value, but we'll lose track of
          // fetchResponse.headers.
          return fetchResponse.arrayBuffer().then(bytes => {
            return {
              bytes,
              headers: fetchResponse.headers,
            };
          });
        })
        // This block returns the ad creative and signature, if available; null
        // otherwise.
        /**
         * @return {!Promise<?{creative: !ArrayBuffer, signature: !ArrayBuffer}>}
         */
        .then(responseParts => {
          checkStillCurrent(promiseId);
          if (responseParts) {
            this.emitLifecycleEvent('extractCreativeAndSignature',
                responseParts);
          }
          return responseParts && this.extractCreativeAndSignature(
              responseParts.bytes, responseParts.headers);
        })
        // This block returns the ad creative if it exists and validates as AMP;
        // null otherwise.
        /** @return {!Promise<?string>} */
        .then(creativeParts => {
          checkStillCurrent(promiseId);
          // Keep a handle to the creative body so that we can render into
          // SafeFrame later, if necessary.  TODO(tdrl): Temporary, while we
          // assess whether this is the right solution to the Safari+iOS iframe
          // src cache issue.  If we decide to keep a SafeFrame-like solution,
          // we should restructure the promise chain to pass this info along
          // more cleanly, without use of an object variable outside the chain.
          if (this.experimentalNonAmpCreativeRenderMethod_ == 'safeframe' &&
              creativeParts && creativeParts.creative) {
            this.creativeBody_ = creativeParts.creative;
          }
          if (!creativeParts || !creativeParts.signature) {
            return /** @type {!Promise<?string>} */ (Promise.resolve(null));
          }
          this.emitLifecycleEvent('adResponseValidateStart', creativeParts);
          return this.verifyCreativeSignature_(
              creativeParts.creative, creativeParts.signature)
              .then(creative => {
                if (creative) {
                  return creative;
                }
                // Attempt to re-fetch the keys in case our locally cached
                // batch has expired.
                this.win.ampA4aValidationKeys = this.getKeyInfoSets_();
                return this.verifyCreativeSignature_(
                    creativeParts.creative, creativeParts.signature);
              });
        })
        // This block returns true iff the creative was rendered in the shadow
        // DOM.
        /** @return {!Promise<!boolean>} */
        .then(creative => {
          checkStillCurrent(promiseId);
          // Note: It's critical that #maybeRenderAmpAd_ be called
          // on precisely the same creative that was validated
          // via #validateAdResponse_.  See GitHub issue
          // https://github.com/ampproject/amphtml/issues/4187

          // TODO(levitzky) If creative comes back null, we should consider re-
          // fetching the signing server public keys and try the verification
          // step again.
          return creative && this.maybeRenderAmpAd_(creative);
        })
        .catch(error => this.promiseErrorHandler_(error));
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
    // For each signing service, we have exactly one Promise,
    // keyInfoSetPromise, that holds an Array of Promises of signing keys.
    // So long as any one of these signing services can verify the
    // signature, then the creative is valid AMP.
    const keyInfoSetPromises = this.win.ampA4aValidationKeys;
    return some(keyInfoSetPromises.map(keyInfoSetPromise => {
      // Resolve Promise into Array of Promises of signing keys.
      return keyInfoSetPromise.then(keyInfoSet => {
        // As long as any one individual key of a particular signing
        // service, keyInfoPromise, can verify the signature, then the
        // creative is valid AMP.
        return some(keyInfoSet.map(keyInfoPromise => {
          // Resolve Promise into signing key.
          return keyInfoPromise.then(keyInfo => {
            if (!keyInfo) {
              return Promise.reject('Promise resolved to null key.');
            }
            // If the key exists, try verifying with it.
            return verifySignature(
                new Uint8Array(creative),
                signature,
                keyInfo)
                .then(isValid => {
                  if (isValid) {
                    return creative;
                  }
                  return Promise.reject(
                      'Key failed to validate creative\'s signature.');
                },
                err => {
                  user().error('AMP-A4A', err, this.element);
                });
          });
        }))
        // some() returns an array of which we only need a single value.
        .then(returnedArray => returnedArray[0]);
      });
    }))
    .then(returnedArray => returnedArray[0]);
  }

  /**
   * Handles uncaught errors within promise flow.
   * @param {*} error
   * @return {*}
   * @private
   */
  promiseErrorHandler_(error) {
    if (error && error.message) {
      if (error.message.indexOf('amp-a4a: ') == 0) {
        // caught previous call to promiseErrorHandler?  Infinite loop?
        return error;
      }
      if (error.message == cancellation().message) {
        // Rethrow if cancellation
        throw error;
      }
    }
    // Returning promise reject should trigger unhandledrejection which will
    // trigger reporting via src/error.js
    const adQueryIdx = this.adUrl_ ? this.adUrl_.indexOf('?') : -1;
    const state = {
      'm': error instanceof Error ? error.message : error,
      'tag': this.element.tagName,
      'type': this.element.getAttribute('type'),
      'au': adQueryIdx < 0 ? '' :
          this.adUrl_.substring(adQueryIdx + 1, adQueryIdx + 251),
    };
    return new Error('amp-a4a: ' + JSON.stringify(state));
  }

  /** @override */
  layoutCallback() {
    // Promise may be null if element was determined to be invalid for A4A.
    if (!this.adPromise_ || this.rendered_) {
      return Promise.resolve();
    }
    // Layoutcallback only executes if ad is within viewport or render
    // outside viewport returned true.  This is only relevant for non-AMP
    // creatives which rendered via the buildCallback promise chain.  Ensure
    // slot counts towards 3p loading count until we know that the creative is
    // valid AMP.
    return this.adPromise_.then(rendered => {
      if (rendered instanceof Error || !rendered) {
        this.emitLifecycleEvent('preAdThrottle');
        incrementLoadingAds(this.win);
        // Haven't rendered yet, so try rendering via one of our
        // cross-domain iframe solutions.
        if (this.experimentalNonAmpCreativeRenderMethod_ == 'safeframe' &&
            this.creativeBody_) {
          const renderPromise = this.renderViaSafeFrame_(this.creativeBody_);
          this.creativeBody_ = null;  // Free resources.
          return renderPromise;
        } else if (this.adUrl_) {
          return this.renderViaCachedContentIframe_(this.adUrl_);
        } else {
          throw new Error('No creative or URL available -- A4A can\'t render' +
              ' any ad');
        }
      }
      if (rendered instanceof Error) {
        throw rendered;
      }
    }).catch(error => Promise.reject(this.promiseErrorHandler_(error)));
  }

  /** @override  */
  unlayoutCallback() {
    this.emitLifecycleEvent('adSlotCleared');
    this.uiHandler.setDisplayState(AdDisplayState.NOT_LAID_OUT);
    // Remove creative and reset to allow for creation of new ad.
    if (!this.layoutMeasureExecuted_) {
      return true;
    }
    // TODO(keithwrightbos): is mutate necessary?  Could this lead to a race
    // condition where unlayoutCallback fires and during/after subsequent
    // layoutCallback execution, the mutate operation executes causing our
    // state to be destroyed?
    this.vsync_.mutate(() => {
      removeChildren(this.element);

      this.adPromise_ = null;
      this.adUrl_ = null;
      this.creativeBody_ = null;
      this.experimentalNonAmpCreativeRenderMethod_ =
          platformFor(this.win).isIos() ? 'safeframe' : null;
      this.rendered_ = false;
      if (this.xOriginIframeHandler_) {
        this.xOriginIframeHandler_.freeXOriginIframe();
        this.xOriginIframeHandler_ = null;
      }
      this.layoutMeasureExecuted_ = false;
    });
    // Increment promiseId to cause any pending promise to cancel.
    this.promiseId_++;
    return true;
  }

  /** @override  */
  viewportCallback(inViewport) {
    if (this.xOriginIframeHandler_) {
      this.xOriginIframeHandler_.viewportCallback(inViewport);
    }
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
   * @param {!Headers} unusedResponseHeaders Fetch API Headers object (or polyfill
   *     for it) containing the response headers.
   * @return {!Promise<!AdResponseDef>}
   */
  extractCreativeAndSignature(unusedResponseArrayBuffer,
      unusedResponseHeaders) {
    throw new Error('extractCreativeAndSignature not implemented!');
  }

  /**
   * Callback executed when AMP creative has successfully rendered within the
   * publisher page.  To be overridden by network implementations as needed.
   */
  onAmpCreativeRender() {
    this.emitLifecycleEvent('renderFriendlyEnd');
  }

  /**
   * @param {!Element} iframe that was just created.  To be overridden for
   * testing.
   * @visibleForTesting
   */
  onCrossDomainIframeCreated(iframe) {
    dev().info('A4A', `onCrossDomainIframeCreated ${iframe}`);
  }

  /**
   * Send ad request, extract the creative and signature from the response.
   * @param {string} adUrl Request URL to send XHR to.
   * @return {!Promise<?../../../src/service/xhr-impl.FetchResponse>}
   * @private
   */
  sendXhrRequest_(adUrl) {
    this.emitLifecycleEvent('adRequestStart');
    const xhrInit = {
      mode: 'cors',
      method: 'GET',
      credentials: 'include',
      requireAmpResponseSourceOrigin: true,
    };
    return xhrFor(this.win)
        .fetch(adUrl, xhrInit)
        .catch(unusedReason => {
          // If an error occurs, let the ad be rendered via iframe after delay.
          // TODO(taymonbeal): Figure out a more sophisticated test for deciding
          // whether to retry with an iframe after an ad request failure or just
          // give up and render the fallback content (or collapse the ad slot).
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
   * @return {!Array<!Promise<!Array<!Promise<?PublicKeyInfoDef>>>>}
   * @private
   */
  getKeyInfoSets_() {
    if (!isCryptoAvailable()) {
      return [];
    }
    const jwkSetPromises = this.getSigningServiceNames().map(serviceName => {
      dev().assert(getMode().localDev || !endsWith(serviceName, '-dev'));
      const url = signingServerURLs[serviceName];
      if (url) {
        return xhrFor(this.win).fetchJson(url, {mode: 'cors', method: 'GET'})
            .then(jwkSetObj => {
              if (isObject(jwkSetObj) && Array.isArray(jwkSetObj.keys) &&
                  jwkSetObj.keys.every(isObject)) {
                return jwkSetObj.keys;
              } else {
                user().error('AMP-A4A',
                    'Invalid response from signing server.',
                    this.element);
                return [];
              }
            }).catch(err => {
              user().error('AMP-A4A', err, this.element);
              return [];
            });
      } else {
        // The given serviceName does not have a corresponding URL in
        // _a4a-config.js.
        const reason = `Signing service '${serviceName}' does not exist.`;
        user().error('AMP-A4A', reason, this.element);
        return [];
      }
    });
    return jwkSetPromises.map(jwkSetPromise =>
        jwkSetPromise.then(jwkSet =>
          jwkSet.map(jwk =>
            importPublicKey(jwk).catch(err => {
              user().error('AMP-A4A', err, this.element);
              return null;
            }))));
  }

  /**
   * Render a validated AMP creative directly in the parent page.
   * @param {!ArrayBuffer} bytes The creative, as raw bytes.
   * @return {Promise<boolean>} Whether the creative was successfully
   *     rendered.
   * @private
   */
  maybeRenderAmpAd_(bytes) {
    this.emitLifecycleEvent('renderFriendlyStart', bytes);
    // AMP documents are required to be UTF-8
    return utf8Decode(bytes).then(creative => {
      // Find the json blob located at the end of the body and parse it.
      const creativeMetaData = this.getAmpAdMetadata_(creative);
      if (!creativeMetaData) {
        // Could not find appropriate markers within the creative therefore
        // load within cross domain iframe. Iframe is created immediately
        // (as opposed to waiting for layoutCallback) as the the creative has
        // been verified as AMP and will run efficiently.  Render inside a
        // vsync block so that AMP can coordinate visual impact.
        this.vsync_.mutate(() => {
          dev().assert(this.adUrl_, 'Ad URL missing in A4A creative rendering');
          this.renderViaCachedContentIframe_(this.adUrl_);
        });
        return true;
      } else {
        try {
          // Create and setup friendly iframe.
          dev().assert(!!this.element.ownerDocument);
          const iframe = /** @type {!HTMLIFrameElement} */(
            createElementWithAttributes(
              /** @type {!Document} */(this.element.ownerDocument), 'iframe', {
                'frameborder': '0', 'allowfullscreen': '',
                'allowtransparency': '', 'scrolling': 'no'}));
          this.applyFillContent(iframe);
          const fontsArray = [];
          if (creativeMetaData.customStylesheets) {
            creativeMetaData.customStylesheets.forEach(s => {
              const href = s['href'];
              if (href) {
                fontsArray.push(href);
              }
            });
          }
          return installFriendlyIframeEmbed(
            iframe, this.element, {
              url: this.adUrl_,
              html: creativeMetaData.minifiedCreative,
              extensionIds: creativeMetaData.customElementExtensions || [],
              fonts: fontsArray,
            }, embedWin => {
              installUrlReplacementsForEmbed(this.getAmpDoc(), embedWin,
                new A4AVariableSource(this.getAmpDoc(), embedWin));
            }).then(friendlyIframeEmbed => {
              // Ensure visibility hidden has been removed (set by boilerplate).
              const frameDoc = friendlyIframeEmbed.iframe.contentDocument ||
                friendlyIframeEmbed.win.document;
              setStyle(frameDoc.body, 'visibility', 'visible');
              // Capture phase click handlers on the ad.
              this.registerExpandUrlParams_(friendlyIframeEmbed.win);
              // Bubble phase click handlers on the ad.
              this.registerAlpHandler_(friendlyIframeEmbed.win);
              this.rendered_ = true;
              this.onAmpCreativeRender();
              return true;
            });
        } catch (e) {
          dev().error('AMP-A4A', 'Error injecting creative in friendly frame',
              e);
          // If we fail on any of the steps of Shadow DOM construction, just
          // render in iframe.
          // TODO: report!
          return false;
        }
      }
    });
  }

  /**
   * Shared functionality for cross-domain iframe-based rendering methods.
   * @param {!Element} iframe Iframe to render.  Should be fully configured
   * (all attributes set), but not yet attached to DOM.
   * @return {!Promise} awaiting load event for ad frame
   * @private
   */
  iframeRenderHelper_(iframe) {
    // TODO(keithwrightbos): noContentCallback?
    this.xOriginIframeHandler_ = new AMP.AmpAdXOriginIframeHandler(this);
    this.rendered_ = true;
    return this.xOriginIframeHandler_.init(iframe, /* opt_isA4A */ true);
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
   * @param {string} adUrl  Ad request URL, as sent to #sendXhrRequest_ (i.e.,
   *    before any modifications that XHR module does to it.)
   * @return {!Promise} awaiting load event for ad frame
   * @private
   */
  renderViaCachedContentIframe_(adUrl) {
    this.emitLifecycleEvent('renderCrossDomainStart');
    /** @const {!Element} */
    const iframe = createElementWithAttributes(
        /** @type {!Document} */(this.element.ownerDocument),
        'iframe', Object.assign({
          'height': this.element.getAttribute('height'),
          'width': this.element.getAttribute('width'),
          // XHR request modifies URL by adding origin as parameter.  Need to
          // append ad URL, otherwise cache will miss.
          // TODO: remove call to getCorsUrl and instead have fetch API return
          // modified url.
          'src': xhrFor(this.win).getCorsUrl(this.win, adUrl),
        }, SHARED_IFRAME_PROPERTIES));
    return this.iframeRenderHelper_(iframe);
  }

  /**
   * Render creative via SafeFrame.
   * @param {!ArrayBuffer} creativeBody  The creative, as raw bytes.
   * @return {!Promise} awaiting load event for ad frame
   * @private
   */
  renderViaSafeFrame_(creativeBody) {
    this.emitLifecycleEvent('renderSafeFrameStart');
    return utf8Decode(creativeBody).then(creative => {
      /** @const {!Element} */
      const iframe = createElementWithAttributes(
          /** @type {!Document} */(this.element.ownerDocument),
          'iframe', Object.assign({
            'height': this.element.getAttribute('height'),
            'width': this.element.getAttribute('width'),
            'src': SAFEFRAME_IMPL_PATH + '?n=0',
            'name': `${SAFEFRAME_VERSION};${creative.length};${creative}`,
          }, SHARED_IFRAME_PROPERTIES));
      return this.iframeRenderHelper_(iframe);
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
    const metadataStart = creative.lastIndexOf(METADATA_STRING);
    if (metadataStart < 0) {
      // Couldn't find a metadata blob.
      dev().warn('A4A',
          'Could not locate start index for amp meta data in: %s', creative);
      return null;
    }
    const metadataEnd = creative.lastIndexOf('</script>');
    if (metadataEnd < 0) {
      // Couldn't find a metadata blob.
      dev().warn('A4A',
          'Could not locate closing script tag for amp meta data in: %s',
          creative);
      return null;
    }
    try {
      const metaDataObj = JSON.parse(
        creative.slice(metadataStart + METADATA_STRING.length, metadataEnd));
      const ampRuntimeUtf16CharOffsets =
        metaDataObj['ampRuntimeUtf16CharOffsets'];
      if (!isValidOffsetArray(ampRuntimeUtf16CharOffsets)) {
        throw new Error('Invalid runtime offsets');
      }
      const metaData = {};
      if (metaDataObj['customElementExtensions']) {
        metaData.customElementExtensions =
          metaDataObj['customElementExtensions'];
        if (!isArray(metaData.customElementExtensions)) {
          throw new Error('Invalid extensions');
        }
      }
      if (metaDataObj['customStylesheets']) {
        // Expect array of objects with at least one key being 'href' whose value
        // is URL.
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
      dev().warn('A4A', 'Invalid amp metadata: %s',
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
   * Registers a handler that performs URL replacement on the href
   * of an ad click.
   * @param {!Window} iframeWin
   */
  registerExpandUrlParams_(iframeWin) {
    iframeWin.document.documentElement.addEventListener('click',
        this.maybeExpandUrlParams_.bind(this), /* capture */ true);
  }

  /**
   * Handle click on links and replace variables in the click URL.
   * The function changes the actual href value and stores the
   * template in the ORIGINAL_HREF_ATTRIBUTE attribute
   * @param {!Event} e
   */
  maybeExpandUrlParams_(e) {
    const target = closestByTag(dev().assertElement(e.target), 'A');
    if (!target || !target.href) {
      // Not a click on a link.
      return;
    }
    const hrefToExpand =
    target.getAttribute(ORIGINAL_HREF_ATTRIBUTE) || target.getAttribute('href');
    if (!hrefToExpand) {
      return;
    }
    const vars = {
      'CLICK_X': () => {
        return e.pageX;
      },
      'CLICK_Y': () => {
        return e.pageY;
      },
    };
    const newHref = urlReplacementsForDoc(this.getAmpDoc()).expandSync(
        hrefToExpand, vars, undefined, /* opt_whitelist */ {
          // For now we only allow to replace the click location vars
          // and nothing else.
          // NOTE: Addition to this whitelist requires additional review.
          'CLICK_X': true,
          'CLICK_Y': true,
        });
    if (newHref != hrefToExpand) {
      // Store original value so that later clicks can be processed with
      // freshest values.
      if (!target.getAttribute(ORIGINAL_HREF_ATTRIBUTE)) {
        target.setAttribute(ORIGINAL_HREF_ATTRIBUTE, hrefToExpand);
      }
      target.setAttribute('href', newHref);
    }
  }

  /**
   * To be overriden by network specific implementation.
   * This function will be called for each lifecycle event as specified in the
   * LIFECYCLE_STAGES enum declaration. For certain events, an optional
   * associated piece of data will be passed.
   *
   * @param {string} eventName
   * @param {!Object=} opt_associatedEventData
   */
  emitLifecycleEvent(eventName, opt_associatedEventData) {}
}
