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
import { USER_ERROR_SENTINEL, dev, isUserErrorEmbed, isUserErrorMessage } from "./log";
import { getMode } from "./mode";
import { Services } from "./service";
import { makeBodyVisibleRecovery } from "./style-installer";
import { isProxyOrigin } from "./url";

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

  if (error && !!win && isUserErrorMessage(error.message) && !isUserErrorEmbed(error.message)) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVycm9yLXJlcG9ydGluZy5qcyJdLCJuYW1lcyI6WyJtb2RlIiwidHJpZ2dlckFuYWx5dGljc0V2ZW50IiwidXJscyIsIkFtcEV2ZW50cyIsImR1cGxpY2F0ZUVycm9ySWZOZWNlc3NhcnkiLCJmaW5kSW5kZXgiLCJleHBvbmVudGlhbEJhY2tvZmYiLCJkaWN0IiwiaXNMb2FkRXJyb3JNZXNzYWdlIiwiZXhwZXJpbWVudFRvZ2dsZXNPck51bGwiLCJnZXRCaW5hcnlUeXBlIiwiaXNDYW5hcnkiLCJVU0VSX0VSUk9SX1NFTlRJTkVMIiwiZGV2IiwiaXNVc2VyRXJyb3JFbWJlZCIsImlzVXNlckVycm9yTWVzc2FnZSIsImdldE1vZGUiLCJTZXJ2aWNlcyIsIm1ha2VCb2R5VmlzaWJsZVJlY292ZXJ5IiwiaXNQcm94eU9yaWdpbiIsIkNBTkNFTExFRCIsIkJMT0NLX0JZX0NPTlNFTlQiLCJBQk9SVEVEIiwiTk9OX0FDVElPTkFCTEVfRVJST1JfVEhST1RUTEVfVEhSRVNIT0xEIiwiVVNFUl9FUlJPUl9USFJPVFRMRV9USFJFU0hPTEQiLCJCRVRBX0VSUk9SX1JFUE9SVF9VUkxfRlJFUSIsImFjY3VtdWxhdGVkRXJyb3JNZXNzYWdlcyIsInNlbGYiLCJfX0FNUF9FUlJPUlMiLCJwdXNoTGltaXQiLCJhcnJheSIsImVsZW1lbnQiLCJsaW1pdCIsImxlbmd0aCIsInNwbGljZSIsInB1c2giLCJyZXBvcnRpbmdCYWNrb2ZmIiwid29yayIsInRyeUpzb25TdHJpbmdpZnkiLCJ2YWx1ZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJlIiwiU3RyaW5nIiwicmVwb3J0RXJyb3JGb3JXaW4iLCJ3aW4iLCJlcnJvciIsIm9wdF9hc3NvY2lhdGVkRWxlbWVudCIsInJlcG9ydEVycm9yIiwibWVzc2FnZSIsInJlcG9ydEVycm9yVG9BbmFseXRpY3MiLCJpc1ZhbGlkRXJyb3IiLCJ1bmRlZmluZWQiLCJvcmlnRXJyb3IiLCJFcnJvciIsImxvY2FsRGV2IiwidGVzdCIsInNldFRpbWVvdXQiLCJyZXRocm93IiwicmVwb3J0ZWQiLCJtZXNzYWdlQXJyYXkiLCJlbEluZGV4IiwiaXRlbSIsInRhZ05hbWUiLCJhc3NvY2lhdGVkRWxlbWVudCIsImNsYXNzTGlzdCIsImFkZCIsImRldmVsb3BtZW50Iiwic2V0QXR0cmlidXRlIiwiY29uc29sZSIsImV4cGVjdGVkIiwib3V0cHV0IiwibG9nIiwiYXBwbHkiLCJjYWxsIiwiaXNNaW5pZmllZCIsInN0YWNrIiwiZGlzcGF0Y2hDdXN0b21FdmVudEZvclRlc3RpbmciLCJFUlJPUiIsIm9uRXJyb3IiLCJlcnJvclJlcG9ydGluZ0Vycm9yIiwiY2FuY2VsbGF0aW9uIiwiaXNDYW5jZWxsYXRpb24iLCJlcnJvck9yTWVzc2FnZSIsInN0YXJ0c1dpdGgiLCJibG9ja2VkQnlDb25zZW50RXJyb3IiLCJpc0Jsb2NrZWRCeUNvbnNlbnQiLCJpbnN0YWxsRXJyb3JSZXBvcnRpbmciLCJvbmVycm9yIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50IiwicmVhc29uIiwicHJldmVudERlZmF1bHQiLCJmaWxlbmFtZSIsImxpbmUiLCJjb2wiLCJkb2N1bWVudCIsImhhc05vbkFtcEpzIiwiZGV0ZWN0Tm9uQW1wSnMiLCJpZ25vcmUiLCJNYXRoIiwicmFuZG9tIiwiZGF0YSIsImdldEVycm9yUmVwb3J0RGF0YSIsInJlcG9ydEVycm9yVG9TZXJ2ZXJPclZpZXdlciIsImNhdGNoIiwiY2hvb3NlUmVwb3J0aW5nVXJsXyIsImJldGFFcnJvclJlcG9ydGluZyIsImVycm9yUmVwb3J0aW5nIiwibWF5YmVSZXBvcnRFcnJvclRvVmlld2VyIiwidGhlbiIsInJlcG9ydGVkRXJyb3JUb1ZpZXdlciIsInhociIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsInNlbmQiLCJhbXBkb2NTZXJ2aWNlIiwiYW1wZG9jU2VydmljZUZvciIsImlzU2luZ2xlRG9jIiwiUHJvbWlzZSIsInJlc29sdmUiLCJhbXBkb2NTaW5nbGUiLCJnZXRTaW5nbGVEb2MiLCJodG1sRWxlbWVudCIsImdldFJvb3ROb2RlIiwiZG9jdW1lbnRFbGVtZW50IiwiZG9jT3B0ZWRJbiIsImhhc0F0dHJpYnV0ZSIsInZpZXdlciIsInZpZXdlckZvckRvYyIsImhhc0NhcGFiaWxpdHkiLCJpc1RydXN0ZWRWaWV3ZXIiLCJ2aWV3ZXJUcnVzdGVkIiwic2VuZE1lc3NhZ2UiLCJlcnJvclJlcG9ydGluZ0RhdGFGb3JWaWV3ZXIiLCJlcnJvclJlcG9ydERhdGEiLCJidWlsZEVycm9yTWVzc2FnZV8iLCJkZXRhY2hlZFdpbmRvdyIsIndpbmRvdyIsInRocm90dGxlQmFzZSIsImlzVXNlckVycm9yIiwiT2JqZWN0IiwiY3JlYXRlIiwicnR2VmVyc2lvbiIsInJlcGxhY2UiLCJydW50aW1lIiwiY29udGV4dCIsImxvY2F0aW9uIiwiYTRhSWQiLCJhbmNlc3Rvck9yaWdpbnMiLCJ2aWV3ZXJTdGF0ZSIsInBhcmVudCIsIkFNUCIsInJlc29sdmVkVmlld2VyVXJsIiwiZ2V0UmVzb2x2ZWRWaWV3ZXJVcmwiLCJtZXNzYWdpbmdPcmlnaW4iLCJtYXliZUdldE1lc3NhZ2luZ09yaWdpbiIsImV4cHMiLCJleHBlcmltZW50cyIsImV4cCIsIm9uIiwiam9pbiIsImFyZ3MiLCJpZ25vcmVTdGFjayIsInJlZmVycmVyIiwiaGFzaCIsInNjcmlwdHMiLCJxdWVyeVNlbGVjdG9yQWxsIiwiaSIsInNyYyIsInRvTG93ZXJDYXNlIiwicmVzZXRBY2N1bXVsYXRlZEVycm9yTWVzc2FnZXNGb3JUZXN0aW5nIiwidmFycyIsIm5hbWUiLCJnZXRSb290RWxlbWVudF8iLCJyb290IiwiYXNzZXJ0RWxlbWVudCIsImJvZHkiXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsT0FBTyxLQUFLQSxJQUFaO0FBRUEsU0FBUUMscUJBQVI7QUFDQSxTQUFRQyxJQUFSO0FBQ0EsU0FBUUMsU0FBUjtBQUNBLFNBQVFDLHlCQUFSO0FBQ0Es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bGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0ICogYXMgbW9kZSBmcm9tICcjY29yZS9tb2RlJztcblxuaW1wb3J0IHt0cmlnZ2VyQW5hbHl0aWNzRXZlbnR9IGZyb20gJy4vYW5hbHl0aWNzJztcbmltcG9ydCB7dXJsc30gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtBbXBFdmVudHN9IGZyb20gJy4vY29yZS9jb25zdGFudHMvYW1wLWV2ZW50cyc7XG5pbXBvcnQge2R1cGxpY2F0ZUVycm9ySWZOZWNlc3Nhcnl9IGZyb20gJy4vY29yZS9lcnJvcic7XG5pbXBvcnQge2ZpbmRJbmRleH0gZnJvbSAnLi9jb3JlL3R5cGVzL2FycmF5JztcbmltcG9ydCB7ZXhwb25lbnRpYWxCYWNrb2ZmfSBmcm9tICcuL2NvcmUvdHlwZXMvZnVuY3Rpb24vZXhwb25lbnRpYWwtYmFja29mZic7XG5pbXBvcnQge2RpY3R9IGZyb20gJy4vY29yZS90eXBlcy9vYmplY3QnO1xuaW1wb3J0IHtpc0xvYWRFcnJvck1lc3NhZ2V9IGZyb20gJy4vZXZlbnQtaGVscGVyJztcbmltcG9ydCB7ZXhwZXJpbWVudFRvZ2dsZXNPck51bGwsIGdldEJpbmFyeVR5cGUsIGlzQ2FuYXJ5fSBmcm9tICcuL2V4cGVyaW1lbnRzJztcbmltcG9ydCB7XG4gIFVTRVJfRVJST1JfU0VOVElORUwsXG4gIGRldixcbiAgaXNVc2VyRXJyb3JFbWJlZCxcbiAgaXNVc2VyRXJyb3JNZXNzYWdlLFxufSBmcm9tICcuL2xvZyc7XG5pbXBvcnQge2dldE1vZGV9IGZyb20gJy4vbW9kZSc7XG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcuL3NlcnZpY2UnO1xuaW1wb3J0IHttYWtlQm9keVZpc2libGVSZWNvdmVyeX0gZnJvbSAnLi9zdHlsZS1pbnN0YWxsZXInO1xuaW1wb3J0IHtpc1Byb3h5T3JpZ2lufSBmcm9tICcuL3VybCc7XG5cbi8qKlxuICogQGNvbnN0IHtzdHJpbmd9XG4gKi9cbmNvbnN0IENBTkNFTExFRCA9ICdDQU5DRUxMRUQnO1xuXG4vKipcbiAqIEBjb25zdCB7c3RyaW5nfVxuICovXG5jb25zdCBCTE9DS19CWV9DT05TRU5UID0gJ0JMT0NLX0JZX0NPTlNFTlQnO1xuXG4vKipcbiAqIEBjb25zdCB7c3RyaW5nfVxuICovXG5jb25zdCBBQk9SVEVEID0gJ0Fib3J0RXJyb3InO1xuXG4vKipcbiAqIFRoZSB0aHJlc2hvbGQgZm9yIGVycm9ycyB0aHJvdHRsZWQgYmVjYXVzZSBub3RoaW5nIGNhbiBiZSBkb25lIGFib3V0XG4gKiB0aGVtLCBidXQgd2UnZCBzdGlsbCBsaWtlIHRvIHJlcG9ydCB0aGUgcm91Z2ggbnVtYmVyLlxuICogQGNvbnN0IHtudW1iZXJ9XG4gKi9cbmNvbnN0IE5PTl9BQ1RJT05BQkxFX0VSUk9SX1RIUk9UVExFX1RIUkVTSE9MRCA9IDAuMDAxO1xuXG4vKipcbiAqIFRoZSB0aHJlc2hvbGQgZm9yIGVycm9ycyB0aHJvdHRsZWQgYmVjYXVzZSBub3RoaW5nIGNhbiBiZSBkb25lIGFib3V0XG4gKiB0aGVtLCBidXQgd2UnZCBzdGlsbCBsaWtlIHRvIHJlcG9ydCB0aGUgcm91Z2ggbnVtYmVyLlxuICogQGNvbnN0IHtudW1iZXJ9XG4gKi9cbmNvbnN0IFVTRVJfRVJST1JfVEhST1RUTEVfVEhSRVNIT0xEID0gMC4xO1xuXG4vKipcbiAqIENoYW5jZSB0byBwb3N0IHRvIHRoZSBuZXcgZXJyb3IgcmVwb3J0aW5nIGVuZHBvaW50LlxuICogQGNvbnN0IHtudW1iZXJ9XG4gKi9cbmNvbnN0IEJFVEFfRVJST1JfUkVQT1JUX1VSTF9GUkVRID0gMC4xO1xuXG4vKipcbiAqIENvbGxlY3RzIGVycm9yIG1lc3NhZ2VzLCBzbyB0aGV5IGNhbiBiZSBpbmNsdWRlZCBpbiBzdWJzZXF1ZW50IHJlcG9ydHMuXG4gKiBUaGF0IGFsbG93cyBpZGVudGlmeWluZyBlcnJvcnMgdGhhdCBtaWdodCBiZSBjYXVzZWQgYnkgcHJldmlvdXMgZXJyb3JzLlxuICovXG5sZXQgYWNjdW11bGF0ZWRFcnJvck1lc3NhZ2VzID0gc2VsZi5fX0FNUF9FUlJPUlMgfHwgW107XG4vLyBVc2UgYSB0cnVlIGdsb2JhbCwgdG8gYXZvaWQgbXVsdGktbW9kdWxlIGluY2x1c2lvbiBpc3N1ZXMuXG5zZWxmLl9fQU1QX0VSUk9SUyA9IGFjY3VtdWxhdGVkRXJyb3JNZXNzYWdlcztcblxuLyoqXG4gKiBQdXNoZXMgZWxlbWVudCBpbnRvIGFycmF5LCBrZWVwaW5nIGF0IG1vc3QgdGhlIG1vc3QgcmVjZW50IGxpbWl0IGVsZW1lbnRzXG4gKlxuICogQHBhcmFtIHshQXJyYXk8VD59IGFycmF5XG4gKiBAcGFyYW0ge1R9IGVsZW1lbnRcbiAqIEBwYXJhbSB7bnVtYmVyfSBsaW1pdFxuICogQHRlbXBsYXRlIFRcbiAqL1xuZnVuY3Rpb24gcHVzaExpbWl0KGFycmF5LCBlbGVtZW50LCBsaW1pdCkge1xuICBpZiAoYXJyYXkubGVuZ3RoID49IGxpbWl0KSB7XG4gICAgYXJyYXkuc3BsaWNlKDAsIGFycmF5Lmxlbmd0aCAtIGxpbWl0ICsgMSk7XG4gIH1cbiAgYXJyYXkucHVzaChlbGVtZW50KTtcbn1cblxuLyoqXG4gKiBBIHdyYXBwZXIgYXJvdW5kIG91ciBleHBvbmVudGlhbEJhY2tvZmYsIHRvIGxhenkgaW5pdGlhbGl6ZSBpdCB0byBhdm9pZCBhblxuICogdW4tRENFJ2FibGUgc2lkZS1lZmZlY3QuXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKCl9IHdvcmsgdGhlIGZ1bmN0aW9uIHRvIGV4ZWN1dGUgYWZ0ZXIgYmFja29mZlxuICogQHJldHVybiB7bnVtYmVyfSB0aGUgc2V0VGltZW91dCBpZFxuICovXG5sZXQgcmVwb3J0aW5nQmFja29mZiA9IGZ1bmN0aW9uICh3b3JrKSB7XG4gIC8vIFNldCByZXBvcnRpbmdCYWNrb2ZmIGFzIHRoZSBsYXp5LWNyZWF0ZWQgZnVuY3Rpb24uIEpTIFZvb29kb29vby5cbiAgcmVwb3J0aW5nQmFja29mZiA9IGV4cG9uZW50aWFsQmFja29mZigxLjUpO1xuICByZXR1cm4gcmVwb3J0aW5nQmFja29mZih3b3JrKTtcbn07XG5cbi8qKlxuICogQXR0ZW1wdHMgdG8gc3RyaW5naWZ5IGEgdmFsdWUsIGZhbGxpbmcgYmFjayB0byBTdHJpbmcuXG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIHRyeUpzb25TdHJpbmdpZnkodmFsdWUpIHtcbiAgdHJ5IHtcbiAgICAvLyBDYXN0IGlzIGZpbmUsIGJlY2F1c2Ugd2UgcmVhbGx5IGRvbid0IGNhcmUgaGVyZS4gSnVzdCB0cnlpbmcuXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KC8qKiBAdHlwZSB7IUpzb25PYmplY3R9ICovICh2YWx1ZSkpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIFN0cmluZyh2YWx1ZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHBhcmFtIHsqfSBlcnJvclxuICogQHBhcmFtIHshRWxlbWVudD19IG9wdF9hc3NvY2lhdGVkRWxlbWVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVwb3J0RXJyb3JGb3JXaW4od2luLCBlcnJvciwgb3B0X2Fzc29jaWF0ZWRFbGVtZW50KSB7XG4gIHJlcG9ydEVycm9yKGVycm9yLCBvcHRfYXNzb2NpYXRlZEVsZW1lbnQpO1xuICBpZiAoXG4gICAgZXJyb3IgJiZcbiAgICAhIXdpbiAmJlxuICAgIGlzVXNlckVycm9yTWVzc2FnZShlcnJvci5tZXNzYWdlKSAmJlxuICAgICFpc1VzZXJFcnJvckVtYmVkKGVycm9yLm1lc3NhZ2UpXG4gICkge1xuICAgIHJlcG9ydEVycm9yVG9BbmFseXRpY3MoLyoqIEB0eXBlIHshRXJyb3J9ICovIChlcnJvciksIHdpbik7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXBvcnRzIGFuIGVycm9yLiBJZiB0aGUgZXJyb3IgaGFzIGFuIFwiYXNzb2NpYXRlZEVsZW1lbnRcIiBwcm9wZXJ0eVxuICogdGhlIGVsZW1lbnQgaXMgbWFya2VkIHdpdGggdGhlIGBpLWFtcGh0bWwtZWxlbWVudC1lcnJvcmAgYW5kIGRpc3BsYXlzXG4gKiB0aGUgbWVzc2FnZSBpdHNlbGYuIFRoZSBtZXNzYWdlIGlzIGFsd2F5cyBzZW5kIHRvIHRoZSBjb25zb2xlLlxuICogSWYgdGhlIGVycm9yIGhhcyBhIFwibWVzc2FnZUFycmF5XCIgcHJvcGVydHksIHRoYXQgYXJyYXkgaXMgbG9nZ2VkLlxuICogVGhpcyB3YXkgb25lIGdldHMgdGhlIG5hdGl2ZSBmaWRlbGl0eSBvZiB0aGUgY29uc29sZSBmb3IgdGhpbmdzIGxpa2VcbiAqIGVsZW1lbnRzIGluc3RlYWQgb2Ygc3RyaW5naWZpY2F0aW9uLlxuICogQHBhcmFtIHsqfSBlcnJvclxuICogQHBhcmFtIHshRWxlbWVudD19IG9wdF9hc3NvY2lhdGVkRWxlbWVudFxuICogQHJldHVybiB7IUVycm9yfVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVwb3J0RXJyb3IoZXJyb3IsIG9wdF9hc3NvY2lhdGVkRWxlbWVudCkge1xuICB0cnkge1xuICAgIC8vIENvbnZlcnQgZXJyb3IgdG8gdGhlIGV4cGVjdGVkIHR5cGUuXG4gICAgbGV0IGlzVmFsaWRFcnJvcjtcbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIGlmIChlcnJvci5tZXNzYWdlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZXJyb3IgPSBkdXBsaWNhdGVFcnJvcklmTmVjZXNzYXJ5KC8qKiBAdHlwZSB7IUVycm9yfSAqLyAoZXJyb3IpKTtcbiAgICAgICAgaXNWYWxpZEVycm9yID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IG9yaWdFcnJvciA9IGVycm9yO1xuICAgICAgICBlcnJvciA9IG5ldyBFcnJvcih0cnlKc29uU3RyaW5naWZ5KG9yaWdFcnJvcikpO1xuICAgICAgICBlcnJvci5vcmlnRXJyb3IgPSBvcmlnRXJyb3I7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGVycm9yID0gbmV3IEVycm9yKCdVbmtub3duIGVycm9yJyk7XG4gICAgfVxuICAgIC8vIFJlcG9ydCBpZiBlcnJvciBpcyBub3QgYW4gZXhwZWN0ZWQgdHlwZS5cbiAgICBpZiAoIWlzVmFsaWRFcnJvciAmJiBnZXRNb2RlKCkubG9jYWxEZXYgJiYgIWdldE1vZGUoKS50ZXN0KSB7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc3QgcmV0aHJvdyA9IG5ldyBFcnJvcihcbiAgICAgICAgICAnX3JlcG9ydGVkXyBFcnJvciByZXBvcnRlZCBpbmNvcnJlY3RseTogJyArIGVycm9yXG4gICAgICAgICk7XG4gICAgICAgIHRocm93IHJldGhyb3c7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoZXJyb3IucmVwb3J0ZWQpIHtcbiAgICAgIHJldHVybiAvKiogQHR5cGUgeyFFcnJvcn0gKi8gKGVycm9yKTtcbiAgICB9XG4gICAgZXJyb3IucmVwb3J0ZWQgPSB0cnVlO1xuXG4gICAgLy8gYGFzc29jaWF0ZWRFbGVtZW50YCBpcyB1c2VkIHRvIGFkZCB0aGUgaS1hbXBodG1sLWVycm9yIGNsYXNzOyBpblxuICAgIC8vIGAjZGV2ZWxvcG1lbnQ9MWAgbW9kZSwgaXQgYWxzbyBhZGRzIGBpLWFtcGh0bWwtZWxlbWVudC1lcnJvcmAgdG8gdGhlXG4gICAgLy8gZWxlbWVudCBhbmQgc2V0cyB0aGUgYGVycm9yLW1lc3NhZ2VgIGF0dHJpYnV0ZS5cbiAgICBpZiAoZXJyb3IubWVzc2FnZUFycmF5KSB7XG4gICAgICBjb25zdCBlbEluZGV4ID0gZmluZEluZGV4KGVycm9yLm1lc3NhZ2VBcnJheSwgKGl0ZW0pID0+IGl0ZW0/LnRhZ05hbWUpO1xuICAgICAgaWYgKGVsSW5kZXggPiAtMSkge1xuICAgICAgICBlcnJvci5hc3NvY2lhdGVkRWxlbWVudCA9IGVycm9yLm1lc3NhZ2VBcnJheVtlbEluZGV4XTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gVXBkYXRlIGVsZW1lbnQuXG4gICAgY29uc3QgZWxlbWVudCA9IG9wdF9hc3NvY2lhdGVkRWxlbWVudCB8fCBlcnJvci5hc3NvY2lhdGVkRWxlbWVudDtcbiAgICBpZiAoZWxlbWVudCAmJiBlbGVtZW50LmNsYXNzTGlzdCkge1xuICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtZXJyb3InKTtcbiAgICAgIGlmIChnZXRNb2RlKCkuZGV2ZWxvcG1lbnQpIHtcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtZWxlbWVudC1lcnJvcicpO1xuICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnZXJyb3ItbWVzc2FnZScsIGVycm9yLm1lc3NhZ2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJlcG9ydCB0byBjb25zb2xlLlxuICAgIGlmIChcbiAgICAgIHNlbGYuY29uc29sZSAmJlxuICAgICAgKGlzVXNlckVycm9yTWVzc2FnZShlcnJvci5tZXNzYWdlKSB8fFxuICAgICAgICAhZXJyb3IuZXhwZWN0ZWQgfHxcbiAgICAgICAgZ2V0TW9kZSgpLmxvY2FsRGV2KVxuICAgICkge1xuICAgICAgY29uc3Qgb3V0cHV0ID0gY29uc29sZS5lcnJvciB8fCBjb25zb2xlLmxvZztcbiAgICAgIGlmIChlcnJvci5tZXNzYWdlQXJyYXkpIHtcbiAgICAgICAgb3V0cHV0LmFwcGx5KGNvbnNvbGUsIGVycm9yLm1lc3NhZ2VBcnJheSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICAgIG91dHB1dC5jYWxsKGNvbnNvbGUsIGVycm9yLm1lc3NhZ2UsIGVsZW1lbnQpO1xuICAgICAgICB9IGVsc2UgaWYgKCFtb2RlLmlzTWluaWZpZWQoKSkge1xuICAgICAgICAgIG91dHB1dC5jYWxsKGNvbnNvbGUsIGVycm9yLnN0YWNrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvdXRwdXQuY2FsbChjb25zb2xlLCBlcnJvci5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZWxlbWVudCAmJiBlbGVtZW50LmRpc3BhdGNoQ3VzdG9tRXZlbnRGb3JUZXN0aW5nKSB7XG4gICAgICBlbGVtZW50LmRpc3BhdGNoQ3VzdG9tRXZlbnRGb3JUZXN0aW5nKEFtcEV2ZW50cy5FUlJPUiwgZXJyb3IubWVzc2FnZSk7XG4gICAgfVxuXG4gICAgLy8gJ2NhbGwnIHRvIG1ha2UgbGludGVyIGhhcHB5LiBBbmQgLmNhbGwgdG8gbWFrZSBjb21waWxlciBoYXBweVxuICAgIC8vIHRoYXQgZXhwZWN0cyBzb21lIEB0aGlzLlxuICAgIG9uRXJyb3JbJ2NhbGwnXShzZWxmLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGVycm9yKTtcbiAgfSBjYXRjaCAoZXJyb3JSZXBvcnRpbmdFcnJvcikge1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgdGhyb3cgZXJyb3JSZXBvcnRpbmdFcnJvcjtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gLyoqIEB0eXBlIHshRXJyb3J9ICovIChlcnJvcik7XG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBlcnJvciBmb3IgYSBjYW5jZWxsYXRpb24gb2YgYSBwcm9taXNlLlxuICogQHJldHVybiB7IUVycm9yfVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsbGF0aW9uKCkge1xuICByZXR1cm4gbmV3IEVycm9yKENBTkNFTExFRCk7XG59XG5cbi8qKlxuICogQHBhcmFtIHsqfSBlcnJvck9yTWVzc2FnZVxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQ2FuY2VsbGF0aW9uKGVycm9yT3JNZXNzYWdlKSB7XG4gIGlmICghZXJyb3JPck1lc3NhZ2UpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKHR5cGVvZiBlcnJvck9yTWVzc2FnZSA9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBlcnJvck9yTWVzc2FnZS5zdGFydHNXaXRoKENBTkNFTExFRCk7XG4gIH1cbiAgaWYgKHR5cGVvZiBlcnJvck9yTWVzc2FnZS5tZXNzYWdlID09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGVycm9yT3JNZXNzYWdlLm1lc3NhZ2Uuc3RhcnRzV2l0aChDQU5DRUxMRUQpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGFuIGVycm9yIGZvciBjb21wb25lbnQgYmxvY2tlZCBieSBjb25zZW50XG4gKiBAcmV0dXJuIHshRXJyb3J9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBibG9ja2VkQnlDb25zZW50RXJyb3IoKSB7XG4gIHJldHVybiBuZXcgRXJyb3IoQkxPQ0tfQllfQ09OU0VOVCk7XG59XG5cbi8qKlxuICogQHBhcmFtIHsqfSBlcnJvck9yTWVzc2FnZVxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQmxvY2tlZEJ5Q29uc2VudChlcnJvck9yTWVzc2FnZSkge1xuICBpZiAoIWVycm9yT3JNZXNzYWdlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh0eXBlb2YgZXJyb3JPck1lc3NhZ2UgPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZXJyb3JPck1lc3NhZ2Uuc3RhcnRzV2l0aChCTE9DS19CWV9DT05TRU5UKTtcbiAgfVxuICBpZiAodHlwZW9mIGVycm9yT3JNZXNzYWdlLm1lc3NhZ2UgPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZXJyb3JPck1lc3NhZ2UubWVzc2FnZS5zdGFydHNXaXRoKEJMT0NLX0JZX0NPTlNFTlQpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBJbnN0YWxsIGhhbmRsaW5nIG9mIGdsb2JhbCB1bmhhbmRsZWQgZXhjZXB0aW9ucy5cbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsRXJyb3JSZXBvcnRpbmcod2luKSB7XG4gIHdpbi5vbmVycm9yID0gLyoqIEB0eXBlIHshRnVuY3Rpb259ICovIChvbkVycm9yKTtcbiAgd2luLmFkZEV2ZW50TGlzdGVuZXIoJ3VuaGFuZGxlZHJlamVjdGlvbicsIChldmVudCkgPT4ge1xuICAgIGlmIChcbiAgICAgIGV2ZW50LnJlYXNvbiAmJlxuICAgICAgKGV2ZW50LnJlYXNvbi5tZXNzYWdlID09PSBDQU5DRUxMRUQgfHxcbiAgICAgICAgZXZlbnQucmVhc29uLm1lc3NhZ2UgPT09IEJMT0NLX0JZX0NPTlNFTlQgfHxcbiAgICAgICAgZXZlbnQucmVhc29uLm1lc3NhZ2UgPT09IEFCT1JURUQpXG4gICAgKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXBvcnRFcnJvcihldmVudC5yZWFzb24gfHwgbmV3IEVycm9yKCdyZWplY3RlZCBwcm9taXNlICcgKyBldmVudCkpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBTaWduYXR1cmUgZGVzaWduZWQsIHNvIGl0IGNhbiB3b3JrIHdpdGggd2luZG93Lm9uZXJyb3JcbiAqIEBwYXJhbSB7c3RyaW5nfHVuZGVmaW5lZH0gbWVzc2FnZVxuICogQHBhcmFtIHtzdHJpbmd8dW5kZWZpbmVkfSBmaWxlbmFtZVxuICogQHBhcmFtIHtzdHJpbmd8dW5kZWZpbmVkfSBsaW5lXG4gKiBAcGFyYW0ge3N0cmluZ3x1bmRlZmluZWR9IGNvbFxuICogQHBhcmFtIHsqfHVuZGVmaW5lZH0gZXJyb3JcbiAqIEB0aGlzIHshV2luZG93fHVuZGVmaW5lZH1cbiAqL1xuZnVuY3Rpb24gb25FcnJvcihtZXNzYWdlLCBmaWxlbmFtZSwgbGluZSwgY29sLCBlcnJvcikge1xuICAvLyBNYWtlIGFuIGF0dGVtcHQgdG8gdW5oaWRlIHRoZSBib2R5IGJ1dCBkb24ndCBpZiB0aGUgZXJyb3IgaXMgYWN0dWFsbHkgZXhwZWN0ZWQuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBsb2NhbC9uby1pbnZhbGlkLXRoaXNcbiAgaWYgKHRoaXMgJiYgdGhpcy5kb2N1bWVudCAmJiAoIWVycm9yIHx8ICFlcnJvci5leHBlY3RlZCkpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbG9jYWwvbm8taW52YWxpZC10aGlzXG4gICAgbWFrZUJvZHlWaXNpYmxlUmVjb3ZlcnkodGhpcy5kb2N1bWVudCk7XG4gIH1cbiAgaWYgKGdldE1vZGUoKS5sb2NhbERldiB8fCBnZXRNb2RlKCkuZGV2ZWxvcG1lbnQgfHwgZ2V0TW9kZSgpLnRlc3QpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgbGV0IGhhc05vbkFtcEpzID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgaGFzTm9uQW1wSnMgPSBkZXRlY3ROb25BbXBKcyhzZWxmKTtcbiAgfSBjYXRjaCAoaWdub3JlKSB7XG4gICAgLy8gSWdub3JlIGVycm9ycyBkdXJpbmcgZXJyb3IgcmVwb3J0IGdlbmVyYXRpb24uXG4gIH1cbiAgaWYgKGhhc05vbkFtcEpzICYmIE1hdGgucmFuZG9tKCkgPiAwLjAxKSB7XG4gICAgLy8gT25seSByZXBvcnQgMSUgb2YgZXJyb3JzIG9uIHBhZ2VzIHdpdGggbm9uLUFNUCBKUy5cbiAgICAvLyBUaGVzZSBlcnJvcnMgY2FuIGFsbW9zdCBuZXZlciBiZSBhY3RlZCB1cG9uLCBidXQgc3Bpa2VzIHN1Y2ggYXNcbiAgICAvLyBkdWUgdG8gYnVnZ3kgYnJvd3NlciBleHRlbnNpb25zIG1heSBiZSBoZWxwZnVsIHRvIG5vdGlmeSBhdXRob3JzLlxuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBkYXRhID0gZ2V0RXJyb3JSZXBvcnREYXRhKFxuICAgIG1lc3NhZ2UsXG4gICAgZmlsZW5hbWUsXG4gICAgbGluZSxcbiAgICBjb2wsXG4gICAgZXJyb3IsXG4gICAgaGFzTm9uQW1wSnNcbiAgKTtcbiAgaWYgKGRhdGEpIHtcbiAgICByZXBvcnRpbmdCYWNrb2ZmKCgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiByZXBvcnRFcnJvclRvU2VydmVyT3JWaWV3ZXIoXG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGxvY2FsL25vLWludmFsaWQtdGhpc1xuICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgLyoqIEB0eXBlIHshSnNvbk9iamVjdH0gKi9cbiAgICAgICAgICAoZGF0YSlcbiAgICAgICAgKS5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgLy8gY2F0Y2ggYXN5bmMgZXJyb3JzIHRvIGF2b2lkIHJlY3Vyc2l2ZSBlcnJvcnMuXG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBjYXRjaCBhc3luYyBlcnJvcnMgdG8gYXZvaWQgcmVjdXJzaXZlIGVycm9ycy5cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIERldGVybWluZXMgdGhlIGVycm9yIHJlcG9ydGluZyBlbmRwb2ludCB3aGljaCBzaG91bGQgYmUgdXNlZC5cbiAqIElmIGNoYW5naW5nIHRoaXMgVVJMLCBrZWVwIGBkb2NzL3NwZWMvYW1wLWVycm9ycy5tZGAgaW4gc3luYy5cbiAqIEByZXR1cm4ge3N0cmluZ30gZXJyb3IgcmVwb3J0aW5nIGVuZHBvaW50IFVSTC5cbiAqL1xuZnVuY3Rpb24gY2hvb3NlUmVwb3J0aW5nVXJsXygpIHtcbiAgcmV0dXJuIE1hdGgucmFuZG9tKCkgPCBCRVRBX0VSUk9SX1JFUE9SVF9VUkxfRlJFUVxuICAgID8gdXJscy5iZXRhRXJyb3JSZXBvcnRpbmdcbiAgICA6IHVybHMuZXJyb3JSZXBvcnRpbmc7XG59XG5cbi8qKlxuICogUGFzc2VzIHRoZSBnaXZlbiBlcnJvciBkYXRhIHRvIGVpdGhlciBzZXJ2ZXIgb3Igdmlld2VyLlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEBwYXJhbSB7IUpzb25PYmplY3R9IGRhdGEgRGF0YSBmcm9tIGBnZXRFcnJvclJlcG9ydERhdGFgLlxuICogQHJldHVybiB7UHJvbWlzZTx1bmRlZmluZWQ+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVwb3J0RXJyb3JUb1NlcnZlck9yVmlld2VyKHdpbiwgZGF0YSkge1xuICAvLyBSZXBvcnQgdGhlIGVycm9yIHRvIHZpZXdlciBpZiBpdCBoYXMgdGhlIGNhcGFiaWxpdHkuIFRoZSBkYXRhIHBhc3NlZFxuICAvLyB0byB0aGUgdmlld2VyIGlzIGV4YWN0bHkgdGhlIHNhbWUgYXMgdGhlIGRhdGEgcGFzc2VkIHRvIHRoZSBzZXJ2ZXJcbiAgLy8gYmVsb3cuXG5cbiAgLy8gVGhyb3R0bGUgcmVwb3J0cyBmcm9tIFN0YWJsZSBieSA5MCUuXG4gIGlmIChkYXRhWydwdCddICYmIE1hdGgucmFuZG9tKCkgPCAwLjkpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH1cblxuICByZXR1cm4gbWF5YmVSZXBvcnRFcnJvclRvVmlld2VyKHdpbiwgZGF0YSkudGhlbigocmVwb3J0ZWRFcnJvclRvVmlld2VyKSA9PiB7XG4gICAgaWYgKCFyZXBvcnRlZEVycm9yVG9WaWV3ZXIpIHtcbiAgICAgIGNvbnN0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgeGhyLm9wZW4oJ1BPU1QnLCBjaG9vc2VSZXBvcnRpbmdVcmxfKCksIHRydWUpO1xuICAgICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogUGFzc2VzIHRoZSBnaXZlbiBlcnJvciBkYXRhIHRvIHRoZSB2aWV3ZXIgaWYgdGhlIGZvbGxvd2luZyBjcml0ZXJpYSBpcyBtZXQ6XG4gKiAtIFRoZSB2aWV3ZXIgaXMgYSB0cnVzdGVkIHZpZXdlclxuICogLSBUaGUgdmlld2VyIGhhcyB0aGUgYGVycm9yUmVwb3J0ZXJgIGNhcGFiaWxpdHlcbiAqIC0gVGhlIEFNUCBkb2MgaXMgaW4gc2luZ2xlIGRvYyBtb2RlXG4gKiAtIFRoZSBBTVAgZG9jIGlzIG9wdGVkLWluIGZvciBlcnJvciBpbnRlcmNlcHRpb24gKGA8aHRtbD5gIHRhZyBoYXMgdGhlXG4gKiAgIGByZXBvcnQtZXJyb3JzLXRvLXZpZXdlcmAgYXR0cmlidXRlKVxuICpcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcGFyYW0geyFKc29uT2JqZWN0fSBkYXRhIERhdGEgZnJvbSBgZ2V0RXJyb3JSZXBvcnREYXRhYC5cbiAqIEByZXR1cm4geyFQcm9taXNlPGJvb2xlYW4+fSBgUHJvbWlzZTxUcnVlPmAgaWYgdGhlIGVycm9yIHdhcyBzZW50IHRvIHRoZVxuICogICAgIHZpZXdlciwgYFByb21pc2U8RmFsc2U+YCBvdGhlcndpc2UuXG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1heWJlUmVwb3J0RXJyb3JUb1ZpZXdlcih3aW4sIGRhdGEpIHtcbiAgY29uc3QgYW1wZG9jU2VydmljZSA9IFNlcnZpY2VzLmFtcGRvY1NlcnZpY2VGb3Iod2luKTtcbiAgaWYgKCFhbXBkb2NTZXJ2aWNlLmlzU2luZ2xlRG9jKCkpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTtcbiAgfVxuICBjb25zdCBhbXBkb2NTaW5nbGUgPSBhbXBkb2NTZXJ2aWNlLmdldFNpbmdsZURvYygpO1xuICBjb25zdCBodG1sRWxlbWVudCA9IGFtcGRvY1NpbmdsZS5nZXRSb290Tm9kZSgpLmRvY3VtZW50RWxlbWVudDtcbiAgY29uc3QgZG9jT3B0ZWRJbiA9IGh0bWxFbGVtZW50Lmhhc0F0dHJpYnV0ZSgncmVwb3J0LWVycm9ycy10by12aWV3ZXInKTtcbiAgaWYgKCFkb2NPcHRlZEluKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSk7XG4gIH1cbiAgY29uc3Qgdmlld2VyID0gU2VydmljZXMudmlld2VyRm9yRG9jKGFtcGRvY1NpbmdsZSk7XG4gIGlmICghdmlld2VyLmhhc0NhcGFiaWxpdHkoJ2Vycm9yUmVwb3J0ZXInKSkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpO1xuICB9XG4gIHJldHVybiB2aWV3ZXIuaXNUcnVzdGVkVmlld2VyKCkudGhlbigodmlld2VyVHJ1c3RlZCkgPT4ge1xuICAgIGlmICghdmlld2VyVHJ1c3RlZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB2aWV3ZXIuc2VuZE1lc3NhZ2UoJ2Vycm9yJywgZXJyb3JSZXBvcnRpbmdEYXRhRm9yVmlld2VyKGRhdGEpKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSk7XG59XG5cbi8qKlxuICogU3RyaXBzIGRvd24gdGhlIGVycm9yIHJlcG9ydGluZyBkYXRhIHRvIGEgbWluaW1hbCBzZXRcbiAqIHRvIGJlIHNlbnQgdG8gdGhlIHZpZXdlci5cbiAqIEBwYXJhbSB7IUpzb25PYmplY3R9IGVycm9yUmVwb3J0RGF0YVxuICogQHJldHVybiB7IUpzb25PYmplY3R9XG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVycm9yUmVwb3J0aW5nRGF0YUZvclZpZXdlcihlcnJvclJlcG9ydERhdGEpIHtcbiAgcmV0dXJuIGRpY3Qoe1xuICAgICdtJzogZXJyb3JSZXBvcnREYXRhWydtJ10sIC8vIG1lc3NhZ2VcbiAgICAnYSc6IGVycm9yUmVwb3J0RGF0YVsnYSddLCAvLyBpc1VzZXJFcnJvclxuICAgICdzJzogZXJyb3JSZXBvcnREYXRhWydzJ10sIC8vIGVycm9yIHN0YWNrXG4gICAgJ2VsJzogZXJyb3JSZXBvcnREYXRhWydlbCddLCAvLyB0YWdOYW1lXG4gICAgJ2V4JzogZXJyb3JSZXBvcnREYXRhWydleCddLCAvLyBleHBlY3RlZCBlcnJvcj9cbiAgICAndic6IGVycm9yUmVwb3J0RGF0YVsndiddLCAvLyBydW50aW1lXG4gICAgJ3B0JzogZXJyb3JSZXBvcnREYXRhWydwdCddLCAvLyBpcyBwcmUtdGhyb3R0bGVkXG4gIH0pO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfHVuZGVmaW5lZH0gIG1lc3NhZ2VcbiAqIEBwYXJhbSB7Knx1bmRlZmluZWR9IGVycm9yXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGJ1aWxkRXJyb3JNZXNzYWdlXyhtZXNzYWdlLCBlcnJvcikge1xuICBpZiAoZXJyb3IpIHtcbiAgICBpZiAoZXJyb3IubWVzc2FnZSkge1xuICAgICAgbWVzc2FnZSA9IGVycm9yLm1lc3NhZ2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRoaXMgc2hvdWxkIG5ldmVyIGJlIGEgc3RyaW5nLCBidXQgc29tZXRpbWVzIGl0IGlzLlxuICAgICAgbWVzc2FnZSA9IFN0cmluZyhlcnJvcik7XG4gICAgfVxuICB9XG4gIGlmICghbWVzc2FnZSkge1xuICAgIG1lc3NhZ2UgPSAnVW5rbm93biBlcnJvcic7XG4gIH1cblxuICByZXR1cm4gbWVzc2FnZTtcbn1cblxuLyoqXG4gKiBTaWduYXR1cmUgZGVzaWduZWQsIHNvIGl0IGNhbiB3b3JrIHdpdGggd2luZG93Lm9uZXJyb3JcbiAqIEBwYXJhbSB7c3RyaW5nfHVuZGVmaW5lZH0gbWVzc2FnZVxuICogQHBhcmFtIHtzdHJpbmd8dW5kZWZpbmVkfSBmaWxlbmFtZVxuICogQHBhcmFtIHtzdHJpbmd8dW5kZWZpbmVkfSBsaW5lXG4gKiBAcGFyYW0ge3N0cmluZ3x1bmRlZmluZWR9IGNvbFxuICogQHBhcmFtIHsqfHVuZGVmaW5lZH0gZXJyb3JcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaGFzTm9uQW1wSnNcbiAqIEByZXR1cm4geyFKc29uT2JqZWN0fHVuZGVmaW5lZH0gVGhlIGRhdGEgdG8gcG9zdFxuICogdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEVycm9yUmVwb3J0RGF0YShcbiAgbWVzc2FnZSxcbiAgZmlsZW5hbWUsXG4gIGxpbmUsXG4gIGNvbCxcbiAgZXJyb3IsXG4gIGhhc05vbkFtcEpzXG4pIHtcbiAgbWVzc2FnZSA9IGJ1aWxkRXJyb3JNZXNzYWdlXyhtZXNzYWdlLCBlcnJvcik7XG4gIC8vIEFuIFwiZXhwZWN0ZWRcIiBlcnJvciBpcyBzdGlsbCBhbiBlcnJvciwgaS5lLiBzb21lIGZlYXR1cmVzIGFyZSBkaXNhYmxlZFxuICAvLyBvciBub3QgZnVuY3Rpb25pbmcgZnVsbHkgYmVjYXVzZSBvZiBpdC4gSG93ZXZlciwgaXQncyBhbiBleHBlY3RlZFxuICAvLyBlcnJvci4gRS5nLiBhcyBpcyB0aGUgY2FzZSB3aXRoIHNvbWUgYnJvd3NlciBBUEkgbWlzc2luZyAoc3RvcmFnZSkuXG4gIC8vIFRodXMsIHRoZSBlcnJvciBjYW4gYmUgY2xhc3NpZmllZCBkaWZmZXJlbnRseSBieSBsb2cgYWdncmVnYXRvcnMuXG4gIC8vIFRoZSBtYWluIGdvYWwgaXMgdG8gbW9uaXRvciB0aGF0IGFuIFwiZXhwZWN0ZWRcIiBlcnJvciBkb2Vzbid0IGRldGVyaW9yYXRlXG4gIC8vIG92ZXIgdGltZS4gSXQncyBpbXBvc3NpYmxlIHRvIGNvbXBsZXRlbHkgZWxpbWluYXRlIGl0LlxuICBsZXQgZXhwZWN0ZWQgPSAhIShlcnJvciAmJiBlcnJvci5leHBlY3RlZCk7XG4gIGlmICgvX3JlcG9ydGVkXy8udGVzdChtZXNzYWdlKSkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAobWVzc2FnZSA9PSBDQU5DRUxMRUQpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBkZXRhY2hlZFdpbmRvdyA9ICEoc2VsZiAmJiBzZWxmLndpbmRvdyk7XG4gIGNvbnN0IHRocm90dGxlQmFzZSA9IE1hdGgucmFuZG9tKCk7XG5cbiAgLy8gV2UgdGhyb3R0bGUgbG9hZCBlcnJvcnMgYW5kIGdlbmVyaWMgXCJTY3JpcHQgZXJyb3IuXCIgZXJyb3JzXG4gIC8vIHRoYXQgaGF2ZSBubyBpbmZvcm1hdGlvbiBhbmQgdGh1cyBjYW5ub3QgYmUgYWN0ZWQgdXBvbi5cbiAgaWYgKFxuICAgIGlzTG9hZEVycm9yTWVzc2FnZShtZXNzYWdlKSB8fFxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYW1wcHJvamVjdC9hbXBodG1sL2lzc3Vlcy83MzUzXG4gICAgLy8gZm9yIGNvbnRleHQuXG4gICAgbWVzc2FnZSA9PSAnU2NyaXB0IGVycm9yLicgfHxcbiAgICAvLyBXaW5kb3cgaGFzIGJlY29tZSBkZXRhY2hlZCwgcmVhbGx5IGFueXRoaW5nIGNhbiBoYXBwZW5cbiAgICAvLyBhdCB0aGlzIHBvaW50LlxuICAgIGRldGFjaGVkV2luZG93XG4gICkge1xuICAgIGV4cGVjdGVkID0gdHJ1ZTtcblxuICAgIGlmICh0aHJvdHRsZUJhc2UgPiBOT05fQUNUSU9OQUJMRV9FUlJPUl9USFJPVFRMRV9USFJFU0hPTEQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICBjb25zdCBpc1VzZXJFcnJvciA9IGlzVXNlckVycm9yTWVzc2FnZShtZXNzYWdlKTtcblxuICAvLyBPbmx5IHJlcG9ydCBhIHN1YnNldCBvZiB1c2VyIGVycm9ycy5cbiAgaWYgKGlzVXNlckVycm9yICYmIHRocm90dGxlQmFzZSA+IFVTRVJfRVJST1JfVEhST1RUTEVfVEhSRVNIT0xEKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gVGhpcyBpcyB0aGUgQXBwIEVuZ2luZSBhcHAgaW5cbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FtcHByb2plY3QvZXJyb3ItdHJhY2tlclxuICAvLyBJdCBzdG9yZXMgZXJyb3IgcmVwb3J0cyB2aWEgaHR0cHM6Ly9jbG91ZC5nb29nbGUuY29tL2Vycm9yLXJlcG9ydGluZy9cbiAgLy8gZm9yIGFuYWx5emluZyBwcm9kdWN0aW9uIGlzc3Vlcy5cbiAgY29uc3QgZGF0YSA9IC8qKiBAdHlwZSB7IUpzb25PYmplY3R9ICovIChPYmplY3QuY3JlYXRlKG51bGwpKTtcbiAgZGF0YVsndiddID0gZ2V0TW9kZSgpLnJ0dlZlcnNpb247XG4gIGRhdGFbJ25vQW1wJ10gPSBoYXNOb25BbXBKcyA/ICcxJyA6ICcwJztcbiAgZGF0YVsnbSddID0gbWVzc2FnZS5yZXBsYWNlKFVTRVJfRVJST1JfU0VOVElORUwsICcnKTtcbiAgZGF0YVsnYSddID0gaXNVc2VyRXJyb3IgPyAnMScgOiAnMCc7XG5cbiAgLy8gRXJyb3JzIGFyZSB0YWdnZWQgd2l0aCBcImV4XCIgKFwiZXhwZWN0ZWRcIikgbGFiZWwgdG8gYWxsb3cgbG9nZ2VycyB0b1xuICAvLyBjbGFzc2lmeSB0aGVzZSBlcnJvcnMgYXMgYmVuY2htYXJrcyBhbmQgbm90IGV4Y2VwdGlvbnMuXG4gIGRhdGFbJ2V4J10gPSBleHBlY3RlZCA/ICcxJyA6ICcwJztcbiAgZGF0YVsnZHcnXSA9IGRldGFjaGVkV2luZG93ID8gJzEnIDogJzAnO1xuXG4gIGxldCBydW50aW1lID0gJzFwJztcbiAgaWYgKElTX1NYRykge1xuICAgIHJ1bnRpbWUgPSAnc3hnJztcbiAgICBkYXRhWydzeGcnXSA9ICcxJztcbiAgfSBlbHNlIGlmIChJU19FU00pIHtcbiAgICBydW50aW1lID0gJ2VzbSc7XG4gICAgZGF0YVsnZXNtJ10gPSAnMSc7XG4gIH0gZWxzZSBpZiAoc2VsZi5jb250ZXh0ICYmIHNlbGYuY29udGV4dC5sb2NhdGlvbikge1xuICAgIGRhdGFbJzNwJ10gPSAnMSc7XG4gICAgcnVudGltZSA9ICczcCc7XG4gIH0gZWxzZSBpZiAoZ2V0TW9kZSgpLnJ1bnRpbWUpIHtcbiAgICBydW50aW1lID0gZ2V0TW9kZSgpLnJ1bnRpbWU7XG4gIH1cblxuICBkYXRhWydydCddID0gcnVudGltZTtcblxuICAvLyBBZGQgb3VyIGE0YSBpZCBpZiB3ZSBhcmUgaW5hYm94XG4gIGlmIChydW50aW1lID09PSAnaW5hYm94Jykge1xuICAgIGRhdGFbJ2FkaWQnXSA9IGdldE1vZGUoKS5hNGFJZDtcbiAgfVxuXG4gIC8vIFRPRE8oZXJ3aW5tKTogUmVtb3ZlIGNhIHdoZW4gYWxsIHN5c3RlbXMgcmVhZCBgYnRgIGluc3RlYWQgb2YgYGNhYCB0b1xuICAvLyBpZGVudGlmeSBqcyBiaW5hcnkgdHlwZS5cbiAgZGF0YVsnY2EnXSA9IGlzQ2FuYXJ5KHNlbGYpID8gJzEnIDogJzAnO1xuXG4gIC8vIFBhc3MgYmluYXJ5IHR5cGUuXG4gIGRhdGFbJ2J0J10gPSBnZXRCaW5hcnlUeXBlKHNlbGYpO1xuXG4gIGlmIChzZWxmLmxvY2F0aW9uLmFuY2VzdG9yT3JpZ2lucyAmJiBzZWxmLmxvY2F0aW9uLmFuY2VzdG9yT3JpZ2luc1swXSkge1xuICAgIGRhdGFbJ29yJ10gPSBzZWxmLmxvY2F0aW9uLmFuY2VzdG9yT3JpZ2luc1swXTtcbiAgfVxuICBpZiAoc2VsZi52aWV3ZXJTdGF0ZSkge1xuICAgIGRhdGFbJ3ZzJ10gPSBzZWxmLnZpZXdlclN0YXRlO1xuICB9XG4gIC8vIElzIGVtYmVkZGVkP1xuICBpZiAoc2VsZi5wYXJlbnQgJiYgc2VsZi5wYXJlbnQgIT0gc2VsZikge1xuICAgIGRhdGFbJ2llbSddID0gJzEnO1xuICB9XG5cbiAgaWYgKHNlbGYuQU1QICYmIHNlbGYuQU1QLnZpZXdlcikge1xuICAgIGNvbnN0IHJlc29sdmVkVmlld2VyVXJsID0gc2VsZi5BTVAudmlld2VyLmdldFJlc29sdmVkVmlld2VyVXJsKCk7XG4gICAgY29uc3QgbWVzc2FnaW5nT3JpZ2luID0gc2VsZi5BTVAudmlld2VyLm1heWJlR2V0TWVzc2FnaW5nT3JpZ2luKCk7XG4gICAgaWYgKHJlc29sdmVkVmlld2VyVXJsKSB7XG4gICAgICBkYXRhWydydnUnXSA9IHJlc29sdmVkVmlld2VyVXJsO1xuICAgIH1cbiAgICBpZiAobWVzc2FnaW5nT3JpZ2luKSB7XG4gICAgICBkYXRhWydtc28nXSA9IG1lc3NhZ2luZ09yaWdpbjtcbiAgICB9XG4gIH1cblxuICBjb25zdCBleHBzID0gW107XG4gIGNvbnN0IGV4cGVyaW1lbnRzID0gZXhwZXJpbWVudFRvZ2dsZXNPck51bGwoc2VsZik7XG4gIGZvciAoY29uc3QgZXhwIGluIGV4cGVyaW1lbnRzKSB7XG4gICAgY29uc3Qgb24gPSBleHBlcmltZW50c1tleHBdO1xuICAgIGV4cHMucHVzaChgJHtleHB9PSR7b24gPyAnMScgOiAnMCd9YCk7XG4gIH1cbiAgZGF0YVsnZXhwcyddID0gZXhwcy5qb2luKCcsJyk7XG5cbiAgaWYgKGVycm9yKSB7XG4gICAgZGF0YVsnZWwnXSA9IGVycm9yLmFzc29jaWF0ZWRFbGVtZW50Py50YWdOYW1lIHx8ICd1JzsgLy8gVW5rbm93blxuXG4gICAgaWYgKGVycm9yLmFyZ3MpIHtcbiAgICAgIGRhdGFbJ2FyZ3MnXSA9IEpTT04uc3RyaW5naWZ5KGVycm9yLmFyZ3MpO1xuICAgIH1cblxuICAgIGlmICghaXNVc2VyRXJyb3IgJiYgIWVycm9yLmlnbm9yZVN0YWNrICYmIGVycm9yLnN0YWNrKSB7XG4gICAgICBkYXRhWydzJ10gPSBlcnJvci5zdGFjaztcbiAgICB9XG5cbiAgICAvLyBUT0RPKGpyaWRnZXdlbGwsICMxODU3NCk7IE1ha2Ugc3VyZSBlcnJvciBpcyBhbHdheXMgYW4gb2JqZWN0LlxuICAgIGlmIChlcnJvci5tZXNzYWdlKSB7XG4gICAgICBlcnJvci5tZXNzYWdlICs9ICcgX3JlcG9ydGVkXyc7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGRhdGFbJ2YnXSA9IGZpbGVuYW1lIHx8ICcnO1xuICAgIGRhdGFbJ2wnXSA9IGxpbmUgfHwgJyc7XG4gICAgZGF0YVsnYyddID0gY29sIHx8ICcnO1xuICB9XG4gIGRhdGFbJ3InXSA9IHNlbGYuZG9jdW1lbnQgPyBzZWxmLmRvY3VtZW50LnJlZmVycmVyIDogJyc7XG4gIGRhdGFbJ2FlJ10gPSBhY2N1bXVsYXRlZEVycm9yTWVzc2FnZXMuam9pbignLCcpO1xuICBkYXRhWydmciddID0gc2VsZi5sb2NhdGlvblsnb3JpZ2luYWxIYXNoJ10gfHwgc2VsZi5sb2NhdGlvbi5oYXNoO1xuXG4gIC8vIFRPRE8oaHR0cHM6Ly9naXRodWIuY29tL2FtcHByb2plY3QvZXJyb3ItdHJhY2tlci9pc3N1ZXMvMTI5KTogUmVtb3ZlIG9uY2VcbiAgLy8gYWxsIGNsaWVudHMgYXJlIHNlcnZpbmcgYSB2ZXJzaW9uIHdpdGggcHJlLXRocm90dGxpbmcuXG4gIGlmIChkYXRhWydidCddID09PSAncHJvZHVjdGlvbicpIHtcbiAgICAvLyBTZXR0aW5nIHRoaXMgZmllbGQgYWxsb3dzIHRoZSBlcnJvciByZXBvcnRpbmcgc2VydmljZSB0byBrbm93IHRoYXQgdGhpc1xuICAgIC8vIGVycm9yIGhhcyBhbHJlYWR5IGJlZW4gcHJlLXRocm90dGxlZCBmb3IgU3RhYmxlLCBzbyBpdCBkb2Vzbid0IG5lZWQgdG9cbiAgICAvLyB0aHJvdHRsZSBhZ2Fpbi5cbiAgICBkYXRhWydwdCddID0gJzEnO1xuICB9XG5cbiAgcHVzaExpbWl0KGFjY3VtdWxhdGVkRXJyb3JNZXNzYWdlcywgbWVzc2FnZSwgMjUpO1xuXG4gIHJldHVybiBkYXRhO1xufVxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiBpdCBhcHBlYXJzIGxpa2UgdGhlcmUgaXMgbm9uLUFNUCBKUyBvbiB0aGVcbiAqIGN1cnJlbnQgcGFnZS5cbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICogQHZpc2libGVGb3JUZXN0aW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXRlY3ROb25BbXBKcyh3aW4pIHtcbiAgaWYgKCF3aW4uZG9jdW1lbnQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgY29uc3Qgc2NyaXB0cyA9IHdpbi5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdzY3JpcHRbc3JjXScpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHNjcmlwdHMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoIWlzUHJveHlPcmlnaW4oc2NyaXB0c1tpXS5zcmMudG9Mb3dlckNhc2UoKSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogUmVzZXRzIGFjY3VtdWxhdGVkIGVycm9yIG1lc3NhZ2VzIGZvciB0ZXN0aW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldEFjY3VtdWxhdGVkRXJyb3JNZXNzYWdlc0ZvclRlc3RpbmcoKSB7XG4gIGFjY3VtdWxhdGVkRXJyb3JNZXNzYWdlcyA9IFtdO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IUVycm9yfSBlcnJvclxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlcG9ydEVycm9yVG9BbmFseXRpY3MoZXJyb3IsIHdpbikge1xuICAvLyBDdXJyZW50bHkgdGhpcyBjYW4gb25seSBiZSBleGVjdXRlZCBpbiBhIHNpbmdsZS1kb2MgbW9kZS4gT3RoZXJ3aXNlLFxuICAvLyBpdCdzIG5vdCBjbGVhciB3aGljaCBhbXBkb2MgdGhlIGV2ZW50IHdvdWxkIGJlbG9uZyB0b28uXG4gIGlmIChTZXJ2aWNlcy5hbXBkb2NTZXJ2aWNlRm9yKHdpbikuaXNTaW5nbGVEb2MoKSkge1xuICAgIGNvbnN0IHZhcnMgPSBkaWN0KHtcbiAgICAgICdlcnJvck5hbWUnOiBlcnJvci5uYW1lLFxuICAgICAgJ2Vycm9yTWVzc2FnZSc6IGVycm9yLm1lc3NhZ2UsXG4gICAgfSk7XG4gICAgdHJpZ2dlckFuYWx5dGljc0V2ZW50KFxuICAgICAgZ2V0Um9vdEVsZW1lbnRfKHdpbiksXG4gICAgICAndXNlci1lcnJvcicsXG4gICAgICB2YXJzLFxuICAgICAgLyoqIGVuYWJsZURhdGFWYXJzICovIGZhbHNlXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcmV0dXJuIHshRWxlbWVudH1cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGdldFJvb3RFbGVtZW50Xyh3aW4pIHtcbiAgY29uc3Qgcm9vdCA9IFNlcnZpY2VzLmFtcGRvY1NlcnZpY2VGb3Iod2luKS5nZXRTaW5nbGVEb2MoKS5nZXRSb290Tm9kZSgpO1xuICByZXR1cm4gZGV2KCkuYXNzZXJ0RWxlbWVudChyb290LmRvY3VtZW50RWxlbWVudCB8fCByb290LmJvZHkgfHwgcm9vdCk7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/error-reporting.js