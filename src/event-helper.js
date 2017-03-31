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

import {internalListenImplementation} from './event-helper-listen';
import {timerFor} from './services';
import {user} from './log';

/** @const {string}  */
const LOAD_FAILURE_PREFIX = 'Failed to load:';

/**
 * Returns a CustomEvent with a given type and detail; supports fallback for IE.
 * @param {!Window} win
 * @param {string} type
 * @param {Object} detail
 * @return {!Event}
 */
export function createCustomEvent(win, type, detail) {
  if (win.CustomEvent) {
    return new win.CustomEvent(type, {detail});
  } else {
    // Deprecated fallback for IE.
    const e = win.document.createEvent('CustomEvent');
    e.initCustomEvent(
        type, /* canBubble */ false, /* cancelable */ false, detail);
    return e;
  }
}

/**
 * Listens for the specified event on the element.
 * @param {!EventTarget} element
 * @param {string} eventType
 * @param {function(!Event)} listener
 * @param {boolean=} opt_capture
 * @return {!UnlistenDef}
 */
export function listen(element, eventType, listener, opt_capture) {
  return internalListenImplementation(
      element, eventType, listener, opt_capture);
}


/**
 * Listens for the specified event on the element and removes the listener
 * as soon as event has been received.
 * @param {!EventTarget} element
 * @param {string} eventType
 * @param {function(!Event)} listener
 * @param {boolean=} opt_capture
 * @return {!UnlistenDef}
 */
export function listenOnce(element, eventType, listener, opt_capture) {
  let localListener = listener;
  const unlisten = internalListenImplementation(element, eventType, event => {
    try {
      localListener(event);
    } finally {
      // Ensure listener is GC'd
      localListener = null;
      unlisten();
    }
  }, opt_capture);
  return unlisten;
}


/**
 * Returns  a promise that will resolve as soon as the specified event has
 * fired on the element. Optionally, opt_timeout can be specified that will
 * reject the promise if the event has not fired by then.
 * @param {!EventTarget} element
 * @param {string} eventType
 * @param {boolean=} opt_capture
 * @param {number=} opt_timeout
 * @return {!Promise<!Event>}
 */
export function listenOncePromise(element, eventType, opt_capture,
    opt_timeout) {
  let unlisten;
  const eventPromise = new Promise((resolve, unusedReject) => {
    unlisten = listenOnce(element, eventType, resolve, opt_capture);
  });
  return racePromise_(eventPromise, unlisten, undefined, opt_timeout);
}


/**
 * Whether the specified element/window has been loaded already.
 * @param {!Element|!Window} eleOrWindow
 * @return {boolean}
 */
export function isLoaded(eleOrWindow) {
  return !!(eleOrWindow.complete || eleOrWindow.readyState == 'complete'
      // If the passed in thing is a Window, infer loaded state from
      //
      || (eleOrWindow.document
          && eleOrWindow.document.readyState == 'complete'));
}

/**
 * Returns a promise that will resolve or fail based on the eleOrWindow's 'load'
 * and 'error' events. Optionally this method takes a timeout, which will reject
 * the promise if the resource has not loaded by then.
 * @param {T} eleOrWindow Supports both Elements and as a special case Windows.
 * @param {number=} opt_timeout
 * @return {!Promise<T>}
 * @template T
 */
export function loadPromise(eleOrWindow, opt_timeout) {
  let unlistenLoad;
  let unlistenError;
  if (isLoaded(eleOrWindow)) {
    return Promise.resolve(eleOrWindow);
  }
  let loadingPromise = new Promise((resolve, reject) => {
    // Listen once since IE 5/6/7 fire the onload event continuously for
    // animated GIFs.
    const tagName = eleOrWindow.tagName;
    if (tagName === 'AUDIO' || tagName === 'VIDEO') {
      unlistenLoad = listenOnce(eleOrWindow, 'loadstart', resolve);
    } else {
      unlistenLoad = listenOnce(eleOrWindow, 'load', resolve);
    }
    // For elements, unlisten on error (don't for Windows).
    if (tagName) {
      unlistenError = listenOnce(eleOrWindow, 'error', reject);
    }
  });
  loadingPromise = loadingPromise.then(() => eleOrWindow, failedToLoad);
  return racePromise_(loadingPromise, unlistenLoad, unlistenError,
      opt_timeout);
}

/**
 * Emit error on load failure.
 * @param {*} event
 */
function failedToLoad(event) {
  // Report failed loads as user errors so that they automatically go
  // into the "document error" bucket.
  let target = event.target;
  if (target && target.src) {
    target = target.src;
  }
  throw user().createError(LOAD_FAILURE_PREFIX, target);
}

/**
 * Returns true if this error message is was created for a load error.
 * @param {string} message An error message
 * @return {boolean}
 */
export function isLoadErrorMessage(message) {
  return message.indexOf(LOAD_FAILURE_PREFIX) != -1;
}

/**
 * @param {!Promise<TYPE>} promise
 * @param {UnlistenDef|undefined} unlisten1
 * @param {UnlistenDef|undefined} unlisten2
 * @param {number|undefined} timeout
 * @return {!Promise<TYPE>}
 * @template TYPE
 */
function racePromise_(promise, unlisten1, unlisten2, timeout) {
  let racePromise;
  if (timeout === undefined) {
    // Timeout is not specified: return promise.
    racePromise = promise;
  } else {
    // Timeout has been specified: add a timeout condition.
    racePromise = timerFor(self).timeoutPromise(timeout || 0, promise);
  }
  if (unlisten1) {
    racePromise.then(unlisten1, unlisten1);
  }
  if (unlisten2) {
    racePromise.then(unlisten2, unlisten2);
  }
  return racePromise;
}
