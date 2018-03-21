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
 * Create a SingleDatePicker React component
 * @return {function(new:React.Component, !Object)} A single date picker component class
 */
function createSingleDatePickerBase() {
  const {
    DAY_SIZE,
    HORIZONTAL_ORIENTATION,
  } = requireExternal('react-dates/constants');
  const {DayPickerSingleDateController} = requireExternal('react-dates');

  const defaultProps = map({
    date: null,
    onDateChange() {},

    focused: false,
    onFocusChange() {},
    onClose() {},

    keepOpenOnDateSelect: false,
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
    firstDayOfWeek: null,
    daySize: DAY_SIZE,
    verticalHeight: null,
    noBorder: false,
    transitionDuration: undefined,

    navPrev: null,
    navNext: null,

    onPrevMonthClick() {},
    onNextMonthClick() {},
    onOutsideClick: null,

    renderDay: null,
    renderCalendarInfo: null,

    // accessibility
    onBlur() {},
    isFocused: false,
    showKeyboardShortcuts: false,

    // i18n
    monthFormat: 'MMMM YYYY',
    weekDayFormat: 'dd',
    phrases: DayPickerPhrases,

    isRTL: false,
  });

  const WrappedDayPickerSingleDateController =
      withDatePickerCommon(DayPickerSingleDateController);
  WrappedDayPickerSingleDateController.defaultProps = defaultProps;

  return WrappedDayPickerSingleDateController;
}


/** @private {?function(new:React.Component, !Object)} */
let SingleDatePicker_ = null;

/**
 * Creates a single date picker, injecting its dependencies
 * @return {function(new:React.Component, !Object)} A date picker component class
 */
export function createSingleDatePicker() {
  if (!SingleDatePicker_) {
    SingleDatePicker_ = createSingleDatePickerBase();
  }
  return SingleDatePicker_;
}
