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
 * The data-shortcode attribute can be easily copied from a normal instagram
 * URL.
 * Example:
 * <code>
 * <amp-instagram
 *   data-shortcode="fBwFP"
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
  preconnectCallback(onLayout) {
    this.preconnect.url('https://www.instagram.com', onLayout);
    // Host instagram used for image serving. While the host name is
    // funky this appears to be stable in the post-domain sharding era.
    this.preconnect.url('https://instagram.fsnc1-1.fna.fbcdn.net', onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    const width = this.element.getAttribute('width');
    const height = this.element.getAttribute('height');
    const shortcode = AMP.assert(
        (this.element.getAttribute('data-shortcode') ||
        this.element.getAttribute('shortcode')),
        'The data-shortcode attribute is required for <amp-instagram> %s',
        this.element);
    // See
    // https://instagram.com/developer/embedding/?hl=en
    const iframe = document.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowtransparency', 'true');
    iframe.src = 'https://www.instagram.com/p/' +
        encodeURIComponent(shortcode) + '/embed/?v=4';
    this.applyFillContent(iframe);
    iframe.width = width;
    iframe.height = height;
    this.element.appendChild(iframe);
    return loadPromise(iframe);
  }
};

AMP.registerElement('amp-instagram', AmpInstagram);
