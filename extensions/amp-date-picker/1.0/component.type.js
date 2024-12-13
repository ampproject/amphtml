/** @interface */
BentoDatePickerDef.BentoDatePickerApi = class {
  /**
   */
  clear() {}

  /**
   * @param {number|undefined} offset
   */
  today(offset) {}

  /**
   * @param {Date|undefined} date
   */
  setDate(date) {}

  /**
   * @param {number|undefined} offset
   */
  startToday(offset) {}

  /**
   * @param {number|undefined} offset
   */
  endToday(offset) {}

  /**
   * @param {number|undefined} offset
   */
  endToday(offset) {}

  /**
   * @param {Date|undefined} startDate
   * @param {Date|undefined} endDate
   */
  setDates(startDate, endDate) {}
};
