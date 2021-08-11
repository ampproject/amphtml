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

import { dict } from "../types/object";
import { parseJson } from "../types/object/json";
import { toWin } from "../window";

import { childElementsByTag, matches } from "./query";

var HTML_ESCAPE_CHARS = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;' };

var HTML_ESCAPE_REGEX = /(&|<|>|"|'|`)/g;

/**
 * @typedef {{
 *   bubbles: (boolean|undefined),
 *   cancelable: (boolean|undefined),
 * }}
 */
export var CustomEventOptionsDef;

/** @const {!CustomEventOptionsDef} */
var DEFAULT_CUSTOM_EVENT_OPTIONS = { bubbles: true, cancelable: true };

/**
 * Waits until the child element is constructed. Once the child is found, the
 * callback is executed.
 * @param {!Element} parent
 * @param {function(!Element):boolean} checkFunc
 * @param {function()} callback
 * @suppress {suspiciousCode} due to IS_ESM
 */
export function waitForChild(parent, checkFunc, callback) {
  if (checkFunc(parent)) {
    callback();
    return;
  }
  var win = toWin(parent.ownerDocument.defaultView);
  if (false || win.MutationObserver) {
    var observer = new win.MutationObserver(function () {
      if (checkFunc(parent)) {
        observer.disconnect();
        callback();
      }
    });
    observer.observe(parent, { childList: true });
  } else {
    var interval = win.setInterval(function () {
      if (checkFunc(parent)) {
        win.clearInterval(interval);
        callback();
      }
    }, /* milliseconds */5);
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
  return new Promise(function (resolve) {
    waitForChild(parent, checkFunc, resolve);
  });
}

/**
 * Waits for document's body to be available and ready.
 * @param {!Document} doc
 * @param {function()} callback
 */
export function waitForBodyOpen(doc, callback) {
  waitForChild(doc.documentElement, function () {return !!doc.body;}, callback);
}

/**
 * Waits for document's body to be available.
 * @param {!Document} doc
 * @return {!Promise}
 */
export function waitForBodyOpenPromise(doc) {
  return new Promise(function (resolve) {return waitForBodyOpen(doc, resolve);});
}

/**
 * Removes the element.
 * @param {!Element} element
 */
export function removeElement(element) {var _element$parentElemen;
  ((_element$parentElemen = element.parentElement) === null || _element$parentElemen === void 0) ? (void 0) : _element$parentElemen.removeChild(element);
}

/**
 * Removes all child nodes of the specified element.
 * @param {!Element|!DocumentFragment} parent
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
  var frag = to.ownerDocument.createDocumentFragment();
  for (var n = from.firstChild; n; n = n.nextSibling) {
    frag.appendChild(n.cloneNode(true));
  }
  to.appendChild(frag);
}

/**
 * Insert the element in the root after the element named after or
 * if that is null at the beginning.
 * @param {!Element|!ShadowRoot} root
 * @param {!Element} element
 * @param {?Node=} after
 */
export function insertAfterOrAtStart(root, element) {var after = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  if (!after) {
    insertAtStart(root, element);
    return;
  }
  var before = after.nextSibling;
  root.insertBefore(element, before);
}

/**
 * Insert the element in the root after the element named after or
 * if that is null at the beginning.
 * @param {!Element|!ShadowRoot} root
 * @param {!Element} element
 */
export function insertAtStart(root, element) {
  root.insertBefore(element, root.firstChild);
}

/**
 * Add attributes to an element.
 * @param {!Element} element
 * @param {!JsonObject<string, string>} attributes
 * @return {!Element} created element
 */
export function addAttributesToElement(element, attributes) {
  for (var attr in attributes) {
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
  var element = doc.createElement(tagName);
  return addAttributesToElement(element, attributes);
}

/**
 * Returns true if node is connected (attached).
 * @param {!Node} node
 * @return {boolean}
 * @see https://dom.spec.whatwg.org/#connected
 */
export function isConnectedNode(node) {
  var connected = node.isConnected;
  if (connected !== undefined) {
    return connected;
  }

  // "An element is connected if its shadow-including root is a document."
  var n = node;
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
  var n;
  // Check isShadowRoot() is only needed for the polyfill case.
  for (
  n = node;
  !!n.parentNode && !isShadowRoot( /** @type {HTMLElement} */(n));
  n = n.parentNode)
  {}
  return n;
}

/**
 * Determines if value is actually a `ShadowRoot` node.
 * @param {?HTMLElement} value
 * @return {boolean}
 */
export function isShadowRoot(value) {
  if (!value) {
    return false;
  }
  // Node.nodeType == DOCUMENT_FRAGMENT to speed up the tests. Unfortunately,
  // nodeType of DOCUMENT_FRAGMENT is used currently for ShadowRoot nodes.
  if (value.tagName == 'I-AMPHTML-SHADOW-ROOT') {
    return true;
  }
  return (
  value.nodeType == /* DOCUMENT_FRAGMENT */11 &&
  Object.prototype.toString.call(value) === '[object ShadowRoot]');

}

/**
 * Returns element data-param- attributes as url parameters key-value pairs.
 * e.g. data-param-some-attr=value -> {someAttr: value}.
 * @param {!HTMLElement} element
 * @param {function(string):string=} opt_computeParamNameFunc to compute the
 *    parameter name, get passed the camel-case parameter name.
 * @param {!RegExp=} opt_paramPattern Regex pattern to match data attributes.
 * @return {!JsonObject}
 */
export function getDataParamsFromAttributes(
element,
opt_computeParamNameFunc,
opt_paramPattern)
{
  var computeParamNameFunc = opt_computeParamNameFunc || (function (key) {return key;});
  var dataset = element.dataset;
  var params = dict();
  var paramPattern = opt_paramPattern || /^param(.+)/;
  for (var key in dataset) {
    var _matches = key.match(paramPattern);
    if (_matches) {
      var param = _matches[1][0].toLowerCase() + _matches[1].substr(1);
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
  var currentElement = element;
  do {
    if (currentElement.nextSibling) {
      return true;
    }
  } while (
  (currentElement = currentElement.parentNode) &&
  currentElement != opt_stopNode);

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
    var content = template.ownerDocument.createDocumentFragment();
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
  var length = iterable.length;
  for (var i = 0; i < length; i++) {
    cb(iterable[i], i);
  }
}

/**
 * Whether the element is a script tag with application/json type.
 * @param {!Element} element
 * @return {boolean}
 */
export function isJsonScriptTag(element) {var _element$getAttribute;
  return (
  element.tagName == 'SCRIPT' &&
  (((_element$getAttribute = element.getAttribute('type')) === null || _element$getAttribute === void 0) ? (void 0) : _element$getAttribute.toUpperCase()) == 'APPLICATION/JSON');

}

/**
 * Whether the element is a script tag with application/json type.
 * @param {!Element} element
 * @return {boolean}
 */
export function isJsonLdScriptTag(element) {var _element$getAttribute2;
  return (
  element.tagName == 'SCRIPT' &&
  (((_element$getAttribute2 = element.getAttribute('type')) === null || _element$getAttribute2 === void 0) ? (void 0) : _element$getAttribute2.toUpperCase()) == 'APPLICATION/LD+JSON');

}

/**
 * Whether the page's direction is right to left or not.
 * @param {!Document} doc
 * @return {boolean}
 */
export function isRTL(doc) {
  var dir =
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
    element. /*OK*/focus();
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
 * Returns true if node is not disabled.
 *
 * IE8 can return false positives, see {@link matches}.
 * @param {!HTMLInputElement} element
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

  var pos = element1.compareDocumentPosition(element2);
  var precedingOrContains =
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
  var hasAttribute = element.hasAttribute(name);
  var enabled = forced !== undefined ? forced : !hasAttribute;

  if (enabled !== hasAttribute) {
    if (enabled) {
      element.setAttribute(name, '');
    } else {
      element.removeAttribute(name);
    }
  }

  return enabled;
}

/**
 * Parses a string as a boolean value using the expanded rules for DOM boolean
 * attributes:
 * - a `null` or `undefined` returns `null`;
 * - an empty string returns `true`;
 * - a "false" string returns `false`;
 * - otherwise, `true` is returned.
 *
 * @param {?string|undefined} s
 * @return {boolean|undefined}
 */
export function parseBooleanAttribute(s) {
  return s == null ? undefined : s !== 'false';
}

/**
 * @param {!Window} win
 * @return {number} The width of the vertical scrollbar, in pixels.
 */
export function getVerticalScrollbarWidth(win) {
  var documentElement = win.document.documentElement;
  var windowWidth = win. /*OK*/innerWidth;
  var documentWidth = documentElement. /*OK*/clientWidth;
  return windowWidth - documentWidth;
}

/**
 * Dispatches a custom event.
 *
 * @param {!Node} node
 * @param {string} name
 * @param {!Object=} opt_data Event data.
 * @param {!CustomEventOptionsDef=} opt_options
 */
export function dispatchCustomEvent(node, name, opt_data, opt_options) {
  var data = opt_data || {};
  // Constructors of events need to come from the correct window. Sigh.
  var event = node.ownerDocument.createEvent('Event');

  // Technically .data is not a property of Event.
  event.data = data;

  var _ref = opt_options || DEFAULT_CUSTOM_EVENT_OPTIONS,bubbles = _ref.bubbles,cancelable = _ref.cancelable;
  event.initEvent(name, bubbles, cancelable);
  node.dispatchEvent(event);
}

/**
 * Ensures the child is contained by the parent, but not the parent itself.
 *
 * @param {!Node} parent
 * @param {!Node} child
 * @return {boolean}
 */
export function containsNotSelf(parent, child) {
  return child !== parent && parent.contains(child);
}

/**
 * Helper method to get the json config from an element <script> tag
 * @param {!Element} element
 * @return {?JsonObject}
 * @throws {!Error} If element does not have exactly one <script> child
 * with type="application/json", or if the <script> contents are not valid JSON.
 */
export function getChildJsonConfig(element) {
  var scripts = childElementsByTag(element, 'script');
  var length = scripts.length;
  if (length !== 1) {
    throw new Error("Found ".concat(length, " <script> children. Expected 1."));
  }

  var script = scripts[0];
  if (!isJsonScriptTag(script)) {
    throw new Error('<script> child must have type="application/json"');
  }

  try {
    return parseJson(script.textContent);
  } catch (_unused) {
    throw new Error('Failed to parse <script> contents. Is it valid JSON?');
  }
}
// /Users/mszylkowski/src/amphtml/src/core/dom/index.js