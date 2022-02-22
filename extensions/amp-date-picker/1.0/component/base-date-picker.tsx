import {
  DayPicker,
  DayPickerProps,
  SelectRangeEventHandler,
  SelectSingleEventHandler,
} from 'react-day-picker';

import * as Preact from '#preact';
import {useCallback} from '#preact';

import {DayButton} from './day-button';
import {useDay} from './use-day';

import {getFormattedDate} from '../date-helpers';

interface BaseDatePickerProps extends DayPickerProps {
  monthFormat: string;
  weekDayFormat: string;
  onSelect: SelectSingleEventHandler | SelectRangeEventHandler;
}

export function BaseDatePicker({
  locale,
  monthFormat,
  weekDayFormat,
  ...rest
}: BaseDatePickerProps) {
  const {isDisabled} = useDay();

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

  return (
    <DayPicker
      aria-label="Calendar"
      components={{Day: DayButton}}
      disabled={[isDisabled]}
      formatters={{
        formatCaption: formatMonth,
        formatWeekdayName: formatWeekday,
      }}
      locale={locale}
      {...rest}
    />
  );
}
