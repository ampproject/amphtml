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

describes.endtoend(
  'amp-consent',
  {
    testUrl:
      'http://localhost:8000/test/manual/amp-consent/amp-consent-basic-uses.amp.html#amp-geo=us',
    experiments: ['amp-consent-geo-override'],
    // TODO (micajuineho): Add shadow-demo after #25985 is fixed and viewer-demo when...
    environments: ['single'],
  },
  env => {
    let controller;
    let ui1;
    let ui2;
    let postPromptUi;
    let tillResponded;
    let accepted;
    let autoReject;
    let defaultBlock;
    let notBlocked;
    let twitter;

    beforeEach(() => {
      controller = env.controller;
    });

    async function findElements() {
      ui1 = await controller.findElement('#ui1');
      ui2 = await controller.findElement('#ui2');
      postPromptUi = await controller.findElement('#postPromptUI');
      tillResponded = await controller.findElement(
        '[data-block-on-consent="_till_responded"]'
      );
      accepted = await controller.findElement(
        '[data-block-on-consent="_till_accepted"]'
      );
      autoReject = await controller.findElement(
        '[data-block-on-consent="_auto_reject"]'
      );
      defaultBlock = await controller.findElement(
        '[data-block-on-consent="default"]'
      );
      notBlocked = await controller.findElement(
        '[src="/examples/img/ima-poster.png"]'
      );
      twitter = await controller.findElement(
        '[data-tweetid="885634330868850689"]'
      );
    }

    async function verifyElementsBuilt(builtArray) {
      const elements = [
        tillResponded,
        accepted,
        autoReject,
        defaultBlock,
        notBlocked,
        twitter,
      ];

      await expect(builtArray.length).to.equal(elements.length);

      for (let i = 0; i < elements.length; i++) {
        if (builtArray[i]) {
          // Should be visible
          await expect(
            controller.getElementAttribute(elements[i], 'class')
          ).to.not.match(/amp-notbuilt/);
        } else {
          // Should not be visible
          await expect(
            controller.getElementAttribute(elements[i], 'class')
          ).to.match(/amp-notbuilt/);
        }
      }
    }

    async function verifyPromptsHidden(hiddenArray) {
      const elements = [ui1, ui2, postPromptUi];

      await expect(hiddenArray.length).to.equal(elements.length);

      for (let i = 0; i < elements.length; i++) {
        if (hiddenArray[i]) {
          // Should be hidden
          await expect(controller.getElementProperty(elements[i], 'hidden')).to
            .be.true;
        } else {
          // Should not be hidden
          await expect(controller.getElementProperty(elements[i], 'hidden')).to
            .be.false;
        }
      }
    }

    it('should respect server side decision and persist it', async () => {
      const currentUrl = await controller.getCurrentUrl();

      // Block/unblock elements based off of 'reject' from response
      await findElements();
      await verifyElementsBuilt([true, false, true, false, true, false]);
      await verifyPromptsHidden([true, true, false]);

      // Navigate away to random page
      await controller.navigateTo('http://localhost:8000/');
      // Visit website again
      await controller.navigateTo(currentUrl);

      // Verify same behavior after refresh
      await findElements();
      await verifyElementsBuilt([true, false, true, false, true, false]);
      await verifyPromptsHidden([true, true, false]);
    });
  }
);
