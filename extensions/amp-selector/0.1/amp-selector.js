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

import {CSS} from '../../../build/amp-selector-0.1.css';
import {actionServiceForDoc} from '../../../src/action';
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

    /** @const @private {!../../../src/service/action-impl.ActionService} */
    this.action_ = actionServiceForDoc(this.win.document.documentElement);
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

  /** @override */
  mutatedAttributesCallback(mutations) {
    mutations.forEach(mutation => {
      const newValue = mutation.newValue;
      switch (mutation.name) {
        case 'selected':
          this.clearAllSelections_();
          if (newValue) {
            // Create a query with an attribute selector for every
            // comma-delimited option value in `newValue`.
            const options = String(mutation.newValue).split(',');
            const selectors = [];
            for (let i = 0; i < options.length; i++) {
              // Only use first value if multiple selection is disabled.
              if (i > 0 && !this.isMultiple_) {
                break;
              }
              selectors.push(`[option='${options[i]}']`);
            }
            const query = selectors.join(',');
            const elements = this.element.querySelectorAll(query);
            for (let i = 0; i < elements.length; i++) {
              this.setSelection_(element[i]);
            }
          }
          this.setInputs_();
          break;
      }
    });
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

    // Trigger 'select' event with two data params:
    // 'option' - option value of the selected or deselected element.
    // 'options' - comma-delimited option values of all selected elements.
    const options = [];
    this.selectedOptions_.forEach(element => {
      options.push(element.getAttribute('option'));
    });
    const detail = {
      option: el.getAttribute('option'),
      options: options.join(','),
    };
    const selectEvent = new CustomEvent('Select', {detail});
    this.action_.trigger(this.element, 'select', selectEvent);
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
   * Clears all selected options.
   * @private
   */
  clearAllSelections_() {
    while (this.selectedOptions_.length > 0) {
      // Clear selected options for single select.
      const el = this.selectedOptions_.pop();
      this.clearSelection_(el);
    }
  }

  /**
   * Marks a given element as selected and clears the others if required.
   * @param {!Element} element.
   * @private
   */
  setSelection_(element) {
    // Exit if `element` is already selected.
    if (this.selectedOptions_.indexOf(element) >= 0) {
      return;
    }
    if (!this.isMultiple_) {
      this.clearAllSelections_();
    }
    element.setAttribute('selected', '');
    element.setAttribute('aria-selected', 'true');
    this.selectedOptions_.push(element);
  }
}

AMP.registerElement('amp-selector', AmpSelector, CSS);
