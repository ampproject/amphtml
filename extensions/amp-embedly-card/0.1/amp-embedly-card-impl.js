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

import {Layout} from '../../../src/layout';
import {getEmbedlyServiceForDoc} from './embedly-service';
import {getIframe} from '../../../src/3p-frame';
import {listenFor} from '../../../src/iframe-helper';
import {removeElement} from '../../../src/dom';
import {user} from '../../../src/log';

/** @const {string} */
export const TAG = 'amp-embedly-card';

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
  }

  /** @override */
  buildCallback() {
    user().assert(
        this.element.getAttribute('data-url'),
        `The data-url attribute is required for <${TAG}> %s`,
        this.element
    );
  }

  /** @override */
  layoutCallback() {
    return getEmbedlyServiceForDoc(this.element).then(service => {
      if (service.key) {
        this.element.setAttribute('data-key', service.key);
      }

      const iframe = getIframe(this.win, this.element, 'embedly');

      const opt_is3P = true;
      listenFor(iframe, 'embed-size', data => {
        this./*OK*/changeHeight(data['height']);
      }, opt_is3P);

      this.applyFillContent(iframe);
      this.getVsync().mutate(() => this.element.appendChild(iframe));

      this.iframe_ = iframe;

      return iframe;
    }).then(iframe => this.loadPromise(iframe));
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
