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

  /**
   * A prefix is defined as non-mask characters at the beginning of a mask
   * definition.
   */
  const prefixRe = /^([^\*\[\]a\?9\\]+)[\*\[\]a\?9\\]/i;

  Inputmask.extendAliases({
    'custom': {
      /**
       * @param {string} value
       * @param {!Object} opts
       */
      onBeforeMask(value, opts) {
        let processedValue = value.replace(/^0{1,2}/, '').replace(/[\s]/g, '');

        if (typeof opts.mask == 'string') {
          const processedMask = opts.mask.replace(/[\s]/g, '');
          const match = prefixRe.exec(processedMask);
          const prefix = match && match[1];
          if (processedValue.indexOf(prefix) == 0) {
            processedValue = processedValue.replace(prefix, '');
          }
        }

        return processedValue;
      },
    },
  });
}
