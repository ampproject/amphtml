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

import {childElementByAttr} from '../../../src/dom';
import {getLengthNumeral, isLayoutSizeDefined} from '../../../src/layout';
import {loadPromise} from '../../../src/event-helper';
import {log} from '../../../src/log';
import {parseUrl} from '../../../src/url';

/** @const {string} */
const TAG_ = 'AmpIframe';

/** @type {number}  */
let count = 0;

/** @const */
const assert = AMP.assert;

class AmpIframe extends AMP.BaseElement {
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
        !((' ' + sandbox + ' ').match(/\s+allow-same-origin\s+/)) ||
        url.origin != containerUrl.origin,
        'Origin of <amp-iframe> must not be equal to container %s' +
        'if allow-same-origin is set.',
        this.element);
    return src;
  }

  assertPosition() {
    const pos = this.element.getLayoutBox();
    const minTop = Math.min(600, this.getViewport().getSize().height * .75);
    assert(pos.top >= minTop,
        '<amp-iframe> elements must be positioned outside the first 75% ' +
        'of the viewport or 600px from the top (whichever is smaller): %s ' +
        'Please contact the AMP team if that is a problem in your project.' +
        ' We\'d love to learn about your use case. Current position %s. Min:' +
        ' %s',
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
   * @return {string} Data URI for the srcdoc
   */
  transformSrcDoc() {
    const srcdoc = this.element.getAttribute('srcdoc');
    if (!srcdoc) {
      return;
    }
    const sandbox = this.element.getAttribute('sandbox');
    assert(
        !((' ' + sandbox + ' ').match(/\s+allow-same-origin\s+/)),
        'allow-same-origin is not allowed with the srcdoc attribute %s.',
        this.element);
    return 'data:text/html;charset=utf-8;base64,' + btoa(srcdoc);
  }

  /** @override */
  firstAttachedCallback() {
    const iframeSrc = this.element.getAttribute('src') ||
        this.transformSrcDoc();
    this.iframeSrc = this.assertSource(iframeSrc, window.location.href,
        this.element.getAttribute('sandbox'));
    this.preconnect.url(this.iframeSrc);
  }

  /** @override */
  buildCallback() {
    /** @private {?Element} */
    this.overflowElement_ = childElementByAttr(this.element, 'overflow');
    if (this.overflowElement_) {
      this.overflowElement_.classList.add('-amp-overflow');
      this.overflowElement_.classList.toggle('amp-hidden', true);
    }
  }

  /** @override */
  layoutCallback() {
    this.assertPosition();
    if (!this.iframeSrc) {
      // This failed already, lets not signal another error.
      return Promise.resolve();
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
    iframe.onload = function() {
      // Chrome does not reflect the iframe readystate.
      this.readyState = 'complete';
    };

    /** @private @const {boolean} */
    this.isResizable_ = this.element.hasAttribute('resizable');
    if (this.isResizable_) {
      this.element.setAttribute('scrolling', 'no');
      assert(this.overflowElement_,
          'Overflow element must be defined for resizable frames: %s',
          this.element);
    }

    /** @const {!Element} */
    this.propagateAttributes(
        ['frameborder', 'allowfullscreen', 'allowtransparency', 'scrolling'],
        iframe);
    setSandbox(this.element, iframe);
    iframe.src = this.iframeSrc;
    this.element.appendChild(makeIOsScrollable(this.element, iframe));

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
    return loadPromise(iframe);
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
    this.requestChangeHeight(newHeight, actualHeight => {
      assert(this.overflowElement_);
      this.overflowElement_.classList.toggle('amp-hidden', false);
      this.overflowElement_.onclick = () => {
        this.overflowElement_.classList.toggle('amp-hidden', true);
        this.changeHeight(actualHeight);
      };
    });
  }
};

/**
 * We always set a sandbox. Default is that none of the things that need
 * to be opted in are allowed.
 * @param {!Element} element
 * @param {!Element} iframe
 */
function setSandbox(element, iframe) {
  const allows = element.getAttribute('sandbox') || '';
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
 * Listens for message from the iframe.
 * @param {!Element} iframe
 * @param {string} typeOfMessage
 * @param {function(!Object)} callback
 */
function listen(iframe, typeOfMessage, callback) {
  assert(iframe.src, 'only iframes with src supported');
  const origin = parseUrl(iframe.src).origin;
  const win = iframe.ownerDocument.defaultView;
  win.addEventListener('message', function(event) {
    if (event.origin != origin) {
      return;
    }
    if (event.source != iframe.contentWindow) {
      return;
    }
    if (!event.data || event.data.sentinel != 'amp') {
      return;
    }
    if (event.data.type != typeOfMessage) {
      return;
    }
    callback(event.data);
  });
}

AMP.registerElement('amp-iframe', AmpIframe);
