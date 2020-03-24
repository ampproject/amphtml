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

describes.endtoend(
  'AMP carousel 0.1 slideChange on type="slide" with autoplay',
  {
    testUrl:
      'http://localhost:8000/test/fixtures/e2e/amp-carousel/0.1/slidescroll-autoplay.html',
    environments: ['single'],
  },
  async function(env) {
    const ActionTrust = {LOW: 1, HIGH: 3};
    let controller;
    /**
     * Attach an event listener to page to capture a custom event.
     * @param {string} type Event name.
     * @return {!Promise}
     */
    function getActionTrust() {
      return controller.driver.executeScript(() => {
        return new Promise(resolve => {
          document.addEventListener('slideChange', function forwardEvent(e) {
            // Listen once
            document.removeEventListener('slideChange', forwardEvent);
            resolve(e.data.actionTrust);
          });
        });
      });
    }

    beforeEach(async () => {
      controller = env.controller;
    });

    it('should fire low trust event for autoplay advance', async () => {
      await controller.findElement('#event-container');
      for (let i = 0; i < 3; i++) {
        const actionTrust = await getActionTrust();
        await expect(actionTrust).to.equal(ActionTrust.LOW); //  autoplay advanced
      }
    });

    it('should fire high trust event on user interaction', async () => {
      await controller.findElement('#event-container');

      const actionTrustNext = getActionTrust();
      const nextButton = await controller.findElement(
        '.amp-carousel-button-next'
      );
      await controller.click(nextButton);
      await expect(await actionTrustNext).to.equal(ActionTrust.HIGH);

      const actionTrustFirst = getActionTrust();
      const goToFirstSlideButton = await controller.findElement('#go-to-first');
      await controller.click(goToFirstSlideButton);
      await expect(await actionTrustFirst).to.equal(ActionTrust.HIGH);
    });
  }
);
