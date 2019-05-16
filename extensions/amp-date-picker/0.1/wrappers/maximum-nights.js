/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {requireExternal} from '../../../../src/module';

/**
 * Implements the `maximum-nights` attribute on the date range picker.
 * @param {function(new:React.Component, !JsonObject)} WrappedComponent A date-picker component to wrap
 * @return {function(new:React.Component, !JsonObject)}
 */
export function wrap(WrappedComponent) {
  const React = requireExternal('react');
  const reactDatesConstants = requireExternal('react-dates/constants');
  const reactDates = requireExternal('react-dates');

  const END_DATE = reactDatesConstants['END_DATE'];
  const START_DATE = reactDatesConstants['START_DATE'];
  const isInclusivelyAfterDay = reactDates['isInclusivelyAfterDay'];
  const isInclusivelyBeforeDay = reactDates['isInclusivelyBeforeDay'];

  class MaximumNights extends React.Component {
    /**
     * @param {!JsonObject} props
     */
    constructor(props) {
      super(props);

      /** @private */
      this.isOutsideRange_ = getIsOutsideRange(props);
    }

    /** @override */
    componentWillReceiveProps(nextProps) {
      const {props} = this;
      const shouldUpdate =
        props['isOutsideRange'] != nextProps['isOutsideRange'] ||
        props['startDate'] != nextProps['startDate'] ||
        props['endDate'] != nextProps['endDate'] ||
        props['focusedInput'] != nextProps['focusedInput'] ||
        props['maximumNights'] != nextProps['maximumNights'];
      if (shouldUpdate) {
        this.isOutsideRange_ = getIsOutsideRange(nextProps);
      }
    }

    /** @override */
    render() {
      const props = Object.assign({}, this.props);
      props['isOutsideRange'] = this.isOutsideRange_;
      return React.createElement(WrappedComponent, props);
    }
  }

  /**
   * Creates a function that will restrict the user from selecting a range
   * of dates whose length would exceed the value of the maximumDates prop,
   * if present.
   * @param {!Object} props
   * @return {function(!moment):boolean}
   */
  function getIsOutsideRange(props) {
    const isOutsideRange = props['isOutsideRange'];
    const startDate = props['startDate'];
    const endDate = props['endDate'];
    const focusedInput = props['focusedInput'];
    const maximumNights = Number(props['maximumNights']);

    if (!maximumNights) {
      return isOutsideRange;
    }

    if (startDate && focusedInput == END_DATE) {
      const firstIneligibleDay = startDate
        .clone()
        .add(maximumNights + 1, 'days');
      return date => {
        return (
          isOutsideRange(date) ||
          isInclusivelyAfterDay(date, firstIneligibleDay)
        );
      };
    }

    if (endDate && focusedInput == START_DATE) {
      const lastIneligibleDay = endDate
        .clone()
        .add(-1 * (maximumNights + 1), 'days');
      return date => {
        return (
          isOutsideRange(date) ||
          isInclusivelyBeforeDay(date, lastIneligibleDay)
        );
      };
    }

    return isOutsideRange;
  }

  return MaximumNights;
}
