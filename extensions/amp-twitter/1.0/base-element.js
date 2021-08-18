import {PreactBaseElement} from '#preact/base-element';
import {Twitter} from './component';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = Twitter;

/** @override */
BaseElement['props'] = {
  'title': {attr: 'title'}, // Needed for Preact component
  'options': {attrPrefix: 'data-'}, // Needed to render componoent upon mutation
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;
