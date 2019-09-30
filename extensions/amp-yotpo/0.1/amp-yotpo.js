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

import {getIframe} from '../../../src/3p-frame';
import {isLayoutSizeDefined} from '../../../src/layout';
import {listenFor} from '../../../src/iframe-helper';
import {removeElement} from '../../../src/dom';
import {userAssert} from '../../../src/log';

export class AmpYotpo extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {Array<Function>} */
    this.unlisteners_ = [];
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url('https://staticw2.yotpo.com', opt_onLayout);
  }

  /** @override */
  buildCallback() {
    userAssert(
      this.element.getAttribute('data-app-key'),
      'The data-app-key attribute is required for <amp-yotpo> %s',
      this.element
    );
    userAssert(
      this.element.getAttribute('data-widget-type'),
      'The data-widget-type attribute is required for <amp-yotpo> %s',
      this.element
    );
    const iframe = getIframe(this.win, this.element, 'yotpo');
    this.applyFillContent(iframe);

    const unlisten = listenFor(
      iframe,
      'embed-size',
      data => {
        this.attemptChangeHeight(data['height']).catch(() => {
          /* do nothing */
        });
      },
      /* opt_is3P */ true
    );
    this.unlisteners_.push(unlisten);

    this.element.appendChild(iframe);
    this.iframe_ = iframe;
    return this.loadPromise(iframe);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  unlayoutOnPause() {
    return true;
  }

  /** @override */
  unlayoutCallback() {
    this.unlisteners_.forEach(unlisten => unlisten());
    this.unlisteners_.length = 0;

    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    return true;
  }
}

AMP.extension('amp-yotpo', '0.1', AMP => {
  AMP.registerElement('amp-yotpo', AmpYotpo);
});
