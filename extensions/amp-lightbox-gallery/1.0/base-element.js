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
const LIGHTBOX_ELIGIBLE_SELECTORS = [
  'amp-img[lightbox]',
  'img[lightbox]',
  'amp-base-carousel[lightbox] > amp-img',
  'amp-base-carousel[lightbox] > img',
  'amp-stream-gallery[lightbox] > amp-img',
  'amp-stream-gallery[lightbox] > img',
];

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
      'onBeforeOpen': () => this.beforeOpen_(),
      'onAfterOpen': () => this.afterOpen_(),
      'onAfterClose': () => this.afterClose_(),
      'render': () =>
        getLightboxElements(this.element.ownerDocument, (opt_index) =>
          this.api().open(opt_index)
        ),
    });
  }

  /** @override */
  unmountCallback() {
    this.removeAsContainer?.();
  }

  /** @private */
  beforeOpen_() {
    this.open_ = true;
    toggleAttribute(this.element, 'open', true);
    toggle(this.element, true);
  }

  /** @private */
  afterOpen_() {
    const scroller = this.element.shadowRoot.querySelector('[part=scroller]');
    this.setAsContainer?.(scroller);
  }

  /** @private */
  afterClose_() {
    this.open_ = false;
    toggleAttribute(this.element, 'open', false);
    toggle(this.element, false);

    this.removeAsContainer?.();
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
  return toArray(document.querySelectorAll(LIGHTBOX_ELIGIBLE_SELECTORS)).map(
    (element, index) => {
      element.addEventListener('click', () => open(index));
      return (
        <WithLightbox
          render={() => <img srcset={srcsetFromElement(element).stringify()} />}
        />
      );
    }
  );
}

/** @override */
BaseElement['Component'] = LightboxGalleryProvider;

/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['shadowCss'] = COMPONENT_CSS + LIGHTBOX_CSS + CAROUSEL_CSS;
