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

import {ActionTrust} from '../../../src/action-constants';
import {CSS} from '../../../build/amp-autocomplete-0.1.css';
import {Keys} from '../../../src/utils/key-codes';
import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {UrlReplacementPolicy,
  batchFetchJsonFor} from '../../../src/batched-json';
import {childElementsByTag, removeChildren} from '../../../src/dom';
import {createCustomEvent} from '../../../src/event-helper';
import {dev, user, userAssert} from '../../../src/log';
import {getValueForExpr, tryParseJson} from '../../../src/json';
import {hasOwn, map, ownProperty} from '../../../src/utils/object';
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
    this.sourceData_ = null;

    /**
     * The reference to the <input> tag provided as a child.
     * @private {?HTMLInputElement}
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
     * If the "suggest-first" attribute is present on <autocomplete> 
     * and the filter type is "prefix".
     */
    this.suggestFirst_ = false;

    /**
     * Whether or not an item is currently suggested by suggestFirst_.
     */
    this.typeaheadActive_ = false;

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

    /**
     * The developer specified value of the 'autocomplete' attribute on the
     * <form> ancestor that contains <amp-autocomplete>. Used to reset the
     * attribute on blurring the input field. 'on' by default, according to
     * common browser practices.
     * @private {?string}
     */
    this.initialAutocompleteAttr_ = null;

    /** @const @private {!../../../src/service/template-impl.Templates} */
    this.templates_ = Services.templatesFor(this.win);

    /**
     * The reference to the <template> tag provided as a child.
     * @private {?Element}
     */
    this.templateElement_ = null;

    /** @private {?../../../src/service/action-impl.ActionService} */
    this.action_ = null;

    /** @private {?../../../src/service/viewport/viewport-impl.Viewport} */
    this.viewport_ = null;
  }

  /** @override */
  buildCallback() {
    userAssert(isExperimentOn(this.win, 'amp-autocomplete'),
        `Experiment ${EXPERIMENT} is not turned on.`);

    this.action_ = Services.actionServiceForDoc(this.element);
    this.viewport_ = Services.viewportForDoc(this.element);

    const jsonScript =
      this.element.querySelector('script[type="application/json"]');
    if (jsonScript) {
      this.sourceData_ = this.getInlineData_(jsonScript);
    } else if (!this.element.hasAttribute('src')) {
      user().warn(TAG, 'Expected a <script type="application/json"> child or '
        + 'a URL specified in "src".');
    }

    const inputElements = childElementsByTag(this.element, 'INPUT');
    userAssert(inputElements.length === 1,
        `${TAG} should contain exactly one <input> child`);
    this.inputElement_ = /** @type {!HTMLInputElement} */ (inputElements[0]);
    userAssert(this.inputElement_.hasAttribute('type'),
        `${TAG} requires the "type" attribute on <input>`);
    const inputType = this.inputElement_.getAttribute('type');
    userAssert(inputType === 'text' || inputType === 'search',
        `${TAG} requires the "type=text|search" attribute on <input>`);

    userAssert(this.inputElement_.form, `${TAG} should be inside a <form> tag`);
    if (this.inputElement_.form.hasAttribute('autocomplete')) {
      this.initialAutocompleteAttr_ =
      this.inputElement_.form.getAttribute('autocomplete');
    }

    if (this.templates_.hasTemplate(
        this.element, 'template, script[template]')) {
      this.templateElement_ =
        this.templates_.findTemplate(this.element,
            'template, script[template]');
      // Dummy render to verify existence of "data-value" attribute.
      this.templates_.renderTemplate(this.templateElement_,
          /** @type {!JsonObject} */({})).then(
          renderedEl => {
            userAssert(renderedEl.hasAttribute('data-value') ||
              renderedEl.hasAttribute('data-disabled'),
            `${TAG} requires a "data-value" or "data-disabled" attribute.`);
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
    this.suggestFirst_ = this.element.hasAttribute('suggest-first') 
      && this.filter_ === FilterType.PREFIX;

    this.container_ = this.createContainer_();
    this.element.appendChild(this.container_);
  }

  /**
   * Reads the 'items' data from the child <script> element.
   * For use with static local data.
   * @param {!Element} script
   * @return {!Array<!JsonObject|string>}
   * @private
   */
  getInlineData_(script) {
    const json = tryParseJson(script.textContent,
        error => {
          throw error;
        });
    const items = json['items'];
    if (!items) {
      user().warn(TAG, 'Expected key "items" in data but found nothing. '
        + 'Rendering empty results.');
      return [];
    }
    return items;
  }

  /**
   * Reads the 'items' data from the URL provided in the 'src' attribute.
   * For use with remote data.
   * @return {!Promise<!Array<string>>}
   * @private
   */
  getRemoteData_() {
    const ampdoc = this.getAmpDoc();
    const policy = UrlReplacementPolicy.ALL;
    return batchFetchJsonFor(ampdoc, this.element, /* opt_expr */ undefined,
        policy).then(json => {
      const items = json['items'];
      if (!items) {
        user().warn(TAG, 'Expected key "items" in data but found nothing. '
          + 'Rendering empty results.');
        return [];
      }
      return items;
    });
  }

  /**
   * Creates and returns <div> that contains the template-rendered children.
   * Should be called in a measureMutate context.
   * @return {!Element}
   * @private
   */
  createContainer_() {
    const container = this.element.ownerDocument.createElement('div');
    container.classList.add('i-amphtml-autocomplete-results');
    if (this.shouldRenderAbove_()) {
      container.classList.add('i-amphtml-autocomplete-results-up');
    }
    container.setAttribute('role', 'list');
    toggle(container, false);
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

    let remoteDataPromise = Promise.resolve();
    if (this.element.hasAttribute('src')) {
      if (this.sourceData_) {
        user().warn(TAG, 'Discovered both inline <script> and remote "src"'
        + ' data. Was providing two datasets intended?');
      }
      remoteDataPromise = this.getRemoteData_();
    }

    return remoteDataPromise.then(remoteData => {
      // If both types of data are provided, display remote data.
      this.sourceData_ = remoteData || this.sourceData_;
      this.filterDataAndRenderResults_(this.sourceData_);
    });
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    const src = mutations['src'];
    if (src === undefined || src === null) {
      return Promise.resolve();
    }
    if (typeof src === 'string') {
      return this.getRemoteData_().then(remoteData => {
        this.sourceData_ = remoteData;
        this.filterDataAndRenderResults_(this.sourceData_, this.userInput_);
      });
    }
    if (typeof src === 'object') {
      this.sourceData_ = src['items'] || [];
      return this.filterDataAndRenderResults_(this.sourceData_,
          this.userInput_);
    }
    user().error(TAG, 'Unexpected "src" type: ' + src);
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
    element.setAttribute('data-value', item);
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
      this.filterDataAndRenderResults_(this.sourceData_, this.userInput_);
      this.toggleResults_(true);
      if (this.suggestFirst_) {
        this.updateActiveItem_(1);
        this.inputElement_.setSelectionRange(this.userInput_.length, 
          this.inputElement_.value.length);
      }
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
   * Filter the source data according to the given opt_input and render it in
   * the results container_.
   * @param {?Array<!JsonObject|string>} sourceData
   * @param {string=} opt_input
   * @return {!Promise}
   * @private
   */
  filterDataAndRenderResults_(sourceData, opt_input = '') {
    this.clearAllItems_();
    if (opt_input.length < this.minChars_ || !sourceData ||
      !sourceData.length) {
      return Promise.resolve();
    }
    const filteredData = this.filterData_(sourceData, opt_input);
    return this.renderResults_(filteredData,
        dev().assertElement(this.container_));
  }

  /**
   * Render the given data into item elements in the given container element.
   * @param {!Array<!JsonObject|string>} filteredData
   * @param {!Element} container
   * @return {!Promise}
   * @private
   */
  renderResults_(filteredData, container) {
    let renderPromise = Promise.resolve();
    this.resetActiveElement_();
    if (this.templateElement_) {
      renderPromise = this.templates_.renderTemplateArray(this.templateElement_,
          filteredData).then(renderedChildren => {
        renderedChildren.map(child => {
          if (child.hasAttribute('data-disabled')) {
            child.setAttribute('aria-disabled', 'true');
          }
          child.classList.add('i-amphtml-autocomplete-item');
          child.setAttribute('role', 'listitem');
          container.appendChild(child);
        });
      });
    } else {
      filteredData.forEach(item => {
        userAssert(typeof item === 'string',
            `${TAG} data must provide template for non-string items.`);
        container.appendChild(this.createElementFromItem_(
            /** @type {string} */ (item)));
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
    // Server-side filtering.
    if (this.filter_ === FilterType.NONE) {
      return this.truncateToMaxEntries_(data);
    }

    // Client-side filtering.
    input = input.toLocaleLowerCase();
    const itemsExpr = this.element.getAttribute('filter-value') || 'value';
    const filteredData = data.filter(item => {
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
          return this.tokenPrefixMatch_(item, input);
        case FilterType.FUZZY:
          throw new Error(`Filter not yet supported: ${this.filter_}`);
        case FilterType.CUSTOM:
          throw new Error(`Filter not yet supported: ${this.filter_}`);
        default:
          throw new Error(`Unexpected filter: ${this.filter_}`);
      }
    });

    return this.truncateToMaxEntries_(filteredData);
  }

  /**
   * Returns true if the given input string is a token-prefix match on the
   * given item string. Assumes toLocaleLowerCase() has been performed on both
   * parameters.
   *
   * Matches:
   * washington dc, dc
   * washington dc, wash
   * washington dc, dc washington
   * new york ny, new york
   *
   * Non-matches:
   * washington dc, district of columbia
   * washington dc, washington d c
   * washington dc, ashington dc
   *
   * @param {string} item
   * @param {string} input
   * @return {boolean}
   * @private
   */
  tokenPrefixMatch_(item, input) {
    if (input === '') {
      return true;
    }

    const itemTokens = this.tokenizeString_(item);
    const inputTokens = this.tokenizeString_(input);

    // Match each input token (except the last one) to an item token
    const itemTokensMap = this.mapFromTokensArray_(itemTokens);
    const lastInputToken = inputTokens[inputTokens.length - 1];
    inputTokens.splice(inputTokens.length - 1, 1);
    let match = true;
    for (let i = 0; i < inputTokens.length; i++) {
      const token = inputTokens[i];
      if (token === '') {
        continue;
      }
      if (!hasOwn(itemTokensMap, token)) {
        match = false;
        break;
      }
      const count = Number(ownProperty(itemTokensMap, token));
      if (count > 1) {
        itemTokensMap[token] = count - 1;
      } else {
        delete itemTokensMap[token];
      }
    }

    // Return that the last input token is a prefix of one of the item tokens
    const remainingItemTokens = Object.keys(itemTokensMap);
    return match && (lastInputToken === '' ||
      remainingItemTokens.some(itemToken => {
        return startsWith(itemToken, lastInputToken);
      }));
  }

  /**
   * Takes a string, removes '.', and splits by special characters.
   * Returns the resulting array of tokens.
   * @param {string} inputStr
   * @return {!Array<string>}
   * @private
   */
  tokenizeString_(inputStr) {
    inputStr = inputStr.replace(/[\.]+/g, '');
    return inputStr.split(/[`~(){}_|+\-;:\'",\[\]\\\/ ]+/g);
  }

  /**
   * Returns the given tokens array as a dictionary of key: token (str) and
   * value: number of occurrences.
   * @param {!Array<string>} tokens
   * @return {!Object<string, number>}
   * @private
   */
  mapFromTokensArray_(tokens) {
    const tokensMap = map();
    tokens.forEach(token => {
      const count = hasOwn(tokensMap, token) ?
        ownProperty(tokensMap, token) + 1 : 1;
      tokensMap[token] = count;
    });
    return tokensMap;
  }

  /**
   * Truncate the given data to a maximum length of the max-entries attribute.
   * @param {!Array<!JsonObject|string>} data
   * @return {!Array<!JsonObject|string>}
   * @private
   */
  truncateToMaxEntries_(data) {
    if (this.maxEntries_ && this.maxEntries_ < data.length) {
      data = data.slice(0, this.maxEntries_);
    }
    return data;
  }

  /**
   * Shows or hides the results container_.
   * @param {boolean=} opt_display
   * @private
   */
  toggleResults_(opt_display) {
    toggle(dev().assertElement(this.container_), opt_display);
  }

  /**
   * Disables or re-enables the browser autofill on the autocomplete input.
   * Then handles showing or hiding results on user focus/blur.
   * @param {boolean} display
   * @return {!Promise}
   * @private
   */
  toggleResultsHandler_(display) {
    // Set/reset "autocomplete" attribute on the <form> ancestor.
    if (display) {
      this.inputElement_.form.setAttribute('autocomplete', 'off');
    } else if (this.initialAutocompleteAttr_) {
      this.inputElement_.form.setAttribute('autocomplete',
          this.initialAutocompleteAttr_);
    } else {
      this.inputElement_.form.removeAttribute('autocomplete');
    }

    // Toggle results.
    let renderAbove = false;
    return this.measureMutateElement(() => {
      renderAbove = this.shouldRenderAbove_();
    }, () => {
      if (!display) {
        this.userInput_ = this.inputElement_.value;
        this.filterDataAndRenderResults_(this.sourceData_, this.userInput_);
        this.resetActiveElement_();
        this.setResultDisplayDirection_(renderAbove);
      }
      this.toggleResults_(display);
    });
  }

  /**
   * Display results upwards or downwards based on location in the viewport.
   * Should be called in a measureMutate context.
   * @param {boolean} renderAbove
   * @private
   */
  setResultDisplayDirection_(renderAbove) {
    this.container_.classList.toggle(
        'i-amphtml-autocomplete-results-up', renderAbove);
  }

  /**
   * Returns true if the input is in the bottom half of the viewport.
   * Should be called in a measureMutate context.
   * @return {boolean}
   * @private
   */
  shouldRenderAbove_() {
    const viewHeight = this.viewport_.getHeight() || 0;
    return this.inputElement_./*OK*/getBoundingClientRect().top
      > (viewHeight / 2);
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
    if (element === null || element.hasAttribute('data-disabled')) {
      return;
    }
    this.inputElement_.value = this.userInput_ =
      element.getAttribute('data-value');
    this.fireSelectEvent_(this.userInput_);
    this.clearAllItems_();
  }

  /**
   * Triggers a 'select' event with the given value as the value emitted.
   * @param {string} value
   * @private
   */
  fireSelectEvent_(value) {
    const name = 'select';
    const selectEvent = createCustomEvent(this.win,
        `amp-autocomplete.${name}`, /** @type {!JsonObject} */({value}));
    this.action_.trigger(this.element, name, selectEvent, ActionTrust.HIGH);
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
    // Active element logic
    const keyUpWhenNoneActive = this.activeIndex_ === -1 && delta < 0;
    const index = keyUpWhenNoneActive ? delta : this.activeIndex_ + delta;
    const enabledElements = this.getEnabledItems_();
    if (enabledElements.length === 0) {
      return Promise.resolve();
    }
    const activeIndex = mod(index, enabledElements.length);
    const newActiveElement = enabledElements[activeIndex];
    this.inputElement_.value = newActiveElement.getAttribute('data-value');

    // Element visibility logic
    let shouldScroll, newTop;

    return this.measureMutateElement(() => {
      const {offsetTop: itemTop, offsetHeight: itemHeight} = newActiveElement;
      const {scrollTop: resultTop, offsetHeight: resultHeight} =
        this.container_;
      shouldScroll = (resultTop > itemTop ||
        resultTop + resultHeight < itemTop + itemHeight);
      newTop = delta > 0 ? itemTop + itemHeight - resultHeight : itemTop;
    }, () => {
      if (shouldScroll) {
        this.container_./*OK*/scrollTop = newTop;
      }
      this.resetActiveElement_();
      newActiveElement.classList.add('i-amphtml-autocomplete-item-active');
      this.activeIndex_ = activeIndex;
      this.activeElement_ = newActiveElement;
    });
  }

  /** Returns all item elements in the results container that do not have the
   * 'data-disabled' attribute.
   * @return {!NodeList}
   * @private
   */
  getEnabledItems_() {
    return this.container_.querySelectorAll(
        '.i-amphtml-autocomplete-item:not([data-disabled])');
  }

  /**
   * Displays the user's partial input in the input field.
   * @private
   */
  displayUserInput_() {
    this.inputElement_.value = this.userInput_;
    this.resetActiveElement_();
  }

  /**
   * Resets the activeIndex_, activeElement_ and removes its 'active' class.
   * Should be called in a measureMutate context.
   * @private
   */
  resetActiveElement_() {
    if (!this.activeElement_) {
      return;
    }
    this.activeElement_.classList.toggle(
        'i-amphtml-autocomplete-item-active', false);
    this.activeElement_ = null;
    this.activeIndex_ = -1;
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
        if (this.resultsShowing_()) {
          // Disrupt loop around to display user input.
          if (this.activeIndex_ === this.getEnabledItems_().length - 1) {
            this.displayUserInput_();
            return Promise.resolve();
          }
          return this.updateActiveItem_(1);
        }
        return this.mutateElement(() => {
          this.filterDataAndRenderResults_(this.sourceData_, this.userInput_);
          this.toggleResults_(true);
        });
      case Keys.UP_ARROW:
        event.preventDefault();
        // Disrupt loop around to display user input.
        if (this.activeIndex_ === 0) {
          this.displayUserInput_();
          return Promise.resolve();
        }
        return this.updateActiveItem_(-1);
      case Keys.ENTER:
        if (this.resultsShowing_() && !this.submitOnEnter_) {
          event.preventDefault();
        }
        if (this.activeElement_) {
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
      case Keys.TAB:
        if (this.activeElement_) {
          this.userInput_ = this.inputElement_.value;
          this.fireSelectEvent_(this.userInput_);
        }
        return Promise.resolve();
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
