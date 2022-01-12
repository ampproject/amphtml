import {DayPicker} from 'react-day-picker';

import * as Preact from '#preact';
import {useCallback} from '#preact';

import {getFormattedDate} from './date-helpers';
import {DayButton} from './day-button';
import {useAttributes} from './use-attributes';

// TODO: Prop types
/**
 * @param {!object} props
 * @return {PreactDef.Renderable}
 */
export function BaseDatePicker({
  initialVisibleMonth,
  monthFormat,
  weekDayFormat,
  ...rest
}) {
  const {isDisabled} = useAttributes();

  const formatMonth = useCallback(
    (date) => {
      return getFormattedDate(date, monthFormat);
    },
    [monthFormat]
  );

  const formatWeekday = useCallback(
    (date) => {
      return getFormattedDate(date, weekDayFormat);
    },
    [weekDayFormat]
  );

  return (
    <DayPicker
      aria-label="Calendar"
      defaultMonth={initialVisibleMonth}
      components={{Day: DayButton}}
      disabled={[isDisabled]}
      formatters={{
        formatCaption: formatMonth,
        formatWeekdayName: formatWeekday,
      }}
      {...rest}
    />
  );
}
