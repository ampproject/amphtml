import {Item} from './types';

export const DEFAULT_ON_ERROR = (message: string) => {
  throw new Error(message);
};

export const TAG = 'bento-autocomplete';

export const DEFAULT_PARSE_JSON = (response: {items: Item[]}) => response.items;
