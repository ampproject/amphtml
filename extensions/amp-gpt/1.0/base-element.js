import {PreactBaseElement} from '#preact/base-element';

import {BentoGpt} from './component';
_;

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = BentoGpt;

/** @override */
BaseElement['props'] = {
  'children': {passthrough: true},
  adUnitPath: {attr: 'ad-unit-path', type: 'string'},
  optDiv: {attr: 'opt-div', type: 'string'},
  size: {attr: 'size'},
  // 'children': {passthroughNonEmpty: true},
  // 'children': {selector: '...'},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;

// DO NOT SUBMIT: If BaseElement['shadowCss']  is set to `null`, remove the
// following declaration.
// Otherwise, keep it when defined to an actual value like `COMPONENT_CSS`.
// Once addressed, remove this set of comments.
/** @override */
BaseElement['shadowCss'] = null;
