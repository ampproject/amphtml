import {PreactBaseElement} from '#preact/base-element';
import {dict} from '#core/types/object';
import {
  Component,
  props,
  setElementOpen,
  shadowCss,
  toggleOnMutation,
  usesShadowDom,
} from './element';

export class BaseElement extends PreactBaseElement {
  /** @override */
  constructor(element) {
    super(element);

    /** @private {boolean} */
    this.open_ = false;
  }

  /** @override */
  init() {
    return dict({
      'onBeforeOpen': () => this.onBeforeOpen_(),
      'onAfterClose': () => this.onAfterClose_(),
    });
  }

  /** @private */
  onBeforeOpen_() {
    this.open_ = setElementOpen(this.element, true);
  }

  /** @private */
  onAfterClose_() {
    this.open_ = setElementOpen(this.element, false);
  }

  /** @override */
  mutationObserverCallback() {
    this.open_ = toggleOnMutation(this.element, this.open_);
  }
}

/** @override */
BaseElement['Component'] = Component;

/** @override */
BaseElement['props'] = props;

/** @override */
BaseElement['usesShadowDom'] = usesShadowDom;

/** @override */
BaseElement['shadowCss'] = shadowCss;
