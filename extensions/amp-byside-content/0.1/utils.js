/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 * @param {Function} func
 * @param {number} wait
 * @param {boolean=} immediate
 */
export function debounce(func, wait, immediate) {
  let timeout;
  return function() {
	  const context = this, args = arguments;
	  clearTimeout(timeout);
	  timeout = setTimeout(function() {
      timeout = null;
      if (!immediate) { func.apply(context, args); }
	  }, wait);
	  if (immediate && !timeout) { func.apply(context, args); }
  };
}

/**
 *
 * Gets an element creator using a given document to create elements.
 * @export getElementCreator
 * @param {Document} document
 * @returns {!Function}
 */
export function getElementCreator(document) {
  return function createElement(name, className, children) {
    const element = document.createElement(name);
    element.className = className;
    appendChildren(element, children);
    return element;
  };
}

function appendChildren(element, children) {
  children = (!children) ? [] : Array.isArray(children) ? children : [children];
  children.forEach(child => element.appendChild(child));
}
