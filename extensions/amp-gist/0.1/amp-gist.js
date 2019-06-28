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
 * @fileoverview Embeds a Github gist
 *
 * Example:
 * <code>
 * <amp-gist
 *   layout="fixed-height"
 *   data-gistid="a19e811dcd7df10c4da0931641538497"
 *   height="1613">
 * </amp-gist>
 * </code>
 */

import {Layout} from '../../../src/layout';
import {getIframe} from '../../../src/3p-frame';
import {listenFor} from '../../../src/iframe-helper';
import {removeElement} from '../../../src/dom';

export class AmpGist extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url('https://gist.github.com/', opt_onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.FIXED_HEIGHT;
  }

  /** @override */
  layoutCallback() {
    /* the third parameter 'github' ties it to the 3p/github.js */
    const iframe = getIframe(this.win, this.element, 'github');
    this.applyFillContent(iframe);
    // Triggered by window.context.requestResize() inside the iframe.
    listenFor(
      iframe,
      'embed-size',
      data => {
        this./*OK*/ changeHeight(data['height']);
      },
      /* opt_is3P */ true
    );

    this.element.appendChild(iframe);
    this.iframe_ = iframe;
    return this.loadPromise(iframe);
  }

  /**
   * @override
   */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    return true;
  }
}

AMP.extension('amp-gist', '0.1', AMP => {
  AMP.registerElement('amp-gist', AmpGist);
});
