/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {Key} from '../../../../build-system/tasks/e2e/functional-test-controller';

describes.endtoend(
  'amp-date-picker',
  {
    testUrl:
      'http://localhost:8000/test/fixtures/e2e/amp-date-picker/past-selection.html',
    environments: ['single', 'viewer-demo'],
  },
  async (env) => {
    let controller;

    beforeEach(async () => {
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

    it('should be able to select a date in the past for range date picker', async () => {
      const id = 'allow-past-range';
      const today = new Date();
      const yesterday = new Date(new Date().setDate(today.getDate() - 1));
      const yesterdayCell = await selectDate(controller, id, yesterday);

      await controller.click(yesterdayCell);
      await expect(
        controller.getElementAttribute(yesterdayCell, 'class')
      ).to.contain('CalendarDay__selected_start');

      // This command selects the date one day after the start since the
      // initial focused cell is the date after the start date.
      await controller.type(null, Key.Enter);

      const endCell = await controller.findElement(
        '.CalendarDay__selected_end'
      );
      await expect(controller.getElementText(endCell)).to.equal(
        String(today.getDate())
      );
    });

    it('should be able to select a date in the past for single date picker', async () => {
      const id = 'allow-past-single';
      const today = new Date();
      const yesterday = new Date(new Date().setDate(today.getDate() - 1));
      const yesterdayCell = await selectDate(controller, id, yesterday);

      await controller.click(yesterdayCell);
      await expect(
        controller.getElementAttribute(yesterdayCell, 'class')
      ).to.contain('CalendarDay__selected');
    });
  }
);
