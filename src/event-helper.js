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
import {lastChildElement} from './dom';
import {user} from './log';

/** @const {string}  */
const LOAD_FAILURE_PREFIX = 'Failed to load:';

/** @const {string} */
export const MEDIA_LOAD_FAILURE_SRC_PROPERTY = '__AMP_MEDIA_LOAD_FAILURE_SRC';

/**
 * Returns a CustomEvent with a given type and detail; supports fallback for IE.
 * @param {!Window} win
 * @param {string} type
 * @param {!JsonObject|string|undefined|null} detail
 * @param {EventInit=} opt_eventInit
 * @return {!Event}
 */
export function createCustomEvent(win, type, detail, opt_eventInit) {
  const eventInit = /** @type {!CustomEventInit} */ ({detail});
  Object.assign(eventInit, opt_eventInit);
  // win.CustomEvent is a function on Edge, Chrome, FF, Safari but
  // is an object on IE 11.
  if (typeof win.CustomEvent == 'function') {
    return new win.CustomEvent(type, eventInit);
  } else {
    // Deprecated fallback for IE.
    const e = win.document.createEvent('CustomEvent');
    e.initCustomEvent(
      type,
      !!eventInit.bubbles,
      !!eventInit.cancelable,
      detail
    );
    return e;
  }
}

/**
 * Listens for the specified event on the element.
 * @param {!EventTarget} element
 * @param {string} eventType
 * @param {function(!Event)} listener
 * @param {Object=} opt_evtListenerOpts
 * @return {!UnlistenDef}
 */
export function listen(element, eventType, listener, opt_evtListenerOpts) {
  return internalListenImplementation(
    element,
    eventType,
    listener,
    opt_evtListenerOpts
  );
}

/**
 * Returns the data property of an event with the correct type.
 * @param {!Event|{data: !JsonObject}} event
 * @return {?JsonObject|string|undefined}
 */
export function getData(event) {
  return /** @type {?JsonObject|string|undefined} */ (event.data);
}

/**
 * Returns the detail property of an event with the correct type.
 * @param {!Event|{detail: !JsonObject}} event
 * @return {?JsonObject|string|undefined}
 */
export function getDetail(event) {
  return /** @type {?JsonObject|string|undefined} */ (event.detail);
}

/**
 * Listens for the specified event on the element and removes the listener
 * as soon as event has been received.
 * @param {!EventTarget} element
 * @param {string} eventType
 * @param {function(!Event)} listener
 * @param {Object=} opt_evtListenerOpts
 * @return {!UnlistenDef}
 */
export function listenOnce(element, eventType, listener, opt_evtListenerOpts) {
  let localListener = listener;
  const unlisten = internalListenImplementation(
    element,
    eventType,
    (event) => {
      try {
        localListener(event);
      } finally {
        // Ensure listener is GC'd
        localListener = null;
        unlisten();
      }
    },
    opt_evtListenerOpts
  );
  return unlisten;
}

/**
 * Returns  a promise that will resolve as soon as the specified event has
 * fired on the element.
 * @param {!EventTarget} element
 * @param {string} eventType
 * @param {Object=} opt_evtListenerOpts
 * @param {function(!UnlistenDef)=} opt_cancel An optional function that, when
 *     provided, will be called with the unlistener. This gives the caller
 *     access to the unlistener, so it may be called manually when necessary.
 * @return {!Promise<!Event>}
 */
export function listenOncePromise(
  element,
  eventType,
  opt_evtListenerOpts,
  opt_cancel
) {
  let unlisten;
  const eventPromise = new Promise((resolve) => {
    unlisten = listenOnce(element, eventType, resolve, opt_evtListenerOpts);
  });
  eventPromise.then(unlisten, unlisten);
  if (opt_cancel) {
    opt_cancel(unlisten);
  }
  return eventPromise;
}

/**
 * Whether the specified element/window has been loaded already.
 * @param {!Element|!Window} eleOrWindow
 * @return {boolean}
 */
