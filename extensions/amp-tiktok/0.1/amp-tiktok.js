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
  /** @override @nocollapse */
  static createLoaderLogoCallback(element) {
    const html = htmlFor(element);
    return {
      color: '#000000',
      content: html`
        <svg
          width="44"
          height="44"
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0)">
            <path
              d="M30.9763 15.9295C33.829 17.9653 37.3237 19.1631 41.0982 19.1631V11.9122C40.3839 11.9124 39.6714 11.838 38.9725 11.6902V17.3977C35.1984 17.3977 31.7041 16.1999 28.8506 14.1643V28.9611C28.8506 36.3632 22.8398 42.3634 15.4255 42.3634C12.6591 42.3634 10.0878 41.5285 7.95178 40.0965C10.3897 42.585 13.7894 44.1287 17.5507 44.1287C24.9655 44.1287 30.9766 38.1285 30.9766 30.7261V15.9295H30.9763V15.9295ZM33.5985 8.61433C32.1406 7.02429 31.1834 4.96945 30.9763 2.69775V1.76514H28.9619C29.469 4.65248 31.1984 7.11925 33.5985 8.61433ZM12.6413 34.4164C11.8268 33.3502 11.3866 32.0459 11.3886 30.7049C11.3886 27.3194 14.1379 24.5744 17.5298 24.5744C18.1619 24.5743 18.7903 24.6709 19.3927 24.8617V17.4488C18.6887 17.3525 17.9782 17.3116 17.2679 17.3266V23.0965C16.6651 22.9056 16.0364 22.8087 15.4041 22.8093C12.0122 22.8093 9.26306 25.554 9.26306 28.9399C9.26306 31.334 10.6373 33.4067 12.6413 34.4164Z"
              fill="#FF004F"
            />
            <path
              d="M28.8505 14.1641C31.704 16.1997 35.1983 17.3975 38.9724 17.3975V11.6901C36.8657 11.2421 35.0007 10.143 33.5984 8.61433C31.1982 7.11909 29.4689 4.65232 28.9618 1.76514H23.6706V30.7258C23.6586 34.102 20.914 36.8357 17.5294 36.8357C15.5349 36.8357 13.763 35.8866 12.6408 34.4164C10.6369 33.4067 9.26266 31.3338 9.26266 28.94C9.26266 25.5544 12.0118 22.8095 15.4037 22.8095C16.0536 22.8095 16.68 22.9105 17.2675 23.0966V17.3268C9.9835 17.477 4.12537 23.4186 4.12537 30.7259C4.12537 34.3737 5.58418 37.6805 7.95184 40.0967C10.0878 41.5285 12.6591 42.3636 15.4256 42.3636C22.84 42.3636 28.8507 36.3631 28.8507 28.9611V14.1641H28.8505Z"
              fill="black"
            />
            <path
              d="M38.9726 11.69V10.1468C37.0728 10.1497 35.2104 9.61856 33.5986 8.61416C35.0254 10.1736 36.9042 11.2489 38.9726 11.69ZM28.962 1.76512C28.9136 1.48918 28.8765 1.21143 28.8507 0.932611V0H21.545V28.9609C21.5333 32.3367 18.7888 35.0704 15.4039 35.0704C14.4101 35.0704 13.4718 34.8349 12.6409 34.4165C13.7631 35.8866 15.535 36.8356 17.5296 36.8356C20.9139 36.8356 23.659 34.1021 23.6708 30.7259V1.76512H28.962ZM17.268 17.3268V15.6839C16.6575 15.6006 16.0421 15.5588 15.4259 15.5591C8.01082 15.5589 2 21.5594 2 28.9609C2 33.6013 4.36236 37.6908 7.95215 40.0964C5.58448 37.6803 4.12567 34.3733 4.12567 30.7257C4.12567 23.4186 9.98365 17.477 17.268 17.3268Z"
              fill="#00F2EA"
            />
          </g>
          <defs>
            <clipPath id="clip0">
              <rect width="44" height="44" fill="white" />
            </clipPath>
          </defs>
        </svg>
      `,
    };
  }

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
