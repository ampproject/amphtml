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

/**
 * Installs an alias used by amp-inputmask that fixes a problem where
 * the user copy-pastes a value into a field with an inputmask that has a
 * literal prefix. e.g.
 * <paste> +1(234)567-8910 -> +1(123)456-7891
 * @param {!Object} Inputmask
 */
export function factory(Inputmask) {
  Inputmask.extendAliases({
    'custom': {
      prefixes: {},
      mask(opts) {
        return opts.customMask;
      },
      /**
       * @param {string} value
       * @param {!Object} opts
       */
      onBeforeMask(value, opts) {
        const processedValue = value.replace(/^0{1,2}/, '').replace(/[\s]/g, '');
        const {mask} = opts;

        if (typeof mask == 'string') {
          return removePrefix(processedValue, mask);
        }

        if (mask.length > 0) {
          const processedValues = mask
              .map(m => removePrefix(processedValue, m))
              .sort((a, b) => a.length - b.length);
          return processedValues[0];
        }

        return processedValue;
      },
    },
  });

  /**
   * A prefix is defined as non-mask characters at the beginning of a mask
   * definition.
   */
  const prefixRe = /^([^\*\[\]a\?9\\]+)[\*\[\]a\?9\\]/i;

  /**
   * Remove a mask prefix from the input value
   * TODO(cvializ): move the prefix breakdown into an init value.
   * @param {string} value
   * @param {string} mask
   */
  function removePrefix(value, mask) {
    const processedMask = mask.replace(/[\s]/g, '');
    const match = prefixRe.exec(processedMask);
    const originalPrefix = match && match[1];

    if (!originalPrefix) {
      return value;
    }

    // Break the prefix down into smaller prefix chunks.
    // The user can paste a value with any subset of the prefix added.
    const stack = [originalPrefix];
    const prefixes = {};
    while (stack.length) {
      const prefix = stack.pop();

      if (value.indexOf(prefix) == 0) {
        prefixes[prefix] = true;
      }

      if (prefix.length > 1) {
        stack.push(prefix.slice(1));
        stack.push(prefix.slice(0, -1));
      }
    }

    const longestPrefix = Object.keys(prefixes)
        .sort((a, b) => b.length - a.length)[0];
    if (longestPrefix) {
      return value.slice(longestPrefix.length);
    } else {
      return value;
    }
  }
}
