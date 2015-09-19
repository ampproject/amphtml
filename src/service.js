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

/**
 * @param {!Window} win
 * @param {string} id
 * @param {function(!Window):!Object} factory Should create the service if it
 *     does not exist yet.
 * @return {!Object}
 */
export function getService(win, id, factory) {
  var services = win.services;
  if (!services) {
    services = win.services = {};
  }
  var s = services[id];
  if (!s) {
    return services[id] = factory(win);
  }
  return s;
}
