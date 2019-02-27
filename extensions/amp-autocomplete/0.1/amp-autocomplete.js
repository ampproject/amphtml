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

import {CSS} from '../../../build/amp-autocomplete-0.1.css';
import {Layout} from '../../../src/layout';
import {childElementsByTag} from '../../../src/dom';
import {isExperimentOn} from '../../../src/experiments';
import {tryParseJson} from '../../../src/json';
import {user, userAssert} from '../../../src/log';

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

    /** @private {?string} */
    this.inlineData_ = null;

    /** @private {?HTMLElement} */
    this.inputElement_ = null;

    /** @private {?Element} */
    this.container_ = null;
  }

  /** @override */
  buildCallback() {
    userAssert(isExperimentOn(this.win, 'amp-autocomplete'),
        `Experiment ${EXPERIMENT} is not turned on.`);

    this.inlineData_ = this.getInlineData_();
    const inputElements = childElementsByTag(this.element, 'INPUT');
    userAssert(inputElements.length === 1,
        `${TAG} should contain exactly one <input> child`);
    this.inputElement_ = inputElements[0];
  }

  /** Reads the data from the child element. *
   * @return {?Array} */
  getInlineData_() {
    const scriptElements = childElementsByTag(this.element, 'SCRIPT');
    if (!scriptElements.length) {
      return null;
    }
    userAssert(scriptElements.length === 1,
        `${TAG} should contain at most one <script> child`);
    const scriptElement = scriptElements[0];
    userAssert(isJsonScriptTag(scriptElement),
        `${TAG} should be inside a <script> tag with type="application/json"`);
    const json = tryParseJson(scriptElement.textContent,
        error => {user().error((TAG, 'failed to parse config', error));});
    return json['items'];
  }

  /** @override */
  layoutCallback() {
    // Actually load your resource or render more expensive resources.
    return Promise.resolve();
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER;
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpAutocomplete, CSS);
});
