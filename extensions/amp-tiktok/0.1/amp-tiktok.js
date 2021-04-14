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
import {Deferred} from '../../../src/utils/promise';
import {Services} from '../../../src/services';
import {
  childElementByTag,
  createElementWithAttributes,
  removeElement,
} from '../../../src/dom';
import {debounce} from '../../../src/utils/rate-limit';
import {getData, listen} from '../../../src/event-helper';
import {htmlFor} from '../../../src/static-template';
import {isLayoutSizeDefined} from '../../../src/layout';
import {px, resetStyles, setStyles} from '../../../src/style';
import {tryParseJson} from '../../../src/json';

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

    /** @private {string} */
    this.oEmbedRequestUrl_ = null;

    /** @private {Promise} */
    this.oEmbedResponsePromise_ = null;

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

  /** @override @nocollapse */
  static createLoaderLogoCallback(element) {
    const html = htmlFor(element);
    return {
      color: '#000000',
      content: html`
        <svg
          width="44"
          height="44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0)">
            <path
              d="M30.976 15.93a17.366 17.366 0 0010.122 3.233v-7.25a10.26 10.26 0 01-2.126-.223v5.708a17.37 17.37 0 01-10.121-3.234v14.797c0 7.402-6.011 13.402-13.425 13.402-2.767 0-5.338-.834-7.474-2.267a13.395 13.395 0 009.599 4.033c7.415 0 13.426-6 13.426-13.403V15.93zM33.6 8.614a10.098 10.098 0 01-2.623-5.916v-.933h-2.014a10.151 10.151 0 004.637 6.85zM12.64 34.416a6.099 6.099 0 01-1.252-3.711c0-3.386 2.749-6.13 6.14-6.13.633 0 1.261.096 1.864.287v-7.413a13.565 13.565 0 00-2.125-.122v5.77a6.154 6.154 0 00-1.864-.288 6.129 6.129 0 00-2.763 11.607z"
              fill="#FF004F"
            />
            <path
              d="M28.85 14.164a17.37 17.37 0 0010.122 3.234V11.69a10.165 10.165 0 01-5.374-3.076 10.151 10.151 0 01-4.636-6.849H23.67v28.96a6.137 6.137 0 01-6.142 6.11 6.136 6.136 0 01-4.888-2.419 6.13 6.13 0 012.763-11.606c.65 0 1.276.1 1.863.287v-5.77c-7.284.15-13.142 6.092-13.142 13.399 0 3.648 1.46 6.955 3.827 9.37a13.378 13.378 0 007.474 2.268c7.414 0 13.425-6 13.425-13.403V14.164z"
              fill="#000"
            />
            <path
              d="M38.973 11.69v-1.543c-1.9.003-3.763-.528-5.374-1.533a10.154 10.154 0 005.374 3.076zM28.962 1.765a10.326 10.326 0 01-.111-.832V0h-7.306v28.96a6.136 6.136 0 01-6.141 6.11 6.125 6.125 0 01-2.763-.654 6.136 6.136 0 004.889 2.42 6.137 6.137 0 006.14-6.11V1.766h5.292zM17.268 17.327v-1.643a13.576 13.576 0 00-1.842-.125C8.01 15.56 2 21.56 2 28.961c0 4.64 2.362 8.73 5.952 11.135a13.345 13.345 0 01-3.826-9.37c0-7.307 5.858-13.249 13.142-13.4z"
              fill="#00F2EA"
            />
          </g>
          <defs>
            <clipPath id="clip0">
              <path fill="#fff" d="M0 0h44v44H0z" />
            </clipPath>
          </defs>
        </svg>
      `,
    };
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
      this.oEmbedRequestUrl_ = this.videoId_ !== src ? src : null;
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
      this.oEmbedRequestUrl_ = blockquoteOrNull.dataset.cite;
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

    Promise.resolve(this.oEmbedResponsePromise_).then((data) => {
      if (data && data.title) {
        iframe.setAttribute('aria-title', `TikTok: ${data.title}`);
      }
    });

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
  createPlaceholderCallback() {
    if (!this.oEmbedRequestUrl_) {
      return null;
    }

    const placeholder = document.createElement('div');
    placeholder.setAttribute('placeholder', '');
    const imageContainer = document.createElement('div');
    imageContainer.setAttribute(
      'class',
      'i-amphtml-tiktok-placeholder-image-container'
    );

    const oEmbedRequestUrl = encodeURIComponent(this.oEmbedRequestUrl_);
    this.oEmbedResponsePromise_ = Services.xhrFor(this.win)
      .fetchJson(`https://www.tiktok.com/oembed?url=${oEmbedRequestUrl}`)
      .then((response) => response.json())
      .then((data) => {
        const {'thumbnail_url': thumbnailUrl} = data;
        if (thumbnailUrl) {
          const img = createElementWithAttributes(
            this.element.ownerDocument,
            'img',
            {
              'src': thumbnailUrl,
              'placeholder': thumbnailUrl,
              'class': 'i-amphtml-tiktok-placeholder-image',
            }
          );

          if (placeholder.parentElement) {
            imageContainer.appendChild(img);
            placeholder.appendChild(imageContainer);
          }
        }
        return data;
      });

    return placeholder;
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
