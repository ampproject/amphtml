import {ComponentChildren, ComponentProps, VNode} from '#preact/types';

const filterTypes = [
  'substring',
  'prefix',
  'token-prefix',
  'fuzzy',
  'custom',
  'none',
] as const;

export type FilterType = (typeof filterTypes)[number];

export function isValidFilterType(filterType: any): filterType is FilterType {
  return filterTypes.includes(filterType);
}

export type Item = string | object;

export type OnSelectData = {value: string; valueAsObject?: object};

export type InputElement = HTMLInputElement | HTMLTextAreaElement;

export type ItemTemplateProps = {
  'data-value'?: string;
  'data-disabled'?: boolean;
};

export type ItemNode = VNode<ItemTemplateProps> | null;

export type ItemTemplateFn = (item: Item) => ItemNode;
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
  itemTemplate?: ItemTemplateFn;
  prefetch?: boolean;
  submitOnEnter?: boolean;
  suggestFirst?: boolean;
  src?: string;
  parseJson?: (response: any) => Item[];
  query?: string;
}

export interface AutocompleteItemProps extends ComponentProps<any> {
  item: Item;
  itemTemplate: ItemTemplateFn;
  onError?: (message: string) => void;
  selected?: boolean;
}

export interface AutocompleteBinding {
  shouldAutocomplete(inputEl: InputElement): boolean;
  getUserInputForUpdate(inputEl: InputElement): string;
  shouldShowOnFocus: boolean;
  shouldPreventDefaultOnEnter(
    activeElement: boolean,
    submitOnEnter: boolean
  ): boolean;
}
