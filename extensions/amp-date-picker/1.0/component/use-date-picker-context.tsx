import {addDays, isAfter, isBefore, subDays} from 'date-fns';

import * as Preact from '#preact';
import {createContext, useCallback, useContext, useMemo} from '#preact';

import {DatesList} from './dates-list';

import {
  DEFAULT_END_INPUT_SELECTOR,
  DEFAULT_INPUT_SELECTOR,
  DEFAULT_LOCALE,
  DEFAULT_MONTH_FORMAT,
  DEFAULT_ON_ERROR,
  DEFAULT_START_INPUT_SELECTOR,
  DEFAULT_WEEK_DAY_FORMAT,
  ISO_8601,
} from '../constants';
import {getCurrentDate, getFormattedDate} from '../date-helpers';
import {parseDate as _parseDate} from '../parsers';
import {BentoDatePickerProps, DatePickerMode} from '../types';

interface DatePickerHelperFunctions {
  getLabel(date: Date): string;
  isDisabled(date: Date): boolean;
  isHighlighted(date: Date): boolean;
  getDisabledAfter(startDate?: Date): Date | null;
  getDisabledBefore(startDate?: Date): Date | null;
  blockedDates: DatesList;
  highlightedDates: DatesList;
  parseDate(value: string): Date | null;
  formatDate(date: Date): string;
  formatMonth(date: Date): string;
  formatWeekday(date: Date): string;
}

// Since we are providing defualts, this adds type safety for the single and range components
interface RequiredProps {
  today: Date;
  mode: DatePickerMode;
  inputSelector: string;
  startInputSelector: string;
  endInputSelector: string;
}

type DatePickerContextType = BentoDatePickerProps &
  DatePickerHelperFunctions &
  RequiredProps;

const DatePickerContext = createContext<DatePickerContextType | null>(null);

/** Example: Wednesday, December 1, 2021 */
const DATE_FORMAT = 'cccc, LLLL d, yyyy';

export function DatePickerProvider({
  allowBlockedEndDate,
  allowBlockedRanges,
  blocked,
  children,
  endInputSelector = DEFAULT_END_INPUT_SELECTOR,
  format = ISO_8601,
  highlighted,
  inputSelector = DEFAULT_INPUT_SELECTOR,
  locale = DEFAULT_LOCALE,
  max,
  maximumNights = 0,
  min: optionalMin,
  minimumNights = 1,
  mode = 'static',
  monthFormat = DEFAULT_MONTH_FORMAT,
  numberOfMonths = 1,
  onError = DEFAULT_ON_ERROR,
  startInputSelector = DEFAULT_START_INPUT_SELECTOR,
  today = getCurrentDate(),
  type = 'single',
  weekDayFormat = DEFAULT_WEEK_DAY_FORMAT,
  ...rest
}: BentoDatePickerProps) {
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
        return null;
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
        return null;
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
      // TODO: Implement other labels from defaultPhrases.js
      if (isDisabled(date)) {
        return `Not available. ${formattedDate}`;
      }

      return formattedDate;
    },
    [isDisabled, locale]
  );

  return (
    <DatePickerContext.Provider
      value={{
        allowBlockedEndDate,
        allowBlockedRanges,
        endInputSelector,
        inputSelector,
        isDisabled,
        isHighlighted,
        getLabel,
        getDisabledAfter,
        getDisabledBefore,
        blockedDates,
        highlightedDates,
        parseDate,
        formatDate,
        formatMonth,
        formatWeekday,
        numberOfMonths,
        mode,
        onError,
        startInputSelector,
        today,
        type,
        ...rest,
      }}
    >
      {children}
    </DatePickerContext.Provider>
  );
}

/** Provides access to props and shared helpers */
export function useDatePickerContext() {
  const context = useContext(DatePickerContext);
  if (!context) {
    throw new Error('Must be wrapped in DayPickerContext.Provider component');
  }
  return context;
}
