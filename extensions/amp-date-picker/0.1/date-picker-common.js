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

import {dict, omit} from '../../../src/utils/object';
import {requireExternal} from '../../../src/module';


/**
 * A higher-order component that wraps a specific date-picker implmentation
 * with common functionality.
 * @param {function(new:React.Component, !JsonObject)} WrappedComponent A date-picker component to wrap
 * @return {function(new:React.Component, !JsonObject)} A date picker component with common functionality
 */
export function withDatePickerCommon(WrappedComponent) {
  const reactDates = requireExternal('react-dates');
  const isSameDay = reactDates['isSameDay'];
  const isInclusivelyAfterDay = reactDates['isInclusivelyAfterDay'];
  const isInclusivelyBeforeDay = reactDates['isInclusivelyBeforeDay'];
  const React = requireExternal('react');
  const moment = requireExternal('moment');

  /**
   * If `max` is null, the default minimum date is the current date.
   * If `max` is a Moment date and earlier than the current date, then
   * there is no default minimum date. If `max` is later than the current date,
   * then the default minimum date is the current date.
   * @param {?moment} max
   * @return {?moment}
   */
  function getDefaultMinDate(max) {
    const today = moment();
    if (max) {
      return !isInclusivelyAfterDay(today, max) ? today : null;
    } else {
      return today;
    }
  }

  /**
   * Check if the given date is between or equal to the two bounds.
   * @param {!moment} date
   * @param {!moment} min
   * @param {!moment} max
   * @return {boolean}
   */
  function isInclusivelyBetween(date, min, max) {
    return isInclusivelyAfterDay(date, min) &&
        isInclusivelyBeforeDay(date, max);
  }

  /**
   * @param {string} min
   * @param {string} max
   * @param {!moment} date
   * @return {boolean}
   */
  function isOutsideRange(min, max, date) {
    const maxInclusive = max ? moment(max) : null;
    const minInclusive = min ? moment(min) : getDefaultMinDate(maxInclusive);
    if (!maxInclusive && !minInclusive) {
      return false;
    } else if (!minInclusive) {
      return !isInclusivelyBeforeDay(date, maxInclusive);
    } else if (!maxInclusive) {
      return !isInclusivelyAfterDay(date, minInclusive);
    } else {
      return !isInclusivelyBetween(date, minInclusive, maxInclusive);
    }
  }

  /**
   * @param {!./dates-list.DatesList} list
   * @param {!moment} day
   * @return {boolean}
   */
  function datesListContains(list, day) {
    if (!list) {
      return false;
    }
    return list.contains(day);
  }

  const defaultProps = dict({
    'allowBlockedEndDate': false,
    'blocked': null,
    'highlighted': null,
    'initialVisibleMonth': '',
    'max': '',
    'min': '',
  });

  /**
   *
   * @param {!DatesList} list
   * @param {?moment} startDate
   * @param {?moment} endDate
   * @param {boolean} allowBlockedEndDate
   * @param {!moment} day
   */
  function isDayBlocked(list, startDate, endDate, allowBlockedEndDate, day) {
    const isBlocked = datesListContains(list, day);

    if (startDate && !endDate && allowBlockedEndDate) {
      return isBlocked && !isSameDay(day, list.firstDateAfter(startDate));
    } else {
      return isBlocked;
    }
  }

  /**
   * @struct
   */
  class Component extends React.Component {
    /**
     * Creates an instance of Component.
     * @param {!JsonObject} props
     */
    constructor(props) {
      super(props);

      /** @type {!JsonObject} */
      this.props;

      const allowBlockedEndDate = props['allowBlockedEndDate'];
      const blocked = props['blocked'];
      const endDate = props['endDate'];
      const highlighted = props['highlighted'];
      const max = props['max'];
      const min = props['min'];
      const startDate = props['startDate'];

      this.isDayBlocked = isDayBlocked.bind(null,
          blocked, startDate, endDate, allowBlockedEndDate);
      this.isDayHighlighted = datesListContains.bind(null, highlighted);
      this.isOutsideRange = isOutsideRange.bind(null, min, max);
    }

    /** @override */
    componentDidMount() {
      if (this.props['onMount']) {
        this.props['onMount']();
      }
    }

    /** @override */
    componentWillReceiveProps(nextProps) {
      const allowBlockedEndDate = nextProps['allowBlockedEndDate'];
      const blocked = nextProps['blocked'];
      const endDate = nextProps['endDate'];
      const highlighted = nextProps['highlighted'];
      const max = nextProps['max'];
      const min = nextProps['min'];
      const startDate = nextProps['startDate'];

      if (min != this.props['min'] || max != this.props['max']) {
        this.isOutsideRange = isOutsideRange.bind(null, min, max);
      }

      if (blocked != this.props['blocked'] ||
        allowBlockedEndDate != this.props['allowBlockedEndDate'] ||
        startDate != this.props['startDate'] ||
        endDate != this.props['endDate']) {
        this.isDayBlocked = isDayBlocked.bind(null,
            blocked, startDate, endDate, allowBlockedEndDate);
      }

      if (highlighted != this.props['highlighted']) {
        this.isDayHighlighted = datesListContains.bind(null, highlighted);
      }
    }

    /** @override */
    render() {
      const props = /** @type {!JsonObject} */ (
        omit(this.props, Object.keys(defaultProps)));

      const date = props['date'];
      const daySize = props['daySize'];
      const endDate = props['endDate'];
      const initialVisibleMonth = props['initialVisibleMonth'];
      const startDate = props['startDate'];

      const initialDate =
          initialVisibleMonth || date || startDate || endDate || undefined;
      props['initialVisibleMonth'] = () => moment(initialDate);

      return React.createElement(WrappedComponent, Object.assign({}, props,
          dict({
            'daySize': Number(daySize),
            'isDayBlocked': this.isDayBlocked,
            'isDayHighlighted': this.isDayHighlighted,
            'isOutsideRange': this.isOutsideRange,
          })));
    }
  }

  /** @dict */
  Component['defaultProps'] = defaultProps;

  return Component;
}
