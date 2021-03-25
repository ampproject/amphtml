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
      'onBeforeOpen': this.toggle_.bind(this, true),
      'onAfterClose': this.toggle_.bind(this, false),
    });
  }

  /** @override */
  updatePropsForRendering(props) {
    props['closeButtonAs'] = () => props['closeButton'];
  }

  /**
   * Toggle open/closed attributes.
   * @param {boolean} opt_state
   */
  toggle_(opt_state) {
    this.open_ = toggleAttribute(this.element, 'open', opt_state);
    toggle(this.element, this.open_);
    this.triggerEvent(this.element, this.open_ ? 'open' : 'close');
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
  'id': {attr: 'id'},
};

/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['shadowCss'] = COMPONENT_CSS;
