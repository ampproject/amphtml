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

import {BaseElement} from './base-element';
import {assert} from './asserts';
import {getLengthNumeral, isLayoutSizeDefined} from './layout';
import {loadPromise} from './event-helper';
import {registerElement} from './custom-element';
import {viewport} from './viewport';


/**
 * @param {!Window} win Destination window for the new element.
 */
export function installIframe(win) {
  class AmpIframe extends BaseElement {

    /** @override */
    isLayoutSupported(layout) {
      return isLayoutSizeDefined(layout);
    }

    assertSource(src) {
      assert(
          src.startsWith('https://') ||
              src.startsWith('http://iframe.localhost/'),
          'Invalid <amp-iframe> src. Must start with https://. Found %s',
          this.element);
    }

    assertPosition() {
      var pos = this.element.getLayoutBox();
      var minTop = Math.min(600, viewport.getSize().height * .75);
      assert(pos.top >= minTop,
          '<amp-iframe> elements must be positioned outside the first 75% ' +
          'of the viewport or 600px from the top (whichever is smaller). ' +
          'Please contact the AMP team if that is a problem in your project.' +
          ' We\'d love to learn about your use case.');
    }

    /** @override */
    firstAttachedCallback() {
      var iframeSrc = this.element.getAttribute('src');
      this.assertSource(iframeSrc);
      this.iframeSrc = iframeSrc;
    }

    /** @override */
    loadContent() {
      this.assertPosition();
      if (!this.iframeSrc) {
        return;
      }
      var width = this.element.getAttribute('width');
      var height = this.element.getAttribute('height');
      var iframe = document.createElement('iframe');
      this.applyFillContent(iframe);
      iframe.width = getLengthNumeral(width);
      iframe.height = getLengthNumeral(height);
      this.element.appendChild(iframe);
      /** @const {!Element} */
      this.propagateAttributes(
          ['frameborder', 'allowfullscreen', 'allowtransparency'],
          iframe);
      setSandbox(this.element, iframe);
      iframe.src = this.iframeSrc;
      return loadPromise(iframe);
    }
  }

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

  registerElement(win, 'amp-iframe', AmpIframe);
}
