import {PreactBaseElement} from '#preact/base-element';

import {
  Component,
  layoutSizeDefined,
  loadable,
  props,
  unloadOnPause,
  usesShadowDom,
} from './element';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = Component;

/** @override */
BaseElement['loadable'] = loadable;

/** @override */
BaseElement['unloadOnPause'] = unloadOnPause;

/** @override */
BaseElement['props'] = props;

/** @override */
BaseElement['usesShadowDom'] = usesShadowDom;

/** @override */
BaseElement['layoutSizeDefined'] = layoutSizeDefined;
