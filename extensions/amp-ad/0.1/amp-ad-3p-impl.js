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

import {AmpAdApiHandler} from './amp-ad-api-handler';
import {
  allowRenderOutsideViewport,
  incrementLoadingAds,
} from './concurrent-load';
import {removeElement} from '../../../src/dom';
import {getAdCid} from '../../../src/ad-cid';
import {preloadBootstrap} from '../../../src/3p-frame';
import {isLayoutSizeDefined} from '../../../src/layout';
import {isAdPositionAllowed, getAdContainer,}
    from '../../../src/ad-helper';
import {adConfig} from '../../../ads/_config';
import {getLifecycleReporter} from '../../../ads/google/a4a/performance';
import {user} from '../../../src/log';
import {getIframe} from '../../../src/3p-frame';
import {setupA2AListener} from './a2a-listener';
import {moveLayoutRect} from '../../../src/layout-rect';


/** @const {!string} Tag name for 3P AD implementation. */
export const TAG_3P_IMPL = 'amp-ad-3p-impl';

export class AmpAd3PImpl extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** {?Object} */
    this.config = null;

    /** @private {?AmpAdApiHandler} */
    this.apiHandler_ = null;

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

    /** @private @const {function()} */
    this.boundNoContentHandler_ = () => this.noContentHandler_();

    /** @private {?string|undefined} */
    this.container_ = undefined;

    /** @private {?Promise} */
    this.layoutPromise_ = null;

    this.lifecycleReporter_ = getLifecycleReporter(this, 'amp');
    this.lifecycleReporter_.sendPing('adSlotBuilt');
  }

  /** @override */
  getPriority() {
    // Loads ads after other content.
    return 2;
  }

  renderOutsideViewport() {
    const allowRender = allowRenderOutsideViewport(this.element, this.win);
    if (allowRender !== true) {
      return allowRender;
    }
    // Otherwise the ad is good to go.
    return super.renderOutsideViewport();
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.placeholder_ = this.getPlaceholder();
    this.fallback_ = this.getFallback();

    const adType = this.element.getAttribute('type');
    this.config = adConfig[adType];
    user().assert(this.config, `Type "${adType}" is not supported in amp-ad`);

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
    if (this.apiHandler_) {
      this.apiHandler_.onLayoutMeasure();
    }
  }

  /**
   * Measure the layout box of the iframe if we rendered it already.
   * @private
   */
  measureIframeLayoutBox_() {
    if (this.iframe_) {
      const iframeBox = this.getViewport().getLayoutRect(this.iframe_);
      const box = this.getLayoutBox();
      this.iframeLayoutBox_ = moveLayoutRect(iframeBox, -box.left, -box.top);
    }
  }

  /**
   * @override
   */
  getIntersectionElementLayoutBox() {
    if (!this.iframe_) {
      return super.getIntersectionElementLayoutBox();
    }
    const box = this.getLayoutBox();
    if (!this.iframeLayoutBox_) {
      this.measureIframeLayoutBox_();
    }
    // If the iframe is full size, we avoid an object allocation by moving box.
    return moveLayoutRect(box, this.iframeLayoutBox_.left,
        this.iframeLayoutBox_.top);
  }

  /** @override */
  layoutCallback() {
    if (this.layoutPromise_) {
      return this.layoutPromise_;
    }
    this.lifecycleReporter_.sendPing('preAdThrottle');
    user().assert(!this.isInFixedContainer_,
        '<amp-ad> is not allowed to be placed in elements with ' +
        'position:fixed: %s', this.element);
    incrementLoadingAds(this.win);
    return this.layoutPromise_ = getAdCid(this).then(cid => {
      const opt_context = {
        clientId: cid || null,
        container: this.container_,
      };
      // In this path, the request and render start events are entangled,
      // because both happen inside a cross-domain iframe.  Separating them
      // here, though, allows us to measure the impact of ad throttling via
      // incrementLoadingAds().
      this.lifecycleReporter_.sendPing('adRequestStart');
      this.iframe_ = getIframe(this.element.ownerDocument.defaultView,
          this.element, undefined, opt_context);
      this.apiHandler_ = new AmpAdApiHandler(
          this, this.element, this.boundNoContentHandler_);
      return this.apiHandler_.startUp(this.iframe_, true);
    });
  }

  /** @override  */
  viewportCallback(inViewport) {
    if (this.apiHandler_) {
      this.apiHandler_.viewportCallback(inViewport);
    }
  }

  /**
   * Activates the fallback if the ad reports that the ad slot cannot
   * be filled.
   * @private
   */
  noContentHandler_() {
    // If iframe is null nothing to do.
    if (!this.iframe_) {
      return;
    }
    // If a fallback does not exist attempt to collapse the ad.
    if (!this.fallback_) {
      this.attemptChangeHeight(0).then(() => {
        this./*OK*/collapse();
      }, () => {});
    }
    this.deferMutate(() => {
      if (!this.iframe_) {
        return;
      }
      if (this.fallback_) {
        // Hide placeholder when falling back.
        if (this.placeholder_) {
          this.togglePlaceholder(false);
        }
        this.toggleFallback(true);
      }
      // Remove the iframe only if it is not the master.
      if (this.iframe_.name.indexOf('_master') == -1) {
        removeElement(this.iframe_);
        this.iframe_ = null;
      }
    });
  }

  /** @override  */
  unlayoutCallback() {
    this.layoutPromise_ = null;
    if (!this.iframe_) {
      return true;
    }

    if (this.placeholder_) {
      this.togglePlaceholder(true);
    }
    if (this.fallback_) {
      this.toggleFallback(false);
    }

    this.iframe_ = null;
    if (this.apiHandler_) {
      this.apiHandler_.unlayoutCallback();
      this.apiHandler_ = null;
    }
    this.lifecycleReporter_.sendPing('adSlotCleared');
    return true;
  }
}
