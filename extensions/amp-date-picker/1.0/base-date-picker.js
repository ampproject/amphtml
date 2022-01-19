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
export function BaseDatePicker({initialVisibleMonth, monthFormat, ...rest}) {
  const {isDisabled} = useAttributes();

  const formatMonth = useCallback(
    (date) => {
      return getFormattedDate(date, monthFormat);
    },
    [monthFormat]
  );
  return (
    <DayPicker
      aria-label="Calendar"
      defaultMonth={initialVisibleMonth}
      components={{Day: DayButton}}
      disabled={[isDisabled]}
      formatters={{formatCaption: formatMonth}}
      {...rest}
    />
  );
}
