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

import {Layout} from '../../../src/layout';
import {isExperimentOn} from '../../../src/experiments';
import {user} from '../../../src/log';

/** @const {string} */
const EXPERIMENT = 'amp-autocomplete';

/** @const {string} */
const TAG = 'amp-autocomplete';

export class AmpAutocomplete extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.myText_ = 'hello world';

    /** @private {?Element} */
    this.container_ = null;
  }

  /** @override */
  buildCallback() {
    if (!isExperimentOn(this.getWin(), 'amp-autocomplete')) {
      user().warn('Experiment %s is not turned on.', EXPERIMENT);
      return;
    }
    this.container_ = this.element.ownerDocument.createElement('div');
    this.container_.textContent = this.myText_;
    this.element.appendChild(this.container_);
    this.applyFillContent(this.container_, /* replacedContent */ true);
  }

  /** @override */
  layoutCallback() {
    if (!isExperimentOn(this.getWin(), 'amp-autocomplete')) {
      user().warn('Experiment %s is not turned on.', EXPERIMENT);
      return;
    }
    // Actually load your resource or render more expensive resources.
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.FIXED;
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpAutocomplete);
});
