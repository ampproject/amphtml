import { resolvedPromise as _resolvedPromise } from "./core/data-structures/promise";

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
import { USER_ERROR_SENTINEL, isUserErrorEmbedMessage, isUserErrorMessage } from "./core/error/message-helpers";
import * as mode from "./core/mode";
import { triggerAnalyticsEvent } from "./analytics";
import { urls } from "./config";
import { AmpEvents } from "./core/constants/amp-events";
import { duplicateErrorIfNecessary } from "./core/error";
import { findIndex } from "./core/types/array";
import { exponentialBackoff } from "./core/types/function/exponential-backoff";
import { dict } from "./core/types/object";
import { isLoadErrorMessage } from "./event-helper";
import { experimentTogglesOrNull, getBinaryType, isCanary } from "./experiments";
import { dev, setReportError } from "./log";
import { getMode } from "./mode";
import { Services } from "./service";
import { makeBodyVisibleRecovery } from "./style-installer";
import { isProxyOrigin } from "./url";
export { setReportError };

/**
 * @const {string}
 */
var CANCELLED = 'CANCELLED';

/**
 * @const {string}
 */
var BLOCK_BY_CONSENT = 'BLOCK_BY_CONSENT';

/**
 * @const {string}
 */
var ABORTED = 'AbortError';

/**
 * The threshold for errors throttled because nothing can be done about
 * them, but we'd still like to report the rough number.
 * @const {number}
 */
var NON_ACTIONABLE_ERROR_THROTTLE_THRESHOLD = 0.001;

/**
 * The threshold for errors throttled because nothing can be done about
 * them, but we'd still like to report the rough number.
 * @const {number}
 */
var USER_ERROR_THROTTLE_THRESHOLD = 0.1;

/**
 * Chance to post to the new error reporting endpoint.
 * @const {number}
 */
var BETA_ERROR_REPORT_URL_FREQ = 0.1;

/**
 * Collects error messages, so they can be included in subsequent reports.
 * That allows identifying errors that might be caused by previous errors.
 */
var accumulatedErrorMessages = self.__AMP_ERRORS || [];
// Use a true global, to avoid multi-module inclusion issues.
self.__AMP_ERRORS = accumulatedErrorMessages;

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
var _reportingBackoff = function reportingBackoff(work) {
  // Set reportingBackoff as the lazy-created function. JS Vooodoooo.
  _reportingBackoff = exponentialBackoff(1.5);
  return _reportingBackoff(work);
};

/**
 * Attempts to stringify a value, falling back to String.
 * @param {*} value
 * @return {string}
 */
function tryJsonStringify(value) {
  try {
    // Cast is fine, because we really don't care here. Just trying.
    return JSON.stringify(
    /** @type {!JsonObject} */
    value);
  } catch (e) {
    return String(value);
  }
}

/**
 * @param {!Window} win
 * @param {*} error
 * @param {!Element=} opt_associatedElement
 */
