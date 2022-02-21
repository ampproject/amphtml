import {FunctionalComponent, Ref} from 'preact';

import * as Preact from '#preact';
import {useMemo} from '#preact';
import {forwardRef} from '#preact/compat';

import {DateRangePicker} from './date-range-picker';
import {SingleDatePicker} from './single-date-picker';
import {DayContext} from './use-day';

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
import {BentoDatePickerProps} from '../types';

type PropertiesWithDefaults =
  | 'endInputSelector'
  | 'format'
  | 'initialVisibleMonth'
  | 'inputSelector'
  | 'locale'
  | 'maximumNights'
  | 'minimumNights'
  | 'mode'
  | 'monthFormat'
  | 'numberOfMonths'
  | 'onError'
  | 'startInputSelector'
  | 'today'
  | 'type'
  | 'weekDayFormat';

const DEFAULT_PROPS: Pick<BentoDatePickerProps, PropertiesWithDefaults> = {
  endInputSelector: DEFAULT_END_INPUT_SELECTOR,
  format: ISO_8601,
  initialVisibleMonth: getCurrentDate(),
  inputSelector: DEFAULT_INPUT_SELECTOR,
  locale: DEFAULT_LOCALE,
  mode: 'static',
  monthFormat: DEFAULT_MONTH_FORMAT,
  onError: DEFAULT_ON_ERROR,
  startInputSelector: DEFAULT_START_INPUT_SELECTOR,
  today: getCurrentDate(),
  type: 'single',
  weekDayFormat: DEFAULT_WEEK_DAY_FORMAT,
  maximumNights: 0,
  minimumNights: 1,
  numberOfMonths: 1,
};

function BentoDatePickerWithRef(
  props: Omit<BentoDatePickerProps, PropertiesWithDefaults>,
  ref: Ref<HTMLInputElement>
) {
  const propsWithDefaults = useMemo(
    () => ({...DEFAULT_PROPS, ...props}),
    [props]
  );

  const {
    allowBlockedEndDate,
    blocked,
    highlighted,
    max,
    maximumNights,
    min,
    minimumNights,
    onError,
    today,
    type,
  } = propsWithDefaults;

  const DatePicker: FunctionalComponent = useMemo(() => {
    switch (type) {
      case 'single': {
        return SingleDatePicker;
      }
      case 'range': {
        return DateRangePicker;
      }
      default: {
        onError('Invalid date picker type');
        // This needs to return a default component to avoid a type error
        return () => <></>;
      }
    }
  }, [type, onError]);

  return (
    <DayContext.Provider
      value={{
        blocked,
        highlighted,
        allowBlockedEndDate,
        min,
        max,
        maximumNights,
        minimumNights,
        today,
      }}
    >
      <DatePicker ref={ref} {...propsWithDefaults} />
    </DayContext.Provider>
  );
}

const BentoDatePicker = forwardRef(BentoDatePickerWithRef);
BentoDatePicker.displayName = 'DatePicker';
export {BentoDatePicker};
