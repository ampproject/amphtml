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
const colors = require('kleur/colors');

/**
 * @fileoverview kleur/color provides a collection of untyped color formatting
 * functions. This file provides a generically typed wrapper for each of them in
 * order to satisfy our type checks without changing any functionality. For more
 * info, see https://github.com/lukeed/kleur/blob/master/colors.{mjs,d.ts}.
 */
module.exports = Object.entries(colors).reduce((map, [key, formatter]) => {
  map[key] =
    typeof formatter == 'function'
      ? (txt) => /** @type {function} */ (formatter)(txt)
      : formatter;
  return map;
}, /**@type {Record<keyof typeof colors, (input?: *) => string>} */ ({}));
