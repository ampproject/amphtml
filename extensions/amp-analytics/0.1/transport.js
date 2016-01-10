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

import {assertHttpsUrl} from '../../../src/url';
import {log} from '../../../src/log';
import {loadPromise} from '../../../src/event-helper';

/** @const {string} */
const TAG_ = 'AmpAnalytics.Transport';

/**
 * @param {!Window} win
 * @param {string} request
 * @param {!Object<string, string>} transportOptions
 */
export function sendRequest(win, request, transportOptions) {
  assertHttpsUrl(request);
  if (transportOptions['beacon'] &&
      Transport.sendRequestUsingBeacon(win, request)) {
    return;
  }
  if (transportOptions['xhrpost'] &&
      Transport.sendRequestUsingXhr(win, request)) {
    return;
  }
  if (transportOptions['image']) {
    Transport.sendRequestUsingImage(win, request);
    return;
  }
  log.warn(TAG_, 'Failed to send request', request, transportOptions);
}

/**
 * @visibleForTesting
 */
export class Transport {

  /**
   * @param {!Window} unusedWin
   * @param {string} request
   */
  static sendRequestUsingImage(unusedWin, request) {
    const image = new Image();
    image.src = request;
    image.width = 1;
    image.height = 1;
    loadPromise(image).then(() => {
      log.fine(TAG_, 'Sent image request', request);
    }).catch(() => {
      log.warn(TAG_, 'Failed to send image request', request);
    });
  }

  /**
   * @param {!Window} win
   * @param {string} request
   * @return {boolean} True if this browser supports navigator.sendBeacon.
   */
  static sendRequestUsingBeacon(win, request) {
    if (!win.navigator.sendBeacon) {
      return false;
    }
    win.navigator.sendBeacon(request, '');
    log.fine(TAG_, 'Sent beacon request', request);
    return true;
  }

  /**
   * @param {!Window} win
   * @param {string} request
   * @return {boolean} True if this browser supports cross-domain XHR.
   */
  static sendRequestUsingXhr(win, request) {
    if (!win.XMLHttpRequest) {
      return false;
    }
    const xhr = new win.XMLHttpRequest();
    if (!('withCredentials' in xhr)) {
      return false; // Looks like XHR level 1 - CORS is not supported.
    }
    xhr.open('POST', request, true);
    xhr.withCredentials = true;

    // Prevent pre-flight HEAD request.
    xhr.setRequestHeader('Content-Type', 'text/plain');

    xhr.onreadystatechange = () => {
      if (xhr.readystate == 4) {
        log.fine(TAG_, 'Sent XHR request', request);
      }
    };

    xhr.send('');
    return true;
  }
}

