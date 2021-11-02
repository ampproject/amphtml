import {PreactBaseElement} from '#preact/base-element';
import {BentoTwitter} from './component';
import {CSS as COMPONENT_CSS} from './component.jss';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = BentoTwitter;

/** @override */
BaseElement['props'] = {
  'title': {attr: 'title'}, // Needed for Preact component
  'options': {attrPrefix: 'data-'}, // Needed to render componoent upon mutation
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;

BaseElement['shadowCss'] = COMPONENT_CSS;
