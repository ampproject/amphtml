import * as Preact from '#preact';
import {forwardRef} from '#preact/compat';
import {FunctionalComponent, Ref} from '#preact/types';

import {DateRangePicker} from './date-range-picker';
import {SingleDatePicker} from './single-date-picker';
import {DatePickerProvider} from './use-date-picker-context';

import {DEFAULT_ON_ERROR} from '../constants';
import {
  BentoDatePickerProps,
  DateRangePickerAPI,
  SingleDatePickerAPI,
} from '../types';

const datePickerForType: {
  [key: string]: FunctionalComponent;
} = {
  single: SingleDatePicker,
  range: DateRangePicker,
};

function BentoDatePickerWithRef(
  props: BentoDatePickerProps,
  ref: Ref<SingleDatePickerAPI | DateRangePickerAPI>
) {
  const {children, onError = DEFAULT_ON_ERROR, type = 'single'} = props;

  const DatePicker = datePickerForType[type];

  if (!DatePicker) {
    onError('Invalid date picker type');
    return null;
  }

  return (
    <DatePickerProvider {...props}>
      <DatePicker ref={ref}>{children}</DatePicker>
    </DatePickerProvider>
  );
}

const BentoDatePicker = forwardRef(BentoDatePickerWithRef);
BentoDatePicker.displayName = 'DatePicker';
export {BentoDatePicker};
