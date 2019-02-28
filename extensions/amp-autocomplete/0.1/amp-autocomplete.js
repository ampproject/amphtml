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
import {childElementsByTag, isJsonScriptTag,
  removeChildren} from '../../../src/dom';
import {dev, user, userAssert} from '../../../src/log';
import {isExperimentOn} from '../../../src/experiments';
import {setStyle} from '../../../src/style';
import {tryParseJson} from '../../../src/json';

/** @const {string} */
const EXPERIMENT = 'amp-autocomplete';

/** @const {string} */
const TAG = 'amp-autocomplete';

export class AmpAutocomplete extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /**
     * The data extracted from the <script> tag optionally provided
     * as a child. For use with static data.
     * @private {?string}
     */
    this.inlineData_ = null;

    /**
     * The reference to the <input> tag provided as a child.
     * @private {?HTMLElement}
     */
    this.inputElement_ = null;

    /**
     * The value of the "filter" attribute on <autocomplete>.
     * @private {?string}
     */
    this.filter_ = null;

    /**
     * The reference to the <div> that contains template-rendered children.
     * @private {?HTMLElement}
     */
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

    this.filter_ = this.element.getAttribute('filter');
    this.container_ = this.createContainer_();
    this.element.appendChild(this.container_);
  }

  /**
   * Reads the 'items' data from the child <script> element.
   * For use with static local data.
   * @return {?Array}
   * @private
   */
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
        error => {user().error((TAG, 'failed to parse inline data', error));});
    return json.items;
  }

  /**
   * Creates and returns <div> that contains the template-rendered children.
   * @return {?HTMLElement}
   * @private
   */
  createContainer_() {
    const container = this.element.ownerDocument.createElement('div');
    container.classList.add('i-amphtml-autocomplete-results');
    container.setAttribute('role', 'list');
    setStyle(container, 'visibility', 'hidden');
    this.applyFillContent(container, /* replacedContent */ true);
    return container;
  }

  /** @override */
  layoutCallback() {
    this.element.classList.add('i-amphtml-autocomplete');
    this.inputElement_.classList.add('i-amphtml-autocomplete-input');
    // Disable autofill in browsers.
    this.inputElement_.setAttribute('autocomplete', 'off');

    // No static local data to filter against.
    if (!this.inlineData_) {
      return Promise.resolve();
    }
    this.inputElement_.addEventListener('input',
        this.renderResults_.bind(this));
    this.inputElement_.addEventListener('focus', this.showResults.bind(this));
    this.inputElement_.addEventListener('blur', this.hideResults.bind(this));
    this.renderResults_();
    return Promise.resolve();
  }

  /**
   * Create and return <div> element from given plan-text item.
   * @param {string} item
   * @return {!HTMLElement}
   * @private
   */
  createElementFromItem_(item) {
    const element = this.element.ownerDocument.createElement('div');
    element.classList.add('i-amphtml-autocomplete-item');
    element.setAttribute('role', 'listitem');
    element.addEventListener('mousedown', this.selectItem.bind(this));
    element.textContent = item;
    return element;
  }

  /** 
   * Render filtered results on the current input and update the container_.
   * @param {?event} event
   * @private
   */
  renderResults_(event) {
    if (event && event.inputType === 'deleteContentBackward') {
      // Explore options for caching results to avoid repetitive queries.
    }
    const userInput = this.inputElement_.value;
    const filteredData = this.filterData_(this.inlineData_, userInput);
    this.clearAllItems();
    filteredData.forEach(item => {
      this.container_.appendChild(this.createElementFromItem_(item));
    });
  }

  /** 
   * Apply the filter to the given data based on the given input.
   * @param {!Array<string>} data
   * @param {string} input
   * @return {!Array<string>}
   * @private
   */
  filterData_(data, input) {
    return data.filter(item => {
      switch (this.filter_) {
        case 'substring':
          return item.includes(input);
          break;
        case 'prefix':
          return item.startsWith(input);
          break;
        case 'token-prefix':
          return item.split(' ').some(token => {
            return token.startsWith(input);
          });
          break;
        case 'fuzzy':
          throw new Error(`Filter not yet supported: ${this.filter_}`);
          break;
        case 'custom':
          throw new Error(`Filter not yet supported: ${this.filter_}`);          
          break;
        case 'none':
          // Query server endpoint.
          throw new Error(`Filter not yet supported: ${this.filter_}`);
          break;
        default:
          throw new Error(`Unexpected filter: ${this.filter_}`);
      }
    });
  }

  /** Set container_ visibility to visible. */
  showResults() {
    setStyle(this.container_, 'visibility', 'visible');
  }

  /** Set container_ visibility to hidden. */
  hideResults() {
    setStyle(this.container_, 'visibility', 'hidden');
  }

  /** 
   * Writes the selected value into the input field.
   * @param {?event} event
   */
  selectItem(event) {
    this.inputElement_.value = event.target.textContent;
    this.clearAllItems();
  }

  /** Delete all children to the container_ */
  clearAllItems() {
    removeChildren(dev().assertElement(this.container_));
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER;
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpAutocomplete, CSS);
});
