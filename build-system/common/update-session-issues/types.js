/** @typedef {0|1|2|3|4|5|6} */
let DayOfWeekDef; // sunday = 0, monday = 1, ...

/** @typedef {[DayOfWeekDef, string, string]} */
let RotationItemDef;

/**
 * @typedef {{
 *   calendarEventDetails: string,
 *   calendarEventTitle: string,
 *   createBody: TemplateFnDef,
 *   createTitle: TemplateFnDef,
 *   generateWeeksFromNow: number,
 *   labels: Array<string>,
 *   sessionDurationHours: number,
 *   timeRotationStart: Date,
 *   timeRotationUtc: Array<RotationItemDef>,
 * }}
 */
let TemplateDef;

/**
 * @typedef {{
 *   datetimeUtc: string,
 *   region: string,
 *   timeUtc: string,
 *   timeUrl: string,
 *   calendarUrl: string,
 * }}
 */
let TemplateDataDef;

/** @typedef {function(TemplateDataDef):string} */
let TemplateFnDef;

module.exports = {
  DayOfWeekDef,
  RotationItemDef,
  TemplateDef,
  TemplateFnDef,
};
