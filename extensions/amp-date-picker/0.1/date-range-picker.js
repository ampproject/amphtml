import {withDatePickerCommon} from './date-picker-common';
import {DayPickerPhrases} from './defaultPhrases';
import {wrap as withMaximumNights} from './wrappers/maximum-nights';

import {requireExternal} from '../../../src/module';

/**
 * Create a DateRangePicker React component
 * @return {typeof React.Component} A date range picker component class
 */
function createDateRangePickerBase() {
  const constants = /** @type {JsonObject} */ (
    requireExternal('react-dates/constants')
  );
  const DAY_SIZE = constants['DAY_SIZE'];
  const HORIZONTAL_ORIENTATION = constants['HORIZONTAL_ORIENTATION'];
  const DayPickerRangeController = /** @type {typeof  React.Component} */ (
    requireExternal('react-dates')['DayPickerRangeController']
  );

  const defaultProps = {
    'startDate': null, // TODO: use null
    'endDate': null, // TODO: use null
    'onDatesChange': function () {},

    'focusedInput': null,
    'onFocusChange': function () {},
    'onClose': function () {},

    'keepOpenOnDateSelect': false,
    'minimumNights': 1,
    'isOutsideRange': function () {},
    'isDayBlocked': function () {},
    'isDayHighlighted': function () {},

    // DayPicker props
    'renderMonth': null,
    'enableOutsideDays': false,
    'numberOfMonths': 1,
    'orientation': HORIZONTAL_ORIENTATION,
    'withPortal': false,
    'hideKeyboardShortcutsPanel': false,
    'initialVisibleMonth': null,
    'daySize': DAY_SIZE,

    'navPrev': null,
    'navNext': null,

    'onPrevMonthClick': function () {},
    'onNextMonthClick': function () {},
    'onOutsideClick': function () {},

    'renderDay': null,
    'renderCalendarInfo': null,
    'firstDayOfWeek': null,
    'verticalHeight': null,
    'noBorder': false,
    'transitionDuration': undefined,

    // accessibility
    'onBlur': function () {},
    'isFocused': false,
    'showKeyboardShortcuts': false,

    // i18n
    'monthFormat': 'MMMM YYYY',
    'weekDayFormat': 'd',
    'phrases': DayPickerPhrases,

    'isRTL': false,
  };

  const WrappedDayPickerRangeController = withDatePickerCommon(
    withMaximumNights(DayPickerRangeController)
  );
  WrappedDayPickerRangeController['defaultProps'] = defaultProps;

  return WrappedDayPickerRangeController;
}

/** @private {?typeof React.Component} */
let DateRangePicker_ = null;

/**
 * Creates a date range picker, injecting its dependencies.
 * @return {typeof React.Component} A date range picker component class
 */
export function createDateRangePicker() {
  if (!DateRangePicker_) {
    DateRangePicker_ = createDateRangePickerBase();
  }
  return DateRangePicker_;
}
