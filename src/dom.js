/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {Deferred} from './utils/promise';
import {
  assertIsName,
  isScopeSelectorSupported,
  prependSelectorsWith,
} from './css';
import {dev, devAssert} from './log';
import {dict} from './utils/object';
import {onDocumentReady} from './document-ready';
import {startsWith} from './string';
import {toWin} from './types';

const HTML_ESCAPE_CHARS = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;',
};
const HTML_ESCAPE_REGEX = /(&|<|>|"|'|`)/g;

/** @const {string} */
export const UPGRADE_TO_CUSTOMELEMENT_PROMISE = '__AMP_UPG_PRM';

/** @const {string} */
export const UPGRADE_TO_CUSTOMELEMENT_RESOLVER = '__AMP_UPG_RES';

/**
 * Waits until the child element is constructed. Once the child is found, the
 * callback is executed.
 * @param {!Element} parent
 * @param {function(!Element):boolean} checkFunc
 * @param {function()} callback
 */
export function waitForChild(parent, checkFunc, callback) {
  if (checkFunc(parent)) {
    callback();
    return;
  }
  /** @const {!Window} */
  const win = toWin(parent.ownerDocument.defaultView);
  if (win.MutationObserver) {
    /** @const {MutationObserver} */
    const observer = new win.MutationObserver(() => {
      if (checkFunc(parent)) {
        observer.disconnect();
        callback();
      }
    });
    observer.observe(parent, {childList: true});
  } else {
    /** @const {number} */
    const interval = win.setInterval(() => {
      if (checkFunc(parent)) {
        win.clearInterval(interval);
        callback();
      }
    }, /* milliseconds */ 5);
  }
}

/**
 * Waits until the child element is constructed. Once the child is found, the
 * promise is resolved.
 * @param {!Element} parent
 * @param {function(!Element):boolean} checkFunc
 * @return {!Promise}
 */
export function waitForChildPromise(parent, checkFunc) {
  return new Promise(resolve => {
    waitForChild(parent, checkFunc, resolve);
  });
}

/**
 * Waits for document's head to be available.
 * @param {!Document} doc
 * @param {function()} callback
 */
export function waitForHead(doc, callback) {
  waitForChild(doc.documentElement, () => !!doc.body, callback);
}

/**
 * Waits for the document's head to be available.
 * @param {!Document} doc
 * @return {!Promise}
 */
export function waitForHeadPromise(doc) {
  return new Promise(resolve => waitForHead(doc, resolve));
}

/**
 * Waits for document's body to be available and ready.
 * Will be deprecated soon; use {@link AmpDoc#waitForBodyOpen} or
 * @{link DocumentState#onBodyAvailable} instead.
 * @param {!Document} doc
 * @param {function()} callback
 */
export function waitForBodyOpen(doc, callback) {
  onDocumentReady(doc, () => waitForHead(doc, callback));
}

/**
 * Waits for document's body to be available.
 * @param {!Document} doc
 * @return {!Promise}
 */
export function waitForBodyOpenPromise(doc) {
  return new Promise(resolve => waitForBodyOpen(doc, resolve));
}

/**
 * Removes the element.
 * @param {!Element} element
 */
export function removeElement(element) {
  if (element.parentElement) {
    element.parentElement.removeChild(element);
  }
}

/**
 * Removes all child nodes of the specified element.
 * @param {!Element} parent
 */
export function removeChildren(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

/**
 * Copies all children nodes of element "from" to element "to". Child nodes
 * are deeply cloned. Notice, that this method should be used with care and
 * preferably on smaller subtrees.
 * @param {!Element} from
 * @param {!Element|!DocumentFragment} to
 */
export function copyChildren(from, to) {
  const frag = to.ownerDocument.createDocumentFragment();
  for (let n = from.firstChild; n; n = n.nextSibling) {
    frag.appendChild(n.cloneNode(true));
  }
  to.appendChild(frag);
}

/**
 * Insert the element in the root after the element named after or
 * if that is null at the beginning.
 * @param {!Element|!ShadowRoot} root
 * @param {!Element} element
 * @param {?Node} after
 */
export function insertAfterOrAtStart(root, element, after) {
  const before = after ? after.nextSibling : root.firstChild;
  root.insertBefore(element, before);
}

/**
 * Add attributes to an element.
 * @param {!Element} element
 * @param {!JsonObject<string, string>} attributes
 * @return {!Element} created element
 */
export function addAttributesToElement(element, attributes) {
  for (const attr in attributes) {
    element.setAttribute(attr, attributes[attr]);
  }
  return element;
}

/**
 * Create a new element on document with specified tagName and attributes.
 * @param {!Document} doc
 * @param {string} tagName
 * @param {!JsonObject<string, string>} attributes
 * @return {!Element} created element
 */
export function createElementWithAttributes(doc, tagName, attributes) {
  const element = doc.createElement(tagName);
  return addAttributesToElement(element, attributes);
}

/**
 * Returns true if node is connected (attached).
 * @param {!Node} node
 * @return {boolean}
 * @see https://dom.spec.whatwg.org/#connected
 */
export function isConnectedNode(node) {
  const connected = node.isConnected;
  if (connected !== undefined) {
    return connected;
  }

  // "An element is connected if its shadow-including root is a document."
  let n = node;
  do {
    n = rootNodeFor(n);
    if (n.host) {
      n = n.host;
    } else {
      break;
    }
  } while (true);
  return n.nodeType === Node.DOCUMENT_NODE;
}

/**
 * Returns the root for a given node. Does not cross shadow DOM boundary.
 * @param {!Node} node
 * @return {!Node}
 */
export function rootNodeFor(node) {
  if (Node.prototype.getRootNode) {
    // Type checker says `getRootNode` may return null.
    return node.getRootNode() || node;
  }
  let n;
  for (n = node; !!n.parentNode; n = n.parentNode) {}
  return n;
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
  for (let el = element; el && el !== opt_stopAt; el = el.parentElement) {
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
  for (let n = node; n; n = n.parentNode) {
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
  if (element.closest) {
    return element.closest(selector);
  }

  return closest(element, el => {
    return matches(el, selector);
  });
}

/**
 * Finds all ancestor elements that satisfy predicate.
 * @param {!Element} child
 * @param {function(!Element):boolean} predicate
 * @return {!Array<!Element>}
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
 * @param {!Element} child
 * @param {string} tagName
 * @return {!Array<!Element>}
 */
export function ancestorElementsByTag(child, tagName) {
  assertIsName(tagName);
  tagName = tagName.toUpperCase();
  return ancestorElements(child, el => {
    return el.tagName == tagName;
  });
}

/**
 * Finds the first child element that satisfies the callback.
 * @param {!Element} parent
 * @param {function(!Element):boolean} callback
 * @return {?Element}
 */
export function childElement(parent, callback) {
  for (
    let child = parent.firstElementChild;
    child;
    child = child.nextElementSibling
  ) {
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
  const children = [];
  for (
    let child = parent.firstElementChild;
    child;
    child = child.nextElementSibling
  ) {
    if (callback(child)) {
      children.push(child);
    }
  }
  return children;
}

/**
 * Finds the last child element that satisfies the callback.
 * @param {!Element} parent
 * @param {function(!Element):boolean} callback
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
 * Finds all child nodes that satisfy the callback.
 * These nodes can include Text, Comment and other child nodes.
 * @param {!Node} parent
 * @param {function(!Node):boolean} callback
 * @return {!Array<!Node>}
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
 * @param {!Element} parent
 * @param {string} attr
 * @return {?Element}
 */
export function childElementByAttr(parent, attr) {
  assertIsName(attr);
  return /*OK*/ scopedQuerySelector(parent, `> [${attr}]`);
}

/**
 * Finds the last child element that has the specified attribute.
 * @param {!Element} parent
 * @param {string} attr
 * @return {?Element}
 */
export function lastChildElementByAttr(parent, attr) {
  assertIsName(attr);
  return lastChildElement(parent, el => {
    return el.hasAttribute(attr);
  });
}

/**
 * Finds all child elements that has the specified attribute.
 * @param {!Element} parent
 * @param {string} attr
 * @return {!NodeList<!Element>}
 */
export function childElementsByAttr(parent, attr) {
  assertIsName(attr);
  return /*OK*/ scopedQuerySelectorAll(parent, `> [${attr}]`);
}

/**
 * Finds the first child element that has the specified tag name.
 * @param {!Element} parent
 * @param {string} tagName
 * @return {?Element}
 */
export function childElementByTag(parent, tagName) {
  assertIsName(tagName);
  return /*OK*/ scopedQuerySelector(parent, `> ${tagName}`);
}

/**
 * Finds all child elements with the specified tag name.
 * @param {!Element} parent
 * @param {string} tagName
 * @return {!NodeList<!Element>}
 */
export function childElementsByTag(parent, tagName) {
  assertIsName(tagName);
  return /*OK*/ scopedQuerySelectorAll(parent, `> ${tagName}`);
}

/**
 * Checks if the given element matches the selector
 * @param  {!Element} el The element to verify
 * @param  {string} selector The selector to check against
 * @return {boolean} True if the element matched the selector. False otherwise.
 */
export function matches(el, selector) {
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
 * Finds the first descendant element with the specified name.
 * @param {!Element|!Document|!ShadowRoot} element
 * @param {string} tagName
 * @return {?Element}
 */
export function elementByTag(element, tagName) {
  assertIsName(tagName);
  return element./*OK*/ querySelector(tagName);
}

/**
 * Finds all elements that matche `selector`, scoped inside `root`
 * for user-agents that do not support native scoping.
 *
 * This method isn't required for modern builds, can be removed.
 *
 * @param {!Element} root
 * @param {string} selector
 * @return {!NodeList<!Element>}
 */
function scopedQuerySelectionFallback(root, selector) {
  const unique = 'i-amphtml-scoped';
  root.classList.add(unique);
  const scopedSelector = prependSelectorsWith(selector, `.${unique}`);
  const elements = root./*OK*/ querySelectorAll(scopedSelector);
  root.classList.remove(unique);
  return elements;
}

/**
 * Finds the first element that matches `selector`, scoped inside `root`.
 * Note: in IE, this causes a quick mutation of the element's class list.
 * @param {!Element} root
 * @param {string} selector
 * @return {?Element}
 */
export function scopedQuerySelector(root, selector) {
  if (isScopeSelectorSupported(root)) {
    return root./*OK*/ querySelector(prependSelectorsWith(selector, ':scope'));
  }

  // Only IE.
  const fallbackResult = scopedQuerySelectionFallback(root, selector);
  return fallbackResult[0] === undefined ? null : fallbackResult[0];
}

/**
 * Finds every element that matches `selector`, scoped inside `root`.
 * Note: in IE, this causes a quick mutation of the element's class list.
 * @param {!Element} root
 * @param {string} selector
 * @return {!NodeList<!Element>}
 */
export function scopedQuerySelectorAll(root, selector) {
  if (isScopeSelectorSupported(root)) {
    return root./*OK*/ querySelectorAll(
      prependSelectorsWith(selector, ':scope')
    );
  }

  // Only IE.
  return scopedQuerySelectionFallback(root, selector);
}

/**
 * Returns element data-param- attributes as url parameters key-value pairs.
 * e.g. data-param-some-attr=value -> {someAttr: value}.
 * @param {!Element} element
 * @param {function(string):string=} opt_computeParamNameFunc to compute the
 *    parameter name, get passed the camel-case parameter name.
 * @param {!RegExp=} opt_paramPattern Regex pattern to match data attributes.
 * @return {!JsonObject}
 */
export function getDataParamsFromAttributes(
  element,
  opt_computeParamNameFunc,
  opt_paramPattern
) {
  const computeParamNameFunc = opt_computeParamNameFunc || (key => key);
  const {dataset} = element;
  const params = dict();
  const paramPattern = opt_paramPattern ? opt_paramPattern : /^param(.+)/;
  for (const key in dataset) {
    const matches = key.match(paramPattern);
    if (matches) {
      const param = matches[1][0].toLowerCase() + matches[1].substr(1);
      params[computeParamNameFunc(param)] = dataset[key];
    }
  }
  return params;
}

/**
 * Whether the element have a next node in the document order.
 * This means either:
 *  a. The element itself has a nextSibling.
 *  b. Any of the element ancestors has a nextSibling.
 * @param {!Element} element
 * @param {?Node} opt_stopNode
 * @return {boolean}
 */
export function hasNextNodeInDocumentOrder(element, opt_stopNode) {
  let currentElement = element;
  do {
    if (currentElement.nextSibling) {
      return true;
    }
  } while (
    (currentElement = currentElement.parentNode) &&
    currentElement != opt_stopNode
  );
  return false;
}

/**
 * Returns a clone of the content of a template element.
 *
 * Polyfill to replace .content access for browsers that do not support
 * HTMLTemplateElements natively.
 *
 * @param {!HTMLTemplateElement|!Element} template
 * @return {!DocumentFragment}
 */
export function templateContentClone(template) {
  if ('content' in template) {
    return template.content.cloneNode(true);
  } else {
    const content = template.ownerDocument.createDocumentFragment();
    copyChildren(template, content);
    return content;
  }
}

/**
 * Iterate over an array-like.
 * Test cases: https://jsbench.github.io/#f638cacc866a1b2d6e517e6cfa900d6b
 * @param {!IArrayLike<T>} iterable
 * @param {function(T, number)} cb
 * @template T
 */
export function iterateCursor(iterable, cb) {
  const {length} = iterable;
  for (let i = 0; i < length; i++) {
    cb(iterable[i], i);
  }
}

/**
 * This method wraps around window's open method. It first tries to execute
 * `open` call with the provided target and if it fails, it retries the call
 * with the `_top` target. This is necessary given that in some embedding
 * scenarios, such as iOS' WKWebView, navigation to `_blank` and other targets
 * is blocked by default.
 *
 * @param {!Window} win
 * @param {string} url
 * @param {string} target
 * @param {string=} opt_features
 * @return {?Window}
 */
export function openWindowDialog(win, url, target, opt_features) {
  // Try first with the specified target. If we're inside the WKWebView or
  // a similar environments, this method is expected to fail by default for
  // all targets except `_top`.
  let res;
  try {
    res = win.open(url, target, opt_features);
  } catch (e) {
    dev().error('DOM', 'Failed to open url on target: ', target, e);
  }

  // Then try with `_top` target.
  if (!res && target != '_top') {
    res = win.open(url, '_top');
  }
  return res;
}

/**
 * Whether the element is a script tag with application/json type.
 * @param {!Element} element
 * @return {boolean}
 */
export function isJsonScriptTag(element) {
  return (
    element.tagName == 'SCRIPT' &&
    element.hasAttribute('type') &&
    element.getAttribute('type').toUpperCase() == 'APPLICATION/JSON'
  );
}

/**
 * Whether the element is a script tag with application/json type.
 * @param {!Element} element
 * @return {boolean}
 */
export function isJsonLdScriptTag(element) {
  return (
    element.tagName == 'SCRIPT' &&
    element.getAttribute('type').toUpperCase() == 'APPLICATION/LD+JSON'
  );
}

/**
 * Whether the page's direction is right to left or not.
 * @param {!Document} doc
 * @return {boolean}
 */
export function isRTL(doc) {
  const dir =
    doc.body.getAttribute('dir') ||
    doc.documentElement.getAttribute('dir') ||
    'ltr';
  return dir == 'rtl';
}

/**
 * Escapes `<`, `>` and other HTML charcaters with their escaped forms.
 * @param {string} text
 * @return {string}
 */
export function escapeHtml(text) {
  if (!text) {
    return text;
  }
  return text.replace(HTML_ESCAPE_REGEX, escapeHtmlChar);
}

/**
 * @param {string} c
 * @return {string}
 */
function escapeHtmlChar(c) {
  return HTML_ESCAPE_CHARS[c];
}

/**
 * Tries to focus on the given element; fails silently if browser throws an
 * exception.
 * @param {!Element} element
 */
export function tryFocus(element) {
  try {
    element./*OK*/ focus();
  } catch (e) {
    // IE <= 7 may throw exceptions when focusing on hidden items.
  }
}

/**
 * Whether the given window is in an iframe or not.
 * @param {!Window} win
 * @return {boolean}
 */
export function isIframed(win) {
  return win.parent && win.parent != win;
}

/**
 * Determines if this element is an AMP element
 * @param {!Element} element
 * @return {boolean}
 */
export function isAmpElement(element) {
  const tag = element.tagName;
  // Use prefix to recognize AMP element. This is necessary because stub
  // may not be attached yet.
  return (
    startsWith(tag, 'AMP-') &&
    // Some "amp-*" elements are not really AMP elements. :smh:
    !(tag == 'AMP-STICKY-AD-TOP-PADDING' || tag == 'AMP-BODY')
  );
}

/**
 * Return a promise that resolve when an AMP element upgrade from HTMLElement
 * to CustomElement
 * @param {!Element} element
 * @return {!Promise<!Element>}
 */
export function whenUpgradedToCustomElement(element) {
  devAssert(isAmpElement(element), 'element is not AmpElement');
  if (element.createdCallback) {
    // Element already is CustomElement;
    return Promise.resolve(element);
  }
  // If Element is still HTMLElement, wait for it to upgrade to customElement
  // Note: use pure string to avoid obfuscation between versions.
  if (!element[UPGRADE_TO_CUSTOMELEMENT_PROMISE]) {
    const deferred = new Deferred();
    element[UPGRADE_TO_CUSTOMELEMENT_PROMISE] = deferred.promise;
    element[UPGRADE_TO_CUSTOMELEMENT_RESOLVER] = deferred.resolve;
  }

  return element[UPGRADE_TO_CUSTOMELEMENT_PROMISE];
}

/**
 * Replacement for `Element.requestFullscreen()` method.
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen
 * @param {!Element} element
 */
export function fullscreenEnter(element) {
  const requestFs =
    element.requestFullscreen ||
    element.requestFullScreen ||
    element.webkitRequestFullscreen ||
    element.webkitEnterFullscreen ||
    element.msRequestFullscreen ||
    element.mozRequestFullScreen;
  if (requestFs) {
    requestFs.call(element);
  }
}

/**
 * Replacement for `Document.exitFullscreen()` method.
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/exitFullscreen
 * @param {!Element} element
 */
export function fullscreenExit(element) {
  const elementBoundExit =
    element.cancelFullScreen ||
    element.exitFullscreen ||
    element.webkitExitFullscreen ||
    element.webkitCancelFullScreen ||
    element.mozCancelFullScreen ||
    element.msExitFullscreen;
  if (elementBoundExit) {
    elementBoundExit.call(element);
    return;
  }
  const {ownerDocument} = element;
  if (!ownerDocument) {
    return;
  }
  const docBoundExit =
    ownerDocument.cancelFullScreen ||
    ownerDocument.exitFullscreencancelFullScreen ||
    ownerDocument.webkitExitFullscreencancelFullScreen ||
    ownerDocument.webkitCancelFullScreencancelFullScreen ||
    ownerDocument.mozCancelFullScreencancelFullScreen ||
    ownerDocument.msExitFullscreen;
  if (docBoundExit) {
    docBoundExit.call(ownerDocument);
  }
}

/**
 * Replacement for `Document.fullscreenElement`.
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/fullscreenElement
 * @param {!Element} element
 * @return {boolean}
 */
export function isFullscreenElement(element) {
  const {webkitDisplayingFullscreen} = element;
  if (webkitDisplayingFullscreen !== undefined) {
    return webkitDisplayingFullscreen;
  }
  const {ownerDocument} = element;
  if (!ownerDocument) {
    return false;
  }
  const fullscreenElement =
    ownerDocument.fullscreenElement ||
    ownerDocument.webkitFullscreenElement ||
    ownerDocument.mozFullScreenElement ||
    ownerDocument.webkitCurrentFullScreenElement;
  return fullscreenElement == element;
}

/**
 * Returns true if node is not disabled.
 *
 * IE8 can return false positives, see {@link matches}.
 * @param {!Element} element
 * @return {boolean}
 * @see https://www.w3.org/TR/html5/forms.html#concept-fe-disabled
 */
export function isEnabled(element) {
  return !(element.disabled || matches(element, ':disabled'));
}

/**
 * A sorting comparator that sorts elements in DOM tree order.
 * A first sibling is sorted to be before its nextSibling.
 * A parent node is sorted to be before a child.
 * See https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
 *
 * @param {!Element} element1
 * @param {!Element} element2
 * @return {number}
 */
export function domOrderComparator(element1, element2) {
  if (element1 === element2) {
    return 0;
  }

  const pos = element1.compareDocumentPosition(element2);
  const precedingOrContains =
    Node.DOCUMENT_POSITION_PRECEDING | Node.DOCUMENT_POSITION_CONTAINS;

  // if fe2 is preceding or contains fe1 then, fe1 is after fe2
  if (pos & precedingOrContains) {
    return 1;
  }

  // if fe2 is following or contained by fe1, then fe1 is before fe2
  return -1;
}

/**
 * Like `Element.prototype.toggleAttribute`. This either toggles an attribute
 * on by adding an attribute with an empty value, or toggles it off by removing
 * the attribute. This does not mutate the element if the new state matches
 * the existing state.
 * @param {!Element} element An element to toggle the attribute for.
 * @param {string} name The name of the attribute.
 * @param {boolean=} forced Whether the attribute should be forced on/off. If
 *    not specified, it will be toggled from the current state.
 * @return {boolean} Whether or not the element now has the attribute.
 */
export function toggleAttribute(element, name, forced) {
  const hasAttribute = element.hasAttribute(name);
  const enabled = forced !== undefined ? forced : !hasAttribute;

  if (enabled !== hasAttribute) {
    if (enabled) {
      element.setAttribute(name, '');
    } else {
      element.removeAttribute(name);
    }
  }

  return enabled;
}
