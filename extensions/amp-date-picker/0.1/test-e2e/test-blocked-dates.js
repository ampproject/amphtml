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

import {Keys} from
  '../../../../build-system/tasks/e2e/functional-test-controller';

describes.endtoend('amp-date-picker', {
  testUrl: 'http://localhost:8000/test/fixtures/e2e/amp-date-picker/blocked-dates.html',
  environments: ['single', 'viewer-demo'],
}, async env => {
  let controller;

  beforeEach(async() => {
    controller = env.controller;
  });

  function selectDate(controller, id, date) {
    const day = date.getDate();
    const selector =
        `//amp-date-picker[@id="${id}"]` +
        '//td[not(contains(@class,"CalendarDay__blocked_out_of_range"))]' +
        `[button/div[normalize-space(text())="${day}"]]`;
    return controller.findElementXPath(selector);
  }

  describe('with allow-blocked-end-date', () => {
    const ID = 'allow-blocked';
    it('should be able to select an available date', async() => {
      const today = new Date();
      const tomorrow = new Date(new Date().setDate(today.getDate() + 1));
      const todayCell = await selectDate(controller, ID, today);

      await controller.click(todayCell);
      await expect(controller.getElementAttribute(todayCell, 'class'))
          .to.contain('CalendarDay__selected_start');

      // This command selects the date one day after the start since the
      // initial focused cell is the date after the start date.
      await controller.type(null, Keys.Enter);

      const endCell = await controller.findElement(
          '.CalendarDay__selected_end');
      await expect(controller.getElementText(endCell))
          .to.equal(String(tomorrow.getDate()));
    });

    it('should be able to select the first blocked date', async() => {
      const today = new Date();
      const nextWeek = new Date(new Date().setDate(today.getDate() + 7));
      const todayCell = await selectDate(controller, ID, today);
      const nextWeekCell = await selectDate(controller, ID, nextWeek);

      await controller.click(todayCell);
      await expect(controller.getElementAttribute(todayCell, 'class'))
          .to.contain('CalendarDay__selected_start');

      // This sequence of commands selects the date one week after the start
      // date since the initial focused cell is the date after the start date.
      await controller.type(null, Keys.ArrowLeft);
      await controller.type(null, Keys.ArrowDown);
      await controller.type(null, Keys.Enter);

      await expect(controller.getElementAttribute(nextWeekCell, 'class'))
          .to.contain('CalendarDay__selected_end');
      await expect(controller.getElementText(nextWeekCell))
          .to.equal(String(nextWeek.getDate()));
    });
  });

  describe('without allow-blocked-end-date', () => {
    const ID = 'disallow-blocked';
    it('should NOT be able to select the first blocked date', async() => {
      const today = new Date();
      const nextWeek = new Date(new Date().setDate(today.getDate() + 7));
      const todayCell = await selectDate(controller, ID, today);
      const nextWeekCell = await selectDate(controller, ID, nextWeek);

      await controller.click(todayCell);
      await expect(controller.getElementAttribute(todayCell, 'class'))
          .to.contain('CalendarDay__selected_start');

      // This sequence of commands selects a date one week after the start date
      // since the initial focused cell is the date after the start date.
      await controller.type(null, Keys.ArrowLeft);
      await controller.type(null, Keys.ArrowDown);
      await controller.type(null, Keys.Enter);

      await expect(controller.getElementAttribute(nextWeekCell, 'class'))
          .to.not.contain('CalendarDay__selected_end');
      await expect(controller.getElementText(nextWeekCell))
          .to.equal(String(nextWeek.getDate()));
    });
  });
});
