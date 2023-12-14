import {AmpEvents_Enum} from '#core/constants/amp-events';
import {duplicateErrorIfNecessary} from '#core/error';
import {
  USER_ERROR_SENTINEL,
  isUserErrorEmbedMessage,
  isUserErrorMessage,
} from '#core/error/message-helpers';
import * as mode from '#core/mode';
import {findIndex} from '#core/types/array';
import {exponentialBackoff} from '#core/types/function/exponential-backoff';

import {experimentTogglesOrNull, getBinaryType, isCanary} from '#experiments';

import {Services} from '#service';

import {triggerAnalyticsEvent} from '#utils/analytics';
import {isLoadErrorMessage} from '#utils/event-helper';
import {dev, setReportError} from '#utils/log';

import * as urls from './config/urls';
import {getMode} from './mode';
import {makeBodyVisibleRecovery} from './style-installer';
import {isProxyOrigin} from './url';

export {setReportError};

/**
 * @const {string}
 */
const CANCELLED = 'CANCELLED';

/**
 * @const {string}
 */
const BLOCK_BY_CONSENT = 'BLOCK_BY_CONSENT';

/**
 * @const {string}
 */
const ABORTED = 'AbortError';

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
 * Chance to post to the new error reporting endpoint.
 * @const {number}
 */
const BETA_ERROR_REPORT_URL_FREQ = 0.1;

/**
 * Collects error messages, so they can be included in subsequent reports.
 * That allows identifying errors that might be caused by previous errors.
 */
