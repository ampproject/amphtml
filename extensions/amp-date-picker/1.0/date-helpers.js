import {format, isValid, parse} from 'date-fns';

import {DEFAULT_FORMAT} from '../0.1/constants';
/**
 * Forgivingly parse an ISO8601 input string into a date object,
 * preferring the date picker's configured format.
 * @param {string} value
 * @param {string} dateFormat
 * @return {?Date} date
 */
export function parseDate(value, dateFormat) {
  if (!value) {
    return null;
  }
  const date = parse(value, dateFormat, new Date());
  if (isValid(date)) {
    return date;
  }

  return parse(value);
}

/**
 * Formats a date in the page's locale and the element's configured format.
 * @param {?Date} date
 * @param {string} dateFormat
 * @return {string}
 */
export function getFormattedDate(date, dateFormat = DEFAULT_FORMAT) {
  if (!date) {
    return '';
  }
  // const isUnixTimestamp = format.match(/[Xx]/);
  // const _locale = isUnixTimestamp ? DEFAULT_LOCALE : locale;
  return format(date, dateFormat);
}

/**
 * Returns today's date as a Date object
 * @return {Date}
 */
export function getCurrentDate() {
  return new Date();
}
