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
import {loadPromise} from '../../../src/event-helper';
import {
  SubscriptionApi,
  listenFor,
  listenForOncePromise,
  postMessageToWindows,
} from '../../../src/iframe-helper';
import {IntersectionObserver} from '../../../src/intersection-observer';
import {viewerForDoc} from '../../../src/viewer';
import {dev, user} from '../../../src/log';
import {timerFor} from '../../../src/timer';

const TIMEOUT_VALUE = 10000;

export class AmpAdApiHandler {

  /**
   * @param {!./amp-ad-3p-impl.AmpAd3PImpl|!../../amp-a4a/0.1/amp-a4a.AmpA4A} baseInstance
   * @param {!Element} element
   * @param {function()=} opt_noContentCallback
   */
  constructor(baseInstance, element, opt_noContentCallback) {

    /** @private */
    this.baseInstance_ = baseInstance;

    /** @private {!Element} */
    this.element_ = element;

    /** @private {?Element} iframe instance */
    this.iframe_ = null;

    /** @private {?IntersectionObserver} */
    this.intersectionObserver_ = null;

    /** @private {SubscriptionApi} */
    this.embedStateApi_ = null;

    /** @private {boolean} */
    this.is3p_ = false;

    /** @private {?function()|undefined} opt_noContentHandler */
    this.noContentCallback_ = opt_noContentCallback;

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
   * @param {boolean} is3p whether iframe was loaded via 3p.
   * @param {boolean=} opt_defaultVisible when true, visibility hidden is NOT
   *    set on the iframe element (remains visible
   * @return {!Promise} awaiting load event for ad frame
   * @suppress {checkTypes}  // TODO(tdrl): Temporary, for lifecycleReporter.
   */
  startUp(iframe, is3p, opt_defaultVisible) {
    dev().assert(
        !this.iframe_, 'multiple invocations of startup without destroy!');
    this.iframe_ = iframe;
    this.is3p_ = is3p;
    this.iframe_.setAttribute('scrolling', 'no');
    this.baseInstance_.applyFillContent(this.iframe_);
    this.intersectionObserver_ = new IntersectionObserver(
        this.baseInstance_, this.iframe_, is3p);
    this.embedStateApi_ = new SubscriptionApi(
        this.iframe_, 'send-embed-state', is3p,
        () => this.sendEmbedInfo_(this.baseInstance_.isInViewport()));
    // Triggered by context.reportRenderedEntityIdentifier(…) inside the ad
    // iframe.
    listenForOncePromise(this.iframe_, 'entity-id', this.is3p_)
        .then(info => {
          this.element_.creativeId = info.data.id;
        });

    // Install iframe resize API.
    this.unlisteners_.push(listenFor(this.iframe_, 'embed-size',
        (data, source, origin) => {
          this.updateSize_(data.height, data.width, source, origin);
        }, this.is3p_, this.is3p_));

    // Install API that listen to ad response
    if (this.baseInstance_.config
        && this.baseInstance_.config.renderStartImplemented) {
      // If support render-start, create a race between render-start no-content
      this.adResponsePromise_ = listenForOncePromise(this.iframe_,
        ['render-start', 'no-content'], this.is3p_).then(info => {
          const data = info.data;
          if (data.type == 'render-start') {
            this.renderStart_(info);
            //report performance
          } else {
            this.noContent_();
          }
        });
    } else {
      // If NOT support render-start, listen to bootstrap-loaded no-content
      // respectively
      this.adResponsePromise_ = listenForOncePromise(this.iframe_,
        'bootstrap-loaded', this.is3p_);
      listenForOncePromise(this.iframe_, 'no-content', this.is3p_)
          .then(() => this.noContent_());
    }

    if (!opt_defaultVisible) {
      // NOTE(tdrl,keithwrightbos): This will not work for A4A with an AMP
      // creative as it will not expect having to send the render-start message.
      this.iframe_.style.visibility = 'hidden';
    }

    this.unlisteners_.push(this.viewer_.onVisibilityChanged(() => {
      this.sendEmbedInfo_(this.baseInstance_.isInViewport());
    }));

    this.element_.appendChild(this.iframe_);
    return loadPromise(this.iframe_).then(() => {
      return timerFor(this.baseInstance_.win).timeoutPromise(TIMEOUT_VALUE,
          this.adResponsePromise_,
          'timeout waiting for ad response').catch(e => {
            this.noContent_();
            user().warn('AMP-AD', e);
          }).then(() => {
            //TODO: add performance reporting;
            if (this.iframe_) {
              this.iframe_.style.visibility = '';
            }
          });
    });
  }

  /**
   * callback functon on receiving render-start
   * @param {!Object} info
   * @private
   */
  renderStart_(info) {
    const data = info.data;
    this.updateSize_(data.height, data.width,
                info.source, info.origin);
    if (this.baseInstance_.lifecycleReporter) {
      this.baseInstance_.lifecycleReporter.sendPing(
          'renderCrossDomainStart');
    }
  }

  /** See BaseElement.  */
  unlayoutCallback() {
    this.cleanup_();
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
  }

  /**
   * Cleans up listeners on the ad, and calls the no content callback, if one
   * was provided.
   * @private
   */
  noContent_() {
    //TODO: make noContentCallback_ default
    if (this.noContentCallback_) {
      this.noContentCallback_();
    } else {
      user().info('AMP-AD', 'no content callback was specified');
    }
    this.cleanup_();
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
    if (this.intersectionObserver_) {
      this.intersectionObserver_.destroy();
      this.intersectionObserver_ = null;
    }
    this.noContentCallback_ = null;
  }

  /**
   * Updates the element's dimensions to accommodate the iframe's
   * requested dimensions. Notifies the window that request the resize
   * of success or failure.
   * @param {number|undefined} height
   * @param {number|undefined} width
   * @param {!Window} source
   * @param {string} origin
   * @private
   */
  updateSize_(height, width, source, origin) {
    // Calculate new width and height of the container to include the padding.
    // If padding is negative, just use the requested width and height directly.
    let newHeight, newWidth;
    if (height !== undefined) {
      newHeight = Math.max(this.element_./*OK*/offsetHeight +
          height - this.iframe_./*OK*/offsetHeight, height);
    }
    if (width !== undefined) {
      newWidth = Math.max(this.element_./*OK*/offsetWidth +
          width - this.iframe_./*OK*/offsetWidth, width);
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
    if (!this.iframe_) {
      return;
    }
    postMessageToWindows(
        this.iframe_,
        [{win: source, origin}],
        success ? 'embed-size-changed' : 'embed-size-denied',
        {requestedWidth, requestedHeight},
        this.is3p_);
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
    if (this.intersectionObserver_) {
      this.intersectionObserver_.onViewportCallback(inViewport);
    }
    this.sendEmbedInfo_(inViewport);
  }


  /**
   * See BaseElement method.
   */
  onLayoutMeasure() {
    // When the framework has the need to remeasure us, our position might
    // have changed. Send an intersection record if needed. This does nothing
    // if we aren't currently in view.
    if (this.intersectionObserver_) {
      this.intersectionObserver_.fire();
    }
  }
}

// Make the class available to other late loaded amp-ad implementations
// without them having to depend on it directly.
AMP.AmpAdApiHandler = AmpAdApiHandler;
