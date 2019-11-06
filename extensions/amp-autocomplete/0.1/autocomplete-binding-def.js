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
 * AutocompleteBindingDef is an interface that provides the specific
 * implementation of amp-autocomplete user input interaction behavior.
 * @interface
 */
export class AutocompleteBindingDef {
  /**
   * @param {string} trigger
   * @param {?HTMLInputElement} inputEl
   * @return {boolean}
   */
  shouldAutocomplete(trigger, inputEl) {}

  /**
   * @param {string} trigger
   * @param {?HTMLInputElement} inputEl
   * @return string
   */
  updateUserInput(trigger, inputEl) {}

  /**
   * @param {string} selection
   * @param {!HTMLInputElement} inputEl
   * @param {number} inputLength
   * @param {string} trigger
   * @return {string}
   */
  updateInputWithSelection(selection, inputEl, inputLength, trigger) {}

  /**
   * @return {boolean}
   */
  shouldFetch() {}

  /**
   * @param {string} userInput
   * @param {?HTMLInputElement} inputEl
   */
  resetValue(userInput, inputEl) {}

  /**
   * @param {string} filter
   * @return {boolean}
   */
  shouldSuggestFirst(filter) {}

  /**
   * @return {boolean}
   */
  shouldShowOnFocus() {}

  /**
   * @param {*} element
   * @param {*} inputEl
   * @param {*} userInputLength
   * @param {*} highlight
   */
  displayActiveItemInInput(element, inputEl, userInputLength, highlight) {}

  /**
   * @param {HTMLInputElement} inputEl
   */
  removeHighlighting(inputEl) {}

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
  ) {}
}
