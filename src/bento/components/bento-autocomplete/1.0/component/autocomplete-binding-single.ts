import {AutocompleteBinding, InputElement} from '../types';

export class AutocompleteBindingSingle implements AutocompleteBinding {
  get shouldShowOnFocus() {
    return true;
  }

  shouldAutocomplete(): boolean {
    return true;
  }

  getUserInputForUpdate(inputEl: InputElement): string {
    return inputEl.value || '';
  }

  shouldPreventDefaultOnEnter(
    unusedActiveElement: boolean,
    submitOnEnter: boolean
  ): boolean {
    return !submitOnEnter;
  }
}
