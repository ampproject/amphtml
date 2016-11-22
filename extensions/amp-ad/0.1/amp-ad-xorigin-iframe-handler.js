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
import {
  SubscriptionApi,
  listenFor,
  listenForOncePromise,
  postMessageToWindows,
} from '../../../src/iframe-helper';
import {
  IntersectionObserverApi,
} from '../../../src/intersection-observer-polyfill';
import {viewerForDoc} from '../../../src/viewer';
import {dev, user} from '../../../src/log';
import {timerFor} from '../../../src/timer';
import {setStyle} from '../../../src/style';
import {AdDisplayState} from './amp-ad-ui';

const TIMEOUT_VALUE = 10000;

export class AmpAdXOriginIframeHandler {

  /**
   * @param {!./amp-ad-3p-impl.AmpAd3PImpl|!../../amp-a4a/0.1/amp-a4a.AmpA4A} baseInstance
   */
  constructor(baseInstance) {

    /** @private */
    this.baseInstance_ = baseInstance;

    /** @private {!Element} */
    this.element_ = baseInstance.element;

    /** @private {?AMP.AmpAdUIHandler} */
    this.uiHandler_ = baseInstance.uiHandler;

    /** {?Element} iframe instance */
    this.iframe = null;

    /** @private {?IntersectionObserverApi} */
    this.intersectionObserverApi_ = null;

    /** @private {SubscriptionApi} */
    this.embedStateApi_ = null;

    /** @private {!Array<!Function>} functions to unregister listeners */
    this.unlisteners_ = [];

    /** @private @const {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = viewerForDoc(this.baseInstance_.getAmpDoc());

    /** @private {?Promise} */
    this.adResponsePromise_ = null;
  }

  /**
   * Sets up listeners and iframe state for iframe containing ad creative.
   * @param {!Element} iframe
   * @param {boolean=} opt_isA4A when true do not listen to ad response
   * @return {!Promise} awaiting render complete promise
   * @suppress {checkTypes}  // TODO(tdrl): Temporary, for lifecycleReporter.
   */
  init(iframe, opt_isA4A) {
    dev().assert(
        !this.iframe, 'multiple invocations of init without destroy!');
    this.iframe = iframe;
    this.iframe.setAttribute('scrolling', 'no');
    this.baseInstance_.applyFillContent(this.iframe);

    // Init IntersectionObserver service.
    this.intersectionObserverApi_ = new IntersectionObserverApi(
        this.baseInstance_, this.iframe, true);

    this.embedStateApi_ = new SubscriptionApi(
        this.iframe, 'send-embed-state', true,
        () => this.sendEmbedInfo_(this.baseInstance_.isInViewport()));
    // Triggered by context.reportRenderedEntityIdentifier(…) inside the ad
    // iframe.
    listenForOncePromise(this.iframe, 'entity-id', true)
        .then(info => {
          this.element_.creativeId = info.data.id;
        });

    // Install iframe resize API.
    this.unlisteners_.push(listenFor(this.iframe, 'embed-size',
        (data, source, origin) => {
          this.updateSize_(data.height, data.width, source, origin);
        }, true, true));

    this.unlisteners_.push(this.viewer_.onVisibilityChanged(() => {
      this.sendEmbedInfo_(this.baseInstance_.isInViewport());
    }));

    if (opt_isA4A) {
      // A4A writes creative frame directly to page therefore does not expect
      // post message to unset visibility hidden
      this.element_.appendChild(this.iframe);
      return Promise.resolve();
    }

    // Install API that listen to ad response
    if (this.baseInstance_.config
        && this.baseInstance_.config.renderStartImplemented) {
      // If support render-start, create a race between render-start no-content
      this.adResponsePromise_ = listenForOncePromise(this.iframe,
        ['render-start', 'no-content'], true).then(info => {
          const data = info.data;
          if (data.type == 'render-start') {
            this.renderStart_(info);
          } else {
            this.noContent_();
          }
        });
    } else {
      // If NOT support render-start, listen to bootstrap-loaded no-content
      // respectively
      this.adResponsePromise_ = listenForOncePromise(this.iframe,
        'bootstrap-loaded', true);
      listenForOncePromise(this.iframe, 'no-content', true)
          .then(() => this.noContent_());
    }

    // Set iframe initially hidden which will be removed on load event +
    // post message.
    setStyle(this.iframe, 'visibility', 'hidden');

    this.element_.appendChild(this.iframe);
    return timerFor(this.baseInstance_.win).timeoutPromise(TIMEOUT_VALUE,
        this.adResponsePromise_,
        'timeout waiting for ad response').catch(e => {
          this.noContent_();
          user().warn('AMP-AD', e);
        }).then(() => {
          if (this.iframe) {
            setStyle(this.iframe, 'visibility', '');
          }
        });
  }

