import {dict} from '#core/types/object';

import {PreactBaseElement} from '#preact/base-element';

import {
  Component,
  afterLightboxGalleryClose,
  beforeLightboxGalleryOpen,
  checkNumInstancesOnMount,
  checkNumInstancesOnUnmount,
  getLightboxElements,
  props,
  shadowCss,
  usesShadowDom,
} from './element';

export class BaseElement extends PreactBaseElement {
  /** @override */
  mountCallback() {
    checkNumInstancesOnMount(this.element);
  }

  /** @override */
  init() {
    const lightboxElements = getLightboxElements(
      this.element.ownerDocument,
      (opt_index, opt_group) => this.api().open(opt_index, opt_group)
    );
    return dict({
      'onBeforeOpen': () => this.beforeOpen(),
      'onAfterClose': () => this.afterClose(),
      'render': () => lightboxElements,
    });
  }

  /** @override */
  unmountCallback() {
    checkNumInstancesOnUnmount();
  }

  /** @protected */
  beforeOpen() {
    beforeLightboxGalleryOpen(this.element);
  }

  /** @protected */
  afterClose() {
    afterLightboxGalleryClose(this.element);
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
