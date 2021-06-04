/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {BaseElement} from './base-element';
import {dict} from '../../../src/core/types/object';
import {getBootstrapBaseUrl, getBootstrapUrl} from '../../../src/3p-frame';
import {htmlFor} from '../../../src/static-template';
import {isExperimentOn} from '../../../src/experiments';
import {userAssert} from '../../../src/core/assert';

/** @const {string} */
const TAG = 'amp-twitter';
const TYPE = 'twitter';

class AmpTwitter extends BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /** @override @nocollapse */
  static createLoaderLogoCallback(element) {
    const html = htmlFor(element);
    return {
      color: '#1DA1F2',
      content: html`
        <svg viewBox="0 0 72 72">
          <path
            fill="currentColor"
            d="M32.29,44.13c7.55,0,11.67-6.25,11.67-11.67c0-0.18,0-0.35-0.01-0.53c0.8-0.58,1.5-1.3,2.05-2.12
      c-0.74,0.33-1.53,0.55-2.36,0.65c0.85-0.51,1.5-1.31,1.8-2.27c-0.79,0.47-1.67,0.81-2.61,1c-0.75-0.8-1.82-1.3-3-1.3
      c-2.27,0-4.1,1.84-4.1,4.1c0,0.32,0.04,0.64,0.11,0.94c-3.41-0.17-6.43-1.8-8.46-4.29c-0.35,0.61-0.56,1.31-0.56,2.06
      c0,1.42,0.72,2.68,1.83,3.42c-0.67-0.02-1.31-0.21-1.86-0.51c0,0.02,0,0.03,0,0.05c0,1.99,1.41,3.65,3.29,4.02
      c-0.34,0.09-0.71,0.14-1.08,0.14c-0.26,0-0.52-0.03-0.77-0.07c0.52,1.63,2.04,2.82,3.83,2.85c-1.4,1.1-3.17,1.76-5.1,1.76
      c-0.33,0-0.66-0.02-0.98-0.06C27.82,43.45,29.97,44.13,32.29,44.13"
          />
        </svg>
      `,
    };
  }

  /** @override @nocollapse */
  static getPreconnects(element) {
    const ampdoc = element.getAmpDoc();
    const {win} = ampdoc;
    return [
      // Base URL for 3p bootstrap iframes
      getBootstrapBaseUrl(win, ampdoc),
      // Script URL for iframe
      getBootstrapUrl(TYPE, win),
      // Hosts the script that renders tweets.
      'https://platform.twitter.com/widgets.js',
      // This domain serves the actual tweets as JSONP.
      'https://syndication.twitter.com',
      // All images
      'https://pbs.twimg.com',
      'https://cdn.syndication.twimg.com',
    ];
  }

  /** @override */
  init() {
    return dict({
      'requestResize': (height) => this.forceChangeHeight(height),
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-twitter'),
      'expected global "bento" or specific "bento-twitter" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpTwitter);
});
