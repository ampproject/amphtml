/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

 /**
  * @fileoverview Embeds a imgur
  * Example:
  * <code>
  * <amp-imgur
  *   layout="reponsive"
  *   width="540"
  *   height="663"
  *   data-imgur-id="f462IUj">
  * </amp-imgur>
  * </code>
  */

import {user} from '../../../src/log';
import {getIframe} from '../../../src/3p-frame';
import {listenFor} from '../../../src/iframe-helper';
import {removeElement} from '../../../src/dom';
import {isLayoutSizeDefined} from '../../../src/layout';

export class AmpImgur extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
    
    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;
  }

  /** @override */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url('http://imgur.com/', opt_onLayout);
  }

  /** @override */
  renderOutsideViewport() {
    return false;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    const iframe = getIframe(this.win, this.element, 'imgur');
    this.applyFillContent(iframe);

    listenFor(iframe, 'embed-size', data => {
      this.changeHeight(data.height);
    }, true);

    this.element.appendChild(iframe);
    this.iframe_ = iframe;
    return this.loadPromise(iframe);
  }

  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    return true;
  }

}

AMP.registerElement('amp-imgur', AmpImgur);
