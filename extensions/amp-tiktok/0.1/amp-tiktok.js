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

import {CSS} from '../../../build/amp-tiktok-0.1.css';
import {Deferred} from '../../../src/core/data-structures/promise';
import {Services} from '../../../src/services';
import {childElementByTag} from '../../../src/core/dom/query';
import {createElementWithAttributes, removeElement} from '../../../src/dom';
import {debounce} from '../../../src/core/types/function';
import {getData, listen} from '../../../src/event-helper';
import {isLayoutSizeDefined} from '../../../src/layout';
import {px, resetStyles, setStyles} from '../../../src/style';
import {tryParseJson} from '../../../src/core/types/object/json';

let id = 0;
const NAME_PREFIX = '__tt_embed__v';
const PLAYER_WIDTH = 325;
const ASPECT_RATIO = 1.77;
const COMMENT_HEIGHT = 200;

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

    /** @private {?Promise} */
    this.resolveReceivedFirstMessage_ = null;

    /** @private {string} */
    this.iframeNameString_ = this.getIframeNameString_();

    /**
     * @private {number}
     * This value is calculated by multiplying our fixed width (325px)
     * by the video aspect ratio (13:23 or 1.77) and adding 200px to account
     * for the height of the caption.
     */
    this.fallbackHeight_ = PLAYER_WIDTH * ASPECT_RATIO + COMMENT_HEIGHT;

    this.resizeOuter_ = (height) => {
      resetStyles(this.iframe_, [
        'width',
        'height',
        'position',
        'opacity',
        'pointer-events',
      ]);
      this.iframe_.removeAttribute('aria-hidden');
      this.iframe_.setAttribute('aria-label', 'Tiktok');
      this.iframe_.classList.remove('i-amphtml-tiktok-unresolved');
      this.iframe_.classList.add('i-amphtml-tiktok-centered');
      this.forceChangeHeight(height);
    };

    this.resizeOuterDebounced_ = debounce(
      this.win,
      (height) => {
        this.resizeOuter_(height);
      },
      1000
    );
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    /**
     * @see {@link https://developers.tiktok.com/doc/Embed}
     */
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
      // If the user provides a src attribute extract the video id from the src
      const videoIdRegex = /^((.+\/)?)(\d+)\/?$/;
      this.videoId_ = src.replace(videoIdRegex, '$3');
    } else {
      // If the user provides a blockquote element use the blockquote videoId as video id
      const blockquoteOrNull = childElementByTag(this.element, 'blockquote');
      if (
        !blockquoteOrNull ||
        !blockquoteOrNull.hasAttribute('placeholder') ||
        !blockquoteOrNull.dataset.videoId
      ) {
        // If the blockquote is not a placeholder or it does not contain a videoId
        // exit early and do not set this.videoId to this value.
        return;
      }
      this.videoId_ = blockquoteOrNull.dataset.videoId;
    }
  }

  /** @override */
  layoutCallback() {
    const {locale = 'en-US'} = this.element.dataset;
    const src = `https://www.tiktok.com/embed/v2/${encodeURIComponent(
      this.videoId_
    )}?lang=${encodeURIComponent(locale)}`;

    const iframe = createElementWithAttributes(
      this.element.ownerDocument,
      'iframe',
      {
        'src': src,
        'name': this.iframeNameString_,
        'aria-hidden': 'true',
        'frameborder': '0',
        'class': 'i-amphtml-tiktok-unresolved',
      }
    );
    this.iframe_ = iframe;

    this.unlistenMessage_ = listen(
      this.win,
      'message',
      this.handleTiktokMessages_.bind(this)
    );

    this.element.appendChild(iframe);
    return this.loadPromise(iframe).then(() => {
      const {promise, resolve} = new Deferred();

      this.resolveRecievedFirstMessage_ = resolve;
      Services.timerFor(this.win)
        .timeoutPromise(1000, promise)
        .catch(() => {
          // If no resize messages are recieved the fallback is to
          // resize to the fallbackHeight value.
          this.resizeOuter_(this.fallbackHeight_);
          setStyles(this.iframe_, {
            'width': px(PLAYER_WIDTH),
            'height': px(this.fallbackHeight_),
          });
        });
    });
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
    if (!data) {
      return;
    }
    if (data['height']) {
      if (this.resolveReceivedFirstMessage_) {
        this.resolveReceivedFirstMessage_();
      }
      this.resizeOuterDebounced_(data['height']);
      setStyles(this.iframe_, {
        'width': px(data['width']),
        'height': px(data['height']),
      });
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
    return true;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /**
   * Return unique name with the appropriate prefix.
   * This name is defined by tiktok but is not documented on their site.
   * @private
   * @return {string}
   */
  getIframeNameString_() {
    let idString = (id++).toString();
    // The id is padded to 17 digits because that is what TikTok requires
    // in order to recieve messages correctly.
    while (idString.length < 17) {
      idString = '0' + idString;
    }
    return NAME_PREFIX + idString;
  }
}

AMP.extension('amp-tiktok', '0.1', (AMP) => {
  AMP.registerElement('amp-tiktok', AmpTiktok, CSS);
});
