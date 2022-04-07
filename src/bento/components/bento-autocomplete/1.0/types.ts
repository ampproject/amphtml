import {Component, ComponentChildren} from '#preact/types';

const filterTypes = [
  'substring',
  'prefix',
  'token-prefix',
  'fuzzy',
  'custom',
  'none',
] as const;

export type FilterType = typeof filterTypes[number];

export function isValidFilterType(filterType: any): filterType is FilterType {
  return filterTypes.includes(filterType);
}

export type Item = string | object;

export type OnSelectData = {value: string; valueAsObject?: object};

export interface BentoAutocompleteProps {
  id?: string;
  onError?: (message: string) => void;
  onSelect?: (data: OnSelectData) => void;
  children?: ComponentChildren;
  filter?: FilterType;
  minChars?: number;
  items?: Item[];
  filterValue?: string;
  maxItems?: number;
  highlightUserEntry?: boolean;
  inline?: string;
  itemTemplate?: (item: Item) => Component<any>;
  suggestFirst?: boolean;
  src?: string;
  fetchJson?: (src: string) => Promise<Item[]>;
  parseJson?: (response: any) => Item[];
  query?: string;
}

export type InputElement = HTMLInputElement | HTMLTextAreaElement;

export interface AutocompleteBinding {
  shouldAutocomplete(inputEl: InputElement): boolean;
  getUserInputForUpdate(inputEl: InputElement): string;
  shouldShowOnFocus: boolean;
}

export type ItemTemplateProps = {
  'data-value'?: string;
  'data-disabled'?: boolean;
};
