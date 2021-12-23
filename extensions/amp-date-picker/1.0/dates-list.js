import {isSameDay, isValid} from 'date-fns';
import * as rrule from 'rrule';

const rrulestr = rrule.default.rrulestr || rrule.rrulestr; // closure imports into .default, esbuild flattens a layer.

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
   * @param {!Array<string|Date>} dates
   */
  constructor(dates) {
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
    return this.matchesDate_(date);
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

    // const rruleDates = this.rrulestrs_
    //   .map((rrule) => /** @type {RRule} */ (rrule).after(date))
    //   .filter(Boolean)
    //   .map(normalizeRruleReturn);
    const rruleDates = [];

    return firstDatesAfter.concat(rruleDates).sort((a, b) => {
      // toDate method does not exist for RRule dates.
      a = a.toDate ? a.toDate() : a;
      b = b.toDate ? b.toDate() : b;
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

    const dateStr = /** @type {string} */ (date);
    if (tryParseRrulestr(dateStr)) {
      return DateType.RRULE;
    }

    return DateType.INVALID;
  }

  /**
   * Determines if any internal moment object matches the given date.
   * @param {!moment} date
   * @return {boolean}
   * @private
   */
  matchesDate_(date) {
    return this.dates_.some((d) => isSameDay(d, date));
  }
}
