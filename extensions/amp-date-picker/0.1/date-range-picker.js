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
import {map} from '../../../src/utils/object';
import {requireExternal} from '../../../src/module';
import {withDatePickerCommon} from './date-picker-common';

/**
 * Create a DateRangePicker React component
 * @return {function(new:React.Component, !Object)} A date range picker component class
 */
function createDateRangePickerBase() {
  const {
    DAY_SIZE,
    HORIZONTAL_ORIENTATION,
  } = requireExternal('react-dates/constants');
  const {DayPickerRangeController} = requireExternal('react-dates');


  const defaultProps = map({
    startDate: null, // TODO: use null
    endDate: null, // TODO: use null
    onDatesChange() {},

    focusedInput: null,
    onFocusChange() {},
    onClose() {},

    keepOpenOnDateSelect: false,
    minimumNights: 1,
    isOutsideRange() {},
    isDayBlocked() {},
    isDayHighlighted() {},

    // DayPicker props
    renderMonth: null,
    enableOutsideDays: false,
    numberOfMonths: 1,
    orientation: HORIZONTAL_ORIENTATION,
    withPortal: false,
    hideKeyboardShortcutsPanel: false,
    initialVisibleMonth: null,
    daySize: DAY_SIZE,

    navPrev: null,
    navNext: null,

    onPrevMonthClick() {},
    onNextMonthClick() {},
    onOutsideClick() {},

    renderDay: null,
    renderCalendarInfo: null,
    firstDayOfWeek: null,
    verticalHeight: null,
    noBorder: false,
    transitionDuration: undefined,

    // accessibility
    onBlur() {},
    isFocused: false,
    showKeyboardShortcuts: false,

    // i18n
    monthFormat: 'MMMM YYYY',
    weekDayFormat: 'd',
    phrases: DayPickerPhrases,

    isRTL: false,
  });

  const WrappedDayPickerRangeController =
      withDatePickerCommon(DayPickerRangeController);
  WrappedDayPickerRangeController.defaultProps = defaultProps;

  return WrappedDayPickerRangeController;
}

/** @private {?function(new:React.Component, !Object)} */
let DateRangePicker_ = null;

/**
 * Creates a date range picker, injecting its dependencies.
 * @return {function(new:React.Component, !Object)} A date range picker component class
 */
export function createDateRangePicker() {
  if (!DateRangePicker_) {
    DateRangePicker_ = createDateRangePickerBase();
  }
  return DateRangePicker_;
}
