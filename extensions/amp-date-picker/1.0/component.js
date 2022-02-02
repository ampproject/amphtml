import * as Preact from '#preact';
import {useMemo} from '#preact';
import {forwardRef} from '#preact/compat';

import './amp-date-picker.css';
import {
  DEFAULT_END_INPUT_SELECTOR,
  DEFAULT_INPUT_SELECTOR,
  DEFAULT_LOCALE,
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
import {AttributesContext} from './use-day-attributes';

/**
 * @param {!BentoDatePickerDef.Props} props
 * @param {{current: ?BentoDatePickerDef.BentoDatePickerApi}} ref
 * @return {PreactDef.Renderable}
 */
function BentoDatePickerWithRef(
  {
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
    locale = DEFAULT_LOCALE,
    maximumNights = 0,
    minimumNights = 1,
    openAfterSelect,
  },
  ref
) {
  /**
   * @return {DatesList} blockedDates
   */
  const blockedDates = useMemo(() => {
    return new DatesList(blocked);
  }, [blocked]);

  /**
   * @return {DatesList} highlightedDates
   */
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
      ref,
      locale,
      maximumNights,
      minimumNights,
      openAfterSelect,
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
    ref,
    locale,
    maximumNights,
    minimumNights,
    openAfterSelect,
  ]);

  /**
   * Date picker component
   * @return {PreactDef.Renderable|void}
   */
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
      value={{
        blockedDates,
        highlightedDates,
        allowBlockedEndDate,
        min,
        max,
        maximumNights,
        minimumNights,
      }}
    >
      <DatePicker {...datePickerProps} />
    </AttributesContext.Provider>
  );
}

const BentoDatePicker = forwardRef(BentoDatePickerWithRef);
BentoDatePicker.displayName = 'DatePicker';
export {BentoDatePicker};
