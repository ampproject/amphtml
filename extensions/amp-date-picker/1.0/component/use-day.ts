import {addDays, format, isAfter, isBefore, subDays} from 'date-fns';

import {createContext, useCallback, useContext, useMemo} from '#preact';

import {DatesList} from './dates-list';

import {BentoDatePickerProps} from '../types';

type DayContextValue = Pick<
  BentoDatePickerProps,
  | 'allowBlockedEndDate'
  | 'blocked'
  | 'min'
  | 'max'
  | 'maximumNights'
  | 'minimumNights'
  | 'highlighted'
  | 'today'
>;

const DayContext = createContext<DayContextValue | null>(null);
export {DayContext};

// Example: Wednesday, December 1, 2021
const DATE_FORMAT = 'cccc, LLLL d, yyyy';

export function useDay() {
  const context = useContext(DayContext);
  if (!context) {
    throw new Error('Must be wrapped in DayContext.Provider component');
  }
  const {
    allowBlockedEndDate,
    blocked,
    highlighted,
    max,
    maximumNights,
    min: optionalMin,
    minimumNights,
    today,
  } = context;

  const min = optionalMin || today;

  const blockedDates = useMemo(() => {
    return new DatesList(blocked);
  }, [blocked]);

  const highlightedDates = useMemo(() => {
    return new DatesList(highlighted);
  }, [highlighted]);

  const getFormattedDate = useCallback((date: Date) => {
    return format(date, DATE_FORMAT);
  }, []);

  const isOutsideRange = useCallback(
    (date: Date) => {
      return isBefore(date, min) || (max && isAfter(date, max));
    },
    [min, max]
  );

  // This disable days based on the maximumNights prop and
  // the selected start date
  // https://react-day-picker-next.netlify.app/api/types/DateAfter
  const getDisabledAfter = useCallback(
    (startDate?: Date) => {
      if (!maximumNights || !startDate) {
        return;
      }
      return addDays(startDate, maximumNights);
    },
    [maximumNights]
  );

  // This disable days based on the maximumNights prop and
  // the selected start date
  // https://react-day-picker-next.netlify.app/api/types/DateAfter
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
      const formattedDate = getFormattedDate(date);
      if (isDisabled(date)) {
        return `Not available. ${formattedDate}`;
      }

      return formattedDate;
    },
    [isDisabled, getFormattedDate]
  );

  return {
    getLabel,
    isDisabled,
    isHighlighted,
    getDisabledAfter,
    getDisabledBefore,
    blockedDates,
    highlightedDates,
  };
}
