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


import {getMode} from './mode';
import {exponentialBackoff} from './exponential-backoff.js';
import {makeBodyVisible} from './styles';

const globalExponentialBackoff = exponentialBackoff(1.5);


/**
 * Reports an error. If the error has an "associatedElement" property
 * the element is marked with the -amp-element-error and displays
 * the message itself. The message is always send to the console.
 * If the error has a "messageArray" property, that array is logged.
 * This way one gets the native fidelity of the console for things like
 * elements instead of stringification.
 * @param {!Error} error
 * @param {!Element=} opt_associatedElement
 */
export function reportError(error, opt_associatedElement) {
  if (!window.console) {
    return;
  }
  if (error.reported) {
    return;
  }
  error.reported = true;
  const element = opt_associatedElement || error.associatedElement;
  if (element) {
    element.classList.add('-amp-error');
    if (getMode().development) {
      element.classList.add('-amp-element-error');
      element.setAttribute('error-message', error.message);
    }
  }
  if (error.messageArray) {
    (console.error || console.log).apply(console,
        error.messageArray);
  } else {
    if (element) {
      (console.error || console.log).call(console,
          element.tagName + '#' + element.id, error.message);
    } else {
      (console.error || console.log).call(console, error.message);
    }
    if (!(process.env.NODE_ENV == 'production')) {
      (console.error || console.log).call(console, error.stack);
    }
  }
  if (element && element.dispatchCustomEvent) {
    element.dispatchCustomEvent('amp:error', error.message);
  }
  reportErrorToServer(undefined, undefined, undefined, undefined, error);
}

/**
 * Install handling of global unhandled exceptions.
 * @param {!Window} win
 */
export function installErrorReporting(win) {
  win.onerror = reportErrorToServer;
}

/**
 * Signature designed, so it can work with window.onerror
 * @param {string|undefined} message
 * @param {string|undefined} filename
 * @param {string|undefined} line
 * @param {string|undefined} col
 * @param {!Error|undefined} error
 */
function reportErrorToServer(message, filename, line, col, error) {
  // Make an attempt to unhide the body.
  if (this && this.document) {
    makeBodyVisible(this.document);
  }
  const mode = getMode();
  if (mode.isLocalDev || mode.development || mode.test) {
    return;
  }
  const url = getErrorReportUrl(message, filename, line, col, error);
  globalExponentialBackoff(() => {
    new Image().src = url;
  });
}

/**
 * Signature designed, so it can work with window.onerror
 * @param {string|undefined} message
 * @param {string|undefined} filename
 * @param {string|undefined} line
 * @param {string|undefined} col
 * @param {!Error|undefined} error
 * visibleForTesting
 */
export function getErrorReportUrl(message, filename, line, col, error) {
  message = error ? error.message : message;
  if (/_reported_/.test(message)) {
    return;
  }

  let url = 'https://cdn.ampproject.org/error/report.gif' +
      '?v=' + encodeURIComponent('$internalRuntimeVersion$') +
      '&m=' + encodeURIComponent(message);

  if (error) {
    const tagName = error && error.associatedElement
      ? error.associatedElement.tagName
      : 'u';  // Unknown
    // We may want to consider not reporting asserts but for now
    // this should be helpful.
    url += '&a=' + (error.fromAssert ? 1 : 0) +
        '&el=' + encodeURIComponent(tagName) +
        '&s=' + encodeURIComponent(error.stack || '');
    error.message += ' _reported_';
  } else {
    url += '&f=' + encodeURIComponent(filename) +
        '&l=' + encodeURIComponent(line) +
        '&c=' + encodeURIComponent(col || '');
  }

  // Shorten URLs to a value all browsers will send.
  return url.substr(0, 2000);
}
