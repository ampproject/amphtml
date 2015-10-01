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

import {getLengthNumeral, isLayoutSizeDefined} from '../../../src/layout';
import {loadPromise} from '../../../src/event-helper';
import {parseUrl} from '../../../src/url';


/** @type {number}  */
var count = 0;

/** @const */
var assert = AMP.assert;

class AmpIframe extends AMP.BaseElement {
  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  assertSource(src, containerSrc, sandbox) {
    var url = parseUrl(src);
    assert(
        url.protocol == 'https:' ||
            url.origin.startsWith('http://iframe.localhost:'),
        'Invalid <amp-iframe> src. Must start with https://. Found %s',
        this.element);
    var containerUrl = parseUrl(containerSrc);
    assert(
        !((' ' + sandbox + ' ').match(/\s+allow-same-origin\s+/)) ||
        url.origin != containerUrl.origin,
        'Origin of <amp-iframe> must not be equal to container %s.',
        this.element);
    return src;
  }

  assertPosition() {
    var pos = this.element.getLayoutBox();
    var minTop = Math.min(600, this.getViewport().getSize().height * .75);
    assert(pos.top >= minTop,
        '<amp-iframe> elements must be positioned outside the first 75% ' +
        'of the viewport or 600px from the top (whichever is smaller): %s ' +
        'Please contact the AMP team if that is a problem in your project.' +
        ' We\'d love to learn about your use case. Current position %s. Min: %s',
        this.element,
        pos.top,
        minTop);
  }

  /** @override */
  firstAttachedCallback() {
    var iframeSrc = this.element.getAttribute('src');
    this.iframeSrc = this.assertSource(iframeSrc, window.location.href,
        this.element.getAttribute('sandbox'));
    this.preconnect.url(this.iframeSrc);
  }

  /** @override */
  layoutCallback() {
    this.assertPosition();
    if (!this.iframeSrc) {
      // This failed already, lets not signal another error.
      return Promise.resolve();
    }
    var width = this.element.getAttribute('width');
    var height = this.element.getAttribute('height');
    var iframe = document.createElement('iframe');
    this.applyFillContent(iframe);
    iframe.width = getLengthNumeral(width);
    iframe.height = getLengthNumeral(height);
    iframe.name = 'amp_iframe' + count++;
    iframe.onload = function() {
      // Chrome does not reflect the iframe readystate.
      this.readyState = 'complete';
    };
    /** @const {!Element} */
    this.propagateAttributes(
        ['frameborder', 'allowfullscreen', 'allowtransparency', 'scrolling'],
        iframe);
    setSandbox(this.element, iframe);
    iframe.src = this.iframeSrc;
    this.element.appendChild(makeIOsScrollable(this.element, iframe));
    return loadPromise(iframe);
  }
};

/**
 * We always set a sandbox. Default is that none of the things that need
 * to be opted in are allowed.
 * @param {!Element} element
 * @param {!Element} iframe
 */
function setSandbox(element, iframe) {
  var allows = element.getAttribute('sandbox') || '';
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
    var wrapper = document.createElement('i-amp-scroll-container');
    wrapper.appendChild(iframe);
    return wrapper;
  }
  return iframe;
}

AMP.registerElement('amp-iframe', AmpIframe);
