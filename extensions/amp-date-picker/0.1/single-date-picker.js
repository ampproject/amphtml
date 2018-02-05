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

import {map, omit} from '../../../src/utils/object';
import {requireExternal} from '../../../src/module';
import {withDatePickerCommon} from './date-picker-common';


/**
 * Create a SingleDatePicker React component
 * @return {function(new:React.Component, !Object)} A single date picker component class
 */
function createSingleDatePickerBase() {
  const React = requireExternal('react');
  const moment = requireExternal('moment');
  const {
    ANCHOR_LEFT,
    HORIZONTAL_ORIENTATION,
  } = requireExternal('react-dates/constants');
  const {
    SingleDatePicker: DatePicker,
  } = requireExternal('react-dates');

  React.options.syncComponentUpdates = false;

  const defaultProps = map({
    // example props for the demo
    autoFocus: false,
    initialDate: null,
    onDateChange: () => {},

    // input related props
    id: 'date',
    placeholder: 'Date',
    disabled: false,
    required: false,
    screenReaderInputMessage: '',
    showClearDate: false,
    showDefaultInputIcon: false,
    customInputIcon: null,

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
    reopenPickerOnClearDate: false,
    isRTL: false,
    firstDayOfWeek: 1,

    // navigation related props
    navPrev: null,
    navNext: null,
    onPrevMonthClick: () => {},
    onNextMonthClick: () => {},

    // day presentation and interaction related props
    renderDay: null,
    enableOutsideDays: false,

    // internationalization props
    displayFormat: () => moment.localeData().longDateFormat('L'),
    monthFormat: 'MMMM YYYY',

    registerAction: null,
  });

  class SingleDatePickerBase extends React.Component {
    /**
     * @param {!Object} props
     */
    constructor(props) {
      super(props);
      this.state = {
        focused: props.autoFocus,
        date: props.initialDate && moment(props.initialDate),
      };

      if (this.props.registerAction) {
        this.props.registerAction('setDate', invocation => {
          const {date} = invocation.args;
          this.setState({date: moment(date)});
        });
        this.props.registerAction('clear', () => {
          this.setState({date: null});
        });
      }

      this.onDateChange = this.onDateChange.bind(this);
      this.onFocusChange = this.onFocusChange.bind(this);
    }

    /**
     * Respond to date changes.
     * @param {!moment} date
     */
    onDateChange(date) {
      const {onDateChange} = this.props;

      this.setState({date});

      if (onDateChange) {
        onDateChange({date});
      }
    }

    /**
     * Respond to focus changes.
     * @param {!JsonObject} details
     */
    onFocusChange(details) {
      const focused = details['focused'];
      this.setState({focused});
    }

    /** @override */
    render() {
      const {focused, date} = this.state;
      // autoFocus and initialDate are helper props for the example wrapper but are not
      // props on the SingleDatePicker itself and thus, have to be omitted.
      const props = omit(this.props, [
        'autoFocus',
        'initialDate',
      ]);

      return React.createElement(DatePicker, Object.assign({}, props, {
        date,
        focused,
        onDateChange: this.onDateChange,
        onFocusChange: this.onFocusChange,
      }));
    }
  }

  SingleDatePickerBase.defaultProps = defaultProps;

  return withDatePickerCommon(SingleDatePickerBase);
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
