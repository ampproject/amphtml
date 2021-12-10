import {PreactBaseElement} from '#preact/base-element';
import {
  Component,
  elementInit,
  layoutSizeDefined,
  props,
  shadowCss,
  usesShadowDom,
} from './element';

export class BaseElement extends PreactBaseElement {
  /** @override */
  init() {
    return elementInit(
      this.element,
      this.triggerEvent.bind(this) // eslint-disable-line local/restrict-this-access
    );
  }
}

/** @override */
BaseElement['Component'] = Component;

/** @override */
BaseElement['layoutSizeDefined'] = layoutSizeDefined;

/** @override */
BaseElement['props'] = props;

/** @override */
BaseElement['usesShadowDom'] = usesShadowDom;

/** @override */
BaseElement['shadowCss'] = shadowCss;
