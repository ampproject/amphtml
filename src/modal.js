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
 * @type {{
 *   element: !Element,
 *   prevValue: ?string,
 * }}
 */
let ElementAttributeInfoDef;

/**
 * @type {{
 *   element: !Element,
 *   hiddenElementInfos: !Array<!ElementAttributeInfoDef>,
 *   focusableElementInfos: !Array<!ElementAttributeInfoDef>,
 * }}
 */
let ModalEntryDef;

/**
 * @type {!Array<!ModalEntryDef>}
 */
const modalEntryStack = [];

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
      .filter(c => c != cur)
      .forEach(c => arr.push(c));
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
 * Gets the potentially focusable elements, assuming something within the
 * Element has focus. Note that we do not need to go into ShadowRoots, giving
 * their host `tabindex="-1"` is sufficient.
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
    const potentiallyFocusable = root.querySelectorAll(
      [
        'a[href]',
        'area[href]',
        'button',
        'details',
        'iframe',
        'input',
        'select',
        'textarea',
        '[contenteditable]',
        '[tabindex]',
      ].join(',')
    );
    Array.prototype.push.apply(arr, potentiallyFocusable);

    cur = root.host;
  }

  return arr.filter(e => !element.contains(e));
}

/**
 * Sets an Element as an open modal, making all Elements outside of the page
 * hidden from the tab order and screenreaders.
 *
 * Note: this does not block click events on things outside of the modal. It is
 * assumed that a backdrop Element blocking clicks is present.
 * @param {!Element} element
 */
export function setModalAsOpen(element) {
  devAssert(modalEntryStack.every(info => info.element !== element));
  devAssert(isConnectedNode(element));

  const elements = getElementsToAriaHide(element);
  const ancestry = getAncestors(element).filter(
    n => n.nodeType == Node.ELEMENT_NODE
  );
  const focusableElements = getPotentiallyFocusableElements(element);
  const hiddenElementInfos = elements.concat(ancestry).map(element => {
    return {
      element,
      prevValue: element.getAttribute('aria-hidden'),
    };
  });
  const focusableElementInfos = focusableElements.map(element => {
    return {
      element,
      prevValue: element.getAttribute('tabindex'),
    };
  });

  // Unhide the ancestry, in case it was hidden from another modal.
  ancestry.forEach(e => e.removeAttribute('aria-hidden'));
  // Hide everything else.
  elements.forEach(e => e.setAttribute('aria-hidden', 'true'));
  // Make everything outside of the dialog non-focusable via tab.
  focusableElements.forEach(e => e.setAttribute('tabindex', '-1'));

  modalEntryStack.push({
    element,
    hiddenElementInfos,
    focusableElementInfos,
  });
}

/**
 * Undoes the effectsof `setModalAsOpen`. This should only be called with the
 * currently open modal.
 * @param {*} element
 */
export function setModalAsClosed(element) {
  const {
    element: topModalElement,
    hiddenElementInfos,
    focusableElementInfos,
  } = modalEntryStack.pop();

  devAssert(isConnectedNode(element));
  devAssert(topModalElement === element);

  // Put aria-hidden back to how it was before the call.
  hiddenElementInfos.forEach(({element, prevValue}) => {
    if (prevValue == null) {
      element.removeAttribute('aria-hidden');
    } else {
      element.setAttribute('aria-hidden', prevValue);
    }
  });
  focusableElementInfos.forEach(({element, prevValue}) => {
    if (prevValue == null) {
      element.removeAttribute('tabindex');
    } else {
      element.setAttribute('tabindex', prevValue);
    }
  });
}

/**
 * @pacakge Visible for testing
 */
export function clearModalStack() {
  modalEntryStack.length = 0;
}
