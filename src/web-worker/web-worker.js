/**
 * @fileoverview Web worker entry point. Currently only used by a single
 *   extension (amp-bind), so dependencies are directly imported.
 *   Eventually, each extension that uses this worker will bundle its own
 *   "lib" JS files and loaded at runtime via `importScripts()`.
 */

import './web-worker-polyfills';
import {exponentialBackoff} from '#core/types/function/exponential-backoff';

import {dev, initLogConstructor, setReportError} from '#utils/log';

import {BindEvaluator} from '../../extensions/amp-bind/0.1/bind-evaluator';
import * as urls from '../config/urls';
import {reportError} from '../error-reporting';

initLogConstructor();
setReportError(reportError);

/** @const {string} */
const TAG = 'web-worker';

/**
 * Exponential backoff for error reports to avoid any given
 * worker from generating a very large number of errors.
 * @const {function(function()): number}
 */
const backoff_ = exponentialBackoff(1.5);

/**
 * @param {!Event} event
 */
function errorHandler_(event) {
  backoff_(() => report_(event.reason));
}

/**
 * Element `i` contains the evaluator for scope `i`.
 * @private {!Array<!BindEvaluator>}
 */
const evaluators_ = [];

// Install error reporting on the `self` global. Error requests contain a
// URL param "ww=1" that identifies the originating worker.
self.addEventListener('unhandledrejection', errorHandler_);
self.addEventListener('error', errorHandler_);

self.addEventListener('message', function (event) {
  const messageEvent = /** @type {!MessageEvent} */ (event);
  const {args, id, method, scope} = /** @type {ToWorkerMessageDef} */ (
    messageEvent.data
  );
  let returnValue;

  // TODO(choumx): Remove this fallback when we confirm there are no errors.
  if (method !== 'bind.init' && !evaluators_[scope]) {
    dev().error(TAG, 'Missing evaluator for scope: %s', scope);
    evaluators_[scope] = new BindEvaluator(/* allowUrlProperties */ true);
  }
  const evaluator = evaluators_[scope];

  switch (method) {
    case 'bind.init':
      if (evaluator) {
        dev().warn(TAG, 'Overwriting existing evaluator for scope:', scope);
      }
      const allowUrlProperties = args[0];
      evaluators_[scope] = new BindEvaluator(allowUrlProperties);
      returnValue = true;
      break;
    case 'bind.addBindings':
      returnValue = evaluator.addBindings.apply(evaluator, args);
      break;
    case 'bind.removeBindingsWithExpressionStrings':
      const removeBindings = evaluator.removeBindingsWithExpressionStrings;
      returnValue = removeBindings.apply(evaluator, args);
      break;
    case 'bind.addMacros':
      returnValue = evaluator.addMacros.apply(evaluator, args);
      break;
    case 'bind.evaluateBindings':
      returnValue = evaluator.evaluateBindings.apply(evaluator, args);
      break;
    case 'bind.evaluateExpression':
      returnValue = evaluator.evaluateExpression.apply(evaluator, args);
      break;
    default:
      dev().error(TAG, 'Unrecognized method: %s', method);
  }

  const message = /** @type {FromWorkerMessageDef} */ ({
    method,
    returnValue,
    id,
  });
  // `message` may only contain values or objects handled by the
  // structured clone algorithm.
  // https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
  self./*OK*/ postMessage(message);
});

/**
 * Report error to AMP's error reporting frontend.
 * @param {*} e
 */
function report_(e) {
  // Don't report local dev errors.
  if (urls.localhostRegex.test(self.location.origin)) {
    return;
  }
  if (!(e instanceof Error)) {
    e = new Error(e);
  }
  const config = self.AMP_CONFIG || {};
  const url =
    urls.errorReporting +
    '?' +
    'ww=1' + // Tags request as coming from a worker.
    '&v=' +
    encodeURIComponent(config.v) +
    '&m=' +
    encodeURIComponent(e.message) +
    '&ca=' +
    (config.canary ? 1 : 0) +
    '&s=' +
    encodeURIComponent(e.stack || '');
  fetch(
    url,
    /** @type {!RequestInit} */ ({
      // We don't care about the response.
      mode: 'no-cors',
    })
  ).catch((reason) => {
    console./*OK*/ error(reason);
  });
}
