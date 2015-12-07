/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {BaseElement} from '../src/base-element';
import {assert} from '../src/asserts';
import {getIntersectionChangeEntry} from '../src/intersection-observer';
import {isLayoutSizeDefined} from '../src/layout';
import {loadPromise} from '../src/event-helper';
import {registerElement} from '../src/custom-element';
import {getIframe, listenOnce, postMessage, prefetchBootstrap} from
    '../src/3p-frame';
import {adPrefetch, adPreconnect} from '../ads/_prefetch';
import {timer} from '../src/timer';


/** @private @const These tags are allowed to have fixed positioning */
const POSITION_FIXED_TAG_WHITELIST = {
  'AMP-LIGHTBOX': true
};


/**
 * @param {!Window} win Destination window for the new element.
 * @this {undefined}  // Make linter happy
 * @return {undefined}
 */
export function installAd(win) {

  /**
   * @type {boolean} Heuristic boolean as for whether another ad is currently
   *     loading.
   */
  let loadingAdsCount = 0;

  class AmpAd extends BaseElement {

    /** @override  */
    renderOutsideViewport() {
      // Before the user has scrolled we only render ads in view. This prevents
      // excessive jank in situations like swiping through a lot of articles.
      if (!this.getViewport().hasScrolled()) {
        return false;
      };

      // If another ad is currently loading we only load ads that are currently
      // in viewport.
      if (loadingAdsCount > 0) {
        return false;
      }

      // Otherwise the ad is good to go.
      return true;
    }

    /** @override */
    isLayoutSupported(layout) {
      return isLayoutSizeDefined(layout);
    }

    /**
     * @return {boolean}
     * @override
     */
    isReadyToBuild() {
      // TODO(dvoytenko, #1014): Review and try a more immediate approach.
      // Wait until DOMReady.
      return false;
    }

    /** @override */
    buildCallback() {
      /** @private {?Element} */
      this.iframe_ = null;

      /** @private {?Element} */
      this.placeholder_ = this.getPlaceholder();

      /** @private {?Element} */
      this.fallback_ = this.getFallback();

      /** @private {boolean} */
      this.isInFixedContainer_ = false;

      /**
       * The layout box of the ad iframe (as opposed to the amp-ad tag).
       * In practice it often has padding to create a grey or similar box
       * around ads.
       * @private {!LayoutRect}
       */
      this.iframeLayoutBox_ = null;

      /**
       * Call to stop listening to viewport changes.
       * @private {?function()}
       */
      this.unlistenViewportChanges_ = null;

      /** @private {boolean} */
      this.shouldSendIntersectionChanges_ = false;
    }

    /**
     * Prefetches and preconnects URLs related to the ad.
     * @override
     */
    preconnectCallback(onLayout) {
      // We always need the bootstrap.
      prefetchBootstrap(this.getWin());
      const type = this.element.getAttribute('type');
      const prefetch = adPrefetch[type];
      const preconnect = adPreconnect[type];
      if (typeof prefetch == 'string') {
        this.preconnect.prefetch(prefetch);
      } else if (prefetch) {
        prefetch.forEach(p => {
          this.preconnect.prefetch(p);
        });
      }
      if (typeof preconnect == 'string') {
        this.preconnect.url(preconnect, onLayout);
      } else if (preconnect) {
        preconnect.forEach(p => {
          this.preconnect.url(p, onLayout);
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
      this.isInFixedContainer_ = this.isPositionFixed();
      // We remeasured this tag, lets also remeasure the iframe. Should be
      // free now and it might have changed.
      this.measureIframeLayoutBox_();
    }

    /**
     * Measure the layout box of the iframe if we rendered it already.
     * @private
     */
    measureIframeLayoutBox_() {
      if (this.iframe_) {
        this.iframeLayoutBox_ =
            this.getViewport().getLayoutRect(this.iframe_);
      }
    }

    /**
     * @return {boolean} whether this element or its ancestors have position
     * fixed (unless they are POSITION_FIXED_TAG_WHITELIST).
     * This should only be called when a layout on the page was just forced
     * anyway.
     */
    isPositionFixed() {
      let el = this.element;
      const body = el.ownerDocument.body;
      do {
        if (POSITION_FIXED_TAG_WHITELIST[el.tagName]) {
          return false;
        }
        if (this.getWin()/*because only called from onLayoutMeasure */
            ./*OK*/getComputedStyle(el).position == 'fixed') {
          return true;
        }
        el = el.parentNode;
      } while (el.getAttribute && el != body);
      return false;
    }


    /** @override */
    layoutCallback() {
      loadingAdsCount++;
      timer.delay(() => {
        // Unfortunately we don't really have a good way to measure how long it
        // takes to load an ad, so we'll just pretend it takes 1 second for
        // now.
        loadingAdsCount--;
      }, 1000);
      assert(!this.isInFixedContainer_,
          '<amp-ad> is not allowed to be placed in elements with ' +
          'position:fixed: %s', this.element);
      if (!this.iframe_) {
        this.iframe_ = getIframe(this.element.ownerDocument.defaultView,
            this.element);
        this.applyFillContent(this.iframe_);
        this.element.appendChild(this.iframe_);

        // Triggered by context.noContentAvailable() inside the ad iframe.
        listenOnce(this.iframe_, 'no-content', () => {
          this.deferMutate(this.noContentHandler_.bind(this));
        });
        // Triggered by context.observeIntersection(…) inside the ad iframe.
        listenOnce(this.iframe_, 'send-intersections', () => {
          this.startSendingIntersectionChanges_();
        });
      }
      return loadPromise(this.iframe_);
    }

    /** @override  */
    viewportCallback(inViewport) {
      // Lets the ad know that it became visible or no longer is.
      this.sendAdIntersection_();
      // And update the ad about its position in the viewport while
      // it is visible.
      if (inViewport) {
        this.unlistenViewportChanges_ =
            this.getViewport().onChanged(this.sendAdIntersection_.bind(this));
      } else if (this.unlistenViewportChanges_) {
        this.unlistenViewportChanges_();
        this.unlistenViewportChanges_ = null;
      }
    }

    /**
     * Called via postMessage from the child iframe when the ad starts
     * observing its position in the viewport.
     * Sets a flag, measures the iframe position if necessary and sends
     * one change record to the iframe.
     * @private
     */
    startSendingIntersectionChanges_() {
      this.shouldSendIntersectionChanges_ = true;
      this.getVsync().measure(() => {
        if (!this.iframeLayoutBox_) {
          this.measureIframeLayoutBox_();
        }
        this.sendAdIntersection_();
      });
    }

    /**
     * Sends 'intersection' message to ad with intersection change records
     * if this has been activated and we measured the layout box of the iframe
     * at least once.
     * @private
     */
    sendAdIntersection_() {
      if (!this.shouldSendIntersectionChanges_ ||
          !this.iframeLayoutBox_) {
        return;
      }
      const rootBounds = this.getViewport().getRect();
      const change = getIntersectionChangeEntry(
          timer.now(),
          rootBounds,
          this.iframeLayoutBox_);
      postMessage(this.iframe_, 'intersection', {changes: [change]});
    }

    /**
     * Activates the fallback if the ad reports that the ad slot cannot
     * be filled.
     * @private
     */
    noContentHandler_() {
      this.element.removeChild(this.iframe_);
      this.toggleFallback(true);
    }
  }

  registerElement(win, 'amp-ad', AmpAd);
}
