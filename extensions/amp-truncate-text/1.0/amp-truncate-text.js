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

import {CSS as COMPONENT_CSS} from './truncate-text.jss';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {TruncateText} from './truncate-text';
import {isExperimentOn} from '../../../src/experiments';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-truncate-text';

class AmpTruncateText extends PreactBaseElement {
  /** @override */
  init() {
    this.registerApiAction('expand', (api) => api./*OK*/ expand());
    this.registerApiAction('collapse', (api) => api./*OK*/ collapse());
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-truncate-text'),
      'expected global "bento" or specific "bento-truncate-text" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

/** @override */
AmpTruncateText['Component'] = TruncateText;

/** @override */
AmpTruncateText['props'] = {};

/** @override */
AmpTruncateText['children'] = {
  'slot-collapsed': {
    name: 'slotCollapsed',
    selector: '[slot=collapsed]',
    single: true,
  },
  'slot-expanded': {
    name: 'slotExpanded',
    selector: '[slot=expanded]',
    single: true,
  },
  'slot-persistent': {
    name: 'slotPersistent',
    selector: '[slot=persistent]',
    single: true,
  },
};

/** @override */
AmpTruncateText['layoutSizeDefined'] = true;

/** @override */
AmpTruncateText['shadowCss'] = COMPONENT_CSS;

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpTruncateText);
});
