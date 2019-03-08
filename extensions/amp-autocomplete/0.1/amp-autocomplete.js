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
    this.maxEntries_ = this.element.hasAttribute('max-entries') ?
      parseInt(this.element.getAttribute('max-entries'), 10) : null;

    return this.mutateElement(() => {
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
    // Disable autofill in browsers.
    this.inputElement_.setAttribute('autocomplete', 'off');

    // No static local data to filter against.
    if (!this.inlineData_) {
      return Promise.resolve();
    }

    // Register event handlers.
    this.inputElement_.addEventListener('input', () => {
      this.inputHandler_();
    });
    this.inputElement_.addEventListener('keydown', e => {
      this.keyDownHandler_(e);
    });
    this.inputElement_.addEventListener('focus', () => {
      this.toggleResultsHandler_(true);
    });
    this.inputElement_.addEventListener('blur', () => {
      this.toggleResultsHandler_(false);
    });
    this.container_.addEventListener('mousedown', e => {
      this.selectHandler_(e);
    });

    return this.mutateElement(() => {
      this.renderResults_();
    });
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
  * @return {!Promise}
  * @private
  */
  inputHandler_() {
    return this.mutateElement(() => {
      this.renderResults_();
      this.toggleResults(true);
    });
  }

  /**
   * Handle selecting items on user mousedown.
   * @param {Event} event
   * @return {!Promise}
   * @private
   */
  selectHandler_(event) {
    if (!this.isItemElement(event.target)) {
      return Promise.resolve();
    }
    return this.mutateElement(() => {
      this.selectItem(event.target);
    });
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
    input = input.toLowerCase();
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

  /**
   * Shows or hides the results container_.
   * @param {boolean=} opt_display
   */
  toggleResults(opt_display) {
    if (!this.container_) {
      return;
    }
    toggle(this.container_, opt_display);
  }

  /**
   * Handle showing or hiding results on user focus/blur.
   * @param {boolean} opt_display
   * @return {!Promise}
   * @private
   */
  toggleResultsHandler_(opt_display) {
    return this.mutateElement(() => {
      if (!opt_display) {
        this.resetActiveElement_();
        this.activeIndex_ = -1;
      }
      this.toggleResults(opt_display);
    });
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
   * @return {!Promise}
   * @private
   */
  updateActiveItem_(delta) {
    if (delta === 0) {
      return Promise.resolve();
    }
    const keyUpWhenNoneActive = this.activeIndex_ === -1 && delta < 0;
    const index = keyUpWhenNoneActive ? delta : this.activeIndex_ + delta;
    let resultsShowing, newActiveElement;
    return this.measureMutateElement(() => {
      resultsShowing = this.resultsShowing();
      if (resultsShowing) {
        this.activeIndex_ = mod(index, this.container_.children.length);
        newActiveElement = this.container_.children[this.activeIndex_];
      }
    }, () => {
      if (resultsShowing) {
        this.resetActiveElement_();
        newActiveElement.classList.add('i-amphtml-autocomplete-item-active');
        this.activeElement_ = newActiveElement;
      }
    });
  }

  /**
   * Resets the activeElement_ and removes its 'active' class.
   * @private
   */
  resetActiveElement_() {
    if (!this.activeElement_) {
      return;
    }
    this.activeElement_.classList.toggle(
        'i-amphtml-autocomplete-item-active', false);
    this.activeElement_ = null;
  }

  /** Delete all children to the container_ */
  clearAllItems() {
    removeChildren(dev().assertElement(this.container_));
  }

  /**
   * Handles keyboard events.
   * @param {Event} event
   * @return {!Promise}
   * @private
   */
  keyDownHandler_(event) {
    switch (event.key) {
      case Keys.DOWN_ARROW:
        event.preventDefault();
        return this.updateActiveItem_(1);
      case Keys.UP_ARROW:
        event.preventDefault();
        return this.updateActiveItem_(-1);
      case Keys.ENTER:
        if (this.activeElement_) {
          // Only prevent if submit-on-enter === false.
          event.preventDefault();
          return this.mutateElement(() => {
            this.selectItem(this.activeElement_);
            this.resetActiveElement_();
          });
        }
        return Promise.resolve();
      case Keys.ESCAPE:
        // Hide results.
        return this.toggleResultsHandler_(false);
      default:
        return Promise.resolve();
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
