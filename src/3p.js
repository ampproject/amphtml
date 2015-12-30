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

/**
 * @fileoverview Utility functions for scripts running inside of a third
 * party iframe.
 */

// Note: loaded by 3p system. Cannot rely on babel polyfills.


import {assert} from './asserts';


/** @typedef {function(!Window, !Object)}  */
let ThirdPartyFunctionDef;


/**
 * @const {!Object<ThirdPartyFunctionDef>}
 * @visibleForTesting
 */
export const registrations = {};

/** @type {number} */
let syncScriptLoads = 0;

/**
 * @param {string} id The specific 3p integration.
 * @param {ThirdPartyFunctionDef} draw Function that draws the 3p integration.
 */
export function register(id, draw) {
  assert(!registrations[id], 'Double registration %s', id);
  registrations[id] = draw;
}

/**
 * Execute the 3p integration with the given id.
 * @param {id} id
 * @param {!Window} win
 * @param {!Object} data
 */
export function run(id, win, data) {
  const fn = registrations[id];
  assert(fn, 'Unknown 3p: ' + id);
  fn(win, data);
}

/**
 * Synchronously load the given script URL. Only use this if you need a sync
 * load. Otherwise use {@link loadScript}.
 * Supports taking a callback that will be called synchronously after the given
 * script was executed.
 * @param {!Window} win
 * @param {string} url
 * @param {function()=} opt_cb
 */
export function writeScript(win, url, opt_cb) {
  /*eslint no-useless-concat: 0*/
  win.document
      .write('<' + 'script src="' + encodeURI(url) + '"><' + '/script>');
  if (opt_cb) {
    executeAfterWriteScript(win, opt_cb);
  }
}

/**
 * Asynchronously load the given script URL.
 * @param {!Window} win
 * @param {string} url
 * @param {function()=} cb
 */
export function loadScript(win, url, cb) {
  const s = win.document.createElement('script');
  s.src = url;
  s.onload = cb;
  win.document.body.appendChild(s);
}

/**
 * Run the function after all currently waiting sync scripts have been
 * executed.
 * @param {!Window} win
 * @param {function()} fn
 */
function executeAfterWriteScript(win, fn) {
  const index = syncScriptLoads++;
  win['__runScript' + index] = fn;
  win.document.write('<' + 'script>__runScript' + index + '()<' + '/script>');
}

/**
 * Throws if the given src doesn't start with prefix.
 * @param {string} prefix
 * @param {string} src
 */
export function validateSrcPrefix(prefix, src) {
  if (src.indexOf(prefix) !== 0) {
    throw new Error('Invalid src ' + src);
  }
}

/**
 * Throws if the given src doesn't contain the string
 * @param {string} string
 * @param {string} src
 */
export function validateSrcContains(string, src) {
  if (src.indexOf(string) === -1) {
    throw new Error('Invalid src ' + src);
  }
}

/**
 * Throws a non-interrupting exception if data contains a field not supported
 * by this embed type.
 * @param {!Object} data
 * @param {!Array<string>} allowedFields
 */
export function checkData(data, allowedFields) {
  // Throw in a timeout, because we do not want to interrupt execution,
  // because that would make each removal an instant backward incompatible
  // change.
  try {
    validateData(data, allowedFields);
  } catch (e) {
    setTimeout(() => {
      throw e;
    });
  }
}

/**
 * Throws an exception if data contains a field not supported
 * by this embed type.
 * @param {!Object} data
 * @param {!Array<string>} allowedFields
 */
export function validateData(data, allowedFields) {
  const defaultAvailableFields = {
    width: true,
    height: true,
    initialWindowWidth: true,
    initialWindowHeight: true,
    type: true,
    referrer: true,
    canonicalUrl: true,
    pageViewId: true,
    location: true,
    mode: true,
  };
  for (const field in data) {
    if (!data.hasOwnProperty(field) ||
        field in defaultAvailableFields) {
      continue;
    }
    assert(allowedFields.indexOf(field) != -1,
        'Unknown attribute for %s: %s.', data.type, field);
  }
}
