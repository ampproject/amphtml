/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {isArray, isObject} from '../../../src/types';
/**
 * Format data for pingback.
 * @param {any} obj
 * @return {string}
 */
export function stringifyForPingback(obj) {
  // If there's json for pingback use that if not use json if not go deeper
  if (obj.jsonForPingback) {
    return JSON.stringify(obj.jsonForPingback());
  } else if (obj.json) {
    return JSON.stringify(obj.json());
  }
  if (isObject(obj)) {
    const result = {};
    Object.keys(obj).forEach((key) => {
      result[key] = stringifyForPingback(obj[key]);
    });
    return JSON.stringify(result);
  }
  if (isArray(obj)) {
    const objArray = [];
    obj.forEach((element) => {
      objArray.push(stringifyForPingback(element));
    });
    return '[' + objArray.join(',') + ']';
  }
  return JSON.stringify(obj);
}
