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
import {createLoaderLogo} from '../../amp-facebook/0.1/facebook-loader';
import {dashToUnderline} from '../../../src/core/types/string';
import {dict} from '../../../src/core/types/object';
import {getBootstrapBaseUrl, getBootstrapUrl} from '../../../src/3p-frame';
import {isExperimentOn} from '../../../src/experiments';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-facebook-page';

/** @const {string} */
const TYPE = 'facebook';

class AmpFacebookPage extends BaseElement {
  /** @override @nocollapse */
  static createLoaderLogoCallback(element) {
    return createLoaderLogo(element);
  }

  /** @override @nocollapse */
  static getPreconnects(element) {
    const ampdoc = element.getAmpDoc();
    const {win} = ampdoc;
    const locale = element.hasAttribute('data-locale')
      ? element.getAttribute('data-locale')
      : dashToUnderline(window.navigator.language);
    return [
      // Base URL for 3p bootstrap iframes
      getBootstrapBaseUrl(win, ampdoc),
      // Script URL for iframe
      getBootstrapUrl(TYPE, win),
      'https://facebook.com',
      // This domain serves the actual tweets as JSONP.
      'https://connect.facebook.net/' + locale + '/sdk.js',
    ];
  }

  /** @override */
  init() {
    return dict({
      'onReady': () => this.togglePlaceholder(false),
      'requestResize': (height) =>
        this.attemptChangeHeight(height).catch(() => {
          /* ignore failures */
        }),
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-facebook-page'),
      'expected global "bento" or specific "bento-facebook-page" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpFacebookPage);
});
