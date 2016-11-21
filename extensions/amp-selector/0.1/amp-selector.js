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

import {closest} from '../../../src/dom';
import {dev, user} from '../../../src/log';
import {isExperimentOn} from '../../../src/experiments';

export class AmpSelector extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {boolean} */
    this.isMultiple_ = false;

    /** @private {!Array<!Element>} */
    this.selectedOptions_ = [];

    /** @private {!Array<!Element>} */
    this.options_ = [];

    /** @private {!Array<!Element>} */
    this.inputs_ = [];

    /** @private {boolean} */
    this.isDisabled_ = false;
  }

  /** @override */
  isLayoutSupported() {
    return true;
  }

  /** @override */
  buildCallback() {
    user().assert(isExperimentOn(this.win, 'amp-selector'),
        `Experiment amp-selector is disabled.`);
    this.isMultiple_ = this.element.hasAttribute('multiple');
    this.isDisabled_ = this.element.hasAttribute('disabled');

    this.element.setAttribute('role', 'listbox');

    if (this.isMultiple_) {
      this.element.setAttribute('aria-multiselectable', 'true');
    }

    if (this.isDisabled_) {
      this.element.setAttribute('aria-disabled', 'true');
    }

    this.init_();
    if (!this.isDisabled_) {
      this.element.addEventListener('click', this.clickHandler_.bind(this));
    }
  }

  /**
   * @private
   */
  init_() {
    const options = [].slice.call(this.element.querySelectorAll('[option]'));
    options.forEach(option => {
      option.setAttribute('role', 'option');
      if (option.hasAttribute('disabled')) {
        option.setAttribute('aria-disabled', 'true');
      }
      if (option.hasAttribute('selected')) {
        this.setSelection_(option);
      } else {
        this.clearSelection_(option);
      }
      option.setAttribute('tabindex', '0');
      this.options_.push(option);
    });
    this.setInputs_();
  }

  /**
   * Creates inputs for the currently selected elements.
   * @private
   */
  setInputs_() {
    const elementName = this.element.getAttribute('name');
    if (!elementName || this.isDisabled_) {
      return;
    }
    const formId = this.element.getAttribute('form');

    this.inputs_.forEach(input => {
      this.element.removeChild(input);
    });
    this.inputs_ = [];
    const doc = this.win.document;
    const fragment = doc.createDocumentFragment();
    this.selectedOptions_.forEach(option => {
      if (!option.hasAttribute('disabled')) {
        const hidden = doc.createElement('input');
        hidden.setAttribute('type', 'hidden');
        hidden.setAttribute('name', elementName);
        hidden.setAttribute('value', option.getAttribute('option'));
        if (formId) {
          hidden.setAttribute('form', formId);
        }
        this.inputs_.push(hidden);
        fragment.appendChild(hidden);
      }
    });
    this.element.appendChild(fragment);
  }

  /**
   * Handles the change event for the selectables.
   * @param {!Event} event
   */
  clickHandler_(event) {
    let el = dev().assertElement(event.target);
    if (!el) {
      return;
    }
    if (!el.hasAttribute('option')) {
      el = closest(el, e => e.hasAttribute('option'), this.element);
    }
    if (!el || el.hasAttribute('disabled')) {
      return;
    }
    if (el.hasAttribute('selected')) {
      if (this.isMultiple_) {
        this.clearSelection_(el);
        this.setInputs_();
      }
    } else {
      this.setSelection_(el);
      this.setInputs_();
    }
  }

  /**
   * Clears a given element from the list of selected options.
   * @param {!Element} element.
   * @private
   */
  clearSelection_(element) {
    element.removeAttribute('selected');
    element.setAttribute('aria-selected', 'false');
    const selIndex = this.selectedOptions_.indexOf(element);
    if (selIndex !== -1) {
      this.selectedOptions_.splice(selIndex, 1);
    }
  }

  /**
   * Marks a given element as selected and clears the others if required.
   * @param {!Element} element.
   * @private
   */
  setSelection_(element) {
    if (!this.isMultiple_) {
      while (this.selectedOptions_.length > 0) {
        // Clear selected options for single select.
        const el = this.selectedOptions_.pop();
        this.clearSelection_(el);
      }
    }
    element.setAttribute('selected', '');
    element.setAttribute('aria-selected', 'true');
    this.selectedOptions_.push(element);
  }
}

AMP.registerElement('amp-selector', AmpSelector);
