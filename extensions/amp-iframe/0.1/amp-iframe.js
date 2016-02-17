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

import {IntersectionObserver} from '../../../src/intersection-observer';
import {getLengthNumeral, isLayoutSizeDefined} from '../../../src/layout';
import {listen} from '../../../src/iframe-helper';
import {loadPromise} from '../../../src/event-helper';
import {log} from '../../../src/log';
import {parseUrl} from '../../../src/url';
import {removeElement} from '../../../src/dom';
import {timer} from '../../../src/timer';

/** @const {string} */
const TAG_ = 'AmpIframe';

/** @type {number}  */
let count = 0;

/** @type {number}  */
let trackingIframeCount = 0;

/** @type {number}  */
let trackingIframeTimeout = 5000;

/** @const */
const assert = AMP.assert;

export class AmpIframe extends AMP.BaseElement {
  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  assertSource(src, containerSrc, sandbox) {
    const url = parseUrl(src);
    assert(
        url.protocol == 'https:' ||
        url.protocol == 'data:' ||
        url.origin.indexOf('http://iframe.localhost:') == 0,
        'Invalid <amp-iframe> src. Must start with https://. Found %s',
        this.element);
    const containerUrl = parseUrl(containerSrc);
    assert(
        !((' ' + sandbox + ' ').match(/\s+allow-same-origin\s+/i)) ||
        (url.origin != containerUrl.origin && url.protocol != 'data:'),
        'Origin of <amp-iframe> must not be equal to container %s' +
        'if allow-same-origin is set. See https://github.com/ampproject/' +
        'amphtml/blob/master/spec/amp-iframe-origin-policy.md for details.',
        this.element);
    return src;
  }

  assertPosition() {
    const pos = this.element.getLayoutBox();
    const minTop = Math.min(600, this.getViewport().getSize().height * .75);
    assert(pos.top >= minTop,
        '<amp-iframe> elements must be positioned outside the first 75% ' +
        'of the viewport or 600px from the top (whichever is smaller): %s ' +
        ' Current position %s. Min: %s' +
        'Positioning rules don\'t apply for iframes that use `placeholder`.' +
        'See https://github.com/ampproject/amphtml/blob/master/extensions/' +
        'amp-iframe/amp-iframe.md#iframe-with-placeholder for details.',
        this.element,
        pos.top,
        minTop);
  }

  /**
   * Transforms the srcdoc attribute if present to an equivalent data URI.
   *
   * It may be OK to change this later to leave the `srcdoc` in place and
   * instead ensure that `allow-same-origin` is not present, but this
   * implementation has the right security behavior which is that the document
   * may under no circumstances be able to run JS on the parent.
   * @param {string} srcdoc
   * @param {string} sandbox
   * @return {string} Data URI for the srcdoc
   */
  transformSrcDoc(srcdoc, sandbox) {
    if (!srcdoc) {
      return;
    }
    assert(
        !((' ' + sandbox + ' ').match(/\s+allow-same-origin\s+/i)),
        'allow-same-origin is not allowed with the srcdoc attribute %s.',
        this.element);
    return 'data:text/html;charset=utf-8;base64,' + btoa(srcdoc);
  }

  /** @override */
  firstAttachedCallback() {
    /** @private @const {string} */
    this.sandbox_ = this.element.getAttribute('sandbox');
    const iframeSrc =
        this.element.getAttribute('src') ||
        this.transformSrcDoc(
            this.element.getAttribute('srcdoc'), this.sandbox_);
    this.iframeSrc = this.assertSource(
        iframeSrc, window.location.href, this.sandbox_);
  }

  /** @override */
  preconnectCallback(onLayout) {
    if (this.iframeSrc) {
      this.preconnect.url(this.iframeSrc, onLayout);
    }
  }

  /** @override */
  buildCallback() {
    /** @private @const {!Element} */
    this.placeholder_ = this.getPlaceholder();
    /** @private @const {boolean} */
    this.isClickToPlay_ = !!this.placeholder_;
    /**
     * Call to stop listening to viewport changes.
     * @private {?function()}
     */
    this.unlistenViewportChanges_ = null;
    /**
     * The layout box of the ad iframe (as opposed to the amp-ad tag).
     * In practice it often has padding to create a grey or similar box
     * around ads.
     * @private {!LayoutRect}
     */
    this.iframeLayoutBox_ = null;
  }

