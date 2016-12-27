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

/** @type {String[]} */
const excludedTags = ['amp-analytics', 'amp-experiment', 'amp-bind-state'];

/**
 * Returns content of HTML node
 * @param {String} selector
 * @param {String[]} attrs
 */
export function getHTML (selector, attrs) {
    const root = document.querySelector(selector);
    let result = [];

    if (root) {
        appendToResult(root, attrs, result);
    }

    return result.join('').replace(/\s{2,}/g, ' ');
}

/**
 * @param {HTMLElement} node
 * @param {String[]} attrs
 * @param {String[]} result
 */
function appendToResult (node, attrs, result) {
    let stack = [];

    if (!node) {
        return result;
    }

    stack.push(node);

    while (stack.length > 0) {
        node = stack.pop();

        if (typeof node === 'string') {
            result.push(node);
        } else if (node && node.nodeType === Node.TEXT_NODE) {
            result.push(node.textContent);
        } else if (node && excludedTags.indexOf(node.tagName.toLowerCase()) === -1 && node.innerText) {
            appendOpenTag(node, attrs, result);
            stack.push(`</${node.tagName.toLowerCase()}>`);

            if (node.childNodes && node.childNodes.length > 0) {
                for (let i = node.childNodes.length - 1; i >= 0; i--) {
                    stack.push(node.childNodes[i]);
                }
            }
        }
    }
}

/**
 *
 * @param {HTMLElement} node
 * @param {String[]} attrs
 * @param {String[]} result
 */
function appendOpenTag (node, attrs, result) {
    result.push(`<${node.tagName.toLowerCase()}`);

    attrs.forEach(function (attr) {
        if (node.hasAttribute(attr)) {
            result.push(` ${attr}="${node.getAttribute(attr)}"`);
        }
    });

    result.push('>');
}
