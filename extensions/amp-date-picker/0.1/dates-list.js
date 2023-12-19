import {rrulestr} from 'rrule';

import {requireExternal} from '../../../src/module';

/** @enum {string} */
const DateType = {
  INVALID: 'invalid',
  RRULE: 'rrule',
  DATE: 'date',
};

/**
 * A class which wraps a list of moment dates or RRULE dates.
 */
export class DatesList {
  /**
   * @param {!Array<string>} dates
   */
  constructor(dates) {
    /** @private @const */
    this.ReactDates_ = /** @type {!JsonObject} */ (
      requireExternal('react-dates')
    );

    /** @private @const */
    this.moment_ = requireExternal('moment');

    /** @private @const */
    this.rrulestrs_ = dates
      .filter((d) => this.getDateType_(d) === DateType.RRULE)
      .map((d) => tryParseRrulestr(d));

    /** @private @const */
    this.dates_ = dates
      .filter((d) => this.getDateType_(d) == DateType.DATE)
      .map((d) => this.moment_(d))
      .sort((a, b) => a.toDate() - b.toDate());
  }

  /**
   * Determines if the given date is contained within the RRULEs or moment dates
   * contained in the date list.
   * @param {!moment|string} date
   * @return {boolean}
   */
  contains(date) {
    const m = this.moment_(date);
    return this.matchesDate_(m) || this.matchesRrule_(m);
  }

  /**
   * Gets the first date in the date list after the given date.
   * @param {!moment|string} momentOrString
   * @return {!moment}
   */
  firstDateAfter(momentOrString) {
    const m = this.moment_(momentOrString);
    const date = m.toDate();

    const firstDatesAfter = [];
    for (let i = 0; i < this.dates_.length; i++) {
      if (this.dates_[i].toDate() >= date) {
        firstDatesAfter.push(this.dates_[i]);
        break;
      }
    }

    const rruleDates = this.rrulestrs_
      .map((rrule) => /** @type {RRule} */ (rrule).after(date))
      .filter(Boolean)
      .map(normalizeRruleReturn);

    return firstDatesAfter.concat(rruleDates).sort((a, b) => {
      // toDate method does not exist for RRule dates.
      a = a.toDate ? a.toDate() : a;
      b = b.toDate ? b.toDate() : b;
      return a - b;
    })[0];
  }

  /**
   * Determines if any internal moment object matches the given date.
   * @param {!moment} date
   * @return {boolean}
   * @private
   */
  matchesDate_(date) {
    return this.dates_.some((d) => this.ReactDates_['isSameDay'](d, date));
  }

  /**
   * Determines if any internal RRULE object matches the given date.
   * @param {!moment} date
   * @return {boolean}
   * @private
   */
  matchesRrule_(date) {
    const nextDate = date.clone().startOf('day').add(1, 'day').toDate();
    return this.rrulestrs_.some((rrule) => {
      const rruleUTCDate = /** @type {RRule} */ (rrule).before(nextDate);
      if (!rruleUTCDate) {
        return false;
      }
      const rruleLocalDate = normalizeRruleReturn(rruleUTCDate);
      const rruleMoment = this.moment_(rruleLocalDate);
      return this.ReactDates_['isSameDay'](rruleMoment, date);
    });
  }

  /**
   * Distinguish between RRULE dates and moment dates.
   * @param {!moment|string} date
   * @return {!DateType}
   * @private
   */
  getDateType_(date) {
    if (this.moment_(date).isValid()) {
      return DateType.DATE;
    }

    const dateStr = /** @type {string} */ (date);
    if (tryParseRrulestr(dateStr)) {
      return DateType.RRULE;
    }

    return DateType.INVALID;
  }
}

/**
 * RRULE returns dates as local time formatted at UTC, so the
 * Date.prototype.getUTC* methods must be used to create a new date object.
 * {@link https://github.com/jakubroztocil/rrule#important-use-utc-dates}
 * @param {!Date} rruleDate
 * @return {!Date}
 */
function normalizeRruleReturn(rruleDate) {
  const year = rruleDate.getUTCFullYear();
  const month = rruleDate.getUTCMonth();
  const day = rruleDate.getUTCDate();
  const hours = rruleDate.getUTCHours();
  const minutes = rruleDate.getUTCMinutes();
  const seconds = rruleDate.getUTCSeconds();
  const ms = rruleDate.getUTCMilliseconds();
  return new Date(year, month, day, hours, minutes, seconds, ms);
}

/**
 * Tries to parse a string into an RRULE object.
 * @param {string} str A string which represents a repeating date RRULE spec.
 * @return {?RRule}
 */
function tryParseRrulestr(str) {
  try {
    return rrulestr(str, {});
  } catch (e) {
    return null;
  }
}
