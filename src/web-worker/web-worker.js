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
import {hasOwn} from '../../src/utils/object';
import {isArray, isObject} from '../../src/types';
import './web-worker-polyfills';
import {initLogConstructor, setReportError} from '../log';
import {reportError} from '../error';


console.log('web worker started', Date.now());
initLogConstructor();
setReportError(reportError);



function simpleHandler_(event) {
  if (event.data.method != 'deepMerge') {
    return;
  }
  console.log('event is ', event.data);
  const configs = event.data.args.configs;
  console.log('configs', configs);
  for (let i = 0; i < configs.length - 1; i++) {
    mergeObjects(configs[i], configs[i+1]);
  }
  // `message` may only contain values or objects handled by the
  // structured clone algorithm.
  // https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
  self./*OK*/ postMessage({
    method: 'deepMerge',
    returnValue: {
      result: configs[configs.length - 1],
      error: null,
    },
    id: event.data.id,
  });
}
self.addEventListener('message', simpleHandler_)

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

  for (const property in from) {
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
