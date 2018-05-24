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


import {dev, user} from '../src/log';
import {isArray} from '../src/types';
import {map} from '../src/utils/object';
import {rethrowAsync} from '../src/log';


/** @typedef {function(!Window, !Object)}  */
let ThirdPartyFunctionDef;


/**
 * @const {!Object<ThirdPartyFunctionDef>}
 * @visibleForTesting
 */
let registrations;

/** @type {number} */
let syncScriptLoads = 0;

/**
 * Returns the registration map
 */
export function getRegistrations() {
  if (!registrations) {
    registrations = map();
  }
  return registrations;
}

/**
 * @param {string} id The specific 3p integration.
 * @param {ThirdPartyFunctionDef} draw Function that draws the 3p integration.
 */
export function register(id, draw) {
  const registrations = getRegistrations();
  dev().assert(!registrations[id], 'Double registration %s', id);
  registrations[id] = draw;
}

/**
 * Execute the 3p integration with the given id.
 * @param {string} id
 * @param {!Window} win
 * @param {!Object} data
 */
export function run(id, win, data) {
  const fn = registrations[id];
  user().assert(fn, 'Unknown 3p: ' + id);
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
 * @param {function()=} opt_cb
 * @param {function()=} opt_errorCb
 */
export function loadScript(win, url, opt_cb, opt_errorCb) {
  /** @const {!Element} */
  const s = win.document.createElement('script');
  s.src = url;
  if (opt_cb) {
    s.onload = opt_cb;
  }
  if (opt_errorCb) {
    s.onerror = opt_errorCb;
  }
  win.document.body.appendChild(s);
}

/**
 * Call function in micro task or timeout as a fallback.
 * This is a lightweight helper, because we cannot guarantee that
 * Promises are available inside the 3p frame.
 * @param {!Window} win
 * @param {function()} fn
 */
export function nextTick(win, fn) {
  const P = win.Promise;
  if (P) {
    P.resolve().then/*OK*/(fn);
  } else {
    win.setTimeout(fn, 0);
  }
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
 * Throws if the given src doesn't start with prefix(es).
 * @param {!Array<string>|string} prefix
 * @param {string} src
 */
export function validateSrcPrefix(prefix, src) {
  if (!isArray(prefix)) {
    prefix = [prefix];
  }
  if (src !== undefined) {
    for (let p = 0; p < prefix.length; p++) {
      const protocolIndex = src.indexOf(prefix[p]);
      if (protocolIndex == 0) {
        return;
      }
    }
  }
  throw new Error('Invalid src ' + src);
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
 * Utility function to perform a potentially asynchronous task
 * exactly once for all frames of a given type and the provide the respective
 * value to all frames.
 * @param {!Window} global Your window
 * @param {string} taskId Must be not conflict with any other global variable
 *     you use. Must be the same for all callers from all frames that want
 *     the same result.
 * @param {function(function(*))} work Function implementing the work that
 *     is to be done. Receives a second function that should be called with
 *     the result when the work is done.
 * @param {function(*)} cb Callback function that is called when the work is
 *     done. The first argument is the result.
 */
export function computeInMasterFrame(global, taskId, work, cb) {
  const master = global.context.master;
  let tasks = master.__ampMasterTasks;
  if (!tasks) {
    tasks = master.__ampMasterTasks = {};
  }
  let cbs = tasks[taskId];
  if (!tasks[taskId]) {
    cbs = tasks[taskId] = [];
  }
  cbs.push(cb);
  if (!global.context.isMaster) {
    return; // Only do work in master.
  }
  work(result => {
    for (let i = 0; i < cbs.length; i++) {
      cbs[i].call(null, result);
    }
    tasks[taskId] = {
      push(cb) {
        cb(result);
      },
    };
  });
}

/**
 * Validates given data. Throws an exception if the data does not
 * contains a mandatory field. If called with the optional param
 * opt_optionalFields, it also validates that the data contains no fields other
 * than mandatory and optional fields.
 *
 * Mandatory fields also accept a string Array as an item. All items in that
 * array are considered as alternatives to each other. So the validation checks
 * that the data contains exactly one of those alternatives.
 *
 * @param {!Object} data
 * @param {!Array<string|!Array<string>>} mandatoryFields
 * @param {Array<string>=} opt_optionalFields
 */
export function validateData(data, mandatoryFields, opt_optionalFields) {
  let allowedFields = opt_optionalFields || [];
  for (let i = 0; i < mandatoryFields.length; i++) {
    const field = mandatoryFields[i];
    if (Array.isArray(field)) {
      validateExactlyOne(data, field);
      allowedFields = allowedFields.concat(field);
    } else {
      user().assert(data[field],
          'Missing attribute for %s: %s.', data.type, field);
      allowedFields.push(field);
    }
  }
  if (opt_optionalFields) {
    validateAllowedFields(data, allowedFields);
  }
}

/**
 * Throws an exception if data does not contains exactly one field
 * mentioned in the alternativeFields array.
 * @param {!Object} data
 * @param {!Array<string>} alternativeFields
 */
function validateExactlyOne(data, alternativeFields) {
  user().assert(alternativeFields.filter(field => data[field]).length === 1,
      '%s must contain exactly one of attributes: %s.',
      data.type,
      alternativeFields.join(', '));
}

/**
 * Throws a non-interrupting exception if data contains a field not supported
 * by this embed type.
 * @param {!Object} data
 * @param {!Array<string>} allowedFields
 */
function validateAllowedFields(data, allowedFields) {
  const defaultAvailableFields = {
    width: true,
    height: true,
    type: true,
    referrer: true,
    canonicalUrl: true,
    pageViewId: true,
    location: true,
    mode: true,
    consentNotificationId: true,
    ampSlotIndex: true,
    adHolderText: true,
    loadingStrategy: true,
  };

  for (const field in data) {
    if (!data.hasOwnProperty(field) || field in defaultAvailableFields) {
      continue;
    }
    if (allowedFields.indexOf(field) < 0) {
      // Throw in a timeout, because we do not want to interrupt execution,
      // because that would make each removal an instant backward incompatible
      // change.
      rethrowAsync(new Error(`Unknown attribute for ${data.type}: ${field}.`));
    }
  }
}

/** @private {!Object<string, boolean>} */
let experimentToggles = {};

/**
 * Returns true if an experiment is enabled.
 * @param {string} experimentId
 * @return {boolean}
 */
export function isExperimentOn(experimentId) {
  return !!experimentToggles[experimentId];
}

/**
 * Set experiment toggles.
 * @param {!Object<string, boolean>} toggles
 */
export function setExperimentToggles(toggles) {
  experimentToggles = toggles;
}
