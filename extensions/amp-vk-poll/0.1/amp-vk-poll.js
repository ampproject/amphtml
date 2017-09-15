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
import {getData, listen} from '../../../src/event-helper';

export class AmpVkPoll extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?Promise} */
    this.iframePromise_ = null;

    /** @private {?string} */
    this.iframeUrl_ = 'https://vk.com/al_widget_poll.php';

    /** @private {?number} */
    this.widgetHeight_ = 0;

    /** @private {?String} */
    this.apiId_ = null;

    /** @private {?String} */
    this.pollId_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;
  }

  getIFrameSrc(apiId, pollId) {
    const pageUrl = this.element.ownerDocument
        .location.href.replace(/#.*$/, '');
    const pageReferrer = this.element.ownerDocument.referrer;
    const createdTime = Number(new Date()).toString(16);

    let q = '';
    let src = this.iframeUrl_;

    const queryParams = {
      'app': apiId,
      'width': '100%',
      '_ver': 1,
      'poll_id': pollId,
      'amp': 1,
      'url': pageUrl,
      'title': 'AMP Poll',
      'description': '',
      'referrer': pageReferrer,
    };

    for (const param in queryParams) {
      q += `&${param}=${encodeURIComponent(queryParams[param])}`;
    }

    src += `?${q.substr(1)}&${createdTime}`;

    return src;
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

    iframe.src = this.getIFrameSrc(this.apiId_, this.pollId_);
    iframe.setAttribute('name', 'fXD');
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('frameborder', '0');

    this.applyFillContent(iframe);
    this.element.appendChild(iframe);

    return this.iframePromise_ = this.loadPromise(iframe);
  }

  /** @override */
  buildCallback() {
    user().assert(this.element.getAttribute('data-api_id'),
        'The data-api_id attribute is required for <amp-vk-poll> %s',
        this.element);

    user().assert(this.element.getAttribute('data-poll_id'),
        'The data-poll_id attribute is required for <amp-vk-poll> %s',
        this.element);

    this.pollId_ = this.element.getAttribute('data-poll_id');
    this.apiId_ = this.element.getAttribute('data-api_id');
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

AMP.extension('amp-vk-poll', '0.1', AMP => {
  AMP.registerElement('amp-vk-poll', AmpVkPoll);
});
