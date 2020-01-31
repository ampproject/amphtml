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

import sleep from 'sleep-promise';

describes.endtoend(
  'amp-consent',
  {
    testUrl:
      'http://localhost:8000/test/manual/amp-consent/amp-consent-cmp-overlay.html',
    experiments: ['amp-consent-restrict-fullscreen'],
    environments: ['single'],
  },
  env => {
    let controller;
    let dialogs;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should restrict fullscreen until user interaction', async () => {
      // Await the CMP to load
      await sleep(3000);

      const consentPrompt = await controller.findElement('#ConsentPrompt');

      // Verify that it's not fullscreen
      await expect(
        controller.getElementAttribute(consentPrompt, 'class')
      ).to.not.match(/i-amphtml-consent-ui-iframe-fullscreen/);

      await controller.findElement('iframe').then(async iframe => {
        await controller.switchToFrame(iframe);
      });

      await controller.click(await controller.findElement('#consent-wrapper'));
      await sleep(500);
      await controller.switchToParent();
      await expect(
        controller.getElementAttribute(consentPrompt, 'class')
      ).to.match(/i-amphtml-consent-ui-iframe-fullscreen/);

      // Verify SR
      dialogs = await controller.findElements('[role=alertdialog]');
      await expect(dialogs.length).length.to.equal(1);

      await controller.findElement('iframe').then(async iframe => {
        await controller.switchToFrame(iframe);
      });

      // Close
      await controller.click(await controller.findElement('#d'));
      await controller.switchToParent();
      await expect(
        controller.getElementAttribute(consentPrompt, 'class')
      ).to.not.match(/i-amphtml-consent-ui-iframe-fullscreen/);
    });
  }
);
