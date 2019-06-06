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
  ADSENSE_MCRSPV_TAG,
  getMatchedContentResponsiveHeightAndUpdatePubParams,
} from '../../../ads/google/utils';
import {AmpAdUIHandler} from './amp-ad-ui';
import {AmpAdXOriginIframeHandler} from './amp-ad-xorigin-iframe-handler';
import {
  CONSENT_POLICY_STATE, // eslint-disable-line no-unused-vars
} from '../../../src/consent-state';
import {
  Layout, // eslint-disable-line no-unused-vars
  LayoutPriority,
  isLayoutSizeDefined,
} from '../../../src/layout';
import {adConfig} from '../../../ads/_config';
import {clamp} from '../../../src/utils/math';
import {
  computedStyle,
  setStyle,
} from '../../../src/style';
import {dev, devAssert, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getAdCid} from '../../../src/ad-cid';
import {getAdContainer, isAdPositionAllowed}
  from '../../../src/ad-helper';
import {
  getAmpAdRenderOutsideViewport,
  incrementLoadingAds,
  is3pThrottled,
} from './concurrent-load';
import {
  getConsentPolicyInfo,
  getConsentPolicySharedData,
  getConsentPolicyState,
} from '../../../src/consent';
import {getIframe, preloadBootstrap} from '../../../src/3p-frame';
import {isExperimentOn} from '../../../src/experiments';
import {moveLayoutRect} from '../../../src/layout-rect';
import {toWin} from '../../../src/types';

/** @const {string} Tag name for 3P AD implementation. */
export const TAG_3P_IMPL = 'amp-ad-3p-impl';

/** @const {number} */
const MIN_FULL_WIDTH_HEIGHT = 100;

/** @const {number} */
const MAX_FULL_WIDTH_HEIGHT = 500;

