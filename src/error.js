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
import {exponentialBackoff} from './exponential-backoff';
import {USER_ERROR_SENTINEL, isUserErrorMessage} from './log';
import {makeBodyVisible} from './styles';
import {urls} from './config';

const globalExponentialBackoff = exponentialBackoff(1.5);

const CANCELLED = 'CANCELLED';


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
  if (!error) {
    error = new Error('no error supplied');
  }
  if (error.reported) {
    return;
  }
  error.reported = true;
  const element = opt_associatedElement || error.associatedElement;
  if (element && element.classList) {
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
    if (!getMode().minified) {
      (console.error || console.log).call(console, error.stack);
    }
  }
  if (element && element.dispatchCustomEvent) {
    element.dispatchCustomEvent('amp:error', error.message);
  }
  reportErrorToServer(undefined, undefined, undefined, undefined, error);
}

/**
 * Returns an error for a cancellation of a promise.
 * @return {!Error}
 */
export function cancellation() {
  return new Error(CANCELLED);
}

/**
 * Install handling of global unhandled exceptions.
 * @param {!Window} win
 */
export function installErrorReporting(win) {
  win.onerror = reportErrorToServer;
  win.addEventListener('unhandledrejection', event => {
    reportError(event.reason || new Error('rejected promise ' + event));
  });
}

/**
 * Signature designed, so it can work with window.onerror
 * @param {string|undefined} message
 * @param {string|undefined} filename
 * @param {string|undefined} line
 * @param {string|undefined} col
 * @param {!Error|undefined} error
 * @this {!Window|undefined}
 */
function reportErrorToServer(message, filename, line, col, error) {
  // Make an attempt to unhide the body.
  if (this && this.document) {
    makeBodyVisible(this.document);
  }
  if (getMode().localDev || getMode().development || getMode().test) {
    return;
  }
  const url = getErrorReportUrl(message, filename, line, col, error);
  globalExponentialBackoff(() => {
    if (url) {
      new Image().src = url;
    }
  });
}

/**
 * Signature designed, so it can work with window.onerror
 * @param {string|undefined} message
 * @param {string|undefined} filename
 * @param {string|undefined} line
 * @param {string|undefined} col
 * @param {!Error|undefined} error
 * @return {string|undefined} The URL
 * visibleForTesting
 */
export function getErrorReportUrl(message, filename, line, col, error) {
  message = error && error.message ? error.message : message;
  if (/_reported_/.test(message)) {
    return;
  }
  if (message == CANCELLED) {
    return;
  }
  if (!message) {
    message = 'Unknown error';
  }

  // This is the App Engine app in
  // ../tools/errortracker
  // It stores error reports via https://cloud.google.com/error-reporting/
  // for analyzing production issues.
  let url = urls.errorReporting +
      '?v=' + encodeURIComponent('$internalRuntimeVersion$') +
      '&m=' + encodeURIComponent(message.replace(USER_ERROR_SENTINEL, '')) +
      '&a=' + (isUserErrorMessage(message) ? 1 : 0);
  if (window.context && window.context.location) {
    url += '&3p=1';
  }
  if (window.AMP_CONFIG && window.AMP_CONFIG.canary) {
    url += '&ca=1';
  }
  if (window.location.ancestorOrigins && window.location.ancestorOrigins[0]) {
    url += '&or=' + encodeURIComponent(window.location.ancestorOrigins[0]);
  }
  if (window.viewerState) {
    url += '&vs=' + encodeURIComponent(window.viewerState);
  }
  // Is embedded?
  if (window.parent && window.parent != window) {
    url += '&iem=1';
  }

  if (window.AMP.viewer) {
    const resolvedViewerUrl = window.AMP.viewer.getResolvedViewerUrl();
    const messagingOrigin = window.AMP.viewer.maybeGetMessagingOrigin();
    if (resolvedViewerUrl) {
      url += `&rvu=${encodeURIComponent(resolvedViewerUrl)}`;
    }
    if (messagingOrigin) {
      url += `&mso=${encodeURIComponent(messagingOrigin)}`;
    }
  }

  if (error) {
    const tagName = error && error.associatedElement
      ? error.associatedElement.tagName
      : 'u';  // Unknown
    url += '&el=' + encodeURIComponent(tagName) +
        '&s=' + encodeURIComponent(error.stack || '');
    error.message += ' _reported_';
  } else {
    url += '&f=' + encodeURIComponent(filename) +
        '&l=' + encodeURIComponent(line) +
        '&c=' + encodeURIComponent(col || '');
  }
  url += '&r=' + encodeURIComponent(document.referrer);

  // Shorten URLs to a value all browsers will send.
  return url.substr(0, 2000);
}
