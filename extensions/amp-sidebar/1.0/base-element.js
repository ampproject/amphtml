import * as Preact from '#preact';
import {CSS as COMPONENT_CSS} from './component.jss';
import {PreactBaseElement} from '#preact/base-element';
import {BentoSidebar} from './component';
import {dict} from '#core/types/object';
import {pauseAll} from '#core/dom/resource-container-helper';
import {toggle} from '#core/dom/style';
import {toggleAttribute} from '#core/dom';

export class BaseElement extends PreactBaseElement {
  /** @override */
  static deferredMount(unusedElement) {
    return false;
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

  /** @protected */
  beforeOpen() {
    this.open_ = true;
    toggleAttribute(this.element, 'open', true);
    toggle(this.element, true);
  }

  /** @protected */
  afterOpen() {}

  /** @protected */
  afterClose() {
    this.open_ = false;
    toggleAttribute(this.element, 'open', false);
    toggle(this.element, false);

    pauseAll(this.element, /* includeSelf */ false);
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
BaseElement['Component'] = BentoSidebar;

/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['shadowCss'] = COMPONENT_CSS;

/** @override */
BaseElement['props'] = {
  'children': {passthrough: true},
  'side': {attr: 'side', type: 'string'},
};
