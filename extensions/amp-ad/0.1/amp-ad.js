/* Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {IntersectionObserver} from '../../../src/intersection-observer';
import {getAdCid} from '../../../src/ad-cid';
import {getIframe, prefetchBootstrap} from '../../../src/3p-frame';
import {isLayoutSizeDefined} from '../../../src/layout';
import {listenFor, listenForOnce,
    postMessage} from '../../../src/iframe-helper';
import {loadPromise} from '../../../src/event-helper';
import {parseUrl} from '../../../src/url';
import {adPrefetch, adPreconnect} from '../../../ads/_config';
import {timer} from '../../../src/timer';
import {user} from '../../../src/log';
import {viewerFor} from '../../../src/viewer';
import {removeElement} from '../../../src/dom';


/** @const These tags are allowed to have fixed positioning */
const POSITION_FIXED_TAG_WHITELIST = {
  'AMP-FX-FLYING-CARPET': true,
  'AMP-LIGHTBOX': true,
  'AMP-STICKY-AD': true,
};

/**
 * Heuristic number as for counting whether another ad is currently loading.
 * @type {number}
 */
let loadingAdsCount = 0;

/**
 * For testing purpose only.
 * Record the id for timer delay in order to remove them after each test.
 */
let delayIdForTesting = null;

/**
 * For testing purpose only.
 * Set the loadingAdsCount to 0. And stop test from decreasing loadingAdsCount
 * after each run.
 * @visibleForTesting
 */
export function resetAdCountForTesting() {
  loadingAdsCount = 0;
  timer.cancel(delayIdForTesting);
}

class AmpAd extends AMP.BaseElement {

  /** @override */
  getPriority() {
    // Loads ads after other content.
    return 2;
  }

