import {PreactBaseElement} from '#preact/base-element';

import {BentoList} from './component/component';
import {CSS as COMPONENT_CSS} from './component/component.jss';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = BentoList;

/** @override */
BaseElement['props'] = {
  'children': {passthrough: true},
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
BaseElement['shadowCss'] = COMPONENT_CSS;
