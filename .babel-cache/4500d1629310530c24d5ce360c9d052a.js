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

import { devAssert, devAssertElement } from "../assert";

import { isScopeSelectorSupported, prependSelectorsWith } from "./css-selectors";

/** @fileoverview Helper functions for DOM queries. */

/**
 * Asserts that name is just an alphanumeric word, and does not contain
 * advanced CSS selector features like attributes, psuedo-classes, class names,
 * nor ids.
 * @param {string} name
 */
function assertIsName(name) {
  devAssert(
  /^[\w-]+$/.test(name));


}

/**
 * Finds all elements that matche `selector`, scoped inside `root`
 * for user-agents that do not support native scoping.
 *
 * This method isn't required for modern builds, can be removed.
 *
 * @param {!Element|!ShadowRoot} root
 * @param {string} selector
 * @return {!NodeList<!Element>}
 */
function scopedQuerySelectionFallback(root, selector) {
  var unique = 'i-amphtml-scoped';
  root.classList.add(unique);
  var scopedSelector = prependSelectorsWith(selector, ".".concat(unique));
  var elements = root. /*OK*/querySelectorAll(scopedSelector);
  root.classList.remove(unique);
  return elements;
}

/**
 * Finds the first element that matches `selector`, scoped inside `root`.
 * Note: in IE, this causes a quick mutation of the element's class list.
 * @param {!Element|!ShadowRoot} root
 * @param {string} selector
 * @return {?Element}
 *
 * @suppress {suspiciousCode}
 */
export function scopedQuerySelector(root, selector) {
  if (false || isScopeSelectorSupported(root)) {
    return root. /*OK*/querySelector(prependSelectorsWith(selector, ':scope'));
  }

  // Only IE.
  var fallbackResult = scopedQuerySelectionFallback(root, selector);
  return fallbackResult[0] === undefined ? null : fallbackResult[0];
}

/**
 * Finds every element that matches `selector`, scoped inside `root`.
 * Note: in IE, this causes a quick mutation of the element's class list.
 * @param {!Element|!ShadowRoot} root
 * @param {string} selector
 * @return {!NodeList<!Element>}
 *
 * @suppress {suspiciousCode}
 */
export function scopedQuerySelectorAll(root, selector) {
  if (false || isScopeSelectorSupported(root)) {
    return root. /*OK*/querySelectorAll(
    prependSelectorsWith(selector, ':scope'));

  }

  // Only IE.
  return scopedQuerySelectionFallback(root, selector);
}

/**
 * Checks if the given element matches the selector
 * @param  {!Element} el The element to verify
 * @param  {string} selector The selector to check against
 * @return {boolean} True if the element matched the selector. False otherwise.
 */
export function matches(el, selector) {
  var matcher =
  el.matches ||
  el.webkitMatchesSelector ||
  el.mozMatchesSelector ||
  el.msMatchesSelector ||
  el.oMatchesSelector;
  if (matcher) {
    return matcher.call(el, selector);
  }
  return false;
}

/**
 * Finds the closest element that satisfies the callback from this element
 * up the DOM subtree.
 * @param {!Element} element
 * @param {function(!Element):boolean} callback
 * @param {Element=} opt_stopAt optional elemnt to stop the search at.
 * @return {?Element}
 */
export function closest(element, callback, opt_stopAt) {
  for (var el = element; el && el !== opt_stopAt; el = el.parentElement) {
    if (callback(el)) {
      return el;
    }
  }
  return null;
}

/**
 * Finds the closest node that satisfies the callback from this node
 * up the DOM subtree.
 * @param {!Node} node
 * @param {function(!Node):boolean} callback
 * @return {?Node}
 */
export function closestNode(node, callback) {
  for (var n = node; n; n = n.parentNode) {
    if (callback(n)) {
      return n;
    }
  }
  return null;
}

/**
 * Finds the closest ancestor element with the specified selector from this
 * element.
 * @param {!Element} element
 * @param {string} selector
 * @return {?Element} closest ancestor if found.
 */
export function closestAncestorElementBySelector(element, selector) {
  return element.closest ?
  element.closest(selector) :
  closest(element, function (el) {return matches(el, selector);});
}

/**
 * Finds all ancestor elements that satisfy predicate.
 * @param {!Element} child
 * @param {function(!Element):boolean} predicate
 * @return {!Array<!Element>}
 */
export function ancestorElements(child, predicate) {
  var ancestors = [];
  for (
  var ancestor = child.parentElement;
  ancestor;
  ancestor = ancestor.parentElement)
  {
    if (predicate(ancestor)) {
      ancestors.push(ancestor);
    }
  }
  return ancestors;
}

/**
 * Finds all ancestor elements that has the specified tag name.
 * @param {!Element} child
 * @param {string} tagName
 * @return {!Array<!Element>}
 */
export function ancestorElementsByTag(child, tagName) {
  assertIsName(tagName);
  tagName = tagName.toUpperCase();
  return ancestorElements(child, function (el) {return el.tagName == tagName;});
}

