import {PreactBaseElement} from '#preact/base-element';
import {dict} from '#core/types/object';
import {
  Component,
  afterClose,
  afterOpen,
  beforeOpen,
  deferredMount,
  mutationObserverCallback,
  props,
  shadowCss,
  updatePropsForRendering,
  usesShadowDom,
} from './element';

export class BaseElement extends PreactBaseElement {
  /** @override */
  static deferredMount(unusedElement) {
    deferredMount(unusedElement);
  }

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {boolean} */
    this.open_ = false;
  }

  /** @override */
  init() {
    return dict({
      'onBeforeOpen': () => this.beforeOpen(),
      'onAfterOpen': () => this.afterOpen(),
      'onAfterClose': () => this.afterClose(),
    });
  }

  /** @override */
  updatePropsForRendering(props) {
    updatePropsForRendering(props, this.element);
  }

  /** @protected */
  beforeOpen() {
    this.open_ = beforeOpen(this.element);
  }

  /** @protected */
  afterOpen() {
    afterOpen();
  }

  /** @protected */
  afterClose() {
    this.open_ = afterClose(this.element);
  }

  /** @override */
  mutationObserverCallback() {
    this.open_ = mutationObserverCallback(this.element, this.open_);
  }
}

/** @override */
BaseElement['Component'] = Component;

/** @override */
BaseElement['usesShadowDom'] = usesShadowDom;

/** @override */
BaseElement['shadowCss'] = shadowCss;

/** @override */
BaseElement['props'] = props;
