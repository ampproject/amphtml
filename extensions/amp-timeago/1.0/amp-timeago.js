/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {PreactBaseElement} from '../../../src/preact/base-element';
import {Timeago} from './timeago';
import {isExperimentOn} from '../../../src/experiments';
import {isLayoutSizeDefined} from '../../../src/layout';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-timeago';

class AmpTimeago extends PreactBaseElement {
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'amp-timeago-bento'),
      'expected amp-timeago-bento experiment to be enabled'
    );
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  updatePropsForRendering(props) {
    props['placeholder'] = props['children'];
  }
}

/** @override */
AmpTimeago['Component'] = Timeago;

/** @override */
AmpTimeago['passthroughNonEmpty'] = true;

/** @override */
AmpTimeago['layoutSizeDefined'] = true;

/** @override */
AmpTimeago['props'] = {
  'datetime': {attr: 'datetime'},
  'locale': {attr: 'locale', default: 'en'},
  'cutoff': {attr: 'cutoff', type: 'number'},
};

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpTimeago);
});
