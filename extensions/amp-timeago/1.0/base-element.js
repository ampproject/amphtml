import {PreactBaseElement} from '#preact/base-element';

import {
  Component,
  layoutSizeDefined,
  props,
  updatePropsForRendering,
  usesShadowDom,
} from './element';

export class BaseElement extends PreactBaseElement {
  /** @override */
  updatePropsForRendering(props) {
    updatePropsForRendering(props);
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
