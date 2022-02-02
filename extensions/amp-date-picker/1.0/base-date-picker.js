import {DayPicker} from 'react-day-picker';

import * as Preact from '#preact';
import {useCallback} from '#preact';

import {getFormattedDate, getLocale} from './date-helpers';
import {DayButton} from './day-button';
import {useDayAttributes} from './use-day-attributes';

// TODO: Prop types
/**
 * @param {!object} props
 * @return {PreactDef.Renderable}
 */
export function BaseDatePicker({locale, monthFormat, weekDayFormat, ...rest}) {
  const {isDisabled} = useDayAttributes();

  const formatMonth = useCallback(
    (date) => {
      return getFormattedDate(date, monthFormat, locale);
    },
    [monthFormat, locale]
  );

  const formatWeekday = useCallback(
    (date) => {
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
      locale={getLocale(locale)}
      {...rest}
    />
  );
}
