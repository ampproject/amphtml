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
  '`': '&#x60;'
};
var HTML_ESCAPE_REGEX = /(&|<|>|"|'|`)/g;

/**
 * @typedef {{
 *   bubbles: (boolean|undefined),
 *   cancelable: (boolean|undefined),
 * }}
 */
export var CustomEventOptionsDef;

/** @const {!CustomEventOptionsDef} */
var DEFAULT_CUSTOM_EVENT_OPTIONS = {
  bubbles: true,
  cancelable: true
};

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
    observer.observe(parent, {
      childList: true
    });
  } else {
    var interval = win.setInterval(function () {
      if (checkFunc(parent)) {
        win.clearInterval(interval);
        callback();
      }
    },
    /* milliseconds */
    5);
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
  waitForChild(doc.documentElement, function () {
    return !!doc.body;
  }, callback);
}

/**
 * Waits for document's body to be available.
 * @param {!Document} doc
 * @return {!Promise}
 */
export function waitForBodyOpenPromise(doc) {
  return new Promise(function (resolve) {
    return waitForBodyOpen(doc, resolve);
  });
}

/**
 * Removes the element.
 * @param {!Element} element
 */
export function removeElement(element) {
  var _element$parentElemen;

  (_element$parentElemen = element.parentElement) == null ? void 0 : _element$parentElemen.removeChild(element);
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
export function insertAfterOrAtStart(root, element, after) {
  if (after === void 0) {
    after = null;
  }

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
  for (n = node; !!n.parentNode && !isShadowRoot(
  /** @type {HTMLElement} */
  n); n = n.parentNode) {}

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

  return value.nodeType ==
  /* DOCUMENT_FRAGMENT */
  11 && Object.prototype.toString.call(value) === '[object ShadowRoot]';
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
export function getDataParamsFromAttributes(element, opt_computeParamNameFunc, opt_paramPattern) {
  var computeParamNameFunc = opt_computeParamNameFunc || function (key) {
    return key;
  };

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
  } while ((currentElement = currentElement.parentNode) && currentElement != opt_stopNode);

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
export function isJsonScriptTag(element) {
  var _element$getAttribute;

  return element.tagName == 'SCRIPT' && ((_element$getAttribute = element.getAttribute('type')) == null ? void 0 : _element$getAttribute.toUpperCase()) == 'APPLICATION/JSON';
}

/**
 * Whether the element is a script tag with application/json type.
 * @param {!Element} element
 * @return {boolean}
 */
export function isJsonLdScriptTag(element) {
  var _element$getAttribute2;

  return element.tagName == 'SCRIPT' && ((_element$getAttribute2 = element.getAttribute('type')) == null ? void 0 : _element$getAttribute2.toUpperCase()) == 'APPLICATION/LD+JSON';
}

/**
 * Whether the page's direction is right to left or not.
 * @param {!Document} doc
 * @return {boolean}
 */
export function isRTL(doc) {
  var dir = doc.body.getAttribute('dir') || doc.documentElement.getAttribute('dir') || 'ltr';
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
    element.
    /*OK*/
    focus();
  } catch (e) {// IE <= 7 may throw exceptions when focusing on hidden items.
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
  var precedingOrContains = Node.DOCUMENT_POSITION_PRECEDING | Node.DOCUMENT_POSITION_CONTAINS;

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
  var windowWidth = win.
  /*OK*/
  innerWidth;
  var documentWidth = documentElement.
  /*OK*/
  clientWidth;
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

  var _ref = opt_options || DEFAULT_CUSTOM_EVENT_OPTIONS,
      bubbles = _ref.bubbles,
      cancelable = _ref.cancelable;

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
    throw new Error("Found " + length + " <script> children. Expected 1.");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbImRpY3QiLCJwYXJzZUpzb24iLCJ0b1dpbiIsImNoaWxkRWxlbWVudHNCeVRhZyIsIm1hdGNoZXMiLCJIVE1MX0VTQ0FQRV9DSEFSUyIsIkhUTUxfRVNDQVBFX1JFR0VYIiwiQ3VzdG9tRXZlbnRPcHRpb25zRGVmIiwiREVGQVVMVF9DVVNUT01fRVZFTlRfT1BUSU9OUyIsImJ1YmJsZXMiLCJjYW5jZWxhYmxlIiwid2FpdEZvckNoaWxkIiwicGFyZW50IiwiY2hlY2tGdW5jIiwiY2FsbGJhY2siLCJ3aW4iLCJvd25lckRvY3VtZW50IiwiZGVmYXVsdFZpZXciLCJNdXRhdGlvbk9ic2VydmVyIiwib2JzZXJ2ZXIiLCJkaXNjb25uZWN0Iiwib2JzZXJ2ZSIsImNoaWxkTGlzdCIsImludGVydmFsIiwic2V0SW50ZXJ2YWwiLCJjbGVhckludGVydmFsIiwid2FpdEZvckNoaWxkUHJvbWlzZSIsIlByb21pc2UiLCJyZXNvbHZlIiwid2FpdEZvckJvZHlPcGVuIiwiZG9jIiwiZG9jdW1lbnRFbGVtZW50IiwiYm9keSIsIndhaXRGb3JCb2R5T3BlblByb21pc2UiLCJyZW1vdmVFbGVtZW50IiwiZWxlbWVudCIsInBhcmVudEVsZW1lbnQiLCJyZW1vdmVDaGlsZCIsInJlbW92ZUNoaWxkcmVuIiwiZmlyc3RDaGlsZCIsImNvcHlDaGlsZHJlbiIsImZyb20iLCJ0byIsImZyYWciLCJjcmVhdGVEb2N1bWVudEZyYWdtZW50IiwibiIsIm5leHRTaWJsaW5nIiwiYXBwZW5kQ2hpbGQiLCJjbG9uZU5vZGUiLCJpbnNlcnRBZnRlck9yQXRTdGFydCIsInJvb3QiLCJhZnRlciIsImluc2VydEF0U3RhcnQiLCJiZWZvcmUiLCJpbnNlcnRCZWZvcmUiLCJhZGRBdHRyaWJ1dGVzVG9FbGVtZW50IiwiYXR0cmlidXRlcyIsImF0dHIiLCJzZXRBdHRyaWJ1dGUiLCJjcmVhdGVFbGVtZW50V2l0aEF0dHJpYnV0ZXMiLCJ0YWdOYW1lIiwiY3JlYXRlRWxlbWVudCIsImlzQ29ubmVjdGVkTm9kZSIsIm5vZGUiLCJjb25uZWN0ZWQiLCJpc0Nvbm5lY3RlZCIsInVuZGVmaW5lZCIsInJvb3ROb2RlRm9yIiwiaG9zdCIsIm5vZGVUeXBlIiwiTm9kZSIsIkRPQ1VNRU5UX05PREUiLCJwcm90b3R5cGUiLCJnZXRSb290Tm9kZSIsInBhcmVudE5vZGUiLCJpc1NoYWRvd1Jvb3QiLCJ2YWx1ZSIsIk9iamVjdCIsInRvU3RyaW5nIiwiY2FsbCIsImdldERhdGFQYXJhbXNGcm9tQXR0cmlidXRlcyIsIm9wdF9jb21wdXRlUGFyYW1OYW1lRnVuYyIsIm9wdF9wYXJhbVBhdHRlcm4iLCJjb21wdXRlUGFyYW1OYW1lRnVuYyIsImtleSIsImRhdGFzZXQiLCJwYXJhbXMiLCJwYXJhbVBhdHRlcm4iLCJtYXRjaCIsInBhcmFtIiwidG9Mb3dlckNhc2UiLCJzdWJzdHIiLCJoYXNOZXh0Tm9kZUluRG9jdW1lbnRPcmRlciIsIm9wdF9zdG9wTm9kZSIsImN1cnJlbnRFbGVtZW50IiwidGVtcGxhdGVDb250ZW50Q2xvbmUiLCJ0ZW1wbGF0ZSIsImNvbnRlbnQiLCJpdGVyYXRlQ3Vyc29yIiwiaXRlcmFibGUiLCJjYiIsImxlbmd0aCIsImkiLCJpc0pzb25TY3JpcHRUYWciLCJnZXRBdHRyaWJ1dGUiLCJ0b1VwcGVyQ2FzZSIsImlzSnNvbkxkU2NyaXB0VGFnIiwiaXNSVEwiLCJkaXIiLCJlc2NhcGVIdG1sIiwidGV4dCIsInJlcGxhY2UiLCJlc2NhcGVIdG1sQ2hhciIsImMiLCJ0cnlGb2N1cyIsImZvY3VzIiwiZSIsImlzSWZyYW1lZCIsImlzRW5hYmxlZCIsImRpc2FibGVkIiwiZG9tT3JkZXJDb21wYXJhdG9yIiwiZWxlbWVudDEiLCJlbGVtZW50MiIsInBvcyIsImNvbXBhcmVEb2N1bWVudFBvc2l0aW9uIiwicHJlY2VkaW5nT3JDb250YWlucyIsIkRPQ1VNRU5UX1BPU0lUSU9OX1BSRUNFRElORyIsIkRPQ1VNRU5UX1BPU0lUSU9OX0NPTlRBSU5TIiwidG9nZ2xlQXR0cmlidXRlIiwibmFtZSIsImZvcmNlZCIsImhhc0F0dHJpYnV0ZSIsImVuYWJsZWQiLCJyZW1vdmVBdHRyaWJ1dGUiLCJwYXJzZUJvb2xlYW5BdHRyaWJ1dGUiLCJzIiwiZ2V0VmVydGljYWxTY3JvbGxiYXJXaWR0aCIsImRvY3VtZW50Iiwid2luZG93V2lkdGgiLCJpbm5lcldpZHRoIiwiZG9jdW1lbnRXaWR0aCIsImNsaWVudFdpZHRoIiwiZGlzcGF0Y2hDdXN0b21FdmVudCIsIm9wdF9kYXRhIiwib3B0X29wdGlvbnMiLCJkYXRhIiwiZXZlbnQiLCJjcmVhdGVFdmVudCIsImluaXRFdmVudCIsImRpc3BhdGNoRXZlbnQiLCJjb250YWluc05vdFNlbGYiLCJjaGlsZCIsImNvbnRhaW5zIiwiZ2V0Q2hpbGRKc29uQ29uZmlnIiwic2NyaXB0cyIsIkVycm9yIiwic2NyaXB0IiwidGV4dENvbnRlbnQiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLElBQVI7QUFDQSxTQUFRQyxTQUFSO0FBQ0EsU0FBUUMsS0FBUjtBQUVBLFNBQVFDLGtCQUFSLEVBQTRCQyxPQUE1QjtBQUVBLElBQU1DLGlCQUFpQixHQUFHO0FBQ3hCLE9BQUssT0FEbUI7QUFFeEIsT0FBSyxNQUZtQjtBQUd4QixPQUFLLE1BSG1CO0FBSXhCLE9BQUssUUFKbUI7QUFLeEIsT0FBSyxRQUxtQjtBQU14QixPQUFLO0FBTm1CLENBQTFCO0FBUUEsSUFBTUMsaUJBQWlCLEdBQUcsZ0JBQTFCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sSUFBSUMscUJBQUo7O0FBRVA7QUFDQSxJQUFNQyw0QkFBNEIsR0FBRztBQUFDQyxFQUFBQSxPQUFPLEVBQUUsSUFBVjtBQUFnQkMsRUFBQUEsVUFBVSxFQUFFO0FBQTVCLENBQXJDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QixDQUFPckQsTUFBUDs7QUFDQSxNQUFJQSxNQUFNLEtBQUssQ0FBZixFQUFrQjtBQUNoQixVQUFNLElBQUlzRCxLQUFKLFlBQW1CdEQsTUFBbkIscUNBQU47QUFDRDs7QUFFRCxNQUFNdUQsTUFBTSxHQUFHRixPQUFPLENBQUMsQ0FBRCxDQUF0Qjs7QUFDQSxNQUFJLENBQUNuRCxlQUFlLENBQUNxRCxNQUFELENBQXBCLEVBQThCO0FBQzVCLFVBQU0sSUFBSUQsS0FBSixDQUFVLGtEQUFWLENBQU47QUFDRDs7QUFFRCxNQUFJO0FBQ0YsV0FBTzFKLFNBQVMsQ0FBQzJKLE1BQU0sQ0FBQ0MsV0FBUixDQUFoQjtBQUNELEdBRkQsQ0FFRSxnQkFBTTtBQUNOLFVBQU0sSUFBSUYsS0FBSixDQUFVLHNEQUFWLENBQU47QUFDRDtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7ZGljdH0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0JztcbmltcG9ydCB7cGFyc2VKc29ufSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QvanNvbic7XG5pbXBvcnQge3RvV2lufSBmcm9tICcjY29yZS93aW5kb3cnO1xuXG5pbXBvcnQge2NoaWxkRWxlbWVudHNCeVRhZywgbWF0Y2hlc30gZnJvbSAnLi9xdWVyeSc7XG5cbmNvbnN0IEhUTUxfRVNDQVBFX0NIQVJTID0ge1xuICAnJic6ICcmYW1wOycsXG4gICc8JzogJyZsdDsnLFxuICAnPic6ICcmZ3Q7JyxcbiAgJ1wiJzogJyZxdW90OycsXG4gIFwiJ1wiOiAnJiN4Mjc7JyxcbiAgJ2AnOiAnJiN4NjA7Jyxcbn07XG5jb25zdCBIVE1MX0VTQ0FQRV9SRUdFWCA9IC8oJnw8fD58XCJ8J3xgKS9nO1xuXG4vKipcbiAqIEB0eXBlZGVmIHt7XG4gKiAgIGJ1YmJsZXM6IChib29sZWFufHVuZGVmaW5lZCksXG4gKiAgIGNhbmNlbGFibGU6IChib29sZWFufHVuZGVmaW5lZCksXG4gKiB9fVxuICovXG5leHBvcnQgbGV0IEN1c3RvbUV2ZW50T3B0aW9uc0RlZjtcblxuLyoqIEBjb25zdCB7IUN1c3RvbUV2ZW50T3B0aW9uc0RlZn0gKi9cbmNvbnN0IERFRkFVTFRfQ1VTVE9NX0VWRU5UX09QVElPTlMgPSB7YnViYmxlczogdHJ1ZSwgY2FuY2VsYWJsZTogdHJ1ZX07XG5cbi8qKlxuICogV2FpdHMgdW50aWwgdGhlIGNoaWxkIGVsZW1lbnQgaXMgY29uc3RydWN0ZWQuIE9uY2UgdGhlIGNoaWxkIGlzIGZvdW5kLCB0aGVcbiAqIGNhbGxiYWNrIGlzIGV4ZWN1dGVkLlxuICogQHBhcmFtIHshRWxlbWVudH0gcGFyZW50XG4gKiBAcGFyYW0ge2Z1bmN0aW9uKCFFbGVtZW50KTpib29sZWFufSBjaGVja0Z1bmNcbiAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gY2FsbGJhY2tcbiAqIEBzdXBwcmVzcyB7c3VzcGljaW91c0NvZGV9IGR1ZSB0byBJU19FU01cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdhaXRGb3JDaGlsZChwYXJlbnQsIGNoZWNrRnVuYywgY2FsbGJhY2spIHtcbiAgaWYgKGNoZWNrRnVuYyhwYXJlbnQpKSB7XG4gICAgY2FsbGJhY2soKTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3Qgd2luID0gdG9XaW4ocGFyZW50Lm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXcpO1xuICBpZiAoSVNfRVNNIHx8IHdpbi5NdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgd2luLk11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgaWYgKGNoZWNrRnVuYyhwYXJlbnQpKSB7XG4gICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBvYnNlcnZlci5vYnNlcnZlKHBhcmVudCwge2NoaWxkTGlzdDogdHJ1ZX0pO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGludGVydmFsID0gd2luLnNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGlmIChjaGVja0Z1bmMocGFyZW50KSkge1xuICAgICAgICB3aW4uY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICB9XG4gICAgfSwgLyogbWlsbGlzZWNvbmRzICovIDUpO1xuICB9XG59XG5cbi8qKlxuICogV2FpdHMgdW50aWwgdGhlIGNoaWxkIGVsZW1lbnQgaXMgY29uc3RydWN0ZWQuIE9uY2UgdGhlIGNoaWxkIGlzIGZvdW5kLCB0aGVcbiAqIHByb21pc2UgaXMgcmVzb2x2ZWQuXG4gKiBAcGFyYW0geyFFbGVtZW50fSBwYXJlbnRcbiAqIEBwYXJhbSB7ZnVuY3Rpb24oIUVsZW1lbnQpOmJvb2xlYW59IGNoZWNrRnVuY1xuICogQHJldHVybiB7IVByb21pc2V9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3YWl0Rm9yQ2hpbGRQcm9taXNlKHBhcmVudCwgY2hlY2tGdW5jKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIHdhaXRGb3JDaGlsZChwYXJlbnQsIGNoZWNrRnVuYywgcmVzb2x2ZSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFdhaXRzIGZvciBkb2N1bWVudCdzIGJvZHkgdG8gYmUgYXZhaWxhYmxlIGFuZCByZWFkeS5cbiAqIEBwYXJhbSB7IURvY3VtZW50fSBkb2NcbiAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gY2FsbGJhY2tcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdhaXRGb3JCb2R5T3Blbihkb2MsIGNhbGxiYWNrKSB7XG4gIHdhaXRGb3JDaGlsZChkb2MuZG9jdW1lbnRFbGVtZW50LCAoKSA9PiAhIWRvYy5ib2R5LCBjYWxsYmFjayk7XG59XG5cbi8qKlxuICogV2FpdHMgZm9yIGRvY3VtZW50J3MgYm9keSB0byBiZSBhdmFpbGFibGUuXG4gKiBAcGFyYW0geyFEb2N1bWVudH0gZG9jXG4gKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdhaXRGb3JCb2R5T3BlblByb21pc2UoZG9jKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gd2FpdEZvckJvZHlPcGVuKGRvYywgcmVzb2x2ZSkpO1xufVxuXG4vKipcbiAqIFJlbW92ZXMgdGhlIGVsZW1lbnQuXG4gKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVFbGVtZW50KGVsZW1lbnQpIHtcbiAgZWxlbWVudC5wYXJlbnRFbGVtZW50Py5yZW1vdmVDaGlsZChlbGVtZW50KTtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIGFsbCBjaGlsZCBub2RlcyBvZiB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuXG4gKiBAcGFyYW0geyFFbGVtZW50fCFEb2N1bWVudEZyYWdtZW50fSBwYXJlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUNoaWxkcmVuKHBhcmVudCkge1xuICB3aGlsZSAocGFyZW50LmZpcnN0Q2hpbGQpIHtcbiAgICBwYXJlbnQucmVtb3ZlQ2hpbGQocGFyZW50LmZpcnN0Q2hpbGQpO1xuICB9XG59XG5cbi8qKlxuICogQ29waWVzIGFsbCBjaGlsZHJlbiBub2RlcyBvZiBlbGVtZW50IFwiZnJvbVwiIHRvIGVsZW1lbnQgXCJ0b1wiLiBDaGlsZCBub2Rlc1xuICogYXJlIGRlZXBseSBjbG9uZWQuIE5vdGljZSwgdGhhdCB0aGlzIG1ldGhvZCBzaG91bGQgYmUgdXNlZCB3aXRoIGNhcmUgYW5kXG4gKiBwcmVmZXJhYmx5IG9uIHNtYWxsZXIgc3VidHJlZXMuXG4gKiBAcGFyYW0geyFFbGVtZW50fSBmcm9tXG4gKiBAcGFyYW0geyFFbGVtZW50fCFEb2N1bWVudEZyYWdtZW50fSB0b1xuICovXG5leHBvcnQgZnVuY3Rpb24gY29weUNoaWxkcmVuKGZyb20sIHRvKSB7XG4gIGNvbnN0IGZyYWcgPSB0by5vd25lckRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgZm9yIChsZXQgbiA9IGZyb20uZmlyc3RDaGlsZDsgbjsgbiA9IG4ubmV4dFNpYmxpbmcpIHtcbiAgICBmcmFnLmFwcGVuZENoaWxkKG4uY2xvbmVOb2RlKHRydWUpKTtcbiAgfVxuICB0by5hcHBlbmRDaGlsZChmcmFnKTtcbn1cblxuLyoqXG4gKiBJbnNlcnQgdGhlIGVsZW1lbnQgaW4gdGhlIHJvb3QgYWZ0ZXIgdGhlIGVsZW1lbnQgbmFtZWQgYWZ0ZXIgb3JcbiAqIGlmIHRoYXQgaXMgbnVsbCBhdCB0aGUgYmVnaW5uaW5nLlxuICogQHBhcmFtIHshRWxlbWVudHwhU2hhZG93Um9vdH0gcm9vdFxuICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICogQHBhcmFtIHs/Tm9kZT19IGFmdGVyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnNlcnRBZnRlck9yQXRTdGFydChyb290LCBlbGVtZW50LCBhZnRlciA9IG51bGwpIHtcbiAgaWYgKCFhZnRlcikge1xuICAgIGluc2VydEF0U3RhcnQocm9vdCwgZWxlbWVudCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IGJlZm9yZSA9IGFmdGVyLm5leHRTaWJsaW5nO1xuICByb290Lmluc2VydEJlZm9yZShlbGVtZW50LCBiZWZvcmUpO1xufVxuXG4vKipcbiAqIEluc2VydCB0aGUgZWxlbWVudCBpbiB0aGUgcm9vdCBhZnRlciB0aGUgZWxlbWVudCBuYW1lZCBhZnRlciBvclxuICogaWYgdGhhdCBpcyBudWxsIGF0IHRoZSBiZWdpbm5pbmcuXG4gKiBAcGFyYW0geyFFbGVtZW50fCFTaGFkb3dSb290fSByb290XG4gKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnNlcnRBdFN0YXJ0KHJvb3QsIGVsZW1lbnQpIHtcbiAgcm9vdC5pbnNlcnRCZWZvcmUoZWxlbWVudCwgcm9vdC5maXJzdENoaWxkKTtcbn1cblxuLyoqXG4gKiBBZGQgYXR0cmlidXRlcyB0byBhbiBlbGVtZW50LlxuICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICogQHBhcmFtIHshSnNvbk9iamVjdDxzdHJpbmcsIHN0cmluZz59IGF0dHJpYnV0ZXNcbiAqIEByZXR1cm4geyFFbGVtZW50fSBjcmVhdGVkIGVsZW1lbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZEF0dHJpYnV0ZXNUb0VsZW1lbnQoZWxlbWVudCwgYXR0cmlidXRlcykge1xuICBmb3IgKGNvbnN0IGF0dHIgaW4gYXR0cmlidXRlcykge1xuICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKGF0dHIsIGF0dHJpYnV0ZXNbYXR0cl0pO1xuICB9XG4gIHJldHVybiBlbGVtZW50O1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBlbGVtZW50IG9uIGRvY3VtZW50IHdpdGggc3BlY2lmaWVkIHRhZ05hbWUgYW5kIGF0dHJpYnV0ZXMuXG4gKiBAcGFyYW0geyFEb2N1bWVudH0gZG9jXG4gKiBAcGFyYW0ge3N0cmluZ30gdGFnTmFtZVxuICogQHBhcmFtIHshSnNvbk9iamVjdDxzdHJpbmcsIHN0cmluZz59IGF0dHJpYnV0ZXNcbiAqIEByZXR1cm4geyFFbGVtZW50fSBjcmVhdGVkIGVsZW1lbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnRXaXRoQXR0cmlidXRlcyhkb2MsIHRhZ05hbWUsIGF0dHJpYnV0ZXMpIHtcbiAgY29uc3QgZWxlbWVudCA9IGRvYy5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xuICByZXR1cm4gYWRkQXR0cmlidXRlc1RvRWxlbWVudChlbGVtZW50LCBhdHRyaWJ1dGVzKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgbm9kZSBpcyBjb25uZWN0ZWQgKGF0dGFjaGVkKS5cbiAqIEBwYXJhbSB7IU5vZGV9IG5vZGVcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKiBAc2VlIGh0dHBzOi8vZG9tLnNwZWMud2hhdHdnLm9yZy8jY29ubmVjdGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0Nvbm5lY3RlZE5vZGUobm9kZSkge1xuICBjb25zdCBjb25uZWN0ZWQgPSBub2RlLmlzQ29ubmVjdGVkO1xuICBpZiAoY29ubmVjdGVkICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gY29ubmVjdGVkO1xuICB9XG5cbiAgLy8gXCJBbiBlbGVtZW50IGlzIGNvbm5lY3RlZCBpZiBpdHMgc2hhZG93LWluY2x1ZGluZyByb290IGlzIGEgZG9jdW1lbnQuXCJcbiAgbGV0IG4gPSBub2RlO1xuICBkbyB7XG4gICAgbiA9IHJvb3ROb2RlRm9yKG4pO1xuICAgIGlmIChuLmhvc3QpIHtcbiAgICAgIG4gPSBuLmhvc3Q7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfSB3aGlsZSAodHJ1ZSk7XG4gIHJldHVybiBuLm5vZGVUeXBlID09PSBOb2RlLkRPQ1VNRU5UX05PREU7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgcm9vdCBmb3IgYSBnaXZlbiBub2RlLiBEb2VzIG5vdCBjcm9zcyBzaGFkb3cgRE9NIGJvdW5kYXJ5LlxuICogQHBhcmFtIHshTm9kZX0gbm9kZVxuICogQHJldHVybiB7IU5vZGV9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb290Tm9kZUZvcihub2RlKSB7XG4gIGlmIChOb2RlLnByb3RvdHlwZS5nZXRSb290Tm9kZSkge1xuICAgIC8vIFR5cGUgY2hlY2tlciBzYXlzIGBnZXRSb290Tm9kZWAgbWF5IHJldHVybiBudWxsLlxuICAgIHJldHVybiBub2RlLmdldFJvb3ROb2RlKCkgfHwgbm9kZTtcbiAgfVxuICBsZXQgbjtcbiAgLy8gQ2hlY2sgaXNTaGFkb3dSb290KCkgaXMgb25seSBuZWVkZWQgZm9yIHRoZSBwb2x5ZmlsbCBjYXNlLlxuICBmb3IgKFxuICAgIG4gPSBub2RlO1xuICAgICEhbi5wYXJlbnROb2RlICYmICFpc1NoYWRvd1Jvb3QoLyoqIEB0eXBlIHtIVE1MRWxlbWVudH0gKi8gKG4pKTtcbiAgICBuID0gbi5wYXJlbnROb2RlXG4gICkge31cbiAgcmV0dXJuIG47XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiB2YWx1ZSBpcyBhY3R1YWxseSBhIGBTaGFkb3dSb290YCBub2RlLlxuICogQHBhcmFtIHs/SFRNTEVsZW1lbnR9IHZhbHVlXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNTaGFkb3dSb290KHZhbHVlKSB7XG4gIGlmICghdmFsdWUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy8gTm9kZS5ub2RlVHlwZSA9PSBET0NVTUVOVF9GUkFHTUVOVCB0byBzcGVlZCB1cCB0aGUgdGVzdHMuIFVuZm9ydHVuYXRlbHksXG4gIC8vIG5vZGVUeXBlIG9mIERPQ1VNRU5UX0ZSQUdNRU5UIGlzIHVzZWQgY3VycmVudGx5IGZvciBTaGFkb3dSb290IG5vZGVzLlxuICBpZiAodmFsdWUudGFnTmFtZSA9PSAnSS1BTVBIVE1MLVNIQURPVy1ST09UJykge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiAoXG4gICAgdmFsdWUubm9kZVR5cGUgPT0gLyogRE9DVU1FTlRfRlJBR01FTlQgKi8gMTEgJiZcbiAgICBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpID09PSAnW29iamVjdCBTaGFkb3dSb290XSdcbiAgKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGVsZW1lbnQgZGF0YS1wYXJhbS0gYXR0cmlidXRlcyBhcyB1cmwgcGFyYW1ldGVycyBrZXktdmFsdWUgcGFpcnMuXG4gKiBlLmcuIGRhdGEtcGFyYW0tc29tZS1hdHRyPXZhbHVlIC0+IHtzb21lQXR0cjogdmFsdWV9LlxuICogQHBhcmFtIHshSFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAqIEBwYXJhbSB7ZnVuY3Rpb24oc3RyaW5nKTpzdHJpbmc9fSBvcHRfY29tcHV0ZVBhcmFtTmFtZUZ1bmMgdG8gY29tcHV0ZSB0aGVcbiAqICAgIHBhcmFtZXRlciBuYW1lLCBnZXQgcGFzc2VkIHRoZSBjYW1lbC1jYXNlIHBhcmFtZXRlciBuYW1lLlxuICogQHBhcmFtIHshUmVnRXhwPX0gb3B0X3BhcmFtUGF0dGVybiBSZWdleCBwYXR0ZXJuIHRvIG1hdGNoIGRhdGEgYXR0cmlidXRlcy5cbiAqIEByZXR1cm4geyFKc29uT2JqZWN0fVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGF0YVBhcmFtc0Zyb21BdHRyaWJ1dGVzKFxuICBlbGVtZW50LFxuICBvcHRfY29tcHV0ZVBhcmFtTmFtZUZ1bmMsXG4gIG9wdF9wYXJhbVBhdHRlcm5cbikge1xuICBjb25zdCBjb21wdXRlUGFyYW1OYW1lRnVuYyA9IG9wdF9jb21wdXRlUGFyYW1OYW1lRnVuYyB8fCAoKGtleSkgPT4ga2V5KTtcbiAgY29uc3Qge2RhdGFzZXR9ID0gZWxlbWVudDtcbiAgY29uc3QgcGFyYW1zID0gZGljdCgpO1xuICBjb25zdCBwYXJhbVBhdHRlcm4gPSBvcHRfcGFyYW1QYXR0ZXJuIHx8IC9ecGFyYW0oLispLztcbiAgZm9yIChjb25zdCBrZXkgaW4gZGF0YXNldCkge1xuICAgIGNvbnN0IG1hdGNoZXMgPSBrZXkubWF0Y2gocGFyYW1QYXR0ZXJuKTtcbiAgICBpZiAobWF0Y2hlcykge1xuICAgICAgY29uc3QgcGFyYW0gPSBtYXRjaGVzWzFdWzBdLnRvTG93ZXJDYXNlKCkgKyBtYXRjaGVzWzFdLnN1YnN0cigxKTtcbiAgICAgIHBhcmFtc1tjb21wdXRlUGFyYW1OYW1lRnVuYyhwYXJhbSldID0gZGF0YXNldFtrZXldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcGFyYW1zO1xufVxuXG4vKipcbiAqIFdoZXRoZXIgdGhlIGVsZW1lbnQgaGF2ZSBhIG5leHQgbm9kZSBpbiB0aGUgZG9jdW1lbnQgb3JkZXIuXG4gKiBUaGlzIG1lYW5zIGVpdGhlcjpcbiAqICBhLiBUaGUgZWxlbWVudCBpdHNlbGYgaGFzIGEgbmV4dFNpYmxpbmcuXG4gKiAgYi4gQW55IG9mIHRoZSBlbGVtZW50IGFuY2VzdG9ycyBoYXMgYSBuZXh0U2libGluZy5cbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAqIEBwYXJhbSB7P05vZGV9IG9wdF9zdG9wTm9kZVxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc05leHROb2RlSW5Eb2N1bWVudE9yZGVyKGVsZW1lbnQsIG9wdF9zdG9wTm9kZSkge1xuICBsZXQgY3VycmVudEVsZW1lbnQgPSBlbGVtZW50O1xuICBkbyB7XG4gICAgaWYgKGN1cnJlbnRFbGVtZW50Lm5leHRTaWJsaW5nKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0gd2hpbGUgKFxuICAgIChjdXJyZW50RWxlbWVudCA9IGN1cnJlbnRFbGVtZW50LnBhcmVudE5vZGUpICYmXG4gICAgY3VycmVudEVsZW1lbnQgIT0gb3B0X3N0b3BOb2RlXG4gICk7XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgY2xvbmUgb2YgdGhlIGNvbnRlbnQgb2YgYSB0ZW1wbGF0ZSBlbGVtZW50LlxuICpcbiAqIFBvbHlmaWxsIHRvIHJlcGxhY2UgLmNvbnRlbnQgYWNjZXNzIGZvciBicm93c2VycyB0aGF0IGRvIG5vdCBzdXBwb3J0XG4gKiBIVE1MVGVtcGxhdGVFbGVtZW50cyBuYXRpdmVseS5cbiAqXG4gKiBAcGFyYW0geyFIVE1MVGVtcGxhdGVFbGVtZW50fCFFbGVtZW50fSB0ZW1wbGF0ZVxuICogQHJldHVybiB7IURvY3VtZW50RnJhZ21lbnR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0ZW1wbGF0ZUNvbnRlbnRDbG9uZSh0ZW1wbGF0ZSkge1xuICBpZiAoJ2NvbnRlbnQnIGluIHRlbXBsYXRlKSB7XG4gICAgcmV0dXJuIHRlbXBsYXRlLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGNvbnRlbnQgPSB0ZW1wbGF0ZS5vd25lckRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICBjb3B5Q2hpbGRyZW4odGVtcGxhdGUsIGNvbnRlbnQpO1xuICAgIHJldHVybiBjb250ZW50O1xuICB9XG59XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFuIGFycmF5LWxpa2UuXG4gKiBUZXN0IGNhc2VzOiBodHRwczovL2pzYmVuY2guZ2l0aHViLmlvLyNmNjM4Y2FjYzg2NmExYjJkNmU1MTdlNmNmYTkwMGQ2YlxuICogQHBhcmFtIHshSUFycmF5TGlrZTxUPn0gaXRlcmFibGVcbiAqIEBwYXJhbSB7ZnVuY3Rpb24oVCwgbnVtYmVyKX0gY2JcbiAqIEB0ZW1wbGF0ZSBUXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpdGVyYXRlQ3Vyc29yKGl0ZXJhYmxlLCBjYikge1xuICBjb25zdCB7bGVuZ3RofSA9IGl0ZXJhYmxlO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgY2IoaXRlcmFibGVbaV0sIGkpO1xuICB9XG59XG5cbi8qKlxuICogV2hldGhlciB0aGUgZWxlbWVudCBpcyBhIHNjcmlwdCB0YWcgd2l0aCBhcHBsaWNhdGlvbi9qc29uIHR5cGUuXG4gKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNKc29uU2NyaXB0VGFnKGVsZW1lbnQpIHtcbiAgcmV0dXJuIChcbiAgICBlbGVtZW50LnRhZ05hbWUgPT0gJ1NDUklQVCcgJiZcbiAgICBlbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpPy50b1VwcGVyQ2FzZSgpID09ICdBUFBMSUNBVElPTi9KU09OJ1xuICApO1xufVxuXG4vKipcbiAqIFdoZXRoZXIgdGhlIGVsZW1lbnQgaXMgYSBzY3JpcHQgdGFnIHdpdGggYXBwbGljYXRpb24vanNvbiB0eXBlLlxuICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzSnNvbkxkU2NyaXB0VGFnKGVsZW1lbnQpIHtcbiAgcmV0dXJuIChcbiAgICBlbGVtZW50LnRhZ05hbWUgPT0gJ1NDUklQVCcgJiZcbiAgICBlbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpPy50b1VwcGVyQ2FzZSgpID09ICdBUFBMSUNBVElPTi9MRCtKU09OJ1xuICApO1xufVxuXG4vKipcbiAqIFdoZXRoZXIgdGhlIHBhZ2UncyBkaXJlY3Rpb24gaXMgcmlnaHQgdG8gbGVmdCBvciBub3QuXG4gKiBAcGFyYW0geyFEb2N1bWVudH0gZG9jXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNSVEwoZG9jKSB7XG4gIGNvbnN0IGRpciA9XG4gICAgZG9jLmJvZHkuZ2V0QXR0cmlidXRlKCdkaXInKSB8fFxuICAgIGRvYy5kb2N1bWVudEVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkaXInKSB8fFxuICAgICdsdHInO1xuICByZXR1cm4gZGlyID09ICdydGwnO1xufVxuXG4vKipcbiAqIEVzY2FwZXMgYDxgLCBgPmAgYW5kIG90aGVyIEhUTUwgY2hhcmNhdGVycyB3aXRoIHRoZWlyIGVzY2FwZWQgZm9ybXMuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXNjYXBlSHRtbCh0ZXh0KSB7XG4gIGlmICghdGV4dCkge1xuICAgIHJldHVybiB0ZXh0O1xuICB9XG4gIHJldHVybiB0ZXh0LnJlcGxhY2UoSFRNTF9FU0NBUEVfUkVHRVgsIGVzY2FwZUh0bWxDaGFyKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gY1xuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBlc2NhcGVIdG1sQ2hhcihjKSB7XG4gIHJldHVybiBIVE1MX0VTQ0FQRV9DSEFSU1tjXTtcbn1cblxuLyoqXG4gKiBUcmllcyB0byBmb2N1cyBvbiB0aGUgZ2l2ZW4gZWxlbWVudDsgZmFpbHMgc2lsZW50bHkgaWYgYnJvd3NlciB0aHJvd3MgYW5cbiAqIGV4Y2VwdGlvbi5cbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyeUZvY3VzKGVsZW1lbnQpIHtcbiAgdHJ5IHtcbiAgICBlbGVtZW50Li8qT0sqLyBmb2N1cygpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gSUUgPD0gNyBtYXkgdGhyb3cgZXhjZXB0aW9ucyB3aGVuIGZvY3VzaW5nIG9uIGhpZGRlbiBpdGVtcy5cbiAgfVxufVxuXG4vKipcbiAqIFdoZXRoZXIgdGhlIGdpdmVuIHdpbmRvdyBpcyBpbiBhbiBpZnJhbWUgb3Igbm90LlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0lmcmFtZWQod2luKSB7XG4gIHJldHVybiB3aW4ucGFyZW50ICYmIHdpbi5wYXJlbnQgIT0gd2luO1xufVxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiBub2RlIGlzIG5vdCBkaXNhYmxlZC5cbiAqXG4gKiBJRTggY2FuIHJldHVybiBmYWxzZSBwb3NpdGl2ZXMsIHNlZSB7QGxpbmsgbWF0Y2hlc30uXG4gKiBAcGFyYW0geyFIVE1MSW5wdXRFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJuIHtib29sZWFufVxuICogQHNlZSBodHRwczovL3d3dy53My5vcmcvVFIvaHRtbDUvZm9ybXMuaHRtbCNjb25jZXB0LWZlLWRpc2FibGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0VuYWJsZWQoZWxlbWVudCkge1xuICByZXR1cm4gIShlbGVtZW50LmRpc2FibGVkIHx8IG1hdGNoZXMoZWxlbWVudCwgJzpkaXNhYmxlZCcpKTtcbn1cblxuLyoqXG4gKiBBIHNvcnRpbmcgY29tcGFyYXRvciB0aGF0IHNvcnRzIGVsZW1lbnRzIGluIERPTSB0cmVlIG9yZGVyLlxuICogQSBmaXJzdCBzaWJsaW5nIGlzIHNvcnRlZCB0byBiZSBiZWZvcmUgaXRzIG5leHRTaWJsaW5nLlxuICogQSBwYXJlbnQgbm9kZSBpcyBzb3J0ZWQgdG8gYmUgYmVmb3JlIGEgY2hpbGQuXG4gKiBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL05vZGUvY29tcGFyZURvY3VtZW50UG9zaXRpb25cbiAqXG4gKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50MVxuICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudDJcbiAqIEByZXR1cm4ge251bWJlcn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRvbU9yZGVyQ29tcGFyYXRvcihlbGVtZW50MSwgZWxlbWVudDIpIHtcbiAgaWYgKGVsZW1lbnQxID09PSBlbGVtZW50Mikge1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgY29uc3QgcG9zID0gZWxlbWVudDEuY29tcGFyZURvY3VtZW50UG9zaXRpb24oZWxlbWVudDIpO1xuICBjb25zdCBwcmVjZWRpbmdPckNvbnRhaW5zID1cbiAgICBOb2RlLkRPQ1VNRU5UX1BPU0lUSU9OX1BSRUNFRElORyB8IE5vZGUuRE9DVU1FTlRfUE9TSVRJT05fQ09OVEFJTlM7XG5cbiAgLy8gaWYgZmUyIGlzIHByZWNlZGluZyBvciBjb250YWlucyBmZTEgdGhlbiwgZmUxIGlzIGFmdGVyIGZlMlxuICBpZiAocG9zICYgcHJlY2VkaW5nT3JDb250YWlucykge1xuICAgIHJldHVybiAxO1xuICB9XG5cbiAgLy8gaWYgZmUyIGlzIGZvbGxvd2luZyBvciBjb250YWluZWQgYnkgZmUxLCB0aGVuIGZlMSBpcyBiZWZvcmUgZmUyXG4gIHJldHVybiAtMTtcbn1cblxuLyoqXG4gKiBMaWtlIGBFbGVtZW50LnByb3RvdHlwZS50b2dnbGVBdHRyaWJ1dGVgLiBUaGlzIGVpdGhlciB0b2dnbGVzIGFuIGF0dHJpYnV0ZVxuICogb24gYnkgYWRkaW5nIGFuIGF0dHJpYnV0ZSB3aXRoIGFuIGVtcHR5IHZhbHVlLCBvciB0b2dnbGVzIGl0IG9mZiBieSByZW1vdmluZ1xuICogdGhlIGF0dHJpYnV0ZS4gVGhpcyBkb2VzIG5vdCBtdXRhdGUgdGhlIGVsZW1lbnQgaWYgdGhlIG5ldyBzdGF0ZSBtYXRjaGVzXG4gKiB0aGUgZXhpc3Rpbmcgc3RhdGUuXG4gKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50IEFuIGVsZW1lbnQgdG8gdG9nZ2xlIHRoZSBhdHRyaWJ1dGUgZm9yLlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIGF0dHJpYnV0ZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbj19IGZvcmNlZCBXaGV0aGVyIHRoZSBhdHRyaWJ1dGUgc2hvdWxkIGJlIGZvcmNlZCBvbi9vZmYuIElmXG4gKiAgICBub3Qgc3BlY2lmaWVkLCBpdCB3aWxsIGJlIHRvZ2dsZWQgZnJvbSB0aGUgY3VycmVudCBzdGF0ZS5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSBlbGVtZW50IG5vdyBoYXMgdGhlIGF0dHJpYnV0ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvZ2dsZUF0dHJpYnV0ZShlbGVtZW50LCBuYW1lLCBmb3JjZWQpIHtcbiAgY29uc3QgaGFzQXR0cmlidXRlID0gZWxlbWVudC5oYXNBdHRyaWJ1dGUobmFtZSk7XG4gIGNvbnN0IGVuYWJsZWQgPSBmb3JjZWQgIT09IHVuZGVmaW5lZCA/IGZvcmNlZCA6ICFoYXNBdHRyaWJ1dGU7XG5cbiAgaWYgKGVuYWJsZWQgIT09IGhhc0F0dHJpYnV0ZSkge1xuICAgIGlmIChlbmFibGVkKSB7XG4gICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShuYW1lLCAnJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBlbmFibGVkO1xufVxuXG4vKipcbiAqIFBhcnNlcyBhIHN0cmluZyBhcyBhIGJvb2xlYW4gdmFsdWUgdXNpbmcgdGhlIGV4cGFuZGVkIHJ1bGVzIGZvciBET00gYm9vbGVhblxuICogYXR0cmlidXRlczpcbiAqIC0gYSBgbnVsbGAgb3IgYHVuZGVmaW5lZGAgcmV0dXJucyBgbnVsbGA7XG4gKiAtIGFuIGVtcHR5IHN0cmluZyByZXR1cm5zIGB0cnVlYDtcbiAqIC0gYSBcImZhbHNlXCIgc3RyaW5nIHJldHVybnMgYGZhbHNlYDtcbiAqIC0gb3RoZXJ3aXNlLCBgdHJ1ZWAgaXMgcmV0dXJuZWQuXG4gKlxuICogQHBhcmFtIHs/c3RyaW5nfHVuZGVmaW5lZH0gc1xuICogQHJldHVybiB7Ym9vbGVhbnx1bmRlZmluZWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUJvb2xlYW5BdHRyaWJ1dGUocykge1xuICByZXR1cm4gcyA9PSBudWxsID8gdW5kZWZpbmVkIDogcyAhPT0gJ2ZhbHNlJztcbn1cblxuLyoqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHJldHVybiB7bnVtYmVyfSBUaGUgd2lkdGggb2YgdGhlIHZlcnRpY2FsIHNjcm9sbGJhciwgaW4gcGl4ZWxzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VmVydGljYWxTY3JvbGxiYXJXaWR0aCh3aW4pIHtcbiAgY29uc3Qge2RvY3VtZW50RWxlbWVudH0gPSB3aW4uZG9jdW1lbnQ7XG4gIGNvbnN0IHdpbmRvd1dpZHRoID0gd2luLi8qT0sqLyBpbm5lcldpZHRoO1xuICBjb25zdCBkb2N1bWVudFdpZHRoID0gZG9jdW1lbnRFbGVtZW50Li8qT0sqLyBjbGllbnRXaWR0aDtcbiAgcmV0dXJuIHdpbmRvd1dpZHRoIC0gZG9jdW1lbnRXaWR0aDtcbn1cblxuLyoqXG4gKiBEaXNwYXRjaGVzIGEgY3VzdG9tIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7IU5vZGV9IG5vZGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0geyFPYmplY3Q9fSBvcHRfZGF0YSBFdmVudCBkYXRhLlxuICogQHBhcmFtIHshQ3VzdG9tRXZlbnRPcHRpb25zRGVmPX0gb3B0X29wdGlvbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpc3BhdGNoQ3VzdG9tRXZlbnQobm9kZSwgbmFtZSwgb3B0X2RhdGEsIG9wdF9vcHRpb25zKSB7XG4gIGNvbnN0IGRhdGEgPSBvcHRfZGF0YSB8fCB7fTtcbiAgLy8gQ29uc3RydWN0b3JzIG9mIGV2ZW50cyBuZWVkIHRvIGNvbWUgZnJvbSB0aGUgY29ycmVjdCB3aW5kb3cuIFNpZ2guXG4gIGNvbnN0IGV2ZW50ID0gbm9kZS5vd25lckRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuXG4gIC8vIFRlY2huaWNhbGx5IC5kYXRhIGlzIG5vdCBhIHByb3BlcnR5IG9mIEV2ZW50LlxuICBldmVudC5kYXRhID0gZGF0YTtcblxuICBjb25zdCB7YnViYmxlcywgY2FuY2VsYWJsZX0gPSBvcHRfb3B0aW9ucyB8fCBERUZBVUxUX0NVU1RPTV9FVkVOVF9PUFRJT05TO1xuICBldmVudC5pbml0RXZlbnQobmFtZSwgYnViYmxlcywgY2FuY2VsYWJsZSk7XG4gIG5vZGUuZGlzcGF0Y2hFdmVudChldmVudCk7XG59XG5cbi8qKlxuICogRW5zdXJlcyB0aGUgY2hpbGQgaXMgY29udGFpbmVkIGJ5IHRoZSBwYXJlbnQsIGJ1dCBub3QgdGhlIHBhcmVudCBpdHNlbGYuXG4gKlxuICogQHBhcmFtIHshTm9kZX0gcGFyZW50XG4gKiBAcGFyYW0geyFOb2RlfSBjaGlsZFxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnRhaW5zTm90U2VsZihwYXJlbnQsIGNoaWxkKSB7XG4gIHJldHVybiBjaGlsZCAhPT0gcGFyZW50ICYmIHBhcmVudC5jb250YWlucyhjaGlsZCk7XG59XG5cbi8qKlxuICogSGVscGVyIG1ldGhvZCB0byBnZXQgdGhlIGpzb24gY29uZmlnIGZyb20gYW4gZWxlbWVudCA8c2NyaXB0PiB0YWdcbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm4gez9Kc29uT2JqZWN0fVxuICogQHRocm93cyB7IUVycm9yfSBJZiBlbGVtZW50IGRvZXMgbm90IGhhdmUgZXhhY3RseSBvbmUgPHNjcmlwdD4gY2hpbGRcbiAqIHdpdGggdHlwZT1cImFwcGxpY2F0aW9uL2pzb25cIiwgb3IgaWYgdGhlIDxzY3JpcHQ+IGNvbnRlbnRzIGFyZSBub3QgdmFsaWQgSlNPTi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENoaWxkSnNvbkNvbmZpZyhlbGVtZW50KSB7XG4gIGNvbnN0IHNjcmlwdHMgPSBjaGlsZEVsZW1lbnRzQnlUYWcoZWxlbWVudCwgJ3NjcmlwdCcpO1xuICBjb25zdCB7bGVuZ3RofSA9IHNjcmlwdHM7XG4gIGlmIChsZW5ndGggIT09IDEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEZvdW5kICR7bGVuZ3RofSA8c2NyaXB0PiBjaGlsZHJlbi4gRXhwZWN0ZWQgMS5gKTtcbiAgfVxuXG4gIGNvbnN0IHNjcmlwdCA9IHNjcmlwdHNbMF07XG4gIGlmICghaXNKc29uU2NyaXB0VGFnKHNjcmlwdCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJzxzY3JpcHQ+IGNoaWxkIG11c3QgaGF2ZSB0eXBlPVwiYXBwbGljYXRpb24vanNvblwiJyk7XG4gIH1cblxuICB0cnkge1xuICAgIHJldHVybiBwYXJzZUpzb24oc2NyaXB0LnRleHRDb250ZW50KTtcbiAgfSBjYXRjaCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gcGFyc2UgPHNjcmlwdD4gY29udGVudHMuIElzIGl0IHZhbGlkIEpTT04/Jyk7XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/core/dom/index.js