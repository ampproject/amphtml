import {BaseElement as BentoVideoBaseElement} from '../../amp-video/1.0/base-element';
import {Component, layoutSizeDefined, props, usesShadowDom} from './element';

export class BaseElement extends BentoVideoBaseElement {}

/** @override */
BaseElement['Component'] = Component;

/** @override */
BaseElement['props'] = props;

/** @override */
BaseElement['layoutSizeDefined'] = layoutSizeDefined;

/** @override */
BaseElement['usesShadowDom'] = usesShadowDom;
