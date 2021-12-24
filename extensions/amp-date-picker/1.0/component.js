import * as Preact from '#preact';
import {useMemo} from '#preact';

import './amp-date-picker.css';
import {
  DEFAULT_END_INPUT_SELECTOR,
  DEFAULT_INPUT_SELECTOR,
  DEFAULT_ON_ERROR,
  DEFAULT_START_INPUT_SELECTOR,
  DatePickerMode,
  DatePickerType,
  ISO_8601,
} from './constants';
import {DateRangePicker} from './date-range-picker';
import {DatesList} from './dates-list';
import {SingleDatePicker} from './single-date-picker';
import {AttributesContext} from './use-attributes';

/**
 * @param {!BentoDatePicker.Props} props
 * @return {PreactDef.Renderable}
 */
export function BentoDatePicker({
  children,
  type = DatePickerType.SINGLE,
  mode = DatePickerMode.STATIC,
  inputSelector = DEFAULT_INPUT_SELECTOR,
  startInputSelector = DEFAULT_START_INPUT_SELECTOR,
  endInputSelector = DEFAULT_END_INPUT_SELECTOR,
  format = ISO_8601,
  id,
  onError = DEFAULT_ON_ERROR,
  initialVisibleMonth,
  blocked,
  allowBlockedRanges,
  allowBlockedEndDate,
  highlighted,
}) {
  const blockedDates = useMemo(() => {
    return new DatesList(blocked);
  }, [blocked]);

  const highlightedDates = useMemo(() => {
    return new DatesList(highlighted);
  }, [highlighted]);

  return (
    <AttributesContext.Provider
      value={{blockedDates, highlightedDates, allowBlockedEndDate}}
    >
      {type === DatePickerType.SINGLE && (
        <SingleDatePicker
          blockedDates={blockedDates}
          format={format}
          id={id}
          initialVisibleMonth={initialVisibleMonth}
          inputSelector={inputSelector}
          mode={mode}
          onError={onError}
        >
          {children}
        </SingleDatePicker>
      )}
      {type === DatePickerType.RANGE && (
        <DateRangePicker
          blockedDates={blockedDates}
          format={format}
          id={id}
          initialVisibleMonth={initialVisibleMonth}
          startInputSelector={startInputSelector}
          endInputSelector={endInputSelector}
          mode={mode}
          onError={onError}
          allowBlockedEndDate={allowBlockedEndDate}
          allowBlockedRanges={allowBlockedRanges}
        >
          {children}
        </DateRangePicker>
      )}
    </AttributesContext.Provider>
  );
}
