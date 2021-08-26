/**
 * @fileoverview Shared implementations of date formatting and variable
 * providers for Bento and Classic amp-date-display.
 * TODO(alanorozco): Include getVariablesInUTC and getVariablesInLocal.
 */
/**
 * @param {!Date} date
 * @param {string} locale
 * @param {?Object<string, *>} options
 * @return {string}
 * @private
 */
export function getTimeZoneName(date, locale, options) {
  if (!Intl?.DateTimeFormat) {
    return '';
  }
  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone: options.timeZone,
    timeZoneName: options.timeZoneName,
  });
  return (
    formatter.formatToParts(date).find(({type}) => type === 'timeZoneName')
      ?.value || ''
  );
}
