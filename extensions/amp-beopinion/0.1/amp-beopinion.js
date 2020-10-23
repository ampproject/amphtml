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
import {getIframe, preloadBootstrap} from '../../../src/3p-frame';
import {isLayoutSizeDefined} from '../../../src/layout';
import {listenFor} from '../../../src/iframe-helper';
import {removeElement} from '../../../src/dom';

/** @const */
const TAG = 'amp-beopinion';

class AmpBeOpinion extends AMP.BaseElement {
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
    const preconnect = Services.preconnectFor(this.win);
    preloadBootstrap(this.win, this.getAmpDoc(), preconnect);
    // Hosts the script that renders widgets.
    preconnect.preload(
      this.getAmpDoc(),
      'https://widget.beop.io/sdk.js',
      'script'
    );
    preconnect.url(this.getAmpDoc(), 'https://s.beop.io', opt_onLayout);
    preconnect.url(this.getAmpDoc(), 'https://t.beop.io', opt_onLayout);
    preconnect.url(this.getAmpDoc(), 'https://data.beop.io', opt_onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  firstLayoutCompleted() {
    // Do not hide the placeholder.
  }

  /** @override */
  buildCallback() {
    // Get attributes, assertions of values, assign instance variables.
    // Build lightweight DOM and append to this.element.
  }

  /** @override */
  layoutCallback() {
    const iframe = getIframe(this.win, this.element, 'beopinion');
    iframe.setAttribute('title', this.element.title || 'BeOpinion content');
    this.applyFillContent(iframe);
    listenFor(
      iframe,
      'embed-size',
      (data) => {
        // We only get the message if and when there is a tweet to display,
        // so hide the placeholder
        this.togglePlaceholder(false);
        this.forceChangeHeight(data['height']);
      },
      /* opt_is3P */ true
    );
    listenFor(
      iframe,
      'no-content',
      () => {
        if (this.getFallback()) {
          this.togglePlaceholder(false);
          this.toggleFallback(true);
        }
        // else keep placeholder displayed since there's no fallback
      },
      /* opt_is3P */ true
    );
    this.element.appendChild(iframe);
    this.iframe_ = iframe;
    return this.loadPromise(iframe);
  }

  /** @override */
  unlayoutOnPause() {
    return true;
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

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpBeOpinion);
});
