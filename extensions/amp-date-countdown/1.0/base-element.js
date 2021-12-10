import {PreactBaseElement} from '#preact/base-element';

import {
  Component,
  layoutSizeDefined,
  lightDomTag,
  props,
  usesTemplate,
} from './element';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = Component;

/** @override */
BaseElement['layoutSizeDefined'] = layoutSizeDefined;

/** @override */
BaseElement['lightDomTag'] = lightDomTag;

/** @override */
BaseElement['usesTemplate'] = usesTemplate;

/** @override */
BaseElement['props'] = props;
