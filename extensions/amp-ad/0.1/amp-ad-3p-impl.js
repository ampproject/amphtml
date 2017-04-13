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

import {AmpAdXOriginIframeHandler} from './amp-ad-xorigin-iframe-handler';
import {
  is3pThrottled,
  getAmpAdRenderOutsideViewport,
  incrementLoadingAds,
} from './concurrent-load';
import {LayoutDelayMeter} from './layout-delay-meter';
import {getAdCid} from '../../../src/ad-cid';
import {preloadBootstrap} from '../../../src/3p-frame';
import {isLayoutSizeDefined} from '../../../src/layout';
import {isAdPositionAllowed, getAdContainer,}
    from '../../../src/ad-helper';
import {adConfig} from '../../../ads/_config';
import {
  googleLifecycleReporterFactory,
  ReporterNamespace,
} from '../../../ads/google/a4a/google-data-reporter';
import {isInExperiment} from '../../../ads/google/a4a/traffic-experiments';
import {
  buildAmpAnalyticsConfig,
  getCorrelator,
} from '../../../ads/google/a4a/utils';
import {user, dev} from '../../../src/log';
import {getIframe} from '../../../src/3p-frame';
import {setupA2AListener} from './a2a-listener';
import {moveLayoutRect} from '../../../src/layout-rect';
import {AdDisplayState, AmpAdUIHandler} from './amp-ad-ui';
import {insertAnalyticsElement} from '../../../src/analytics';

/** @const {!string} Tag name for 3P AD implementation. */
export const TAG_3P_IMPL = 'amp-ad-3p-impl';

export class AmpAd3PImpl extends AMP.BaseElement {

  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** {?Object} */
    this.config = null;

    /** {?AmpAdUIHandler} */
    this.uiHandler = null;

    /** @private {?AmpAdXOriginIframeHandler} */
    this.xOriginIframeHandler_ = null;

    /** @private {?Element} */
    this.placeholder_ = null;

    /** @private {?Element} */
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
     */
    this.unlistenViewportChanges_ = null;

    /** @private {IntersectionObserver} */
    this.intersectionObserver_ = null;

    /** @private {?string|undefined} */
    this.container_ = undefined;

    /** @private {?Promise} */
    this.layoutPromise_ = null;

    /** @type {!../../../ads/google/a4a/performance.BaseLifecycleReporter} */
    this.lifecycleReporter = googleLifecycleReporterFactory(
        this, ReporterNamespace.AMP);

    /** @private {!./layout-delay-meter.LayoutDelayMeter} */
    this.layoutDelayMeter_ = new LayoutDelayMeter(this.win);

    /** @type {?string} */
    this.adType = null;
  }

  /** @override */
  getPriority() {
    // Loads ads after other content.
    return 2;
  }

  renderOutsideViewport() {
    if (is3pThrottled(this.win)) {
      return false;
    }
    // Otherwise the ad is good to go.
    const elementCheck = getAmpAdRenderOutsideViewport(this.element);
    return elementCheck !== null ?
      elementCheck : super.renderOutsideViewport();
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.placeholder_ = this.getPlaceholder();
    this.fallback_ = this.getFallback();

    this.adType = this.element.getAttribute('type');
    this.config = adConfig[this.adType];
    user().assert(this.config,
                  `Type "${this.adType}" is not supported in amp-ad`);

    this.uiHandler = new AmpAdUIHandler(this);
    this.uiHandler.init();

    setupA2AListener(this.win);
  }

  /**
   * Prefetches and preconnects URLs related to the ad.
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    // We always need the bootstrap.
    preloadBootstrap(this.win, this.preconnect);
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
        dev().assert(this.iframeLayoutBox_));
    return moveLayoutRect(iframe, box.left, box.top);
  }

  /** @override */
  layoutCallback() {
    this.layoutDelayMeter_.startLayout();

    if (this.layoutPromise_) {
      return this.layoutPromise_;
    }
    this.emitLifecycleEvent('preAdThrottle');
    user().assert(!this.isInFixedContainer_,
        '<amp-ad> is not allowed to be placed in elements with ' +
        'position:fixed: %s', this.element);
    incrementLoadingAds(this.win);
    return this.layoutPromise_ = getAdCid(this).then(cid => {
      this.uiHandler.setDisplayState(AdDisplayState.LOADING);
      const opt_context = {
        clientId: cid || null,
        container: this.container_,
      };

      // In this path, the request and render start events are entangled,
      // because both happen inside a cross-domain iframe.  Separating them
      // here, though, allows us to measure the impact of ad throttling via
      // incrementLoadingAds().
      this.emitLifecycleEvent('adRequestStart');
      const iframe = getIframe(this.element.ownerDocument.defaultView,
          this.element, undefined, opt_context);
      this.xOriginIframeHandler_ = new AmpAdXOriginIframeHandler(
          this);
      const frameLoadPromise = this.xOriginIframeHandler_.init(iframe);

      if ((this.adType == 'adsense' ||
          this.adType == 'doubleclick') &&
          (isInExperiment(this.element,  /** Dblclk a4acontrol */'117152660')
          || isInExperiment(
              this.element,  /** Adsense a4a control */ '117152650'))
         ) {
        const correlator = getCorrelator(this.win);
        const slotId = this.element.getAttribute('data-amp-slot-index');
        const urls = [
          'https://csi.gstatic.com/csi?fromAnalytics=1' +
              `&c=${correlator}&slotId=${slotId}&a4a=1`,
        ];
        insertAnalyticsElement(
            this.element,
            buildAmpAnalyticsConfig(this.win, this.element, urls, false),
            /** Load amp-analytics extension */ true);
      }
      return frameLoadPromise;
    });
  }

  /** @override  */
  viewportCallback(inViewport) {
    if (this.xOriginIframeHandler_) {
      this.xOriginIframeHandler_.viewportCallback(inViewport);
    }
    if (inViewport) {
      this.layoutDelayMeter_.enterViewport();
    }
  }

  /** @override  */
  unlayoutCallback() {
    this.layoutPromise_ = null;
    this.uiHandler.setDisplayState(AdDisplayState.NOT_LAID_OUT);
    if (this.xOriginIframeHandler_) {
      this.xOriginIframeHandler_.freeXOriginIframe();
      this.xOriginIframeHandler_ = null;
    }
    this.emitLifecycleEvent('adSlotCleared');
    return true;
  }

  /** @override */
  createPlaceholderCallback() {
    return this.uiHandler.createPlaceholderCallback();
  }

  /**
   * Send a lifecycle event notification.  Currently, this is active only for
   * Google network ad tags (type=adsense or type=doubleclick) and pings are
   * done via direct image tags.  In the future, this will become an event
   * notification to amp-analytics, and providers will be able to configure
   * their own destinations and mechanisms for notifications.
   *
   * @param {string} eventName  Name of the event to send.
   * @param {!Object<string, string|number>=} opt_extraVariables  Additional
   *   variables to make available for substitution on the event notification.
   */
  emitLifecycleEvent(eventName, opt_extraVariables) {
    if (opt_extraVariables) {
      this.lifecycleReporter.setPingParameters(opt_extraVariables);
    }
    this.lifecycleReporter.sendPing(eventName);
  }
}
