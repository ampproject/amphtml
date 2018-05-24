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


/**
 * A higher-order component that wraps a specific date-picker implmentation
 * with common functionality.
 * @param {function(new:React.Component, !Object)} WrappedComponent A date-picker component to wrap
 * @return {function(new:React.Component, !Object)} A date picker component with common functionality
 */
export function withDatePickerCommon(WrappedComponent) {
  const {
    isInclusivelyAfterDay,
    isInclusivelyBeforeDay,
  } = requireExternal('react-dates');
  const React = requireExternal('react');
  const moment = requireExternal('moment');

  /**
   * @param {!moment} max
   * @return {!moment}
   */
  function getDefaultMinDate(max) {
    const today = moment();
    if (max) {
      return !isInclusivelyAfterDay(today, moment(max)) ? today : '';
    } else {
      return today;
    }
  }

  /**
   * @param {string} min
   * @param {string} max
   * @param {!moment} date
   * @return {boolean}
   */
  function isOutsideRange(min, max, date) {
    const maxInclusive = max && moment(max);
    const minInclusive = min && moment(min);
    if (!maxInclusive && !minInclusive) {
      return false;
    } else if (!minInclusive) {
      return !isInclusivelyBeforeDay(date, maxInclusive);
    } else if (!maxInclusive) {
      return !isInclusivelyAfterDay(date, minInclusive);
    } else {
      return !date.isBetween(minInclusive, maxInclusive);
    }
  }

  const defaultProps = map({
    blocked: null,
    highlighted: null,
    initialVisibleMonth: '',
    max: '',
    min: '',
  });

  class Component extends React.Component {
    constructor(props) {
      super(props);

      /** @private @const */
      this.min_ = this.props.min || getDefaultMinDate(this.props.max);

      this.isDayBlocked = this.isDayBlocked.bind(this);
      this.isDayHighlighted = this.isDayHighlighted.bind(this);
      this.isOutsideRange = this.isOutsideRange.bind(this);
    }

    /** @override */
    componentDidMount() {
      if (this.props.onMount) {
        this.props.onMount();
      }
    }

    /**
     * @param {!moment} day
     * @return {boolean}
     */
    isDayBlocked(day) {
      return this.props.blocked.contains(day);
    }

    /**
     * @param {!moment} day
     * @return {boolean}
     */
    isDayHighlighted(day) {
      return this.props.highlighted.contains(day);
    }

    /**
     * @param {!moment} day
     * @return {boolean}
     */
    isOutsideRange(day) {
      return isOutsideRange(this.min_, this.props.max, day);
    }

    /** @override */
    render() {
      const props = omit(this.props, Object.keys(defaultProps));

      if (this.props.initialVisibleMonth) {
        props.initialVisibleMonth =
            () => moment(this.props.initialVisibleMonth);
      }

      return React.createElement(WrappedComponent, Object.assign({}, props, {
        daySize: Number(props.daySize),
        isDayBlocked: this.isDayBlocked,
        isDayHighlighted: this.isDayHighlighted,
        isOutsideRange: this.isOutsideRange,
      }));
    }
  }

  Component.defaultProps = defaultProps;

  return Component;
}
