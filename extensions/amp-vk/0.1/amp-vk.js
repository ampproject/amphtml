/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {Layout} from '../../../src/layout';
import {user} from '../../../src/log';
import {removeElement} from '../../../src/dom';
import {listen} from '../../../src/event-helper';

export class AmpVk extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?String} */
    this.iframeUrl_ = 'https://vk.com/widget_post.php';

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?Promise} */
    this.iframePromise_ = null;

    /** @private {?Number} */
    this.height_ = 0;

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    this.pageReferrer_ = this.element.ownerDocument.referrer;
    this.pageUrl_ = this.element.ownerDocument
        .location.href.replace(/#.*$/, '');
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url('https://vk.com', opt_onLayout);
  }

  getIFrameSrc() {
    let queryString = this.iframeUrl_;

    const queryParams = this.getIframeParameters();

    let i = 0;
    for (const param in queryParams) {
      const divider = i++ === 0 ? '?' : '&';
      queryString += `${divider}${param}=${
          encodeURIComponent(queryParams[param])}`;
    }
    return queryString;
  }

  getIframeParameters() {
    return {
      'app': 0,
      'width': '100%',
      'startWidth': this.element.offsetWidth,
      '_ver': 1,
      'owner_id': this.ownerId_,
      'post_id': this.postId_,
      'hash': this.hash_,
      'url': this.pageUrl_,
      'referrer': this.pageReferrer_,
      'title': '',
    };
  }

  /** @override */
  buildCallback() {
    user().assert(this.element.getAttribute('data-hash'),
        'The data-hash attribute is required for <amp-vk-3p> %s',
        this.element);

    user().assert(this.element.getAttribute('data-ownerid'),
        'The data-ownerid attribute is required for <amp-vk-3p> %s',
        this.element);

    user().assert(this.element.getAttribute('data-postid'),
        'The data-postid attribute is required for <amp-vk-3p> %s',
        this.element);

    this.ownerId_ = this.element.getAttribute('data-ownerid');
    this.postId_ = this.element.getAttribute('data-postid');
    this.hash_ = this.element.getAttribute('data-hash');
  }

  /** @override */
  layoutCallback() {
    const iframe = this.element.ownerDocument.createElement('iframe');
    this.iframe_ = iframe;

    this.unlistenMessage_ = listen(
        this.win,
        'message',
        this.handleVkIframeMessage_.bind(this)
    );

    iframe.src = this.getIFrameSrc();
    iframe.setAttribute('name', 'fXD');
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('frameborder', '0');

    this.applyFillContent(iframe);
    this.element.appendChild(iframe);

    return this.iframePromise_ = this.loadPromise(iframe);
  }

  /**
   * @param {!Event} e
   * @private
   */
  handleVkIframeMessage_(e) {
    if (e.origin !== 'https://vk.com' ||
        e.source !== this.iframe_.contentWindow) {
      return;
    }
    const matches = e.data.match(/\[\"resize",\[(\d+)\]]/);
    if (matches && matches[1]) {
      const newHeight = parseInt(matches[1], 10);
      if (this.height_ !== newHeight) {
        this.height_ = newHeight;
        this./*OK*/changeHeight(newHeight);
      }
    }
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.RESPONSIVE ||
        layout === Layout.FLEX_ITEM ||
        layout === Layout.FIXED;
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
    if (this.unlistenMessage_) {
      this.unlistenMessage_();
    }
    return true;  // Call layoutCallback again.
  }
}

if (!window.isAmpVkRegistered) {
  AMP.extension('amp-vk', '0.1', AMP => {
    AMP.registerElement('amp-vk', AmpVk);
  });
  window.isAmpVkRegistered = true;
}
