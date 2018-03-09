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
import {addParamsToUrl, assertHttpsUrl} from '../../../src/url';
import {dict} from '../../../src/utils/object';
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
 * @const @enum {string}
 */
const ResourceType = {
  LINK: 'link',
  PHOTO: 'photo',
  RICH: 'rich',
  VIDEO: 'video',
};

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
  }

  /** @override */
  layoutCallback() {
    const iframe = getIframe(this.win, this.element, 'embedly');
    this.iframe_ = iframe;

    return this.getOembedData_().then(data => {
      iframe.src = this.getIframeSrc_(data);
      this.applyFillContent(iframe);

      this.getVsync().mutate(() => this.element.appendChild(iframe));

      return this.loadPromise(iframe);
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /**
   * Fetches oEmbed data from embedly's api.
   * @return {!Promise}
   * */
  getOembedData_() {
    const params = dict({
      'key': this.key_,
      'url': this.url_,
      'secure': true, // To serve requested embeds with a SSL connection
      'scheme': 'https', // Request https embeds as default is protocol-less (//)
    });
    const url = addParamsToUrl(BASE_API_URL, params);

    return this.xhr_.fetchJson(url, {
      requireAmpResponseSourceOrigin: false,
    }).then(res => res.json());
  }

  /**
   * Gets the appropriate iframe source based on the oEmbed data resource type.
   *
   * @param {!JsonObject<{type: string, html: string, url: string}>} data
   * @returns {string}
   * @private
   */
  getIframeSrc_(data) {
    switch (data['type']) {
      case ResourceType.VIDEO:
        return this.getVideoSrc_(data['html']);
      case ResourceType.RICH:
        return this.getRichSrc_(data['html']);
      case ResourceType.PHOTO:
        return this.getPhotoSrc_(data['url'], data['width'], data['height']);
    }
  }

  /**
   * Get source for photo oEmbed resource type.
   *
   * @param {string} url
   * @param {string}width
   * @param {string} height
   * @returns {*}
   * @private
   */
  getPhotoSrc_(url, width, height) {
    assertHttpsUrl(url, this.element);
    const html = `<img src="${url}" height="${width}" width="${height}">`;

    return URL.createObjectURL(new Blob([html], {type: 'text/html'}));
  }

  /**
   * Get source for rich oEmbed resource type.
   *
   * @param {string} htmlData
   * @returns {string}
   * @private
   */
  getRichSrc_(htmlData) {
    let html = htmlData;
    if (html.indexOf('src="//') !== -1) {
      html = html.replace('src="//', 'src="https://');
    }

    return URL.createObjectURL(new Blob([html], {type: 'text/html'}));
  }

  /**
   * Get source for video oEmbed resource type.
   *
   * @param {string} html
   * @returns {string}
   * @private
   */
  getVideoSrc_(html) {
    const match = user().assert(
        html.match(SRC_REGEXP),
        'src not found in embedly html response: %s',
        html
    );

    return assertHttpsUrl(match[1], this.element);
  }
}

AMP.registerElement(TAG, AmpEmbedly);