/**
 * Finds the first child element that satisfies the callback.
 * TODO(rcebulko): Can we start using generators in childElements and defer to
 * that here?
 * @param {!Element} parent
 * @param {function(!Element):boolean} callback
 * @return {?Element}
 */
export function childElement(parent, callback) {
  for (
  var child = parent.firstElementChild;
  child;
  child = child.nextElementSibling)
  {
    if (callback(child)) {
      return child;
    }
  }
  return null;
}

/**
 * Finds the last child element that satisfies the callback.
 * @param {!Element} parent
 * @param {function(!Element):boolean} callback
 * @return {?Element}
 */
export function lastChildElement(parent, callback) {
  for (
  var child = parent.lastElementChild;
  child;
  child = child.previousElementSibling)
  {
    if (callback(child)) {
      return child;
    }
  }
  return null;
}

/**
 * Finds all child elements that satisfy the callback.
 * @param {!Element} parent
 * @param {function(!Element):boolean} callback
 * @return {!Array<!Element>}
 */
export function childElements(parent, callback) {
  var children = [];
  for (
  var child = parent.firstElementChild;
  child;
  child = child.nextElementSibling)
  {
    if (callback(child)) {
      children.push(child);
    }
  }
  return children;
}

/**
 * Finds all child nodes that satisfy the callback.
 * These nodes can include Text, Comment and other child nodes.
 * @param {!Node} parent
 * @param {function(!Node):boolean} callback
 * @return {!Array<!Node>}
 */
export function childNodes(parent, callback) {
  var nodes = [];
  for (var child = parent.firstChild; child; child = child.nextSibling) {
    if (callback(child)) {
      nodes.push(child);
    }
  }
  return nodes;
}

/**
 * Finds the first child element that has the specified attribute.
 * @param {!Element|!ShadowRoot} parent
 * @param {string} attr
 * @return {?Element}
 */
export function childElementByAttr(parent, attr) {
  assertIsName(attr);
  return (/*OK*/scopedQuerySelector(parent, "> [".concat(attr, "]")));
}

/**
 * Finds the last child element that has the specified attribute.
 * @param {!Element} parent
 * @param {string} attr
 * @return {?Element}
 */
export function lastChildElementByAttr(parent, attr) {
  assertIsName(attr);
  return lastChildElement(parent, function (el) {
    return el.hasAttribute(attr);
  });
}

/**
 * Finds all child elements that has the specified attribute.
 * @param {!Element|!ShadowRoot} parent
 * @param {string} attr
 * @return {!NodeList<!Element>}
 */
export function childElementsByAttr(parent, attr) {
  assertIsName(attr);
  return (/*OK*/scopedQuerySelectorAll(parent, "> [".concat(attr, "]")));
}

/**
 * Finds the first child element that has the specified tag name.
 * @param {!Element|!ShadowRoot} parent
 * @param {string} tagName
 * @return {?Element}
 */
export function childElementByTag(parent, tagName) {
  assertIsName(tagName);
  return (/*OK*/scopedQuerySelector(parent, "> ".concat(tagName)));
}

/**
 * Finds all child elements with the specified tag name.
 * @param {!Element|!ShadowRoot} parent
 * @param {string} tagName
 * @return {!NodeList<!Element>}
 */
export function childElementsByTag(parent, tagName) {
  assertIsName(tagName);
  return (/*OK*/scopedQuerySelectorAll(parent, "> ".concat(tagName)));
}

/**
 * Finds the first descendant element with the specified name.
 * @param {!Element|!Document|!ShadowRoot} element
 * @param {string} tagName
 * @return {?Element}
 */
export function elementByTag(element, tagName) {
  assertIsName(tagName);
  return element. /*OK*/querySelector(tagName);
}

/**
 * Returns the original nodes of the custom element without any service
 * nodes that could have been added for markup. These nodes can include
 * Text, Comment and other child nodes.
 *
 * @param {!Node} element
 * @return {!Array<!Node>}
 */
export function realChildNodes(element) {
  return childNodes(element, function (node) {return !isInternalOrServiceNode(node);});
}

/**
 * Returns the original children of the custom element without any service
 * nodes that could have been added for markup.
 *
 * @param {!Element} element
 * @return {!Array<!Element>}
 */
export function realChildElements(element) {
  return childElements(element, function (element) {return !isInternalOrServiceNode(element);});
}

/**
 * Returns "true" for internal AMP nodes or for placeholder elements.
 * @param {!Node} node
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
  node.hasAttribute('overflow'));

}

/**
 * Whether the tag is an internal (service) AMP tag.
 * @param {!Node|string} nodeOrTagName
 * @return {boolean}
 */
function isInternalElement(nodeOrTagName) {
  /** @type string */
  var tagName;
  if (typeof nodeOrTagName == 'string') {
    tagName = nodeOrTagName;
  } else if (nodeOrTagName.nodeType === Node.ELEMENT_NODE) {
    tagName = devAssertElement(nodeOrTagName).tagName;
  }

  return !!tagName && tagName.toLowerCase().startsWith('i-');
}
// /Users/mszylkowski/src/amphtml/src/core/dom/query.js