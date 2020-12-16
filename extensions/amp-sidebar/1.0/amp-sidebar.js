/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {CSS as COMPONENT_CSS} from './sidebar.jss';
import {CSS} from '../../../build/amp-sidebar-1.0.css';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {Sidebar} from './sidebar';
import {dict} from '../../../src/utils/object';
import {isExperimentOn} from '../../../src/experiments';
import {toggle} from '../../../src/style';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-sidebar';

class AmpSidebar extends PreactBaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {boolean} */
    this.open_ = false;
  }

  /** @override */
  init() {
    this.registerApiAction('toggle', (api) => api./*OK*/ toggle());
    this.registerApiAction('open', (api) => api./*OK*/ open());
    this.registerApiAction('close', (api) => api./*OK*/ close());

    return dict({
      'onBeforeOpen': this.beforeOpen_.bind(this),
      'onAfterClose': this.afterClose_.bind(this),
    });
  }

  /**
   * Setting hidden to false
   * @private
   */
  beforeOpen_() {
    this.open_ = true;
    toggle(this.element, true);
    this.element.setAttribute('open', '');
  }

  /**
   * Setting hidden to true
   * @private
   */
  afterClose_() {
    this.open_ = false;
    toggle(this.element, false);
    this.element.removeAttribute('open');
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

  /** @override */
  isLayoutSupported(unusedLayout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-sidebar'),
      'expected global "bento" or specific "bento-sidbar" experiment to be enabled'
    );
    return true;
  }
}

/** @override */
AmpSidebar['Component'] = Sidebar;

/** @override */
AmpSidebar['passthrough'] = true;

/** @override */
AmpSidebar['shadowCss'] = COMPONENT_CSS;

/** @override */
AmpSidebar['props'] = {
  'side': {attr: 'side', type: 'string'},
};

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpSidebar, CSS);
});
