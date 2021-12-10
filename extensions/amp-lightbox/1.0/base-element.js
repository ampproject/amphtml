import {PreactBaseElement} from '#preact/base-element';
import {dict} from '#core/types/object';
import {
  Component,
  afterLightboxClose,
  beforeLightboxOpen,
  props,
  shadowCss,
  usesShadowDom,
} from './element';
export class BaseElement extends PreactBaseElement {
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
      'onAfterClose': () => this.afterClose(),
    });
  }

  /** @protected */
  beforeOpen() {
    this.open_ = beforeLightboxOpen(
      this.element,
      this.triggerEvent.bind(this) // eslint-disable-line local/restrict-this-access
    );
  }

  /** @protected */
  afterClose() {
    this.open_ = afterLightboxClose(
      this.element,
      this.triggerEvent.bind(this) // eslint-disable-line local/restrict-this-access
    );
  }

  /** @override */
  mutationObserverCallback() {
    const open = this.element.hasAttribute('open');
    if (open === this.open_) {
      return;
    }
    this.open_ = open;
    open ? this.api().open() : this.api().close();
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
