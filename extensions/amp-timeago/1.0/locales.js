/**
 * This file registers all necessary locales supported by amp-timeago.
 */

import * as timeago from 'timeago.js/dist/timeago.full.min';
import cs from 'timeago.js/esm/lang/cs';
import da from 'timeago.js/esm/lang/da';
import ka from 'timeago.js/esm/lang/ka';
import oc from 'timeago.js/esm/lang/oc';

const {format, register} = timeago.default || timeago;
export {format};

/**
 * timeago.full.min.js only contains the following 41 locales:
 * ar, be, bg, bn_IN, ca, de, el, en_short, en_US, es, eu, fa, fi, fr, gl, he,
 * hi_IN, hu, id_ID, it, ja, ko, ml, my, nb_NO, nl, nn_NO, pl, pt_BR, ro, ru,
 * sq, sr, sv, ta, th, tr, uk, vi, zh_CN, zh_TW
 *
 * Register the rest to create full support for the 46 languages
 * provided by the timeago.js library.
 *
 * TODO(wg-components): These can be removed once all the languages are
 * exported in timeago.js. See https://github.com/hustcc/timeago.js/issues/238.
 */
register('cs', cs);
register('da', da);
register('ka', ka);
register('oc', oc);

/**
 * timeago.full.min.js registers some locales in a different format than what
 * is currently supported by amp-timeago. For backwards compatibility, the
 * following additional locale formats are converted to their registered type.
 * @param {string} locale
 * @return {string}
 */
export function getLocale(locale) {
  locale = locale.toLowerCase();
  if (nonStandardReplacements[locale]) {
    return nonStandardReplacements[locale];
  }
  if (
    locale.length === 4 /* without '-|_' */ ||
    locale.length === 5 /* with '-|_' */
  ) {
    return `${locale.slice(0, 2)}_${locale.slice(-2).toUpperCase()}`;
  }
  return locale;
}

const nonStandardReplacements = {
  'en': 'en_US',
  'enshort': 'en_short',
  'en-short': 'en_short',
  'inbg': 'bn_IN',
  'inid': 'id_ID',
  'inhi': 'hi_IN',
};
