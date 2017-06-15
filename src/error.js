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
import {
  isLoadErrorMessage,
} from './event-helper';
import {
  USER_ERROR_SENTINEL,
  isUserErrorMessage,
  duplicateErrorIfNecessary,
} from './log';
import {isProxyOrigin} from './url';
import {isCanary, experimentTogglesOrNull} from './experiments';
import {makeBodyVisible} from './style-installer';
import {startsWith} from './string';
import {urls} from './config';


/**
 * @const {string}
 */
const CANCELLED = 'CANCELLED';


/**
 * The threshold for throttled errors. Currently at 0.1%.
 * @const {number}
 */
const THROTTLED_ERROR_THRESHOLD = 1e-3;


/**
 * Collects error messages, so they can be included in subsequent reports.
 * That allows identifying errors that might be caused by previous errors.
 */
let accumulatedErrorMessages = self.AMPErrors || [];
// Use a true global, to avoid multi-module inclusion issues.
self.AMPErrors = accumulatedErrorMessages;

/**
 * A wrapper around our exponentialBackoff, to lazy initialize it to avoid an
 * un-DCE'able side-effect.
 * @param {function()} work the function to execute after backoff
 * @return {number} the setTimeout id
 */
let reportingBackoff = function(work) {
  // Set reportingBackoff as the lazy-created function. JS Vooodoooo.
  reportingBackoff = exponentialBackoff(1.5);
  return reportingBackoff(work);
};

/**
 * Attempts to stringify a value, falling back to String.
 * @param {*} value
 * @return {string}
 */
function tryJsonStringify(value) {
  try {
    // Cast is fine, because we really don't care here. Just trying.
    return JSON.stringify(/** @type {!JsonObject} */ (value));
  } catch (e) {
    return String(value);
  }
}

/**
 * The true JS engine, as detected by inspecting an Error stack. This should be
 * used with the userAgent to tell definitely. I.e., Chrome on iOS is really a
 * Safari JS engine.
 */
let detectedJsEngine;

/**
 * Reports an error. If the error has an "associatedElement" property
 * the element is marked with the `i-amphtml-element-error` and displays
 * the message itself. The message is always send to the console.
 * If the error has a "messageArray" property, that array is logged.
 * This way one gets the native fidelity of the console for things like
 * elements instead of stringification.
 * @param {*} error
 * @param {!Element=} opt_associatedElement
 * @return {!Error}
 */
export function reportError(error, opt_associatedElement) {
  try {
    // Convert error to the expected type.
    let isValidError;
    if (error) {
      if (error.message !== undefined) {
        error = duplicateErrorIfNecessary(/** @type {!Error} */(error));
        isValidError = true;
      } else {
        const origError = error;
        error = new Error(tryJsonStringify(origError));
        error.origError = origError;
      }
    } else {
      error = new Error('Unknown error');
    }
    // Report if error is not an expected type.
    if (!isValidError && getMode().localDev && !getMode().test) {
      setTimeout(function() {
        const rethrow = new Error(
            '_reported_ Error reported incorrectly: ' + error);
        throw rethrow;
      });
    }

    if (error.reported) {
      return /** @type {!Error} */ (error);
    }
    error.reported = true;

    // Update element.
    const element = opt_associatedElement || error.associatedElement;
    if (element && element.classList) {
      element.classList.add('i-amphtml-error');
      if (getMode().development) {
        element.classList.add('i-amphtml-element-error');
        element.setAttribute('error-message', error.message);
      }
    }

    // Report to console.
    if (self.console) {
      const output = (console.error || console.log);
      if (error.messageArray) {
        output.apply(console, error.messageArray);
      } else {
        if (element) {
          output.call(console, error.message, element);
        } else if (!getMode().minified) {
          output.call(console, error.stack);
        } else {
          output.call(console, error.message);
        }
      }
    }
    if (element && element.dispatchCustomEventForTesting) {
      element.dispatchCustomEventForTesting('amp:error', error.message);
    }

    // 'call' to make linter happy. And .call to make compiler happy
    // that expects some @this.
    reportErrorToServer['call'](undefined, undefined, undefined, undefined,
        undefined, error);
  } catch (errorReportingError) {
    setTimeout(function() {
      throw errorReportingError;
    });
  }
  return /** @type {!Error} */ (error);
}

