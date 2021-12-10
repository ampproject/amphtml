import {PreactBaseElement} from '#preact/base-element';

import {
  Component,
  delegatesFocus,
  layoutSizeDefined,
  props,
  shadowCss,
  staticProps,
  usesShadowDom,
} from './element';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = Component;

/** @override */
BaseElement['layoutSizeDefined'] = layoutSizeDefined;

/** @override */
BaseElement['delegatesFocus'] = delegatesFocus;

/** @override */
BaseElement['props'] = props;

/** @override */
BaseElement['staticProps'] = staticProps;

/** @override */
BaseElement['usesShadowDom'] = usesShadowDom;

/** @override */
BaseElement['shadowCss'] = shadowCss;