let accumulatedErrorMessages = self.__AMP_ERRORS || [];
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
let reportingBackoff = function (work) {
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
 * @param {!Window} win
 * @param {*} error
 * @param {!Element=} opt_associatedElement
 */
export function reportErrorForWin(win, error, opt_associatedElement) {
  reportError(error, opt_associatedElement);
  if (
    error &&
    !!win &&
    isUserErrorMessage(error.message) &&
    !isUserErrorEmbedMessage(error.message)
  ) {
    reportErrorToAnalytics(/** @type {!Error} */ (error), win);
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
        error = duplicateErrorIfNecessary(/** @type {!Error} */ (error));
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
      setTimeout(function () {
        const rethrow = new Error(
          '_reported_ Error reported incorrectly: ' + error
        );
        throw rethrow;
      });
    }

    if (error.reported) {
      return /** @type {!Error} */ (error);
    }
    error.reported = true;

    // `associatedElement` is used to add the i-amphtml-error class; in
    // `#development=1` mode, it also adds `i-amphtml-element-error` to the
    // element and sets the `error-message` attribute.
    if (error.messageArray) {
      const elIndex = findIndex(error.messageArray, (item) => item?.tagName);
      if (elIndex > -1) {
        error.associatedElement = error.messageArray[elIndex];
      }
    }
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
    if (
      self.console &&
      (isUserErrorMessage(error.message) ||
        !error.expected ||
        getMode().localDev)
    ) {
      const output = console.error || console.log;
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
      element.dispatchCustomEventForTesting(
        AmpEvents_Enum.ERROR,
        error.message
      );
    }

    // 'call' to make linter happy. And .call to make compiler happy
    // that expects some @this.
    onError['call'](self, undefined, undefined, undefined, undefined, error);
  } catch (errorReportingError) {
    setTimeout(function () {
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
  win.onerror = /** @type {!Function} */ (onError);
  win.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason &&
      (event.reason.message === CANCELLED ||
        event.reason.message === BLOCK_BY_CONSENT ||
        event.reason.message === ABORTED)
    ) {
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
  // Make an attempt to unhide the body but don't if the error is actually expected.
  // eslint-disable-next-line local/no-invalid-this
  if (this && this.document && (!error || !error.expected)) {
    // eslint-disable-next-line local/no-invalid-this
    makeBodyVisibleRecovery(this.document);
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
  const data = getErrorReportData(
    message,
    filename,
    line,
    col,
    error,
    hasNonAmpJs
  );
  if (data) {
    reportingBackoff(() => {
      try {
        return reportErrorToServerOrViewer(
          // eslint-disable-next-line local/no-invalid-this
          this,
          /** @type {!JsonObject} */
          (data)
        ).catch(() => {
          // catch async errors to avoid recursive errors.
        });
      } catch (e) {
        // catch async errors to avoid recursive errors.
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
  return Math.random() < BETA_ERROR_REPORT_URL_FREQ
    ? urls.betaErrorReporting
    : urls.errorReporting;
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
    return Promise.resolve();
  }

  return maybeReportErrorToViewer(win, data).then((reportedErrorToViewer) => {
    if (!reportedErrorToViewer) {
      const xhr = new XMLHttpRequest();
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
  const ampdocService = Services.ampdocServiceFor(win);
  if (!ampdocService.isSingleDoc()) {
    return Promise.resolve(false);
  }
  const ampdocSingle = ampdocService.getSingleDoc();
  const htmlElement = ampdocSingle.getRootNode().documentElement;
  const docOptedIn = htmlElement.hasAttribute('report-errors-to-viewer');
  if (!docOptedIn) {
    return Promise.resolve(false);
  }
  const viewer = Services.viewerForDoc(ampdocSingle);
  if (!viewer.hasCapability('errorReporter')) {
    return Promise.resolve(false);
  }
  return viewer.isTrustedViewer().then((viewerTrusted) => {
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
  return {
    'm': errorReportData['m'], // message
    'a': errorReportData['a'], // isUserError
    's': errorReportData['s'], // error stack
    'el': errorReportData['el'], // tagName
    'ex': errorReportData['ex'], // expected error?
    'v': errorReportData['v'], // runtime
    'pt': errorReportData['pt'], // is pre-throttled
  };
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
export function getErrorReportData(
  message,
  filename,
  line,
  col,
  error,
  hasNonAmpJs
) {
  message = buildErrorMessage_(message, error);
  // An "expected" error is still an error, i.e. some features are disabled
  // or not functioning fully because of it. However, it's an expected
  // error. E.g. as is the case with some browser API missing (storage).
  // Thus, the error can be classified differently by log aggregators.
  // The main goal is to monitor that an "expected" error doesn't deteriorate
  // over time. It's impossible to completely eliminate it.
  let expected = !!(error && error.expected);
  if (/_reported_/.test(message)) {
    return;
  }
  if (message == CANCELLED) {
    return;
  }

  const detachedWindow = !(self && self.window);
  const throttleBase = Math.random();

  // We throttle load errors and generic "Script error." errors
  // that have no information and thus cannot be acted upon.
  if (
    isLoadErrorMessage(message) ||
    // See https://github.com/ampproject/amphtml/issues/7353
    // for context.
    message == 'Script error.' ||
    // Window has become detached, really anything can happen
    // at this point.
    detachedWindow
  ) {
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
  data['dw'] = detachedWindow ? '1' : '0';

  let runtime = '1p';
  if (IS_SXG) {
    runtime = 'sxg';
    data['sxg'] = '1';
  } else if (mode.isEsm()) {
    runtime = 'esm';
    data['esm'] = '1';
  } else if (self.context && self.context.location) {
    runtime = '3p';
    data['3p'] = '1';
  } else if (getMode().runtime) {
    runtime = getMode().runtime;
  }

  data['rt'] = runtime;

  // The value of urls.cdn.
  data['cdn'] = urls.cdn;

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
    const resolvedViewerUrl = self.AMP.viewer.getResolvedViewerUrl();
    const messagingOrigin = self.AMP.viewer.maybeGetMessagingOrigin();
    if (resolvedViewerUrl) {
      data['rvu'] = resolvedViewerUrl;
    }
    if (messagingOrigin) {
      data['mso'] = messagingOrigin;
    }
  }

  const exps = [];
  const experiments = experimentTogglesOrNull(self);
  for (const exp in experiments) {
    const on = experiments[exp];
    exps.push(`${exp}=${on ? '1' : '0'}`);
  }
  data['exps'] = exps.join(',');

  if (error) {
    data['el'] = error.associatedElement?.tagName || 'u'; // Unknown

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
  const scripts = win.document.querySelectorAll('script[src]');
  for (let i = 0; i < scripts.length; i++) {
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
    const vars = {
      'errorName': error.name,
      'errorMessage': error.message,
    };
    triggerAnalyticsEvent(
      getRootElement_(win),
      'user-error',
      vars,
      /** enableDataVars */ false
    );
  }
}

/**
 * @param {!Window} win
 * @return {!Element}
 * @private
 */
function getRootElement_(win) {
  const root = Services.ampdocServiceFor(win).getSingleDoc().getRootNode();
  return dev().assertElement(root.documentElement || root.body || root);
}
