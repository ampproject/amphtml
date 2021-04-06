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
import {PreactBaseElement} from '../../../src/preact/base-element';
import {Sidebar} from './component';
import {dict} from '../../../src/utils/object';
import {pauseAll} from '../../../src/utils/resource-container-helper';
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
      'onBeforeOpen': () => this.beforeOpen_(),
      'onAfterOpen': () => this.afterOpen_(),
      'onAfterClose': () => this.afterClose_(),
    });
  }

  /** @override */
  unmountCallback() {
    this.removeAsContainer();
  }

  /** @private */
  beforeOpen_() {
    this.open_ = true;
    toggleAttribute(this.element, 'open', true);
    toggle(this.element, true);
  }

  /** @private */
  afterOpen_() {
    const sidebar = this.element.shadowRoot.querySelector('[part=sidebar]');
    this.setAsContainer(sidebar);
  }

  /** @private */
  afterClose_() {
    this.open_ = false;
    toggleAttribute(this.element, 'open', false);
    toggle(this.element, false);

    this.removeAsContainer();
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
BaseElement['Component'] = Sidebar;

/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['shadowCss'] = COMPONENT_CSS;

/** @override */
BaseElement['props'] = {
  'children': {passthrough: true},
  'side': {attr: 'side', type: 'string'},
};
