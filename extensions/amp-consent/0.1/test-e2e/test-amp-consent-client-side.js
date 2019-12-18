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
      'http://localhost:8000/test/manual/amp-consent/amp-consent-basic-uses.amp.html#amp-geo=de',
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
    let requestBank;

    beforeEach(() => {
      controller = env.controller;
      requestBank = env.requestBank;
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

    async function verifyElementsBuilt(builtMap) {
      const elementsMap = {
        'tillResponded': tillResponded,
        'accepted': accepted,
        'autoReject': autoReject,
        'defaultBlock': defaultBlock,
        'notBlocked': notBlocked,
        'twitter': twitter,
      };

      await expect(builtMap.length).to.equal(elementsMap.length);
      const elementIds = Object.keys(elementsMap);

      for (let i = 0; i < elementIds.length; i++) {
        const elementId = elementIds[i];
        const element = elementsMap[elementId];
        const shouldBeBuilt = builtMap[elementId];

        if (shouldBeBuilt) {
          // Should be visible
          await expect(
            controller.getElementAttribute(element, 'class')
          ).to.not.match(/amp-notbuilt/);
        } else {
          // Should not be visible
          await expect(
            controller.getElementAttribute(element, 'class')
          ).to.match(/amp-notbuilt/);
        }
      }
    }

    async function verifyPromptsHidden(hiddenMap) {
      const elementsMap = {
        'ui1': ui1,
        'ui2': ui2,
        'postPromptUi': postPromptUi,
      };

      await expect(hiddenMap.length).to.equal(elementsMap.length);
      const elementIds = Object.keys(elementsMap);

      for (let i = 0; i < elementIds.length; i++) {
        const elementId = elementIds[i];
        const element = elementsMap[elementId];
        const shouldBeHidden = hiddenMap[elementId];

        if (shouldBeHidden) {
          // Should be hidden
          await expect(controller.getElementProperty(element, 'hidden')).to.be
            .true;
        } else {
          // Should not be hidden
          await expect(controller.getElementProperty(element, 'hidden')).to.be
            .false;
        }
      }
    }

    it('should work with client side decision', async () => {
      const currentUrl = await controller.getCurrentUrl();

      // Verify no local storage decision
      await findElements();
      await verifyElementsBuilt({
        'tillResponded': false,
        'accepted': false,
        'autoReject': true,
        'defaultBlock': false,
        'notBlocked': true,
        'twitter': false,
      });
      await verifyPromptsHidden({
        'ui1': true,
        'ui2': false,
        'postPromptUi': true,
      });

      // Client-side decision
      const acceptButton = await controller.findElement('#accept');
      await controller.click(acceptButton);

      await verifyElementsBuilt({
        'tillResponded': true,
        'accepted': true,
        'autoReject': true,
        'defaultBlock': true,
        'notBlocked': true,
        'twitter': true,
      });
      await verifyPromptsHidden({
        'ui1': true,
        'ui2': true,
        'postPromptUi': false,
      });

      // Navigate away to random page
      await controller.navigateTo('http://localhost:8000/');
      // Visit website again
      await controller.navigateTo(currentUrl);

      // Verify all elements are still built
      await findElements();
      await verifyElementsBuilt({
        'tillResponded': true,
        'accepted': true,
        'autoReject': true,
        'defaultBlock': true,
        'notBlocked': true,
        'twitter': true,
      });
      await verifyPromptsHidden({
        'ui1': true,
        'ui2': true,
        'postPromptUi': false,
      });

      // Check the analytics request consentState
      const req = await requestBank.withdraw('tracking');
      await expect(req.url).to.match(/consentState=sufficient/);
    });
  }
);
