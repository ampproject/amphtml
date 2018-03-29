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


import {AmpEvents} from './amp-events';
import {Services} from './services';
import {
  USER_ERROR_SENTINEL,
  dev,
  duplicateErrorIfNecessary,
  isUserErrorEmbed,
  isUserErrorMessage,
} from './log';
import {experimentTogglesOrNull, getBinaryType, isCanary} from './experiments';
import {exponentialBackoff} from './exponential-backoff';
import {getMode} from './mode';
import {isExperimentOn} from './experiments';
import {
  isLoadErrorMessage,
} from './event-helper';
import {isProxyOrigin} from './url';
import {makeBodyVisible} from './style-installer';
import {startsWith} from './string';
import {triggerAnalyticsEvent} from './analytics';
import {urls} from './config';

/**
 * @const {string}
 */
const CANCELLED = 'CANCELLED';

/**
 * @const {string}
 */
const BLOCKBYCONSENT = 'BLOCKBYCONSENT';


/**
 * The threshold for errors throttled because nothing can be done about
 * them, but we'd still like to report the rough number.
 * @const {number}
 */
const NON_ACTIONABLE_ERROR_THROTTLE_THRESHOLD = 0.001;

/**
 * The threshold for errors throttled because nothing can be done about
 * them, but we'd still like to report the rough number.
 * @const {number}
 */
const USER_ERROR_THROTTLE_THRESHOLD = 0.1;


/**
 * Collects error messages, so they can be included in subsequent reports.
 * That allows identifying errors that might be caused by previous errors.
 */
let accumulatedErrorMessages = self.AMPErrors || [];
// Use a true global, to avoid multi-module inclusion issues.
self.AMPErrors = accumulatedErrorMessages;

/**
 * Pushes element into array, keeping at most the most recent limit elements
 *
 * @param {!Array<T>} array
 * @param {T} element
 * @param {number} limit
 * @template T
 */
function pushLimit(array, element, limit) {
  if (array.length >= limit) {
    array.splice(0, array.length - limit + 1);
  }
  array.push(element);
}

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
 * @param {!Window} win
 * @param {*} error
 * @param {!Element=} opt_associatedElement
 */
export function reportErrorForWin(win, error, opt_associatedElement) {
  reportError(error, opt_associatedElement);
  if (error && !!win && isUserErrorMessage(error.message)
      && !isUserErrorEmbed(error.message)) {
    reportErrorToAnalytics(/** @type {!Error} */(error), win);
  }
}

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
      element.dispatchCustomEventForTesting(AmpEvents.ERROR, error.message);
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

export function blockByConsent() {
  return new Error(BLOCKBYCONSENT);
}

/**
 * @param {*} errorOrMessage
 * @return {boolean}
 */
export function isBlockedByConsent(errorOrMessage) {
  if (!errorOrMessage) {
    return false;
  }
  if (typeof errorOrMessage == 'string') {
    return startsWith(errorOrMessage, BLOCKBYCONSENT);
  }
  if (typeof errorOrMessage.message == 'string') {
    return startsWith(errorOrMessage.message, BLOCKBYCONSENT);
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
  const data = getErrorReportData(message, filename, line, col, error,
      hasNonAmpJs);
  if (data) {
    // Report the error to viewer if it has the capability. The data passed
    // to the viewer is exactly the same as the data passed to the server
    // below.
    maybeReportErrorToViewer(this, data);
    reportingBackoff(() => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', urls.errorReporting, true);
      xhr.send(JSON.stringify(data));
    });
  }
}

/**
 * Passes the given error data to the viewer if the following criteria is met:
 * - The viewer is a trusted viewer
 * - The viewer has the `errorReporter` capability
 * - The AMP doc is in single doc mode
 * - The AMP doc is opted-in for error interception (`<html>` tag has the
 *   `report-errors-to-viewer` attribute)
 *
 * @param {!Window} win
 * @param {!JsonObject} data Data from `getErrorReportData`.
 * @return {!Promise<boolean>} `Promise<True>` if the error was sent to the
 *     viewer, `Promise<False>` otherwise.
 * @visibleForTesting
 */
