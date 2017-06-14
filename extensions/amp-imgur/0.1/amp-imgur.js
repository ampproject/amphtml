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

import {user} from '../../../src/log';
import {isLayoutSizeDefined} from '../../../src/layout';
import {removeElement} from '../../../src/dom';
import {tryParseJson} from '../../../src/json';
import {isObject} from '../../../src/types';
import {listen} from '../../../src/event-helper';
import {startsWith} from '../../../src/string';

export class AmpImgur extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /** @private {?string} */
    this.imgurid_ = '';
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.imgurid_ = user().assert(
        this.element.getAttribute('data-imgur-id'),
        'The data-imgur-id attribute is required for <amp-imgur> %s',
        this.element);
  }

  /** @override */
  layoutCallback() {
    const iframe = this.element.ownerDocument.createElement('iframe');
    this.iframe_ = iframe;

    this.unlistenMessage_ = listen(
        this.win,
        'message',
        this.hadleImgurMessages_.bind(this)
    );

    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');

    iframe.src = 'https://imgur.com/a/' +
      encodeURIComponent(this.imgurid_) + '/embed?pub=true';
    this.applyFillContent(iframe);
    this.element.appendChild(iframe);
    return this.loadPromise(iframe);
  }

  /** @private */
  hadleImgurMessages_(event) {
    if (event.origin != 'https://imgur.com' ||
        event.source != this.iframe_.contentWindow) {
      return;
    }
    if (!event.data || !(isObject(event.data)) || startsWith(event.data, '{')) {
      return;
    }
    const data = isObject(event.data) ? event.data : tryParseJson(event.data);
    if (data.message == 'resize_imgur') {
      const height = data.height;
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
    return true;  // Call layoutCallback again.
  }

}

AMP.registerElement('amp-imgur', AmpImgur);
