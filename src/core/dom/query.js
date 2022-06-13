import {devAssert, devAssertElement} from '#core/assert';
import * as mode from '#core/mode';
import {isElement, isString} from '#core/types';

import {isScopeSelectorSupported, prependSelectorsWith} from './css-selectors';

/** @fileoverview Helper functions for DOM queries. */

/**
 * Asserts that name is just an alphanumeric word, and does not contain
 * advanced CSS selector features like attributes, psuedo-classes, class names,
 * nor ids.
 * @param {string} name
 */
function assertIsName(name) {
  devAssert(
    /^[\w-]+$/.test(name),
    `Expected "${name}" to be a CSS name composed of alphanumerics and hyphens.`
  );
}

/**
 * Finds all elements that matche `selector`, scoped inside `root`
 * for user-agents that do not support native scoping.
 *
 * This method isn't required for modern builds, can be removed.
 * TODO(#37136): This will fail if `root` is a `ShadowRoot`.
 *
 * @param {Element|ShadowRoot} root
 * @param {string} selector
 * @return {NodeList}
 */
function scopedQuerySelectionFallback(root, selector) {
  const {classList} = /** @type {Element} */ (root);

  const unique = 'i-amphtml-scoped';
  classList.add(unique);
  const scopedSelector = prependSelectorsWith(selector, `.${unique}`);
  const elements = root./*OK*/ querySelectorAll(scopedSelector);
  classList.remove(unique);
  return elements;
}

/**
 * Finds the first element that matches `selector`, scoped inside `root`.
 * Note: in IE, this causes a quick mutation of the element's class list.
 * @param {Element|ShadowRoot} root
 * @param {string} selector
 * @return {?HTMLElement}
 *
 * @suppress {suspiciousCode}
 */
export function scopedQuerySelector(root, selector) {
  if (mode.isEsm() || isScopeSelectorSupported(root)) {
    return root./*OK*/ querySelector(prependSelectorsWith(selector, ':scope'));
  }

  // Only IE.
  const fallbackResult = /** @type {?HTMLElement} */ (
    scopedQuerySelectionFallback(root, selector)[0]
  );
  return fallbackResult === undefined ? null : fallbackResult;
}

/**
 * Finds every element that matches `selector`, scoped inside `root`.
 * Note: in IE, this causes a quick mutation of the element's class list.
 * @param {HTMLElement|ShadowRoot} root
 * @param {string} selector
 * @return {NodeList}
 *
 * @suppress {suspiciousCode}
 */
export function scopedQuerySelectorAll(root, selector) {
  if (mode.isEsm() || isScopeSelectorSupported(root)) {
    return root./*OK*/ querySelectorAll(
      prependSelectorsWith(selector, ':scope')
    );
  }

  // Only IE.
  return scopedQuerySelectionFallback(root, selector);
}

/**
 * Checks if the given element matches the selector
 * @param  {HTMLElement} el The element to verify
 * @param  {string} selector The selector to check against
 * @return {boolean} True if the element matched the selector. False otherwise.
 */
export function matches(el, selector) {
  if (mode.isEsm()) {
    return el./*OK*/ matches(selector);
  }
  const matcher =
    el.matches ||
    el.webkitMatchesSelector ||
    el.mozMatchesSelector ||
    el.msMatchesSelector ||
    el.oMatchesSelector;
  if (matcher) {
    return matcher.call(el, selector);
  }
  return false; // IE8 always returns false.
}

/**
 * Finds the closest element that satisfies the callback from this element
 * up the DOM subtree.
 * @param {HTMLElement} element
 * @param {function(HTMLElement):boolean} callback
 * @param {HTMLElement=} opt_stopAt optional elemnt to stop the search at.
 * @return {?HTMLElement}
 */
export function closest(element, callback, opt_stopAt) {
  /** @type {?HTMLElement} */ let el;
  for (el = element; el && el !== opt_stopAt; el = el.parentElement) {
    if (callback(el)) {
      return el;
    }
  }
  return null;
}

