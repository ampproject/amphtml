import {
  Component,
  getJwplayerProps,
  layoutSizeDefined,
  loadable,
  props,
  usesShadowDom,
} from './element';

import {BaseElement as BentoVideoBaseElement} from '../../amp-video/1.0/base-element';

export class BaseElement extends BentoVideoBaseElement {
  /** @override */
  init() {
    return getJwplayerProps(this.element);
  }
}

/** @override */
BaseElement['Component'] = Component;

/** @override */
BaseElement['props'] = props;

/** @override */
BaseElement['layoutSizeDefined'] = layoutSizeDefined;

/** @override */
BaseElement['usesShadowDom'] = usesShadowDom;

/** @override */
BaseElement['loadable'] = loadable;
