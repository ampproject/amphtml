import {addDays} from 'date-fns';

import {useCallback, useRef, useState} from '#preact';

import {getCurrentDate} from './date-helpers';

/**
 * Baseline functions for a date input field
 */
export function useDatePickerInput(formatDate: (date: Date) => string) {
  const ref = useRef<HTMLInputElement>(null);
  const [date, setDate] = useState<Date>();

  const handleSetDate = useCallback(
    (date: Date) => {
      setDate(date);
      if (ref.current) {
        ref.current.value = formatDate(date);
      }
    },
    [formatDate]
  );

  /**
   * Resets the date and input value
   */
  const clear = useCallback(() => {
    setDate(undefined);
    if (ref.current) {
      ref.current.value = '';
    }
  }, []);

  /**
   * Sets the date to today (with an optional offset property)
   */
  const setToToday = useCallback(
    (offset = 0) => {
      const todayWithOffset = addDays(getCurrentDate(), offset);
      handleSetDate(todayWithOffset);
    },
    [handleSetDate]
  );

  return {date, setDate, ref, handleSetDate, clear, setToToday};
}
