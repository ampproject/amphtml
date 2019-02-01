/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {isLayoutSizeDefined} from '../../../src/layout';
import {removeElement} from '../../../src/dom';
import {dev, devAssert, userAssert} from '../../../src/log';

class AmpMovingplay extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.contentid_ = '';

    /** @private {string} */
    this.playerid_ = '';

    /** @private {string} */
    this.dataVpId_ = '';

    /** @private {string} */
    this.oId_ = '';

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;


  }

  /**
   * @param {boolean=} onLayout
   * @override
   */
  preconnectCallback(onLayout) {
    this.preconnect.url('https://cdn.movingplay.it', onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {

    this.playerid_ = userAssert(
        this.element.getAttribute('data-player-id'),
        'The data-player-id attribute is required for <amp-movingplay> %s',
        this.element);

    this.dataVpId_ = userAssert(
          this.element.getAttribute('data-vp-id'),
          'The data-vp-id attribute is required for <amp-movingplay> %s',
          this.element);

    this.oId_ = this.element.getAttribute('data-o-id');
    
  }

  /** @override */
  layoutCallback() {
    const iframe = this.element.ownerDocument.createElement('iframe');
    const src = 'https://cdn.movingplay.it/amp/movplay.html?idp=' +
    encodeURIComponent(this.playerid_) +"&idv="+encodeURIComponent(this.dataVpId_)+"&oid="+encodeURIComponent(this.oId_);
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = src;
    this.applyFillContent(iframe);
    this.element.appendChild(iframe);
    this.iframe_ = iframe;
    return this.loadPromise(iframe);
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    return true; // Call layoutCallback again.
  }
}

AMP.extension('amp-movingplay', '0.1', AMP => {
  AMP.registerElement('amp-movingplay', AmpMovingplay);
});
