import {PreactBaseElement} from '#preact/base-element';

import {BentoImageSlider} from './component';
import {CSS as COMPONENT_CSS} from './component.jss';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = BentoImageSlider;

/** @override */
BaseElement['props'] = {
  firstImageAs: {
    selector: 'amp-img[slot="first-image"]' || 'img[slot="first-image"]',
    single: true,
    as: true,
  },
  secondImageAs: {
    selector: 'amp-img[slot="second-image"]' || 'img[slot="second-image"]',
    single: true,
    as: true,
  },
  firstLabelAs: {selector: 'div[slot="first-label"]', single: true, as: true},
  secondLabelAs: {selector: 'div[slot="second-label"]', single: true, as: true},
  leftHintAs: {selector: 'div[slot="left-hint"]', single: true, as: true},
  rightHintAs: {selector: 'div[slot="right-hint"]', single: true, as: true},
  initialPosition: {
    attr: 'initial-slider-position',
    type: 'number',
  },
  displayHintOnce: {
    attr: 'display-hint-once',
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
