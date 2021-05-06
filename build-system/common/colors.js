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

/**@type {Record<keyof typeof colors, (input?: string | boolean | number | string[] | number[] | boolean []) => string>}   */
module.exports = Object.entries(colors).reduce((map, [key, formatter]) => {
  if (key === 'enabled') {
    map[key] = formatter;
    return map;
  }
  map[key] = function (input) {
    if (!input) {
      return `${input}`;
    }

    if (input instanceof Array) {
      return /** @type {function} */ (formatter)(input.join(' '));
    }

    return /** @type {function} */ (formatter)(input);
  };
  return map;
}, /**@type {Record<keyof typeof colors, (input?: string | boolean | number | string[] | number[] | boolean []) => string>}   */ ({}));
