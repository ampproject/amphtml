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
import {LayoutPriority} from '../../../src/layout';
import {isExperimentOn} from '../../../src/experiments';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-action-macro';

/**
* The <amp-action-macro> element is used to define a reusable action macro.
*/
export class AmpActionMacro extends AMP.BaseElement {

  /** @override */
  buildCallback() {
    userAssert(isExperimentOn(this.win, 'amp-action-macro'),
        'Experiment is off');
  }

  /** @override */
  getLayoutPriority() {
    // Loads after other content.
    return LayoutPriority.METADATA;
  }

  /** @override */
  isLayoutSupported(unusedLayout) {
    return true;
  }

  /** @override */
  renderOutsideViewport() {
    // We want the macro to be available wherever it is in the document.
    return true;
  }
}


AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpActionMacro);
});
