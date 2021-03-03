/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {Layout, isLayoutSizeDefined} from '../../../src/layout';
import {Services} from '../../../src/services';
import {
  childElementByTag,
  createElementWithAttributes,
  removeElement,
} from '../../../src/dom';
import {debounce} from '../../../src/utils/rate-limit';
import {getData, listen} from '../../../src/event-helper';
import {resetStyles, setStyle, setStyles} from '../../../src/style';
import {tryParseJson} from '../../../src/json';

export class AmpTiktok extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {!Element} */
    this.iframe_ = null;

    /** @private {string} */
    this.videoId_ = null;

    /** @private {?Function}*/
    this.unlistenMessage_ = null;

    this.resizeOuter_ = debounce(
      this.win,
      (height) => {
        resetStyles(this.iframe_, [
          'width',
          'height',
          'position',
          'opacity',
          'pointer-events',
        ]);
        this.iframe_.removeAttribute('aria-hidden');
        this.iframe_.setAttribute('aria-title', 'Tiktok');
        this.applyFillContent(this.iframe_);
        this.forceChangeHeight(height);
      },
      1000
    );
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    //See
    //https://developers.tiktok.com/doc/Embed
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://www.tiktok.com',
      opt_onLayout
    );
  }

  /** @override */
  buildCallback() {
    const {src} = this.element.dataset;
    if (src) {
      this.videoId_ = src.replace(/^((.+\/)?)(\d+)\/?$/, (_, _1, _2, id) => id);
    } else {
      const blockquoteOrNull = childElementByTag(this.element, 'blockquote');
      if (
        !blockquoteOrNull ||
        !blockquoteOrNull.hasAttribute('placeholder') ||
        !blockquoteOrNull.dataset.videoId
      ) {
        return;
      }
      this.videoId_ = blockquoteOrNull.dataset.videoId;
    }
  }

  /** @override */
  layoutCallback() {
    const iframe = this.element.ownerDocument.createElement('iframe');
    const {locale = 'en-US'} = this.element.dataset;
    const src = `https://www.tiktok.com/embed/v2/${encodeURIComponent(
      this.videoId_
    )}?lang=${encodeURIComponent(locale)}`;
    this.iframe_ = iframe;

    this.unlistenMessage_ = listen(
      this.win,
      'message',
      this.handleTiktokMessages_.bind(this)
    );

    this.iframe_.src = src;
    this.iframe_.setAttribute('name', '__tt_embed__v$');
    this.iframe_.setAttribute('aria-hidden', 'true');
    this.iframe_.setAttribute('frameborder', '0');
    setStyles(this.iframe_, {
      'position': 'fixed',
      'opacity': '0',
      'pointer-events': 'none',
    });

    this.element.appendChild(iframe);
    return this.loadPromise(iframe);
  }

  /**
   * @param {!Event} event
   * @private
   */
  handleTiktokMessages_(event) {
    if (
      event.origin != 'https://www.tiktok.com' ||
      event.source != this.iframe_.contentWindow
    ) {
      return;
    }
    const data = tryParseJson(getData(event));
    if (!data || data === undefined) {
      return;
    }
    if (data['height']) {
      this.resizeOuter_(data['height']);
      setStyle(this.iframe_, 'width', `${data['width']}px`);
      setStyle(this.iframe_, 'height', `${data['height']}px`);
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
    return true; // layout again
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }
}

AMP.extension('amp-tiktok', '0.1', (AMP) => {
  AMP.registerElement('amp-tiktok', AmpTiktok, CSS);
});
