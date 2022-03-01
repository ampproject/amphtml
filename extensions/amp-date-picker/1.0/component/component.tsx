import * as Preact from '#preact';
import {forwardRef} from '#preact/compat';
import {FunctionalComponent, Ref} from '#preact/types';

import {DateRangePicker} from './date-range-picker';
import {SingleDatePicker} from './single-date-picker';
import {DatePickerContext} from './use-date-picker-context';

import {
  DEFAULT_END_INPUT_SELECTOR,
  DEFAULT_INPUT_SELECTOR,
  DEFAULT_LOCALE,
  DEFAULT_MONTH_FORMAT,
  DEFAULT_ON_ERROR,
  DEFAULT_START_INPUT_SELECTOR,
  DEFAULT_WEEK_DAY_FORMAT,
  ISO_8601,
} from '../constants';
import {getCurrentDate} from '../date-helpers';
import {
  BentoDatePickerProps,
  DateRangePickerAPI,
  SingleDatePickerAPI,
} from '../types';

const datePickerForType: {
  [key: string]: FunctionalComponent<BentoDatePickerProps>;
} = {
  single: SingleDatePicker,
  range: DateRangePicker,
};

function BentoDatePickerWithRef(
  {
    endInputSelector = DEFAULT_END_INPUT_SELECTOR,
    format = ISO_8601,
    inputSelector = DEFAULT_INPUT_SELECTOR,
    locale = DEFAULT_LOCALE,
    mode = 'static',
    monthFormat = DEFAULT_MONTH_FORMAT,
    onError = DEFAULT_ON_ERROR,
    startInputSelector = DEFAULT_START_INPUT_SELECTOR,
    today = getCurrentDate(),
    type = 'single',
    weekDayFormat = DEFAULT_WEEK_DAY_FORMAT,
    maximumNights = 0,
    minimumNights = 1,
    numberOfMonths = 1,
    ...rest
  }: BentoDatePickerProps,
  ref: Ref<SingleDatePickerAPI | DateRangePickerAPI>
) {
  const propsWithDefaults = {
    endInputSelector,
    format,
    inputSelector,
    locale,
    mode,
    monthFormat,
    onError,
    startInputSelector,
    today,
    type,
    weekDayFormat,
    maximumNights,
    minimumNights,
    numberOfMonths,
    ...rest,
  };

  const DatePicker = datePickerForType[type];

  if (!DatePicker) {
    onError('Invalid date picker type');
    return null;
  }

  return (
    <DatePickerContext.Provider value={propsWithDefaults}>
      <DatePicker ref={ref} {...propsWithDefaults} />
    </DatePickerContext.Provider>
  );
}

const BentoDatePicker = forwardRef(BentoDatePickerWithRef);
BentoDatePicker.displayName = 'DatePicker';
export {BentoDatePicker};
