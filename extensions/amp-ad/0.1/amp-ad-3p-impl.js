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

import {removeElement} from '../../../src/dom';
import {getAdCid} from '../../../src/ad-cid';
import {preloadBootstrap} from '../../../src/3p-frame';
import {isLayoutSizeDefined} from '../../../src/layout';
import {loadPromise} from '../../../src/event-helper';
import {adPrefetch, adPreconnect} from '../../../ads/_config';
import {timer} from '../../../src/timer';
import {user} from '../../../src/log';
import {getIframe} from '../../../src/3p-frame';
import {setupA2AListener} from './a2a-listener';
import {AmpAdApiHandler} from './amp-ad-api-handler';

/** @const These tags are allowed to have fixed positioning */
const POSITION_FIXED_TAG_WHITELIST = {
  'AMP-FX-FLYING-CARPET': true,
  'AMP-LIGHTBOX': true,
  'AMP-STICKY-AD': true,
};

/**
 * Store loading ads info within window to ensure it can be properly stored
 * across separately compiled binaries that share load throttling.
 * @const ID of window variable used to track 3p ads waiting to load.
 */
const LOADING_ADS_WIN_ID_ = '3pla';

/**
 * @param {!Element} element
 * @param {!Window} win
 * @return {number|boolean}
 */
export function allowRenderOutsideViewport(element, win) {
  // Store in window Object that serves as a set of timers associated with
  // waiting elements.
  const loadingAds = win[LOADING_ADS_WIN_ID_] || {};
  // If another ad is currently loading we only load ads that are currently
  // in viewport.
  for (const key in loadingAds) {
    if (Object.prototype.hasOwnProperty.call(loadingAds, key)) {
      return false;
    }
  }

  // Ad opts into lazier loading strategy where we only load ads that are
  // at closer than 1.25 viewports away.
  if (element.getAttribute('data-loading-strategy') ==
      'prefer-viewability-over-views') {
    return 1.25;
  }
  return true;
}

/**
 * Decrements loading ads count used for throttling.
 * @param {number} timerId of timer returned from incrementLoadingAds
 * @param {!Window} win
 */
export function decrementLoadingAds(timerId, win) {
  timer.cancel(timerId);
  const loadingAds = win[LOADING_ADS_WIN_ID_];
  if (loadingAds) {
    delete loadingAds[timerId];
  }
}

/**
 * Increments loading ads count for throttling.
 * @param {!Window} win
 * @return {number} timer ID for testing
 */
export function incrementLoadingAds(win) {
  let loadingAds = win[LOADING_ADS_WIN_ID_];
  if (!loadingAds) {
    loadingAds = {};
    win[LOADING_ADS_WIN_ID_] = loadingAds;
  }

  const timerId = timer.delay(() => {
    // Unfortunately we don't really have a good way to measure how long it
    // takes to load an ad, so we'll just pretend it takes 1 second for
    // now.
    decrementLoadingAds(timerId, win);
  }, 1000);
  loadingAds[timerId] = 1;
  return timerId;
}

/**
 * @param {!Element} el
 * @param {!Window} win
 * @return {boolean} whether element or its ancestors have position
 * fixed (unless they are POSITION_FIXED_TAG_WHITELIST).
 * This should only be called when a layout on the page was just forced
 * anyway.
 */
export function isPositionFixed(el, win) {
  let hasFixedAncestor = false;
  do {
    if (POSITION_FIXED_TAG_WHITELIST[el.tagName]) {
      return false;
    }
    if (win/*because only called from onLayoutMeasure */
            ./*OK*/getComputedStyle(el).position == 'fixed') {
      // Because certain blessed elements may contain a position fixed
      // container (which contain an ad), we continue to search the
      // ancestry tree.
      hasFixedAncestor = true;
    }
    el = el.parentNode;
  } while (el && el.tagName != 'BODY');
  return hasFixedAncestor;
}

/** @const {!string} Tag name for 3P AD implementation. */
export const TAG_3P_IMPL = 'amp-ad-3p-impl';

export class AmpAd3PImpl extends AMP.BaseElement {

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
    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?AmpAdApiHandler} */
    this.apiHandler_ = null;

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

    /** @private {IntersectionObserver} */
    this.intersectionObserver_ = null;

    /** @private @const {function()} */
    this.boundNoContentHandler_ = () => this.noContentHandler_();

    setupA2AListener(this.win);

    /** @private @const {function()|null} */
    this.renderStartResolve_ = null;

    /** @private @const {!Promise} */
    this.renderStartPromise_ = new Promise(resolve => {
      this.renderStartResolve_ = resolve;
    });
  }

  /**
   * Prefetches and preconnects URLs related to the ad.
   * @override
   */
  preconnectCallback(onLayout) {
    // We always need the bootstrap.
    preloadBootstrap(this.win);
    const type = this.element.getAttribute('type');
    const prefetch = adPrefetch[type];
    const preconnect = adPreconnect[type];
    if (typeof prefetch == 'string') {
      this.preconnect.preload(prefetch, 'script');
    } else if (prefetch) {
      prefetch.forEach(p => {
        this.preconnect.preload(p, 'script');
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
    this.isInFixedContainer_ = isPositionFixed(this.element, this.win);
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
      this.iframeLayoutBox_ = this.getViewport().getLayoutRect(this.iframe_);
    }
  }

  /**
   * @override
   */
  getIntersectionElementLayoutBox() {
    if (!this.iframe_) {
      return super.getIntersectionElementLayoutBox();
    }
    if (!this.iframeLayoutBox_) {
      this.measureIframeLayoutBox_();
    }
    return this.iframeLayoutBox_;
  }

  /** @override */
  layoutCallback() {
    if (!this.iframe_) {
      user.assert(!this.isInFixedContainer_,
          '<amp-ad> is not allowed to be placed in elements with ' +
          'position:fixed: %s', this.element);
      incrementLoadingAds(this.win);
      return getAdCid(this).then(cid => {
        if (cid) {
          this.element.setAttribute('ampcid', cid);
        }
        this.iframe_ = getIframe(this.element.ownerDocument.defaultView,
            this.element);
        this.apiHandler_ = new AmpAdApiHandler(
          this, this.element, this.boundNoContentHandler_);
        return this.apiHandler_.startUp(this.iframe_, true);
      });
    }
    return loadPromise(this.iframe_);
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
    return true;
  }
}
