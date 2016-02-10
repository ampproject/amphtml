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
import {IntersectionObserver} from '../src/intersection-observer';
import {assert} from '../src/asserts';
import {cidForOrNull} from '../src/cid';
import {getIframe, prefetchBootstrap} from '../src/3p-frame';
import {isLayoutSizeDefined} from '../src/layout';
import {listen, listenOnce, postMessage} from '../src/iframe-helper';
import {loadPromise} from '../src/event-helper';
import {parseUrl} from '../src/url';
import {registerElement} from '../src/custom-element';
import {adPrefetch, adPreconnect, clientIdScope} from '../ads/_config';
import {toggle} from '../src/style';
import {timer} from '../src/timer';
import {userNotificationManagerFor} from '../src/user-notification';


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

    /** @override */
    isReadyToBuild() {
      // TODO(dvoytenko, #1014): Review and try a more immediate approach.
      // Wait until DOMReady.
      return false;
    }

    /** @override */
    isRelayoutNeeded() {
      return true;
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
       * In this state the iframe is set to display: none to reduce
       * CPU/GPU/Battery consumption by the ad.
       * @private {boolean}
       */
      this.paused_ = false;
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
    getInsersectionElementLayoutBox() {
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
      if (this.paused_) {
        this.paused_ = false;
        toggle(this.iframe_, true);
        return Promise.resolve(this.iframe_);
      }
      if (!this.iframe_) {
        loadingAdsCount++;
        assert(!this.isInFixedContainer_,
            '<amp-ad> is not allowed to be placed in elements with ' +
            'position:fixed: %s', this.element);
        timer.delay(() => {
          // Unfortunately we don't really have a good way to measure how long it
          // takes to load an ad, so we'll just pretend it takes 1 second for
          // now.
          loadingAdsCount--;
        }, 1000);
        return this.getAdCid_().then(cid => {
          if (cid) {
            this.element.setAttribute('ampcid', cid);
          }
          this.iframe_ = getIframe(this.element.ownerDocument.defaultView,
            this.element);
          this.iframe_.setAttribute('scrolling', 'no');
          this.applyFillContent(this.iframe_);
          this.element.appendChild(this.iframe_);
          this.intersectionObserver_ =
              new IntersectionObserver(this, this.iframe_, /* opt_is3P */true);
          // Triggered by context.noContentAvailable() inside the ad iframe.
          listenOnce(this.iframe_, 'no-content', () => {
            this.noContentHandler_();
          }, /* opt_is3P */ true);
          // Triggered by context.reportRenderedEntityIdentifier(…) inside the ad
          // iframe.
          listenOnce(this.iframe_, 'entity-id', info => {
            this.element.setAttribute('creative-id', info.id);
          }, /* opt_is3P */ true);
          listen(this.iframe_, 'embed-size', data => {
            if (data.width !== undefined) {
              this.iframe_.width = data.width;
              this.element.setAttribute('width', data.width);
            }
            if (data.height !== undefined) {
              const newHeight = Math.max(this.element./*OK*/offsetHeight +
                  data.height - this.iframe_./*OK*/offsetHeight, data.height);
              this.iframe_.height = data.height;
              this.element.setAttribute('height', newHeight);
              this.updateHeight_(newHeight);
            }
          }, /* opt_is3P */ true);
          this.iframe_.style.visibility = 'hidden';
          listenOnce(this.iframe_, 'render-start', () => {
            this.iframe_.style.visibility = '';
            this.sendEmbedInfo_(this.isInViewport());
          }, /* opt_is3P */ true);

          return loadPromise(this.iframe_);
        });
      }
      return loadPromise(this.iframe_);
    }

    /** @override */
    documentInactiveCallback() {
      if (this.iframe_) {
        this.paused_ = true;
        // When the doc is inactive, hide the ads, so any work they do takes
        // less CPU and power.
        toggle(this.iframe_, false);
      }
      // Call layoutCallback again when this document becomes active.
      return true;
    }

    /**
     * @return {!Promise<string|undefined>} A promise for a CID or undefined if
     *     - the ad network does not request one or
     *     - `amp-analytics` which provides the CID service was not installed.
     * @private
     */
    getAdCid_() {
      const scope = clientIdScope[this.element.getAttribute('type')];
      if (!scope) {
        return Promise.resolve();
      }
      return cidForOrNull(this.getWin()).then(cidService => {
        if (!cidService) {
          return Promise.resolve();
        }
        let consent = Promise.resolve();
        const consentId = this.element.getAttribute(
            'data-consent-notification-id');
        if (consentId) {
          consent = userNotificationManagerFor(this.win).then(service => {
            return service.get(consentId);
          });
        }
        return cidService.get(scope, consent);
      });
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
          inViewport: inViewport
        }, targetOrigin, /* opt_is3P */ true);
      }
    }

    /** @override  */
    overflowCallback(overflown, requestedHeight) {
      if (overflown) {
        const targetOrigin =
            this.iframe_.src ? parseUrl(this.iframe_.src).origin : '*';
        postMessage(
            this.iframe_,
            'embed-size-denied',
            {requestedHeight: requestedHeight},
            targetOrigin,
            /* opt_is3P */ true);
      }
    }

    /**
     * Updates the elements height to accommodate the iframe's requested height.
     * @param {number} newHeight
     * @private
     */
    updateHeight_(newHeight) {
      this.attemptChangeHeight(newHeight, () => {
        const targetOrigin =
            this.iframe_.src ? parseUrl(this.iframe_.src).origin : '*';
        postMessage(
            this.iframe_,
            'embed-size-changed',
            {requestedHeight: newHeight},
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
      // If a fallback does not exist attempt to collapse the ad.
      if (!this.fallback_) {
        this.attemptChangeHeight(0, () => {
          this.element.style.display = 'none';
        });
      }
      this.deferMutate(() => {
        if (this.fallback_) {
          this.toggleFallback(true);
        }
        this.element.removeChild(this.iframe_);
      });
    }
  }

  registerElement(win, 'amp-ad', AmpAd);
}
