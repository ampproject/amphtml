import {devAssert} from '#core/assert/dev';
import {
  createElementWithAttributes,
  toggleAttribute,
  tryFocus,
} from '#core/dom';
import {closestAncestorElementBySelector} from '#core/dom/query';
import {toArray} from '#core/types/array';
import {dict} from '#core/types/object';

import * as Preact from '#preact';
import {useCallback, useLayoutEffect, useRef} from '#preact';
import {propName} from '#preact/utils';

import {BentoSelectorOption} from './component';
export {BentoSelector as Component} from './component';

/**
 * @param {Node} element
 * @param {function():void} muCb
 * @param {function():void} onChangeHandler
 * @return {*}
 */
export function elementInit(element, muCb, onChangeHandler) {
  // Listen for mutations
  const mu = new MutationObserver(() => muCb(mu));
  mu.observe(element, {
    attributeFilter: ['option', 'selected', 'disabled'],
    childList: true,
    subtree: true,
  });

  // Return props
  const {children, options, value} = getOptions(element, mu);
  return dict({
    'as': SelectorShim,
    'shimDomElement': element,
    'children': children,
    'value': value,
    'options': options,
    'onChange': onChangeHandler,
  });
}

/**
 * @param {!Element} element
 * @param {MutationObserver} mu
 * @return {!JsonObject}
 */
export function getOptions(element, mu) {
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
        focus: () => tryFocus(child),
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
      const optionChild = <BentoSelectorOption {...props} />;
      options.push(option);
      children.push(optionChild);
    });
  return {value, children, options};
}

/**
 * @param {!BentoSelectorDef.OptionProps} props
 * @return {PreactDef.Renderable}
 */
export function OptionShim({
  disabled,
  onClick,
  onFocus,
  onKeyDown,
  role = 'option',
  selected,
  shimDomElement,
  [propName('tabIndex')]: tabIndex,
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
  useLayoutEffect(
    () => syncEvent('keydown', onKeyDown),
    [onKeyDown, syncEvent]
  );

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
 * @param {!BentoSelectorDef.Props} props
 * @return {PreactDef.Renderable}
 */
function SelectorShim({
  children,
  disabled,
  form,
  multiple,
  name,
  onKeyDown,
  role = 'listbox',
  shimDomElement,
  value,
  [propName('tabIndex')]: tabIndex,
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

export const detached = true;

export const props = {
  'disabled': {attr: 'disabled', type: 'boolean'},
  'form': {attr: 'form'},
  'multiple': {attr: 'multiple', type: 'boolean'},
  'name': {attr: 'name'},
  'role': {attr: 'role'},
  'tabIndex': {attr: 'tabindex'},
  'keyboardSelectMode': {attr: 'keyboard-select-mode', media: true},
};
