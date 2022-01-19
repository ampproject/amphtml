import * as Preact from '#preact';
import {useMemo} from '#preact';

import './amp-date-picker.css';
import {
  DEFAULT_END_INPUT_SELECTOR,
  DEFAULT_INPUT_SELECTOR,
  DEFAULT_MONTH_FORMAT,
  DEFAULT_ON_ERROR,
  DEFAULT_START_INPUT_SELECTOR,
  DEFAULT_WEEK_DAY_FORMAT,
  DatePickerMode,
  DatePickerType,
  ISO_8601,
} from './constants';
import {getCurrentDate} from './date-helpers';
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
  min = getCurrentDate(),
  max,
  monthFormat = DEFAULT_MONTH_FORMAT,
  weekDayFormat = DEFAULT_WEEK_DAY_FORMAT,
}) {
  const blockedDates = useMemo(() => {
    return new DatesList(blocked);
  }, [blocked]);

  const highlightedDates = useMemo(() => {
    return new DatesList(highlighted);
  }, [highlighted]);

  const datePickerProps = useMemo(() => {
    return {
      blockedDates,
      children,
      format,
      monthFormat,
      id,
      initialVisibleMonth,
      mode,
      onError,
      weekDayFormat,
      inputSelector,
      startInputSelector,
      endInputSelector,
      allowBlockedEndDate,
      allowBlockedRanges,
    };
  }, [
    blockedDates,
    format,
    id,
    initialVisibleMonth,
    mode,
    onError,
    allowBlockedEndDate,
    allowBlockedRanges,
    startInputSelector,
    endInputSelector,
    inputSelector,
    children,
    monthFormat,
    weekDayFormat,
  ]);

  const DatePicker = useMemo(() => {
    switch (type) {
      case DatePickerType.SINGLE: {
        return SingleDatePicker;
      }
      case DatePickerType.RANGE: {
        return DateRangePicker;
      }
      default: {
        onError('Invalid date picker type');
      }
    }
  }, [type, onError]);

  return (
    <AttributesContext.Provider
      value={{blockedDates, highlightedDates, allowBlockedEndDate, min, max}}
    >
      <DatePicker {...datePickerProps} />
    </AttributesContext.Provider>
  );
}
