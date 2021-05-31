/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {DayPickerPhrases} from './defaultPhrases';
import {dict} from '../../../src/core/types/object';
import {requireExternal} from '../../../src/module';
import {withDatePickerCommon} from './date-picker-common';

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

  const defaultProps = dict({
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
  });

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
    const props = {...this.props, ...dict({'focused': true})};
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
