import {PreactBaseElement} from '#preact/base-element';
import {
  Component,
  elementInit,
  layoutSizeDefined,
  mutationObserverCallback,
  props,
  shadowCss,
  useContexts,
  usesShadowDom,
} from './element';

export class BaseElement extends PreactBaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?number} */
    this.slide_ = null;
  }

  /** @override */
  init() {
    const {props, slide} = elementInit(
      this.element,
      this.triggerEvent.bind(this) // eslint-disable-line local/restrict-this-access
    );
    this.slide_ = slide;
    return props;
  }

  /** @override */
  mutationObserverCallback() {
    this.slide_ = mutationObserverCallback(
      this.element,
      this.slide_,
      this.api().goToSlide.bind(this) // eslint-disable-line local/restrict-this-access
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

/** @override */
BaseElement['useContexts'] = useContexts;