/**
 * Finds the closest node that satisfies the callback from this node
 * up the DOM subtree.
 * @param {Node} node
 * @param {function(Node):boolean} callback
 * @return {?Node}
 */
export function closestNode(node, callback) {
  /** @type {?Node} */
  let n;
  for (n = node; n; n = /** @type {?Node} */ (n.parentNode)) {
    if (callback(n)) {
      return n;
    }
  }
  return null;
}

/**
 * Finds the closest ancestor element with the specified selector from this
 * element.
 * @param {HTMLElement} element
 * @param {string} selector
 * @return {?HTMLElement} closest ancestor if found.
 */
export function closestAncestorElementBySelector(element, selector) {
  return mode.isEsm() || element.closest
    ? element.closest(selector)
    : closest(element, (el) => matches(el, selector));
}

/**
 * Finds all ancestor elements that satisfy predicate.
 * @param {Element} child
 * @param {function(Element):boolean} predicate
 * @return {Array<Element>}
 */
export function ancestorElements(child, predicate) {
  const ancestors = [];
  for (
    let ancestor = child.parentElement;
    ancestor;
    ancestor = ancestor.parentElement
  ) {
    if (predicate(ancestor)) {
      ancestors.push(ancestor);
    }
  }
  return ancestors;
}

/**
 * Finds all ancestor elements that has the specified tag name.
 * @param {Element} child
 * @param {string} tagName
 * @return {Array<Element>}
 */
export function ancestorElementsByTag(child, tagName) {
  assertIsName(tagName);
  tagName = tagName.toUpperCase();
  return ancestorElements(child, (el) => el.tagName == tagName);
}

/**
 * Finds the first child element that satisfies the callback.
 * TODO(rcebulko): Can we start using generators in childElements and defer to
 * that here?
 * @template {Element} El
 * @param {El} parent
 * @param {function(El):boolean} callback
 * @return {?El}
 */
export function childElement(parent, callback) {
  for (
    let child = parent.firstElementChild;
    child;
    child = child.nextElementSibling
  ) {
    if (callback(/** @type {El} */ (child))) {
      return /** @type {El} */ (child);
    }
  }
  return null;
}

/**
 * Finds the last child element that satisfies the callback.
 * @param {Element} parent
 * @param {function(Element):boolean} callback
 * @return {?Element}
 */
export function lastChildElement(parent, callback) {
  for (
    let child = parent.lastElementChild;
    child;
    child = child.previousElementSibling
  ) {
    if (callback(child)) {
      return child;
    }
  }
  return null;
}

/**
 * Finds all child elements that satisfy the callback.
 * @template {Element} El
 * @param {El} parent
 * @param {function(El):boolean} callback
 * @return {Array<El>}
 */
export function childElements(parent, callback) {
  const children = [];
  for (
    let child = parent.firstElementChild;
    child;
    child = child.nextElementSibling
  ) {
    if (callback(/** @type {El} */ (child))) {
      children.push(child);
    }
  }
  return /** @type {Array<El>} */ (children);
}

/**
 * Finds all child nodes that satisfy the callback.
 * These nodes can include Text, Comment and other child nodes.
 * @param {Node} parent
 * @param {function(Node):boolean} callback
 * @return {Array<Node>}
 */
export function childNodes(parent, callback) {
  const nodes = [];
  for (let child = parent.firstChild; child; child = child.nextSibling) {
    if (callback(child)) {
      nodes.push(child);
    }
  }
  return nodes;
}

/**
 * Finds the first child element that has the specified attribute.
 * @param {Element|ShadowRoot} parent
 * @param {string} attr
 * @return {?Element}
 */
export function childElementByAttr(parent, attr) {
  assertIsName(attr);
  return /*OK*/ scopedQuerySelector(parent, `> [${attr}]`);
}

/**
 * Finds the last child element that has the specified attribute.
 * @param {HTMLElement} parent
 * @param {string} attr
 * @return {?Element}
 */
