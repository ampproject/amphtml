/**********************************************************************
 * Extern for moment
 * Based on http://jmmk.github.io/javascript-externs-generator
 * https://github.com/cljsjs/packages/blob/master/moment/resources/cljsjs/common/moment.ext.js
 **********************************************************************/

/** @externs */

/**
 * @constructor
 * @struct
 * @param {string|?moment} input
 * @return {!moment}
 */
function moment(input) {}

/**
 *
 * @param {string} locale
 */
moment.locale = function(locale) {};

/**
 * @return {boolean}
 */
moment.prototype.isValid = function() {};

/**
 * @return {!moment}
 */
moment.prototype.clone = function() {};

/**
 * @param {!moment} other
 * @return {boolean}
 */
moment.prototype.isAfter = function(other) {};

/**
 * @param {!moment} first
 * @param {!moment} second
 * @return {boolean}
 */
moment.prototype.isBetween = function(first, second) {};

/**
 * @param {!moment} other
 * @return {boolean}
 */
moment.prototype.isSameOrAfter = function(other) {};

/**
 * @param {!moment} other
 * @param {string} type
 * @return {number}
 */
moment.prototype.diff = function(other, type) {};

/**
 * @param {string} format
 * @return {string}
 */
moment.prototype.format = function(format) {};

/**
 * @param {string} locale
 */
moment.prototype.locale = function(locale) {};

/**
 * @return {Date}
 */
moment.prototype.toDate = function() {};

/**
 * @param {string} unit
 * @return {!moment}
 */
moment.prototype.startOf = function(unit) {};

/**
 * @param {number} amount
 * @param {string} unit
 * @return {!moment}
 */
moment.prototype.add = function(amount, unit) {};

/**
 * @return {number}
 */
moment.prototype.year = function() {};

/**
 * @struct
 * @constructor
 */
moment.Locale = function() {};

/**
 * @param {string} format
 * @return {string}
 */
moment.Locale.longDateFormat = function (format) {};

/** @return {moment.Locale} */
moment.prototype.localeData = function () {};

/** @return {!moment} */
moment.prototype.duration = function () {};
