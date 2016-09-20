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
 * Provides a polyfill so that the third argument to `addEventListener` can
 * always be an `options` object even for browsers that only support the boolean
 * `capture` as the third argument.
 *
 * See MDN for details on the new options argument for event listeners.
 * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
 *
 * Note that we do NOT polyfill the actual behaviour of different options. For
 * example, it is impossible to truly polyfill `passive` option, so the
 * individual options would only work in browsers that support them.
 *
 * @private Visible for testing.
 * @param {!Window} win
 */
export function polyfillOptionsSupport(win) {
  // In Safari, EventListener methods are on the Element prototype.
  const eventInterface = win.EventTarget || win.Element;
  const eventPrototype = eventInterface.prototype;
  const originalAdd = eventPrototype.addEventListener;
  const originalRemove = eventPrototype.removeEventListener;

  /**
   * @override
   */
  eventPrototype.addEventListener = function(type, listener, options) {
    return originalAdd.call(this, type, listener, useCapture(options));
  };

  /**
   * @override
   */
  eventPrototype.removeEventListener = function(type, listener, options) {
    return originalRemove.call(this, type, listener, useCapture(options));
  };
}

/**
 * Whether options-as-third-argument is already supported by the browser.
 * @private Visible for testing.
 * @param {!Window} win
 * @return {boolean}
 */
export function supportsOptions(win) {
  let supportsOptions = false;

  // If browser tries to access one of the known properties on the options
  // object, then it supports it.
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

/**
 * Decides whether capture argument should be true/false based on the value of
 * then given options argument.
 * @param {*} options
 */
function useCapture(options) {
  if (typeof options === 'object' && options) {
    return !!(options.capture);
  } else {
    return options;
  }
}

/**
 * @param {!Window} win
 */
export function install(win) {
  if (!supportsOptions(win)) {
    polyfillOptionsSupport(win);
  }
}
