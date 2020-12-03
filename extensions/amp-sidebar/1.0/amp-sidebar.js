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

import * as Preact from '../../../src/preact';
import {CSS} from '../../../build/amp-accordion-1.0.css';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {Sidebar} from './sidebar';
import {dict} from '../../../src/utils/object';
import {isExperimentOn} from '../../../src/experiments';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-sidebar';

class AmpSidebar extends PreactBaseElement {
  /** @override */
  init() {
    this.registerApiAction('toggle', (api) => api./*OK*/ toggle());
    this.registerApiAction('open', (api) => api./*OK*/ open());
    this.registerApiAction('close', (api) => {
      console.log(api.close);
      api./*OK*/ close();
    });

    const {element} = this;
    //console.log(element.children);
    //console.log('doing init');
    //const {element} = this;
    return dict({});
  }

  /** @override */
  isLayoutSupported(unusedLayout) {
    userAssert(
      isExperimentOn(this.win, 'amp-sidebar-bento'),
      'expected amp-sidbar-bento experiment to be enabled'
    );
    return true;
  }
}

/** @override */
AmpSidebar['Component'] = Sidebar;

AmpSidebar['layoutSizeDefined'] = true;

AmpSidebar['passthrough'] = true;

/** @override */
AmpSidebar['props'] = {
  'side': {attr: 'side', type: 'string'},
};

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpSidebar, CSS);
});
