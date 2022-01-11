import {format, isBefore, subDays} from 'date-fns';

import {createContext, useCallback, useContext} from 'src/preact';

// eslint-disable-next-line local/no-export-side-effect
export const AttributesContext = createContext();

// Example: Wednesday, December 1, 2021
const DATE_FORMAT = 'cccc, LLLL d, yyyy';

/**
 *
 * @return {{ isAvailable: boolean, label: string }} label
 */
export function useAttributes() {
  const context = useContext(AttributesContext);
  if (!context) {
    throw new Error('Must be wrapped in LabelContext.Provider component');
  }
  const {allowBlockedEndDate, blockedDates, highlightedDates, min} = context;

  const getFormattedDate = useCallback((date) => {
    return format(date, DATE_FORMAT);
  }, []);

  const isBeforeMin = useCallback(
    (date) => {
      return isBefore(date, min);
    },
    [min]
  );

  const isDisabled = useCallback(
    (date) => {
      if (isBeforeMin(date)) {
        return true;
      }
      const allowBlocked =
        allowBlockedEndDate && !blockedDates.contains(subDays(date, 1));
      return blockedDates.contains(date) && !allowBlocked;
    },
    [blockedDates, allowBlockedEndDate, isBeforeMin]
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

  return {getLabel, isDisabled, isHighlighted};
}
