/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
import {
  defineConfigurableWritableProperty,
} from './configurable-writable-property';

const {hasOwnProperty} = Object.prototype;

/**
 * Copies values of all enumerable own properties from one or more source
 * objects (provided as extended arguments to the function) to a target object.
 *
 * @param {!Object} target
 * @param {...Object} var_args
 * @return {!Object}
 */
export function assign(target, var_args) {
  if (target == null) {
    throw new TypeError('Cannot convert undefined or null to object');
  }

  const output = Object(target);
  for (let i = 1; i < arguments.length; i++) {
    const source = arguments[i];
    if (source != null) {
      for (const key in source) {
        if (hasOwnProperty.call(source, key)) {
          output[key] = source[key];
        }
      }
    }
  }
  return output;
}


/**
 * Sets the Object.assign polyfill if it does not exist.
 * @param {!Window} win
 */
export function install(win) {
  if (!win.Object.assign) {
    defineConfigurableWritableProperty(win, win.Object, 'assign', assign,
        /* opt_enumerable */ false);
  }
}
