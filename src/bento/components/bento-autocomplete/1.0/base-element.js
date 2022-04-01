import {PreactBaseElement} from '#preact/base-element';

import {BentoAutocomplete} from './component';
import {CSS as COMPONENT_CSS} from './component.jss';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = BentoAutocomplete;

/** @override */
BaseElement['props'] = {
  'children': {passthrough: true},
  'filter': {attr: 'filter'},
  'highlightUserEntry': {attr: 'highlight-user-entry', type: 'boolean'},
  'id': {attr: 'id'},
  'inline': {attr: 'inline'},
  'maxItems': {attr: 'max-items', type: 'number'},
  'minChars': {attr: 'min-chars', type: 'number'},
  'src': {attr: 'src'},
  'suggestFirst': {attr: 'suggest-first', type: 'boolean'},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['shadowCss'] = COMPONENT_CSS;
