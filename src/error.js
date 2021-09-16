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
import {isLoadErrorMessage} from './event-helper';
import {USER_ERROR_SENTINEL, isUserErrorMessage} from './log';
import {makeBodyVisible} from './style-installer';
import {urls} from './config';
import {startsWith} from './string';

const CANCELLED = 'CANCELLED';

/**
 * A wrapper around our exponentialBackoff, to lazy initialize it to avoid an
 * un-DCE'able side-effect.
 * @param {function()} work the function to execute after backoff
 * @return {number} the setTimeout id
 */
let globalExponentialBackoff = function(work) {
  // Set globalExponentialBackoff as the lazy-created function. JS Vooodoooo.
  globalExponentialBackoff = exponentialBackoff(1.5);
  return globalExponentialBackoff(work);
};

/**
 * Reports an error. If the error has an "associatedElement" property
 * the element is marked with the -amp-element-error and displays
 * the message itself. The message is always send to the console.
 * If the error has a "messageArray" property, that array is logged.
 * This way one gets the native fidelity of the console for things like
 * elements instead of stringification.
 * @param {*} error
 * @param {!Element=} opt_associatedElement
 */
export function reportError(error, opt_associatedElement) {
  if (!self.console) {
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
    } else if (!getMode().minified) {
      (console.error || console.log).call(console, error.stack);
    } else {
      (console.error || console.log).call(console, error.message);
    }

  }
  if (element && element.dispatchCustomEventForTesting) {
    element.dispatchCustomEventForTesting('amp:error', error.message);
  }
  // 'call' to make linter happy. And .call to make compiler happy
  // that expects some @this.
  reportErrorToServer['call'](undefined, undefined, undefined, undefined,
      undefined, error);
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
  win.onerror = /** @type {!Function} */ (reportErrorToServer);
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
 * @param {*|undefined} error
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
  let hasNonAmpJs = false;
  try {
    hasNonAmpJs = detectNonAmpJs(self);
  } catch (ignore) {
    // Ignore errors during error report generation.
  }
  if (hasNonAmpJs && Math.random() > 0.01) {
    // Only report 1% of errors on pages with non-AMP JS.
    // These errors can almost never be acted upon, but spikes such as
    // due to buggy browser extensions may be helpful to notify authors.
    return;
  }
  const url = getErrorReportUrl(message, filename, line, col, error,
      hasNonAmpJs);
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
 * @param {*|undefined} error
 * @param {boolean} hasNonAmpJs
 * @return {string|undefined} The URL
 * visibleForTesting
 */
export function getErrorReportUrl(message, filename, line, col, error,
    hasNonAmpJs) {
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
  if (isLoadErrorMessage(message)) {
    return;
  }

  // This is the App Engine app in
  // ../tools/errortracker
  // It stores error reports via https://cloud.google.com/error-reporting/
  // for analyzing production issues.
  let url = urls.errorReporting +
      '?v=' + encodeURIComponent('$internalRuntimeVersion$') +
      '&noAmp=' + (hasNonAmpJs ? 1 : 0) +
      '&m=' + encodeURIComponent(message.replace(USER_ERROR_SENTINEL, '')) +
      '&a=' + (isUserErrorMessage(message) ? 1 : 0);
  if (self.context && self.context.location) {
    url += '&3p=1';
  }
  if (self.AMP_CONFIG && self.AMP_CONFIG.canary) {
    url += '&ca=1';
  }
  if (self.location.ancestorOrigins && self.location.ancestorOrigins[0]) {
    url += '&or=' + encodeURIComponent(self.location.ancestorOrigins[0]);
  }
  if (self.viewerState) {
    url += '&vs=' + encodeURIComponent(self.viewerState);
  }
  // Is embedded?
  if (self.parent && self.parent != self) {
    url += '&iem=1';
  }

  if (self.AMP.viewer) {
    const resolvedViewerUrl = self.AMP.viewer.getResolvedViewerUrl();
    const messagingOrigin = self.AMP.viewer.maybeGetMessagingOrigin();
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
    url += '&f=' + encodeURIComponent(filename || '') +
        '&l=' + encodeURIComponent(line || '') +
        '&c=' + encodeURIComponent(col || '');
  }
  url += '&r=' + encodeURIComponent(self.document.referrer);

  // Shorten URLs to a value all browsers will send.
  return url.substr(0, 2000);
}

/**
 * Returns true if it appears like there is non-AMP JS on the
 * current page.
 * @param {!Window} win
 * @visibleForTesting
 */
export function detectNonAmpJs(win) {
  const scripts = win.document.querySelectorAll('script[src]');
  for (let i = 0; i < scripts.length; i++) {
    if (!startsWith(scripts[i].src.toLowerCase(), urls.cdn)) {
      return true;
    }
  }
  return false;
}
