/** @externs */

import {DatePickerMode, DatePickerType} from './constants';

/** @const */
var BentoDatePickerDef = {};

/**
 * @typedef {{
 * allowBlockedEndDate: (boolean|undefined)
 * allowBlockedRanges: (boolean|undefined)
 * blocked: (Array<Date|string>|string|undefined)
 * children: (?PreactDef.Renderable|undefined),
 * endInputSelector: (string|undefined)
 * format: (string|undefined)
 * blocked: (Array<Date|string>|string|undefined)
 * id: (string|undefined)
 * initialVisibleMonth: (Date|undefined)
 * inputSelector: (string|undefined)
 * max: (Date|undefined)
 * min: (Date|undefined)
 * mode: (DatePickerMode|undefined)
 * monthFormat: (string|undefined)
 * onError: (function|undefined)
 * startInputSelector: (string|undefined)
 * type: (DatePickerType|undefined)
 * weekdayFormat: (string|undefined)
 * }}
 * }}
 */
BentoDatePickerDef.Props;

/** @interface */
BentoDatePickerDef.BentoDatePickerApi = class {
  /**
   */
  clear() {}

  /**
   * @param {({ offset: number|undefined}|undefined)} args
   */
  today(args) {}

  /**
   * @param {Date|undefined} date
   */
  setDate(date) {}
};
