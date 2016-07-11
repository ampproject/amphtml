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
  decrementLoadingAds,
  incrementLoadingAds,
  isPositionFixed} from '../../amp-ad/0.1/amp-ad-3p-impl';
import {AmpAdApiHandler} from '../../amp-ad/0.1/amp-ad-api-handler';
import {adPreconnect} from '../../../ads/_config';
import {removeElement, removeChildren} from '../../../src/dom';
import {cancellation} from '../../../src/error';
import {insertAmpExtensionScript} from '../../../src/insert-extension';
import {isLayoutSizeDefined} from '../../../src/layout';
import {dev, user} from '../../../src/log';
import {isArray, isObject} from '../../../src/types';
import {viewerFor} from '../../../src/viewer';
import {xhrFor} from '../../../src/xhr';
import {
  importPublicKey,
  verifySignature,
  verifySignatureIsAvailable,
} from './crypto-verifier';


// This is the public key currently used by our test signing server.
// It will be replaced with code which queries the server to get the
// current set of active keys. (See further comments below.)
const modulus =
      'z43rjaJ9PLk1FHMEL31_ILXGtUTN03rxJ9amD9y3BRDpbTA-GkUKiQM07xAd8OXP' +
      'UZRqcjvXQfc7b1RCEtwrcfx9oBRdF78QMA4tLLCqSHP0tSuqYF0fA7-GyTFWDcYz' +
      'ey90jRFNNWxjzKrvSazacE0TvJ8S_AVP4EV67VdbByCC1tpBzLhhy7RFHp2cXGTp' +
      'WYUqZUAVUdJoeBuCho_zQz2au7c6sDaLiF-uYL9Td9MrZ6tSLo3MeMIZia4WgWqj' +
      'TDICR0h-zlbHUd0K9CoXbGTt5nvkebXHmbKd99ma6zRYVlYNJTuSqsRCBNYtCTFV' +
      'HIZeBlkjHKsQ46HTZPexZw';

const pubExp = 'AQAB';

/**
 * The current set of public keys.
 *
 * @type {Array<!Promise<!PublicKeyInfoDef>>}
 */
// TODO(bobcassels): When the signing server is finished, get the public keys
// from there. For now, hard-wire the current signer public key.
let publicKeyInfos = [importPublicKey({
  kty: 'RSA',
  'n': modulus,
  'e': pubExp,
  alg: 'RS256',
  ext: true,
})];


/**
 * @param {!Object} publicKeys An array of parsed JSON web keys.
 */
export function setPublicKeys(publicKeys) {
  publicKeyInfos = publicKeys.map(importPublicKey);
}

/**
 * @param {!ArrayBuffer} bytes
 * @return {!Promise<string>}
 */
// TODO(taymonbeal): move this somewhere more sensible
export function utf8FromArrayBuffer(bytes) {
  if (window.TextDecoder) {
    return Promise.resolve(new TextDecoder('utf-8').decode(bytes));
  }
  return new Promise(function(resolve, unusedReject) {
    const reader = new FileReader();
    reader.onloadend = function(unusedEvent) {
      resolve(reader.result);
    };
    reader.readAsText(new Blob([bytes]));
  });
}

/**
 * @param {*} ary
 * @return {boolean} whether input is array of 2 numeric elements.
 * @private
 */
function isValidOffsetArray(ary) {
  return isArray(ary) && ary.length == 2 &&
      typeof ary[0] === 'number' &&
      typeof ary[1] === 'number';
};

const METADATA_STRING = '<script type="application/json" amp-ad-metadata>';
const AMP_BODY_STRING = 'amp-ad-body';

/** @typedef {{creative: ArrayBuffer, signature: ?ArrayBuffer}} */
let AdResponseDef;

/** @typedef {{cssUtf16CharOffsets: Array<number>,
               cssReplacementRanges: Array<number>,
               bodyUtf16CharOffsets: !Array<number>,
               bodyAttributes: ?string,
               customElementExtensions: Array<string>,
               customStylesheets: Array<string>}} */
let CreativeMetaDataDef;

