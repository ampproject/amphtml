/**
 * AutocompleteBindingDef is an interface that provides the specific
 * implementation of amp-autocomplete user input interaction behavior.
 * @interface
 */
export class AutocompleteBindingDef {
  /**
   * Whether the binding should attempt to display
   * autocomplete suggestions on user input.
   * @param {!HTMLInputElement} unusedInputEl
   * @return {boolean}
   */
  shouldAutocomplete(unusedInputEl) {}

  /**
   * The value to use as the partial user input when generating autocomplete suggestions
   * @param {!HTMLInputElement} unusedInputEl
   * @return {string}
   */
  getUserInputForUpdate(unusedInputEl) {}

  /**
   * The value to show in the user input element after a suggestion has been selected
   * @param {string} unusedSelection
   * @param {!HTMLInputElement} unusedInputEl
   * @param {string} unusedInput
   * @return {string}
   */
  getUserInputForUpdateWithSelection(
    unusedSelection,
    unusedInputEl,
    unusedInput
  ) {}

  /**
   * Restore the input element to display the user's non-autocompleted partial string
   * @param {string} unusedUserInput
   * @param {!HTMLInputElement} unusedInputEl
   */
  resetInputOnWrapAround(unusedUserInput, unusedInputEl) {}

  /**
   * Whether or not the autocomplete can abide by the "suggest-first" attribute
   * @return {boolean}
   */
  shouldSuggestFirst() {}

  /**
   * Whether or not the autocomplete should show suggestions when the input element has been focused
   * @return {boolean}
   */
  shouldShowOnFocus() {}

  /**
   * Updates the input element text with the user highlighted active suggestion (before selection)
   *
   * @param {!HTMLInputElement} unusedInputEl
   * @param {string} unusedNewValue
   * @param {string} unusedUserInput
   */
  displayActiveItemInInput(unusedInputEl, unusedNewValue, unusedUserInput) {}

  /**
   * Resets any highlighting done by the SelectionAPI
   * @param {HTMLInputElement} unusedInputEl
   */
  removeSelectionHighlighting(unusedInputEl) {}

  /**
   * Whether the autocomplete should escape the 'Enter' keydown event
   * @param {boolean} unusedActiveElement
   * @return {boolean}
   */
  shouldPreventDefaultOnEnter(unusedActiveElement) {}
}
