/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {getIframe} from '../../../src/3p-frame';
import {isLayoutSizeDefined} from '../../../src/layout';
import {userAssert} from '../../../src/log';

export class AmpYmChatbot extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {?string} */
    this.botId_ = null;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url('https://rachana040.github.io/ym-SDK/', opt_onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    console.log('Build!');
    const {element: el} = this;

    this.botId_ = userAssert(
      el.getAttribute('data-botid'),
      'The data-botid attribute is required for <amp-ym-chatbot> %s',
      el
    );
  }

  /**
   *
   */
  layoutCallback() {
    //console.log("hey");
    const iframe = getIframe(this.win, this.element, 'yellow_messenger');
    console.log(iframe);
    this.applyFillContent(iframe);
    this.element.appendChild(iframe);
    this.iframe_ = iframe;
    return this.loadPromise(iframe);
  }
}

AMP.extension('amp-ym-chatbot', '0.1', AMP => {
  AMP.registerElement('amp-ym-chatbot', AmpYmChatbot);
});
