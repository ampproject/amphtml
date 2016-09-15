/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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


class AmpTwitter extends AMP.BaseElement {
  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    // This domain serves the actual tweets as JSONP.
    this.preconnect.url('https://syndication.twitter.com', opt_onLayout);
    // All images
    this.preconnect.url('https://pbs.twimg.com', opt_onLayout);
    // Hosts the script that renders tweets.
    this.preconnect.preload(
        'https://platform.twitter.com/widgets.js', 'script');
    preloadBootstrap(this.win);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  firstLayoutCompleted() {
    // Do not hide placeholder
  }

  /** @override */
  layoutCallback() {
    const iframe = getIframe(this.win, this.element, 'twitter');
    this.applyFillContent(iframe);
    listenFor(iframe, 'embed-size', data => {
      // We only get the message if and when there is a tweet to display,
      // so hide the placeholder.
      this.togglePlaceholder(false);
      this./*OK*/changeHeight(data.height);
    }, /* opt_is3P */true);
    this.element.appendChild(iframe);
    return this.loadPromise(iframe);
  }
};

AMP.registerElement('amp-twitter', AmpTwitter);
