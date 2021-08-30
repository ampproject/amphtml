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
let getTopWindow$$module$src$service_helpers;

/** @type {function(string):!JsonObject} */
let parseQueryString$$module$src$url;

/** @type {?} */
window.AMP_CONFIG;
/** @type {boolean|undefined} */
window.AMP_CONFIG.canary;
/** @type {string|undefined} */
window.AMP_CONFIG.type;