  /**
   * callback functon on receiving render-start
   * @param {!Object} info
   * @private
   */
  renderStart_(info) {
    const data = info.data;
    this.uiHandler_.setDisplayState(AdDisplayState.LOADED_RENDER_START);
    this.updateSize_(data.height, data.width,
                info.source, info.origin);
    if (this.baseInstance_.lifecycleReporter) {
      this.baseInstance_.lifecycleReporter.sendPing(
          'renderCrossDomainStart');
    }
  }

  /**
   * Cleans up the listeners on the cross domain ad iframe.
   * And free the iframe resource
   * @param {boolean=} opt_keep
   */
  freeXOriginIframe(opt_keep) {
    this.cleanup_();
    // If ask to keep the iframe.
    // Use in the case of no-content and iframe is a master iframe.
    if (opt_keep) {
      return;
    }
    if (this.iframe) {
      removeElement(this.iframe);
      this.iframe = null;
    }
  }

  /**
   * Cleans up listeners on the ad, and apply the default UI for ad.
   * @private
   */
  noContent_() {
    if (!this.iframe) {
      // unlayout already called
      return;
    }
    this.freeXOriginIframe(this.iframe.name.indexOf('_master') >= 0);
    this.uiHandler_.setDisplayState(AdDisplayState.LOADED_NO_CONTENT);
  }

  /**
   * Cleans up listeners on the ad iframe.
   * @private
   */
  cleanup_() {
    this.unlisteners_.forEach(unlistener => unlistener());
    this.unlisteners_.length = 0;
    if (this.embedStateApi_) {
      this.embedStateApi_.destroy();
      this.embedStateApi_ = null;
    }
    if (this.intersectionObserverApi_) {
      this.intersectionObserverApi_.destroy();
      this.intersectionObserverApi_ = null;
    }
  }

  /**
   * Updates the element's dimensions to accommodate the iframe's
   * requested dimensions. Notifies the window that request the resize
   * of success or failure.
   * @param {number|string|undefined} height
   * @param {number|string|undefined} width
   * @param {!Window} source
   * @param {string} origin
   * @private
   */
  updateSize_(height, width, source, origin) {
    // Calculate new width and height of the container to include the padding.
    // If padding is negative, just use the requested width and height directly.
    let newHeight, newWidth;
    height = parseInt(height, 10);
    if (!isNaN(height)) {
      newHeight = Math.max(this.element_./*OK*/offsetHeight +
          height - this.iframe./*OK*/offsetHeight, height);
    }
    width = parseInt(width, 10);
    if (!isNaN(width)) {
      newWidth = Math.max(this.element_./*OK*/offsetWidth +
          width - this.iframe./*OK*/offsetWidth, width);
    }
    if (newHeight !== undefined || newWidth !== undefined) {
      this.baseInstance_.attemptChangeSize(newHeight, newWidth).then(() => {
        this.sendEmbedSizeResponse_(
          true /* success */, newWidth, newHeight, source, origin);
      }, () => this.sendEmbedSizeResponse_(
          false /* success */, newWidth, newHeight, source, origin));
    }
  }

  /**
   * Sends a response to the window which requested a resize.
   * @param {boolean} success
   * @param {number} requestedWidth
   * @param {number} requestedHeight
   * @param {!Window} source
   * @param {string} origin
   * @private
   */
  sendEmbedSizeResponse_(success, requestedWidth, requestedHeight, source,
      origin) {
    // The iframe may have been removed by the time we resize.
    if (!this.iframe) {
      return;
    }
    postMessageToWindows(
        this.iframe,
        [{win: source, origin}],
        success ? 'embed-size-changed' : 'embed-size-denied',
        {requestedWidth, requestedHeight},
        true);
  }

  /**
   * @param {boolean} inViewport
   * @private
   */
  sendEmbedInfo_(inViewport) {
    if (!this.embedStateApi_) {
      return;
    }
    this.embedStateApi_.send('embed-state', {
      inViewport,
      pageHidden: !this.viewer_.isVisible(),
    });
  }

  /**
   * See BaseElement method.
   * @param {boolean} inViewport
   */
  viewportCallback(inViewport) {
    if (this.intersectionObserverApi_) {
      this.intersectionObserverApi_.onViewportCallback(inViewport);
    }
    this.sendEmbedInfo_(inViewport);
  }


  /**
   * See BaseElement method.
   */
  onLayoutMeasure() {
    // When the framework has the need to remeasure us, our position might
    // have changed. Send an intersection record if needed.
    if (this.intersectionObserverApi_) {
      this.intersectionObserverApi_.fire();
    }
  }
}

// Make the class available to other late loaded amp-ad implementations
// without them having to depend on it directly.
AMP.AmpAdXOriginIframeHandler = AmpAdXOriginIframeHandler;
