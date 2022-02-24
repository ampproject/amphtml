import {
  DayPicker,
  DayPickerProps,
  SelectRangeEventHandler,
  SelectSingleEventHandler,
} from 'react-day-picker';

import * as Preact from '#preact';

import {DayButton} from './day-button';
import {useDatePickerContext} from './use-date-picker-context';

interface BaseDatePickerProps extends DayPickerProps {
  onSelect: SelectSingleEventHandler | SelectRangeEventHandler;
}

export function BaseDatePicker(props: BaseDatePickerProps) {
  const {
    formatMonth,
    formatWeekday,
    isDisabled,
    locale,
    numberOfMonths,
    today,
  } = useDatePickerContext();

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
      numberOfMonths={numberOfMonths}
      today={today}
      {...props}
    />
  );
}
