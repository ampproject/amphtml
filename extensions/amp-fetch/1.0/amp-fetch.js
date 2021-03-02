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

import {Fetch} from './fetch';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {Services} from '../../../src/services';
import {dev, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {isExperimentOn} from '../../../src/experiments';

class AmpFetch extends PreactBaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    // /** @private {?../../../src/service/template-impl.Templates} */
    // this.templates_ = null;

    // /** @private {?Element} */
    // this.template_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-amp-fetch'),
      'expected global "bento" or specific "bento-amp-fetch" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

/** @override */
AmpFetch['Component'] = Fetch;

/** @override */
AmpFetch['props'] = {
  'src': {attr: 'src'},
  'target': {attr: 'target'},
};
