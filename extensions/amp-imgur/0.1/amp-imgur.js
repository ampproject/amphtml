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
 * @fileoverview Embeds a imgur
 * Example:
 * <code>
 * <amp-imgur
 *   layout="reponsive"
 *   width="540"
 *   height="663"
 *   data-imgur-id="f462IUj">
 * </amp-imgur>
 * </code>
 */

import {Deferred} from '../../../src/core/data-structures/promise';
import {Services} from '../../../src/services';
import {createElementWithAttributes, removeElement} from '../../../src/dom';
import {getData, listen} from '../../../src/event-helper';
import {isLayoutSizeDefined} from '../../../src/layout';
import {isObject} from '../../../src/core/types';
import {tryParseJson} from '../../../src/core/types/object/json';
import {user, userAssert} from '../../../src/log';

const TAG = 'amp-imgur';

export class AmpImgur extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /** @private {?Function} */
    this.resolveReceivedMessage_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    userAssert(
      this.element.dataset.imgurId,
      'The data-imgur-id attribute is required for <amp-imgur> %s',
      this.element
    );
  }

  /** @override */
  layoutCallback() {
    this.unlistenMessage_ = listen(
      this.win,
      'message',
      this.handleImgurMessages_.bind(this)
    );

    const sanitizedId = this.element.dataset.imgurId.replace(
      /^(a\/)?(.*)/,
      (unusedMatch, aSlash, rest) => (aSlash || '') + encodeURIComponent(rest)
    );

    return this.insertLoadIframe_(sanitizedId)
      .catch((e) => {
        // Unfortunately, from May 2020 to May 2021 we incorrectly interpreted
        // any post id as an album id.
        // To maintain compatibility with this period, we retry with by adding
        // the a/ prefix when failing to load.
        // https://go.amp.dev/issue/28049
        if (sanitizedId.startsWith('a/')) {
          throw e;
        }
        const idWithPrefix = `a/${sanitizedId}`;
        return this.insertLoadIframe_(idWithPrefix).then(() => {
          user().warn(
            TAG,
            `id should be prefixed with "a/", loaded album using data-imgur-id="${idWithPrefix}". This element should be updated to use "a/".`
          );
        });
      })
      .catch(() => {
        user().error(TAG, `Failed to load. Is "${sanitizedId}" a correct id?`);
      });
  }

  /**
   * @param {string} id
   * @return {!Promise<HTMLIFrameElement>}
   * @private
   */
  insertLoadIframe_(id) {
    const {element} = this;

    const iframe = createElementWithAttributes(
      element.ownerDocument,
      'iframe',
      {
        'scrolling': 'no',
        'frameborder': '0',
        'allowfullscreen': 'true',
        'title': element.title || 'imgur post',
      }
    );

    iframe.src = `https://imgur.com/${id}/embed?pub=true`;

    if (this.iframe_) {
      // reloading
      element.removeChild(this.iframe_);
    }
    this.iframe_ = iframe;
    element.appendChild(iframe);

    this.applyFillContent(iframe);

    // We're sure we've loaded when we receive the first message.
    const {promise, resolve} = new Deferred();
    this.resolveReceivedMessage_ = resolve;

    return this.loadPromise(this.iframe_).then(() =>
      Services.timerFor(this.win).timeoutPromise(500, promise)
    );
  }

  /**
   * @param {!Event} event
   * @private
   * */
  handleImgurMessages_(event) {
    if (
      event.origin != 'https://imgur.com' ||
      event.source != this.iframe_.contentWindow
    ) {
      return;
    }
    const eventData = getData(event);
    if (
      !eventData ||
      !(
        isObject(eventData) || /** @type {string} */ (eventData).startsWith('{')
      )
    ) {
      return;
    }

    this?.resolveReceivedMessage_();

    const data = isObject(eventData) ? eventData : tryParseJson(eventData);
    if (data['message'] == 'resize_imgur') {
      const height = data['height'];
      this.attemptChangeHeight(height).catch(() => {});
    }
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

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpImgur);
});
