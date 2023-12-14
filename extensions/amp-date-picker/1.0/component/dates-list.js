import {addDays, isSameDay, isValid} from 'date-fns';
import {rrulestr} from 'rrule';

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
   * @param {Array<string|Date>|undefined} dates
   */
  constructor(dates = []) {
    /** @private @const */
    this.rrulestrs_ = dates
      .filter((d) => this.getDateType_(d) === DateType.RRULE)
      .map((d) => tryParseRrulestr(d));

    /** @private @const */
    this.dates_ = dates
      .filter((d) => this.getDateType_(d) === DateType.DATE)
      .sort((a, b) => a - b);
  }

  /**
   * Determines if the given date is contained within the RRULEs or moment dates
   * contained in the date list.
   * @param {!Date|string} date
   * @return {boolean}
   */
  contains(date) {
    return this.matchesDate_(date) || this.matchesRrule_(date);
  }

  /**
   * Gets the first date in the date list after the given date.
   * @param {!Date} date
   * @return {!Date}
   */
  firstDateAfter(date) {
    const firstDatesAfter = [];
    for (let i = 0; i < this.dates_.length; i++) {
      if (this.dates_[i] >= date) {
        firstDatesAfter.push(this.dates_[i]);
        break;
      }
    }

    const rruleDates = this.rrulestrs_
      .map((rrule) => /** @type {RRule} */ rrule.after(date))
      .filter(Boolean)
      .map(normalizeRruleReturn);

    return firstDatesAfter.concat(rruleDates).sort((a, b) => {
      return a - b;
    })[0];
  }

  /**
   * Distinguish between RRULE dates and moment dates.
   * @param {!Date|string} date
   * @return {!DateType}
   * @private
   */
  getDateType_(date) {
    if (isValid(date)) {
      return DateType.DATE;
    }

    const dateStr = /** @type {string} */ date;
    if (tryParseRrulestr(dateStr)) {
      return DateType.RRULE;
    }

    return DateType.INVALID;
  }

  /**
   * Determines if any internal moment object matches the given date.
   * @param {!Date} date
   * @return {boolean}
   * @private
   */
  matchesDate_(date) {
    return this.dates_.some((d) => isSameDay(d, date));
  }

  /**
   * Determines if any internal RRULE object matches the given date.
   * @param {!Date} date
   * @return {boolean}
   * @private
   */
  matchesRrule_(date) {
    const nextDate = addDays(date, 1);
    return this.rrulestrs_.some((rrule) => {
      const rruleUTCDate = /** @type {RRule} */ rrule.before(nextDate);
      if (!rruleUTCDate) {
        return false;
      }
      const rruleLocalDate = normalizeRruleReturn(rruleUTCDate);
      return isSameDay(rruleLocalDate, date);
    });
  }
}
