import {addDays, format, isAfter, isBefore, subDays} from 'date-fns';

import {createContext, useCallback, useContext} from '#preact';

// eslint-disable-next-line local/no-export-side-effect
export const AttributesContext = createContext();

// Example: Wednesday, December 1, 2021
const DATE_FORMAT = 'cccc, LLLL d, yyyy';

/**
 *
 * @return {BentoDatePickerDef.AttributesContextFunctions} values
 */
export function useAttributes() {
  /** @const {?BentoDatePickerDef.AttributesContext} context */
  const context = useContext(AttributesContext);
  if (!context) {
    throw new Error('Must be wrapped in LabelContext.Provider component');
  }
  const {
    allowBlockedEndDate,
    blockedDates,
    highlightedDates,
    max,
    maximumNights,
    min,
  } = context;

  const getFormattedDate = useCallback((date) => {
    return format(date, DATE_FORMAT);
  }, []);

  const isOutsideRange = useCallback(
    (date) => {
      return isBefore(date, min) || isAfter(date, max);
    },
    [min, max]
  );

  // const isAfterFirstDisabledDate = useCallback(
  //   (date) => {
  //     return firstDisabledDate && isAfter(date, firstDisabledDate);
  //   },
  //   [firstDisabledDate]
  // );

  // This disable days based on the maximumNights prop and
  // the selected start date
  // https://react-day-picker-next.netlify.app/api/types/DateAfter
  const getDisabledAfter = useCallback(
    (startDate) => {
      if (!maximumNights || !startDate) {
        return;
      }
      const firstDisabledDate = addDays(startDate, maximumNights);
      return firstDisabledDate;
    },
    [maximumNights]
  );

  // https://react-day-picker-next.netlify.app/api/types/matcher
  const isDisabled = useCallback(
    (date) => {
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
    (date) => {
      return highlightedDates.contains(date);
    },
    [highlightedDates]
  );

  const getLabel = useCallback(
    (date) => {
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
  };
}
