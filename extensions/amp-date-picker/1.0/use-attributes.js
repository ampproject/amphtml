import {format, subDays} from 'date-fns';

import {createContext, useContext, useMemo} from 'src/preact';

// eslint-disable-next-line local/no-export-side-effect
export const AttributesContext = createContext();

// Example: Wednesday, December 1, 2021
const DATE_FORMAT = 'cccc, LLLL d, yyyy';

/**
 *
 * @param {Date} date
 * @return {{ isAvailable: boolean, label: string }} label
 */
export function useAttributes(date) {
  const context = useContext(AttributesContext);
  if (!context) {
    throw new Error('Must be wrapped in LabelContext.Provider component');
  }
  const {allowBlockedEndDate, blockedDates, highlightedDates} = context;

  const formattedDate = useMemo(() => {
    return format(date, DATE_FORMAT);
  }, [date]);

  const allowBlocked = useMemo(() => {
    return allowBlockedEndDate && !blockedDates.contains(subDays(date, 1));
  }, [date, allowBlockedEndDate, blockedDates]);

  const isDisabled = useMemo(() => {
    return blockedDates.contains(date) && !allowBlocked;
  }, [date, blockedDates, allowBlocked]);

  const isHighlighted = useMemo(() => {
    return highlightedDates.contains(date);
  }, [date, highlightedDates]);

  const label = useMemo(() => {
    if (isDisabled) {
      return `Not available. ${formattedDate}`;
    }

    return formattedDate;
  }, [isDisabled, formattedDate]);

  return {label, isDisabled, isHighlighted};
}
