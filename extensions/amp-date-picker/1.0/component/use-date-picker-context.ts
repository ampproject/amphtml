import {addDays, isAfter, isBefore, subDays} from 'date-fns';

import {createContext, useCallback, useContext, useMemo} from '#preact';

import {DatesList} from './dates-list';

import {getFormattedDate} from '../date-helpers';
import {parseDate as _parseDate} from '../parsers';
import {BentoDatePickerProps} from '../types';

const DatePickerContext = createContext<BentoDatePickerProps | null>(null);
export {DatePickerContext};

/** Example: Wednesday, December 1, 2021 */
const DATE_FORMAT = 'cccc, LLLL d, yyyy';

/** Provides access to props and shared helpers */
export function useDatePickerContext() {
  const context = useContext(DatePickerContext);
  if (!context) {
    throw new Error('Must be wrapped in DayPickerContext.Provider component');
  }
  const {
    allowBlockedEndDate,
    blocked,
    format,
    highlighted,
    locale,
    max,
    maximumNights,
    min: optionalMin,
    minimumNights,
    monthFormat,
    today,
    weekDayFormat,
  } = context;

  const min = optionalMin || today;

  const formatDate = useCallback(
    (date: Date) => getFormattedDate(date, format, locale),
    [format, locale]
  );

  const parseDate = useCallback(
    (value: string) => _parseDate(value, format, locale),
    [format, locale]
  );

  const formatMonth = useCallback(
    (date: Date) => {
      return getFormattedDate(date, monthFormat, locale);
    },
    [monthFormat, locale]
  );

  const formatWeekday = useCallback(
    (date: Date) => {
      return getFormattedDate(date, weekDayFormat, locale);
    },
    [weekDayFormat, locale]
  );

  const blockedDates = useMemo(() => {
    return new DatesList(blocked);
  }, [blocked]);

  const highlightedDates = useMemo(() => {
    return new DatesList(highlighted);
  }, [highlighted]);

  const isOutsideRange = useCallback(
    (date: Date) => {
      return isBefore(date, min) || (max && isAfter(date, max));
    },
    [min, max]
  );

  /**
   * Disables days based on the maximumNights prop and the
   * selected start date
   * https://react-day-picker-next.netlify.app/api/types/DateAfter
   */
  const getDisabledAfter = useCallback(
    (startDate?: Date) => {
      if (!maximumNights || !startDate) {
        return;
      }
      return addDays(startDate, maximumNights);
    },
    [maximumNights]
  );

  /**
   * Disables days based on the maximumNights prop and the
   * selected start date
   * https://react-day-picker-next.netlify.app/api/types/DateAfter
   */
  const getDisabledBefore = useCallback(
    (startDate?: Date) => {
      if (!startDate) {
        return;
      }
      return addDays(startDate, minimumNights);
    },
    [minimumNights]
  );

  // https://react-day-picker-next.netlify.app/api/types/matcher
  const isDisabled = useCallback(
    (date: Date) => {
      if (isOutsideRange(date)) {
        return true;
      }

      const allowBlocked =
        allowBlockedEndDate && !blockedDates.contains(subDays(date, 1));
      return blockedDates.contains(date) && !allowBlocked;
    },
    [blockedDates, allowBlockedEndDate, isOutsideRange]
  );

  const isHighlighted = useCallback(
    (date: Date) => {
      return highlightedDates.contains(date);
    },
    [highlightedDates]
  );

  const getLabel = useCallback(
    (date: Date) => {
      const formattedDate = getFormattedDate(date, DATE_FORMAT, locale);
      if (isDisabled(date)) {
        return `Not available. ${formattedDate}`;
      }

      return formattedDate;
    },
    [isDisabled, locale]
  );

  return {
    getLabel,
    isDisabled,
    isHighlighted,
    getDisabledAfter,
    getDisabledBefore,
    blockedDates,
    highlightedDates,
    parseDate,
    formatDate,
    formatMonth,
    formatWeekday,
    ...context,
  };
}
