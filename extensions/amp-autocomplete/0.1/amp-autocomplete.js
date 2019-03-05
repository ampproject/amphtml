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
import {Keys} from '../../../src/utils/key-codes';
import {Layout} from '../../../src/layout';
import {childElementsByTag, isJsonScriptTag,
  removeChildren} from '../../../src/dom';
import {dev, userAssert} from '../../../src/log';
import {includes, startsWith} from '../../../src/string';
import {isEnumValue} from '../../../src/types';
import {isExperimentOn} from '../../../src/experiments';
import {mod} from '../../../src/utils/math';
import {toggle} from '../../../src/style';
import {tryParseJson} from '../../../src/json';

/** @const */
const EXPERIMENT = 'amp-autocomplete';

/** @const */
const TAG = 'amp-autocomplete';

/**
 * Different filtering options.
 * @enum {string}
 */
export const FilterType = {
  SUBSTRING: 'substring',
  PREFIX: 'prefix',
  TOKEN_PREFIX: 'token-prefix',
  FUZZY: 'fuzzy',
  CUSTOM: 'custom',
  NONE: 'none',
};

export class AmpAutocomplete extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /**
     * The data extracted from the <script> tag optionally provided
     * as a child. For use with static data.
     * @private {?Array}
     */
    this.inlineData_ = null;

    /**
     * The reference to the <input> tag provided as a child.
     * @private {?HTMLElement}
     */
    this.inputElement_ = null;

    /**
     * The value of the "filter" attribute on <autocomplete>.
     * @private {string}
     */
    this.filter_ = '';

    /**
     * The value of the "min-characters" attribute on <autocomplete>.
     * @private {number}
     */
    this.minChars_ = 1;

    /**
     * The value of the "max-entries" attribute on <autocomplete>.
     * @private {?number}
     */
    this.maxEntries_ = null;

    /**
     * The index of the active suggested item.
     * @private {number}
     */
    this.activeIndex_ = -1;

    /**
     * The reference to the <div> of the active suggested item.
     * @private {?Element}
     */
    this.activeElement_ = null;

    /**
     * The reference to the <div> that contains template-rendered children.
     * @private {?Element}
     */
    this.container_ = null;
  }

  /** @override */
  buildCallback() {
    userAssert(isExperimentOn(this.win, 'amp-autocomplete'),
        `Experiment ${EXPERIMENT} is not turned on.`);

    return this.measureMutateElement(() => {
      this.inlineData_ = this.getInlineData_();

      const inputElements = childElementsByTag(this.element, 'INPUT');
      userAssert(inputElements.length === 1,
          `${TAG} should contain exactly one <input> child`);
      this.inputElement_ = inputElements[0];
  
      this.filter_ = userAssert(this.element.getAttribute('filter'),
          `${TAG} requires "filter" attribute.`);
      userAssert(isEnumValue(FilterType, this.filter_),
          `Unexpected filter: ${this.filter_}`);
  
      this.minChars_ = this.element.hasAttribute('min-characters') ?
        parseInt(this.element.getAttribute('min-characters'), 10) : 1;
      this.maxEntries_ = parseInt(this.element.getAttribute('max-entries'), 10);
    }, () => {
      this.container_ = this.createContainer_();
      this.element.appendChild(this.container_);
    });
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
        error => {
          throw error;
        });
    return json['items'] ? json['items'] : [];
  }

  /**
   * Creates and returns <div> that contains the template-rendered children.
   * @return {Element}
   * @private
   */
  createContainer_() {
    const container = this.element.ownerDocument.createElement('div');
    container.classList.add('i-amphtml-autocomplete-results');
    container.setAttribute('role', 'list');
    toggle(container, false);
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

    // Register event handlers.
    this.inputElement_.addEventListener('input',
        this.inputHandler_.bind(this));
    this.inputElement_.addEventListener('keydown',
        this.keyDownHandler_.bind(this));
    this.inputElement_.addEventListener('focus', this.showResults.bind(this));
    this.inputElement_.addEventListener('blur', this.hideResults.bind(this));
    this.container_.addEventListener('mousedown',
        this.selectHandler_.bind(this));

    this.renderResults_();
    return Promise.resolve();
  }

  /**
   * Create and return <div> element from given plan-text item.
   * @param {string} item
   * @return {!Element}
   * @private
   */
  createElementFromItem_(item) {
    const element = this.element.ownerDocument.createElement('div');
    element.classList.add('i-amphtml-autocomplete-item');
    element.setAttribute('role', 'listitem');
    element.textContent = item;
    return element;
  }

  /**
  * Handle rendering results on user input.
  * @param {Event} event
  * @private
  */
  inputHandler_(event) {
    if (event.inputType === 'deleteContentBackward') {
      // Explore options for caching results to avoid repetitive queries.
    }
    this.renderResults_();
    this.showResults();
  }

  /**
  * Handle selecting items on user mousedown.
  * @param {Event} event
  * @private
  */
  selectHandler_(event) {
    if (!this.isItemElement(event.target)) {
      return;
    }
    this.selectItem(event.target);
  }

  /**
   * Render filtered results on the current input and update the container_.
   * @private
   */
  renderResults_() {
    const userInput = this.inputElement_.value;
    this.clearAllItems();
    if (userInput.length < this.minChars_ || !this.inlineData_) {
      return;
    }
    const filteredData = this.filterData_(this.inlineData_, userInput);
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
    let filteredData = data.filter(item => {
      switch (this.filter_) {
        case FilterType.SUBSTRING:
          return includes(item, input);
        case FilterType.PREFIX:
          return startsWith(item, input);
        case FilterType.TOKEN_PREFIX:
          return item.split(' ').some(token => {
            return startsWith(token, input);
          });
        case FilterType.FUZZY:
          throw new Error(`Filter not yet supported: ${this.filter_}`);
        case FilterType.CUSTOM:
          throw new Error(`Filter not yet supported: ${this.filter_}`);
        case FilterType.NONE:
          // Query server endpoint.
          throw new Error(`Filter not yet supported: ${this.filter_}`);
        default:
          throw new Error(`Unexpected filter: ${this.filter_}`);
      }
    });

    // Truncate to max-entries.
    if (this.maxEntries_ && this.maxEntries_ < filteredData.length) {
      filteredData = filteredData.slice(0, this.maxEntries_);
    }

    return filteredData;
  }

  /** Set container_ visibility to visible. */
  showResults() {
    if (!this.container_) {
      return;
    }
    toggle(this.container_, true);
  }

  /** Set container_ visibility to hidden. */
  hideResults() {
    if (!this.container_) {
      return;
    }
    toggle(this.container_, false);
    this.resetActiveElement_();
    this.activeIndex_ = -1;
  }

  /** Returns true if the results are visible and has items. */
  resultsShowing() {
    return !this.container_.hasAttribute('hidden') &&
      this.container_.children.length > 0;
  }

  /**
   * Returns true if the given element is a suggested item.
   * @param {Element|EventTarget} element
   */
  isItemElement(element) {
    return element.classList.contains('i-amphtml-autocomplete-item');
  }

  /**
   * Writes the selected value into the input field.
   * @param {Element|EventTarget} element
   */
  selectItem(element) {
    this.inputElement_.value = element.textContent;
    this.clearAllItems();
  }

  /**
   * Given a delta between the current active item and the desired active item,
   * marks the desired active item as active. Loops to the beginning.
   * @param {number} delta
   * @private
   */
  updateActiveItem_(delta) {
    if (delta === 0) {
      return;
    }
    if (this.activeElement_ !== null) {
      this.resetActiveElement_();
    }
    const keyUpWhenNoneActive = this.activeIndex_ === -1 && delta < 0;
    const index = keyUpWhenNoneActive ? delta : this.activeIndex_ + delta;
    this.activeIndex_ = mod(index, this.container_.children.length);
    this.activeElement_ = this.container_.children[this.activeIndex_];
    this.activeElement_.classList
        .add('i-amphtml-autocomplete-item-active');
  }

  /**
   * Resets the activeElement_ and removes its 'active' class.
   * @private
   */
  resetActiveElement_() {
    if (!this.activeElement_) {
      return;
    }
    this.activeElement_.classList.remove('i-amphtml-autocomplete-item-active');
    this.activeElement_ = null;
  }

  /** Delete all children to the container_ */
  clearAllItems() {
    removeChildren(dev().assertElement(this.container_));
  }

  /**
   * Handles keyboard events.
   * @param {Event} event
   * @private
   */
  keyDownHandler_(event) {
    switch (event.key) {
      case Keys.DOWN_ARROW:
        if (this.resultsShowing()) {
          this.updateActiveItem_(1);
        }
        break;
      case Keys.UP_ARROW:
        if (this.resultsShowing()) {
          this.updateActiveItem_(-1);
        }
        break;
      case Keys.ENTER:
        if (this.activeElement_) {
          // Only prevent if submit-on-enter === false.
          event.preventDefault();
          this.selectItem(this.activeElement_);
          this.resetActiveElement_();
        }
        break;
      case Keys.ESCAPE:
        this.hideResults();
      default:
    }
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER;
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpAutocomplete, CSS);
});
