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
 *   alt="Fastest page in the west."
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
import {setStyles} from '../../../src/style';
import {removeElement} from '../../../src/dom';
import {user} from '../../../src/log';


class AmpInstagram extends AMP.BaseElement {
  /** @override */
  preconnectCallback(onLayout) {
    // See
    // https://instagram.com/developer/embedding/?hl=en
    this.preconnect.url('https://www.instagram.com', onLayout);
    // Host instagram used for image serving. While the host name is
    // funky this appears to be stable in the post-domain sharding era.
    this.preconnect.url('https://instagram.fsnc1-1.fna.fbcdn.net', onLayout);
  }

  /** @override */
  renderOutsideViewport() {
    return false;
  }

  /** @override */
  buildCallback() {
    /**
     * @private {?Element}
     */
    this.iframe_ = null;
    /**
     * @private {?Promise}
     */
    this.iframePromise_ = null;
    /**
     * @private @const
     */
    this.shortcode_ = user().assert(
        (this.element.getAttribute('data-shortcode') ||
        this.element.getAttribute('shortcode')),
        'The data-shortcode attribute is required for <amp-instagram> %s',
        this.element);
  }

  /** @override */
  createPlaceholderCallback() {
    const placeholder = this.win.document.createElement('div');
    placeholder.setAttribute('placeholder', '');
    const image = this.win.document.createElement('amp-img');
    // This will redirect to the image URL. By experimentation this is
    // always the same URL that is actually used inside of the embed.
    image.setAttribute('src', 'https://www.instagram.com/p/' +
        encodeURIComponent(this.shortcode_) + '/media/?size=l');
    image.setAttribute('layout', 'fill');
    image.setAttribute('referrerpolicy', 'origin');

    this.propagateAttributes(['alt'], image);

    // This makes the non-iframe image appear in the exact same spot
    // where it will be inside of the iframe.
    setStyles(image, {
      'top': '48px',
      'bottom': '48px',
      'left': '8px',
      'right': '8px',
    });
    placeholder.appendChild(image);
    return placeholder;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    const iframe = this.element.ownerDocument.createElement('iframe');
    this.iframe_ = iframe;
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowtransparency', 'true');
    //Add title to the iframe for better accessibility.
    iframe.setAttribute('title', 'Instagram: ' +
        this.element.getAttribute('alt'));
    iframe.src = 'https://www.instagram.com/p/' +
        encodeURIComponent(this.shortcode_) + '/embed/?v=4';
    this.applyFillContent(iframe);
    iframe.width = this.element.getAttribute('width');
    iframe.height = this.element.getAttribute('height');
    this.element.appendChild(iframe);
    setStyles(iframe, {
      'opacity': 0,
    });
    return this.iframePromise_ = loadPromise(iframe).then(() => {
      this.getVsync().mutate(() => {
        setStyles(iframe, {
          'opacity': 1,
        });
      });
    });
  }

  /** @override */
  unlayoutOnPause() {
    return true;
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
      this.iframePromise_ = null;
    }
    return true;  // Call layoutCallback again.
  }
};

AMP.registerElement('amp-instagram', AmpInstagram);
