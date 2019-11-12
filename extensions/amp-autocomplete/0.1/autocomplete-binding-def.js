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
   * Whether the binding should attempt to display
   * autocomplete suggestions on user input.
   * @param {string} unusedTrigger
   * @param {!HTMLInputElement} unusedInputEl
   * @return {boolean}
   */
  shouldAutocomplete(unusedTrigger, unusedInputEl) {}

  /**
   * @param {string} unusedTrigger
   * @param {!HTMLInputElement} unusedInputEl
   * @return {string}
   */
  updateUserInput(unusedTrigger, unusedInputEl) {}

  /**
   * @param {string} unusedSelection
   * @param {!HTMLInputElement} unusedInputEl
   * @param {number} unusedInputLength
   * @param {string} unusedTrigger
   * @return {string}
   */
  updateInputWithSelection(
    unusedSelection,
    unusedInputEl,
    unusedInputLength,
    unusedTrigger
  ) {}

  /**
   * @return {boolean}
   */
  shouldFetch() {}

  /**
   * @param {string} unusedUserInput
   * @param {!HTMLInputElement} unusedInputEl
   */
  resetValue(unusedUserInput, unusedInputEl) {}

  /**
   * @param {string} unusedFilter
   * @return {boolean}
   */
  shouldSuggestFirst(unusedFilter) {}

  /**
   * @return {boolean}
   */
  shouldShowOnFocus() {}

  /**
   * @param {!HTMLElement} unusedElement
   * @param {!HTMLInputElement} unusedInputEl
   * @param {number} unusedUserInputLength
   * @param {boolean} unusedHighlight
   */
  displayActiveItemInInput(
    unusedElement,
    unusedInputEl,
    unusedUserInputLength,
    unusedHighlight
  ) {}

  /**
   * @param {HTMLInputElement} unusedInputEl
   */
  removeHighlighting(unusedInputEl) {}

  /**
   * @param {Event} unusedEvent
   * @param {boolean} unusedResultsShowing
   * @param {boolean} unusedSubmitOnEnter
   * @param {boolean} unusedActiveElement
   */
  maybePreventDefaultOnEnter(
    unusedEvent,
    unusedResultsShowing,
    unusedSubmitOnEnter,
    unusedActiveElement
  ) {}
}
