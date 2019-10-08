/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
 * @fileoverview Embeds a WordPress Post
 *
 * Example:
 * <code>
 * <amp-wordpress-embed
 *   layout="fixed-height"
 *   data-url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
 *   height="240">
 * </amp-wordpress-embed>
 * </code>
 */

import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {addParamToUrl} from '../../../src/url';
// import {createFrameFor} from '../../../src/iframe-video';
// import {htmlFor} from '../../../src/static-template';
// import {listenFor} from '../../../src/iframe-helper';
import {removeElement} from '../../../src/dom';
import {setStyle} from '../../../src/style';
import {userAssert} from '../../../src/log';

/** @type {number}  */
let count = 0;

/** @type {number}  */
const trackingIframeTimeout = 5000;

export class AmpWordPressEmbed extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {?string} */
    this.url_ = null;

    /** @private {?Element} */
    this.placeholder_ = null;
  }

  /** @override */
  buildCallback() {
    // @todo Need to support placeholder.

    const {element: el} = this;

    this.placeholder_ = this.getPlaceholder();

    this.handleMessageEvent_ = this.handleMessageEvent_.bind(this);

    this.url_ = el.getAttribute('data-url');

    userAssert(this.url_, 'The data-url attribute is required for %s', el);
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
    return layout === Layout.FIXED_HEIGHT;
  }

  /** @override */
  layoutCallback() {
    const {element: el} = this;

    userAssert(
      this.getOverflowElement(),
      'Overflow element must be defined for amp-wordpress-embed: %s',
      this.element
    );

    const url = addParamToUrl(this.url_, 'embed', 'true');

    const frame = this.element.ownerDocument.createElement('iframe');
    frame.setAttribute('frameborder', 0);
    frame.setAttribute('scrolling', 'no');
    // Note that allow-same-origin cannot be used for sake of same-origin post embeds.
    frame.setAttribute('sandbox', 'allow-scripts');
    this.iframe_ = frame;
    this.applyFillContent(frame);

    frame.name = 'amp_wordpress_embed' + count++;
    frame.src = Services.urlForDoc(el).assertHttpsUrl(url, el);

    frame.onload = () => {
      // Chrome does not reflect the iframe readystate.
      frame.readyState = 'complete';
      this.activateIframe_();

      if (this.isTrackingFrame_) {
        // Prevent this iframe from ever being recreated.
        this.iframeSrc = null;

        Services.timerFor(this.win)
          .promise(trackingIframeTimeout)
          .then(() => {
            removeElement(frame);
            this.element.setAttribute('amp-removed', '');
            this.iframe_ = null;
          });
      }
    };

    // @todo Figure out right way to do this with listenFor or whatever is the right way to do it.
    // Triggered by sendEmbedMessage inside the iframe.
    addEventListener('message', this.handleMessageEvent_);
    // listenFor(frame, 'height', data => {
    //   this./*OK*/changeHeight(data['value']);
    // }, /* opt_is3P */true);

    this.element.appendChild(frame);

    return this.loadPromise(frame);
  }

  /**
   * Handle message event.
   *
   * @param {MessageEvent} event
   * @private
   */
  handleMessageEvent_(event) {
    if (
      !this.iframe_ ||
      event.source !== this.iframe_.contentWindow ||
      'undefined' === typeof event.data.message ||
      'undefined' === typeof event.data.value
    ) {
      return;
    }

    switch (event.data.message) {
      case 'height':
        if (typeof event.data.value === 'number') {
          const newHeight = event.data.value;
          this.attemptChangeSize(newHeight).then(
            () => {
              this./*OK*/ changeHeight(newHeight);
            },
            () => {}
          );
        }
        break;
      case 'link':
        if (
          document.activeElement &&
          document.activeElement.contentWindow === event.source
        ) {
          window.location.href = event.data.value;
        }
        break;
    }
  }

  /**
   * @override
   */
  unlayoutCallback() {
    removeEventListener('message', this.handleMessageEvent_);
    if (this.iframe_) {
      removeElement(this.iframe_);
      if (this.placeholder_) {
        this.togglePlaceholder(true);
      }
      this.iframe_ = null;
    }
    return true;
  }

  /**
   * Makes the iframe visible.
   * @private
   */
  activateIframe_() {
    if (this.placeholder_) {
      this.getVsync().mutate(() => {
        if (this.iframe_) {
          setStyle(this.iframe_, 'zIndex', 0);
          this.togglePlaceholder(false);
        }
      });
    }
  }
}

AMP.extension('amp-wordpress-embed', '0.1', AMP => {
  AMP.registerElement('amp-wordpress-embed', AmpWordPressEmbed);
});