export function lastChildElementByAttr(parent, attr) {
  assertIsName(attr);
  return lastChildElement(parent, (el) => {
    return el.hasAttribute(attr);
  });
}

/**
 * Finds all child elements that has the specified attribute.
 * @param {HTMLElement|ShadowRoot} parent
 * @param {string} attr
 * @return {NodeList}
 */
export function childElementsByAttr(parent, attr) {
  assertIsName(attr);
  return /*OK*/ scopedQuerySelectorAll(parent, `> [${attr}]`);
}

/**
 * Finds the first child element that has the specified tag name.
 * @param {HTMLElement|ShadowRoot} parent
 * @param {string} tagName
 * @return {?Element}
 */
export function childElementByTag(parent, tagName) {
  assertIsName(tagName);
  return /*OK*/ scopedQuerySelector(parent, `> ${tagName}`);
}

/**
 * Finds all child elements with the specified tag name.
 * @param {HTMLElement|ShadowRoot} parent
 * @param {string} tagName
 * @return {NodeList}
 */
export function childElementsByTag(parent, tagName) {
  assertIsName(tagName);
  return /*OK*/ scopedQuerySelectorAll(parent, `> ${tagName}`);
}

/**
 * Finds the first descendant element with the specified name.
 * @param {HTMLElement|Document|ShadowRoot} element
 * @param {string} tagName
 * @return {?Element}
 */
export function elementByTag(element, tagName) {
  assertIsName(tagName);
  return element./*OK*/ querySelector(tagName);
}

/**
 * Returns the original nodes of the custom element without any service
 * nodes that could have been added for markup. These nodes can include
 * Text, Comment and other child nodes.
 *
 * @param {Node} element
 * @return {Array<Node>}
 */
export function realChildNodes(element) {
  return childNodes(element, (node) => !isInternalOrServiceNode(node));
}

/**
 * Returns the original children of the custom element without any service
 * nodes that could have been added for markup.
 *
 * @template {Element} El
 * @param {El} element
 * @return {Array<El>}
 */
export function realChildElements(element) {
  return childElements(element, (element) => !isInternalOrServiceNode(element));
}

/**
 * Returns "true" for internal AMP nodes or for placeholder elements.
 * @param {Node} node
 * @return {boolean}
 */
export function isInternalOrServiceNode(node) {
  if (isInternalElement(node)) {
    return true;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }

  devAssertElement(node);
  return (
    node.hasAttribute('placeholder') ||
    node.hasAttribute('fallback') ||
    node.hasAttribute('overflow')
  );
}

/**
 * Whether the tag is an internal (service) AMP tag.
 * @param {Node|string} nodeOrTagName
 * @return {boolean}
 */
function isInternalElement(nodeOrTagName) {
  /** @type {undefined|string} */
  let tagName;
  if (isString(nodeOrTagName)) {
    tagName = nodeOrTagName;
  } else if (isElement(nodeOrTagName)) {
    tagName = nodeOrTagName.tagName;
  }

  return !!tagName && tagName.toLowerCase().startsWith('i-');
}

/**
 * Finds a matching node inside an HTML template slot's children
 * @param {HTMLSlotElement} slot
 * @param {string} selector
 * @return {HTMLElement|null}
 */
export function querySelectorInSlot(slot, selector) {
  const nodes = /** @type {HTMLElement[]} */ (slot.assignedElements());
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (matches(node, selector)) {
      return node;
    }
    const child = scopedQuerySelector(node, selector);
    if (child) {
      return child;
    }
  }
  return null;
}

/**
 * Finds a matching node inside an HTML template slot's children
 * @param {HTMLSlotElement} slot
 * @param {string} selector
 * @return {HTMLElement[]}
 */
export function querySelectorAllInSlot(slot, selector) {
  const nodes = /** @type {HTMLElement[] } */ (slot.assignedElements());

  const list = [];
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (matches(node, selector)) {
      list.push(node);
    }
    const children = scopedQuerySelectorAll(node, selector);
    children.forEach((child) => list.push(child));
  }
  return list;
}