  renderOutsideViewport() {
    // If another ad is currently loading we only load ads that are currently
    // in viewport.
    if (loadingAdsCount > 0) {
      return false;
    }

    // Ad opts into lazier loading strategy where we only load ads that are
    // at closer than 1.25 viewports away.
    if (this.element.getAttribute('data-loading-strategy') ==
        'prefer-viewability-over-views') {
      return 1.25;
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

    /**
     * @private @const
     */
    this.viewer_ = viewerFor(this.getWin());
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
      this.preconnect.prefetch(prefetch, 'script');
    } else if (prefetch) {
      prefetch.forEach(p => {
        this.preconnect.prefetch(p, 'script');
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
    // When the framework has the need to remeasure us, our position might
    // have changed. Send an intersection record if needed. This does nothing
    // if we aren't currently in view.
    if (this.intersectionObserver_) {
      this.intersectionObserver_.fire();
    }
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

  /**
   * @return {boolean} whether this element or its ancestors have position
   * fixed (unless they are POSITION_FIXED_TAG_WHITELIST).
   * This should only be called when a layout on the page was just forced
   * anyway.
   */
  isPositionFixed() {
    const win = this.getWin();
    // TODO(@cramforce): Figure out why test comes here with the window
    // removed. This is somehow related to the resource framework running
    // on a timer that is not bound to the lifetime of the iframe.
    // See https://github.com/ampproject/amphtml/issues/3709
    if (!win) {
      return false;
    }
    let el = this.element;
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
    } while (el.tagName != 'BODY');
    return hasFixedAncestor;
  }

  /** @override */
  layoutCallback() {
    if (!this.iframe_) {
      user.assert(!this.isInFixedContainer_,
          '<amp-ad> is not allowed to be placed in elements with ' +
          'position:fixed: %s', this.element);
      loadingAdsCount++;
      delayIdForTesting = timer.delay(() => {
        // Unfortunately we don't really have a good way to measure how long it
        // takes to load an ad, so we'll just pretend it takes 1 second for
        // now.
        loadingAdsCount--;
      }, 1000);
      return getAdCid(this).then(cid => {
        if (cid) {
          this.element.setAttribute('ampcid', cid);
        }
        this.iframe_ = getIframe(this.element.ownerDocument.defaultView,
            this.element);
        this.iframe_.setAttribute('scrolling', 'no');
        this.applyFillContent(this.iframe_);
        this.intersectionObserver_ =
            new IntersectionObserver(this, this.iframe_, /* opt_is3P */true);
        // Triggered by context.noContentAvailable() inside the ad iframe.
        listenForOnce(this.iframe_, 'no-content', () => {
          this.noContentHandler_();
        }, /* opt_is3P */ true);
        // Triggered by context.reportRenderedEntityIdentifier(…) inside the ad
        // iframe.
        listenForOnce(this.iframe_, 'entity-id', info => {
          this.element.creativeId = info.id;
        }, /* opt_is3P */ true);
        listenFor(this.iframe_, 'embed-size', data => {
          let newHeight, newWidth;
          if (data.width !== undefined) {
            newWidth = Math.max(this.element./*OK*/offsetWidth +
                data.width - this.iframe_./*OK*/offsetWidth, data.width);
            this.iframe_.width = data.width;
            this.element.setAttribute('width', newWidth);
          }
          if (data.height !== undefined) {
            newHeight = Math.max(this.element./*OK*/offsetHeight +
                data.height - this.iframe_./*OK*/offsetHeight, data.height);
            this.iframe_.height = data.height;
            this.element.setAttribute('height', newHeight);
          }
          if (newHeight !== undefined || newWidth !== undefined) {
            this.updateSize_(newHeight, newWidth);
          }
        }, /* opt_is3P */ true);
        this.iframe_.style.visibility = 'hidden';
        listenForOnce(this.iframe_, 'render-start', () => {
          if (!this.iframe_) {
            return;
          }
          this.iframe_.style.visibility = '';
          this.sendEmbedInfo_(this.isInViewport());
        }, /* opt_is3P */ true);
        this.viewer_.onVisibilityChanged(() => {
          this.sendEmbedInfo_(this.isInViewport());
        });
        this.element.appendChild(this.iframe_);
        return loadPromise(this.iframe_);
      });
    }
    return loadPromise(this.iframe_);
  }

  /** @override  */
  unlayoutCallback() {
    if (!this.iframe_) {
      return true;
    }

    removeElement(this.iframe_);
    if (this.placeholder_) {
      this.togglePlaceholder(true);
    }
    if (this.fallback_) {
      this.toggleFallback(false);
    }

    this.iframe_ = null;
    // IntersectionObserver's listeners were cleaned up by
    // setInViewport(false) before #unlayoutCallback
    this.intersectionObserver_ = null;
    return true;
  }

  /** @override  */
  viewportCallback(inViewport) {
    if (this.intersectionObserver_) {
      this.intersectionObserver_.onViewportCallback(inViewport);
    }
    this.sendEmbedInfo_(inViewport);
  }

  /**
   * @param {boolean} inViewport
   * @private
   */
  sendEmbedInfo_(inViewport) {
    if (this.iframe_) {
      const targetOrigin =
          this.iframe_.src ? parseUrl(this.iframe_.src).origin : '*';
      postMessage(this.iframe_, 'embed-state', {
        inViewport,
        pageHidden: !this.viewer_.isVisible(),
      }, targetOrigin, /* opt_is3P */ true);
    }
  }

  /** @override  */
  overflowCallback(overflown, requestedHeight, requestedWidth) {
    if (overflown) {
      const targetOrigin =
          this.iframe_.src ? parseUrl(this.iframe_.src).origin : '*';
      postMessage(
          this.iframe_,
          'embed-size-denied',
          {requestedHeight, requestedWidth},
          targetOrigin,
          /* opt_is3P */ true);
    }
  }

  /**
   * Updates the element's dimensions to accommodate the iframe's
   *    requested dimensions.
   * @param {number|undefined} newWidth
   * @param {number|undefined} newHeight
   * @private
   */
  updateSize_(newHeight, newWidth) {
    this.attemptChangeSize(newHeight, newWidth, () => {
      const targetOrigin =
          this.iframe_.src ? parseUrl(this.iframe_.src).origin : '*';
      postMessage(
          this.iframe_,
          'embed-size-changed',
          {requestedHeight: newHeight, requestedWidth: newWidth},
          targetOrigin,
          /* opt_is3P */ true);
    });
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
      this.attemptChangeHeight(0, () => {
        this.element.style.display = 'none';
      });
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
}

AMP.registerElement('amp-ad', AmpAd);
AMP.registerElement('amp-embed', AmpAd);
