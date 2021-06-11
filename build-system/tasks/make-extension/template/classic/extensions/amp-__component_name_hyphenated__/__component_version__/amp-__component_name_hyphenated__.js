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

__css_import__;
import {Layout} from '../../../src/core/dom/layout';

const TAG = 'amp-__component_name_hyphenated__';
 
export class Amp__component_name_pascalcase__ extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    // __do_not_submit__: This is example code only.
    super(element);

    /** @private {string} */
    this.myText_ = 'hello world';

    /** @private {?Element} */
    this.container_ = null;
  }

  /** @override */
  buildCallback() {
    this.container_ = this.element.ownerDocument.createElement('div');
    this.container_.textContent = this.myText_;
    this.element.appendChild(this.container_);
    this.applyFillContent(this.container_, /* replacedContent */ true);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.RESPONSIVE;
  }
}

AMP.extension(TAG, '__component_version__', AMP => {
  AMP.registerElement(__register_element_args__);
});
