/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
 * Send messages to parent frame. These should not contain user data.
 * @param {string} type Type of messages
 * @param {*=} opt_object Data for the message.
 */
export function nonSensitiveDataPostMessage(type, opt_object) {
  if (window.parent == window) {
    return;  // Nothing to do.
  }
  const object = opt_object || {};
  object.type = type;
  object.sentinel = 'amp-3p';
  window.parent./*OK*/postMessage(object,
      window.context.location.origin);
}

/**
 * Listen to message events from document frame.
 * @param {string} type Type of messages
 * @param {function(*)} callback Called with data payload of message.
 * @return {function()} function to unlisten for messages.
 */
export function listenParent(type, callback) {
  const listener = function(event) {
    if (event.source != window.parent ||
        event.origin != window.context.location.origin ||
        !event.data ||
        event.data.sentinel != 'amp-3p' ||
        event.data.type != type) {
      return;
    }
    callback(event.data);
  };
  window.addEventListener('message', listener);
  return function() {
    window.removeEventListener('message', listener);
  };
}
