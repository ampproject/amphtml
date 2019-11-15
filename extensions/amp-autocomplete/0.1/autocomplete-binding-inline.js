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

import {ownProperty} from '../../../src/utils/object';
import {tryFocus} from '../../../src/dom';

/**
 * Inline implementation of autocomplete. This supports autocompleting
 * multiple input values as part of a larger freeform input element.
 * @implements {./autocomplete-binding-def.AutocompleteBindingDef}
 * @private
 */
export class AutocompleteBindingInline {
  /**
   * Stores the regex match value associated with the portion of the user input to suggest against.
   * For use when "inline_" is true.
   * @param {string} trigger
   */
  constructor(trigger) {
    /** @private {string} */
    this.trigger_ = trigger;

    /** @private {?RegExpResult} */
    this.match_ = null;
  }

  /**
   * Returns true if a match on the publisher-provided trigger is found in the input element value.
   * Otherwise, should not display any suggestions.
   * @param {!HTMLInputElement} inputEl
   * @return {boolean}
   */
  shouldAutocomplete(inputEl) {
    const match = this.getClosestPriorMatch_(this.trigger_, inputEl);
    this.match_ = match;
    return !!match;
  }

  /**
   * Finds the closest string in the user input prior to the cursor
   * to display suggestions.
   * @param {string} trigger
   * @param {!HTMLInputElement} inputEl
   * @return {?RegExpResult}
   * @private
   */
  getClosestPriorMatch_(trigger, inputEl) {
    if (trigger === '') {
      return null;
    }

    const delimiter = trigger.replace(/([()[{*+.$^\\|?])/g, '\\$1');
    const pattern = `((${delimiter}|^${delimiter})(\\w+)?)`;
    const regex = new RegExp(pattern, 'gm');
    const {value, selectionStart: cursor} = inputEl;
    let match, lastMatch;

    while ((match = regex.exec(value)) !== null) {
      if (match[0].length + ownProperty(match, 'index') > cursor) {
        break;
      }
      lastMatch = match;
    }

    if (
      !lastMatch ||
      lastMatch[0].length + ownProperty(lastMatch, 'index') < cursor
    ) {
      return null;
    }
    return lastMatch;
  }

  /**
   * Display suggestions based on the partial string following the trigger
   * in the input element value.
   * @param {!HTMLInputElement} unusedInputEl
   * @return {string}
   */
  updateUserInput(unusedInputEl) {
    if (!this.match_ || !this.match_[0]) {
      return '';
    }
    return this.match_[0].slice(this.trigger_.length);
  }

  /**
   * Replace the user input matched in the input element value with the
   * selected item value from the autocomplete suggestions.
   * @param {string} selection
   * @param {!HTMLInputElement} inputEl
   * @param {number} inputLength
   * @return {string}
   */
  updateInputWithSelection(selection, inputEl, inputLength) {
    if (!this.match_) {
      return inputEl.value;
    }
    let cursor = inputEl.selectionStart;
    const startIndex = Number(ownProperty(this.match_, 'index'));
    if (cursor >= startIndex + inputLength) {
      cursor = cursor - inputLength;
    }

    tryFocus(inputEl);
    cursor = cursor + selection.length + 1;
    inputEl.setSelectionRange(cursor, cursor);
    this.match_ = null;

    const {value} = inputEl;

    const pre = value.slice(0, startIndex + this.trigger_.length);
    const post = value.slice(startIndex + this.trigger_.length + inputLength);
    return pre + selection + ' ' + post;
  }

  /**
   * @param {string} unusedUserInput
   * @param {!HTMLInputElement} unusedInputEl
   */
  resetInput(unusedUserInput, unusedInputEl) {}

  /**
   * Always accept the "suggest-first" attribute regardless of filter type.
   * This is because this binding does not perform any highlighting via the
   * SelectionAPI when a user navigates to an unselected suggestion item.
   * @param {string} unusedFilter
   * @return {boolean}
   */
  shouldSuggestFirst(unusedFilter) {
    return true;
  }

  /**
   * Never show suggestions on focus because focus occurs every selection.
   * @return {boolean}
   */
  shouldShowOnFocus() {
    return false;
  }

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
   * If results are not showing or there is no actively navigated-to suggestion item,
   * the user should be able to 'Enter' to add a new line.
   * @param {Event} event
   * @param {boolean} resultsShowing
   * @param {boolean} unusedSubmitOnEnter
   * @param {boolean} activeElement
   */
  maybePreventDefaultOnEnter(
    event,
    resultsShowing,
    unusedSubmitOnEnter,
    activeElement
  ) {
    if (!resultsShowing || !activeElement) {
      return;
    }
    event.preventDefault();
  }
}
