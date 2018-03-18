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

/**
 * @enum {string}
 */
const EmbedType = {
  POST: 'post',
  POLL: 'poll',
};


import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {addParamsToUrl, appendEncodedParamStringToUrl} from '../../../src/url';
import {dict} from '../../../src/utils/object';
import {getData, listen} from '../../../src/event-helper';
import {removeElement} from '../../../src/dom';
import {user} from '../../../src/log';

export class AmpVk extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

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

    /** @private {?string} */
    this.apiId_ = null;

    /** @private {?string} */
    this.pollId_ = null;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url('https://vk.com', opt_onLayout);
  }

  /**
   * @return {Promise}
   * @private
   */
  getIFrameSrc_() {
    // cachebusting query parameter
    const createdTime = Date.now().toString(16);
    let iframeSrcPromise;

    if (this.embedType_ === EmbedType.POST) {
      iframeSrcPromise = this.getVkPostIFrameSrc_();
    } else if (this.embedType_ === EmbedType.POLL) {
      iframeSrcPromise = this.getVkPollIFrameSrc_();
    }

    return iframeSrcPromise.then(iframeSrc => {
      return appendEncodedParamStringToUrl(iframeSrc, createdTime);
    });
  }

  /**
   * @return {Promise}
   * @private
   */
  getVkPostIFrameSrc_() {
    return Services.viewerForDoc(this.element).getReferrerUrl().then(ref => {
      const startWidth = this.element./*OK*/offsetWidth;
      const pageUrl = this.getAmpDoc().getUrl();
      const iframeUrl = 'https://vk.com/widget_post.php';
      const queryParams = dict({
        'app': '0',
        'width': '100%',
        '_ver': '1',
        'owner_id': this.ownerId_,
        'post_id': this.postId_,
        'hash': this.hash_,
        'amp': '1',
        'startWidth': startWidth,
        'url': pageUrl,
        'referrer': ref,
        'title': 'AMP Post',
      });

      return addParamsToUrl(iframeUrl, queryParams);
    });
  }

  /**
   * @return {Promise}
   * @private
   */
  getVkPollIFrameSrc_() {
    return Services.viewerForDoc(this.element).getReferrerUrl().then(ref => {
      const pageUrl = this.getAmpDoc().getUrl();
      const iframeUrl = 'https://vk.com/al_widget_poll.php';
      const queryParams = dict({
        'app': this.apiId_,
        'width': '100%',
        '_ver': '1',
        'poll_id': this.pollId_,
        'amp': '1',
        'url': pageUrl,
        'title': 'AMP Poll',
        'description': '',
        'referrer': ref,
      });

      return addParamsToUrl(iframeUrl, queryParams);
    });
  }

  /** @override */
  buildCallback() {
    this.embedType_ = user().assert(this.element.getAttribute('data-embedtype'),
        'The data-embedtype attribute is required for <amp-vk> %s',
        this.element);

    user().assertEnumValue(EmbedType, this.embedType_, 'data-embedtype');

    if (this.embedType_ === EmbedType.POST) {
      this.postBuildCallback_();
    } else if (this.embedType_ === EmbedType.POLL) {
      this.pollBuildCallback_();
    }
  }

  /** @private */
  postBuildCallback_() {
    this.ownerId_ = user().assert(this.element.getAttribute('data-owner-id'),
        'The data-owner-id attribute is required for <amp-vk> Post %s',
        this.element);

    this.postId_ = user().assert(this.element.getAttribute('data-post-id'),
        'The data-post-id attribute is required for <amp-vk> Post %s',
        this.element);

    this.hash_ = user().assert(this.element.getAttribute('data-hash'),
        'The data-hash attribute is required for <amp-vk> Post %s',
        this.element);
  }

  /** @private */
  pollBuildCallback_() {
    this.apiId_ = user().assert(this.element.getAttribute('data-api-id'),
        'The data-api-id attribute is required for <amp-vk> Poll %s',
        this.element);

    this.pollId_ = user().assert(this.element.getAttribute('data-poll-id'),
        'The data-poll-id attribute is required for <amp-vk> Poll %s',
        this.element);
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

    return this.getIFrameSrc_().then(src => {
      iframe.src = src;
      iframe.setAttribute('name', 'fXD');
      iframe.setAttribute('scrolling', 'no');
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowfullscreen', 'true');

      this.applyFillContent(iframe);
      this.element.appendChild(iframe);

      return this.loadPromise(iframe);
    });
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
    }
    if (this.unlistenMessage_) {
      this.unlistenMessage_();
    }
    return true; // Call layoutCallback again.
  }
}

AMP.extension('amp-vk', '0.1', AMP => {
  AMP.registerElement('amp-vk', AmpVk);
});
