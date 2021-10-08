/**
 * @fileoverview Externs for extra properties expected on errors.
 * @externs
 */

/**
 * Array of strings and values used to construct an error message, so that when
 * it's logged to the console the output can be inspected.
 * @type {undefined|Array<*>}
 */
Error.prototype.messageArray;

/**
 * Flag to mark "expected" failure cases (ex. an operation failing due to a
 * known browser setting blocking access to `localStorage`).
 * @type {undefined|boolean}
 */
Error.prototype.expected;
