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
import {user} from '../../../src/log';
import {getIframe, preloadBootstrap} from '../../../src/3p-frame';

class AmpReddit extends AMP.BaseElement {

  /**
   * @param {boolean=} onLayout
   * @override
   */
  preconnectCallback(onLayout) {
    // Required urls and scripts are different for comments and posts.
    if (this.element.getAttribute('data-embedtype') === 'comment') {
      // The domain for static comment permalinks.
      this.preconnect.url('https://www.redditmedia.com', onLayout);
      // The domain for JS and CSS used in rendering embeds.
      this.preconnect.url('https://www.redditstatic.com', onLayout);
      this.preconnect.preload('https://www.redditstatic.com/comment-embed.js', 'script');
    } else {
      // Posts don't use the static domain.
      this.preconnect.url('https://www.reddit.com', onLayout);
      // Posts defer to the embedly API.
      this.preconnect.url('https://cdn.embedly.com', onLayout);
      this.preconnect.preload('https://embed.redditmedia.com/widgets/platform.js', 'script');
    }

    preloadBootstrap(this.win, this.preconnect);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    user().assert(this.element.getAttribute('data-src'),
      'The data-src attribute is required for <amp-reddit> %s',
      this.element);
    user().assert(this.element.getAttribute('data-embedtype'),
      'The data-embedtype attribute is required for <amp-reddit> %s',
      this.element);

    const iframe = getIframe(this.win, this.element, 'reddit');
    this.applyFillContent(iframe);
    this.element.appendChild(iframe);
    return this.loadPromise(iframe);
  }

}

AMP.registerElement('amp-reddit', AmpReddit);
