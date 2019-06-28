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
import {dict} from '../../../src/utils/object';
import {requireExternal} from '../../../src/module';
import {withDatePickerCommon} from './date-picker-common';
import {wrap as withMaximumNights} from './wrappers/maximum-nights';

/**
 * Create a DateRangePicker React component
 * @return {function(new:React.Component, !JsonObject)} A date range picker component class
 */
function createDateRangePickerBase() {
  const constants = /** @type {JsonObject} */ (requireExternal(
    'react-dates/constants'
  ));
  const DAY_SIZE = constants['DAY_SIZE'];
  const HORIZONTAL_ORIENTATION = constants['HORIZONTAL_ORIENTATION'];
  const DayPickerRangeController = /** @type {function(new: React.Component, !JsonObject)} */ (requireExternal(
    'react-dates'
  )['DayPickerRangeController']);

  const defaultProps = dict({
    'startDate': null, // TODO: use null
    'endDate': null, // TODO: use null
    'onDatesChange': function() {},

    'focusedInput': null,
    'onFocusChange': function() {},
    'onClose': function() {},

    'keepOpenOnDateSelect': false,
    'minimumNights': 1,
    'isOutsideRange': function() {},
    'isDayBlocked': function() {},
    'isDayHighlighted': function() {},

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

    'onPrevMonthClick': function() {},
    'onNextMonthClick': function() {},
    'onOutsideClick': function() {},

    'renderDay': null,
    'renderCalendarInfo': null,
    'firstDayOfWeek': null,
    'verticalHeight': null,
    'noBorder': false,
    'transitionDuration': undefined,

    // accessibility
    'onBlur': function() {},
    'isFocused': false,
    'showKeyboardShortcuts': false,

    // i18n
    'monthFormat': 'MMMM YYYY',
    'weekDayFormat': 'd',
    'phrases': DayPickerPhrases,

    'isRTL': false,
  });

  const WrappedDayPickerRangeController = withDatePickerCommon(
    withMaximumNights(DayPickerRangeController)
  );
  WrappedDayPickerRangeController['defaultProps'] = defaultProps;

  return WrappedDayPickerRangeController;
}

/** @private {?function(new:React.Component, !JsonObject)} */
let DateRangePicker_ = null;

/**
 * Creates a date range picker, injecting its dependencies.
 * @return {function(new:React.Component, !JsonObject)} A date range picker component class
 */
export function createDateRangePicker() {
  if (!DateRangePicker_) {
    DateRangePicker_ = createDateRangePickerBase();
  }
  return DateRangePicker_;
}
