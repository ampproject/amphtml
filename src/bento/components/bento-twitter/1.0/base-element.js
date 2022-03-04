import {PreactBaseElement} from '#preact/base-element';
import {createParseAttrsWithPrefix} from '#preact/parse-props';

import {BentoTwitter} from './component';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = BentoTwitter;

/** @override */
BaseElement['props'] = {
  'title': {attr: 'title'}, // Needed for Preact component
  // TODO(wg-components): Current behavior defaults to loading="auto".
  // Refactor to make loading="lazy" as the default.
  'loading': {attr: 'data-loading'},
  'options': createParseAttrsWithPrefix('data-'), // Needed to render componoent upon mutation
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['loadable'] = true;
