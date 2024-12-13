import {
  addDays,
  differenceInDays,
  format,
  isAfter,
  isSameDay,
  startOfToday,
} from 'date-fns';

import {DEFAULT_LOCALE, ISO_8601} from './constants';

/**
 * Formats a date in the page's locale and the element's configured format.
 */
export function getFormattedDate(
  date: Date,
  dateFormat = ISO_8601,
  locale = DEFAULT_LOCALE
) {
  if (!date) {
    return '';
  }
  const isUnixTimestamp = dateFormat.match(/[Xx]/);
  const _locale = isUnixTimestamp ? DEFAULT_LOCALE : locale;
  return format(date, dateFormat, {locale: _locale});
}

/**
 * Returns today's date as a Date object.
 * This is stubbed for testing.
 */
export function getCurrentDate() {
  return startOfToday();
}

/**
 * Iterate over the dates between a start and end date.
 */
export function iterateDateRange(
  startDate: Date,
  endDate: Date,
  cb: (date: Date, i: number) => void
) {
  const normalizedEndDate = endDate || startDate;
  if (
    isSameDay(startDate, normalizedEndDate) ||
    isAfter(startDate, normalizedEndDate)
  ) {
    return;
  }

  const days = differenceInDays(normalizedEndDate, startDate);

  for (let i = 0; i < days; i++) {
    cb(addDays(startDate, i + 1), i);
  }
}
