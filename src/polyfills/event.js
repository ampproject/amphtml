/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
 * @constructor
 */
function Event(name, params) {
  if (!name) {
    throw new TypeError(
      "Failed to construct 'Event': 1 argument required but only 0 present",
      'event.js',
      20
    );
  }
  params = params || {bubbles: false, cancelable: false};
  const evt = self.document.createEvent('Event');
  evt.initEvent(
      name,
      params.bubbles,
      params.cancelable
  );
  return evt;
}

/**
 * Sets the Event polyfill if it does not exist.
 * @param {!Window} win
 */
export function install(win) {
  // win.Event is a function on Edge, Chrome, FF, Safari but
  // is an object on IE 11.
  if (typeof win.Event !== 'function') {

    // supports >= IE 9. Below IE 9, window.Event.prototype is undefined
    Event.prototype = win.Event.prototype;

    win.Object.defineProperty(win, 'Event', {
      configurable: false,
      enumerable: false,
      value: Event,
      writable: false,
    });
  }
}