export class AmpAd3PImpl extends AMP.BaseElement {

  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element);

    /**
     * @private {?Element}
     * @visibleForTesting
     */
    this.iframe_ = null;

    /** @type {?Object} */
    this.config = null;

    /** @type {?AmpAdUIHandler} */
    this.uiHandler = null;

    /** @private {?AmpAdXOriginIframeHandler} */
    this.xOriginIframeHandler_ = null;

    /**
     * @private {?Element}
     * @visibleForTesting
     */
    this.placeholder_ = null;

    /**
     * @private {?Element}
     * @visibleForTesting
     */
    this.fallback_ = null;

    /** @private {boolean} */
    this.isInFixedContainer_ = false;

    /**
     * The (relative) layout box of the ad iframe to the amp-ad tag.
     * @private {?../../../src/layout-rect.LayoutRectDef}
     */
    this.iframeLayoutBox_ = null;

    /**
     * Call to stop listening to viewport changes.
     * @private {?function()}
     * @visibleForTesting
     */
    this.unlistenViewportChanges_ = null;

    /**
     * @private {IntersectionObserver}
     * @visibleForTesting
     */
    this.intersectionObserver_ = null;

    /** @private {?string|undefined} */
    this.container_ = undefined;

    /** @private {?Promise} */
    this.layoutPromise_ = null;

    /** @private {string|undefined} */
    this.type_ = undefined;

    /**
     * For full-width responsive ads: whether the element has already been
     * aligned to the edges of the viewport.
     * @private {boolean}
     */
    this.isFullWidthAligned_ = false;

    /**
     * Whether full-width responsive was requested for this ad.
     * @private {boolean}
     */
    this.isFullWidthRequested_ = false;
  }

  /** @override */
  getLayoutPriority() {
    // Loads ads after other content,
    const isPWA = !this.element.getAmpDoc().isSingleDoc();
    // give the ad higher priority if it is inside a PWA
    return isPWA ? LayoutPriority.METADATA : LayoutPriority.ADS;
  }

  /** @override */
  renderOutsideViewport() {
    if (is3pThrottled(this.win)) {
      return false;
    }
    // Otherwise the ad is good to go.
    const elementCheck = getAmpAdRenderOutsideViewport(this.element);
    return elementCheck !== null ?
      elementCheck : super.renderOutsideViewport();
  }

  /**
   * @param {!Layout} layout
   * @override
   */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /**
   * @return {!../../../src/service/resource.Resource}
   * @visibleForTesting
   */
  getResource() {
    return this.element.getResources().getResourceForElement(this.element);
  }

  /** @override */
  getConsentPolicy() {
    const type = this.element.getAttribute('type');
    const config = adConfig[type];
    if (config && config['consentHandlingOverride']) {
      return null;
    }
    return super.getConsentPolicy();
  }

  /** @override */
  buildCallback() {
    this.type_ = this.element.getAttribute('type');
    const upgradeDelayMs = Math.round(this.getResource().getUpgradeDelayMs());
    dev().info(TAG_3P_IMPL, `upgradeDelay ${this.type_}: ${upgradeDelayMs}`);

    this.placeholder_ = this.getPlaceholder();
    this.fallback_ = this.getFallback();

    this.config = adConfig[this.type_];
    userAssert(
        this.config, `Type "${this.type_}" is not supported in amp-ad`);

    this.uiHandler = new AmpAdUIHandler(this);

    this.isFullWidthRequested_ = this.shouldRequestFullWidth_();

    if (this.isFullWidthRequested_) {
      return this.attemptFullWidthSizeChange_();
    }
  }

  /**
   * @return {boolean}
   * @private
   */
  shouldRequestFullWidth_() {
    const hasFullWidth = this.element.hasAttribute('data-full-width');
    if (!hasFullWidth) {
      return false;
    }
    userAssert(this.element.getAttribute('width') == '100vw',
        'Ad units with data-full-width must have width="100vw".');
    userAssert(!!this.config.fullWidthHeightRatio,
        'Ad network does not support full width ads.');
    dev().info(TAG_3P_IMPL,
        '#${this.getResource().getId()} Full width requested');
    return true;
  }

  /**
   * Prefetches and preconnects URLs related to the ad.
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    // We always need the bootstrap.
    preloadBootstrap(
        this.win, this.preconnect, this.config.remoteHTMLDisabled);
    if (typeof this.config.prefetch == 'string') {
      this.preconnect.preload(this.config.prefetch, 'script');
    } else if (this.config.prefetch) {
      this.config.prefetch.forEach(p => {
        this.preconnect.preload(p, 'script');
      });
    }
    if (typeof this.config.preconnect == 'string') {
      this.preconnect.url(this.config.preconnect, opt_onLayout);
    } else if (this.config.preconnect) {
      this.config.preconnect.forEach(p => {
        this.preconnect.url(p, opt_onLayout);
      });
    }
    // If fully qualified src for ad script is specified we preconnect to it.
    const src = this.element.getAttribute('src');
    if (src) {
      // We only preconnect to the src because we cannot know whether the URL
      // will have caching headers set.
      this.preconnect.url(src);
    }
  }

  /**
   * @override
   */
  onLayoutMeasure() {
    this.isInFixedContainer_ = !isAdPositionAllowed(this.element, this.win);
    /** detect ad containers, add the list to element as a new attribute */
    if (this.container_ === undefined) {
      this.container_ = getAdContainer(this.element);
    }
    // We remeasured this tag, let's also remeasure the iframe. Should be
    // free now and it might have changed.
    this.measureIframeLayoutBox_();
    if (this.xOriginIframeHandler_) {
      this.xOriginIframeHandler_.onLayoutMeasure();
    }

    if (this.isFullWidthRequested_ && !this.isFullWidthAligned_) {
      this.isFullWidthAligned_ = true;
      const layoutBox = this.getLayoutBox();

      // Nudge into the correct horizontal position by changing side margin.
      this.getVsync().run({
        measure: state => {
          state.direction =
              computedStyle(this.win, this.element)['direction'];
        },
        mutate: state => {
          if (state.direction == 'rtl') {
            setStyle(this.element, 'marginRight', layoutBox.left, 'px');
          } else {
            setStyle(this.element, 'marginLeft', -layoutBox.left, 'px');
          }
        },
      }, {direction: ''});
    }
  }

  /**
   * Measure the layout box of the iframe if we rendered it already.
   * @private
   */
  measureIframeLayoutBox_() {
    if (this.xOriginIframeHandler_ && this.xOriginIframeHandler_.iframe) {
      const iframeBox =
          this.getViewport().getLayoutRect(this.xOriginIframeHandler_.iframe);
      const box = this.getLayoutBox();
      // Cache the iframe's relative position to the amp-ad. This is
      // necessary for fixed-position containers which "move" with the
      // viewport.
      this.iframeLayoutBox_ = moveLayoutRect(iframeBox, -box.left, -box.top);
    }
  }

  /**
   * @override
   */
  getIntersectionElementLayoutBox() {
    if (!this.xOriginIframeHandler_ || !this.xOriginIframeHandler_.iframe) {
      return super.getIntersectionElementLayoutBox();
    }
    const box = this.getLayoutBox();
    if (!this.iframeLayoutBox_) {
      this.measureIframeLayoutBox_();
    }

    const iframe = /** @type {!../../../src/layout-rect.LayoutRectDef} */(
      devAssert(this.iframeLayoutBox_));
    return moveLayoutRect(iframe, box.left, box.top);
  }

  /** @override */
  layoutCallback() {
    if (this.layoutPromise_) {
      return this.layoutPromise_;
    }
    userAssert(!this.isInFixedContainer_,
        '<amp-ad> is not allowed to be placed in elements with ' +
        'position:fixed: %s', this.element);

    const consentPromise = this.getConsentState();
    const consentPolicyId = super.getConsentPolicy();
    const isConsentV2Experiment = isExperimentOn(this.win, 'amp-consent-v2');
    const consentStringPromise = (consentPolicyId && isConsentV2Experiment)
      ? getConsentPolicyInfo(this.element, consentPolicyId)
      : Promise.resolve(null);
    const sharedDataPromise = consentPolicyId
      ? getConsentPolicySharedData(this.element, consentPolicyId)
      : Promise.resolve(null);

    this.layoutPromise_ = Promise.all([
      getAdCid(this),
      consentPromise,
      sharedDataPromise,
      consentStringPromise,
    ]).then(consents => {

      // Use JsonObject to preserve field names so that ampContext can access
      // values with name
      // ampcontext.js and this file are compiled in different compilation unit

      // Note: Field names can by perserved by using JsonObject, or by adding
      // perserved name to extern. We are doing both right now.
      // Please also add new introduced variable
      // name to the extern list.
      const opt_context = dict({
        'clientId': consents[0] || null,
        'container': this.container_,
        'initialConsentState': consents[1],
        'consentSharedData': consents[2],
      });
      if (isConsentV2Experiment) {
        opt_context['initialConsentValue'] = consents[3];
      }

      // In this path, the request and render start events are entangled,
      // because both happen inside a cross-domain iframe.  Separating them
      // here, though, allows us to measure the impact of ad throttling via
      // incrementLoadingAds().
      const iframe = getIframe(toWin(this.element.ownerDocument.defaultView),
          this.element, this.type_, opt_context,
          {disallowCustom: this.config.remoteHTMLDisabled});
      this.xOriginIframeHandler_ = new AmpAdXOriginIframeHandler(
          this);
      return this.xOriginIframeHandler_.init(iframe);
    });
    incrementLoadingAds(this.win, this.layoutPromise_);
    return this.layoutPromise_;
  }

  /**
   * @param {boolean} inViewport
   * @override
   */
  viewportCallback(inViewport) {
    if (this.xOriginIframeHandler_) {
      this.xOriginIframeHandler_.viewportCallback(inViewport);
    }
  }

  /** @override  */
  unlayoutCallback() {
    this.layoutPromise_ = null;
    this.uiHandler.applyUnlayoutUI();
    if (this.xOriginIframeHandler_) {
      this.xOriginIframeHandler_.freeXOriginIframe();
      this.xOriginIframeHandler_ = null;
    }
    return true;
  }

  /** @override */
  createPlaceholderCallback() {
    return this.uiHandler.createPlaceholder();
  }

  /**
   * @return {!Promise<?CONSENT_POLICY_STATE>}
   */
  getConsentState() {
    const consentPolicyId = super.getConsentPolicy();
    return consentPolicyId
      ? getConsentPolicyState(this.element, consentPolicyId)
      : Promise.resolve(null);
  }

  /**
  * Calculates and attempts to set the appropriate height & width for a
  * responsive full width ad unit.
  * @return {!Promise}
  * @private
  */
  attemptFullWidthSizeChange_() {
    const viewportSize = this.getViewport().getSize();
    const maxHeight = Math.min(MAX_FULL_WIDTH_HEIGHT, viewportSize.height);
    const {width} = viewportSize;
    const height = this.getFullWidthHeight_(width, maxHeight);
    // Attempt to resize to the correct height. The width should already be
    // 100vw, but is fixed here so that future resizes of the viewport don't
    // affect it.

    return this.attemptChangeSize(height, width).then(
        () => {
          dev().info(TAG_3P_IMPL, `Size change accepted: ${width}x${height}`);
        },
        () => {
          dev().info(TAG_3P_IMPL, `Size change rejected: ${width}x${height}`);
        }
    );
  }

  /**
   * Calculates the appropriate width for a responsive full width ad unit.
   * @param {number} width
   * @param {number} maxHeight
   * @return {number}
   * @private
   */
  getFullWidthHeight_(width, maxHeight) {
    // TODO(google a4a eng): remove this once adsense switches fully to
    // fast fetch.
    if (this.element.getAttribute('data-auto-format') === ADSENSE_MCRSPV_TAG) {
      return getMatchedContentResponsiveHeightAndUpdatePubParams(
          width, this.element);
    }
    return clamp(Math.round(width / this.config.fullWidthHeightRatio),
        MIN_FULL_WIDTH_HEIGHT, maxHeight);
  }
}
