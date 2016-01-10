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
  return elements.length > 0 ? elements[0] : null;
}


/**
 * Finds the first child element that satisfies the callback.
 * @param {!Element} parent
 * @param {function(!Element):boolean} callback
 * @return {?Element}
 */
export function childElement(parent, callback) {
  const children = parent.children;
  for (let i = 0; i < children.length; i++) {
    if (callback(children[i])) {
      return children[i];
    }
  }
  return null;
}


/**
 * Finds the first child element that has the specified attribute, optionally
 * with a value.
 * @param {!Element} parent
 * @param {string} attr
 * @param {string=} opt_value
 * @return {?Element}
 */
export function childElementByAttr(parent, attr, opt_value) {
  return childElement(parent, el => {
    if (!el.hasAttribute(attr)) {
      return false;
    }
    if (opt_value !== undefined && el.getAttribute(attr) != opt_value) {
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
  tagName = tagName.toUpperCase();
  return childElement(parent, el => {
    return el.tagName == tagName;
  });
}
