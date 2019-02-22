/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {cssEscape} from '../third_party/css-escape/css-escape';
import {devAssert} from './log';

/**
 * Asserts that name is just an alphanumeric word, and does not contain
 * advanced CSS selector features like attributes, psuedo-classes, class names,
 * nor ids.
 * @param {string} name
 */
export function assertIsName(name) {
  devAssert(/^[\w-]+$/.test(name));
}


/**
 * @type {boolean|undefined}
 */
let scopeSelectorSupported;

/**
 * @param {boolean|undefined} val
 * @visibleForTesting
 */
export function setScopeSelectorSupportedForTesting(val) {
  scopeSelectorSupported = val;
}

/**
 * Test that the :scope selector is supported and behaves correctly.
 * @param {!Element} el
 * @return {boolean}
 */
export function isScopeSelectorSupported(el) {
  if (scopeSelectorSupported !== undefined) {
    return scopeSelectorSupported;
  }

  return (scopeSelectorSupported = testScopeSelector(el));
}

/**
 * Test that the :scope selector is supported and behaves correctly.
 * @param {!Element} el
 * @return {boolean}
 */
function testScopeSelector(el) {
  try {
    const doc = el.ownerDocument;
    const testElement = doc.createElement('div');
    const testChild = doc.createElement('div');
    testElement.appendChild(testChild);
    // NOTE(cvializ, #12383): Firefox's implementation is incomplete,
    // therefore we test actual functionality of`:scope` as well.
    return testElement./*OK*/querySelector(':scope div') === testChild;
  } catch (e) {
    return false;
  }
}


/**
 * Finds the next non-backslash-escaped char in string, starting the search
 * after index.
 *
 * ```
 *   next('div, a, span', ',', 0);
 *   // => 3
 *   next('div, a, span', ',', 1);
 *   // => 3
 *   next('div, a, span', ',', 3);
 *   // => 6
 *   next('div\\, a, span', ',', 0);
 *   // => 7
 *   next('div\\\\, a, span', ',', 0);
 *   // => 5
 *   next('div\\\\\\, a, span', ',', 0);
 *   // => 9
 *   next('div\\\\\\\\, a, span', ',', 0);
 *   // => 7
 * ```
 *
 * @param {string} str
 * @param {string} char
 * @param {number} index
 * @return {number}
 */
function next(str, char, index) {
  while (index >= 0) {
    index = str.indexOf(char, index + 1);
    let i = index;
    while (i > 0 && str[i - 1] === '\\') {
      i--;
    }
    if ((index - i) % 2 === 0) {
      return index;
    }
  }
  return -1;
}

/**
 * Parses selector to extract each individual selector.
 *
 * ```
 *   selectors('div')
 *   // => ['div']
 *   selectors('div,ul')
 *   // => ['div', 'ul']
 *   selectors('div , ul')
 *   // => ['div', 'ul']
 *   selectors('div[attr="contains,comma"]')
 *   // => ['div[attr="contains,comma"]']
 *   selectors('div:is(.first, .second)')
 *   // => ['div:is(.first, .second)']
 * ```
 *
 * @param {string} selector
 * @return {!Array<string>}
 */
export function selectors(selector) {
  let brackets = 0;
  let parentheses = 0;

  const selectors = [];
  let start = 0;
  for (let i = 0; i < selector.length; i++) {
    const char = selector[i];
    switch (char) {
      case '[':
        brackets++;
        break;
      case ']':
        brackets--;
        break;

      case '(':
        parentheses++;
        break;
      case ')':
        parentheses--;
        break;

      case '"':
      case "'":
        i = next(selector, char, i);
        break;

      case ',':
        if (brackets === 0 && parentheses === 0) {
          selectors.push(selector.substring(start, i).trim());
          start = i + 1;
        }
    }
  }
  selectors.push(selector.substring(start).trim());

  return selectors;
}

/**
 * Prefixes a selector for ancestor selection. Splits in subselectors and
 * applies prefix to each.
 *
 * e.g.
 * ```
 *   prependSelectorsWith('div', '.i-amphtml-scoped ');
 *   // => '.i-amphtml-scoped div'
 *   prependSelectorsWith('div, ul', ':scope ');
 *   // => ':scope div, :scope ul'
 *   prependSelectorsWith('div, ul', 'article > ');
 *   // => 'article > div, article > ul'
 *   prependSelectorsWith('div, ul', 'no-space');
 *   // => 'no-spacediv, no-spaceul'
 * ```
 *
 * @param {string} selector
 * @param {string} distribute
 * @return {string}
 */
export function prependSelectorsWith(selector, distribute) {
  return selectors(selector).map(s => distribute + s).join(',');
}

/**
 * Escapes an ident (ID or a class name) to be used as a CSS selector.
 *
 * See https://drafts.csswg.org/cssom/#serialize-an-identifier.
 *
 * @param {string} ident
 * @return {string}
 */
export function escapeCssSelectorIdent(ident) {
  return cssEscape(ident);
}

/**
 * Escapes an ident in a way that can be used by :nth-child() psuedo-class.
 *
 * See https://github.com/w3c/csswg-drafts/issues/2306.
 *
 * @param {string|number} ident
 * @return {string}
 */
export function escapeCssSelectorNth(ident) {
  const escaped = String(ident);
  // Ensure it doesn't close the nth-child psuedo class.
  devAssert(escaped.indexOf(')') === -1);
  return escaped;
}

