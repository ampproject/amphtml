import {PreactBaseElement} from '#preact/base-element';
import {
  Component,
  layoutSizeDefined,
  loadable,
  props,
  usesShadowDom,
} from './element';

export class BaseElement extends PreactBaseElement {}

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