export function reportErrorForWin(win, error, opt_associatedElement) {
  reportError(error, opt_associatedElement);

  if (error && !!win && isUserErrorMessage(error.message) && !isUserErrorEmbedMessage(error.message)) {
    reportErrorToAnalytics(
    /** @type {!Error} */
    error, win);
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
    var isValidError;

    if (error) {
      if (error.message !== undefined) {
        error = duplicateErrorIfNecessary(
        /** @type {!Error} */
        error);
        isValidError = true;
      } else {
        var origError = error;
        error = new Error(tryJsonStringify(origError));
        error.origError = origError;
      }
    } else {
      error = new Error('Unknown error');
    }

    // Report if error is not an expected type.
    if (!isValidError && getMode().localDev && !getMode().test) {
      setTimeout(function () {
        var rethrow = new Error('_reported_ Error reported incorrectly: ' + error);
        throw rethrow;
      });
    }

    if (error.reported) {
      return (
        /** @type {!Error} */
        error
      );
    }

    error.reported = true;

    // `associatedElement` is used to add the i-amphtml-error class; in
    // `#development=1` mode, it also adds `i-amphtml-element-error` to the
    // element and sets the `error-message` attribute.
    if (error.messageArray) {
      var elIndex = findIndex(error.messageArray, function (item) {
        return item == null ? void 0 : item.tagName;
      });

      if (elIndex > -1) {
        error.associatedElement = error.messageArray[elIndex];
      }
    }

    // Update element.
    var element = opt_associatedElement || error.associatedElement;

    if (element && element.classList) {
      element.classList.add('i-amphtml-error');

      if (getMode().development) {
        element.classList.add('i-amphtml-element-error');
        element.setAttribute('error-message', error.message);
      }
    }

    // Report to console.
    if (self.console && (isUserErrorMessage(error.message) || !error.expected || getMode().localDev)) {
      var output = console.error || console.log;

      if (error.messageArray) {
        output.apply(console, error.messageArray);
      } else {
        if (element) {
          output.call(console, error.message, element);
        } else if (!mode.isMinified()) {
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
    onError['call'](self, undefined, undefined, undefined, undefined, error);
  } catch (errorReportingError) {
    setTimeout(function () {
      throw errorReportingError;
    });
  }

  return (
    /** @type {!Error} */
    error
  );
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
    return errorOrMessage.startsWith(CANCELLED);
  }

  if (typeof errorOrMessage.message == 'string') {
    return errorOrMessage.message.startsWith(CANCELLED);
  }

  return false;
}

/**
 * Returns an error for component blocked by consent
 * @return {!Error}
 */
export function blockedByConsentError() {
  return new Error(BLOCK_BY_CONSENT);
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
    return errorOrMessage.startsWith(BLOCK_BY_CONSENT);
  }

  if (typeof errorOrMessage.message == 'string') {
    return errorOrMessage.message.startsWith(BLOCK_BY_CONSENT);
  }

  return false;
}

/**
 * Install handling of global unhandled exceptions.
 * @param {!Window} win
 */
export function installErrorReporting(win) {
  win.onerror =
  /** @type {!Function} */
  onError;
  win.addEventListener('unhandledrejection', function (event) {
    if (event.reason && (event.reason.message === CANCELLED || event.reason.message === BLOCK_BY_CONSENT || event.reason.message === ABORTED)) {
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
function onError(message, filename, line, col, error) {
  var _this = this;

  // Make an attempt to unhide the body but don't if the error is actually expected.
  // eslint-disable-next-line local/no-invalid-this
  if (this && this.document && (!error || !error.expected)) {
    // eslint-disable-next-line local/no-invalid-this
    makeBodyVisibleRecovery(this.document);
  }

  if (getMode().localDev || getMode().development || getMode().test) {
    return;
  }

  var hasNonAmpJs = false;

  try {
    hasNonAmpJs = detectNonAmpJs(self);
  } catch (ignore) {// Ignore errors during error report generation.
  }

  if (hasNonAmpJs && Math.random() > 0.01) {
    // Only report 1% of errors on pages with non-AMP JS.
    // These errors can almost never be acted upon, but spikes such as
    // due to buggy browser extensions may be helpful to notify authors.
    return;
  }

  var data = getErrorReportData(message, filename, line, col, error, hasNonAmpJs);

  if (data) {
    _reportingBackoff(function () {
      try {
        return reportErrorToServerOrViewer( // eslint-disable-next-line local/no-invalid-this
        _this,
        /** @type {!JsonObject} */
        data).catch(function () {// catch async errors to avoid recursive errors.
        });
      } catch (e) {// catch async errors to avoid recursive errors.
      }
    });
  }
}

/**
 * Determines the error reporting endpoint which should be used.
 * If changing this URL, keep `docs/spec/amp-errors.md` in sync.
 * @return {string} error reporting endpoint URL.
 */
function chooseReportingUrl_() {
  return Math.random() < BETA_ERROR_REPORT_URL_FREQ ? urls.betaErrorReporting : urls.errorReporting;
}

/**
 * Passes the given error data to either server or viewer.
 * @param {!Window} win
 * @param {!JsonObject} data Data from `getErrorReportData`.
 * @return {Promise<undefined>}
 */
export function reportErrorToServerOrViewer(win, data) {
  // Report the error to viewer if it has the capability. The data passed
  // to the viewer is exactly the same as the data passed to the server
  // below.
  // Throttle reports from Stable by 90%.
  if (data['pt'] && Math.random() < 0.9) {
    return _resolvedPromise();
  }

  return maybeReportErrorToViewer(win, data).then(function (reportedErrorToViewer) {
    if (!reportedErrorToViewer) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', chooseReportingUrl_(), true);
      xhr.send(JSON.stringify(data));
    }
  });
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
  var ampdocService = Services.ampdocServiceFor(win);

  if (!ampdocService.isSingleDoc()) {
    return Promise.resolve(false);
  }

  var ampdocSingle = ampdocService.getSingleDoc();
  var htmlElement = ampdocSingle.getRootNode().documentElement;
  var docOptedIn = htmlElement.hasAttribute('report-errors-to-viewer');

  if (!docOptedIn) {
    return Promise.resolve(false);
  }

  var viewer = Services.viewerForDoc(ampdocSingle);

  if (!viewer.hasCapability('errorReporter')) {
    return Promise.resolve(false);
  }

  return viewer.isTrustedViewer().then(function (viewerTrusted) {
    if (!viewerTrusted) {
      return false;
    }

    viewer.sendMessage('error', errorReportingDataForViewer(data));
    return true;
  });
}

/**
 * Strips down the error reporting data to a minimal set
 * to be sent to the viewer.
 * @param {!JsonObject} errorReportData
 * @return {!JsonObject}
 * @visibleForTesting
 */
export function errorReportingDataForViewer(errorReportData) {
  return dict({
    'm': errorReportData['m'],
    // message
    'a': errorReportData['a'],
    // isUserError
    's': errorReportData['s'],
    // error stack
    'el': errorReportData['el'],
    // tagName
    'ex': errorReportData['ex'],
    // expected error?
    'v': errorReportData['v'],
    // runtime
    'pt': errorReportData['pt'] // is pre-throttled

  });
}

/**
 * @param {string|undefined}  message
 * @param {*|undefined} error
 * @return {string}
 */
function buildErrorMessage_(message, error) {
  if (error) {
    if (error.message) {
      message = error.message;
    } else {
      // This should never be a string, but sometimes it is.
      message = String(error);
    }
  }

  if (!message) {
    message = 'Unknown error';
  }

  return message;
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
export function getErrorReportData(message, filename, line, col, error, hasNonAmpJs) {
  message = buildErrorMessage_(message, error);
  // An "expected" error is still an error, i.e. some features are disabled
  // or not functioning fully because of it. However, it's an expected
  // error. E.g. as is the case with some browser API missing (storage).
  // Thus, the error can be classified differently by log aggregators.
  // The main goal is to monitor that an "expected" error doesn't deteriorate
  // over time. It's impossible to completely eliminate it.
  var expected = !!(error && error.expected);

  if (/_reported_/.test(message)) {
    return;
  }

  if (message == CANCELLED) {
    return;
  }

  var detachedWindow = !(self && self.window);
  var throttleBase = Math.random();

  // We throttle load errors and generic "Script error." errors
  // that have no information and thus cannot be acted upon.
  if (isLoadErrorMessage(message) || // See https://github.com/ampproject/amphtml/issues/7353
  // for context.
  message == 'Script error.' || // Window has become detached, really anything can happen
  // at this point.
  detachedWindow) {
    expected = true;

    if (throttleBase > NON_ACTIONABLE_ERROR_THROTTLE_THRESHOLD) {
      return;
    }
  }

  var isUserError = isUserErrorMessage(message);

  // Only report a subset of user errors.
  if (isUserError && throttleBase > USER_ERROR_THROTTLE_THRESHOLD) {
    return;
  }

  // This is the App Engine app in
  // https://github.com/ampproject/error-tracker
  // It stores error reports via https://cloud.google.com/error-reporting/
  // for analyzing production issues.
  var data =
  /** @type {!JsonObject} */
  Object.create(null);
  data['v'] = getMode().rtvVersion;
  data['noAmp'] = hasNonAmpJs ? '1' : '0';
  data['m'] = message.replace(USER_ERROR_SENTINEL, '');
  data['a'] = isUserError ? '1' : '0';
  // Errors are tagged with "ex" ("expected") label to allow loggers to
  // classify these errors as benchmarks and not exceptions.
  data['ex'] = expected ? '1' : '0';
  data['dw'] = detachedWindow ? '1' : '0';
  var runtime = '1p';

  if (false) {
    runtime = 'sxg';
    data['sxg'] = '1';
  } else if (false) {
    runtime = 'esm';
    data['esm'] = '1';
  } else if (self.context && self.context.location) {
    data['3p'] = '1';
    runtime = '3p';
  } else if (getMode().runtime) {
    runtime = getMode().runtime;
  }

  data['rt'] = runtime;

  // Add our a4a id if we are inabox
  if (runtime === 'inabox') {
    data['adid'] = getMode().a4aId;
  }

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
    var resolvedViewerUrl = self.AMP.viewer.getResolvedViewerUrl();
    var messagingOrigin = self.AMP.viewer.maybeGetMessagingOrigin();

    if (resolvedViewerUrl) {
      data['rvu'] = resolvedViewerUrl;
    }

    if (messagingOrigin) {
      data['mso'] = messagingOrigin;
    }
  }

  var exps = [];
  var experiments = experimentTogglesOrNull(self);

  for (var exp in experiments) {
    var on = experiments[exp];
    exps.push(exp + "=" + (on ? '1' : '0'));
  }

  data['exps'] = exps.join(',');

  if (error) {
    var _error$associatedElem;

    data['el'] = ((_error$associatedElem = error.associatedElement) == null ? void 0 : _error$associatedElem.tagName) || 'u';

    // Unknown
    if (error.args) {
      data['args'] = JSON.stringify(error.args);
    }

    if (!isUserError && !error.ignoreStack && error.stack) {
      data['s'] = error.stack;
    }

    // TODO(jridgewell, #18574); Make sure error is always an object.
    if (error.message) {
      error.message += ' _reported_';
    }
  } else {
    data['f'] = filename || '';
    data['l'] = line || '';
    data['c'] = col || '';
  }

  data['r'] = self.document ? self.document.referrer : '';
  data['ae'] = accumulatedErrorMessages.join(',');
  data['fr'] = self.location['originalHash'] || self.location.hash;

  // TODO(https://github.com/ampproject/error-tracker/issues/129): Remove once
  // all clients are serving a version with pre-throttling.
  if (data['bt'] === 'production') {
    // Setting this field allows the error reporting service to know that this
    // error has already been pre-throttled for Stable, so it doesn't need to
    // throttle again.
    data['pt'] = '1';
  }

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
  if (!win.document) {
    return false;
  }

  var scripts = win.document.querySelectorAll('script[src]');

  for (var i = 0; i < scripts.length; i++) {
    if (!isProxyOrigin(scripts[i].src.toLowerCase())) {
      return true;
    }
  }

  return false;
}

/**
 * Resets accumulated error messages for testing
 */
export function resetAccumulatedErrorMessagesForTesting() {
  accumulatedErrorMessages = [];
}

/**
 * @param {!Error} error
 * @param {!Window} win
 */
export function reportErrorToAnalytics(error, win) {
  // Currently this can only be executed in a single-doc mode. Otherwise,
  // it's not clear which ampdoc the event would belong too.
  if (Services.ampdocServiceFor(win).isSingleDoc()) {
    var vars = dict({
      'errorName': error.name,
      'errorMessage': error.message
    });
    triggerAnalyticsEvent(getRootElement_(win), 'user-error', vars,
    /** enableDataVars */
    false);
  }
}

/**
 * @param {!Window} win
 * @return {!Element}
 * @private
 */
function getRootElement_(win) {
  var root = Services.ampdocServiceFor(win).getSingleDoc().getRootNode();
  return dev().assertElement(root.documentElement || root.body || root);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVycm9yLXJlcG9ydGluZy5qcyJdLCJuYW1lcyI6WyJVU0VSX0VSUk9SX1NFTlRJTkVMIiwiaXNVc2VyRXJyb3JFbWJlZE1lc3NhZ2UiLCJpc1VzZXJFcnJvck1lc3NhZ2UiLCJtb2RlIiwidHJpZ2dlckFuYWx5dGljc0V2ZW50IiwidXJscyIsIkFtcEV2ZW50cyIsImR1cGxpY2F0ZUVycm9ySWZOZWNlc3NhcnkiLCJmaW5kSW5kZXgiLCJleHBvbmVudGlhbEJhY2tvZmYiLCJkaWN0IiwiaXNMb2FkRXJyb3JNZXNzYWdlIiwiZXhwZXJpbWVudFRvZ2dsZXNPck51bGwiLCJnZXRCaW5hcnlUeXBlIiwiaXNDYW5hcnkiLCJkZXYiLCJzZXRSZXBvcnRFcnJvciIsImdldE1vZGUiLCJTZXJ2aWNlcyIsIm1ha2VCb2R5VmlzaWJsZVJlY292ZXJ5IiwiaXNQcm94eU9yaWdpbiIsIkNBTkNFTExFRCIsIkJMT0NLX0JZX0NPTlNFTlQiLCJBQk9SVEVEIiwiTk9OX0FDVElPTkFCTEVfRVJST1JfVEhST1RUTEVfVEhSRVNIT0xEIiwiVVNFUl9FUlJPUl9USFJPVFRMRV9USFJFU0hPTEQiLCJCRVRBX0VSUk9SX1JFUE9SVF9VUkxfRlJFUSIsImFjY3VtdWxhdGVkRXJyb3JNZXNzYWdlcyIsInNlbGYiLCJfX0FNUF9FUlJPUlMiLCJwdXNoTGltaXQiLCJhcnJheSIsImVsZW1lbnQiLCJsaW1pdCIsImxlbmd0aCIsInNwbGljZSIsInB1c2giLCJyZXBvcnRpbmdCYWNrb2ZmIiwid29yayIsInRyeUpzb25TdHJpbmdpZnkiLCJ2YWx1ZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJlIiwiU3RyaW5nIiwicmVwb3J0RXJyb3JGb3JXaW4iLCJ3aW4iLCJlcnJvciIsIm9wdF9hc3NvY2lhdGVkRWxlbWVudCIsInJlcG9ydEVycm9yIiwibWVzc2FnZSIsInJlcG9ydEVycm9yVG9BbmFseXRpY3MiLCJpc1ZhbGlkRXJyb3IiLCJ1bmRlZmluZWQiLCJvcmlnRXJyb3IiLCJFcnJvciIsImxvY2FsRGV2IiwidGVzdCIsInNldFRpbWVvdXQiLCJyZXRocm93IiwicmVwb3J0ZWQiLCJtZXNzYWdlQXJyYXkiLCJlbEluZGV4IiwiaXRlbSIsInRhZ05hbWUiLCJhc3NvY2lhdGVkRWxlbWVudCIsImNsYXNzTGlzdCIsImFkZCIsImRldmVsb3BtZW50Iiwic2V0QXR0cmlidXRlIiwiY29uc29sZSIsImV4cGVjdGVkIiwib3V0cHV0IiwibG9nIiwiYXBwbHkiLCJjYWxsIiwiaXNNaW5pZmllZCIsInN0YWNrIiwiZGlzcGF0Y2hDdXN0b21FdmVudEZvclRlc3RpbmciLCJFUlJPUiIsIm9uRXJyb3IiLCJlcnJvclJlcG9ydGluZ0Vycm9yIiwiY2FuY2VsbGF0aW9uIiwiaXNDYW5jZWxsYXRpb24iLCJlcnJvck9yTWVzc2FnZSIsInN0YXJ0c1dpdGgiLCJibG9ja2VkQnlDb25zZW50RXJyb3IiLCJpc0Jsb2NrZWRCeUNvbnNlbnQiLCJpbnN0YWxsRXJyb3JSZXBvcnRpbmciLCJvbmVycm9yIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50IiwicmVhc29uIiwicHJldmVudERlZmF1bHQiLCJmaWxlbmFtZSIsImxpbmUiLCJjb2wiLCJkb2N1bWVudCIsImhhc05vbkFtcEpzIiwiZGV0ZWN0Tm9uQW1wSnMiLCJpZ25vcmUiLCJNYXRoIiwicmFuZG9tIiwiZGF0YSIsImdldEVycm9yUmVwb3J0RGF0YSIsInJlcG9ydEVycm9yVG9TZXJ2ZXJPclZpZXdlciIsImNhdGNoIiwiY2hvb3NlUmVwb3J0aW5nVXJsXyIsImJldGFFcnJvclJlcG9ydGluZyIsImVycm9yUmVwb3J0aW5nIiwibWF5YmVSZXBvcnRFcnJvclRvVmlld2VyIiwidGhlbiIsInJlcG9ydGVkRXJyb3JUb1ZpZXdlciIsInhociIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsInNlbmQiLCJhbXBkb2NTZXJ2aWNlIiwiYW1wZG9jU2VydmljZUZvciIsImlzU2luZ2xlRG9jIiwiUHJvbWlzZSIsInJlc29sdmUiLCJhbXBkb2NTaW5nbGUiLCJnZXRTaW5nbGVEb2MiLCJodG1sRWxlbWVudCIsImdldFJvb3ROb2RlIiwiZG9jdW1lbnRFbGVtZW50IiwiZG9jT3B0ZWRJbiIsImhhc0F0dHJpYnV0ZSIsInZpZXdlciIsInZpZXdlckZvckRvYyIsImhhc0NhcGFiaWxpdHkiLCJpc1RydXN0ZWRWaWV3ZXIiLCJ2aWV3ZXJUcnVzdGVkIiwic2VuZE1lc3NhZ2UiLCJlcnJvclJlcG9ydGluZ0RhdGFGb3JWaWV3ZXIiLCJlcnJvclJlcG9ydERhdGEiLCJidWlsZEVycm9yTWVzc2FnZV8iLCJkZXRhY2hlZFdpbmRvdyIsIndpbmRvdyIsInRocm90dGxlQmFzZSIsImlzVXNlckVycm9yIiwiT2JqZWN0IiwiY3JlYXRlIiwicnR2VmVyc2lvbiIsInJlcGxhY2UiLCJydW50aW1lIiwiY29udGV4dCIsImxvY2F0aW9uIiwiYTRhSWQiLCJhbmNlc3Rvck9yaWdpbnMiLCJ2aWV3ZXJTdGF0ZSIsInBhcmVudCIsIkFNUCIsInJlc29sdmVkVmlld2VyVXJsIiwiZ2V0UmVzb2x2ZWRWaWV3ZXJVcmwiLCJtZXNzYWdpbmdPcmlnaW4iLCJtYXliZUdldE1lc3NhZ2luZ09yaWdpbiIsImV4cHMiLCJleHBlcmltZW50cyIsImV4cCIsIm9uIiwiam9pbiIsImFyZ3MiLCJpZ25vcmVTdGFjayIsInJlZmVycmVyIiwiaGFzaCIsInNjcmlwdHMiLCJxdWVyeVNlbGVjdG9yQWxsIiwiaSIsInNyYyIsInRvTG93ZXJDYXNlIiwicmVzZXRBY2N1bXVsYXRlZEVycm9yTWVzc2FnZXNGb3JUZXN0aW5nIiwidmFycyIsIm5hbWUiLCJnZXRSb290RWxlbWVudF8iLCJyb290IiwiYXNzZXJ0RWxlbWVudCIsImJvZHkiXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FDRUEsbUJBREYsRUFFRUMsdUJBRkYsRUFHRUMsa0JBSEY7QUFLQSxPQUFPLEtBQUtDLElBQVo7QUFFQSxT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dGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE1IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtcbiAgVVNFUl9FUlJPUl9TRU5USU5FTCxcbiAgaXNVc2VyRXJyb3JFbWJlZE1lc3NhZ2UsXG4gIGlzVXNlckVycm9yTWVzc2FnZSxcbn0gZnJvbSAnI2NvcmUvZXJyb3IvbWVzc2FnZS1oZWxwZXJzJztcbmltcG9ydCAqIGFzIG1vZGUgZnJvbSAnI2NvcmUvbW9kZSc7XG5cbmltcG9ydCB7dHJpZ2dlckFuYWx5dGljc0V2ZW50fSBmcm9tICcuL2FuYWx5dGljcyc7XG5pbXBvcnQge3VybHN9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7QW1wRXZlbnRzfSBmcm9tICcuL2NvcmUvY29uc3RhbnRzL2FtcC1ldmVudHMnO1xuaW1wb3J0IHtkdXBsaWNhdGVFcnJvcklmTmVjZXNzYXJ5fSBmcm9tICcuL2NvcmUvZXJyb3InO1xuaW1wb3J0IHtmaW5kSW5kZXh9IGZyb20gJy4vY29yZS90eXBlcy9hcnJheSc7XG5pbXBvcnQge2V4cG9uZW50aWFsQmFja29mZn0gZnJvbSAnLi9jb3JlL3R5cGVzL2Z1bmN0aW9uL2V4cG9uZW50aWFsLWJhY2tvZmYnO1xuaW1wb3J0IHtkaWN0fSBmcm9tICcuL2NvcmUvdHlwZXMvb2JqZWN0JztcbmltcG9ydCB7aXNMb2FkRXJyb3JNZXNzYWdlfSBmcm9tICcuL2V2ZW50LWhlbHBlcic7XG5pbXBvcnQge2V4cGVyaW1lbnRUb2dnbGVzT3JOdWxsLCBnZXRCaW5hcnlUeXBlLCBpc0NhbmFyeX0gZnJvbSAnLi9leHBlcmltZW50cyc7XG5pbXBvcnQge2Rldiwgc2V0UmVwb3J0RXJyb3J9IGZyb20gJy4vbG9nJztcbmltcG9ydCB7Z2V0TW9kZX0gZnJvbSAnLi9tb2RlJztcbmltcG9ydCB7U2VydmljZXN9IGZyb20gJy4vc2VydmljZSc7XG5pbXBvcnQge21ha2VCb2R5VmlzaWJsZVJlY292ZXJ5fSBmcm9tICcuL3N0eWxlLWluc3RhbGxlcic7XG5pbXBvcnQge2lzUHJveHlPcmlnaW59IGZyb20gJy4vdXJsJztcblxuZXhwb3J0IHtzZXRSZXBvcnRFcnJvcn07XG5cbi8qKlxuICogQGNvbnN0IHtzdHJpbmd9XG4gKi9cbmNvbnN0IENBTkNFTExFRCA9ICdDQU5DRUxMRUQnO1xuXG4vKipcbiAqIEBjb25zdCB7c3RyaW5nfVxuICovXG5jb25zdCBCTE9DS19CWV9DT05TRU5UID0gJ0JMT0NLX0JZX0NPTlNFTlQnO1xuXG4vKipcbiAqIEBjb25zdCB7c3RyaW5nfVxuICovXG5jb25zdCBBQk9SVEVEID0gJ0Fib3J0RXJyb3InO1xuXG4vKipcbiAqIFRoZSB0aHJlc2hvbGQgZm9yIGVycm9ycyB0aHJvdHRsZWQgYmVjYXVzZSBub3RoaW5nIGNhbiBiZSBkb25lIGFib3V0XG4gKiB0aGVtLCBidXQgd2UnZCBzdGlsbCBsaWtlIHRvIHJlcG9ydCB0aGUgcm91Z2ggbnVtYmVyLlxuICogQGNvbnN0IHtudW1iZXJ9XG4gKi9cbmNvbnN0IE5PTl9BQ1RJT05BQkxFX0VSUk9SX1RIUk9UVExFX1RIUkVTSE9MRCA9IDAuMDAxO1xuXG4vKipcbiAqIFRoZSB0aHJlc2hvbGQgZm9yIGVycm9ycyB0aHJvdHRsZWQgYmVjYXVzZSBub3RoaW5nIGNhbiBiZSBkb25lIGFib3V0XG4gKiB0aGVtLCBidXQgd2UnZCBzdGlsbCBsaWtlIHRvIHJlcG9ydCB0aGUgcm91Z2ggbnVtYmVyLlxuICogQGNvbnN0IHtudW1iZXJ9XG4gKi9cbmNvbnN0IFVTRVJfRVJST1JfVEhST1RUTEVfVEhSRVNIT0xEID0gMC4xO1xuXG4vKipcbiAqIENoYW5jZSB0byBwb3N0IHRvIHRoZSBuZXcgZXJyb3IgcmVwb3J0aW5nIGVuZHBvaW50LlxuICogQGNvbnN0IHtudW1iZXJ9XG4gKi9cbmNvbnN0IEJFVEFfRVJST1JfUkVQT1JUX1VSTF9GUkVRID0gMC4xO1xuXG4vKipcbiAqIENvbGxlY3RzIGVycm9yIG1lc3NhZ2VzLCBzbyB0aGV5IGNhbiBiZSBpbmNsdWRlZCBpbiBzdWJzZXF1ZW50IHJlcG9ydHMuXG4gKiBUaGF0IGFsbG93cyBpZGVudGlmeWluZyBlcnJvcnMgdGhhdCBtaWdodCBiZSBjYXVzZWQgYnkgcHJldmlvdXMgZXJyb3JzLlxuICovXG5sZXQgYWNjdW11bGF0ZWRFcnJvck1lc3NhZ2VzID0gc2VsZi5fX0FNUF9FUlJPUlMgfHwgW107XG4vLyBVc2UgYSB0cnVlIGdsb2JhbCwgdG8gYXZvaWQgbXVsdGktbW9kdWxlIGluY2x1c2lvbiBpc3N1ZXMuXG5zZWxmLl9fQU1QX0VSUk9SUyA9IGFjY3VtdWxhdGVkRXJyb3JNZXNzYWdlcztcblxuLyoqXG4gKiBQdXNoZXMgZWxlbWVudCBpbnRvIGFycmF5LCBrZWVwaW5nIGF0IG1vc3QgdGhlIG1vc3QgcmVjZW50IGxpbWl0IGVsZW1lbnRzXG4gKlxuICogQHBhcmFtIHshQXJyYXk8VD59IGFycmF5XG4gKiBAcGFyYW0ge1R9IGVsZW1lbnRcbiAqIEBwYXJhbSB7bnVtYmVyfSBsaW1pdFxuICogQHRlbXBsYXRlIFRcbiAqL1xuZnVuY3Rpb24gcHVzaExpbWl0KGFycmF5LCBlbGVtZW50LCBsaW1pdCkge1xuICBpZiAoYXJyYXkubGVuZ3RoID49IGxpbWl0KSB7XG4gICAgYXJyYXkuc3BsaWNlKDAsIGFycmF5Lmxlbmd0aCAtIGxpbWl0ICsgMSk7XG4gIH1cbiAgYXJyYXkucHVzaChlbGVtZW50KTtcbn1cblxuLyoqXG4gKiBBIHdyYXBwZXIgYXJvdW5kIG91ciBleHBvbmVudGlhbEJhY2tvZmYsIHRvIGxhenkgaW5pdGlhbGl6ZSBpdCB0byBhdm9pZCBhblxuICogdW4tRENFJ2FibGUgc2lkZS1lZmZlY3QuXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKCl9IHdvcmsgdGhlIGZ1bmN0aW9uIHRvIGV4ZWN1dGUgYWZ0ZXIgYmFja29mZlxuICogQHJldHVybiB7bnVtYmVyfSB0aGUgc2V0VGltZW91dCBpZFxuICovXG5sZXQgcmVwb3J0aW5nQmFja29mZiA9IGZ1bmN0aW9uICh3b3JrKSB7XG4gIC8vIFNldCByZXBvcnRpbmdCYWNrb2ZmIGFzIHRoZSBsYXp5LWNyZWF0ZWQgZnVuY3Rpb24uIEpTIFZvb29kb29vby5cbiAgcmVwb3J0aW5nQmFja29mZiA9IGV4cG9uZW50aWFsQmFja29mZigxLjUpO1xuICByZXR1cm4gcmVwb3J0aW5nQmFja29mZih3b3JrKTtcbn07XG5cbi8qKlxuICogQXR0ZW1wdHMgdG8gc3RyaW5naWZ5IGEgdmFsdWUsIGZhbGxpbmcgYmFjayB0byBTdHJpbmcuXG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIHRyeUpzb25TdHJpbmdpZnkodmFsdWUpIHtcbiAgdHJ5IHtcbiAgICAvLyBDYXN0IGlzIGZpbmUsIGJlY2F1c2Ugd2UgcmVhbGx5IGRvbid0IGNhcmUgaGVyZS4gSnVzdCB0cnlpbmcuXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KC8qKiBAdHlwZSB7IUpzb25PYmplY3R9ICovICh2YWx1ZSkpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIFN0cmluZyh2YWx1ZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHBhcmFtIHsqfSBlcnJvclxuICogQHBhcmFtIHshRWxlbWVudD19IG9wdF9hc3NvY2lhdGVkRWxlbWVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVwb3J0RXJyb3JGb3JXaW4od2luLCBlcnJvciwgb3B0X2Fzc29jaWF0ZWRFbGVtZW50KSB7XG4gIHJlcG9ydEVycm9yKGVycm9yLCBvcHRfYXNzb2NpYXRlZEVsZW1lbnQpO1xuICBpZiAoXG4gICAgZXJyb3IgJiZcbiAgICAhIXdpbiAmJlxuICAgIGlzVXNlckVycm9yTWVzc2FnZShlcnJvci5tZXNzYWdlKSAmJlxuICAgICFpc1VzZXJFcnJvckVtYmVkTWVzc2FnZShlcnJvci5tZXNzYWdlKVxuICApIHtcbiAgICByZXBvcnRFcnJvclRvQW5hbHl0aWNzKC8qKiBAdHlwZSB7IUVycm9yfSAqLyAoZXJyb3IpLCB3aW4pO1xuICB9XG59XG5cbi8qKlxuICogUmVwb3J0cyBhbiBlcnJvci4gSWYgdGhlIGVycm9yIGhhcyBhbiBcImFzc29jaWF0ZWRFbGVtZW50XCIgcHJvcGVydHlcbiAqIHRoZSBlbGVtZW50IGlzIG1hcmtlZCB3aXRoIHRoZSBgaS1hbXBodG1sLWVsZW1lbnQtZXJyb3JgIGFuZCBkaXNwbGF5c1xuICogdGhlIG1lc3NhZ2UgaXRzZWxmLiBUaGUgbWVzc2FnZSBpcyBhbHdheXMgc2VuZCB0byB0aGUgY29uc29sZS5cbiAqIElmIHRoZSBlcnJvciBoYXMgYSBcIm1lc3NhZ2VBcnJheVwiIHByb3BlcnR5LCB0aGF0IGFycmF5IGlzIGxvZ2dlZC5cbiAqIFRoaXMgd2F5IG9uZSBnZXRzIHRoZSBuYXRpdmUgZmlkZWxpdHkgb2YgdGhlIGNvbnNvbGUgZm9yIHRoaW5ncyBsaWtlXG4gKiBlbGVtZW50cyBpbnN0ZWFkIG9mIHN0cmluZ2lmaWNhdGlvbi5cbiAqIEBwYXJhbSB7Kn0gZXJyb3JcbiAqIEBwYXJhbSB7IUVsZW1lbnQ9fSBvcHRfYXNzb2NpYXRlZEVsZW1lbnRcbiAqIEByZXR1cm4geyFFcnJvcn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlcG9ydEVycm9yKGVycm9yLCBvcHRfYXNzb2NpYXRlZEVsZW1lbnQpIHtcbiAgdHJ5IHtcbiAgICAvLyBDb252ZXJ0IGVycm9yIHRvIHRoZSBleHBlY3RlZCB0eXBlLlxuICAgIGxldCBpc1ZhbGlkRXJyb3I7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICBpZiAoZXJyb3IubWVzc2FnZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGVycm9yID0gZHVwbGljYXRlRXJyb3JJZk5lY2Vzc2FyeSgvKiogQHR5cGUgeyFFcnJvcn0gKi8gKGVycm9yKSk7XG4gICAgICAgIGlzVmFsaWRFcnJvciA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBvcmlnRXJyb3IgPSBlcnJvcjtcbiAgICAgICAgZXJyb3IgPSBuZXcgRXJyb3IodHJ5SnNvblN0cmluZ2lmeShvcmlnRXJyb3IpKTtcbiAgICAgICAgZXJyb3Iub3JpZ0Vycm9yID0gb3JpZ0Vycm9yO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBlcnJvciA9IG5ldyBFcnJvcignVW5rbm93biBlcnJvcicpO1xuICAgIH1cbiAgICAvLyBSZXBvcnQgaWYgZXJyb3IgaXMgbm90IGFuIGV4cGVjdGVkIHR5cGUuXG4gICAgaWYgKCFpc1ZhbGlkRXJyb3IgJiYgZ2V0TW9kZSgpLmxvY2FsRGV2ICYmICFnZXRNb2RlKCkudGVzdCkge1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnN0IHJldGhyb3cgPSBuZXcgRXJyb3IoXG4gICAgICAgICAgJ19yZXBvcnRlZF8gRXJyb3IgcmVwb3J0ZWQgaW5jb3JyZWN0bHk6ICcgKyBlcnJvclxuICAgICAgICApO1xuICAgICAgICB0aHJvdyByZXRocm93O1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKGVycm9yLnJlcG9ydGVkKSB7XG4gICAgICByZXR1cm4gLyoqIEB0eXBlIHshRXJyb3J9ICovIChlcnJvcik7XG4gICAgfVxuICAgIGVycm9yLnJlcG9ydGVkID0gdHJ1ZTtcblxuICAgIC8vIGBhc3NvY2lhdGVkRWxlbWVudGAgaXMgdXNlZCB0byBhZGQgdGhlIGktYW1waHRtbC1lcnJvciBjbGFzczsgaW5cbiAgICAvLyBgI2RldmVsb3BtZW50PTFgIG1vZGUsIGl0IGFsc28gYWRkcyBgaS1hbXBodG1sLWVsZW1lbnQtZXJyb3JgIHRvIHRoZVxuICAgIC8vIGVsZW1lbnQgYW5kIHNldHMgdGhlIGBlcnJvci1tZXNzYWdlYCBhdHRyaWJ1dGUuXG4gICAgaWYgKGVycm9yLm1lc3NhZ2VBcnJheSkge1xuICAgICAgY29uc3QgZWxJbmRleCA9IGZpbmRJbmRleChlcnJvci5tZXNzYWdlQXJyYXksIChpdGVtKSA9PiBpdGVtPy50YWdOYW1lKTtcbiAgICAgIGlmIChlbEluZGV4ID4gLTEpIHtcbiAgICAgICAgZXJyb3IuYXNzb2NpYXRlZEVsZW1lbnQgPSBlcnJvci5tZXNzYWdlQXJyYXlbZWxJbmRleF07XG4gICAgICB9XG4gICAgfVxuICAgIC8vIFVwZGF0ZSBlbGVtZW50LlxuICAgIGNvbnN0IGVsZW1lbnQgPSBvcHRfYXNzb2NpYXRlZEVsZW1lbnQgfHwgZXJyb3IuYXNzb2NpYXRlZEVsZW1lbnQ7XG4gICAgaWYgKGVsZW1lbnQgJiYgZWxlbWVudC5jbGFzc0xpc3QpIHtcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLWVycm9yJyk7XG4gICAgICBpZiAoZ2V0TW9kZSgpLmRldmVsb3BtZW50KSB7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLWVsZW1lbnQtZXJyb3InKTtcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2Vycm9yLW1lc3NhZ2UnLCBlcnJvci5tZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXBvcnQgdG8gY29uc29sZS5cbiAgICBpZiAoXG4gICAgICBzZWxmLmNvbnNvbGUgJiZcbiAgICAgIChpc1VzZXJFcnJvck1lc3NhZ2UoZXJyb3IubWVzc2FnZSkgfHxcbiAgICAgICAgIWVycm9yLmV4cGVjdGVkIHx8XG4gICAgICAgIGdldE1vZGUoKS5sb2NhbERldilcbiAgICApIHtcbiAgICAgIGNvbnN0IG91dHB1dCA9IGNvbnNvbGUuZXJyb3IgfHwgY29uc29sZS5sb2c7XG4gICAgICBpZiAoZXJyb3IubWVzc2FnZUFycmF5KSB7XG4gICAgICAgIG91dHB1dC5hcHBseShjb25zb2xlLCBlcnJvci5tZXNzYWdlQXJyYXkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgICBvdXRwdXQuY2FsbChjb25zb2xlLCBlcnJvci5tZXNzYWdlLCBlbGVtZW50KTtcbiAgICAgICAgfSBlbHNlIGlmICghbW9kZS5pc01pbmlmaWVkKCkpIHtcbiAgICAgICAgICBvdXRwdXQuY2FsbChjb25zb2xlLCBlcnJvci5zdGFjayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb3V0cHV0LmNhbGwoY29uc29sZSwgZXJyb3IubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGVsZW1lbnQgJiYgZWxlbWVudC5kaXNwYXRjaEN1c3RvbUV2ZW50Rm9yVGVzdGluZykge1xuICAgICAgZWxlbWVudC5kaXNwYXRjaEN1c3RvbUV2ZW50Rm9yVGVzdGluZyhBbXBFdmVudHMuRVJST1IsIGVycm9yLm1lc3NhZ2UpO1xuICAgIH1cblxuICAgIC8vICdjYWxsJyB0byBtYWtlIGxpbnRlciBoYXBweS4gQW5kIC5jYWxsIHRvIG1ha2UgY29tcGlsZXIgaGFwcHlcbiAgICAvLyB0aGF0IGV4cGVjdHMgc29tZSBAdGhpcy5cbiAgICBvbkVycm9yWydjYWxsJ10oc2VsZiwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBlcnJvcik7XG4gIH0gY2F0Y2ggKGVycm9yUmVwb3J0aW5nRXJyb3IpIHtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIHRocm93IGVycm9yUmVwb3J0aW5nRXJyb3I7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIC8qKiBAdHlwZSB7IUVycm9yfSAqLyAoZXJyb3IpO1xufVxuXG4vKipcbiAqIFJldHVybnMgYW4gZXJyb3IgZm9yIGEgY2FuY2VsbGF0aW9uIG9mIGEgcHJvbWlzZS5cbiAqIEByZXR1cm4geyFFcnJvcn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhbmNlbGxhdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBFcnJvcihDQU5DRUxMRUQpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7Kn0gZXJyb3JPck1lc3NhZ2VcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0NhbmNlbGxhdGlvbihlcnJvck9yTWVzc2FnZSkge1xuICBpZiAoIWVycm9yT3JNZXNzYWdlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh0eXBlb2YgZXJyb3JPck1lc3NhZ2UgPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZXJyb3JPck1lc3NhZ2Uuc3RhcnRzV2l0aChDQU5DRUxMRUQpO1xuICB9XG4gIGlmICh0eXBlb2YgZXJyb3JPck1lc3NhZ2UubWVzc2FnZSA9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBlcnJvck9yTWVzc2FnZS5tZXNzYWdlLnN0YXJ0c1dpdGgoQ0FOQ0VMTEVEKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBlcnJvciBmb3IgY29tcG9uZW50IGJsb2NrZWQgYnkgY29uc2VudFxuICogQHJldHVybiB7IUVycm9yfVxuICovXG5leHBvcnQgZnVuY3Rpb24gYmxvY2tlZEJ5Q29uc2VudEVycm9yKCkge1xuICByZXR1cm4gbmV3IEVycm9yKEJMT0NLX0JZX0NPTlNFTlQpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7Kn0gZXJyb3JPck1lc3NhZ2VcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0Jsb2NrZWRCeUNvbnNlbnQoZXJyb3JPck1lc3NhZ2UpIHtcbiAgaWYgKCFlcnJvck9yTWVzc2FnZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAodHlwZW9mIGVycm9yT3JNZXNzYWdlID09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGVycm9yT3JNZXNzYWdlLnN0YXJ0c1dpdGgoQkxPQ0tfQllfQ09OU0VOVCk7XG4gIH1cbiAgaWYgKHR5cGVvZiBlcnJvck9yTWVzc2FnZS5tZXNzYWdlID09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGVycm9yT3JNZXNzYWdlLm1lc3NhZ2Uuc3RhcnRzV2l0aChCTE9DS19CWV9DT05TRU5UKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogSW5zdGFsbCBoYW5kbGluZyBvZiBnbG9iYWwgdW5oYW5kbGVkIGV4Y2VwdGlvbnMuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFsbEVycm9yUmVwb3J0aW5nKHdpbikge1xuICB3aW4ub25lcnJvciA9IC8qKiBAdHlwZSB7IUZ1bmN0aW9ufSAqLyAob25FcnJvcik7XG4gIHdpbi5hZGRFdmVudExpc3RlbmVyKCd1bmhhbmRsZWRyZWplY3Rpb24nLCAoZXZlbnQpID0+IHtcbiAgICBpZiAoXG4gICAgICBldmVudC5yZWFzb24gJiZcbiAgICAgIChldmVudC5yZWFzb24ubWVzc2FnZSA9PT0gQ0FOQ0VMTEVEIHx8XG4gICAgICAgIGV2ZW50LnJlYXNvbi5tZXNzYWdlID09PSBCTE9DS19CWV9DT05TRU5UIHx8XG4gICAgICAgIGV2ZW50LnJlYXNvbi5tZXNzYWdlID09PSBBQk9SVEVEKVxuICAgICkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmVwb3J0RXJyb3IoZXZlbnQucmVhc29uIHx8IG5ldyBFcnJvcigncmVqZWN0ZWQgcHJvbWlzZSAnICsgZXZlbnQpKTtcbiAgfSk7XG59XG5cbi8qKlxuICogU2lnbmF0dXJlIGRlc2lnbmVkLCBzbyBpdCBjYW4gd29yayB3aXRoIHdpbmRvdy5vbmVycm9yXG4gKiBAcGFyYW0ge3N0cmluZ3x1bmRlZmluZWR9IG1lc3NhZ2VcbiAqIEBwYXJhbSB7c3RyaW5nfHVuZGVmaW5lZH0gZmlsZW5hbWVcbiAqIEBwYXJhbSB7c3RyaW5nfHVuZGVmaW5lZH0gbGluZVxuICogQHBhcmFtIHtzdHJpbmd8dW5kZWZpbmVkfSBjb2xcbiAqIEBwYXJhbSB7Knx1bmRlZmluZWR9IGVycm9yXG4gKiBAdGhpcyB7IVdpbmRvd3x1bmRlZmluZWR9XG4gKi9cbmZ1bmN0aW9uIG9uRXJyb3IobWVzc2FnZSwgZmlsZW5hbWUsIGxpbmUsIGNvbCwgZXJyb3IpIHtcbiAgLy8gTWFrZSBhbiBhdHRlbXB0IHRvIHVuaGlkZSB0aGUgYm9keSBidXQgZG9uJ3QgaWYgdGhlIGVycm9yIGlzIGFjdHVhbGx5IGV4cGVjdGVkLlxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbG9jYWwvbm8taW52YWxpZC10aGlzXG4gIGlmICh0aGlzICYmIHRoaXMuZG9jdW1lbnQgJiYgKCFlcnJvciB8fCAhZXJyb3IuZXhwZWN0ZWQpKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGxvY2FsL25vLWludmFsaWQtdGhpc1xuICAgIG1ha2VCb2R5VmlzaWJsZVJlY292ZXJ5KHRoaXMuZG9jdW1lbnQpO1xuICB9XG4gIGlmIChnZXRNb2RlKCkubG9jYWxEZXYgfHwgZ2V0TW9kZSgpLmRldmVsb3BtZW50IHx8IGdldE1vZGUoKS50ZXN0KSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGxldCBoYXNOb25BbXBKcyA9IGZhbHNlO1xuICB0cnkge1xuICAgIGhhc05vbkFtcEpzID0gZGV0ZWN0Tm9uQW1wSnMoc2VsZik7XG4gIH0gY2F0Y2ggKGlnbm9yZSkge1xuICAgIC8vIElnbm9yZSBlcnJvcnMgZHVyaW5nIGVycm9yIHJlcG9ydCBnZW5lcmF0aW9uLlxuICB9XG4gIGlmIChoYXNOb25BbXBKcyAmJiBNYXRoLnJhbmRvbSgpID4gMC4wMSkge1xuICAgIC8vIE9ubHkgcmVwb3J0IDElIG9mIGVycm9ycyBvbiBwYWdlcyB3aXRoIG5vbi1BTVAgSlMuXG4gICAgLy8gVGhlc2UgZXJyb3JzIGNhbiBhbG1vc3QgbmV2ZXIgYmUgYWN0ZWQgdXBvbiwgYnV0IHNwaWtlcyBzdWNoIGFzXG4gICAgLy8gZHVlIHRvIGJ1Z2d5IGJyb3dzZXIgZXh0ZW5zaW9ucyBtYXkgYmUgaGVscGZ1bCB0byBub3RpZnkgYXV0aG9ycy5cbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgZGF0YSA9IGdldEVycm9yUmVwb3J0RGF0YShcbiAgICBtZXNzYWdlLFxuICAgIGZpbGVuYW1lLFxuICAgIGxpbmUsXG4gICAgY29sLFxuICAgIGVycm9yLFxuICAgIGhhc05vbkFtcEpzXG4gICk7XG4gIGlmIChkYXRhKSB7XG4gICAgcmVwb3J0aW5nQmFja29mZigoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gcmVwb3J0RXJyb3JUb1NlcnZlck9yVmlld2VyKFxuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBsb2NhbC9uby1pbnZhbGlkLXRoaXNcbiAgICAgICAgICB0aGlzLFxuICAgICAgICAgIC8qKiBAdHlwZSB7IUpzb25PYmplY3R9ICovXG4gICAgICAgICAgKGRhdGEpXG4gICAgICAgICkuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgIC8vIGNhdGNoIGFzeW5jIGVycm9ycyB0byBhdm9pZCByZWN1cnNpdmUgZXJyb3JzLlxuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gY2F0Y2ggYXN5bmMgZXJyb3JzIHRvIGF2b2lkIHJlY3Vyc2l2ZSBlcnJvcnMuXG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIHRoZSBlcnJvciByZXBvcnRpbmcgZW5kcG9pbnQgd2hpY2ggc2hvdWxkIGJlIHVzZWQuXG4gKiBJZiBjaGFuZ2luZyB0aGlzIFVSTCwga2VlcCBgZG9jcy9zcGVjL2FtcC1lcnJvcnMubWRgIGluIHN5bmMuXG4gKiBAcmV0dXJuIHtzdHJpbmd9IGVycm9yIHJlcG9ydGluZyBlbmRwb2ludCBVUkwuXG4gKi9cbmZ1bmN0aW9uIGNob29zZVJlcG9ydGluZ1VybF8oKSB7XG4gIHJldHVybiBNYXRoLnJhbmRvbSgpIDwgQkVUQV9FUlJPUl9SRVBPUlRfVVJMX0ZSRVFcbiAgICA/IHVybHMuYmV0YUVycm9yUmVwb3J0aW5nXG4gICAgOiB1cmxzLmVycm9yUmVwb3J0aW5nO1xufVxuXG4vKipcbiAqIFBhc3NlcyB0aGUgZ2l2ZW4gZXJyb3IgZGF0YSB0byBlaXRoZXIgc2VydmVyIG9yIHZpZXdlci5cbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcGFyYW0geyFKc29uT2JqZWN0fSBkYXRhIERhdGEgZnJvbSBgZ2V0RXJyb3JSZXBvcnREYXRhYC5cbiAqIEByZXR1cm4ge1Byb21pc2U8dW5kZWZpbmVkPn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlcG9ydEVycm9yVG9TZXJ2ZXJPclZpZXdlcih3aW4sIGRhdGEpIHtcbiAgLy8gUmVwb3J0IHRoZSBlcnJvciB0byB2aWV3ZXIgaWYgaXQgaGFzIHRoZSBjYXBhYmlsaXR5LiBUaGUgZGF0YSBwYXNzZWRcbiAgLy8gdG8gdGhlIHZpZXdlciBpcyBleGFjdGx5IHRoZSBzYW1lIGFzIHRoZSBkYXRhIHBhc3NlZCB0byB0aGUgc2VydmVyXG4gIC8vIGJlbG93LlxuXG4gIC8vIFRocm90dGxlIHJlcG9ydHMgZnJvbSBTdGFibGUgYnkgOTAlLlxuICBpZiAoZGF0YVsncHQnXSAmJiBNYXRoLnJhbmRvbSgpIDwgMC45KSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG5cbiAgcmV0dXJuIG1heWJlUmVwb3J0RXJyb3JUb1ZpZXdlcih3aW4sIGRhdGEpLnRoZW4oKHJlcG9ydGVkRXJyb3JUb1ZpZXdlcikgPT4ge1xuICAgIGlmICghcmVwb3J0ZWRFcnJvclRvVmlld2VyKSB7XG4gICAgICBjb25zdCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgIHhoci5vcGVuKCdQT1NUJywgY2hvb3NlUmVwb3J0aW5nVXJsXygpLCB0cnVlKTtcbiAgICAgIHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIFBhc3NlcyB0aGUgZ2l2ZW4gZXJyb3IgZGF0YSB0byB0aGUgdmlld2VyIGlmIHRoZSBmb2xsb3dpbmcgY3JpdGVyaWEgaXMgbWV0OlxuICogLSBUaGUgdmlld2VyIGlzIGEgdHJ1c3RlZCB2aWV3ZXJcbiAqIC0gVGhlIHZpZXdlciBoYXMgdGhlIGBlcnJvclJlcG9ydGVyYCBjYXBhYmlsaXR5XG4gKiAtIFRoZSBBTVAgZG9jIGlzIGluIHNpbmdsZSBkb2MgbW9kZVxuICogLSBUaGUgQU1QIGRvYyBpcyBvcHRlZC1pbiBmb3IgZXJyb3IgaW50ZXJjZXB0aW9uIChgPGh0bWw+YCB0YWcgaGFzIHRoZVxuICogICBgcmVwb3J0LWVycm9ycy10by12aWV3ZXJgIGF0dHJpYnV0ZSlcbiAqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHBhcmFtIHshSnNvbk9iamVjdH0gZGF0YSBEYXRhIGZyb20gYGdldEVycm9yUmVwb3J0RGF0YWAuXG4gKiBAcmV0dXJuIHshUHJvbWlzZTxib29sZWFuPn0gYFByb21pc2U8VHJ1ZT5gIGlmIHRoZSBlcnJvciB3YXMgc2VudCB0byB0aGVcbiAqICAgICB2aWV3ZXIsIGBQcm9taXNlPEZhbHNlPmAgb3RoZXJ3aXNlLlxuICogQHZpc2libGVGb3JUZXN0aW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXliZVJlcG9ydEVycm9yVG9WaWV3ZXIod2luLCBkYXRhKSB7XG4gIGNvbnN0IGFtcGRvY1NlcnZpY2UgPSBTZXJ2aWNlcy5hbXBkb2NTZXJ2aWNlRm9yKHdpbik7XG4gIGlmICghYW1wZG9jU2VydmljZS5pc1NpbmdsZURvYygpKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSk7XG4gIH1cbiAgY29uc3QgYW1wZG9jU2luZ2xlID0gYW1wZG9jU2VydmljZS5nZXRTaW5nbGVEb2MoKTtcbiAgY29uc3QgaHRtbEVsZW1lbnQgPSBhbXBkb2NTaW5nbGUuZ2V0Um9vdE5vZGUoKS5kb2N1bWVudEVsZW1lbnQ7XG4gIGNvbnN0IGRvY09wdGVkSW4gPSBodG1sRWxlbWVudC5oYXNBdHRyaWJ1dGUoJ3JlcG9ydC1lcnJvcnMtdG8tdmlld2VyJyk7XG4gIGlmICghZG9jT3B0ZWRJbikge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpO1xuICB9XG4gIGNvbnN0IHZpZXdlciA9IFNlcnZpY2VzLnZpZXdlckZvckRvYyhhbXBkb2NTaW5nbGUpO1xuICBpZiAoIXZpZXdlci5oYXNDYXBhYmlsaXR5KCdlcnJvclJlcG9ydGVyJykpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTtcbiAgfVxuICByZXR1cm4gdmlld2VyLmlzVHJ1c3RlZFZpZXdlcigpLnRoZW4oKHZpZXdlclRydXN0ZWQpID0+IHtcbiAgICBpZiAoIXZpZXdlclRydXN0ZWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdmlld2VyLnNlbmRNZXNzYWdlKCdlcnJvcicsIGVycm9yUmVwb3J0aW5nRGF0YUZvclZpZXdlcihkYXRhKSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0pO1xufVxuXG4vKipcbiAqIFN0cmlwcyBkb3duIHRoZSBlcnJvciByZXBvcnRpbmcgZGF0YSB0byBhIG1pbmltYWwgc2V0XG4gKiB0byBiZSBzZW50IHRvIHRoZSB2aWV3ZXIuXG4gKiBAcGFyYW0geyFKc29uT2JqZWN0fSBlcnJvclJlcG9ydERhdGFcbiAqIEByZXR1cm4geyFKc29uT2JqZWN0fVxuICogQHZpc2libGVGb3JUZXN0aW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlcnJvclJlcG9ydGluZ0RhdGFGb3JWaWV3ZXIoZXJyb3JSZXBvcnREYXRhKSB7XG4gIHJldHVybiBkaWN0KHtcbiAgICAnbSc6IGVycm9yUmVwb3J0RGF0YVsnbSddLCAvLyBtZXNzYWdlXG4gICAgJ2EnOiBlcnJvclJlcG9ydERhdGFbJ2EnXSwgLy8gaXNVc2VyRXJyb3JcbiAgICAncyc6IGVycm9yUmVwb3J0RGF0YVsncyddLCAvLyBlcnJvciBzdGFja1xuICAgICdlbCc6IGVycm9yUmVwb3J0RGF0YVsnZWwnXSwgLy8gdGFnTmFtZVxuICAgICdleCc6IGVycm9yUmVwb3J0RGF0YVsnZXgnXSwgLy8gZXhwZWN0ZWQgZXJyb3I/XG4gICAgJ3YnOiBlcnJvclJlcG9ydERhdGFbJ3YnXSwgLy8gcnVudGltZVxuICAgICdwdCc6IGVycm9yUmVwb3J0RGF0YVsncHQnXSwgLy8gaXMgcHJlLXRocm90dGxlZFxuICB9KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ3x1bmRlZmluZWR9ICBtZXNzYWdlXG4gKiBAcGFyYW0geyp8dW5kZWZpbmVkfSBlcnJvclxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBidWlsZEVycm9yTWVzc2FnZV8obWVzc2FnZSwgZXJyb3IpIHtcbiAgaWYgKGVycm9yKSB7XG4gICAgaWYgKGVycm9yLm1lc3NhZ2UpIHtcbiAgICAgIG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGlzIHNob3VsZCBuZXZlciBiZSBhIHN0cmluZywgYnV0IHNvbWV0aW1lcyBpdCBpcy5cbiAgICAgIG1lc3NhZ2UgPSBTdHJpbmcoZXJyb3IpO1xuICAgIH1cbiAgfVxuICBpZiAoIW1lc3NhZ2UpIHtcbiAgICBtZXNzYWdlID0gJ1Vua25vd24gZXJyb3InO1xuICB9XG5cbiAgcmV0dXJuIG1lc3NhZ2U7XG59XG5cbi8qKlxuICogU2lnbmF0dXJlIGRlc2lnbmVkLCBzbyBpdCBjYW4gd29yayB3aXRoIHdpbmRvdy5vbmVycm9yXG4gKiBAcGFyYW0ge3N0cmluZ3x1bmRlZmluZWR9IG1lc3NhZ2VcbiAqIEBwYXJhbSB7c3RyaW5nfHVuZGVmaW5lZH0gZmlsZW5hbWVcbiAqIEBwYXJhbSB7c3RyaW5nfHVuZGVmaW5lZH0gbGluZVxuICogQHBhcmFtIHtzdHJpbmd8dW5kZWZpbmVkfSBjb2xcbiAqIEBwYXJhbSB7Knx1bmRlZmluZWR9IGVycm9yXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGhhc05vbkFtcEpzXG4gKiBAcmV0dXJuIHshSnNvbk9iamVjdHx1bmRlZmluZWR9IFRoZSBkYXRhIHRvIHBvc3RcbiAqIHZpc2libGVGb3JUZXN0aW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRFcnJvclJlcG9ydERhdGEoXG4gIG1lc3NhZ2UsXG4gIGZpbGVuYW1lLFxuICBsaW5lLFxuICBjb2wsXG4gIGVycm9yLFxuICBoYXNOb25BbXBKc1xuKSB7XG4gIG1lc3NhZ2UgPSBidWlsZEVycm9yTWVzc2FnZV8obWVzc2FnZSwgZXJyb3IpO1xuICAvLyBBbiBcImV4cGVjdGVkXCIgZXJyb3IgaXMgc3RpbGwgYW4gZXJyb3IsIGkuZS4gc29tZSBmZWF0dXJlcyBhcmUgZGlzYWJsZWRcbiAgLy8gb3Igbm90IGZ1bmN0aW9uaW5nIGZ1bGx5IGJlY2F1c2Ugb2YgaXQuIEhvd2V2ZXIsIGl0J3MgYW4gZXhwZWN0ZWRcbiAgLy8gZXJyb3IuIEUuZy4gYXMgaXMgdGhlIGNhc2Ugd2l0aCBzb21lIGJyb3dzZXIgQVBJIG1pc3NpbmcgKHN0b3JhZ2UpLlxuICAvLyBUaHVzLCB0aGUgZXJyb3IgY2FuIGJlIGNsYXNzaWZpZWQgZGlmZmVyZW50bHkgYnkgbG9nIGFnZ3JlZ2F0b3JzLlxuICAvLyBUaGUgbWFpbiBnb2FsIGlzIHRvIG1vbml0b3IgdGhhdCBhbiBcImV4cGVjdGVkXCIgZXJyb3IgZG9lc24ndCBkZXRlcmlvcmF0ZVxuICAvLyBvdmVyIHRpbWUuIEl0J3MgaW1wb3NzaWJsZSB0byBjb21wbGV0ZWx5IGVsaW1pbmF0ZSBpdC5cbiAgbGV0IGV4cGVjdGVkID0gISEoZXJyb3IgJiYgZXJyb3IuZXhwZWN0ZWQpO1xuICBpZiAoL19yZXBvcnRlZF8vLnRlc3QobWVzc2FnZSkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKG1lc3NhZ2UgPT0gQ0FOQ0VMTEVEKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgZGV0YWNoZWRXaW5kb3cgPSAhKHNlbGYgJiYgc2VsZi53aW5kb3cpO1xuICBjb25zdCB0aHJvdHRsZUJhc2UgPSBNYXRoLnJhbmRvbSgpO1xuXG4gIC8vIFdlIHRocm90dGxlIGxvYWQgZXJyb3JzIGFuZCBnZW5lcmljIFwiU2NyaXB0IGVycm9yLlwiIGVycm9yc1xuICAvLyB0aGF0IGhhdmUgbm8gaW5mb3JtYXRpb24gYW5kIHRodXMgY2Fubm90IGJlIGFjdGVkIHVwb24uXG4gIGlmIChcbiAgICBpc0xvYWRFcnJvck1lc3NhZ2UobWVzc2FnZSkgfHxcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2FtcHByb2plY3QvYW1waHRtbC9pc3N1ZXMvNzM1M1xuICAgIC8vIGZvciBjb250ZXh0LlxuICAgIG1lc3NhZ2UgPT0gJ1NjcmlwdCBlcnJvci4nIHx8XG4gICAgLy8gV2luZG93IGhhcyBiZWNvbWUgZGV0YWNoZWQsIHJlYWxseSBhbnl0aGluZyBjYW4gaGFwcGVuXG4gICAgLy8gYXQgdGhpcyBwb2ludC5cbiAgICBkZXRhY2hlZFdpbmRvd1xuICApIHtcbiAgICBleHBlY3RlZCA9IHRydWU7XG5cbiAgICBpZiAodGhyb3R0bGVCYXNlID4gTk9OX0FDVElPTkFCTEVfRVJST1JfVEhST1RUTEVfVEhSRVNIT0xEKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgY29uc3QgaXNVc2VyRXJyb3IgPSBpc1VzZXJFcnJvck1lc3NhZ2UobWVzc2FnZSk7XG5cbiAgLy8gT25seSByZXBvcnQgYSBzdWJzZXQgb2YgdXNlciBlcnJvcnMuXG4gIGlmIChpc1VzZXJFcnJvciAmJiB0aHJvdHRsZUJhc2UgPiBVU0VSX0VSUk9SX1RIUk9UVExFX1RIUkVTSE9MRCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIFRoaXMgaXMgdGhlIEFwcCBFbmdpbmUgYXBwIGluXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbXBwcm9qZWN0L2Vycm9yLXRyYWNrZXJcbiAgLy8gSXQgc3RvcmVzIGVycm9yIHJlcG9ydHMgdmlhIGh0dHBzOi8vY2xvdWQuZ29vZ2xlLmNvbS9lcnJvci1yZXBvcnRpbmcvXG4gIC8vIGZvciBhbmFseXppbmcgcHJvZHVjdGlvbiBpc3N1ZXMuXG4gIGNvbnN0IGRhdGEgPSAvKiogQHR5cGUgeyFKc29uT2JqZWN0fSAqLyAoT2JqZWN0LmNyZWF0ZShudWxsKSk7XG4gIGRhdGFbJ3YnXSA9IGdldE1vZGUoKS5ydHZWZXJzaW9uO1xuICBkYXRhWydub0FtcCddID0gaGFzTm9uQW1wSnMgPyAnMScgOiAnMCc7XG4gIGRhdGFbJ20nXSA9IG1lc3NhZ2UucmVwbGFjZShVU0VSX0VSUk9SX1NFTlRJTkVMLCAnJyk7XG4gIGRhdGFbJ2EnXSA9IGlzVXNlckVycm9yID8gJzEnIDogJzAnO1xuXG4gIC8vIEVycm9ycyBhcmUgdGFnZ2VkIHdpdGggXCJleFwiIChcImV4cGVjdGVkXCIpIGxhYmVsIHRvIGFsbG93IGxvZ2dlcnMgdG9cbiAgLy8gY2xhc3NpZnkgdGhlc2UgZXJyb3JzIGFzIGJlbmNobWFya3MgYW5kIG5vdCBleGNlcHRpb25zLlxuICBkYXRhWydleCddID0gZXhwZWN0ZWQgPyAnMScgOiAnMCc7XG4gIGRhdGFbJ2R3J10gPSBkZXRhY2hlZFdpbmRvdyA/ICcxJyA6ICcwJztcblxuICBsZXQgcnVudGltZSA9ICcxcCc7XG4gIGlmIChJU19TWEcpIHtcbiAgICBydW50aW1lID0gJ3N4Zyc7XG4gICAgZGF0YVsnc3hnJ10gPSAnMSc7XG4gIH0gZWxzZSBpZiAoSVNfRVNNKSB7XG4gICAgcnVudGltZSA9ICdlc20nO1xuICAgIGRhdGFbJ2VzbSddID0gJzEnO1xuICB9IGVsc2UgaWYgKHNlbGYuY29udGV4dCAmJiBzZWxmLmNvbnRleHQubG9jYXRpb24pIHtcbiAgICBkYXRhWyczcCddID0gJzEnO1xuICAgIHJ1bnRpbWUgPSAnM3AnO1xuICB9IGVsc2UgaWYgKGdldE1vZGUoKS5ydW50aW1lKSB7XG4gICAgcnVudGltZSA9IGdldE1vZGUoKS5ydW50aW1lO1xuICB9XG5cbiAgZGF0YVsncnQnXSA9IHJ1bnRpbWU7XG5cbiAgLy8gQWRkIG91ciBhNGEgaWQgaWYgd2UgYXJlIGluYWJveFxuICBpZiAocnVudGltZSA9PT0gJ2luYWJveCcpIHtcbiAgICBkYXRhWydhZGlkJ10gPSBnZXRNb2RlKCkuYTRhSWQ7XG4gIH1cblxuICAvLyBUT0RPKGVyd2lubSk6IFJlbW92ZSBjYSB3aGVuIGFsbCBzeXN0ZW1zIHJlYWQgYGJ0YCBpbnN0ZWFkIG9mIGBjYWAgdG9cbiAgLy8gaWRlbnRpZnkganMgYmluYXJ5IHR5cGUuXG4gIGRhdGFbJ2NhJ10gPSBpc0NhbmFyeShzZWxmKSA/ICcxJyA6ICcwJztcblxuICAvLyBQYXNzIGJpbmFyeSB0eXBlLlxuICBkYXRhWydidCddID0gZ2V0QmluYXJ5VHlwZShzZWxmKTtcblxuICBpZiAoc2VsZi5sb2NhdGlvbi5hbmNlc3Rvck9yaWdpbnMgJiYgc2VsZi5sb2NhdGlvbi5hbmNlc3Rvck9yaWdpbnNbMF0pIHtcbiAgICBkYXRhWydvciddID0gc2VsZi5sb2NhdGlvbi5hbmNlc3Rvck9yaWdpbnNbMF07XG4gIH1cbiAgaWYgKHNlbGYudmlld2VyU3RhdGUpIHtcbiAgICBkYXRhWyd2cyddID0gc2VsZi52aWV3ZXJTdGF0ZTtcbiAgfVxuICAvLyBJcyBlbWJlZGRlZD9cbiAgaWYgKHNlbGYucGFyZW50ICYmIHNlbGYucGFyZW50ICE9IHNlbGYpIHtcbiAgICBkYXRhWydpZW0nXSA9ICcxJztcbiAgfVxuXG4gIGlmIChzZWxmLkFNUCAmJiBzZWxmLkFNUC52aWV3ZXIpIHtcbiAgICBjb25zdCByZXNvbHZlZFZpZXdlclVybCA9IHNlbGYuQU1QLnZpZXdlci5nZXRSZXNvbHZlZFZpZXdlclVybCgpO1xuICAgIGNvbnN0IG1lc3NhZ2luZ09yaWdpbiA9IHNlbGYuQU1QLnZpZXdlci5tYXliZUdldE1lc3NhZ2luZ09yaWdpbigpO1xuICAgIGlmIChyZXNvbHZlZFZpZXdlclVybCkge1xuICAgICAgZGF0YVsncnZ1J10gPSByZXNvbHZlZFZpZXdlclVybDtcbiAgICB9XG4gICAgaWYgKG1lc3NhZ2luZ09yaWdpbikge1xuICAgICAgZGF0YVsnbXNvJ10gPSBtZXNzYWdpbmdPcmlnaW47XG4gICAgfVxuICB9XG5cbiAgY29uc3QgZXhwcyA9IFtdO1xuICBjb25zdCBleHBlcmltZW50cyA9IGV4cGVyaW1lbnRUb2dnbGVzT3JOdWxsKHNlbGYpO1xuICBmb3IgKGNvbnN0IGV4cCBpbiBleHBlcmltZW50cykge1xuICAgIGNvbnN0IG9uID0gZXhwZXJpbWVudHNbZXhwXTtcbiAgICBleHBzLnB1c2goYCR7ZXhwfT0ke29uID8gJzEnIDogJzAnfWApO1xuICB9XG4gIGRhdGFbJ2V4cHMnXSA9IGV4cHMuam9pbignLCcpO1xuXG4gIGlmIChlcnJvcikge1xuICAgIGRhdGFbJ2VsJ10gPSBlcnJvci5hc3NvY2lhdGVkRWxlbWVudD8udGFnTmFtZSB8fCAndSc7IC8vIFVua25vd25cblxuICAgIGlmIChlcnJvci5hcmdzKSB7XG4gICAgICBkYXRhWydhcmdzJ10gPSBKU09OLnN0cmluZ2lmeShlcnJvci5hcmdzKTtcbiAgICB9XG5cbiAgICBpZiAoIWlzVXNlckVycm9yICYmICFlcnJvci5pZ25vcmVTdGFjayAmJiBlcnJvci5zdGFjaykge1xuICAgICAgZGF0YVsncyddID0gZXJyb3Iuc3RhY2s7XG4gICAgfVxuXG4gICAgLy8gVE9ETyhqcmlkZ2V3ZWxsLCAjMTg1NzQpOyBNYWtlIHN1cmUgZXJyb3IgaXMgYWx3YXlzIGFuIG9iamVjdC5cbiAgICBpZiAoZXJyb3IubWVzc2FnZSkge1xuICAgICAgZXJyb3IubWVzc2FnZSArPSAnIF9yZXBvcnRlZF8nO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBkYXRhWydmJ10gPSBmaWxlbmFtZSB8fCAnJztcbiAgICBkYXRhWydsJ10gPSBsaW5lIHx8ICcnO1xuICAgIGRhdGFbJ2MnXSA9IGNvbCB8fCAnJztcbiAgfVxuICBkYXRhWydyJ10gPSBzZWxmLmRvY3VtZW50ID8gc2VsZi5kb2N1bWVudC5yZWZlcnJlciA6ICcnO1xuICBkYXRhWydhZSddID0gYWNjdW11bGF0ZWRFcnJvck1lc3NhZ2VzLmpvaW4oJywnKTtcbiAgZGF0YVsnZnInXSA9IHNlbGYubG9jYXRpb25bJ29yaWdpbmFsSGFzaCddIHx8IHNlbGYubG9jYXRpb24uaGFzaDtcblxuICAvLyBUT0RPKGh0dHBzOi8vZ2l0aHViLmNvbS9hbXBwcm9qZWN0L2Vycm9yLXRyYWNrZXIvaXNzdWVzLzEyOSk6IFJlbW92ZSBvbmNlXG4gIC8vIGFsbCBjbGllbnRzIGFyZSBzZXJ2aW5nIGEgdmVyc2lvbiB3aXRoIHByZS10aHJvdHRsaW5nLlxuICBpZiAoZGF0YVsnYnQnXSA9PT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgLy8gU2V0dGluZyB0aGlzIGZpZWxkIGFsbG93cyB0aGUgZXJyb3IgcmVwb3J0aW5nIHNlcnZpY2UgdG8ga25vdyB0aGF0IHRoaXNcbiAgICAvLyBlcnJvciBoYXMgYWxyZWFkeSBiZWVuIHByZS10aHJvdHRsZWQgZm9yIFN0YWJsZSwgc28gaXQgZG9lc24ndCBuZWVkIHRvXG4gICAgLy8gdGhyb3R0bGUgYWdhaW4uXG4gICAgZGF0YVsncHQnXSA9ICcxJztcbiAgfVxuXG4gIHB1c2hMaW1pdChhY2N1bXVsYXRlZEVycm9yTWVzc2FnZXMsIG1lc3NhZ2UsIDI1KTtcblxuICByZXR1cm4gZGF0YTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgaXQgYXBwZWFycyBsaWtlIHRoZXJlIGlzIG5vbi1BTVAgSlMgb24gdGhlXG4gKiBjdXJyZW50IHBhZ2UuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZGV0ZWN0Tm9uQW1wSnMod2luKSB7XG4gIGlmICghd2luLmRvY3VtZW50KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGNvbnN0IHNjcmlwdHMgPSB3aW4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnc2NyaXB0W3NyY10nKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzY3JpcHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKCFpc1Byb3h5T3JpZ2luKHNjcmlwdHNbaV0uc3JjLnRvTG93ZXJDYXNlKCkpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIFJlc2V0cyBhY2N1bXVsYXRlZCBlcnJvciBtZXNzYWdlcyBmb3IgdGVzdGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRBY2N1bXVsYXRlZEVycm9yTWVzc2FnZXNGb3JUZXN0aW5nKCkge1xuICBhY2N1bXVsYXRlZEVycm9yTWVzc2FnZXMgPSBbXTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyFFcnJvcn0gZXJyb3JcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXBvcnRFcnJvclRvQW5hbHl0aWNzKGVycm9yLCB3aW4pIHtcbiAgLy8gQ3VycmVudGx5IHRoaXMgY2FuIG9ubHkgYmUgZXhlY3V0ZWQgaW4gYSBzaW5nbGUtZG9jIG1vZGUuIE90aGVyd2lzZSxcbiAgLy8gaXQncyBub3QgY2xlYXIgd2hpY2ggYW1wZG9jIHRoZSBldmVudCB3b3VsZCBiZWxvbmcgdG9vLlxuICBpZiAoU2VydmljZXMuYW1wZG9jU2VydmljZUZvcih3aW4pLmlzU2luZ2xlRG9jKCkpIHtcbiAgICBjb25zdCB2YXJzID0gZGljdCh7XG4gICAgICAnZXJyb3JOYW1lJzogZXJyb3IubmFtZSxcbiAgICAgICdlcnJvck1lc3NhZ2UnOiBlcnJvci5tZXNzYWdlLFxuICAgIH0pO1xuICAgIHRyaWdnZXJBbmFseXRpY3NFdmVudChcbiAgICAgIGdldFJvb3RFbGVtZW50Xyh3aW4pLFxuICAgICAgJ3VzZXItZXJyb3InLFxuICAgICAgdmFycyxcbiAgICAgIC8qKiBlbmFibGVEYXRhVmFycyAqLyBmYWxzZVxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHJldHVybiB7IUVsZW1lbnR9XG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBnZXRSb290RWxlbWVudF8od2luKSB7XG4gIGNvbnN0IHJvb3QgPSBTZXJ2aWNlcy5hbXBkb2NTZXJ2aWNlRm9yKHdpbikuZ2V0U2luZ2xlRG9jKCkuZ2V0Um9vdE5vZGUoKTtcbiAgcmV0dXJuIGRldigpLmFzc2VydEVsZW1lbnQocm9vdC5kb2N1bWVudEVsZW1lbnQgfHwgcm9vdC5ib2R5IHx8IHJvb3QpO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/src/error-reporting.js