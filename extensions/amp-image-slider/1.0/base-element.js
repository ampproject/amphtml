import {PreactBaseElement} from '#preact/base-element';

import {ImageSlider} from './component';
import {CSS as COMPONENT_CSS} from './component.jss';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = ImageSlider;

/** @override */
BaseElement['props'] = {
  images: {selector: 'img' || 'amp-img', single: false, clone: true},
  labels: {selector: 'div', single: false, clone: true},
  initialPosition: {
    attr: 'initial-slider-position',
    type: 'string',
  },
  repeatHint: {
    attr: 'disable-hint-reappear',
    type: 'boolean',
  },
  stepSize: {attr: 'step-size', type: 'number', default: 0.1},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['shadowCss'] = COMPONENT_CSS;
