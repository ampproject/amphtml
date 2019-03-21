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
import {Services} from '../../../src/services';
import {UrlReplacementPolicy,
  batchFetchJsonFor} from '../../../src/batched-json';
import {childElementsByTag, isJsonScriptTag,
  removeChildren} from '../../../src/dom';
import {dev, userAssert} from '../../../src/log';
import {getValueForExpr, tryParseJson} from '../../../src/json';
import {includes, startsWith} from '../../../src/string';
import {isEnumValue} from '../../../src/types';
import {isExperimentOn} from '../../../src/experiments';
import {mod} from '../../../src/utils/math';
import {toggle} from '../../../src/style';

const EXPERIMENT = 'amp-autocomplete';
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
     * @private {?Array<!JsonObject|string>}
     */
    this.inlineData_ = null;

    /**
     * The reference to the <input> tag provided as a child.
     * @private {?HTMLElement}
     */
    this.inputElement_ = null;

    /**
     * The partial user input used to generate suggestions.
     * @private {string}
     */
    this.userInput_ = '';

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
     * If the "submit-on-enter" attribute is present on <autocomplete>.
     */
    this.submitOnEnter_ = false;

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

    /** @const @private {!../../../src/service/template-impl.Templates} */
    this.templates_ = Services.templatesFor(this.win);

    /**
     * The reference to the <template> tag provided as a child.
     * @private {?Element}
     */
    this.templateElement_ = null;
  }

  /** @override */
  buildCallback() {
    userAssert(isExperimentOn(this.win, 'amp-autocomplete'),
        `Experiment ${EXPERIMENT} is not turned on.`);

    if (!this.element.hasAttribute('src')) {
      const scripts = childElementsByTag(this.element, 'SCRIPT');
      userAssert(scripts.length,
          `${TAG} expected a <script> child or a URL specified in "src".`);
      this.inlineData_ = this.getInlineData_(scripts);
    }

    const inputElements = childElementsByTag(this.element, 'INPUT');
    userAssert(inputElements.length === 1,
        `${TAG} should contain exactly one <input> child`);
    this.inputElement_ = inputElements[0];

    if (this.templates_.hasTemplate(
        this.element, 'template, script[template]')) {
      this.templateElement_ =
        this.templates_.findTemplate(this.element,
            'template, script[template]');
      // Dummy render to verify existence of "value" attribute.
      this.templates_.renderTemplate(this.templateElement_,
          /** @type {!JsonObject} */({})).then(
          renderedEl => {
            userAssert(renderedEl.hasAttribute('value'),
                `${TAG} requires <template> tag to have "value" attribute.`);
          });
    }

    this.filter_ = userAssert(this.element.getAttribute('filter'),
        `${TAG} requires "filter" attribute.`);
    userAssert(isEnumValue(FilterType, this.filter_),
        `Unexpected filter: ${this.filter_}`);

    this.minChars_ = this.element.hasAttribute('min-characters') ?
      parseInt(this.element.getAttribute('min-characters'), 10) : 1;
    this.maxEntries_ = this.element.hasAttribute('max-entries') ?
      parseInt(this.element.getAttribute('max-entries'), 10) : null;
    this.submitOnEnter_ = this.element.hasAttribute('submit-on-enter');

    this.container_ = this.createContainer_();
    this.element.appendChild(this.container_);
  }

  /**
   * Reads the 'items' data from the child <script> element.
   * For use with static local data.
   * @param {!NodeList<!Element>} scripts
   * @return {!Array<!JsonObject|string>}
   * @private
   */
  getInlineData_(scripts) {
    const jsonScripts = [];
    scripts.forEach(script => {
      if (isJsonScriptTag(script)) {
        jsonScripts.push(script);
      }
    });
    userAssert(jsonScripts.length,
        `${TAG} expected data in a <script type="application/json"> tag.`);
    const json = tryParseJson(jsonScripts[0].textContent,
        error => {
          throw error;
        });
    return json['items'] || [];
  }

  /**
   * Reads the 'items' data from the URL provided in the 'src' attribute.
   * For use with remote data.
   * @return {!Promise<!Array<string>>}
   * @private
   */
  getRemoteData_() {
    userAssert(!childElementsByTag(this.element, 'SCRIPT').length, `${TAG} 
      should contain a <script> child OR a URL specified in "src", not both.`);
    const ampdoc = this.getAmpDoc();
    const policy = UrlReplacementPolicy.ALL;
    return batchFetchJsonFor(ampdoc, this.element, /* opt_expr */ undefined,
        policy).then(json => {
      return json['items'] || [];
    });
  }

  /**
   * Creates and returns <div> that contains the template-rendered children.
   * @return {!Element}
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

    let dataPromise = Promise.resolve();
    if (this.element.hasAttribute('src')) {
      dataPromise = this.getRemoteData_();
    }

    return dataPromise.then(value => {
      this.inlineData_ = value || this.inlineData_;
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
    element.setAttribute('value', item);
    element.textContent = item;
    return element;
  }

  /**
  * Handle rendering results on user input.
  * @return {!Promise}
  * @private
  */
  inputHandler_() {
    this.userInput_ = this.inputElement_.value;
    return this.mutateElement(() => {
      this.renderResults_();
      this.toggleResults_(true);
    });
  }

  /**
   * Handle selecting items on user mousedown.
   * @param {!Event} event
   * @return {!Promise}
   * @private
   */
  selectHandler_(event) {
    return this.mutateElement(() => {
      const element = dev().assertElement(event.target);
      this.selectItem_(this.getItemElement_(element));
    });
  }

  /**
   * Render filtered results on the current input and update the container_.
   * @return {!Promise}
   * @private
   */
  renderResults_() {
    this.clearAllItems_();
    if (this.userInput_.length < this.minChars_ || !this.inlineData_) {
      return Promise.resolve();
    }

    const filteredData = this.filterData_(this.inlineData_, this.userInput_);
    let renderPromise = Promise.resolve();
    if (this.templateElement_) {
      renderPromise = this.templates_.renderTemplateArray(this.templateElement_,
          filteredData).then(renderedChildren => {
        renderedChildren.map(child => {
          child.classList.add('i-amphtml-autocomplete-item');
          child.setAttribute('role', 'listitem');
          this.container_.appendChild(child);
        });
      });
    } else {
      filteredData.forEach(item => {
        userAssert(typeof item === 'string',
            `${TAG} data must provide template for non-string items.`);
        this.container_.appendChild(
            this.createElementFromItem_(item));
      });
    }
    return renderPromise;
  }

  /**
   * Apply the filter to the given data based on the given input.
   * @param {!Array<!JsonObject|string>} data
   * @param {string} input
   * @return {!Array<!JsonObject|string>}
   * @private
   */
  filterData_(data, input) {
    input = input.toLowerCase();
    const itemsExpr = this.element.getAttribute('filter-value') || 'value';
    let filteredData = data.filter(item => {
      if (typeof item === 'object') {
        item = getValueForExpr(/** @type {!JsonObject} */(item), itemsExpr);
      }
      userAssert(typeof item === 'string',
          `${TAG} data property "${itemsExpr}" must map to string type.`);
      item = item.toLocaleLowerCase();
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
   * @private
   */
  toggleResults_(opt_display) {
    if (!this.container_) {
      return;
    }
    toggle(this.container_, opt_display);
  }

  /**
   * Handle showing or hiding results on user focus/blur.
   * @param {boolean} display
   * @return {!Promise}
   * @private
   */
  toggleResultsHandler_(display) {
    return this.mutateElement(() => {
      if (!display) {
        this.resetActiveElement_();
        this.activeIndex_ = -1;
      }
      this.toggleResults_(display);
    });
  }

  /**
   * Returns true if the results are visible and has items.
   * @return {boolean}
   * @private
   */
  resultsShowing_() {
    return !this.container_.hasAttribute('hidden') &&
      this.container_.children.length > 0;
  }

  /**
   * Returns the nearest ancestor element that is a suggested item.
   * @param {?Element} element
   * @return {?Element}
   * @private
   */
  getItemElement_(element) {
    if (element === null) {
      return null;
    }
    if (element.classList.contains('i-amphtml-autocomplete-item')) {
      return element;
    }
    return this.getItemElement_(element.parentElement);
  }

  /**
   * Writes the selected value into the input field.
   * @param {?Element} element
   * @private
   */
  selectItem_(element) {
    if (element === null) {
      return;
    }
    this.inputElement_.value = element.getAttribute('value');
    this.clearAllItems_();
  }

  /**
   * Given a delta between the current active item and the desired active item,
   * marks the desired active item as active. Loops to the beginning.
   * @param {number} delta
   * @return {!Promise}
   * @private
   */
  updateActiveItem_(delta) {
    if (delta === 0 || !this.resultsShowing_()) {
      return Promise.resolve();
    }
    const keyUpWhenNoneActive = this.activeIndex_ === -1 && delta < 0;
    const index = keyUpWhenNoneActive ? delta : this.activeIndex_ + delta;
    this.activeIndex_ = mod(index, this.container_.children.length);
    const newActiveElement = this.container_.children[this.activeIndex_];
    this.inputElement_.value = newActiveElement.getAttribute('value');
    return this.mutateElement(() => {
      this.resetActiveElement_();
      newActiveElement.classList.add('i-amphtml-autocomplete-item-active');
      this.activeElement_ = newActiveElement;
    });
  }

  /**
   * Displays the user's partial input in the input field.
   * @private
   */
  displayUserInput_() {
    this.inputElement_.value = this.userInput_;
    this.resetActiveElement_();
    this.activeIndex_ = -1;
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

  /**
   * Delete all children to the container_
   * @private
   */
  clearAllItems_() {
    removeChildren(dev().assertElement(this.container_));
  }

  /**
   * Handles keyboard events.
   * @param {!Event} event
   * @return {!Promise}
   * @private
   */
  keyDownHandler_(event) {
    switch (event.key) {
      case Keys.DOWN_ARROW:
        event.preventDefault();
        // Disrupt loop around to display user input.
        if (this.activeIndex_ === this.container_.children.length - 1) {
          this.displayUserInput_();
          return Promise.resolve();
        }
        return this.updateActiveItem_(1);
      case Keys.UP_ARROW:
        event.preventDefault();
        // Disrupt loop around to display user input.
        if (this.activeIndex_ === 0) {
          this.displayUserInput_();
          return Promise.resolve();
        }
        return this.updateActiveItem_(-1);
      case Keys.ENTER:
        if (this.activeElement_) {
          if (!this.submitOnEnter_) {
            event.preventDefault();
          }
          return this.mutateElement(() => {
            this.selectItem_(this.activeElement_);
            this.resetActiveElement_();
          });
        }
        return Promise.resolve();
      case Keys.ESCAPE:
        // Select user's partial input and hide results.
        return this.mutateElement(() => {
          this.displayUserInput_();
          this.toggleResults_(false);
        });
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
