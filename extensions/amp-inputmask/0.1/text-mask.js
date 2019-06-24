/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {Mask} from './mask-impl';
import {OutputMode} from './constants';
import {Services} from '../../../src/services';
import {iterateCursor, removeElement} from '../../../src/dom';
import {userAssert} from '../../../src/log';

const ELEMENT_MASK_PROPERTY = '__amp_inputmask_masked';
const ELEMENT_MASK_OUTPUT_PROPERTY = '__amp_inputmask_hidden';

export class TextMask {
  /**
   * Detect if an element has input mask behavior attached.
   * @param {!Element} element
   * @return {boolean}
   */
  static isMasked(element) {
    return Boolean(element[ELEMENT_MASK_PROPERTY]);
  }

  /**
   * Detect if an element is a hidden element paired with a masked input.
   * @param {!Element} element
   * @return {boolean}
   */
  static isMaskOutputElement(element) {
    return Boolean(element[ELEMENT_MASK_OUTPUT_PROPERTY]);
  }

  /**
   *
   * @param {!Element} element
   */
  constructor(element) {
    /** @private @const */
    this.element_ = element;

    /** @private @const */
    this.document_ = element.ownerDocument;

    /** @private {?Element} */
    this.hiddenInput_ = null;

    /** @private @const */
    this.outputMode_ = element.getAttribute('mask-output') || OutputMode.RAW;

    const mask = element.getAttribute('mask');

    /** @private @const */
    this.controller_ = new Mask(element, mask);

    this.controller_.mask();

    Services.formSubmitForDoc(element).then(formSubmitService => {
      formSubmitService.beforeSubmit(e => {
        if (e.form != this.element_.form) {
          return;
        }
        this.handleBeforeSubmit_(e.form);
      });
    });

    element[ELEMENT_MASK_PROPERTY] = true;
  }

  /**
   * Add a hidden input to make the unmasked value available to the form
   * @param {!HTMLFormElement} form
   */
  handleBeforeSubmit_(form) {
    if (this.outputMode_ != OutputMode.ALPHANUMERIC) {
      return;
    }

    const name = this.element_.name || this.element_.id;
    if (!name) {
      return;
    }

    const {disabled} = this.element_;
    if (disabled) {
      if (this.hiddenInput_) {
        removeElement(this.hiddenInput_);
      }
      return;
    }

    if (!this.hiddenInput_) {
      const hiddenName = `${name}-unmasked`;
      iterateCursor(this.element_.form.elements, element => {
        const {name} = element;
        if (name == hiddenName && TextMask.isMaskOutputElement(element)) {
          return;
        }
        userAssert(
          name != hiddenName,
          'Illegal input name, %s found: %s',
          name,
          element
        );
      });

      const hidden = this.document_.createElement('input');
      hidden.type = 'hidden';
      hidden.name = hiddenName;
      hidden[ELEMENT_MASK_OUTPUT_PROPERTY] = true;
      form.appendChild(hidden);

      this.hiddenInput_ = hidden;
    }

    this.hiddenInput_.value =
      this.outputMode_ == OutputMode.ALPHANUMERIC
        ? this.controller_.getUnmaskedValue()
        : this.controller_.getValue();
  }

  /**
   * Cleanup resources
   */
  dispose() {
    delete this.element_[ELEMENT_MASK_PROPERTY];
    if (this.hiddenInput_) {
      removeElement(this.hiddenInput_);
    }
    this.controller_.dispose();
  }
}
