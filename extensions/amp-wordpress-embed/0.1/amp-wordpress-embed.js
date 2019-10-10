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
 * The messages being sent by WordPress have event data consisting of an object with keys for 'message' and 'value'.
 * The 'message' can be either 'height' or 'link'.
 *
 * The 'height' message event data looks like this:
 *
 * <code>
 * {"message":"height", "value":356}
 * </code>
 *
 * WordPress enforces a minimum height of 200px and a maximum height of 1000px.
 *
 * The 'link' message event data looks like this:
 *
 * <code>
 * {"message":"link", "value":"https://wordpress.org/news/2017/11/tipton/"}
 * </code>
 *
 * WordPress will only navigate the user to the URL in such a message if it is the same origin as the URL of the
 * WordPress post being embedded and if the iframe is currently active.
 *
 * @see https://core.trac.wordpress.org/browser/tags/5.2.3/src/js/_enqueues/lib/embed-template.js
 * @see https://core.trac.wordpress.org/browser/tags/5.2.3/src/js/_enqueues/wp/embed.js
 *
 * Example:
 * <code>
 * <amp-wordpress-embed
 *   layout="fixed-height"
 *   data-url="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/"
 *   height="200"
 * >
 *   <blockquote placeholder>
 *     <a href="https://make.wordpress.org/core/2015/10/28/new-embeds-feature-in-wordpress-4-4/">
 *       New Embeds Feature in WordPress 4.4
 *     </a>
 *   </blockquote>
 *   <button overflow>Expand</button>
 * </amp-wordpress-embed>
 * </code>
 */

import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {addParamToUrl} from '../../../src/url';
import {getData, listen} from '../../../src/event-helper';
import {removeElement} from '../../../src/dom';
import {setStyle} from '../../../src/style';
import {userAssert} from '../../../src/log';

/** @type {number}  */
let count = 0;

export class AmpWordPressEmbed extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {?Function} */
    this.unlisten_ = null;

    /** @private {?string} */
    this.url_ = null;

    /** @private {?Element} */
    this.placeholder_ = null;
  }

  /** @override */
  buildCallback() {
    const {element: el} = this;

    this.placeholder_ = this.getPlaceholder();

    this.url_ = el.getAttribute('data-url');

    userAssert(this.url_, 'The data-url attribute is required for %s', el);
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    if (this.url_) {
      this.preconnect.url(this.url_, opt_onLayout);
    }
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

    if (!this.url_) {
      return;
    }

    const url = addParamToUrl(this.url_, 'embed', 'true');
    const frame = this.element.ownerDocument.createElement('iframe');
    this.iframe_ = /** @type {HTMLIFrameElement} */ (frame);
    frame.setAttribute('frameborder', 0);
    frame.setAttribute('scrolling', 'no');
    // Note that allow-same-origin cannot be used for sake of same-origin post embeds.
    frame.setAttribute('sandbox', 'allow-scripts');
    this.applyFillContent(frame);

    frame.name = 'amp_wordpress_embed' + count++;
    frame.src = Services.urlForDoc(el).assertHttpsUrl(url, el);

    frame.onload = () => {
      // Chrome does not reflect the iframe readystate.
      frame.readyState = 'complete';
      this.activateIframe_();
    };

    // Listen for messages sent by wp.sendEmbedMessage() inside the WordPress iframe.
    this.unlisten_ = listen(
      window,
      'message',
      this.handleMessageEvent_.bind(this)
    );

    this.element.appendChild(frame);

    return this.loadPromise(frame);
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

  /**
   * Handle message event.
   *
   * @param {MessageEvent} event
   * @private
   */
  handleMessageEvent_(event) {
    if (!this.iframe_ || event.source !== this.iframe_.contentWindow) {
      return;
    }
    const data = getData(event);

    if (
      'undefined' === typeof data['message'] ||
      'undefined' === typeof data['value']
    ) {
      return;
    }

    switch (data['message']) {
      case 'height':
        if (typeof data['value'] === 'number') {
          // Make sure the new height is between 200px and 1000px.
          // This replicates a constraint in WordPress's wp.receiveEmbedMessage() function.
          const newHeight = Math.min(Math.max(data['value'], 200), 1000);
          this.attemptChangeSize(newHeight, undefined).then(
            () => {
              this./*OK*/ changeHeight(newHeight);
            },
            () => {}
          );
        }
        break;
      case 'link':
        // Only follow a link message for the currently-active iframe if the link is for the same origin.
        // This replicates a constraint in WordPress's wp.receiveEmbedMessage() function.
        if (
          document.activeElement &&
          document.activeElement.contentWindow === event.source &&
          typeof data['value'] === 'string' &&
          this.hasSameOrigin_(data['value'])
        ) {
          const embeddedUrl = new URL(this.url_);
          const requestedUrl = new URL(data['value']);
          if (embeddedUrl.origin === requestedUrl.origin) {
            window.top.location.href = requestedUrl.href;
          }
        }
        break;
    }
  }

  /**
   * Check if the supplied URL has the same origin as the embedded iframe.
   *
   * @param {string} url
   * @return {boolean}
   * @private
   */
  hasSameOrigin_(url) {
    const embeddedUrl = new URL(this.url_);
    const checkedUrl = new URL(url);
    return embeddedUrl.origin === checkedUrl.origin;
  }

  /**
   * @override
   */
  unlayoutCallback() {
    if (this.unlisten_) {
      this.unlisten_();
      this.unlisten_ = null;
    }
    if (this.iframe_) {
      removeElement(this.iframe_);
      if (this.placeholder_) {
        this.togglePlaceholder(true);
      }
      this.iframe_ = null;
    }
    return true;
  }
}

AMP.extension('amp-wordpress-embed', '0.1', AMP => {
  AMP.registerElement('amp-wordpress-embed', AmpWordPressEmbed);
});
