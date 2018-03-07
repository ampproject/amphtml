/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {Services} from '../../../src/services';
import {getIframe} from '../../../src/3p-frame';
import {isLayoutSizeDefined} from '../../../src/layout';
import {user} from '../../../src/log';

/** @private @const {string} */
const TAG = 'amp-embedly';

/**
 * @const {string}
 */
const BASE_API_URL = 'https://api.embedly.com/1/oembed?';

/**
 * Regex used to extract src from returned oEmbed data.
 * @const {RegExp}
 * */
const SRC_REGEXP = /src="([^"]+)"/;

/**
 * oEmbed resource types.
 * @const {Readonly<{PHOTO: string, VIDEO: string, LINK: string, RICH: string}>}
 */
const resourceType = Object.freeze({
  PHOTO: 'photo',
  VIDEO: 'video',
  LINK: 'link',
  RICH: 'rich',
});

/**
 * Implementation of the amp-embedly component.
 * See {@link ../amp-embedly.md} for the spec.
 */
export class AmpEmbedly extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @const @private {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = Services.xhrFor(this.win);

    /** @private {?string}  */
    this.key_ = null;

    /** @private {?string}  */
    this.url_ = null;

    /** @private {?Element} */
    this.iframe_ = null;

    this.getIframe_ = this.getIframe_.bind(this);
  }

  /** @override */
  buildCallback() {
    this.key_ = user().assert(
        this.element.getAttribute('data-key'),
        `The data-key attribute is required for <${TAG}> %s`,
        this.element
    );

    this.url_ = user().assert(
        this.element.getAttribute('data-url'),
        `The data-url attribute is required for <${TAG}> %s`,
        this.element
    );

    return this.getOembedData_().then(this.getIframe_).then(iframe => {
      this.iframe_ = iframe;
      this.element.appendChild(iframe);

      return this.loadPromise(iframe);
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /**
   * Fetches oEmbed data from embedly's api.
   * @return {!Promise<!JsonObject>}
   * */
  getOembedData_() {
    const query = `key=${this.key_}&url=${encodeURIComponent(this.url_)}`;

    return this.xhr_.fetchJson(BASE_API_URL + query, {
      requireAmpResponseSourceOrigin: false,
    }).then(res => res.json());
  }

  /**
   * Gets component iframe with set source based on data type.
   *
   * @param {!JsonObject} data
   * @returns {?Promise<!JsonObject>}
   * @private
   */
  getIframe_(data) {
    const iframe = getIframe(this.win, this.element, 'embedly');
    this.applyFillContent(iframe);

    /** @type {string} */
    let src;

    switch (data.type) {
      // For these types, embedly returns an iframe or html + script that must be loaded.
      case resourceType.VIDEO:
      case resourceType.RICH: {
        const match = data.html.match(SRC_REGEXP);

        user().assert(
            match, `src not found in embedly response: "${data.html}"`
        );

        const srcUrl = `https:${match[1]}`;

        if (data.html.startsWith('<iframe')) {
          src = srcUrl;
          break;
        }

        src = this.createObjectUrl_(data.html);

        iframe.onload = function() {
          const win = this.contentWindow.window;
          const script = win.document.createElement('script');
          script.src = srcUrl;
          win.document.body.appendChild(script);

          iframe.readyState = 'complete';
        };

        break;
      }

      case resourceType.PHOTO: {
        const {url, height, width} = data;
        const html = `<img src="${url}" height="${height}" width="${width}">`;

        src = this.createObjectUrl_(html);
        break;
      }

      case resourceType.LINK: {
        // TODO
        break;
      }
    }

    iframe.src = src;

    return Promise.resolve(iframe);
  }

  /**
   * Gets object url from given html.
   * @param {string} html
   * @private
   */
  createObjectUrl_(html) {
    const fileParts = new Blob([html], {type: 'text/html'});
    return URL.createObjectURL(fileParts);
  }
}

AMP.registerElement(TAG, AmpEmbedly);
