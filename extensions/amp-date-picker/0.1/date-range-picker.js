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

import {requireExternal} from '../../../src/module';
import {map,omit} from '../../../src/utils/object';
import {withDatePickerCommon} from './date-picker-common';


/**
 * Create a DateRangePicker React component
 * @return {function(new:React.Component, !Object)} A date range picker component class
 */
function createDateRangePickerBase() {
  const React = requireExternal('react');
  const moment = requireExternal('moment');
  const {
    ANCHOR_LEFT,
    HORIZONTAL_ORIENTATION,
  } = requireExternal('react-dates/constants');
  const {
    DateRangePicker: DatePicker,
    DateRangePickerPhrases,
  } = requireExternal('react-dates');

  React.options.syncComponentUpdates = false;

  const defaultProps = map({
    // example props for the demo
    autoFocus: false,
    autoFocusEndDate: false,
    initialStartDate: null,
    initialEndDate: null,

    // input related props
    startDateId: 'start-date',
    startDatePlaceholderText: 'Start Date',
    endDateId: 'end-date',
    endDatePlaceholderText: 'End Date',
    disabled: false,
    required: false,
    screenReaderInputMessage: '',
    showClearDates: false,
    showDefaultInputIcon: false,
    customInputIcon: null,
    customArrowIcon: null,
    customCloseIcon: null,

    // calendar presentation and interaction related props
    renderMonth: null,
    orientation: HORIZONTAL_ORIENTATION,
    anchorDirection: ANCHOR_LEFT,
    horizontalMargin: 0,
    withPortal: false,
    withFullScreenPortal: false,
    initialVisibleMonth: null,
    numberOfMonths: 2,
    keepOpenOnDateSelect: false,
    reopenPickerOnClearDates: false,
    isRTL: false,

    // navigation related props
    navPrev: null,
    navNext: null,
    onPrevMonthClick() {},
    onNextMonthClick() {},

    // day presentation and interaction related props
    renderDay: null,
    minimumNights: 1,
    enableOutsideDays: false,
    isDayBlocked: () => false,
    isOutsideRange: () => false,
    isDayHighlighted: () => false,

    // internationalization
    displayFormat: () => moment.localeData().longDateFormat('L'),
    monthFormat: 'MMMM YYYY',

    // TODO(cvializ): make these configurable for i18n
    phrases: Object.assign({}, DateRangePickerPhrases, {
      chooseAvailableStartDate: ({date}) => `Choose ${date} as the first date.`,
      chooseAvailableEndDate: ({date}) => `Choose ${date} as the last date.`,
      dateIsUnavailable: ({date}) => `The date ${date} is unavailable.`,
      dateIsSelected: ({date}) => `The date ${date} is selected.`,
    }),
    registerAction: null,
  });

  class DateRangePickerBase extends React.Component {
    /**
     * @param {!Object} props
     */
    constructor(props) {
      super(props);

      let focusedInput = null;
      if (props.autoFocus) {
        focusedInput = 'startDate';//this.props.startDateId;
      } else if (props.autoFocusEndDate) {
        focusedInput = 'endDate';//this.props.endDateId;
      }

      this.state = {
        focusedInput,
        startDate: props.initialStartDate && moment(props.initialStartDate),
        endDate: props.initialEndDate && moment(props.initialEndDate),
      };

      this.onDatesChange = this.onDatesChange.bind(this);
      this.onFocusChange = this.onFocusChange.bind(this);

      if (this.props.registerAction) {
        this.props.registerAction('setDates', invocation => {
          const {startDate, endDate} = invocation.args;
          const state = {};
          if (startDate) {
            state.startDate = moment(startDate);
          }
          if (endDate) {
            state.endDate = moment(endDate);
          }

          // TODO(cvializ): check if valid date, blocked, outside range, etc
          this.setState(state);
        });
        this.props.registerAction('clear', () => {
          this.setState({startDate: null, endDate: null});
        });
      }
    }

    /**
     * @param {!Object} details
     */
    onDatesChange({startDate, endDate}) {
      const {onDatesChange} = this.props;

      this.setState({startDate, endDate});

      if (onDatesChange) {
        onDatesChange({startDate, endDate});
      }
    }

    /**
     * @param {?string} focusedInput
     */
    onFocusChange(focusedInput) {
      if (this.props.emitUpdate) {
        this.props.emitUpdate();
      }
      this.setState({focusedInput});
    }

    /** @override */
    render() {
      const {focusedInput, startDate, endDate} = this.state;

      const props = omit(this.props, [
        'autoFocus',
        'autoFocusEndDate',
        'initialStartDate',
        'initialEndDate',
        'onDatesChange',
      ]);

      return React.createElement(DatePicker, Object.assign({}, props, {
        onDatesChange: this.onDatesChange,
        onFocusChange: this.onFocusChange,
        focusedInput,
        startDate,
        endDate,
      }));
    }
  }

  DateRangePickerBase.defaultProps = defaultProps;

  return withDatePickerCommon(DateRangePickerBase);
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
