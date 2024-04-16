import {withDatePickerCommon} from './date-picker-common';
import {DayPickerPhrases} from './defaultPhrases';

import {requireExternal} from '../../../src/module';

/**
 * Create a SingleDatePicker React component
 * @return {typeof React.Component} A single date picker component class
 */
function createSingleDatePickerBase() {
  const constants = /** @type {!JsonObject} */ (
    requireExternal('react-dates/constants')
  );

  const DAY_SIZE = constants['DAY_SIZE'];
  const HORIZONTAL_ORIENTATION = constants['HORIZONTAL_ORIENTATION'];
  const DayPickerSingleDateController = /** @type {typeof  React.Component} */ (
    requireExternal('react-dates')['DayPickerSingleDateController']
  );

  const defaultProps = {
    'date': null,
    'onDateChange': function () {},

    'focused': false,
    'onFocusChange': function () {},
    'onClose': function () {},

    'keepOpenOnDateSelect': false,
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
    'firstDayOfWeek': null,
    'daySize': DAY_SIZE,
    'verticalHeight': null,
    'noBorder': false,
    'transitionDuration': undefined,

    'navPrev': null,
    'navNext': null,

    'onPrevMonthClick': function () {},
    'onNextMonthClick': function () {},
    'onOutsideClick': null,

    'renderDay': null,
    'renderCalendarInfo': null,

    // accessibility
    'onBlur': function () {},
    'isFocused': false,
    'showKeyboardShortcuts': false,

    // i18n
    'monthFormat': 'MMMM YYYY',
    'weekDayFormat': 'dd',
    'phrases': DayPickerPhrases,

    'isRTL': false,
  };

  const WrappedDayPickerSingleDateController = withFocusedTrueHack(
    withDatePickerCommon(DayPickerSingleDateController)
  );
  WrappedDayPickerSingleDateController.defaultProps = defaultProps;

  return WrappedDayPickerSingleDateController;
}

/**
 * Fixes bug where overlay single date pickers do not open to
 * the month containing the selected date.
 * https://github.com/airbnb/react-dates/issues/931
 * @param {typeof React.Component} WrappedComponent A date-picker component to wrap
 * @return {typeof React.Component} A class with a preset focused prop
 */
function withFocusedTrueHack(WrappedComponent) {
  const react = requireExternal('react');

  /**
   * Creates an instance of FocusedTrueHack.
   * @param {!JsonObject} props
   * @struct
   * @constructor
   * @extends {React.Component}
   */
  function FocusedTrueHack(props) {
    react.Component.call(this, props);
  }

  FocusedTrueHack.prototype = Object.create(react.Component.prototype);
  FocusedTrueHack.prototype.constructor = FocusedTrueHack;

  /** @override */
  FocusedTrueHack.prototype.render = function () {
    const props = {...this.props, 'focused': true};
    return react.createElement(WrappedComponent, props);
  };

  return FocusedTrueHack;
}

/** @private {?typeof React.Component} */
let SingleDatePicker_ = null;

/**
 * Creates a single date picker, injecting its dependencies
 * @return {typeof React.Component} A date picker component class
 */
export function createSingleDatePicker() {
  if (!SingleDatePicker_) {
    SingleDatePicker_ = createSingleDatePickerBase();
  }
  return SingleDatePicker_;
}
