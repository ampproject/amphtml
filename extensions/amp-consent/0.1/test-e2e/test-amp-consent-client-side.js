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

import {
  findElements,
  resetAllElements,
  verifyElementsBuilt,
  verifyPromptsHidden,
} from './common';
import sleep from 'sleep-promise';

describes.endtoend(
  'amp-consent',
  {
    testUrl:
      'http://localhost:8000/test/manual/amp-consent/amp-consent-basic-uses.amp.html#amp-geo=de',
    // TODO (micajuineho): Add shadow-demo after #25985 is fixed and viewer-demo when...
    environments: ['single'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should work with client side decision', async () => {
      resetAllElements();
      const currentUrl = await controller.getCurrentUrl();

      // Verify no local storage decision
      await findElements(controller);
      await verifyElementsBuilt(controller, {
        'tillResponded': false,
        'accepted': false,
        'autoReject': true,
        'defaultBlock': false,
        'notBlocked': true,
        'twitter': false,
      });
      await verifyPromptsHidden(controller, {
        'ui1': true,
        'ui2': false,
        'postPromptUi': true,
      });

      // Client-side decision
      const acceptButton = await controller.findElement('#accept');
      await controller.click(acceptButton);

      await verifyElementsBuilt(controller, {
        'tillResponded': true,
        'accepted': true,
        'autoReject': true,
        'defaultBlock': true,
        'notBlocked': true,
        'twitter': true,
      });
      await verifyPromptsHidden(controller, {
        'ui1': true,
        'ui2': true,
        'postPromptUi': false,
      });

      // Navigate away to random page
      await controller.navigateTo('http://localhost:8000/');
      // Visit website again
      await controller.navigateTo(currentUrl);

      // Verify all elements are still built
      await findElements(controller);
      await verifyElementsBuilt(controller, {
        'tillResponded': true,
        'accepted': true,
        'autoReject': true,
        'defaultBlock': true,
        'notBlocked': true,
        'twitter': true,
      });
      await verifyPromptsHidden(controller, {
        'ui1': true,
        'ui2': true,
        'postPromptUi': false,
      });

      // Check the analytics request consentState. Wait for 1 second for the
      // request to arrive to avoid flaky test.
      await sleep(3000);
      await expect(
        'http://localhost:8000/amp4test/request-bank/e2e/deposit/tracking?consentState=sufficient'
      ).to.have.been.sent;
    });
  }
);
