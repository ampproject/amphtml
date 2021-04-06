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

import {CSS as COMPONENT_CSS} from './component.jss';
import {Lightbox} from './component';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {dict} from '../../../src/utils/object';
import {toggle} from '../../../src/style';
import {toggleAttribute} from '../../../src/dom';
import {unmountAll} from '../../../src/utils/resource-container-helper';

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
    });
  }

  /** @override */
  unmountCallback() {
    this.removeAsContainer();
  }

  /** @override */
  updatePropsForRendering(props) {
    props['closeButtonAs'] = () => props['closeButton'];
  }

  /** @private */
  beforeOpen_() {
    this.open_ = true;
    toggleAttribute(this.element, 'open', true);
    toggle(this.element, true);
    this.triggerEvent(this.element, 'open');
  }

  /** @private */
  afterOpen_() {
    const scroller = this.element.shadowRoot.querySelector('[part=scroller]');
    this.setAsContainer(scroller);
  }

  /** @private */
  afterClose_() {
    this.open_ = false;
    toggleAttribute(this.element, 'open', false);
    toggle(this.element, false);
    this.triggerEvent(this.element, 'close');

    this.removeAsContainer();

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
BaseElement['Component'] = Lightbox;

/** @override */
BaseElement['props'] = {
  'animation': {attr: 'animation', media: true, default: 'fade-in'},
  'closeButton': {selector: '[slot="close-button"]', single: true},
  'children': {passthrough: true},
};

/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['shadowCss'] = COMPONENT_CSS;
