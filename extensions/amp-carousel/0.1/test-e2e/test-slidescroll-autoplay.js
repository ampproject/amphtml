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
    const ActionTrust = {LOW: '1', HIGH: '3'};
    let controller;
    /**
     * Attach an event listener to page to capture a custom event.
     * @param {string} type Event name.
     * @return {!Promise}
     */
    function updateDomOn(type) {
      return controller.driver.executeScript(type => {
        document.addEventListener(type, e => {
          const el = document.createElement('div');
          el.classList.add('event');
          el.textContent = e.data.actionTrust;
          document.querySelector('#event-container').appendChild(el);
        });
      }, type);
    }

    beforeEach(async () => {
      controller = env.controller;
    });

    it('should fire low trust event for autoplay advance', async () => {
      await controller.findElement('#event-container');
      await updateDomOn('slideChange');

      const event1 = await controller.findElement('.event:first-child');
      await expect(controller.getElementText(event1)).to.equal(ActionTrust.LOW); //  autoplay advanced

      const event2 = await controller.findElement('.event:nth-child(2)');
      await expect(controller.getElementText(event2)).to.equal(ActionTrust.LOW); //  autoplay advanced

      const event3 = await controller.findElement('.event:nth-child(3)');
      await expect(controller.getElementText(event3)).to.equal(ActionTrust.LOW); //  autoplay advanced
    });

    it('should fire high trust event on user interaction', async () => {
      await controller.findElement('#event-container');
      await updateDomOn('slideChange');

      const nextButton = await controller.findElement(
        '.amp-carousel-button-next'
      );
      await controller.click(nextButton);
      const event1 = await controller.findElement('.event:first-child');
      await expect(controller.getElementText(event1)).to.equal(
        ActionTrust.HIGH
      );

      const goToFirstSlideButton = await controller.findElement('#go-to-first');
      await controller.click(goToFirstSlideButton);
      const event2 = await controller.findElement('.event:nth-child(2)');
      await expect(controller.getElementText(event2)).to.equal(
        ActionTrust.HIGH
      );
    });
  }
);