export function isLoaded(eleOrWindow) {
  return !!(
    eleOrWindow.complete ||
    eleOrWindow.readyState == 'complete' ||
    (isHTMLMediaElement(eleOrWindow) && eleOrWindow.readyState > 0) ||
    // If the passed in thing is a Window, infer loaded state from
    //
    (eleOrWindow.document && eleOrWindow.document.readyState == 'complete')
  );
}

/**
 * Returns a promise that will resolve or fail based on the eleOrWindow's 'load'
 * and 'error' events. Optionally this method takes a timeout, which will reject
 * the promise if the resource has not loaded by then.
 * @param {T} eleOrWindow Supports both Elements and as a special case Windows.
 * @return {!Promise<T>}
 * @template T
 */
export function loadPromise(eleOrWindow) {
  let unlistenLoad;
  let unlistenError;
  if (isLoaded(eleOrWindow)) {
    return Promise.resolve(eleOrWindow);
  }
  const isMediaElement = isHTMLMediaElement(eleOrWindow);
  if (
    isMediaElement &&
    eleOrWindow[MEDIA_LOAD_FAILURE_SRC_PROPERTY] === eleOrWindow.currentSrc
  ) {
    return Promise.reject(eleOrWindow);
  }
  const loadingPromise = new Promise((resolve, reject) => {
    // Listen once since IE 5/6/7 fire the onload event continuously for
    // animated GIFs.
    if (isMediaElement) {
      // The following event can be triggered by the media or one of its
      // sources. Using capture is required as the media events do not bubble.
      unlistenLoad = listenOnce(eleOrWindow, 'loadedmetadata', resolve, {
        capture: true,
      });
    } else {
      unlistenLoad = listenOnce(eleOrWindow, 'load', resolve);
    }
    // Don't unlisten on error for Windows.
    if (!eleOrWindow.tagName) {
      return;
    }
    let errorTarget = eleOrWindow;
    // If the media element has no `src`, it will try to load the sources in
    // document order. If the last source errors, then the media element
    // loading errored.
    if (isMediaElement && !eleOrWindow.hasAttribute('src')) {
      errorTarget = lastChildElement(
        eleOrWindow,
        (child) => child.tagName === 'SOURCE'
      );
      if (!errorTarget) {
        return reject(new Error('Media has no source.'));
      }
    }
    unlistenError = listenOnce(errorTarget, 'error', reject);
  });

  return loadingPromise.then(
    () => {
      if (unlistenError) {
        unlistenError();
      }
      return eleOrWindow;
    },
    () => {
      if (unlistenLoad) {
        unlistenLoad();
      }
      failedToLoad(eleOrWindow);
    }
  );
}

/**
 * Emit error on load failure.
 * @param {!Element|!Window} eleOrWindow Supports both Elements and as a special
 *     case Windows.
 */
function failedToLoad(eleOrWindow) {
  // Mark the element as errored since some elements - like HTMLMediaElement
  // using HTMLSourceElement - do not provide any synchronous way to verify if
  // they already errored, even though the error event was already dispatched.
  if (isHTMLMediaElement(eleOrWindow)) {
    eleOrWindow[MEDIA_LOAD_FAILURE_SRC_PROPERTY] =
      eleOrWindow.currentSrc || true;
  }

  // Report failed loads as user errors so that they automatically go
  // into the "document error" bucket.
  let target = eleOrWindow;
  if (target && target.src) {
    target = target.src;
  }
  throw user().createError(LOAD_FAILURE_PREFIX, target);
}

/**
 * Returns true if the parameter is a HTMLMediaElement.
 * @param {!Element|!Window} eleOrWindow
 * @return {boolean}
 */
function isHTMLMediaElement(eleOrWindow) {
  return eleOrWindow.tagName === 'AUDIO' || eleOrWindow.tagName === 'VIDEO';
}

/**
 * Returns true if this error message is was created for a load error.
 * @param {string} message An error message
 * @return {boolean}
 */
export function isLoadErrorMessage(message) {
  return message.indexOf(LOAD_FAILURE_PREFIX) != -1;
}
