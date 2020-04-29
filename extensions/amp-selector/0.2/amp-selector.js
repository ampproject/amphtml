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
import {ActionTrust} from '../../../src/action-constants';
import {CSS} from '../../../build/amp-selector-0.2.css';
import {Option, Selector} from './selector';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {Services} from '../../../src/services';
import {
  closestAncestorElementBySelector,
  scopedQuerySelector,
  toggleAttribute,
} from '../../../src/dom';
import {createCustomEvent} from '../../../src/event-helper';
import {dict} from '../../../src/utils/object';
import {isExperimentOn} from '../../../src/experiments';
import {toArray} from '../../../src/types';
import {useEffect} from '../../../src/preact';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-selector';

class AmpSelector extends PreactBaseElement {
  /** @override */
  init() {
    const {/** @type {!Element} */ element} = this;
    const action = Services.actionServiceForDoc(this.element);

    if (!element.hasAttribute('role')) {
      element.setAttribute('role', 'listbox');
    }

    const isMultiple = element.hasAttribute('multiple');
    if (isMultiple) {
      element.setAttribute('aria-multiselectable', 'true');
    }
    if (element.hasAttribute('disabled')) {
      element.setAttribute('aria-disabled', 'true');
    }
    const getOptionState = () => {
      const children = [];
      const optionChildren = toArray(element.querySelectorAll('[option]'));

      const value = [];
      optionChildren
        // Skip options that are themselves within an option
        .filter(
          (child) =>
            !closestAncestorElementBySelector(child.parentNode, '[option]')
        )
        .forEach((child) => {
          const option = child.getAttribute('option');
          const selected = child.hasAttribute('selected');
          const props = {
            as: OptionShim,
            option,
            isDisabled: child.hasAttribute('disabled'),
            role: child.getAttribute('role') || 'option',
            domElement: child,
            // TODO(wg-bento): This implementation causes infinite loops on DOM mutation.
            // See https://github.com/ampproject/amp-react-prototype/issues/40.
            postRender: () => {
              // Skip mutations to avoid cycles.
              mu.takeRecords();
            },
            selected,
          };
          if (selected && option) {
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
    mu.observe(element, {
      attributeFilter: ['option', 'selected'],
      subtree: true,
    });

    const {value, children} = getOptionState();
    const onChange = (e) => {
      const {value, option} = e;
      isMultiple
        ? selectOption(element, option)
        : selectUniqueOption(element, option);
      fireSelectEvent(
        this.win,
        action,
        element,
        option,
        value,
        ActionTrust.HIGH
      );
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
}

/**
 * Appends the 'selected' attribute on the child of the given element with the given 'option' value.
 * @param {!Element} element
 * @param {string} option
 */
function selectOption(element, option) {
  const selector = `[option="${option}"]`;
  const optionElement = scopedQuerySelector(element, selector);
  if (optionElement.hasAttribute('selected')) {
    optionElement.removeAttribute('selected');
    return;
  }
  optionElement.setAttribute('selected', '');
}

/**
 * Removes all 'selected' attributes on children before selecting the given option.
 * @param {!Element} element
 * @param {string} option
 */
function selectUniqueOption(element, option) {
  toArray(element.querySelectorAll('[selected]')).forEach((selected) =>
    selected.removeAttribute('selected')
  );
  selectOption(element, option);
}

/**
 * Triggers a 'select' event with two data params:
 * 'targetOption' - option value of the selected or deselected element.
 * 'selectedOptions' - array of option values of selected elements.
 *
 * @param {!Window} win
 * @param {!../../../src/service/action-impl.ActionService} action
 * @param {!Element} el The element that was selected or deslected.
 * @param {string} option
 * @param {Array<string>} value
 * @param {!ActionTrust} trust
 * @private
 */
function fireSelectEvent(win, action, el, option, value, trust) {
  const name = 'select';
  const selectEvent = createCustomEvent(
    win,
    `amp-selector.${name}`,
    dict({'targetOption': option, 'selectedOptions': value})
  );
  action.trigger(el, name, selectEvent, trust);
}

/**
 * @param {!JsonObject} props
 * @return {PreactDef.Renderable}
 */
function OptionShim(props) {
  const {
    'domElement': domElement,
    'onClick': onClick,
    'selected': selected,
    'isDisabled': isDisabled,
    'role': role,
  } = props;
  useEffect(() => {
    if (onClick) {
      domElement.addEventListener('click', onClick);
    }
    return () => {
      if (onClick) {
        domElement.removeEventListener('click', onClick);
      }
    };
  }, [domElement, onClick]);

  useEffect(() => {
    toggleAttribute(domElement, 'selected', selected);
  }, [domElement, selected]);

  useEffect(() => {
    toggleAttribute(domElement, 'disabled', isDisabled);
    toggleAttribute(domElement, 'aria-disabled', isDisabled);
  }, [domElement, isDisabled]);

  useEffect(() => {
    toggleAttribute(domElement, 'role', role);
  }, [domElement, role]);
}

/** @override */
AmpSelector.Component = Selector;

/** @override */
AmpSelector.props = {
  // TODO: Add 'forms' attribute when form integrations are supported.
  'disabled': {attr: 'disabled'},
  'multiple': {attr: 'multiple'},
  'name': {attr: 'name'},
  'role': {attr: 'role'},
  'keyboardSelectMode': {attr: 'keyboard-select-mode'},
};

AMP.extension(TAG, '0.2', (AMP) => {
  AMP.registerElement(TAG, AmpSelector, CSS);
});
