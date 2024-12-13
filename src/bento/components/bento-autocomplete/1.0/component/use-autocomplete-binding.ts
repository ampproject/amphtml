import {AutocompleteBindingInline} from './autocomplete-binding-inline';
import {AutocompleteBindingSingle} from './autocomplete-binding-single';

import {AutocompleteBinding} from '../types';

export const useAutocompleteBinding: (
  trigger?: string
) => AutocompleteBinding = (trigger) => {
  if (!!trigger) {
    return new AutocompleteBindingInline(trigger);
  }
  return new AutocompleteBindingSingle();
};
