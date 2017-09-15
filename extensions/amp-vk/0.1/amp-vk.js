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

const embedTypes = {
  POST: 'post',
  POLL: 'poll',
};


import {Layout} from '../../../src/layout';
import {user} from '../../../src/log';
import {removeElement} from '../../../src/dom';
import {getData, listen} from '../../../src/event-helper';

export class AmpVk extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?string} */
    this.iframeUrl_ = null;

    /** @private {?Object} */
    this.iframeParams_ = null;

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?Promise} */
    this.iframePromise_ = null;

    /** @private {?number} */
    this.widgetHeight_ = 0;

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /** @private {?string} */
    this.embedType_ = null;

    /** @private {?string} */
    this.ownerId_ = null;

    /** @private {?string} */
    this.postId_ = null;

    /** @private {?string} */
    this.hash_ = null;

    /** @private {?String} */
    this.apiId_ = null;

    /** @private {?String} */
    this.pollId_ = null;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url('https://vk.com', opt_onLayout);
  }

  /** @private */
  getIFrameSrc_() {
    const startWidth = this.element./*OK*/offsetWidth;
    const pageUrl = this.element.ownerDocument
        .location.href.replace(/#.*$/, '');
    const pageReferrer = this.element.ownerDocument.referrer;
    const createdTime = Number(new Date()).toString(16);

    let q = '';
    let src, queryParams;

    if (this.embedType_ === embedTypes.POST) {
      src = 'https://vk.com/widget_post.php';
      queryParams = {
        'app': 0,
        'width': '100%',
        '_ver': 1,
        'owner_id': this.ownerId_,
        'post_id': this.postId_,
        'hash': this.hash_,
        'amp': 1,
        'startWidth': startWidth,
        'url': pageUrl,
        'referrer': pageReferrer,
        'title': 'AMP Post',
      };
    } else if (this.embedType_ === embedTypes.POLL) {
      src = 'https://vk.com/al_widget_poll.php';
      queryParams = {
        'app': this.apiId_,
        'width': '100%',
        '_ver': 1,
        'poll_id': this.pollId_,
        'amp': 1,
        'url': pageUrl,
        'title': 'AMP Poll',
        'description': '',
        'referrer': pageReferrer,
      };
    }

    for (const param in queryParams) {
      q += `&${param}=${encodeURIComponent(queryParams[param])}`;
    }

    src += `?${q.substr(1)}&${createdTime}`;

    return src;
  }

  /** @override */
  buildCallback() {
    user().assert(this.element.getAttribute('data-embedtype'),
        'The data-embedtype attribute is required for <amp-vk> %s',
        this.element);

    this.embedType_ = this.element.getAttribute('data-embedtype');

    if (this.embedType_ === embedTypes.POST) {
      this.postBuildCallback_();
    } else if (this.embedType_ === embedTypes.POLL) {
      this.pollBuildCallback_();
    }
  }

  /** @private */
  postBuildCallback_() {
    user().assert(this.element.getAttribute('data-hash'),
        'The data-hash attribute is required for <amp-vk> Post %s',
        this.element);

    user().assert(this.element.getAttribute('data-owner_id'),
        'The data-owner_id attribute is required for <amp-vk> Post %s',
        this.element);

    user().assert(this.element.getAttribute('data-post_id'),
        'The data-post_id attribute is required for <amp-vk> Post %s',
        this.element);

    this.ownerId_ = this.element.getAttribute('data-owner_id');
    this.postId_ = this.element.getAttribute('data-post_id');
    this.hash_ = this.element.getAttribute('data-hash');
  }

  /** @private */
  pollBuildCallback_() {
    user().assert(this.element.getAttribute('data-api_id'),
        'The data-api_id attribute is required for <amp-vk> Poll %s',
        this.element);

    user().assert(this.element.getAttribute('data-poll_id'),
        'The data-poll_id attribute is required for <amp-vk> Poll %s',
        this.element);
    this.pollId_ = this.element.getAttribute('data-poll_id');
    this.apiId_ = this.element.getAttribute('data-api_id');
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

    iframe.src = this.getIFrameSrc_();
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
    const eventData = getData(e);
    if (eventData) {
      const regExp = /\[\"resize",\[(\d+)\]]/;
      const matches = regExp.exec(eventData);
      if (matches && matches[1]) {
        const newHeight = parseInt(matches[1], 10);
        if (this.widgetHeight_ !== newHeight) {
          this.widgetHeight_ = newHeight;
          this./*OK*/changeHeight(newHeight);
        }
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

AMP.extension('amp-vk', '0.1', AMP => {
  AMP.registerElement('amp-vk', AmpVk);
});
