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

import {TAG as KEY_TAG} from './amp-embedly-key';
import {Layout} from '../../../src/layout';
import {getIframe} from '../../../src/3p-frame';
import {listenFor} from '../../../src/iframe-helper';
import {removeElement} from '../../../src/dom';
import {userAssert} from '../../../src/log';

/**
 * Component tag identifier.
 * @const {string}
 */
export const TAG = 'amp-embedly-card';

/**
 * Attribute name used to set api key with name
 * expected by embedly.
 * @const {string}
 */
const API_KEY_ATTR_NAME = 'data-card-key';

/**
 * Implementation of the amp-embedly-card component.
 * See {@link ../amp-embedly-card.md} for the spec.
 */
export class AmpEmbedlyCard extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {?string} */
    this.apiKey_ = null;
  }

  /** @override */
  buildCallback() {
    userAssert(
      this.element.getAttribute('data-url'),
      'The data-url attribute is required for <%s> %s',
      TAG,
      this.element
    );

    const ampEmbedlyKeyElement = document.querySelector(KEY_TAG);
    if (ampEmbedlyKeyElement) {
      this.apiKey_ = ampEmbedlyKeyElement.getAttribute('value');
    }
  }

  /** @override */
  layoutCallback() {
    // Add optional paid api key attribute if provided
    // to remove embedly branding.
    if (this.apiKey_) {
      this.element.setAttribute(API_KEY_ATTR_NAME, this.apiKey_);
    }

    const iframe = getIframe(this.win, this.element, 'embedly');

    const opt_is3P = true;
    listenFor(
      iframe,
      'embed-size',
      data => {
        this./*OK*/ changeHeight(data['height']);
      },
      opt_is3P
    );

    this.applyFillContent(iframe);
    this.getVsync().mutate(() => {
      this.element.appendChild(iframe);
    });

    this.iframe_ = iframe;

    return this.loadPromise(iframe);
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }

    return true;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.RESPONSIVE;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url('https://cdn.embedly.com', opt_onLayout);
  }
}
