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

import {dict} from '../../../src/utils/object';

/**
 * Installs an alias used by amp-inputmask that fixes a problem where
 * the user copy-pastes a value into a field with an inputmask that has a
 * literal prefix. e.g.
 * <paste> +1(234)567-8910 -> +1(123)456-7891
 * @param {!Object} Inputmask
 */
export function factory(Inputmask) {
  Inputmask.extendAliases(dict({
    'custom': {
      'prefixes': [],
      /**
       * @param {!JsonObject} opts
       * @return {!Object}
       */
      'mask': function(opts) {
        const customMask = opts['customMask'];
        opts['prefixes'] = getPrefixSubsets(customMask);

        return customMask;
      },
      /**
       * @param {string} value
       * @param {!JsonObject} opts
       * @return {string}
       */
      'onBeforeMask': function(value, opts) {
        const processedValue = value.replace(/^0{1,2}/, '').replace(/[\s]/g, '');
        const prefixes = opts['prefixes'];

        return removePrefix(processedValue, prefixes);
      },
    },
  }));

  /**
   * A prefix is defined as non-mask characters at the beginning of a mask
   * definition.
   */
  const prefixRe = /^([^\*\[\]a\?9\\]+)[\*\[\]a\?9\\]/i;

  /**
   * Gets a map of substrings of the mask prefixes.
   * e.g. +1(000)000-0000" -> ["+1(", "+1", "+", "1(", ...]
   * @param {!Array<string>|string} mask
   * @return {!Array<string>}
   */
  function getPrefixSubsets(mask) {
    const masks = (typeof mask == 'string' ? [mask] : mask);

    const prefixes = {};
    for (let i = 0; i < masks.length; i++) {
      const prefix = getMaskPrefix(masks[i]);
      if (prefix.length == 0) {
        continue;
      }

      const stack = [prefix];
      while (stack.length) {
        const prefix = stack.pop();
        prefixes[prefix] = true;

        if (prefix.length > 1) {
          stack.push(prefix.slice(1));
          stack.push(prefix.slice(0, -1));
        }
      }
    }

    return Object.keys(prefixes);
  }

  /**
   * Gets any literal non-variable mask characters from the
   * beginning of the mask string
   * e.g. "+1(000)000-0000" -> "+1("
   * @param {string} mask
   * @return {string}
   */
  function getMaskPrefix(mask) {
    const processedMask = mask.replace(/[\s]/g, '');
    const match = prefixRe.exec(processedMask);
    const prefix = (match && match[1]) || '';

    return prefix;
  }

  /**
   * Remove a mask prefix from the input value
   * @param {string} value
   * @param {!Array<string>} prefixes
   * @return {string}
   */
  function removePrefix(value, prefixes) {
    const longestPrefix = prefixes
        .filter(prefix => value.indexOf(prefix) == 0)
        .sort((a, b) => b.length - a.length)[0];

    if (longestPrefix) {
      return value.slice(longestPrefix.length);
    } else {
      return value;
    }
  }
}