/**
 * Returns an error for a cancellation of a promise.
 * @return {!Error}
 */
export function cancellation() {
  return new Error(CANCELLED);
}

/**
 * @param {*} errorOrMessage
 * @return {boolean}
 */
export function isCancellation(errorOrMessage) {
  if (!errorOrMessage) {
    return false;
  }
  if (typeof errorOrMessage == 'string') {
    return startsWith(errorOrMessage, CANCELLED);
  }
  if (typeof errorOrMessage.message == 'string') {
    return startsWith(errorOrMessage.message, CANCELLED);
  }
  return false;
}

/**
 * Install handling of global unhandled exceptions.
 * @param {!Window} win
 */
export function installErrorReporting(win) {
  win.onerror = /** @type {!Function} */ (reportErrorToServer);
  win.addEventListener('unhandledrejection', event => {
    if (event.reason && event.reason.message === CANCELLED) {
      event.preventDefault();
      return;
    }
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
  if (url) {
    reportingBackoff(() => {
      new Image().src = url;
    });
  }
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
  let expected = false;
  if (error) {
    if (error.message) {
      message = error.message;
    } else {
      // This should never be a string, but sometimes it is.
      message = String(error);
    }
    // An "expected" error is still an error, i.e. some features are disabled
    // or not functioning fully because of it. However, it's an expected
    // error. E.g. as is the case with some browser API missing (storage).
    // Thus, the error can be classified differently by log aggregators.
    // The main goal is to monitor that an "expected" error doesn't deteriorate
    // over time. It's impossible to completely eliminate it.
    if (error.expected) {
      expected = true;
    }
  }
  if (!message) {
    message = 'Unknown error';
  }
  if (/_reported_/.test(message)) {
    return;
  }
  if (message == CANCELLED) {
    return;
  }

  // We throttle load errors and generic "Script error." errors
  // that have no information and thus cannot be acted upon.
  if (isLoadErrorMessage(message) ||
    // See https://github.com/ampproject/amphtml/issues/7353
    // for context.
    message == 'Script error.') {
    expected = true;

    // Throttle load errors.
    if (Math.random() > THROTTLED_ERROR_THRESHOLD) {
      return;
    }
  }

  const isUserError = isUserErrorMessage(message);

  // This is the App Engine app in
  // ../tools/errortracker
  // It stores error reports via https://cloud.google.com/error-reporting/
  // for analyzing production issues.
  let url = urls.errorReporting +
      '?v=' + encodeURIComponent('$internalRuntimeVersion$') +
      '&noAmp=' + (hasNonAmpJs ? 1 : 0) +
      '&m=' + encodeURIComponent(message.replace(USER_ERROR_SENTINEL, '')) +
      '&a=' + (isUserError ? 1 : 0);
  if (expected) {
    // Errors are tagged with "ex" ("expected") label to allow loggers to
    // classify these errors as benchmarks and not exceptions.
    url += '&ex=1';
  }

  let runtime = '1p';
  if (self.context && self.context.location) {
    url += '&3p=1';
    runtime = '3p';
  } else if (getMode().runtime) {
    runtime = getMode().runtime;
  }
  url += '&rt=' + runtime;

  if (isCanary(self)) {
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

  if (self.AMP && self.AMP.viewer) {
    const resolvedViewerUrl = self.AMP.viewer.getResolvedViewerUrl();
    const messagingOrigin = self.AMP.viewer.maybeGetMessagingOrigin();
    if (resolvedViewerUrl) {
      url += `&rvu=${encodeURIComponent(resolvedViewerUrl)}`;
    }
    if (messagingOrigin) {
      url += `&mso=${encodeURIComponent(messagingOrigin)}`;
    }
  }

  if (!detectedJsEngine) {
    detectedJsEngine = detectJsEngineFromStack();
  }
  url += `&jse=${detectedJsEngine}`;

  const exps = [];
  const experiments = experimentTogglesOrNull();
  for (const exp in experiments) {
    const on = experiments[exp];
    exps.push(`${exp}=${on ? '1' : '0'}`);
  }
  url += `&exps=${encodeURIComponent(exps.join(','))}`;

  if (error) {
    const tagName = error && error.associatedElement
        ? error.associatedElement.tagName
        : 'u';  // Unknown
    url += `&el=${encodeURIComponent(tagName)}`;
    if (error.args) {
      url += `&args=${encodeURIComponent(JSON.stringify(error.args))}`;
    }

    if (!isUserError && !error.ignoreStack && error.stack) {
      // Shorten
      const stack = (error.stack || '').substr(0, 1000);
      url += `&s=${encodeURIComponent(stack)}`;
    }

    error.message += ' _reported_';
  } else {
    url += '&f=' + encodeURIComponent(filename || '') +
        '&l=' + encodeURIComponent(line || '') +
        '&c=' + encodeURIComponent(col || '');
  }
  url += '&r=' + encodeURIComponent(self.document.referrer);
  url += '&ae=' + encodeURIComponent(accumulatedErrorMessages.join(','));
  accumulatedErrorMessages.push(message);
  url += '&fr=' + encodeURIComponent(self.location.originalHash
      || self.location.hash);

  // Google App Engine maximum URL length.
  if (url.length >= 2072) {
    url = url.substr(0, 2072 - 8 /* length of suffix */)
        // Full remove last URL encoded entity.
        .replace(/\%[^&%]+$/, '')
        // Sentinel
        + '&SHORT=1';
  }
  return url;
}

/**
 * Returns true if it appears like there is non-AMP JS on the
 * current page.
 * @param {!Window} win
 * @return {boolean}
 * @visibleForTesting
 */
export function detectNonAmpJs(win) {
  const scripts = win.document.querySelectorAll('script[src]');
  for (let i = 0; i < scripts.length; i++) {
    if (!isProxyOrigin(scripts[i].src.toLowerCase())) {
      return true;
    }
  }
  return false;
}

export function resetAccumulatedErrorMessagesForTesting() {
  accumulatedErrorMessages = [];
}

/**
 * Does a series of checks on the stack of an thrown error to determine the
 * JS engine that is currently running. This gives a bit more information than
 * just the UserAgent, since browsers often allow overriding it to "emulate"
 * mobile.
 * @return {string}
 * @visibleForTesting
 */
export function detectJsEngineFromStack() {
  /** @constructor */
  function Fn() {}
  Fn.prototype.t = function() {
    throw new Error('message');
  };
  const object = new Fn();
  try {
    object.t();
  } catch (e) {
    const stack = e.stack;

    // Safari only mentions the method name.
    if (startsWith(stack, 't@')) {
      return 'Safari';
    }

    // Firefox mentions "prototype".
    if (stack.indexOf('.prototype.t@') > -1) {
      return 'Firefox';
    }

    // IE looks like Chrome, but includes a context for the base stack line.
    // Explicitly, we're looking for something like:
    // "    at Global code (https://example.com/app.js:1:200)" or
    // "    at Anonymous function (https://example.com/app.js:1:200)"
    // vs Chrome which has:
    // "    at https://example.com/app.js:1:200"
    const last = stack.split('\n').pop();
    if (/\bat .* \(/i.test(last)) {
      return 'IE';
    }

    // Finally, chrome includes the error message in the stack.
    if (startsWith(stack, 'Error: message')) {
      return 'Chrome';
    }
  }

  return 'unknown';
}
