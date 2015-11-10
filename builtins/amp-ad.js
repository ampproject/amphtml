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
import {setStyles} from '../src/style';
import {loadPromise} from '../src/event-helper';
import {registerElement} from '../src/custom-element';
import {getIframe, listenOnce, postMessage, prefetchBootstrap} from
    '../src/3p-frame';
import {adPrefetch, adPreconnect} from '../ads/_prefetch';
import {timer} from '../src/timer';
import {vsyncFor} from '../src/vsync';


/**
 * Preview phase only default backfill for ads. If the ad
 * cannot fill the slot one of these will be displayed instead.
 * @private @const
 */
const BACKFILL_IMGS_ = {
  '300x200': [
    'backfill-1@1x.png',
    'backfill-2@1x.png',
    'backfill-3@1x.png',
    'backfill-4@1x.png',
    'backfill-5@1x.png',
  ],
  '320x50': [
    'backfill-6@1x.png',
    'backfill-7@1x.png',
  ],
};

/** @private @const */
const BACKFILL_DIMENSIONS_ = [
  [300, 200],
  [320, 50],
];

/** @private @const These tags are allowed to have fixed positioning */
const POSITION_FIXED_TAG_WHITELIST = {
  'AMP-LIGHTBOX': true
};

/**
 * Preview phase helper to score images through their dimensions.
 * @param {!Array<!Array<number>>} dims
 * @param {number} maxWidth
 * @param {number} maxHeight
 * visibleForTesting
 */
export function scoreDimensions_(dims, maxWidth, maxHeight) {
  return dims.map(function(dim) {
    const width = dim[0];
    const height = dim[1];
    const widthScore = Math.abs(width - maxWidth);
    // if the width is over the max then we need to penalize it
    const widthPenalty = Math.abs((maxWidth - width) * 3);
    // we add a multiplier to height as we prioritize it more than width
    const heightScore = Math.abs(height - maxHeight) * 2;
    // if the height is over the max then we need to penalize it
    const heightPenalty = Math.abs((maxHeight - height) * 2.5);

    return (widthScore - widthPenalty) + (heightScore - heightPenalty);
  });
}

/**
 * Preview phase helper to update a @1x.png string to @2x.png.
 * @param {!Object<string, !Array<string>>} images
 * visibleForTesting
 */
export function upgradeImages_(images) {
  Object.keys(images).forEach(key => {
    const curDimImgs = images[key];
    curDimImgs.forEach((item, index) => {
      curDimImgs[index] = item.replace(/@1x\.png$/, '@2x.png');
    });
  });
}


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
      return this.element.firstChild != null;
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
      this.isDefaultFallback_ = false;

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

      this.prefetchAd_();

      if (!this.fallback_) {
        this.isDefaultFallback_ = true;

        if (this.getDpr() >= 0.5) {
          upgradeImages_(BACKFILL_IMGS_);
        }
      }
    }

    /**
     * Prefetches and preconnects URLs related to the ad.
     * @private
     */
    prefetchAd_() {
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
        this.preconnect.url(preconnect);
      } else if (preconnect) {
        preconnect.forEach(p => {
          this.preconnect.url(p);
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
      if (this.isDefaultFallback_) {
        this.setDefaultFallback_();
        this.element.appendChild(this.fallback_);
      }
      this.element.removeChild(this.iframe_);
      this.toggleFallback(true);
    }

    /**
     * This is a preview-phase only thing where if the ad says that it
     * cannot fill the slot we select from a small set of default
     * banners.
     * @private
     * visibleForTesting
     */
    setDefaultFallback_() {
      const a = document.createElement('a');
      a.href = 'https://www.ampproject.org';
      a.target = '_blank';
      a.setAttribute('fallback', '');
      const img = new Image();
      setStyles(img, {
        width: 'auto',
        height: '100%',
        margin: 'auto',
      });

      const winner = this.getFallbackImage_();
      img.src = `https://ampproject.org/backfill/${winner}`;
      this.fallback_ = a;
      a.appendChild(img);
    }

    /**
     * Picks a random backfill image for the case that no real ad can be
     * shown.
     * @private
     * @return {string} The image URL.
     */
    getFallbackImage_() {
      const scores = scoreDimensions_(BACKFILL_DIMENSIONS_,
          this.element./*REVIEW*/clientWidth,
          this.element./*REVIEW*/clientHeight);
      const dims = BACKFILL_DIMENSIONS_[
          scores.indexOf(Math.max.apply(Math, scores))];
      const images = BACKFILL_IMGS_[dims.join('x')];
      // do we need a more sophisticated randomizer?
      return images[Math.floor(Math.random() * images.length)];
    }
  };

  registerElement(win, 'amp-ad', AmpAd);
}
