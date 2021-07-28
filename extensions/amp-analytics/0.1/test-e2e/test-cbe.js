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

    it('click on input field to focus and then blur', async () => {
      const focusedInputField = await controller.findElement('#inputText');
      const blurredInputField = await controller.findElement('#inputText2');

      await controller.click(blurredInputField);
      await controller.click(focusedInputField);

      // Sleep 1 second for the blur event to be sent
      await sleep(1000);
      await expect('https://foo.com/event?type=blur&eventId=inputText2').to.have
        .been.sent;
    });

    it('click on dropdown menu to focus and then blur', async () => {
      const focusedDropdown = await controller.findElement('#numChild');
      const blurredDropdown = await controller.findElement('#numChild2');

      await controller.click(blurredDropdown);
      await controller.click(focusedDropdown);

      // Sleep 1 second for the blur event to be sent
      await sleep(1000);
      await expect('https://foo.com/event?type=blur&eventId=numChild2').to.have
        .been.sent;
    });

    it('change the content of the input field to trigger on change event', async () => {
      const changedInputField = await controller.findElement('#inputText');

      await controller.click(changedInputField);
      await sleep(300);
      await controller.type(changedInputField, 'test-text');
      await controller.type(changedInputField, Key.Enter);

      // Sleep 1 second for the change event to be sent
      await sleep(1000);
      await expect('https://foo.com/event?type=change&eventId=inputText').to
        .have.been.sent;
    });

    it('change drop down option selected to trigger on change event', async () => {
      const changedDropdown = await controller.findElement('#numChild');

      await controller.click(changedDropdown);
      await controller.type(changedDropdown, '1');
      await controller.type(changedDropdown, Key.Enter);
      // Sleep 1 second for the change event to be sent
      await sleep(5000);
      await expect('https://foo.com/event?type=change&eventId=numChild').to.have
        .been.sent;
    });
  }
);
