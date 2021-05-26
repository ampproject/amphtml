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

import {isElement, isString} from '../types';

/** @type {!Array<string>} */
const excludedTags = ['script', 'style'];

/** @type {!Array<string>} */
const allowedAmpTags = [
  'amp-accordion',
  'amp-app-banner',
  'amp-carousel',
  'amp-fit-text',
  'amp-form',
  'amp-selector',
  'amp-sidebar',
];

/** @type {!Array<string>} */
const allowedAttributes = [
  'action',
  'alt',
  'class',
  'disabled',
  'height',
  'href',
  'id',
  'name',
  'placeholder',
  'readonly',
  'src',
  'tabindex',
  'title',
  'type',
  'value',
  'width',
];

/**
 * Returns content of HTML node
 * @param {!Window} win
 * @param {string} selector - CSS selector of the node to take content from
 * @param {!Array<string>} attrs - tag attributes to be left in the stringified
 * HTML
 * @return {string}
 */
export function getHtml(win, selector, attrs) {
  const root = win.document.querySelector(selector);
  const result = [];

  if (root) {
    appendToResult(root, attrs, result);
  }

  return result.join('').replace(/\s{2,}/g, ' ');
}

/**
 * @param {!Element} node - node to take content from
 * @param {!Array<string>} attrs - tag attributes to be left in the stringified HTML
 * @param {!Array<string>} result
 */
function appendToResult(node, attrs, result) {
  const stack = [node];
  const allowedAttrs = attrs.filter((attr) => allowedAttributes.includes(attr));

  while (stack.length > 0) {
    node = stack.pop();

    if (isString(node)) {
      result.push(node);
    } else if (node.nodeType === Node.TEXT_NODE) {
      result.push(node.textContent);
    } else if (isElement(node) && isApplicableNode(node)) {
      appendOpenTag(node, allowedAttrs, result);
      stack.push(`</${node.tagName.toLowerCase()}>`);

      for (let child = node.lastChild; child; child = child.previousSibling) {
        stack.push(child);
      }
    }
  }
}

/**
 * Returns true for allowed AMP tags and non-AMP tags except <script>/<style>
 * @param {!Element} node
 * @return {boolean}
 */
function isApplicableNode(node) {
  const tagName = node.tagName.toLowerCase();

  if (tagName.startsWith('amp-')) {
    return !!(allowedAmpTags.includes(tagName) && node.textContent);
  } else {
    return !!(!excludedTags.includes(tagName) && node.textContent);
  }
}

/**
 * Constructs an open-tag with the provided attributes.
 * @param {!Element} node
 * @param {!Array<string>} attrs
 * @param {Array<string>} result
 */
function appendOpenTag(node, attrs, result) {
  result.push(`<${node.tagName.toLowerCase()}`);

  attrs.forEach((attr) => {
    if (node.hasAttribute(attr)) {
      result.push(` ${attr}="${node.getAttribute(attr)}"`);
    }
  });

  result.push('>');
}
