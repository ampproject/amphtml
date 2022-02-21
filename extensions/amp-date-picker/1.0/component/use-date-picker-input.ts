import {addDays} from 'date-fns';

import {useCallback, useRef, useState} from '#preact';

import {getCurrentDate, getFormattedDate} from '../date-helpers';

interface DatePickerInputProps {
  formatDate?: (date: Date) => string;
  today?: Date;
}

/**
 * Baseline functions for a date input field
 */
export function useDatePickerInput({
  formatDate = getFormattedDate,
  today = getCurrentDate(),
}: DatePickerInputProps) {
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
      const todayWithOffset = addDays(today, offset);
      handleSetDate(todayWithOffset);
    },
    [handleSetDate, today]
  );

  return {date, setDate, ref, handleSetDate, clear, setToToday};
}
