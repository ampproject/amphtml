import {requireExternal} from '../../../../src/module';

/**
 * Implements the `maximum-nights` attribute on the date range picker.
 * @param {typeof React.Component} WrappedComponent A date-picker component to wrap
 * @return {typeof React.Component}
 */
export function wrap(WrappedComponent) {
  const react = requireExternal('react');
  const reactDatesConstants = requireExternal('react-dates/constants');
  const reactDates = requireExternal('react-dates');

  const END_DATE = reactDatesConstants['END_DATE'];
  const START_DATE = reactDatesConstants['START_DATE'];
  const isInclusivelyAfterDay = reactDates['isInclusivelyAfterDay'];
  const isInclusivelyBeforeDay = reactDates['isInclusivelyBeforeDay'];

  /**
   * Creates an instance of FocusedTrueHack.
   * @param {!JsonObject} props
   * @struct
   * @constructor
   * @extends {React.Component}
   */
  function MaximumNights(props) {
    react.Component.call(this, props);

    /** @private */
    this.isOutsideRange_ = getIsOutsideRange(props);
  }

  MaximumNights.prototype = Object.create(react.Component.prototype);
  MaximumNights.prototype.constructor = MaximumNights;

  /** @override */
  MaximumNights.prototype.componentWillReceiveProps = function (nextProps) {
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
  };

  /** @override */
  MaximumNights.prototype.render = function () {
    const props = {...this.props};
    props['isOutsideRange'] = this.isOutsideRange_;
    return react.createElement(WrappedComponent, props);
  };

  /** @private @const visible for testing */
  MaximumNights.getIsOutsideRange = getIsOutsideRange;

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
      return (date) => {
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
      return (date) => {
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
