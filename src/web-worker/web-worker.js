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

import '../../third_party/babel/custom-babel-helpers';
import {BindEvaluator} from '../../extensions/amp-bind/0.1/bind-evaluator';
import {FromWorkerMessageDef, ToWorkerMessageDef} from './web-worker-defines';
import {initLogConstructor} from '../../src/log';
import {installWorkerErrorReporting} from '../worker-error-reporting';

initLogConstructor();
installWorkerErrorReporting('ww');

/** @private {BindEvaluator} */
let evaluator_;

self.addEventListener('message', function(event) {
  const {method, args, id} = /** @type {ToWorkerMessageDef} */ (event.data);

  let returnValue;

  if (!evaluator_) {
    evaluator_ = new BindEvaluator();
  }

  switch (method) {
    case 'bind.addBindings':
      returnValue = evaluator_.addBindings.apply(evaluator_, args);
      break;
    case 'bind.removeBindingsWithExpressionStrings':
      const removeBindings = evaluator_.removeBindingsWithExpressionStrings;
      returnValue = removeBindings.apply(evaluator_, args);
      break;
    case 'bind.evaluateBindings':
      returnValue = evaluator_.evaluateBindings.apply(evaluator_, args);
      break;
    case 'bind.evaluateExpression':
      returnValue = evaluator_.evaluateExpression.apply(evaluator_, args);
      break;
    default:
      throw new Error(`Unrecognized method: ${method}`);
  }

  /** @type {FromWorkerMessageDef} */
  const message = {method, returnValue, id};
  // `message` may only contain values or objects handled by the
  // structured clone algorithm.
  // https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
  self./*OK*/postMessage(message);
});
