import {PreactBaseElement} from '#preact/base-element';

import {
  Component,
  layoutSizeDefined,
  loadable,
  props,
  shadowCss,
  usesShadowDom,
} from './element';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = Component;

/** @override */
BaseElement['loadable'] = loadable;

/** @override */
BaseElement['layoutSizeDefined'] = layoutSizeDefined;

/**
 * Defaults to `{component: 'video'}` from `BentoVideo` component.
 * Subclasses may set:
 * ```
 *   AmpMyPlayer['staticProps'] = dict({
 *     'component': MyPlayerComponent,
 *   });
 * ```
 * @override
 */
BaseElement['staticProps'];

/** @override */
BaseElement['props'] = props;

/** @override */
BaseElement['shadowCss'] = shadowCss;

/** @override */
BaseElement['usesShadowDom'] = usesShadowDom;
