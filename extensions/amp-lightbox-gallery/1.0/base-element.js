/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as Preact from '#preact';
import {CSS as CAROUSEL_CSS} from '../../amp-base-carousel/1.0/component.jss';
import {CSS as COMPONENT_CSS} from './component.jss';
import {CSS as LIGHTBOX_CSS} from '../../amp-lightbox/1.0/component.jss';
import {LightboxGalleryProvider, WithLightbox} from './component';
import {PreactBaseElement} from '#preact/base-element';
import {dict} from '#core/types/object';
import {srcsetFromElement} from '#core/dom/srcset';
import {toArray} from '#core/types/array';
import {toggle} from '#core/dom/style';
import {toggleAttribute} from '#core/dom';

/** @const {!Array<string>} */
const LIGHTBOX_ELIGIBLE_SELECTORS = ['amp-img[lightbox]', 'img[lightbox]'];

/** @const {!Array<string>} */
const LIGHTBOX_ELIGIBLE_GROUP_SELECTORS = [
  'amp-base-carousel[lightbox]',
  'amp-stream-gallery[lightbox]',
];

/** @const {string} */
const DEFAULT_GROUP = 'default';

/** @const {string} */
const DEFAULT_CAROUSEL_PREFIX = 'carousel';

/** @const {number} */
let count = 0;

export class BaseElement extends PreactBaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {!Element} */
    this.element_ = element;

    /** @private {boolean} */
    this.open_ = false;
  }

  /** @override */
  mountCallback() {
    // There should only be one instance of `amp-lightbox-gallery` in a document.
    if (count++) {
      console /*OK */
        .warn(
          `<amp-lightbox-gallery> already exists in the document. Removing additional instance: ${this.element_}`
        );
      this.element_.parentNode?.removeChild(this.element_);
    }
  }

  /** @override */
  init() {
    return dict({
      'onBeforeOpen': () => this.beforeOpen(),
      'onAfterOpen': () => this.afterOpen(),
      'onAfterClose': () => this.afterClose(),
      'render': () =>
        getLightboxElements(
          this.element.ownerDocument,
          (opt_index, opt_group) => this.api().open(opt_index, opt_group)
        ),
    });
  }

  /** @override */
  unmountCallback() {
    count--;
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

/**
 * @param {!Document} document
 * @param {function(number)} open
 * @return {!Array<PreactDef.Renderable>}
 */
function getLightboxElements(document, open) {
  const lightboxElements = [];

  /**
   * @param {string} defaultGroup
   * @param {Element} element
   * @param {number} index
   */
  function processLightboxElement(defaultGroup, element, index) {
    const group = element.getAttribute('lightbox') || defaultGroup;
    element.addEventListener('click', () => open(index, group));
    lightboxElements.push(
      <WithLightbox
        group={group}
        as="img"
        srcset={srcsetFromElement(element).stringify()}
      />
    );
  }

  // Process all standalone elements into a lightbox.
  toArray(document.querySelectorAll(LIGHTBOX_ELIGIBLE_SELECTORS)).forEach(
    (element, index) => processLightboxElement(DEFAULT_GROUP, element, index)
  );

  // Process all lightboxed carousel elements into separate lightbox groups.
  toArray(document.querySelectorAll(LIGHTBOX_ELIGIBLE_GROUP_SELECTORS)).forEach(
    (carousel, index) => {
      const group =
        carousel.getAttribute('lightbox') || DEFAULT_CAROUSEL_PREFIX + index;
      toArray(carousel.children).forEach((element, index) =>
        processLightboxElement(group, element, index)
      );
    }
  );

  return lightboxElements;
}

/** @override */
BaseElement['Component'] = LightboxGalleryProvider;

/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['shadowCss'] = COMPONENT_CSS + LIGHTBOX_CSS + CAROUSEL_CSS;
