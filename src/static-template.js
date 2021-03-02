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

import {pureDevAssert as devAssert} from './core/assert';
import {map} from './utils/object.js';

let htmlContainer;
let svgContainer;

/**
 * Creates the html helper for the doc.
 *
 * @param {!Element|!Document} nodeOrDoc
 * @return {function(!Array<string>):!Element}
 */
export function htmlFor(nodeOrDoc) {
  const doc = nodeOrDoc.ownerDocument || nodeOrDoc;
  if (!htmlContainer || htmlContainer.ownerDocument !== doc) {
    htmlContainer = doc.createElement('div');
  }

  return html;
}

/**
 * Creates the svg helper for the doc.
 *
 * @param {!Element|!Document} nodeOrDoc
 * @return {function(!Array<string>):!Element}
 */
export function svgFor(nodeOrDoc) {
  const doc = nodeOrDoc.ownerDocument || nodeOrDoc;
  if (!svgContainer || svgContainer.ownerDocument !== svgContainer) {
    svgContainer = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
  }

  return svg;
}

/**
 * A tagged template literal helper to generate static SVG trees.
 * This must be used as a tagged template, ie
 *
 * ```
 * const circle = svg`<circle cx="60" cy="60" r="22"></circle>`;
 * ```
 *
 * Only the root element and its subtree will be returned. DO NOT use this to
 * render subtree's with dynamic content, it WILL result in an error!
 *
 * @param {!Array<string>} strings
 * @return {!Element}
 */
function svg(strings) {
  return createNode(svgContainer, strings);
}

/**
 * A tagged template literal helper to generate static DOM trees.
 * This must be used as a tagged template, ie
 *
 * ```
 * const div = html`<div><span></span></div>`;
 * ```
 *
 * Only the root element and its subtree will be returned. DO NOT use this to
 * render subtree's with dynamic content, it WILL result in an error!
 *
 * @param {!Array<string>} strings
 * @return {!Element}
 */
function html(strings) {
  return createNode(htmlContainer, strings);
}

/**
 * Helper used by html and svg string literal functions.
 * @param {!Element} container
 * @param {!Array<string>} strings
 * @return {!Element}
 */
function createNode(container, strings) {
  devAssert(strings.length === 1, 'Improper html template tag usage.');
  container./*OK*/ innerHTML = strings[0];

  const el = container.firstElementChild;
  devAssert(el, 'No elements in template');
  devAssert(!el.nextElementSibling, 'Too many root elements in template');

  // Clear to free memory.
  container.removeChild(el);

  return el;
}

/**
 * Queries an element for all elements with a "ref" attribute, removing
 * the attribute afterwards.
 * Returns a named map of all ref elements.
 *
 * @param {!Element} root
 * @return {!Object<string, !Element>}
 */
export function htmlRefs(root) {
  const elements = root.querySelectorAll('[ref]');
  const refs = map();

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const ref = devAssert(element.getAttribute('ref'), 'Empty ref attr');
    element.removeAttribute('ref');
    devAssert(refs[ref] === undefined, 'Duplicate ref');
    refs[ref] = element;
  }

  return refs;
}
