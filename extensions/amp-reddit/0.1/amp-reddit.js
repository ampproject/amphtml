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

import {Services} from '../../../src/services';
import {getIframe, preloadBootstrap} from '../../../src/3p-frame';
import {isLayoutSizeDefined} from '../../../src/layout';
import {listenFor} from '../../../src/iframe-helper';
import {userAssert} from '../../../src/log';

class AmpReddit extends AMP.BaseElement {
  /**
   * @param {boolean=} onLayout
   * @override
   */
  preconnectCallback(onLayout) {
    const preconnect = Services.preconnectFor(this.win);
    const ampdoc = this.getAmpDoc();
    // Required urls and scripts are different for comments and posts.
    if (this.element.getAttribute('data-embedtype') === 'comment') {
      // The domain for static comment permalinks.
      preconnect.url(ampdoc, 'https://www.redditmedia.com', onLayout);
      // The domain for JS and CSS used in rendering embeds.
      preconnect.url(ampdoc, 'https://www.redditstatic.com', onLayout);
      preconnect.preload(
        ampdoc,
        'https://www.redditstatic.com/comment-embed.js',
        'script'
      );
    } else {
      // Posts don't use the static domain.
      preconnect.url(ampdoc, 'https://www.reddit.com', onLayout);
      // Posts defer to the embedly API.
      preconnect.url(ampdoc, 'https://cdn.embedly.com', onLayout);
      preconnect.preload(
        ampdoc,
        'https://embed.redditmedia.com/widgets/platform.js',
        'script'
      );
    }

    preloadBootstrap(this.win, ampdoc, preconnect);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    userAssert(
      this.element.getAttribute('data-src'),
      'The data-src attribute is required for <amp-reddit> %s',
      this.element
    );
    userAssert(
      this.element.getAttribute('data-embedtype'),
      'The data-embedtype attribute is required for <amp-reddit> %s',
      this.element
    );

    const iframe = getIframe(this.win, this.element, 'reddit', null, {
      allowFullscreen: true,
    });
    this.applyFillContent(iframe);
    listenFor(
      iframe,
      'embed-size',
      (data) => {
        this.forceChangeHeight(data['height']);
      },
      /* opt_is3P */ true
    );
    this.element.appendChild(iframe);
    return this.loadPromise(iframe);
  }
}

AMP.extension('amp-reddit', '0.1', (AMP) => {
  AMP.registerElement('amp-reddit', AmpReddit);
});
