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

import {getIframe, preloadBootstrap} from '../../../src/3p-frame';
import {isLayoutSizeDefined} from '../../../src/layout';
import {listenFor} from '../../../src/iframe-helper';
import {removeElement} from '../../../src/dom';

export class AmpGoogleplus extends AMP.BaseElement {

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
    this.preconnect.url('https://plus.google.com', opt_onLayout);
    this.preconnect.preload(
        'https://apis.google.com/js/platform.js', 'script');
    preloadBootstrap(this.win, this.preconnect);

    // +CustomURL is not supported by gapi
    // To get real user id based on +CustomURL, search at
    // https://developers.google.com/apis-explorer/#p/plus/v1/plus.people.get
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
  layoutCallback() {
    const iframe = getIframe(this.win, this.element, 'googleplus', null,
        {allowFullscreen: true});
    this.applyFillContent(iframe);
    listenFor(iframe, 'embed-size', data => {
      // hide the placeholder
      this.togglePlaceholder(false);
      this./*OK*/changeHeight(data['height']);
    }, /* opt_is3P */true);
    listenFor(iframe, 'no-content', () => {
      console.log('HAPPENED');
      const fallback = this.getFallback();
      if (fallback) {
        // If there is no content, but a fallback is provided.
        this.togglePlaceholder(false);
        this.toggleFallback(true);
        this./*OK*/changeHeight(fallback./*OK*/offsetHeight);
      } else {
        // Else keep placeholder displayed since there's no fallback.
        const placeholder = this.getPlaceholder();
        if (placeholder) {
          // Only happens if there is no content to render
          // (e.g. tweet was deleted) and there is no fallback.
          this./*OK*/changeHeight(placeholder./*OK*/offsetHeight);
        }
      }
    }, /* opt_is3P */true);
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

AMP.registerElement('amp-googleplus', AmpGoogleplus);
