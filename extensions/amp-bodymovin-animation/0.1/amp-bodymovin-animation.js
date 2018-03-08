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
import {assertHttpsUrl} from '../../../src/url';
import {batchFetchJsonFor} from '../../../src/batched-json';
import {dict} from '../../../src/utils/object';
import {getIframe, preloadBootstrap} from '../../../src/3p-frame';
import {isLayoutSizeDefined} from '../../../src/layout';
import {listenFor} from '../../../src/iframe-helper';
import {removeElement} from '../../../src/dom';
import {user} from '../../../src/log';

const TAG = 'amp-bodymovin-animation';

export class AmpBodymovinAnimation extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private @const */
    this.ampdoc_ = Services.ampdoc(this.element);

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {string} */
    this.loop_ = 'true';

    /** @private {string} */
    this.src_ = null;

  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    preloadBootstrap(this.win, this.preconnect);
    this.preconnect.url('https://cdnjs.cloudflare.com/ajax/libs/bodymovin/4.13.0/bodymovinjs', opt_onLayout);
  }

  /** @override */
  buildCallback() {
    this.loop_ = this.element.getAttribute('loop') ?
      this.element.getAttribute('loop') : this.loop_;
    user().assert(this.element.hasAttribute('src'),
        'The src attribute must be specified for <amp-bodymovin-animation>');
    assertHttpsUrl(this.element.getAttribute('src'), this.element);
    this.src_ = this.element.getAttribute('src');
  }

  /** @override */
  layoutCallback() {
    this.element.setAttribute('data-loop', this.loop_);
    const animData = batchFetchJsonFor(this.ampdoc_, this.element);
    return animData.then(data => {
      // We will get here when the data has been fetched from the server
      this.element.setAttribute('data-animation-data', JSON.stringify(data));

      return Services.vsyncFor(this.win).mutatePromise(() => {
        const iframe = getIframe(this.win, this.element, 'bodymovinanimation');
        this.applyFillContent(iframe);
        this.element.appendChild(iframe);
        this.iframe_ = iframe;
      }).then(() => {
        return this.loadPromise(this.iframe_).then(() => {
          const message = JSON.stringify(dict({
            'loop': this.loop_,
            'animationData': data,
          }));
          this.iframe_.contentWindow./*OK*/postMessage(message, '*');
        });
      });
    });
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    return true;
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpBodymovinAnimation);
});
