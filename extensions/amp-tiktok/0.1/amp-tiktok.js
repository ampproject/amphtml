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
import {measureIntersection} from '../../../src/utils/intersection';

export class AmpTiktok extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {!Element} */
    this.iframe_ = null;

    /** @private {string} */
    this.videoId_ = null;

    /** @private {string} */
    this.oEmbedRequestUrl_ = null;

    /** @private {Promise} */
    this.oEmbedResponsePromise_ = null;
  }

  /** @override */
  buildCallback() {
    const {src} = this.element.dataset;
    if (src) {
      this.videoId_ = src.replace(/^((.+\/)?)(\d+)\/?$/, (_, _1, _2, id) => id);
      this.oEmbedRequestUrl_ = this.videoId_ !== src ? src : null;
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
      this.oEmbedRequestUrl_ = blockquoteOrNull.dataset.cite;
    }
  }

  /** @override */
  layoutCallback() {
    const {locale} = this.element.dataset;
    const iframeUrl = `https://www.tiktok.com/embed/v2/${encodeURIComponent(
      this.videoId_
    )}?lang=${encodeURIComponent(locale)}`;

    const iframe = createElementWithAttributes(
      this.element.ownerDocument,
      'iframe',
      {
        'src': iframeUrl,
        'name': '',
        'aria-title': 'Tiktok',
        'frameborder': '0',
      }
    );

    Promise.resolve(this.oEmbedResponsePromise_).then((data) => {
      if (data && data.title) {
        iframe.setAttribute('aria-title', `TikTok: ${data.title}`);
      }
    });

    this.applyFillContent(iframe);
    this.element.appendChild(iframe);
    this.iframe_ = iframe;
  }

  /** @override */
  createPlaceholderCallback() {
    if (!this.oEmbedRequestUrl_) {
      return null;
      console.log('no oembed url');
    }

    const placeholder = document.createElement('div');
    placeholder.setAttribute('placeholder', '');
    placeholder.setAttribute('style', 'background: rgba(220, 220, 220, 0.6');

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
              'style':
                'aspect-ratio: 0.5625;' +
                'left: 1px;' +
                'top: 1px;' +
                'width: calc(100% - 2px',
            }
          );

          if (placeholder.parentElement) {
            placeholder.appendChild(img);
          }
        }
        console.log('thumbnail: ' + thumbnailUrl);
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
    return true; // layout again
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  firstLayoutCompleted() {}
}

AMP.extension('amp-tiktok', '0.1', (AMP) => {
  AMP.registerElement('amp-tiktok', AmpTiktok, CSS);
});
