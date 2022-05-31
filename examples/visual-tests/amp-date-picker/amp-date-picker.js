'use strict';

const {
  verifySelectorsVisible,
} = require('../../../build-system/tasks/visual-diff/verifiers');

module.exports = {
  'select a different date': async (page, name) => {
    await page.tap(
      '.i-amphtml-date-picker-container .CalendarMonthGrid_month__horizontal:not(.CalendarMonthGrid_month__hideForAnimation):nth-child(2) .CalendarMonth_table > tbody > tr:nth-child(2) > td:nth-child(2)'
    );
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-date-picker-container .CalendarMonthGrid_month__horizontal:not(.CalendarMonthGrid_month__hideForAnimation):nth-child(2) .CalendarMonth_table > tbody > tr:nth-child(2) > td.CalendarDay__selected:nth-child(2)',
      '.i-amphtml-date-picker-container .CalendarMonthGrid_month__horizontal:not(.CalendarMonthGrid_month__hideForAnimation):nth-child(2) .CalendarMonth_table > tbody > tr:nth-child(3) > td:nth-child(4):not(.CalendarDay__selected)',
    ]);
  },
  'select previous month': async (page, name) => {
    await page.tap(
      '.i-amphtml-date-picker-container button.DayPickerNavigation_button:nth-child(1)'
    );
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-date-picker-container button[aria-label="Thursday, November 1, 2018"]',
    ]);
  },
  'select next month': async (page, name) => {
    await page.tap(
      '.i-amphtml-date-picker-container button.DayPickerNavigation_button:nth-child(2)'
    );
    await verifySelectorsVisible(page, name, [
      '.i-amphtml-date-picker-container button[aria-label="Tuesday, January 1, 2019"]',
    ]);
  },
};
