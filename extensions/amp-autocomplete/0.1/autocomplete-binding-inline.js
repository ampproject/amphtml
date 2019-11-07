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
   *
   */
  constructor() {
    /**
     * The regex match value associated with the portion of the user input to suggest against.
     * For use when "inline_" is true.
     * @private {?RegExpResult}
     */
    this.match_ = null;
  }

  /**
   *
   * @param {string} trigger
   * @param {?HTMLInputElement} inputEl
   * @return {boolean}
   */
  shouldAutocomplete(trigger, inputEl) {
    if (!inputEl) {
      return false;
    }
    const match = this.getClosestPriorMatch_(trigger, inputEl);
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
   * @param {string} trigger
   * @param {?HTMLInputElement} unusedInputEl
   * @return {string}
   */
  updateUserInput(trigger, unusedInputEl) {
    if (!this.match_) {
      return '';
    }
    return this.match_[0].slice(trigger.length);
  }

  /**
   * @param {string} selection
   * @param {!HTMLInputElement} inputEl
   * @param {number} inputLength
   * @param {string} trigger
   * @return {string}
   */
  updateInputWithSelection(selection, inputEl, inputLength, trigger) {
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

    const pre = value.slice(0, startIndex + trigger.length);
    const post = value.slice(startIndex + trigger.length + inputLength);
    return pre + selection + ' ' + post;
  }

  /**
   * @return {boolean}
   */
  shouldFetch() {
    return true;
  }

  /**
   * @param {string} unusedUserInput
   * @param {?HTMLInputElement} unusedInputEl
   */
  resetValue(unusedUserInput, unusedInputEl) {}

  /**
   *
   * @param {string} unusedFilter
   * @return {boolean}
   */
  shouldSuggestFirst(unusedFilter) {
    return true;
  }

  /**
   *
   * @return {boolean}
   */
  shouldShowOnFocus() {
    return false;
  }

  /**
   *
   */
  displayActiveItemInInput() {}

  /**
   *
   * @param {HTMLInputElement} unusedInputEl
   */
  removeHighlighting(unusedInputEl) {}

  /**
   *
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
