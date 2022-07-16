import {isString} from './string';

/** @fileoverview helpers for dealing with dates and times. */

/**
 * Absolute time in milliseconds.
 * @typedef {number} TimestampDef
 */

/**
 * Parses the date using the `Date.parse()` rules. Additionally supports the
 * keyword "now" that indicates the "current date/time". Returns either a
 * valid epoch value or null.
 *
 * @param {?string|undefined} s
 * @return {?TimestampDef}
 */
export function parseDate(s) {
  if (!s) {
    return null;
  }
  if (s.toLowerCase() === 'now') {
    return Date.now();
  }
  const parsed = Date.parse(s);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Converts various date formats into a timestamp in ms.
 * @param {Date|number|string} value
 * @return {?TimestampDef}
 */
export function getDate(value) {
  if (!value) {
    return null;
  }
  if (typeof value == 'number') {
    return value;
  }
  if (isString(value)) {
    return parseDate(/** @type {string} */ (value));
  }
  value = /** @type {Date} */ (value);
  return value.getTime();
}
