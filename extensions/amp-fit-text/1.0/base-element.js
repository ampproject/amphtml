import {CSS} from './component.jss';
import {BentoFitText} from './component';
import {PreactBaseElement} from '#preact/base-element';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = BentoFitText;

/** @override */
BaseElement['props'] = {
  'children': {passthrough: true},
  'minFontSize': {attr: 'min-font-size', type: 'number', media: true},
  'maxFontSize': {attr: 'max-font-size', type: 'number', media: true},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['shadowCss'] = CSS;
