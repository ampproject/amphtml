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

import {dashToCamelCase} from './string';

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
  const win = parent.ownerDocument.defaultView;
  if (win.MutationObserver) {
    const observer = new win.MutationObserver(() => {
      if (checkFunc(parent)) {
        observer.disconnect();
        callback();
      }
    });
    observer.observe(parent, {childList: true});
  } else {
    const interval = win.setInterval(() => {
      if (checkFunc(parent)) {
        win.clearInterval(interval);
        callback();
      }
    }, /* milliseconds */ 5);
  }
}


/**
 * Waits for document's body to be available.
 * @param {!Document} doc
 * @param {function()} callback
 */
export function waitForBody(doc, callback) {
  waitForChild(doc.documentElement, () => !!doc.body, callback);
}


/**
 * Waits for document's body to be available.
 * @param {!Document} doc
 * @return {!Promise}
 */
export function waitForBodyPromise(doc) {
  return new Promise(resolve => {
    waitForBody(doc, resolve);
  });
}


/**
 * Whether the element is currently contained in the DOM. Polyfills
 * `document.contains()` method when necessary. Notice that according to spec
 * `document.contains` is inclusionary.
 * See https://developer.mozilla.org/en-US/docs/Web/API/Node/contains
 * @param {!Document} doc
 * @param {!Element} element
 * @return {boolean}
 */
export function documentContains(doc, element) {
  if (!doc.contains) {
    return documentContainsPolyfillInternal_(doc, element);
  }
  return doc.contains(element);
}


/**
 * Polyfill for `document.contains()` method.
 * See https://developer.mozilla.org/en-US/docs/Web/API/Node/contains
 * @param {!Document} doc
 * @param {!Element} element
 * @return {boolean}
 * @private Visible for testing only.
 */
export function documentContainsPolyfillInternal_(doc, element) {
  // Per spec, "contains" method is inclusionary
  // i.e. `node.contains(node) == true`. However, we still need to test
  // equality to the document itself.
  return element == doc || doc.documentElement.contains(element);
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
 * @param {!Element} to
 */
export function copyChildren(from, to) {
  const frag = to.ownerDocument.createDocumentFragment();
  for (let n = from.firstChild; n; n = n.nextSibling) {
    frag.appendChild(n.cloneNode(true));
  }
  to.appendChild(frag);
}


/**
 * Finds the closest element that satisfies the callback from this element
 * up the DOM subtree.
 * @param {!Element} element
 * @param {function(!Element):boolean} callback
 * @return {?Element}
 */
export function closest(element, callback) {
  for (let el = element; el; el = el.parentElement) {
    if (callback(el)) {
      return el;
    }
  }
  return null;
}


/**
 * Finds the closest element with the specified name from this element
 * up the DOM subtree.
 * @param {!Element} element
 * @param {string} tagName
 * @return {?Element}
 */
export function closestByTag(element, tagName) {
  if (element.closest) {
    return element.closest(tagName);
  }
  tagName = tagName.toUpperCase();
  return closest(element, el => {
    return el.tagName == tagName;
  });
}


/**
 * Finds the first descendant element with the specified name.
 * @param {!Element} element
 * @param {string} tagName
 * @return {?Element}
 */
export function elementByTag(element, tagName) {
  const elements = element.getElementsByTagName(tagName);
  return elements[0] || null;
}


/**
 * Finds the first child element that satisfies the callback.
 * @param {!Element} parent
 * @param {function(!Element):boolean} callback
 * @return {?Element}
 */
export function childElement(parent, callback) {
  for (let child = parent.firstElementChild; child;
      child = child.nextElementSibling) {
    if (callback(child)) {
      return child;
    }
  }
  return null;
}

/**
 * @type {boolean|undefined}
 * @visiblefortesting
 */
let scopeSelectorSupported;

/**
 * @param {boolean|undefined} val
 * @visiblefortesting
 */
export function setScopeSelectorSupportedForTesting(val) {
  scopeSelectorSupported = val;
}

/**
 * @param {!Element} parent
 * @return {boolean}
 */
function isScopeSelectorSupported(parent) {
  try {
    parent.ownerDocument.querySelector(':scope');
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Finds the first child element that has the specified attribute.
 * @param {!Element} parent
 * @param {string} attr
 * @return {?Element}
 */
export function childElementByAttr(parent, attr) {
  if (scopeSelectorSupported == null) {
    scopeSelectorSupported = isScopeSelectorSupported(parent);
  }
  if (scopeSelectorSupported) {
    return parent.querySelector(':scope > [' + attr + ']');
  }
  return childElement(parent, el => {
    if (!el.hasAttribute(attr)) {
      return false;
    }
    return true;
  });
}


/**
 * Finds the first child element that has the specified tag name.
 * @param {!Element} parent
 * @param {string} tagName
 * @return {?Element}
 */
export function childElementByTag(parent, tagName) {
  if (scopeSelectorSupported == null) {
    scopeSelectorSupported = isScopeSelectorSupported(parent);
  }
  if (scopeSelectorSupported) {
    return parent.querySelector(':scope > ' + tagName);
  }
  tagName = tagName.toUpperCase();
  return childElement(parent, el => {
    return el.tagName == tagName;
  });
}


/**
 * Returns element data-param- attributes as url parameters key-value pairs.
 * e.g. data-param-some-attr=value -> {someAttr: value}.
 * @param {!Element} element
 * @return {!Object<string, string>}
 */
export function getDataParamsFromAttributes(element) {
  const attributes = element.attributes;
  const params = Object.create(null);
  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];
    const matches = attr.nodeName.match(/^data-param-(.+)/);
    if (matches) {
      const param = dashToCamelCase(matches[1]);
      params[param] = attr.nodeValue;
    }
  }
  return params;
}
