import {toggleAttribute} from '#core/dom';
import {unmountAll} from '#core/dom/resource-container-helper';
import {toggle} from '#core/dom/style';

import {PreactBaseElement} from '#preact/base-element';

import {BentoLightbox} from './component';
import {CSS as COMPONENT_CSS} from './component.jss';

export class BaseElement extends PreactBaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {boolean} */
    this.open_ = false;
  }

  /** @override */
  init() {
    return {
      'onBeforeOpen': () => this.beforeOpen(),
      'onAfterOpen': () => this.afterOpen(),
      'onAfterClose': () => this.afterClose(),
    };
  }

  /** @protected */
  beforeOpen() {
    this.open_ = true;
    toggleAttribute(this.element, 'open', true);
    toggle(this.element, true);
    this.triggerEvent(this.element, 'open');
  }

  /** @protected */
  afterOpen() {}

  /** @protected */
  afterClose() {
    this.open_ = false;
    toggleAttribute(this.element, 'open', false);
    toggle(this.element, false);
    this.triggerEvent(this.element, 'close');

    // Unmount all children when the lightbox is closed. They will automatically
    // remount when the lightbox is opened again.
    unmountAll(this.element, /* includeSelf */ false);
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
BaseElement['Component'] = BentoLightbox;

/** @override */
BaseElement['props'] = {
  'animation': {attr: 'animation', media: true, default: 'fade-in'},
  'closeButtonAs': {selector: '[slot="close-button"]', single: true, as: true},
  'children': {passthrough: true},
};

/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['shadowCss'] = COMPONENT_CSS;
