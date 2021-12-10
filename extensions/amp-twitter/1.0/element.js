import {createParseAttrsWithPrefix} from '#preact/parse-props';

export {BentoTwitter as Component} from './component';

export const props = {
  'title': {attr: 'title'}, // Needed for Preact component
  // TODO(wg-components): Current behavior defaults to loading="auto".
  // Refactor to make loading="lazy" as the default.
  'loading': {attr: 'data-loading'},
  'options': createParseAttrsWithPrefix('data-'), // Needed to render componoent upon mutation
};

export const layoutSizeDefined = true;

export const usesShadowDom = true;

export const loadable = true;
