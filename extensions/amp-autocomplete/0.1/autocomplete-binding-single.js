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

import {FilterType} from './amp-autocomplete';

/**
 * Single implementation of autocomplete. This supports autocompleting
 * a single input value in its entirety.
 * @implements {./autocomplete-binding-def.AutocompleteBindingDef}
 * @private
 */
export class AutocompleteBindingSingle {
  /**
   * @param {string} trigger
   * @param {?HTMLInputElement} inputEl
   * @return {boolean}
   */
  shouldAutocomplete(trigger, inputEl) {
    return true;
  }

  /**
   * @param {string} trigger
   * @param {?HTMLInputElement} inputEl
   * @return {string}
   */
  updateUserInput(trigger, inputEl) {
    return inputEl.value || '';
  }

  /**
   * @param {string} selection
   * @param {!HTMLInputElement} inputEl
   * @param {number} inputLength
   * @param {string} trigger
   * @return {string}
   */
  updateInputWithSelection(selection, inputEl, inputLength, trigger) {
    return selection;
  }

  /**
   * @return {boolean}
   */
  shouldFetch() {
    return false;
  }

  /**
   * @param {string} userInput
   * @param {?HTMLInputElement} inputEl
   */
  resetValue(userInput, inputEl) {
    if (!inputEl) {
      return;
    }
    inputEl.value = userInput;
  }

  /**
   *
   * @param {string} filter
   * @return {boolean}
   */
  shouldSuggestFirst(filter) {
    return filter === FilterType.PREFIX;
  }

  /**
   * @return {boolean}
   */
  shouldShowOnFocus() {
    return true;
  }

  /**
   *
   */
  displayActiveItemInInput(element, inputEl, userInputLength, highlight) {
    const value = element.getAttribute('data-value');
    inputEl.value = value;

    if (highlight) {
      inputEl.setSelectionRange(userInputLength, value.length);
    }
  }

  /**
   * @param {HTMLInputElement} inputEl
   */
  removeHighlighting(inputEl) {
    const inputLength = inputEl.value.length;
    inputEl.setSelectionRange(inputLength, inputLength);
  }

  /**
   * @param {Event} event
   * @param {boolean} resultsShowing
   * @param {boolean} submitOnEnter
   * @param {boolean} activeElement
   */
  maybePreventDefaultOnEnter(
    event,
    resultsShowing,
    submitOnEnter,
    activeElement
  ) {
    if (!resultsShowing || submitOnEnter) {
      return;
    }
    event.preventDefault();
  }
}
