/**
 * This is a fork of the timago.js library developed by hustcc
 * https://github.com/hustcc/timeago.js
 */
const locales = {};
// second, minute, hour, day, week, month, year(365 days)
const SEC_ARRAY = [60, 60, 24, 7, 365 / 7 / 12, 12];
const SEC_ARRAY_LEN = 6;

// format Date / string / timestamp to Date instance.
function toDate(input) {
  if (input instanceof Date) {
    return input;
  };
  if (!isNaN(input)) {
    return new Date(toInt(input));
  }
  if (/^\d+$/.test(input)) {
    return new Date(toInt(input));
  }
  input = (input || '').trim().replace(/\.\d+/, '') // remove milliseconds
    .replace(/-/, '/').replace(/-/, '/')
    .replace(/(\d)T(\d)/, '$1 $2').replace(/Z/, ' UTC') // 2017-2-5T3:57:52Z -> 2017-2-5 3:57:52UTC
    .replace(/([\+\-]\d\d)\:?(\d\d)/, ' $1$2'); // -04:00 -> -0400
  return new Date(input);
}

// change f into int, remove decimal. Just for code compression
function toInt(f) {
  return parseInt(f, 10);
}

// format the diff second to *** time ago, with setting locale
function formatDiff(diff, locale, defaultLocale) {
  // if locale is not exist, use defaultLocale.
  // if defaultLocale is not exist, use build-in `en`.
  // be sure of no error when locale is not exist.
  locale = locales[locale] ? locale : (locales[defaultLocale] ? defaultLocale :
    'en');
  // if (! locales[locale]) locale = defaultLocale;
  let i = 0;
  const agoin = diff < 0 ? 1 : 0; // timein or timeago
  const totalSec = diff = Math.abs(diff);

  for (; diff >= SEC_ARRAY[i] && i < SEC_ARRAY_LEN; i++) {
    diff /= SEC_ARRAY[i];
  }
  diff = toInt(diff);
  i *= 2;

  if (diff > (i === 0 ? 9 : 1)) {
    i += 1;
  }
  return locales[locale](diff, i, totalSec)[agoin].replace('%s', diff);
}

// calculate the diff second between date to be formated an now date.
function diffSec(date, nowDate) {
  nowDate = nowDate ? toDate(nowDate) : new Date();
  return (nowDate - toDate(date)) / 1000;
}

/**
 * timeago: the function to get `timeago` instance.
 * - nowDate: the relative date, default is new Date().
 * - defaultLocale: the default locale, default is en. if your set it, then the `locale` parameter of format is not needed of you.
 *
 * How to use it?
 * var timeagoLib = require('timeago.js');
 * var timeago = timeagoLib(); // all use default.
 * var timeago = timeagoLib('2016-09-10'); // the relative date is 2016-09-10, so the 2016-09-11 will be 1 day ago.
 * var timeago = timeagoLib(null, 'zh_CN'); // set default locale is `zh_CN`.
 * var timeago = timeagoLib('2016-09-10', 'zh_CN'); // the relative date is 2016-09-10, and locale is zh_CN, so the 2016-09-11 will be 1天前.
**/
function Timeago(nowDate, defaultLocale) {
  this.nowDate = nowDate;
  // if do not set the defaultLocale, set it with `en`
  this.defaultLocale = defaultLocale || 'en'; // use default build-in locale
  // for dev test
  // this.nextInterval = nextInterval;
}

/**
 * format: format the date to *** time ago, with setting or default locale
 * - date: the date / string / timestamp to be formated
 * - locale: the formated string's locale name, e.g. en / zh_CN
 *
 * How to use it?
 * var timeago = require('timeago.js')();
 * timeago.format(new Date(), 'pl'); // Date instance
 * timeago.format('2016-09-10', 'fr'); // formated date string
 * timeago.format(1473473400269); // timestamp with ms
**/
Timeago.prototype.format = function(date, locale) {
  return formatDiff(diffSec(date, this.nowDate), locale, this.defaultLocale);
};

/**
 * timeago: the function to get `timeago` instance.
 * - nowDate: the relative date, default is new Date().
 * - defaultLocale: the default locale, default is en. if your set it, then the `locale` parameter of format is not needed of you.
 *
 * How to use it?
 * var timeagoFactory = require('timeago.js');
 * var timeago = timeagoFactory(); // all use default.
 * var timeago = timeagoFactory('2016-09-10'); // the relative date is 2016-09-10, so the 2016-09-11 will be 1 day ago.
 * var timeago = timeagoFactory(null, 'zh_CN'); // set default locale is `zh_CN`.
 * var timeago = timeagoFactory('2016-09-10', 'zh_CN'); // the relative date is 2016-09-10, and locale is zh_CN, so the 2016-09-11 will be 1天前.
 **/
export function timeagoFactory(nowDate, defaultLocale) {
  return new Timeago(nowDate, defaultLocale);
}

/**
 * register: register a new language locale
 * - locale: locale name, e.g. en / zh_CN, notice the standard.
 * - localeFunc: the locale process function
 *
 * How to use it?
 * var timeagoFactory = require('timeago.js');
 *
 * timeagoFactory.register('the locale name', the_locale_func);
 * // or
 * timeagoFactory.register('pl', require('timeago.js/locales/pl'));
 **/
timeagoFactory.register = function(locale, localeFunc) {
  locales[locale] = localeFunc;
};
