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
import {Key} from '../../../../build-system/tasks/e2e/e2e-types';

describes.endtoend(
  'custom browser events',
  {
    fixture: 'amp-analytics/custom-browser-events.html',
    environments: ['single'],
  },
  (env) => {
    let controller;

    beforeEach(async () => {
      controller = env.controller;
    });

    function sleep(ms) {
      return new Promise((res) => setTimeout(res, ms));
    }

    it('click on input field and fropdown menu to focus and then blur', async () => {
      debugger;
      const inputField = await controller.findElement('#inputText');
      const inputField2 = await controller.findElement('#inputText2');

      await controller.click(inputField2);
      await controller.click(inputField);

      await sleep(1000);
      await expect(
        'https://foo.com/event?type=blur&eventId='
      ).to.have.been.sent;
    });

    it('click on input field and fropdown menu to focus and then blur', async () => {

      const dropdown = await controller.findElement('#numChild');
      const dropdown2 = await controller.findElement('#numChild2');

      await controller.click(dropdown2);
      await controller.click(dropdown);

      await sleep(1000);
      await expect(
        'https://foo.com/event?type=blur&eventId='
      ).to.have.been.sent;
    });

    it('change the content of the input field to trigger on change event', async () => {
      debugger;
      const inputField = await controller.findElement('#inputText');

      await controller.click(inputField);
      await sleep(300);
      await controller.type(inputField, 'test-text');
      await controller.type(inputField, Key.Enter);
      // Sleep 1 second for the change event to be sent
      await sleep(1000);
      await expect(
        'https://foo.com/event?type=change&eventId='
      ).to.have.been.sent;

    });

    it('change drop down ', async () => {
      debugger;
      const dropdown = await controller.findElement('#numChild');

      await controller.click(dropdown);
      await controller.type(dropdown, '1');
      await controller.type(dropdown, Key.Enter);
      debugger
      // Sleep 1 second for the change event to be sent
      await sleep(1000);
      await expect(
        'https://foo.com/event?type=change&eventId='
      ).to.have.been.sent;

    });
  }
);
