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


/**
 * @fileoverview Embeds an instagram photo. Captions are currently
 * not supported.
 * The shortcode attribute can be easily copied from a normal instagram
 * URL.
 * Example:
 * <code>
 * <amp-instagram
 *   shortcode="fBwFP"
 *   width="320"
 *   height="392"
 *   layout="responsive">
 * </amp-instagram>
 * </code>
 *
 * For responsive embedding the width and height can be left unchanged from
 * the example above and will produce the correct aspect ratio.
 */

import {isLayoutSizeDefined} from '../../../src/layout';
import {loadPromise} from '../../../src/event-helper';


class AmpInstagram extends AMP.BaseElement {
  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }
  /** @override */
  layoutCallback() {
    var width = this.element.getAttribute('width');
    var height = this.element.getAttribute('height');
    var shortCode = AMP.assert(this.element.getAttribute('shortcode'),
        'The shortcode attribute is required for <amp-instagram> %s',
        this.element);
    // See
    // https://instagram.com/developer/embedding/?hl=en
    var iframe = document.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowtransparency', 'true');
    iframe.src = 'https://instagram.com/p/' +
        encodeURIComponent(shortCode) + '/embed/?v=4';
    this.applyFillContent(iframe);
    iframe.width = width;
    iframe.height = height;
    this.element.appendChild(iframe);
    return loadPromise(iframe);
  }
};

AMP.registerElement('amp-instagram', AmpInstagram);