  /**
   * @override
   */
  onLayoutMeasure() {
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


  /** @override */
  layoutCallback() {
    if (!this.isClickToPlay_) {
      this.assertPosition();
    }
    if (!this.iframeSrc) {
      // This failed already, lets not signal another error.
      return Promise.resolve();
    }

    const isTracking = this.looksLikeTrackingIframe_();
    if (isTracking) {
      trackingIframeCount++;
      if (trackingIframeCount > 1) {
        console/*OK*/.error('Only 1 analytics/tracking iframe allowed per ' +
            'page. Please use amp-analytics instead or file a GitHub issue ' +
            'for your use case: ' +
            'https://github.com/ampproject/amphtml/issues/new');
        return Promise.resolve();
      }
      console/*OK*/.error('It looks like this page contains an iframe that' +
          ' is used for tracking or analytics purposes. Please use ' +
          'amp-analytics instead. This usage of amp-iframe will break ' +
          'in the future');
    }

    const width = this.element.getAttribute('width');
    const height = this.element.getAttribute('height');
    const iframe = document.createElement('iframe');

    /** @private @const {!HTMLIFrameElement} */
    this.iframe_ = iframe;

    this.applyFillContent(iframe);
    iframe.width = getLengthNumeral(width);
    iframe.height = getLengthNumeral(height);
    iframe.name = 'amp_iframe' + count++;

    if (this.isClickToPlay_) {
      iframe.style.zIndex = -1;
    }

    /** @private @const {boolean} */
    this.isResizable_ = this.element.hasAttribute('resizable');
    if (this.isResizable_) {
      this.element.setAttribute('scrolling', 'no');
      assert(this.getOverflowElement(),
          'Overflow element must be defined for resizable frames: %s',
          this.element);
    }

    /** @const {!Element} */
    this.propagateAttributes(
        ['frameborder', 'allowfullscreen', 'allowtransparency', 'scrolling'],
        iframe);
    setSandbox(this.element, iframe, this.sandbox_);
    iframe.src = this.iframeSrc;
    this.element.appendChild(makeIOsScrollable(this.element, iframe));
    if (!isTracking) {
      /** @private {!IntersectionObserver} */
      this.intersectionObserver_ =
          new IntersectionObserver(this, this.iframe_);
    }

    iframe.onload = () => {
      // Chrome does not reflect the iframe readystate.
      iframe.readyState = 'complete';
      this.activateIframe_();
      if (isTracking) {
        timer.promise(trackingIframeTimeout).then(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
          this.element.setAttribute('amp-removed', '');
          this.iframe_ = null;
          this.iframeSrc = null;
        });
      }
    };

    listen(iframe, 'embed-size', data => {
      if (data.width !== undefined) {
        iframe.width = data.width;
        this.element.setAttribute('width', data.width);
      }
      if (data.height !== undefined) {
        const newHeight = Math.max(this.element./*OK*/offsetHeight +
            data.height - this.iframe_./*OK*/offsetHeight, data.height);
        iframe.height = data.height;
        this.element.setAttribute('height', newHeight);
        this.updateHeight_(newHeight);
      }
    });
    if (this.isClickToPlay_) {
      listen(iframe, 'embed-ready', this.activateIframe_.bind(this));
    }
    return loadPromise(iframe);
  }

  /** @override  */
  viewportCallback(inViewport) {
    if (this.intersectionObserver_) {
      this.intersectionObserver_.onViewportCallback(inViewport);
    }
  }

  /**
   * Makes the iframe visible.
   * @private
   */
  activateIframe_() {
    this.getVsync().mutate(() => {
      if (this.placeholder_) {
        this.iframe_.style.zIndex = '';
        removeElement(this.placeholder_);
        this.placeholder_ = null;
      }
    });
  }

  /**
   * Updates the elements height to accommodate the iframe's requested height.
   * @param {number} newHeight
   * @private
   */
  updateHeight_(newHeight) {
    if (!this.isResizable_) {
      log.warn(TAG_,
          'ignoring embed-size request because this iframe is not resizable',
          this.element);
      return;
    }
    this.attemptChangeHeight(newHeight);
  }

  looksLikeTrackingIframe_() {
    const box = this.element.getLayoutBox();
    // This heuristic is subject to change.
    if (box.width > 10 && box.height > 10) {
      return false;
    }
    return true;
  }
};

/**
 * We always set a sandbox. Default is that none of the things that need
 * to be opted in are allowed.
 * @param {!Element} element
 * @param {!Element} iframe
 * @param {string} sandbox
 */
function setSandbox(element, iframe, sandbox) {
  const allows = sandbox || '';
  iframe.setAttribute('sandbox', allows);
}


/**
 * If scrolling is allowed for the iframe, wraps it into a container
 * that is scrollable because iOS auto expands iframes to their size.
 * @param {!Element} element
 * @param {!Element} iframe
 * @return {!Element} The wrapper or the iframe.
 */
function makeIOsScrollable(element, iframe) {
  if (element.getAttribute('scrolling') != 'no') {
    const wrapper = document.createElement('i-amp-scroll-container');
    wrapper.appendChild(iframe);
    return wrapper;
  }
  return iframe;
}

/**
 * @param {number} ms
 */
export function setTrackingIframeTimeoutForTesting(ms) {
  trackingIframeTimeout = ms;
}

AMP.registerElement('amp-iframe', AmpIframe);
