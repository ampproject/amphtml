/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
 * @fileoverview The junk-drawer of externs that haven't yet been sorted well.
 * Shame! Shame! Shame! Avoid adding to this.
 *
 * It's okay for some things to start off here, since moving them doesn't
 * require any other file changes (unlike real code, which requires updating)
 * imports throughout the repo).
 *
 * @externs
 */

/** @interface */
function Logger() {}
/** @type {function(...?)} */
Logger.prototype.warn;
/** @type {function(...?)} */
Logger.prototype.error;
/** @type {function(...?)} */
Logger.prototype.assertString;
/** @type {function():!Logger} */
let user$$module$src$log;
/** @type {function():!Logger} */
let dev$$module$src$log;

/** @type {function():!{test:boolean}} */
let getMode$$module$src$mode;

/** @type {function(!Window):!Window} */
let getTopWindow$$module$src$service;

/** @type {function(string):!JsonObject} */
let parseQueryString$$module$src$url;

/** @type {?} */
window.AMP_CONFIG;
/** @type {boolean|undefined} */
window.AMP_CONFIG.canary;
/** @type {string|undefined} */
window.AMP_CONFIG.type;