export class AmpA4A extends AMP.BaseElement {
  // TODO: Add more error handling throughout code.
  // TODO: Handle creatives that do not fill.

  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);

    /** @private {?Promise<!boolean>} */
    this.adPromise_ = null;

    /**
     * @private {number} unique ID of the currently executing promise to allow
     *    for cancellation.
     */
    this.promiseId_ = 0;

    /** @private {?string} */
    this.adUrl_ = null;

    /** @private {?AmpAdApiHandler} */
    this.apiHandler_ = null;

    /** @private {boolean} */
    this.rendered_ = false;

    /** @private {number} ID of timer used as part of 3p throttling. */
    this.timerId_ = 0;

    /** @private {null|boolean} where layoutMeasure has been executed. */
    this.layoutMeasureExecuted_ = false;

    /**
     * @private {!Array<!Element>} stylesheets added as part of shadow DOM
     *    based creative injection.
     */
    this.stylesheets_ = [];

    /** @const @private {!Vsync} */
    this.vsync_ = this.getVsync();
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
  renderOutsideViewport() {
    // Only relevant if non-AMP as AMP creative will be injected within
    // buildCallback promise chain.
    // If another ad is currently loading we only load ads that are currently
    // in viewport.
    const allowRender = allowRenderOutsideViewport(this.element, this.getWin());
    if (allowRender !== true) {
      return allowRender;
    }
    // Otherwise the ad is good to go.
    return super.renderOutsideViewport();
  }

  /**
   * To be overridden by network specific implementation indicating if element
   * (and environment generally) are valid for sending XHR rqueries.
   * @return {boolean} where element is valid and ad request should be sent.  If
   *    false, no ad request is sent and slot will be collapsed if possible.
   */
  isValidElement() {
    return true;
  }

  /**
   * Returns true if this element is the child of an amp-ad element.  For use by
   * network-specific implementations that don't want to allow themselves to be
   * embedded directly into a page.
   * @return {boolean}
   */
  isInAmpAdTag() {
    return !!this.element.parentElement &&
        this.element.parentElement.tagName == 'AMP-AD';
  }

  /**
   * Prefetches and preconnects URLs related to the ad using adPreconnect
   * registration which assumes ad request domain used for 3p is applicable.
   * @override
   */
  preconnectCallback(unusedOnLayout) {
    const preconnect = adPreconnect[this.element.getAttribute('type')];
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
    if (this.apiHandler_) {
      this.apiHandler_.onLayoutMeasure();
    }
    if (this.layoutMeasureExecuted_ || !verifySignatureIsAvailable()) {
      // onLayoutMeasure gets called multiple times.
      return;
    }
    this.layoutMeasureExecuted_ = true;
    user.assert(!isPositionFixed(this.element, this.getWin()),
        '<%s> is not allowed to be placed in elements with ' +
        'position:fixed: %s', this.element.tagName, this.element);
    // OnLayoutMeasure can be called when page is in prerender so delay until
    // visible.  Assume that it is ok to call isValidElement as it should
    // only being looking at window, immutable properties (i.e. location) and
    // its element ancestry.
    if (!this.isValidElement()) {
      // TODO(kjwright): collapse?
      user.warn('Amp Ad', 'Amp ad element ignored as invalid', this.element);
      return;
    }

    // Increment unique promise ID so that if its value changes within the
    // promise chain due to cancel from unlayout, the promise will be rejected.
    this.promiseId_++;
    const promiseId = this.promiseId_;
    this.adPromise_ = viewerFor(this.getWin()).whenFirstVisible()
      .then(() => {
        if (promiseId != this.promiseId_) {
          return Promise.reject(cancellation());
        }
        return this.getAdUrl();
      })
      .then(adUrl => {
        if (promiseId != this.promiseId_) {
          return Promise.reject(cancellation());
        }
        this.adUrl_ = adUrl;
        return this.sendXhrRequest_(adUrl);
      })
      .then(fetchResponse => {
        if (promiseId != this.promiseId_) {
          return Promise.reject(cancellation());
        }
        if (fetchResponse && fetchResponse.arrayBuffer) {
          return fetchResponse.arrayBuffer().then(
            bytes => {
              if (promiseId != this.promiseId_) {
                return Promise.reject(cancellation());
              }
              return this.validateAdResponse_(fetchResponse, bytes)
                .then(valid => {
                  if (promiseId != this.promiseId_) {
                    return Promise.reject(cancellation());
                  }
                  return this.maybeRenderAmpAd_(valid, bytes);
                });
            });
        } else {
          return Promise.resolve(false);
        }
      })
      .catch(error => this.promiseErrorHandler_(error));
  }

  /**
   * Handles uncaught errors within promise flow.
   * @param {string|Error} error
   * @return {!Promise<string>}
   * @private
   */
  promiseErrorHandler_(error) {
    if (error && error.message && error.message.indexOf('amp-a4a: ') == 0) {
      // caught previous call to promiseErrorHandler?  Infinite loop?
      return Promise.reject(error);
    }
    if (error && error instanceof Error &&
        error.message == cancellation().message) {
      // Rethrow if cancellation
      throw error;
    }
    // Returning promise reject should trigger unhandledrejection which will
    // trigger reporting via src/error.js
    const adQueryIdx = this.adUrl_ ? this.adUrl_.indexOf('?') : -1;
    const state = {
      'm': error ? error.message : '',
      'tag': this.element.tagName,
      'type': this.element.getAttribute('type'),
      'au': adQueryIdx < 0 ? '' :
            this.adUrl_.substring(adQueryIdx + 1, adQueryIdx + 251),
    };
    return Promise.reject(new Error('amp-a4a: ' + JSON.stringify(state)));
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
    this.timerId_ = incrementLoadingAds(this.getWin());
    return this.adPromise_.then(rendered => {
      if (!rendered) {
        // Was not AMP creative so wrap in cross domain iframe.  layoutCallback
        // has already executed so can do so immediately.
        this.renderViaIframe_(true);
      }
      this.rendered_ = true;
    }).catch(error => this.promiseErrorHandler_(error));
  }

  /** @override  */
  unlayoutCallback() {
    // Remove creative and reset to allow for creation of new ad.
    if (!this.layoutMeasureExecuted_) {
      return true;
    }
    this.vsync_.mutate(() => {
      // Iframe or shadow root attached as children.  Cannot delete shadowRoot
      // but creating new one clears.
      if (this.element.shadowRoot) {
        this.element.shadowRoot./*OK*/innerHTML = '';
      } else {
        removeChildren(this.element);
      }

      this.stylesheets_.forEach(removeElement);
      this.stylesheets_ = [];
      this.adPromise_ = null;
      this.adUrl_ = null;
      this.rendered_ = false;
      this.timerId_ = 0;
      if (this.apiHandler_) {
        this.apiHandler_.unlayoutCallback();
        this.apiHandler_ = null;
      }
      this.layoutMeasureExecuted_ = false;
    });
    // Increment promiseId to cause any pending promise to cancel.
    this.promiseId_++;
    return true;
  }

  /** @override  */
  viewportCallback(inViewport) {
    if (this.apiHandler_) {
      this.apiHandler_.viewportCallback(inViewport);
    }
  }

  /** @override  */
  overflowCallback(overflown, requestedHeight, requestedWidth) {
    if (this.apiHandler_) {
      this.apiHandler_.overflowCallback(
        overflown, requestedHeight, requestedWidth);
    }
  }

  /**
   * Gets the Ad URL to send an XHR Request to.  To be implemented
   * by network.
   * @return {!Promise<string>}
   */
  getAdUrl() {
    throw new Error('getAdUrl not implemented!');
  }

  /**
   * Extracts creative and verification signature (if present) from
   * XHR response body and header.  To be implemented by network.
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
   * @return {boolean} whether environment supports rendering of AMP creatives
   *    within publisher page via shadow DOM (otherwise will be rendered within)
   *    cross domain iframe.  If valid AMP creative, will be rendered early.
   */
  supportsShadowDom() {
    return !!window.Element.prototype.createShadowRoot;
  }

  /**
   * Callback executed when AMP creative has successfully rendered within the
   * publisher page via shadow DOM.  To be overridden by network implementations
   * as needed.
   */
  onAmpCreativeShadowDomRender() {}

  /**
   * Send ad request, extract the creative and signature from the response.
   * @param {string} adUrl Request URL to send XHR to.
   * @return {!Promise<?FetchResponse>}
   * @private
   */
  sendXhrRequest_(adUrl) {
    const xhrInit = {
      mode: 'cors',
      method: 'GET',
      credentials: 'include',
      // TODO(kjwright):  Add requireAmpResponseSourceOrigin once supported
      // server-side
    };
    return xhrFor(this.getWin())
        .fetch(adUrl, xhrInit)
        .catch(unusedReason => {
          // Error so set rendered_ so iframe will not be written on
          // layoutCallback.
          // TODO: is this the appropriate action?  Perhaps we should just allow
          // the ad to be rendered via iframe.
          this.rendered_ = true;
          return null;
        });
  }

  /**
   * Try to validate creative is AMP through crypto signature.
   * @param {!FetchResponse} fetchResponse
   * @param {!ArrayBuffer} bytes
   * @return {!Promise<boolean>}
   * @private
   */
  validateAdResponse_(fetchResponse, bytes) {
    return this.extractCreativeAndSignature(bytes, fetchResponse.headers)
        .then(response => {
          // Validate when we have a signature and we have native crypto.
          if (response.signature && verifySignatureIsAvailable()) {
            try {
              // Among other things, the signature might not be proper base64.
              return verifySignature(
                  response.creative, response.signature, publicKeyInfos);
            } catch (e) {}
          }
          return false;
        });
  }

  /**
   * Render the validated AMP creative directly in the parent page.
   * @param {boolean} valid If the ad response signature was valid.
   * @param {!ArrayBuffer} The creative as raw bytes.
   * @return {Promise<boolean>} Whether the creative was successfully
   *     rendered.
   * @private
   */
  maybeRenderAmpAd_(valid, bytes) {
    if (!valid) {
      return Promise.resolve(false);
    }
    // Timer id will be set if we have entered layoutCallback at which point
    // 3p throttling count was incremented.  We want to "release" the throttle
    // immediately since we now know we are not a 3p ad.
    if (this.timerId_) {
      decrementLoadingAds(this.timerId_, this.getWin());
    }
    // AMP documents are required to be UTF-8
    return utf8FromArrayBuffer(bytes).then(creative => {
      // Find the json blob located at the end of the body and parse it.
      const creativeMetaData = this.getAmpAdMetadata_(creative);
      if (!creativeMetaData || !this.supportsShadowDom()) {
        // Shadow DOM is not supported or could not find appropriate markers
        // within the creative therefore load within cross domain iframe.
        // Iframe is created immediately (as opposed to waiting for
        // layoutCallback) as the the creative has been verified as AMP and
        // will run efficiently.
        this.renderViaIframe_();
        this.rendered_ = true;
        return Promise.resolve(true);
      } else {
        try {
          // Do extraction processing on CSS and body before creating the
          // shadow root so that if they error out, we don't actually edit
          // the doc.
          const cssBlock = this.formatCSSBlock_(creative, creativeMetaData);
          const bodyBlock = this.formatBody_(creative, creativeMetaData);
          // Note: We schedule DOM mutations via the Vsync handler system to
          // avoid user-visible rewrites.  However, that means that rendering
          // is being handled outside this promise chain.  There are two
          // consequences, both *probably* minor:
          // 1) If everything succeeds, the promise chain will resolve(true)
          //    before any content is actually rendered.  Thus, the enclosing
          //    layoutCallback will think that stuff is rendered before it
          //    actually is.  This shouldn't be a problem, though, because
          //    vsync will *eventually* get around to rendering it.
          // 2) If any of the calls in this block fails, they will do so outside
          //    the try/catch block, so we won't have any notification of
          //    failure.  As a result, the outside world will see
          //    Promise.resolve(true), even though things have failed.  That
          //    would cause render-in-iframe to be skipped, even though
          //    render-in-DOM failed, and no ad would be displayed.  However,
          //    all of the enclosed mutations are fairly simple and unlikely
          //    to fail.
          this.vsync_.mutate(() => {
            // Copy fonts to host document head.
            this.relocateFonts_(creativeMetaData);
            // Add extensions to head.
            this.addCreativeExtensions_(creativeMetaData);
            // Finally, add body and re-formatted CSS styling to the shadow root.
            const shadowRoot =
                this.element.shadowRoot || this.element.createShadowRoot();
            shadowRoot./*OK*/innerHTML += (cssBlock + bodyBlock);
            this.rendered_ = true;
            this.onAmpCreativeShadowDomRender();
          });
          return Promise.resolve(true);
        } catch (e) {
          // If we fail on any of the steps of Shadow DOM construction, just
          // render in iframe.
          // TODO: report!
          return Promise.resolve(false);
        }
      }
    });
  }

  /**
   * Creates iframe whose src matches that of the ad URL.  The response should
   * have been cached causing the browser to render without callout.  However,
   * it is possible for cache miss to occur which can be detected server-side
   * by missing ORIGIN header.
   * @param {boolean=} opt_isNonAmpCreative whether creative within iframe
   *    is AMP creative (if not, intersection observer allows sending info into
   *    nested frames).
   * @private
   */
  renderViaIframe_(opt_isNonAmpCreative) {
    user.assert(this.adUrl_, 'creative missing in renderViaIframe_?');
    const iframe = this.element.ownerDocument.createElement('iframe');
    iframe.setAttribute('height', this.element.getAttribute('height'));
    iframe.setAttribute('width', this.element.getAttribute('width'));
    // XHR request modifies URL by adding origin as parameter.  Need to append
    // ad URL otherwise cache will miss.
    // TODO: remove call to getCorsUrl and instead have fetch API return
    // modified url.
    iframe.setAttribute(
      'src', xhrFor(this.getWin()).getCorsUrl(this.getWin(), this.adUrl_));
    this.vsync_.mutate(() => {
      // TODO(keithwrightbos): noContentCallback?
      this.apiHandler_ = new AmpAdApiHandler(this, this.element);
      // TODO(keithwrightbos): startup returns load event, do we need to wait?
      this.apiHandler_.startUp(iframe, opt_isNonAmpCreative);
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
      dev.warn('A4A',
        'Could not locate start index for amp meta data in: %s', creative);
      return null;
    }
    const metadataEnd = creative.lastIndexOf('</script>');
    if (metadataEnd < 0) {
      // Couldn't find a metadata blob.
      dev.warn('A4A',
        'Could not locate closing script tag for amp meta data in: %s',
        creative);
      return null;
    }
    try {
      return this.buildCreativeMetaData_(JSON.parse(
        creative.slice(metadataStart + METADATA_STRING.length, metadataEnd)));
    } catch (err) {
      dev.warn('A4A', 'Invalid amp metadata: %s',
        creative.slice(metadataStart + METADATA_STRING.length, metadataEnd));
      return null;
    }
  }

  /**
   * @param {!Object} JSON extraced from creative
   * @return {!CreativeMetaDataDef} if valid, null otherwise
   * @private
   */
  buildCreativeMetaData_(metaDataObj) {
    const metaData = {};

    metaData.bodyUtf16CharOffsets = metaDataObj['bodyUtf16CharOffsets'];
    if (!isValidOffsetArray(metaData.bodyUtf16CharOffsets)) {
      // Invalid/Missing body offsets array.
      throw new Error('Invalid/missing body offsets');
    }
    if (metaDataObj['cssUtf16CharOffsets']) {
      metaData.cssUtf16CharOffsets = metaDataObj['cssUtf16CharOffsets'];
      if (!isValidOffsetArray(metaData.cssUtf16CharOffsets)) {
        throw new Error('Invalid CSS offsets');
      }
    }
    // Validate array of two member number arrays
    if (metaDataObj['cssReplacementRanges']) {
      metaData.cssReplacementRanges = metaDataObj['cssReplacementRanges'];
      if (!isArray(metaData.cssReplacementRanges)) {
        throw new Error('Invalid CSS replacement ranges');
      }
      for (let i = 0; i < metaData.cssReplacementRanges.length; i++) {
        if (!isValidOffsetArray(metaData.cssReplacementRanges[i])) {
          throw new Error('Invalid CSS replacement ranges');
        }
      }
    }
    if (metaDataObj['bodyAttributes']) {
      metaData.bodyAttributes = metaDataObj['bodyAttributes'];
      if (typeof metaData.bodyAttributes !== 'string') {
        throw new Error('Invalid body attributes');
      }
    }
    if (metaDataObj['customElementExtensions']) {
      metaData.customElementExtensions = metaDataObj['customElementExtensions'];
      if (!isArray(metaData.customElementExtensions)) {
        throw new Error('Invalid extensions');
      }
    }
    if (metaDataObj['customStylesheets']) {
      // Expect array of objects with at least one key being 'href' whose value
      // is URL.
      metaData.customStylesheets = metaDataObj['customStylesheets'];
      if (!isArray(metaData.customStylesheets)) {
        throw new Error('Invalid custom stylesheets');
      }
      for (let i = 0; i < metaData.customStylesheets.length; i++) {
        const stylesheet = metaData.customStylesheets[i];
        if (!isObject(stylesheet) || !stylesheet['href'] ||
            typeof stylesheet['href'] !== 'string' ||
            !/^https:\/\//i.test(stylesheet['href'])) {
          throw new Error('Invalid custom stylesheets');
        }
      }
    }
    return metaData;
  }

  /**
   * Extracts the body portion of the creative, according to directions in the
   * metaData, and formats it for insertion into Shadow DOM.
   * @param {string} creative from which CSS is extracted
   * @param {!CreativeMetaDataDef} metaData Metadata object extracted from the
   *    reserialized creative.
   * @returns {string}  Body of AMP creative, surrounded by {@code
   *     <amp-ad-body>} tags, and suitable for injection into Shadow DOM.
   * @private
   */
  formatBody_(creative, metaData) {
    const body = creative.substring(metaData.bodyUtf16CharOffsets[0],
        metaData.bodyUtf16CharOffsets[1]);
    const bodyAttrString = metaData.bodyAttributes ?
          ' ' + metaData.bodyAttributes : '';
    return `<${AMP_BODY_STRING}${bodyAttrString}>${body}</${AMP_BODY_STRING}>`;
  }

  /**
   * Note: destructively reverses the {@code offsets} list as a side effect.
   * @param {string} creative from which CSS is extracted
   * @param {!CreativeMetaDataDef} meta data from creative.
   * @returns {string} CSS to be added to page.
   */
  formatCSSBlock_(creative, metaData) {
    if (!metaData.cssUtf16CharOffsets) {
      return '';
    }
    let css = creative.substring(
        metaData.cssUtf16CharOffsets[0],
        metaData.cssUtf16CharOffsets[1]);
    if (metaData.cssReplacementRanges) {
      const rangesToKeep = [];
      let startIndex = 0;
      metaData.cssReplacementRanges.forEach(replRange => {
        rangesToKeep.push(css.substring(startIndex, replRange[0]));
        startIndex = replRange[1];
      });
      rangesToKeep.push(css.substring(startIndex, css.length));
      css = rangesToKeep.join(AMP_BODY_STRING);
    }
    return '<style amp-custom>' + css + '</style>';
  }

  /**
   * Add fonts from the ad metaData block to the host document head (if
   * they're not already present there).
   * @param {!CreativeMetaDataDef} metaData Reserialization metadata object.
   * @private
   */
  relocateFonts_(metaData) {
    if (!metaData.customStylesheets) {
      return;
    }
    metaData.customStylesheets.forEach(s => {
      // TODO(tdrl): How to test for existence already?
      const doc = this.element.ownerDocument;
      const linkElem = doc.createElement('link');
      for (const attr in s) {
        if (s.hasOwnProperty(attr)) {
          linkElem.setAttribute(attr, s[attr]);
        }
      }
      doc.head.appendChild(linkElem);
      this.stylesheets_.push(linkElem);
    });
  }

  /**
   * Add fonts from the ad metaData block to the host document head (if
   * they're not already present there).
   *
   * @param {!CreativeMetaDataDef} metaData Reserialization metadata object.
   * @private
   */
  addCreativeExtensions_(metaData) {
    if (!metaData.customElementExtensions) {
      return;
    }
    metaData.forEach(extension => {
      /*OK*/insertAmpExtensionScript(this.getWin(), extension, true);
    });
  }
}

AMP.registerElement('amp-a4a', AmpA4A);
