/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview Web worker entry point. Currently only used by a single
 *   extension (amp-bind), so dependencies are directly imported.
 *   Eventually, each extension that uses this worker will bundle its own
 *   "lib" JS files and loaded at runtime via `importScripts()`.
 */
import {deepMerge, dict, hasOwn} from '../../src/utils/object';
import {isArray, isObject, toWin} from '../../src/types';
import './web-worker-polyfills';
import {BindEvaluator} from '../../extensions/amp-bind/0.1/bind-evaluator';
import {dev, initLogConstructor, setReportError} from '../log';
import {exponentialBackoff} from '../exponential-backoff';
import {reportError} from '../error';
import {urls} from '../config';


console.log('web worker started', Date.now());
initLogConstructor();
setReportError(reportError);


/**
 * Merges two objects. If the value is array or plain object, the values are
 * merged otherwise the value is overwritten.
 *
 * @param {Object|Array} from Object or array to merge from
 * @param {Object|Array} to Object or Array to merge into
 * @param {boolean=} opt_predefinedConfig
 * @return {*} TODO(#23582): Specify return type
 */
function mergeObjects(from, to, opt_predefinedConfig) {
  if (to === null || to === undefined) {
    to = {};
  }

  // Assert that optouts are allowed only in predefined configs.
  // The last expression adds an exception of known, safe optout function
  // that is already being used in the wild.
  // userAssert(
  //   opt_predefinedConfig ||
  //     !from ||
  //     !from['optout'] ||
  //     from['optout'] == '_gaUserPrefs.ioo' ||
  //     from['optoutElementId'] == '__gaOptOutExtension',
  //   'optout property is only available to vendor config.'
  // );

  for (const property in from) {
    // userAssert(
    //   opt_predefinedConfig || property != 'iframePing',
    //   'iframePing config is only available to vendor config.'
    // );
    // Only deal with own properties.
    if (hasOwn(from, property)) {
      if (isArray(from[property])) {
        if (!isArray(to[property])) {
          to[property] = [];
        }
        to[property] = mergeObjects(
          from[property],
          to[property],
          opt_predefinedConfig
        );
      } else if (isObject(from[property])) {
        if (!isObject(to[property])) {
          to[property] = {};
        }
        to[property] = mergeObjects(
          from[property],
          to[property],
          opt_predefinedConfig
        );
      } else {
        to[property] = from[property];
      }
    }
  }
  return to;
}


function handleMerge_(event) {
  console.log('worker: handle merge');
  console.log('event is ', event.data);

  const from = event.data.args.from;
  const to = event.data.args.to;

  mergeObjects(from, to);
  console.log('to is ', to);
  // `message` may only contain values or objects handled by the
  // structured clone algorithm.
  // https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
  self./*OK*/ postMessage({
    method: 'deepMerge',
    returnValue: {
      result: to,
      error: null,
    },
    id: event.data.id,
  });
}
self.addEventListener('message', handleMerge_)


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

// self.addEventListener('message', function(event) {
//   const {
//     method,
//     args,
//     id,
//     scope,
//   } = /** @type {ToWorkerMessageDef} */ (event.data);
//   let returnValue;

//   // TODO(choumx): Remove this fallback when we confirm there are no errors.
//   if (method !== 'bind.init' && !evaluators_[scope]) {
//     dev().error(TAG, 'Missing evaluator for scope: %s', scope);
//     evaluators_[scope] = new BindEvaluator(/* allowUrlProperties */ true);
//   }
//   const evaluator = evaluators_[scope];

//   switch (method) {
//     case 'bind.init':
//       if (evaluator) {
//         dev().warn(TAG, 'Overwriting existing evaluator for scope:', scope);
//       }
//       const allowUrlProperties = args[0];
//       evaluators_[scope] = new BindEvaluator(allowUrlProperties);
//       returnValue = true;
//       break;
//     case 'bind.addBindings':
//       returnValue = evaluator.addBindings.apply(evaluator, args);
//       break;
//     case 'bind.removeBindingsWithExpressionStrings':
//       const removeBindings = evaluator.removeBindingsWithExpressionStrings;
//       returnValue = removeBindings.apply(evaluator, args);
//       break;
//     case 'bind.addMacros':
//       returnValue = evaluator.addMacros.apply(evaluator, args);
//       break;
//     case 'bind.evaluateBindings':
//       returnValue = evaluator.evaluateBindings.apply(evaluator, args);
//       break;
//     case 'bind.evaluateExpression':
//       returnValue = evaluator.evaluateExpression.apply(evaluator, args);
//       break;
//     default:
//       dev().error(TAG, 'Unrecognized method: %s', method);
//   }

//   const message = /** @type {FromWorkerMessageDef} */ ({
//     method,
//     returnValue,
//     id,
//   });
//   // `message` may only contain values or objects handled by the
//   // structured clone algorithm.
//   // https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
//   self./*OK*/ postMessage(message);
// });

// /**
//  * Report error to AMP's error reporting frontend.
//  * @param {*} e
//  */
function report_(e) {
  return;
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
  ).catch(reason => {
    console./*OK*/ error(reason);
  });
}
