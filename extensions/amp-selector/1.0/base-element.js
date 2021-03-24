/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
import {Option, Selector} from './component';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {
  closestAncestorElementBySelector,
  createElementWithAttributes,
  toggleAttribute,
  tryFocus,
} from '../../../src/dom';
import {devAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {toArray} from '../../../src/types';
import {useCallback, useLayoutEffect, useRef} from '../../../src/preact';

export class BaseElement extends PreactBaseElement {
  /** @override */
  init() {
    const {element} = this;
    this.optionState = [];

    // Listen for mutations
    const mu = new MutationObserver(() => {
      if (this.isExpectedMutation) {
        this.isExpectedMutation = false;
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

    // TODO(wg-bento): This hack is in place to prevent doubly rendering.
    // See https://github.com/ampproject/amp-react-prototype/issues/40.
    const onChangeHandler = (event) => {
      const {option, value} = event;
      this.triggerEvent(
        this.element,
        'select',
        dict({
          'targetOption': option,
          'selectedOptions': value,
        })
      );

      this.isExpectedMutation = true;
      this.mutateProps(dict({'value': value}));
    };

    // Return props
    const {children, value, options} = getOptions(element, mu);
    this.optionState = options;
    return dict({
      'as': SelectorShim,
      'shimDomElement': element,
      'children': children,
      'value': value,
      'options': options,
      'onChange': onChangeHandler,
    });
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
          devAssert(el.parentElement?.nodeType == 1, 'Expected an element'),
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
 * @param {!SelectorDef.OptionProps} props
 * @return {PreactDef.Renderable}
 */
export function OptionShim({
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
      return () => shimDomElement.removeEventListener(type, devAssert(handler));
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
BaseElement['Component'] = Selector;

/** @override */
BaseElement['detached'] = true;

/** @override */
BaseElement['props'] = {
  'disabled': {attr: 'disabled', type: 'boolean'},
  'form': {attr: 'form'},
  'multiple': {attr: 'multiple', type: 'boolean'},
  'name': {attr: 'name'},
  'role': {attr: 'role'},
  'tabIndex': {attr: 'tabindex'},
  'keyboardSelectMode': {attr: 'keyboard-select-mode', media: true},
};
