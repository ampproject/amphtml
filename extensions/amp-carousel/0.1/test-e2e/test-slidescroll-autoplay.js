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
  'AMP carousel 0.1 slideChange on type="slide" with autoplay',
  {
    testUrl:
      'http://localhost:8000/test/fixtures/e2e/amp-carousel/0.1/slidescroll-autoplay.html',
    environments: ['single'],
  },
  async function(env) {
    let controller, events;
    /**
     * Attach an event listener to page to capture a custom event.
     * @param {string} type Event name.
     * @return {!Promise}
     */
    function listenFor(type) {
      return controller.driver.executeScript(
        (type, events) =>
          document.addEventListener(type, e => {
            events.push(e);
          }),
        type,
        events
      );
    }

    beforeEach(async () => {
      controller = env.controller;
      events = [];
    });

    it('should fire low trust event for autoplay advance', async () => {
      await listenFor('slideChange');
      const slide1 = await controller.findElement('#slide1');
      const slide2 = await controller.findElement('#slide2');
      const slide3 = await controller.findElement('#slide3');

      await expect(
        controller.getElementAttribute(slide1, 'aria-hidden')
      ).to.equal('false'); // initial slide
      await expect(events).to.have.length(0);

      await expect(
        controller.getElementAttribute(slide2, 'aria-hidden')
      ).to.equal('false'); // autoplay advanced
      await expect(events).to.have.length(1);

      await expect(
        controller.getElementAttribute(slide3, 'aria-hidden')
      ).to.equal('false'); // autoplay advanced
      await expect(events).to.have.length(2);
    });
  }
);
