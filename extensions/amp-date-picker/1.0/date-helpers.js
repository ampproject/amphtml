import {format, isValid, parse, startOfToday} from 'date-fns';
import {
  af,
  ar,
  arDZ,
  arMA,
  arSA,
  arTN,
  az,
  be,
  bg,
  bn,
  bs,
  ca,
  cs,
  cy,
  da,
  de,
  deAT,
  el,
  enAU,
  enCA,
  enGB,
  enIE,
  enNZ,
  enUS,
  eo,
  es,
  et,
  eu,
  fi,
  fr,
  frCA,
  frCH,
  gd,
  gl,
  gu,
  he,
  hi,
  hr,
  hu,
  hy,
  id,
  is,
  it,
  ja,
  ka,
  kk,
  km,
  kn,
  ko,
  lb,
  lt,
  lv,
  mk,
  ms,
  mt,
  nb,
  nl,
  nlBE,
  nn,
  pl,
  pt,
  ptBR,
  ro,
  ru,
  sk,
  sl,
  sq,
  sr,
  sv,
  ta,
  te,
  th,
  tr,
  uk,
  uz,
  vi,
  zhCN,
  zhHK,
  zhTW,
} from 'date-fns/locale';

import {DEFAULT_LOCALE, ISO_8601} from './constants';

export const localeMap = {
  'en': enUS,
  'af': af,
  'ar': ar,
  'ar-dz': arDZ,
  'ar-ma': arMA,
  'ar-sa': arSA,
  'ar-tn': arTN,
  'az': az,
  'be': be,
  'bg': bg,
  'bn': bn,
  'bs': bs,
  'ca': ca,
  'cs': cs,
  'cy': cy,
  'da': da,
  'de-at': deAT,
  'de': de,
  'el': el,
  'en-au': enAU,
  'en-ca': enCA,
  'en-gb': enGB,
  'en-ie': enIE,
  'en-nz': enNZ,
  'eo': eo,
  'es': es,
  'et': et,
  'eu': eu,
  'fi': fi,
  'fr-ca': frCA,
  'fr-ch': frCH,
  'fr': fr,
  'gd': gd,
  'gl': gl,
  'gu': gu,
  'he': he,
  'hi': hi,
  'hr': hr,
  'hu': hu,
  'hy-am': hy,
  'id': id,
  'is': is,
  'it': it,
  'ja': ja,
  'ka': ka,
  'kk': kk,
  'km': km,
  'kn': kn,
  'ko': ko,
  'lb': lb,
  'lt': lt,
  'lv': lv,
  'mk': mk,
  'ms': ms,
  'mt': mt,
  'nb': nb,
  'nl-be': nlBE,
  'nl': nl,
  'nn': nn,
  'pl': pl,
  'pt-br': ptBR,
  'pt': pt,
  'ro': ro,
  'ru': ru,
  'sk': sk,
  'sl': sl,
  'sq': sq,
  'sr': sr,
  'sv': sv,
  'ta': ta,
  'te': te,
  'th': th,
  'tr': tr,
  'uk': uk,
  'uz': uz,
  'vi': vi,
  'zh-cn': zhCN,
  'zh-hk': zhHK,
  'zh-tw': zhTW,
};

/**
 *
 * Convert a moment locale string to a date-fns locale object
 * If the string does not exist in the map, falls back to default locale
 * @param {string} localeString
 * @return {Locale} locale
 */
export function getLocale(localeString) {
  return localeMap[localeString] || localeMap[DEFAULT_LOCALE];
}

/**
 * Forgivingly parse an ISO8601 input string into a date object,
 * preferring the date picker's configured format.
 * @param {string} value
 * @param {string=} dateFormat
 * @param {string=} locale
 * @return {?Date} date
 */
export function parseDate(value, dateFormat, locale = DEFAULT_LOCALE) {
  if (!value) {
    return null;
  }
  const _locale = getLocale(locale);
  const date = parse(value, dateFormat, new Date(), {locale: _locale});
  if (isValid(date)) {
    return date;
  }

  return parse(value);
}

/**
 * Formats a date in the page's locale and the element's configured format.
 * @param {?Date} date
 * @param {string=} dateFormat
 * @param {string=} locale
 * @return {string}
 */
export function getFormattedDate(
  date,
  dateFormat = ISO_8601,
  locale = DEFAULT_LOCALE
) {
  if (!date) {
    return '';
  }
  const isUnixTimestamp = dateFormat.match(/[Xx]/);
  const _locale = isUnixTimestamp
    ? getLocale(DEFAULT_LOCALE)
    : getLocale(locale);
  return format(date, dateFormat, {locale: _locale});
}

/**
 * Returns today's date as a Date object
 * @return {Date}
 */
export function getCurrentDate() {
  return startOfToday();
}