export function maybeReportErrorToViewer(win, data) {
  const ampdocService = Services.ampdocServiceFor(win);
  if (!ampdocService.isSingleDoc()) {
    return Promise.resolve(false);
  }
  const ampdocSingle = ampdocService.getAmpDoc();
  const htmlElement = ampdocSingle.getRootNode().documentElement;
  const docOptedIn = htmlElement.hasAttribute('report-errors-to-viewer');
  if (!docOptedIn) {
    return Promise.resolve(false);
  }

  const viewer = Services.viewerForDoc(ampdocSingle);
  if (!viewer.hasCapability('errorReporter')) {
    return Promise.resolve(false);
  }

  return viewer.isTrustedViewer().then(viewerTrusted => {
    if (!viewerTrusted) {
      return false;
    }
    viewer.sendMessage('error', data);
    return true;
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
 * @return {!JsonObject|undefined} The data to post
 * visibleForTesting
 */
export function getErrorReportData(message, filename, line, col, error,
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

  const throttleBase = Math.random();
  // We throttle load errors and generic "Script error." errors
  // that have no information and thus cannot be acted upon.
  if (isLoadErrorMessage(message) ||
    // See https://github.com/ampproject/amphtml/issues/7353
    // for context.
    message == 'Script error.') {
    expected = true;

    if (throttleBase > NON_ACTIONABLE_ERROR_THROTTLE_THRESHOLD) {
      return;
    }
  }

  const isUserError = isUserErrorMessage(message);

  // Only report a subset of user errors.
  if (isUserError && throttleBase > USER_ERROR_THROTTLE_THRESHOLD) {
    return;
  }

  // This is the App Engine app in
  // https://github.com/ampproject/error-tracker
  // It stores error reports via https://cloud.google.com/error-reporting/
  // for analyzing production issues.
  const data = /** @type {!JsonObject} */ (Object.create(null));
  data['v'] = getMode().rtvVersion;
  data['noAmp'] = hasNonAmpJs ? '1' : '0';
  data['m'] = message.replace(USER_ERROR_SENTINEL, '');
  data['a'] = isUserError ? '1' : '0';

  // Errors are tagged with "ex" ("expected") label to allow loggers to
  // classify these errors as benchmarks and not exceptions.
  data['ex'] = expected ? '1' : '0';

  let runtime = '1p';
  if (self.context && self.context.location) {
    data['3p'] = '1';
    runtime = '3p';
  } else if (getMode().runtime) {
    runtime = getMode().runtime;
  }
  data['rt'] = runtime;

  // TODO(erwinm): Remove ca when all systems read `bt` instead of `ca` to
  // identify js binary type.
  data['ca'] = isCanary(self) ? '1' : '0';

  // Pass binary type.
  data['bt'] = getBinaryType(self);

  if (self.location.ancestorOrigins && self.location.ancestorOrigins[0]) {
    data['or'] = self.location.ancestorOrigins[0];
  }
  if (self.viewerState) {
    data['vs'] = self.viewerState;
  }
  // Is embedded?
  if (self.parent && self.parent != self) {
    data['iem'] = '1';
  }

  if (self.AMP && self.AMP.viewer) {
    const resolvedViewerUrl = self.AMP.viewer.getResolvedViewerUrl();
    const messagingOrigin = self.AMP.viewer.maybeGetMessagingOrigin();
    if (resolvedViewerUrl) {
      data['rvu'] = resolvedViewerUrl;
    }
    if (messagingOrigin) {
      data['mso'] = messagingOrigin;
    }
  }

  if (!detectedJsEngine) {
    detectedJsEngine = detectJsEngineFromStack();
  }
  data['jse'] = detectedJsEngine;

  const exps = [];
  const experiments = experimentTogglesOrNull(self);
  for (const exp in experiments) {
    const on = experiments[exp];
    exps.push(`${exp}=${on ? '1' : '0'}`);
  }
  data['exps'] = exps.join(',');

  if (error) {
    const tagName = error.associatedElement
      ? error.associatedElement.tagName
      : 'u'; // Unknown
    data['el'] = tagName;

    if (error.args) {
      data['args'] = JSON.stringify(error.args);
    }

    if (!isUserError && !error.ignoreStack && error.stack) {
      data['s'] = error.stack;
    }

    error.message += ' _reported_';
  } else {
    data['f'] = filename || '';
    data['l'] = line || '';
    data['c'] = col || '';
  }
  data['r'] = self.document.referrer;
  data['ae'] = accumulatedErrorMessages.join(',');
  data['fr'] = self.location.originalHash || self.location.hash;

  pushLimit(accumulatedErrorMessages, message, 25);

  return data;
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

/**
 * @param {!Error} error
 * @param {!Window} win
 */
export function reportErrorToAnalytics(error, win) {
  if (isExperimentOn(win, 'user-error-reporting')) {
    const vars = {
      'errorName': error.name,
      'errorMessage': error.message,
    };
    triggerAnalyticsEvent(getRootElement_(win), 'user-error', vars);
  }
}

/**
 * @param {!Window} win
 * @return {!Element}
 * @private
 */
function getRootElement_(win) {
  const root = Services.ampdocServiceFor(win).getAmpDoc().getRootNode();
  return dev().assertElement(root.documentElement || root.body || root);
}
