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
import {CSS} from '../../../build/amp-selector-1.0.css';
import {Option, Selector} from './selector';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {Services} from '../../../src/services';
import {
  closestAncestorElementBySelector,
  toggleAttribute,
} from '../../../src/dom';
import {createCustomEvent} from '../../../src/event-helper';
import {dev, devAssert, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {forwardRef} from '../../../src/preact/compat';
import {isExperimentOn} from '../../../src/experiments';
import {mod} from '../../../src/utils/math';
import {toArray} from '../../../src/types';
import {useLayoutEffect} from '../../../src/preact';

/** @const {string} */
const TAG = 'amp-selector';

class AmpSelector extends PreactBaseElement {
  /** @override */
  init() {
    const {element} = this;
    const action = Services.actionServiceForDoc(this.element);
    this.optionState = [];

    // TODO(wg-bento): This hack is in place to prevent doubly rendering.
    // See https://github.com/ampproject/amp-react-prototype/issues/40.
    let isExpectedMutation = false;
    const handleSelect = (value, option, trust) => {
      fireSelectEvent(this.win, action, element, option, value, trust);
      isExpectedMutation = true;
      this.mutateProps(dict({'value': value}));
    };

    this.registerApiAction('clear', (api) => api./*OK*/ clear());
    this.registerApiAction('selectUp', (api, invocation) => {
      const {args} = invocation;
      const delta = args && args['delta'] !== undefined ? -args['delta'] : -1;
      const initialValue = /** @type {!Array<string>} */ (this.getProp(
        'value',
        []
      ));
      selectByDelta(delta, initialValue, options, api);
    });
    this.registerApiAction('selectDown', (api, invocation) => {
      const {args} = invocation;
      const delta = args && args['delta'] !== undefined ? args['delta'] : 1;
      const initialValue = /** @type {!Array<string>} */ (this.getProp(
        'value',
        []
      ));
      selectByDelta(delta, initialValue, options, api);
    });
    this.registerApiAction('toggle', (api, invocation) => {
      const {args} = invocation;
      const {'index': index, 'value': opt_select} = args;
      userAssert(typeof index === 'number', "'index' must be specified");
      const option = this.optionState[index];
      if (option) {
        api./*OK */ toggle(option, opt_select);
      }
    });

    const mu = new MutationObserver(() => {
      if (isExpectedMutation) {
        isExpectedMutation = false;
        return;
      }
      const {children, options} = getOptions(element, mu);
      this.optionState = options;
      this.mutateProps({children});
    });
    mu.observe(element, {
      attributeFilter: ['option', 'selected', 'disabled'],
      childList: true,
      subtree: true,
    });

    const {children, value, options} = getOptions(element, mu);
    this.optionState = options;
    return dict({
      'shimDomElement': element,
      'children': children,
      'value': value,
      'onChange': (e) => {
        handleSelect(e['value'], e['option'], ActionTrust.HIGH);
      },
    });
  }

  /** @override */
  isLayoutSupported(unusedLayout) {
    userAssert(
      isExperimentOn(this.win, 'amp-selector-bento'),
      'expected amp-selector-bento experiment to be enabled'
    );
    return true;
  }
}

/**
 * @param {!Element} element
 * @param {MutationObserver} mu
 * @return {!JsonObject}
 */
function getOptions(element, mu) {
  const children = [];
  const options = [];
  const value = [];
  const optionChildren = toArray(element.querySelectorAll('[option]'));
  optionChildren
    // Skip options that are themselves within an option
    .filter(
      (el) =>
        !closestAncestorElementBySelector(
          dev().assertElement(el.parentElement),
          '[option]'
        )
    )
    .forEach((child, index) => {
      const option = child.getAttribute('option') || index.toString();
      const selected = child.hasAttribute('selected');
      const disabled = child.hasAttribute('disabled');
      const props = {
        as: OptionShim,
        option,
        disabled,
        role: child.getAttribute('role') || 'option',
        shimDomElement: child,
        // TODO(wg-bento): This implementation causes infinite loops on DOM mutation.
        // See https://github.com/ampproject/amp-react-prototype/issues/40.
        postRender: () => {
          // Skip mutations to avoid cycles.
          mu.takeRecords();
        },
        selected,
      };
      if (selected) {
        value.push(option);
      }
      const optionChild = <Option {...props} />;
      options.push(option);
      children.push(optionChild);
    });
  return {value, children, options};
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
 * This method returns the new selected state by modifying
 * at most one value of the current selected state by the given delta.
 * The modification is done in FIFO order. When no values are selected,
 * the new selected state becomes the option at the given delta.
 *
 * ex: (1, [0, 2], [0, 1, 2, 3]) => [2, 1]
 * ex: (-1, [2, 1], [0, 1, 2, 3]) => [1]
 * ex: (2, [2, 1], [0, 1, 2, 3]) => [1, 0]
 * ex: (-1, [], [0, 1, 2, 3]) => [3]
 * @param {number} delta
 * @param {!Array<string>} value
 * @param {Array<string>} options
 * @param {!SelectorDef.SelectorApi} api
 * @return {{value: Array<string>, option: string}|undefined}
 */
function selectByDelta(delta, value, options, api) {
  const previous = options.indexOf(value.shift());
  api./*OK */ toggle(previous, /* deselect */ false);

  // If previousIndex === -1 is true, then a negative delta will be offset
  // one more than is wanted when looping back around in the options.
  // This occurs when no options are selected and "selectUp" is called.
  const selectUpWhenNoneSelected = previous === -1 && delta < 0;
  const index = selectUpWhenNoneSelected ? delta : previous + delta;
  const option = options[mod(index, options.length)];

  // Only add option if it is not already selected.
  if (value.indexOf(option) === -1) {
    api./*OK */ toggle(option, /* select */ true);
  }
}

/**
 * @param {!SelectorDef.OptionProps} props
 * @return {PreactDef.Renderable}
 */
function OptionShim({
  shimDomElement,
  onClick,
  selected,
  disabled,
  role = 'option',
}) {
  useLayoutEffect(() => {
    if (!onClick) {
      return;
    }
    shimDomElement.addEventListener('click', (e) => onClick(e));
    return () => {
      shimDomElement.removeEventListener(
        'click',
        devAssert((e) => onClick(e))
      );
    };
  }, [shimDomElement, onClick]);

  useLayoutEffect(() => {
    toggleAttribute(shimDomElement, 'selected', selected);
  }, [shimDomElement, selected]);

  useLayoutEffect(() => {
    toggleAttribute(shimDomElement, 'disabled', disabled);
    shimDomElement.setAttribute('aria-disabled', !!disabled);
  }, [shimDomElement, disabled]);

  useLayoutEffect(() => {
    shimDomElement.setAttribute('role', role);
  }, [shimDomElement, role]);

  return <div></div>;
}

/**
 * @param {!SelectorDef.Props} props
 * @param {{current: (!SelectorDef.SelectorApi|null)}} ref
 * @return {PreactDef.Renderable}
 */
function SelectorShimWithRef(
  {shimDomElement, multiple, disabled, role = 'listbox', ...rest},
  ref
) {
  useLayoutEffect(() => {
    toggleAttribute(shimDomElement, 'multiple', multiple);
    shimDomElement.setAttribute('aria-multiselectable', !!multiple);
  }, [shimDomElement, multiple]);

  useLayoutEffect(() => {
    toggleAttribute(shimDomElement, 'disabled', disabled);
    shimDomElement.setAttribute('aria-disabled', !!disabled);
  }, [shimDomElement, disabled]);

  useLayoutEffect(() => {
    shimDomElement.setAttribute('role', role);
  }, [shimDomElement, role]);

  return (
    <Selector
      role={role}
      multiple={multiple}
      disabled={disabled}
      ref={ref}
      {...rest}
    />
  );
}

const SelectorShim = forwardRef(SelectorShimWithRef);
Selector.displayName = 'SelectorShim'; // Make findable for tests.

/** @override */
AmpSelector['Component'] = SelectorShim;

/** @override */
AmpSelector['detached'] = true;

/** @override */
AmpSelector['props'] = {
  'disabled': {attr: 'disabled', type: 'boolean'},
  'multiple': {attr: 'multiple', type: 'boolean'},
  'name': {attr: 'name'},
  'role': {attr: 'role'},
  'keyboardSelectMode': {attr: 'keyboard-select-mode'},
};

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpSelector, CSS);
});
