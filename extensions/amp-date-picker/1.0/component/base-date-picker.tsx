import {
  DayPicker,
  DayPickerRangeProps,
  DayPickerSingleProps,
} from 'react-day-picker';

import * as Preact from '#preact';

import {DayButton} from './day-button';
import {useDatePickerContext} from './use-date-picker-context';

type BaseDatePickerProps = DayPickerSingleProps | DayPickerRangeProps;

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
