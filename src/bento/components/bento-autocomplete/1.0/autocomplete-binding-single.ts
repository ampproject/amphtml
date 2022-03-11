import {AutocompleteBinding, InputElement} from './types';

export class AutocompleteBindingSingle implements AutocompleteBinding {
  shouldAutocomplete(): boolean {
    return true;
  }

  getUserInputForUpdate(inputEl: InputElement): string {
    return inputEl.value || '';
  }
}
