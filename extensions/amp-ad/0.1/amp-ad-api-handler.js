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
  listenForOnce,
  postMessage,
} from '../../../src/iframe-helper';
import {parseUrl} from '../../../src/url';
import {IntersectionObserver} from '../../../src/intersection-observer';
import {viewerFor} from '../../../src/viewer';
import {user} from '../../../src/log';

export class AmpAdApiHandler {

  /**
   * @param {!BaseElement} baseInstance
   * @param {!Element} element
   * @param {function()=} opt_noContentCallback
   */
  constructor(baseInstance, element, opt_noContentCallback) {
    /** @private {!BaseElement} */
    this.baseInstance_ = baseInstance;

    /** @privat {!Element} */
    this.element_ = element;

    /** @private {?Element} iframe instance */
    this.iframe_ = null;

    /** @private {?IntersectionObserver} */
    this.intersectionObserver_ = null;

    this.embedStateApi_ = null;

    /** @private {boolean} */
    this.is3p_ = false;

    /** @param {?function()} opt_noContentHandler */
    this.noContentCallback_ = opt_noContentCallback;

    /** @private {!Array<!Function>} functions to unregister listeners */
    this.unlisteners_ = [];

    /** @private @const */
    this.viewer_ = viewerFor(this.baseInstance_.win);
  }

  /**
   * @param {!Element} iframe
   * @param {boolean} is3p
   * @return {!Promise} awaiting load event for ad frame
   */
  startUp(iframe, is3p) {
    user.assert(
      !this.iframe, 'multiple invocations of startup without destroy!');
    this.iframe_ = iframe;
    this.is3p_ = is3p;
    this.iframe_.setAttribute('scrolling', 'no');
    this.baseInstance_.applyFillContent(this.iframe_);
    this.intersectionObserver_ =
        new IntersectionObserver(this.baseInstance_, this.iframe_, is3p);
    this.embedStateApi_ = new SubscriptionApi(
        this.iframe_, 'send-embed-state', is3p,
        () => this.sendEmbedInfo_(this.baseInstance_.isInViewport()));
    // Triggered by context.noContentAvailable() inside the ad iframe.
    listenForOnce(this.iframe_, 'no-content', () => {
      if (this.noContentCallback_) {
        this.noContentCallback_();
      } else {
        user.info('no content callback was specified');
      }
    }, this.is3p_);
    // Triggered by context.reportRenderedEntityIdentifier(…) inside the ad
    // iframe.
    listenForOnce(this.iframe_, 'entity-id', info => {
      this.element_.creativeId = info.id;
    }, this.is3p_);
    this.unlisteners_.push(listenFor(this.iframe_, 'embed-size', data => {
      let newHeight, newWidth;
      if (data.width !== undefined) {
        newWidth = Math.max(this.element_./*OK*/offsetWidth +
            data.width - this.iframe_./*OK*/offsetWidth, data.width);
        this.iframe_.width = newWidth;
        this.element_.setAttribute('width', newWidth);
      }
      if (data.height !== undefined) {
        newHeight = Math.max(this.element_./*OK*/offsetHeight +
            data.height - this.iframe_./*OK*/offsetHeight, data.height);
        this.iframe_.height = newHeight;
        this.element_.setAttribute('height', newHeight);
      }
      if (newHeight !== undefined || newWidth !== undefined) {
        this.updateSize_(newHeight, newWidth);
      }
    }, this.is3p_));
    if (this.is3p_) {
      // NOTE(tdrl,keithwrightbos): This will not work for A4A with an AMP
      // creative as it will not expect having to send the render-start message.
      this.iframe_.style.visibility = 'hidden';
    }
    listenForOnce(this.iframe_, 'render-start', () => {
      if (!this.iframe_) {
        return;
      }
      if (this.baseInstance_.renderStartResolve_) {
        this.baseInstance_.renderStartResolve_();
        this.baseInstance_.renderStartResolve_ = null;
      }
      this.iframe_.style.visibility = '';
    }, this.is3p_);
    this.viewer_.onVisibilityChanged(() => {
      this.sendEmbedInfo_(this.baseInstance_.isInViewport());
    });
    this.element_.appendChild(this.iframe_);
    return loadPromise(this.iframe_);
  }

  /** @override  */
  unlayoutCallback() {
    this.unlisteners_.forEach(unlistener => unlistener());
    this.unlisteners_ = [];
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    // IntersectionObserver's listeners were cleaned up by
    // setInViewport(false) before #unlayoutCallback
    this.intersectionObserver_.destroy();
    this.intersectionObserver_ = null;
  }

  /**
   * Updates the element's dimensions to accommodate the iframe's
   *    requested dimensions.
   * @param {number|undefined} height
   * @param {number|undefined} width
   * @private
   */
  updateSize_(height, width) {
    const targetOrigin =
          this.iframe_.src ? parseUrl(this.iframe_.src).origin : '*';
    this.baseInstance_.attemptChangeSize(height, width).then(() => {
      postMessage(
          this.iframe_,
          'embed-size-changed',
          {requestedHeight: height, requestedWidth: width},
          targetOrigin,
          this.is3p_);
    }, () => {
      postMessage(
          this.iframe_,
          'embed-size-denied',
          {requestedHeight: height, requestedWidth: width},
          targetOrigin,
          this.is3p_);
    });
  }

  /**
   * @param {boolean} inViewport
   * @private
   */
  sendEmbedInfo_(inViewport) {
    this.embedStateApi_.send('embed-state', {
      inViewport,
      pageHidden: !this.viewer_.isVisible(),
    });
  }

  /** @override  */
  viewportCallback(inViewport) {
    if (this.intersectionObserver_) {
      this.intersectionObserver_.onViewportCallback(inViewport);
    }
    this.sendEmbedInfo_(inViewport);
  }


  /**  @override */
  onLayoutMeasure() {
    // When the framework has the need to remeasure us, our position might
    // have changed. Send an intersection record if needed. This does nothing
    // if we aren't currently in view.
    if (this.intersectionObserver_) {
      this.intersectionObserver_.fire();
    }
  }
}
