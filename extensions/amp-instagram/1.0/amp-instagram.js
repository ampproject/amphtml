/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {CSS} from '../../../build/amp-instagram-1.0.css';
import {Instagram} from './instagram';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {dict} from '../../../src/utils/object';
import {isExperimentOn} from '../../../src/experiments';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-instagram';

class AmpInstagram extends PreactBaseElement {
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-instagram'),
      'expected global "bento" or specific "bento-instagram" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }

  /** @override */
  init() {
    return dict({
      'requestResize': (height) => {
        this.forceChangeHeight(height);
      },
    });
  }
}

/** @override */
AmpInstagram['Component'] = Instagram;

/** @override */
AmpInstagram['children'] = {};

/** @override */
AmpInstagram['loadable'] = true;

/** @override */
AmpInstagram['props'] = {
  'shortcode': {attr: 'data-shortcode'},
  'captioned': {attr: 'data-captioned'},
  'title': {attr: 'title'},
};

/** @override */
AmpInstagram['layoutSizeDefined'] = true;

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpInstagram, CSS);
});
