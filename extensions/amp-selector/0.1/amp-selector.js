/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {isLayoutSizeDefined, Layout} from '../../../src/layout';
import {setStyle} from '../../../src/style';

export class AmpSelect extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {boolean} */
    this.isMultiple_ = false;

    /** @private {!Array<!Element>} */
    this.selectedElements_  = [];

    /** @private {Element} */
    this.inputWrapper_ = null;

  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout) || Layout.CONTAINER;
  }

  /** @override */
  buildCallback() {
    this.isMultiple_ = this.element.hasAttribute('multiple');
    const isDisabled = this.element.hasAttribute('disabled');
    const formId = this.element.getAttribute('form');
    const doc = this.win.document;

    this.setState_();

    this.element.addEventListener('click', this.clickHandler_.bind(this));
  }

  /**
   * Sets the state of the options based on the state of the current inputs
   *    or based on the vaules array if one is passed.
   */
  setState_(opt_element) {
    this.selectedElements_ = [];
    const selectedElements_ =
        this.element.querySelectorAll('*[option][selected]:not([disabled])');
    const len = selectedElements_.length;
    if (!this.isMultiple_ && len > 1) {
      // There are multiple selected elements in a single selector.
      for (let i=0; i < len; i++) {
        const el = selectedElements_[i];
        if (opt_element && el !== opt_element) {
          elem.removeAttribute('selected');
        } else {
          if (this.selectedElements_.length > 0) {
            // We need to have only one selected element for a single selector.
            // So pop the last element (only element in the arr) and remove the
            // selected attr.
            this.selectedElements_.pop().removeAttribute('selected');
          }
          this.selectedElements_.push(el);
        }
      }
    } else {
      this.selectedElements_ = [].slice.call(selectedElements_);
    }
    this.setInputs_();
  }

  setInputs_() {
    const elementName = this.element.getAttribute('name');
    if (!elementName) {
      return;
    }

    const doc = this.win.document;
    if (!this.inputWrapper_) {
      this.inputWrapper_ = doc.createElement('div');
      this.inputWrapper_.setAttribute(
          'class', '-amp-selector-inputs-container');
      this.element.appendChild(this.inputWrapper_);
      setStyle(this.inputWrapper_, 'display', 'none');
    }

    this.inputWrapper_.innerHTML = '';
    const fragment = doc.createDocumentFragment();

    this.selectedElements_.forEach(selectedElement => {
      const hidden = doc.createElement('input');
      hidden.setAttribute('type', 'hidden');
      hidden.setAttribute('name', elementName);
      hidden.setAttribute('value', selectedElement.getAttribute('option'));
      fragment.appendChild(hidden);
    });
    this.element.appendChild(fragment);
  }

  /**
   * Handles the change event for the inputs.
   * @param {!Event} event
   */
  clickHandler_(event) {
    const el = event.target;
    if (!el || !el.hasAttribute('option')) {
      return;
    }
    el.setAttribute('selected');
    this.setState_(el);
  }
}

AMP.registerElement('amp-select', AmpSelect);