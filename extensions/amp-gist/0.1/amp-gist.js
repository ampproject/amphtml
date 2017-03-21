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
 *   layout="responsive"
 *   data-gistid="a19e811dcd7df10c4da0931641538497"
 *   width="100"
 *   height="100">
 * </amp-gist>
 * </code>
 */

import {getIframe} from '../../../src/3p-frame';
import {isLayoutSizeDefined} from '../../../src/layout';
import {removeElement} from '../../../src/dom';
import {user} from '../../../src/log';

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
    return isLayoutSizeDefined(layout);
  }

  /**@override*/
  layoutCallback() {
    const gistid = user().assert(
      this.element.getAttribute('data-gistid'),
      'The data-gistid attribute is required for <amp-gist> %s',
      this.element);
    const width = this.element.getAttribute('width');
    const height = this.element.getAttribute('height');
    const url = 'https://gist.github.com/';

    const iframe = getIframe(this.win, this.element, 'gist');

    iframe.setAttribute('frameborder', 'no');
    iframe.setAttribute('scrolling', 'no');

    const src = url + encodeURIComponent(gistid) + '.pibb';

    iframe.src = src;

    this.applyFillContent(iframe);
    iframe.width = width;
    iframe.height = height;
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

AMP.registerElement('amp-gist', AmpGist);
