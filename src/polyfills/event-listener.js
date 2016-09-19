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

export function supportsOptions(win) {
  let supportsOptions = false;
  win.document.createElement('div').addEventListener('test', function() {}, {
    get passive() {
      supportsOptions = true;
      return false;
    },
    get capture() {
      supportsOptions = true;
      return false;
    },
    get once() {
      supportsOptions = true;
      return false;
    },
  });
  return supportsOptions;
}

export function polyfillOptionsSupport(win) {
  const eventPrototype = win.EventTarget.prototype;
  const originalAdd = eventPrototype.addEventListener;
  const originalRemove = eventPrototype.removeEventListener;

  eventPrototype.addEventListener = function(type, listener, options) {
    return originalAdd.call(this, type, listener, useCapture(options));
  };

  eventPrototype.removeEventListener = function(type, listener, options) {
    return originalRemove.call(this, type, listener, useCapture(options));
  };
}

export function useCapture(options) {
  if (typeof(options) === 'object') {
    return !!options.capture;
  } else {
    return !!options;
  }
}

/**
 *
 * @param {!Window} win
 */
export function install(win) {
  if (!supportsOptions(win)) {
    polyfillOptionsSupport(win);
  }
}
