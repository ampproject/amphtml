import {PreactBaseElement} from '#preact/base-element';
import {dict} from '#core/types/object';
import {
  Component,
  isOpen,
  props,
  setIsOpen,
  shadowCss,
  usesShadowDom,
} from './element';

export class BaseElement extends PreactBaseElement {
  /** @override */
  init() {
    return dict({
      'onBeforeOpen': () => this.onBeforeOpen_(),
      'onAfterClose': () => this.onAfterClose_(),
    });
  }

  /** @private */
  onBeforeOpen_() {
    setIsOpen(this.element, true);
  }

  /** @private */
  onAfterClose_() {
    setIsOpen(this.element, false);
  }

  /** @override */
  mutationObserverCallback() {
    this.api().toggle(isOpen(this.element));
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
