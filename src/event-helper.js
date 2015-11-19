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

import {timer} from './timer';


/**
 * Listens for the specified event on the element and removes the listener
 * as soon as event has been received.
 * @param {!EventTarget} element
 * @param {string} eventType
 * @param {function(Event)} listener
 * @param {boolean=} opt_capture
 * @return {!Unlisten}
 */
export function listenOnce(element, eventType, listener, opt_capture) {
  const capture = opt_capture || false;
  let unlisten;
  const proxy = event => {
    listener(event);
    unlisten();
  };
  unlisten = () => {
    element.removeEventListener(eventType, proxy, capture);
  };
  element.addEventListener(eventType, proxy, capture);
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
  const eventPromise = new Promise((resolve, reject) => {
    unlisten = listenOnce(element, eventType, resolve, opt_capture);
  });
  return racePromise_(eventPromise, unlisten, opt_timeout);
}


/**
 * Whether the specified element has been loaded already.
 * @param {!Element} element
 * @return {boolean}
 */
export function isLoaded(element) {
  return element.complete || element.readyState == 'complete';
}


/**
 * Returns a promise that will resolve or fail based on the element's 'load'
 * and 'error' events. Optionally this method takes a timeout, which will reject
 * the promise if the resource has not loaded by then.
 * @param {!Element} element
 * @param {number=} opt_timeout
 * @return {!Promise<!Element>}
 */
export function loadPromise(element, opt_timeout) {
  let unlistenLoad;
  let unlistenError;
  const loadingPromise = new Promise((resolve, reject) => {
    if (isLoaded(element)) {
      resolve(element);
    } else {
      // Listen once since IE 5/6/7 fire the onload event continuously for
      // animated GIFs.
      if (element.tagName === 'AUDIO' || element.tagName === 'VIDEO') {
        unlistenLoad = listenOnce(element, 'loadstart', () => resolve(element));
      } else {
        unlistenLoad = listenOnce(element, 'load', () => resolve(element));
      }
      unlistenError = listenOnce(element, 'error', reject);
    }
  });
  return racePromise_(loadingPromise, () => {
    // It's critical that all listeners are removed.
    if (unlistenLoad) {
      unlistenLoad();
    }
    if (unlistenError) {
      unlistenError();
    }
  }, opt_timeout);
}


/**
 * @param {!Promise<TYPE>} promise
 * @param {Unlisten|undefined} unlisten
 * @param {number|undefined} timeout
 * @return {!Promise<TYPE>}
 * @template TYPE
 */
function racePromise_(promise, unlisten, timeout) {
  let racePromise;
  if (timeout === undefined) {
    // Timeout is not specified: return promise.
    racePromise = promise;
  } else {
    // Timeout has been specified: add a timeout condition.
    racePromise = timer.timeoutPromise(timeout || 0, promise);
  }
  if (!unlisten) {
    return racePromise;
  }
  return racePromise.then(result => {
    unlisten();
    return result;
  }, reason => {
    unlisten();
    throw reason;
  });
}
