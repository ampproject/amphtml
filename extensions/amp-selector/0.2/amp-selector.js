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
import {CSS} from '../../../build/amp-selector-0.1.css';
import {Option, Selector} from './selector';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {
  closestAncestorElementBySelector,
  scopedQuerySelector,
} from '../../../src/dom';
import {dev, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {isArray, toArray} from '../../../src/types';
import {isExperimentOn} from '../../../src/experiments';

/** @const {string} */
const TAG = 'amp-selector';

class AmpSelector extends PreactBaseElement {
  /** @override */
  init() {
    if (!this.element.hasAttribute('role')) {
      this.element.setAttribute('role', 'listbox');
    }
    if (this.element.hasAttribute('multiple')) {
      this.element.setAttribute('aria-multiselectable', 'true');
    }
    if (this.element.hasAttribute('disabled')) {
      this.element.setAttribute('aria-disabled', 'true');
    }
    const getOptionState = () => {
      const children = [];
      const optionChildren = toArray(this.element.querySelectorAll('[option]'));

      const value = [];
      optionChildren
        // Skip options that are themselves within an option
        .filter((child) => !this.getOptionElement_(child.parentElement))
        .forEach((child) => {
          const option = child.getAttribute('option');
          if (!child.hasAttribute('role')) {
            child.setAttribute('role', 'option');
          }
          const isDisabled = child.hasAttribute('disabled');
          if (isDisabled) {
            child.setAttribute('aria-disabled', 'true');
          }
          const props = {
            option,
            disabled: isDisabled,
            type: 'Slot',
            retarget: true,
            assignedElements: [child],
            postRender: () => {
              // Skip mutations to avoid cycles.
              mu.takeRecords();
            },
            getOption: (e) =>
              this.getOptionValue_(dev().assertElement(e.target)),
          };
          if (child.hasAttribute('selected') && option) {
            value.push(option);
          }
          const optionChild = <Option {...props} />;
          children.push(optionChild);
        });
      return {value, children};
    };

    const rebuild = () => {
      this.mutateProps(getOptionState());
    };

    const mu = new MutationObserver(rebuild);
    mu.observe(this.element, {
      attributeFilter: ['option', 'selected'],
      subtree: true,
    });

    const {value, children} = getOptionState();
    const onChange = (e) => {
      const {value, option} = e.target;
      isArray(value)
        ? this.selectOption_(option)
        : this.selectUniqueOption_(option);
      this.mutateProps(dict({'value': value}));
    };
    return dict({
      'children': children,
      'value': value,
      'onChange': onChange,
    });
  }

  /** @override */
  isLayoutSupported(unusedLayout) {
    userAssert(
      isExperimentOn(this.win, 'amp-selector-v2'),
      'expected amp-selector-v2 experiment to be enabled'
    );
    return true;
  }

  /**
   * @param {Element=} element
   * @return {Element|undefined}
   * @private
   */
  getOptionElement_(element) {
    if (!element) {
      return;
    }
    return closestAncestorElementBySelector(element, '[option]');
  }

  /**
   * @param {!Element} element
   * @return {string|undefined}
   * @private
   */
  getOptionValue_(element) {
    const optionElement = this.getOptionElement_(element);
    if (!optionElement || optionElement.hasAttribute('disabled')) {
      return;
    }
    return optionElement.getAttribute('option');
  }

  /**
   * Appends the 'selected' attribute on the child with the given 'option' value.
   * @param {string} option
   * @private
   */
  selectOption_(option) {
    const selector = `[option="${option}"]`;
    const optionElement = scopedQuerySelector(this.element, selector);
    if (optionElement.hasAttribute('selected')) {
      optionElement.removeAttribute('selected');
      return;
    }
    optionElement.setAttribute('selected', '');
  }

  /**
   * Removes all 'selected' attributes on children before selecting the given option.
   * @param {string} option
   * @private
   */
  selectUniqueOption_(option) {
    this.element
      .querySelectorAll('[selected]')
      .forEach((selected) => selected.removeAttribute('selected'));
    this.selectOption_(option);
  }
}

/** @override */
AmpSelector.Component = Selector;

/** @override */
AmpSelector.attachShadow = true;

/** @override */
AmpSelector.props = {
  'disabled': {attr: 'disabled'},
  'form': {attr: 'form'},
  'multiple': {attr: 'multiple'},
  'name': {attr: 'name'},
  'role': {attr: 'role'},
  'keyboardSelectMode': {attr: 'keyboard-select-mode'},
};

AMP.extension(TAG, '0.2', (AMP) => {
  AMP.registerElement(TAG, AmpSelector, CSS);
});
