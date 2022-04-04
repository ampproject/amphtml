import {devAssert} from '#core/assert';
import {isConnectedNode, rootNodeFor} from '#core/dom';
import {isElement} from '#core/types';
import {toArray} from '#core/types/array';

/**
 * @fileoverview Contains logic for implementing a11y and focus handling for
 * modals. This would ideally be handled by something like the `<dialog>`
 * element, but support is not currently there for all browsers.
 */

/**
 * @typedef {{
 *   element: !HTMLElement,
 *   prevValue: ?string,
 * }} HTMLElementAttributeInfoDef
 */

/**
 * @typedef {{
 *   element: !HTMLElement,
 *   hiddenElementInfos: !Array<!HTMLElementAttributeInfoDef>,
 *   focusableExternalElements: !Array<!HTMLElement>,
 *   focusableInternalElements: !Array<!HTMLElement>,
 * }} ModalEntryDef
 */

/**
 * @type {Array<ModalEntryDef>}
 */
const modalEntryStack = [];

/**
 * A property name for keeping track of the saved tab index on an Element.
 */
const SAVED_TAB_INDEX = '__AMP_MODAL_SAVED_TAB_INDEX';

/**
 * Given a target element, finds the Elements to hide for accessibility.
 * @param {HTMLElement} element The target Element.
 * @return {Array<HTMLElement>} The Elements to add hide from accessibiluty.
 * @package Visible for testing
 */
export function getElementsToAriaHide(element) {
  /** @type {HTMLElement[]} */
  const arr = [];
  const ancestors = getAncestors(element);

  for (let i = 0; i < ancestors.length; i++) {
    const cur = ancestors[i];

    if (!cur.parentNode) {
      continue;
    }

    toArray(/** @type {HTMLDocument|HTMLElement} */ (cur.parentNode).children)
      .filter((c) => c != cur)
      .forEach((c) => arr.push(/** @type {HTMLElement} */ (c)));
  }

  return arr;
}

/**
 * Gets all ancestors of an Element, including ancestors of any ShadowRoot
 * hosts.
 * @param {Element} element
 * @return {Array<Element>}
 */
function getAncestors(element) {
  const ancestry = [];

  for (
    let cur = element;
    cur;
    cur = cur.parentNode || /** @type {?} */ (cur).host
  ) {
    ancestry.push(cur);
  }

  // TODO(#37136): This typing is incorrect and may mask a bug. If `cur`
  // can sometimes be a `ShadowRoot`, `ancestors` can contain non-elements.
  return ancestry;
}

/**
 * Gets the potentially focusable elements, relative to a given element. Note
 * that we do not need to go into ShadowRoots, giving their host
 * `tabindex="-1"` is sufficient.
 *
 * Note that some of these Elements may not be focusable (e.g. is a button
 * that is `disabled` or has an ancestor that is `display: none`).
 * @param {HTMLElement} element
 * @return {HTMLElement[]}
 */
function getPotentiallyFocusableElements(element) {
  /** @type {HTMLElement[]} */
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

    cur = /** @type {ShadowRoot|?} */ (root).host;
  }

  return arr;
}

/**
 *
 * @param {HTMLElement} element The Element top operate on.
 * @param {string} attribute  The name of the attribute.
 * @param {?string=} value The value of the attribute.
 */
function restoreAttributeValue(element, attribute, value) {
  if (value === null || value == undefined) {
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
 * @param {HTMLElement} element
 */
export function setModalAsOpen(element) {
  devAssert(modalEntryStack.every((info) => info.element !== element));
  devAssert(isConnectedNode(element));

  const elements = getElementsToAriaHide(element);
  const ancestry = getAncestors(element).filter(isElement);
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
  const hiddenElementInfos = elements
    .concat(/** @type {Array<HTMLElement>} */ (ancestry))
    .map((element) => ({
      element,
      prevValue: element.getAttribute('aria-hidden'),
    }));

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
 * @param {HTMLElement} element
 */
export function setModalAsClosed(element) {
  const next = modalEntryStack.pop();
  devAssert(next);
  const {
    element: topModalElement,
    focusableExternalElements,
    focusableInternalElements,
    hiddenElementInfos,
  } = next;

  devAssert(isConnectedNode(element));
  devAssert(topModalElement === element);

  // Put aria-hidden back to how it was before the call.
  hiddenElementInfos.forEach(({element, prevValue}) =>
    restoreAttributeValue(element, 'aria-hidden', prevValue)
  );
  // Re-hide any internal elements that should be hidden.
  focusableInternalElements.forEach((e) => e.setAttribute('tabindex', '-1'));
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
