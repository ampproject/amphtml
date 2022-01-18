import {tryFocus} from '#core/dom';
import {ownProperty} from '#core/types/object';

import {userAssert} from '#utils/log';

const TAG = 'amp-autocomplete';

/**
 * Inline implementation of autocomplete. This supports autocompleting
 * multiple input values as part of a larger freeform input element.
 * @implements {./autocomplete-binding-def.AutocompleteBindingDef}
 * @package
 */
export class AutocompleteBindingInline {
  /**
   * Stores the regex match value associated with the portion of the user input to suggest against.
   * For use when "inline_" is true.
   * @param {!AMP.BaseElement} ampElement
   */
  constructor(ampElement) {
    const {element} = ampElement;
    /** @private {!Element} */
    this.element_ = element;

    /** @private {string} */
    this.trigger_ = this.element_.getAttribute('inline');
    userAssert(
      this.trigger_ !== '',
      'Empty value for the "inline" attr is unsupported, %s. %s',
      TAG,
      element
    );
    userAssert(
      this.trigger_ !== '',
      `AutocompleteBindingInline does not support an empty value in the constructor.`
    );

    /** @private {?RegExpResult} */
    this.match_ = null;

    const delimiter = this.trigger_.replace(/([()[{*+.$^\\|?])/g, '\\$1');
    const pattern = `((${delimiter}|^${delimiter})(\\w+)?)`;
    this.regex_ = new RegExp(pattern, 'gm');
  }

  /**
   * Returns true if a match on the publisher-provided trigger is found in the input element value.
   * Otherwise, should not display any suggestions.
   * @param {!HTMLInputElement} inputEl
   * @return {boolean}
   */
  shouldAutocomplete(inputEl) {
    const match = this.getClosestPriorMatch_(this.regex_, inputEl);
    this.match_ = match;
    return !!match;
  }

  /**
   * Finds the closest string in the user input prior to the cursor
   * to display suggestions.
   * @param {RegExp} regex
   * @param {!HTMLInputElement} inputEl
   * @return {?RegExpResult}
   * @private
   */
  getClosestPriorMatch_(regex, inputEl) {
    if (!regex) {
      return null;
    }

    const {selectionStart: cursor, value} = inputEl;
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
  getUserInputForUpdate(unusedInputEl) {
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
   * @param {string} userInput
   * @return {string}
   */
  getUserInputForUpdateWithSelection(selection, inputEl, userInput) {
    if (!this.match_) {
      return inputEl.value;
    }
    let cursor = inputEl.selectionStart;
    const startIndex = Number(ownProperty(this.match_, 'index'));
    const userInputLength = userInput.length;
    if (cursor >= startIndex + userInputLength) {
      cursor = cursor - userInputLength;
    }

    tryFocus(inputEl);
    cursor = cursor + selection.length + 1;
    inputEl.setSelectionRange(cursor, cursor);
    this.match_ = null;

    const {value} = inputEl;

    const pre = value.slice(0, startIndex + this.trigger_.length);
    const post = value.slice(
      startIndex + this.trigger_.length + userInputLength
    );
    return pre + selection + ' ' + post;
  }

  /**
   * @param {string} unusedUserInput
   * @param {!HTMLInputElement} unusedInputEl
   */
  resetInputOnWrapAround(unusedUserInput, unusedInputEl) {}

  /**
   * Always accept the "suggest-first" attribute regardless of filter type.
   * This is because this binding does not perform any highlighting via the
   * SelectionAPI when a user navigates to an unselected suggestion item.
   * @return {boolean}
   */
  shouldSuggestFirst() {
    return this.element_.hasAttribute('suggest-first');
  }

  /**
   * Never show suggestions on focus because focus occurs every selection.
   * @return {boolean}
   */
  shouldShowOnFocus() {
    return false;
  }

  /**
   * @param {!HTMLInputElement} unusedInputEl
   * @param {string} unusedNewValue
   * @param {string} unusedUserInput
   */
  displayActiveItemInInput(unusedInputEl, unusedNewValue, unusedUserInput) {}

  /**
   * @param {HTMLInputElement} unusedInputEl
   */
  removeSelectionHighlighting(unusedInputEl) {}

  /**
   * If results are not showing or there is no actively navigated-to suggestion item,
   * the user should be able to 'Enter' to add a new line.
   * @param {boolean} activeElement
   * @return {boolean}
   */
  shouldPreventDefaultOnEnter(activeElement) {
    return activeElement;
  }
}
