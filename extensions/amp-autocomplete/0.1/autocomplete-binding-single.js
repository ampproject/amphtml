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

/**
 * Single implementation of autocomplete. This supports autocompleting
 * a single input value in its entirety.
 * @implements {./autocomplete-binding-def.AutocompleteBindingDef}
 * @private
 */
export class AutocompleteBindingSingle {
  /**
   * Always try to autocomplete.
   * @param {?HTMLInputElement} unusedInputEl
   * @return {boolean}
   */
  shouldAutocomplete(unusedInputEl) {
    return true;
  }

  /**
   * The user input for generating suggestions is the full entry in the input element so far.
   * @param {?HTMLInputElement} inputEl
   * @return {string}
   */
  updateUserInput(inputEl) {
    return inputEl.value || '';
  }

  /**
   * Returns the full selection.
   * @param {string} selection
   * @param {!HTMLInputElement} unusedInputEl
   * @param {number} unusedInputLength
   * @return {string}
   */
  updateInputWithSelection(selection, unusedInputEl, unusedInputLength) {
    return selection;
  }

  /**
   * Input element value should be reset to the partially recorded user input.
   * @param {string} userInput
   * @param {!HTMLInputElement} inputEl
   */
  resetValue(userInput, inputEl) {
    inputEl.value = userInput;
  }

  /**
   * Should only abide by "suggest-first" attribute if "filter" is "prefix".
   * @param {string} filter
   * @return {boolean}
   */
  shouldSuggestFirst(filter) {
    return filter === 'prefix';
  }

  /**
   * Always display suggestions if there are any on focus.
   * @return {boolean}
   */
  shouldShowOnFocus() {
    return true;
  }

  /**
   * Replace the input element value with the navigated-to suggestion item and
   * highlight the difference between the possible selection and the user input.
   *
   * e.g. User input "ba" + navigation to "banana" will display "ba|nana|",
   * where |nana| is highlighted in the input field via the SelectionAPI.
   * @param {!HTMLElement} element
   * @param {!HTMLInputElement} inputEl
   * @param {number} userInputLength
   * @param {boolean} highlight
   */
  displayActiveItemInInput(element, inputEl, userInputLength, highlight) {
    const value = element.getAttribute('data-value');
    inputEl.value = value;

    if (highlight) {
      inputEl.setSelectionRange(userInputLength, value.length);
    }
  }

  /**
   * Remove any highlighting via the SelectionAPI.
   * @param {HTMLInputElement} inputEl
   */
  removeHighlighting(inputEl) {
    const inputLength = inputEl.value.length;
    inputEl.setSelectionRange(inputLength, inputLength);
  }

  /**
   * If results are showing or the publisher provided "submit-on-enter",
   * the user should only be able to 'Enter' to select a suggestion.
   * @param {Event} event
   * @param {boolean} resultsShowing
   * @param {boolean} submitOnEnter
   * @param {boolean} unusedActiveElement
   */
  maybePreventDefaultOnEnter(
    event,
    resultsShowing,
    submitOnEnter,
    unusedActiveElement
  ) {
    if (!resultsShowing || submitOnEnter) {
      return;
    }
    event.preventDefault();
  }
}
