/**
 * Copyright __current_year__ The AMP HTML Authors. All Rights Reserved.
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

import {BaseElement} from './base-element';
import {CSS} from '../../../build/amp-__component_name_hyphenated__-__component_version__.css';
import {dict} from '../../../src/utils/object';
import {isExperimentOn} from '../../../src/experiments';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-__component_name_hyphenated__';

class Amp__component_name_pascalcase__ extends BaseElement {
  /** @override */
  init() {
    // __do_not_submit__: This is example code only.
    this.registerApiAction('exampleToggle', (api) => api./*OK*/exampleToggle());

    return dict({
      // Extra props passed by wrapper AMP component
      'exampleTagNameProp': this.element.tagName,
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-__component_name_hyphenated__'),
      'expected global "bento" or specific "bento-__component_name_hyphenated__" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '__component_version__', (AMP) => {
  AMP.registerElement(TAG, Amp__component_name_pascalcase__, CSS);
});
