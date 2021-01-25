import {devAssert} from './log';
import {isConnectedNode, rootNodeFor} from './dom';
import {toArray} from './types';

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview Contains logic for implementing a11y and focus handling for
 * modals. This would ideally be handled by something like the `<dialog>`
 * element, but support is not currently there for all browsers.
 */

/**
 * @typedef {{
 *   element: !Element,
 *   prevValue: ?string,
 * }}
 */
let ElementAttributeInfoDef;

/**
 * @typedef {{
 *   element: !Element,
 *   hiddenElementInfos: !Array<!ElementAttributeInfoDef>,
 *   focusableExternalElements: !Array<!Element>,
 *   focusableInternalElements: !Array<!Element>,
 * }}
 */
let ModalEntryDef;

/**
 * @type {!Array<!ModalEntryDef>}
 */
const modalEntryStack = [];

/**
 * A property name for keeping track of the saved tab index on an Element.
 */
const SAVED_TAB_INDEX = '__AMP_MODAL_SAVED_TAB_INDEX';

/**
 * Given a target element, finds the Elements to hide for accessibility.
 * @param {!Element} element The target Element.
 * @return {!Array<!Element>} The Elements to add hide from accessibiluty.
 * @package Visible for testing
 */
export function getElementsToAriaHide(element) {
  const arr = [];
  const ancestors = getAncestors(element);

  for (let i = 0; i < ancestors.length; i++) {
    const cur = ancestors[i];

    if (!cur.parentNode) {
      continue;
    }

    toArray(cur.parentNode.children)
      .filter((c) => c != cur)
      .forEach((c) => arr.push(c));
  }

  return arr;
}

/**
 * Gets all ancestors of an Element, including ancestors of any ShadowRoot
 * hosts.
 * @param {!Element} element
 * @return {!Array<!Element>}
 */
function getAncestors(element) {
  const ancestry = [];

  for (let cur = element; cur; cur = cur.parentNode || cur.host) {
    ancestry.push(cur);
  }

  return ancestry;
}

/**
 * Gets the potentially focusable elements, relative to a given element. Not
 * that we do not need to go into ShadowRoots, giving their host
 * `tabindex="-1"` is sufficient.
 *
 * Note that some of these Elements may not be focusable (e.g. is a button
 * that is `disabled` or has an ancestor that is `display: none`).
 * @param {!Element} element
 * @return {!Array<!Element>}
 */
function getPotentiallyFocusableElements(element) {
  const arr = [];
  let cur = element;

  while (cur) {
    const root = rootNodeFor(cur);
    /*
     *  Based on https://html.spec.whatwg.org/multipage/interaction.html#the-tabindex-attribute
     * - Excludes `<frame>`, `<frameset>` since those are deprecated.
     * - Excludes `<link>`, those don't actually seem to be focusable in
     *   practice, even if you give them a `display` that is not `none`.
     * - Includes `<area>`, which is missing (perhaps they meant area instead
     *   of link?).
     */
    const potentiallyFocusable = root.querySelectorAll(
      [
        'a[href]',
        'area[href]',
        'button',
        'details summary',
        'iframe',
        'input',
        'select',
        'textarea',
        '[contenteditable]',
        '[draggable]',
        '[tabindex]',
      ].join(',')
    );
    Array.prototype.push.apply(arr, potentiallyFocusable);

    cur = root.host;
  }

  return arr;
}

/**
 *
 * @param {!Element} element The Element top operate on.
 * @param {string} attribute  The name of the attribute.
 * @param {?string} value The value of the attribute.
 */
function restoreAttributeValue(element, attribute, value) {
  if (value === null) {
    element.removeAttribute(attribute);
  } else {
    element.setAttribute(attribute, value);
  }
}

/**
 * Sets an Element as an open modal, making all Elements outside of the page
 * hidden from the tab order and screenreaders.
 *
 * This is done by making other subtrees 'aria-hidden', as well as giving a
 * negative `tabindex` to all focusable elements outside the modal. When
 * opening a modal, the ancestry has `aria-hidden` removed any any `tabindex`
 * values within the modal restored.
 *
 * Note: this does not block click events on things outside of the modal. It is
 * assumed that a backdrop Element blocking clicks is present.
 * @param {!Element} element
 */
export function setModalAsOpen(element) {
  devAssert(modalEntryStack.every((info) => info.element !== element));
  devAssert(isConnectedNode(element));

  const elements = getElementsToAriaHide(element);
  const ancestry = getAncestors(element).filter(
    (n) => n.nodeType == Node.ELEMENT_NODE
  );
  const focusableElements = getPotentiallyFocusableElements(element);
  // Get the elements that are internally focusable, and have been made
  // non-focusable; we want to unhide these.
  const focusableInternalElements = focusableElements.filter((e) => {
    return element.contains(e) && e[SAVED_TAB_INDEX] !== undefined;
  });
  // Get the elements that are externally focusable, and have not yet been made
  // non-focusable; we want to hide these.
  const focusableExternalElements = focusableElements.filter((e) => {
    return !element.contains(e) && e[SAVED_TAB_INDEX] === undefined;
  });
  const hiddenElementInfos = elements.concat(ancestry).map((element) => {
    return {
      element,
      prevValue: element.getAttribute('aria-hidden'),
    };
  });

  // Unhide the ancestry, in case it was hidden from another modal.
  ancestry.forEach((e) => e.removeAttribute('aria-hidden'));
  // Hide everything else.
  elements.forEach((e) => e.setAttribute('aria-hidden', 'true'));
  // Make everything outside of the modal non-focusable via tab.
  focusableExternalElements.forEach((e) => {
    e[SAVED_TAB_INDEX] = e.getAttribute('tabindex');
    e.setAttribute('tabindex', '-1');
  });
  // Restore the focusability of everything inside of the modal that was made
  // non-focusable.
  focusableInternalElements.forEach((e) => {
    devAssert(e[SAVED_TAB_INDEX] !== undefined);
    restoreAttributeValue(e, 'tabindex', e[SAVED_TAB_INDEX]);
  });

  modalEntryStack.push({
    element,
    hiddenElementInfos,
    focusableExternalElements,
    focusableInternalElements,
  });
}

/**
 * Undoes the effectsof `setModalAsOpen`. This should only be called with the
 * currently open modal.
 * @param {!Element} element
 */
export function setModalAsClosed(element) {
  const {
    element: topModalElement,
    hiddenElementInfos,
    focusableExternalElements,
    focusableInternalElements,
  } = modalEntryStack.pop();

  devAssert(isConnectedNode(element));
  devAssert(topModalElement === element);

  // Put aria-hidden back to how it was before the call.
  hiddenElementInfos.forEach((hiddenElementInfo) => {
    const {element, prevValue} = hiddenElementInfo;
    restoreAttributeValue(element, 'aria-hidden', prevValue);
  });
  // Re-hide any internal elements that should be hidden.
  focusableInternalElements.forEach((e) => {
    e.setAttribute('tabindex', '-1');
  });
  // Re-show any external elements that were hidden, and clear the saved
  // tabindex.
  focusableExternalElements.forEach((e) => {
    devAssert(e[SAVED_TAB_INDEX] !== undefined);
    restoreAttributeValue(e, 'tabindex', e[SAVED_TAB_INDEX]);
    e[SAVED_TAB_INDEX] = undefined;
  });
}

/**
 * @package Visible for testing
 */
export function clearModalStack() {
  modalEntryStack.length = 0;
}

/**
 * @return {number} The number of entries in the stack, for testing.
 * @package Visible for testing
 */
export function getModalStackLength() {
  return modalEntryStack.length;
}
