import objStr from 'obj-str';
import {
  DayPicker,
  DayPickerRangeProps,
  DayPickerSingleProps,
} from 'react-day-picker';

import * as Preact from '#preact';

import {DayButton} from './day-button';
import {useDatePickerContext} from './use-date-picker-context';

import {useStyles} from '../component.jss';

type BaseDatePickerProps = (DayPickerSingleProps | DayPickerRangeProps) & {
  isOpen: boolean;
};

export function BaseDatePicker({isOpen, ...props}: BaseDatePickerProps) {
  const classes = useStyles();
  const {
    formatMonth,
    formatWeekday,
    isDisabled,
    locale,
    numberOfMonths,
    today,
  } = useDatePickerContext();

  return (
    <div
      aria-label="Calendar"
      hidden={!isOpen}
      class={objStr({
        [classes.unmounted]: !isOpen,
        [classes.dayPicker]: true,
      })}
    >
      <DayPicker
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
    </div>
  );
}
