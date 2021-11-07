import {user} from '#utils/log';

/**
 * Single implementation of autocomplete. This supports autocompleting
 * a single input value in its entirety.
 * @implements {./autocomplete-binding-def.AutocompleteBindingDef}
 * @package
 */
export class AutocompleteBindingSingle {
  /**
   * @param {!AMP.BaseElement} ampElement
   */
  constructor(ampElement) {
    const {element} = ampElement;
    /**
     * The Single implementation of autocomplete should highlight
     * the diff between the user input and the active suggestion
     * when the attribute "suggest-first" is present.
     * See displayActiveItemInInput() for more.
     * @private {boolean}
     */
    this.shouldSuggestFirst_ = element.hasAttribute('suggest-first');
    const filter = element.getAttribute('filter');
    if (this.shouldSuggestFirst_ && filter !== 'prefix') {
      this.shouldSuggestFirst_ = false;
      user().warn(
        'AMP-AUTOCOMPLETE',
        '"suggest-first" expected "filter" type "prefix".'
      );
    }

    /**
     * The Single implementation of autocomplete will allow form
     * submission with selection when "submit-on-enter" is present.
     * @private {boolean}
     */
    this.submitOnEnter_ = element.hasAttribute('submit-on-enter');
  }

  /**
   * Always try to autocomplete.
   * @param {!HTMLInputElement} unusedInputEl
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
  getUserInputForUpdate(inputEl) {
    return inputEl.value || '';
  }

  /**
   * Returns the full selection.
   * @param {string} selection
   * @param {!HTMLInputElement} unusedInputEl
   * @param {string} unusedInput
   * @return {string}
   */
  getUserInputForUpdateWithSelection(selection, unusedInputEl, unusedInput) {
    return selection;
  }

  /**
   * Input element value should be reset to the partially recorded user input.
   * @param {string} userInput
   * @param {!HTMLInputElement} inputEl
   */
  resetInputOnWrapAround(userInput, inputEl) {
    inputEl.value = userInput;
  }

  /** @return {boolean} */
  shouldSuggestFirst() {
    return this.shouldSuggestFirst_;
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
   * @param {!HTMLInputElement} inputEl
   * @param {string} newValue
   * @param {string} userInput
   */
  displayActiveItemInInput(inputEl, newValue, userInput) {
    inputEl.value = newValue;

    // Should highlight when "suggest-first" is present.
    if (this.shouldSuggestFirst_) {
      inputEl.setSelectionRange(userInput.length, newValue.length);
    }
  }

  /**
   * Remove any highlighting via the SelectionAPI.
   * @param {HTMLInputElement} inputEl
   */
  removeSelectionHighlighting(inputEl) {
    const inputLength = inputEl.value.length;
    inputEl.setSelectionRange(inputLength, inputLength);
  }

  /**
   * If results are showing or the publisher provided "submit-on-enter",
   * the user should only be able to 'Enter' to select a suggestion.
   * @param {boolean} unusedActiveElement
   * @return {boolean}
   */
  shouldPreventDefaultOnEnter(unusedActiveElement) {
    return !this.submitOnEnter_;
  }
}
