/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
 * @fileoverview Embeds a Github gist
 *
 * Example:
 * <code>
 * <amp-wordpress-embed
 *   layout="fixed-height"
 *   data-url="https://example.com/2018/05/17/awesome-post/"
 *   height="240">
 * </amp-wordpress-embed>
 * </code>
 */

import {Layout} from '../../../src/layout';
import {createFrameFor} from '../../../src/iframe-video';
import {listenFor} from '../../../src/iframe-helper';
import {removeElement} from '../../../src/dom';
import {user} from '../../../src/log';

export class AmpWordPressEmbed extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {?string} */
    this.url_ = null;
  }

  /** @override */
  buildCallback() {
    // @todo Need to support placeholder.

    const {element: el} = this;

    this.url_ = user().assert(
        el.getAttribute('data-url'),
        'The data-url attribute is required for %s', el);
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url(this.url_, opt_onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.FIXED_HEIGHT;
  }

  /** @override */
  layoutCallback() {
    const url = new URL(this.url_);
    url.searchParams.set('embed', 'true');

    const iframe = createFrameFor(this, url.toString());
    this.applyFillContent(iframe);

    // Triggered by sendEmbedMessage inside the iframe.
    listenFor(iframe, 'height', data => {
      this./*OK*/changeHeight(data['value']);
    }, /* opt_is3P */true);

    this.element.appendChild(iframe);
    this.iframe_ = iframe;
    return this.loadPromise(iframe);
  }

  /**
   * @override
   */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    return true;
  }
}


AMP.extension('amp-wordpress-embed', '0.1', AMP => {
  AMP.registerElement('amp-wordpress-embed', AmpWordPressEmbed);
});
