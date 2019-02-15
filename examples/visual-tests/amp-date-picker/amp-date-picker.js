/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
'use strict';

const {verifySelectorsVisible} = require('../../../build-system/tasks/visual-diff/helpers');

module.exports = {
  'select a different date': async (page, name) => {
    await page.tap(".i-amphtml-date-picker-container .CalendarMonthGrid_month__horizontal:not(.CalendarMonthGrid_month__hideForAnimation):nth-child(2) .CalendarMonth_table > tbody > tr:nth-child(2) > td:nth-child(2)");
    await verifySelectorsVisible(page, name,
      [
        ".i-amphtml-date-picker-container .CalendarMonthGrid_month__horizontal:not(.CalendarMonthGrid_month__hideForAnimation):nth-child(2) .CalendarMonth_table > tbody > tr:nth-child(2) > td.CalendarDay__selected:nth-child(2)",
        ".i-amphtml-date-picker-container .CalendarMonthGrid_month__horizontal:not(.CalendarMonthGrid_month__hideForAnimation):nth-child(2) .CalendarMonth_table > tbody > tr:nth-child(3) > td:nth-child(4):not(.CalendarDay__selected)"
      ]);
  },
  'select previous month': async (page, name) => {
    await page.tap(".i-amphtml-date-picker-container button.DayPickerNavigation_button:nth-child(1)");
    await verifySelectorsVisible(page, name,
      [
        ".i-amphtml-date-picker-container button[aria-label=Thursday\\,\\ November\\ 1\\,\\ 2018]"
      ]);
  },
  'select next month': async (page, name) => {
    await page.tap(".i-amphtml-date-picker-container button.DayPickerNavigation_button:nth-child(2)");
    await verifySelectorsVisible(page, name,
      [
        ".i-amphtml-date-picker-container button[aria-label=Tuesday\\,\\ January\\ 1\\,\\ 2019]"
      ]);
  },
 };
