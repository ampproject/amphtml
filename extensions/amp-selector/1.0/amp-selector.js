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
  createElementWithAttributes,
  toggleAttribute,
  tryFocus,
} from '../../../src/dom';
import {createCustomEvent} from '../../../src/event-helper';
import {dev, devAssert, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {isExperimentOn} from '../../../src/experiments';
import {toArray} from '../../../src/types';
import {useCallback, useLayoutEffect, useRef} from '../../../src/preact';

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

    this.registerApiAction('clear', (api) => {
      api./*OK*/ clear();
      this.mutateProps(dict({'value': []}));
    });
    this.registerApiAction('selectUp', (api, invocation) => {
      const {args} = invocation;
      const delta = args && args['delta'] !== undefined ? -args['delta'] : -1;
      api./*OK*/ selectBy(delta);
    });
    this.registerApiAction('selectDown', (api, invocation) => {
      const {args} = invocation;
      const delta = args && args['delta'] !== undefined ? args['delta'] : 1;
      api./*OK*/ selectBy(delta);
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
      this.mutateProps({children, options});
    });
    mu.observe(element, {
      attributeFilter: ['option', 'selected', 'disabled'],
      childList: true,
      subtree: true,
    });

    const {children, value, options} = getOptions(element, mu);
    this.optionState = options;
    return dict({
      'as': SelectorShim,
      'shimDomElement': element,
      'children': children,
      'value': value,
      'onChange': (e) => {
        handleSelect(e['value'], e['option'], ActionTrust.HIGH);
      },
      'options': options,
    });
  }

  /** @override */
  isLayoutSupported(unusedLayout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-selector'),
      'expected global "bento" or specific "bento-selector" experiment to be enabled'
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
      const tabIndex = child.getAttribute('tabindex');
      const props = {
        as: OptionShim,
        option,
        disabled,
        index,
        onFocus: () => tryFocus(child),
        role: child.getAttribute('role') || 'option',
        shimDomElement: child,
        // TODO(wg-bento): This implementation causes infinite loops on DOM mutation.
        // See https://github.com/ampproject/amp-react-prototype/issues/40.
        postRender: () => {
          // Skip mutations to avoid cycles.
          mu.takeRecords();
        },
        selected,
        tabIndex,
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
 * @param {!SelectorDef.OptionProps} props
 * @return {PreactDef.Renderable}
 */
function OptionShim({
  shimDomElement,
  onClick,
  onFocus,
  onKeyDown,
  selected,
  disabled,
  role = 'option',
  tabIndex,
}) {
  const syncEvent = useCallback(
    (type, handler) => {
      if (!handler) {
        return;
      }
      shimDomElement.addEventListener(type, handler);
      return () => shimDomElement.removeEventListener(name, devAssert(handler));
    },
    [shimDomElement]
  );

  useLayoutEffect(() => syncEvent('click', onClick), [onClick, syncEvent]);
  useLayoutEffect(() => syncEvent('focus', onFocus), [onFocus, syncEvent]);
  useLayoutEffect(() => syncEvent('keydown', onKeyDown), [
    onKeyDown,
    syncEvent,
  ]);

  useLayoutEffect(() => {
    toggleAttribute(shimDomElement, 'selected', !!selected);
  }, [shimDomElement, selected]);

  useLayoutEffect(() => {
    toggleAttribute(shimDomElement, 'disabled', !!disabled);
    shimDomElement.setAttribute('aria-disabled', !!disabled);
  }, [shimDomElement, disabled]);

  useLayoutEffect(() => {
    shimDomElement.setAttribute('role', role);
  }, [shimDomElement, role]);

  useLayoutEffect(() => {
    if (tabIndex != undefined) {
      shimDomElement.tabIndex = tabIndex;
    }
  }, [shimDomElement, tabIndex]);

  return <div></div>;
}

/**
 * @param {!SelectorDef.Props} props
 * @return {PreactDef.Renderable}
 */
function SelectorShim({
  shimDomElement,
  children,
  form,
  multiple,
  name,
  disabled,
  onKeyDown,
  role = 'listbox',
  tabIndex,
  value,
}) {
  const input = useRef(null);
  if (!input.current) {
    input.current = createElementWithAttributes(
      shimDomElement.ownerDocument,
      'input',
      {
        'hidden': '',
      }
    );
  }

  useLayoutEffect(() => {
    const el = input.current;
    shimDomElement.insertBefore(el, shimDomElement.firstChild);
    return () => shimDomElement.removeChild(el);
  }, [shimDomElement]);

  const syncAttr = useCallback((attr, value) => {
    if (value) {
      input.current.setAttribute(attr, value);
    } else {
      input.current.removeAttribute(attr);
    }
  }, []);

  useLayoutEffect(() => syncAttr('form', form), [form, syncAttr]);
  useLayoutEffect(() => syncAttr('name', name), [name, syncAttr]);
  useLayoutEffect(() => syncAttr('value', value), [value, syncAttr]);

  useLayoutEffect(() => {
    if (!onKeyDown) {
      return;
    }
    shimDomElement.addEventListener('keydown', onKeyDown);
    return () =>
      shimDomElement.removeEventListener('keydown', devAssert(onKeyDown));
  }, [shimDomElement, onKeyDown]);

  useLayoutEffect(() => {
    toggleAttribute(shimDomElement, 'multiple', !!multiple);
    shimDomElement.setAttribute('aria-multiselectable', !!multiple);
  }, [shimDomElement, multiple]);

  useLayoutEffect(() => {
    toggleAttribute(shimDomElement, 'disabled', !!disabled);
    shimDomElement.setAttribute('aria-disabled', !!disabled);
  }, [shimDomElement, disabled]);

  useLayoutEffect(() => {
    shimDomElement.setAttribute('role', role);
  }, [shimDomElement, role]);

  useLayoutEffect(() => {
    if (tabIndex != undefined) {
      shimDomElement.tabIndex = tabIndex;
    }
  }, [shimDomElement, tabIndex]);

  return <div children={children} />;
}

/** @override */
AmpSelector['Component'] = Selector;

/** @override */
AmpSelector['detached'] = true;

/** @override */
AmpSelector['props'] = {
  'disabled': {attr: 'disabled', type: 'boolean'},
  'form': {attr: 'form'},
  'multiple': {attr: 'multiple', type: 'boolean'},
  'name': {attr: 'name'},
  'role': {attr: 'role'},
  'tabindex': {attr: 'tabindex'},
  'keyboardSelectMode': {attr: 'keyboard-select-mode'},
};

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpSelector, CSS);
});
