import {Locale, isMatch, isValid, parse} from 'date-fns';
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

// This is a map to convert moment.js locale strings to dateFns locale objects
// It includes most locales, but some more obscure locales were not included in both

export const localeMap: {[key: string]: Locale} = {
  'en-us': enUS,
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
 * Convert a moment locale string to a date-fns locale object.
 * If the string does not exist in the map, falls back to default locale.
 */
export function parseLocale(localeString: string) {
  return localeMap[localeString] || DEFAULT_LOCALE;
}

/**
 * Forgivingly parse an ISO8601 input string into a date object,
 * preferring the date picker's configured format.
 */
export function parseDate(
  value: string,
  dateFormat: string = ISO_8601,
  locale: Locale = DEFAULT_LOCALE
) {
  if (!value) {
    return null;
  }
  const date = parse(value, dateFormat, new Date(), {locale});
  if (isValid(date)) {
    return date;
  }

  return parse(value, ISO_8601, new Date());
}

const DATE_SEPARATOR = ' ';

/**
 * Parses a space separated list of RRULE and ISO-8601 date strings.
 * Parses ISO-8601 date strings as Date objects.
 */
export function parseDateList(list: string) {
  const splitValues = list.split(DATE_SEPARATOR);
  return splitValues.map((value) => {
    if (isMatch(value, ISO_8601)) {
      return parseDate(value, ISO_8601);
    }
    return value;
  });
}

export function parseNumber(n: string) {
  return parseInt(n, 10);
}
