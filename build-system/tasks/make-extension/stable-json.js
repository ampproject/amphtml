/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
 * @typedef {{
 *   original?: (undefined|string),
 *   normalized?: (undefined|string),
 *   value: Object,
 * }}
 */
let StableWhitespaceJsonArrayItemDef;

/**
 * Reads and writes a JSON file while maintaining existing whitespace.
 * It assumes a top array, whose items are all objects.
 */
class StableWhitespaceJsonArray {
  /**
   * @param {?string} source
   */
  constructor(source) {
    /** @private {!Array<StableWhitespaceJsonArrayItemDef>} */
    this.value_ = [];

    if (!source) {
      return;
    }

    const match = source.match(/^[\s\n]*\[([\s\S]+)\][\s\n]*/m);

    console./*OK*/ assert(
      match != null && match.length > 0,
      'Source does not have a top-level array'
    );

    // @ts-ignore
    const content = match[1].trim();

    const closers = {')': '(', '}': '{', ']': '['};
    const stack = {'(': 0, '{': 0, '[': 0, '"': 0};

    const isStackClosed = () =>
      !Object.keys(stack).find((k) => stack[k] % 2 > 0);

    let currentStart = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charAt(i);
      const closerOrOpener = closers[char] || char;
      if (stack.hasOwnProperty(closerOrOpener)) {
        stack[closerOrOpener]++;
      }
      const isEnding = i === content.length - 1;
      if ((isEnding || char === ',') && isStackClosed()) {
        const original = content.substr(
          currentStart,
          i - currentStart + (isEnding ? 1 : 0)
        );
        const value = JSON.parse(original);
        const normalized = JSON.stringify(value);
        this.value_.push(
          /** @type {StableWhitespaceJsonArrayItemDef} */ ({
            original,
            value,
            normalized,
          })
        );
        currentStart = i + 1;
      }
    }
  }

  /** @return {number} */
  get length() {
    return this.value_.length;
  }

  /**
   * @param {number} i
   * @return {Object}
   */
  get(i) {
    return {...this.value_[i].value};
  }

  /**
   * @param {number} i
   * @param {Object} value
   */
  set(i, value) {
    const normalized = JSON.stringify(value);
    if (this.value_[i].normalized !== normalized) {
      this.value_[i] = {value};
    }
  }

  /**
   * @param {number} i
   * @param {number} deleted
   * @param {Object} value
   */
  splice(i, deleted, value) {
    this.value_.splice(i, deleted, {value});
  }

  /** @param {Object} value */
  push(value) {
    this.value_.push({value});
  }

  /**
   * @param {function(Object):boolean} fn
   * @return {?Object}
   */
  find(fn) {
    const found = this.value_.find(({value}) => fn(value));
    return found ? found.value : null;
  }

  /** @return {string} */
  stringify() {
    return `[${this.value_
      .map(({original, value}) => original ?? JSON.stringify(value))
      .join(',')}]`;
  }

  /** @return {string} */
  toString() {
    return this.stringify();
  }

  /**
   * @param {function(*, *):number} sorter
   * @return {StableWhitespaceJsonArray}
   */
  sort(sorter) {
    this.value_.sort((a, b) => sorter(a.value, b.value));
    return this;
  }
}

module.exports = {StableWhitespaceJsonArray};
