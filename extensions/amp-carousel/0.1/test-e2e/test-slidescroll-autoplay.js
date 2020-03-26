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
    let controller;

    beforeEach(async () => {
      controller = env.controller;
    });

    it('should fire low trust event for autoplay advance', async () => {
      for (let i = 0; i < 3; i++) {
        const actionTrust = await controller.evaluate(() => {
          return new Promise(resolve => {
            document.addEventListener('slideChange', function forwardEvent(e) {
              // Listen once
              document.removeEventListener('slideChange', forwardEvent);
              resolve(e.data.actionTrust);
            });
          });
        });
        await expect(actionTrust).to.equal(1); // ActionTrust.LOW
      }
    });

    it('should fire high trust event on user interaction', async () => {
      const actionTrust = await controller.evaluate(() => {
        return new Promise(resolve => {
          document.addEventListener('slideChange', function forwardEvent(e) {
            // Listen once
            document.removeEventListener('slideChange', forwardEvent);
            resolve(e.data.actionTrust);
          });
          document.querySelector('.amp-carousel-button-next').click();
        });
      });
      await expect(actionTrust).to.equal(3); // ActionTrust.HIGH
    });

    it('should fire high trust event on user interaction through amp-bind', async () => {
      const actionTrust = await controller.evaluate(() => {
        return new Promise(resolve => {
          document.addEventListener('slideChange', function forwardEvent(e) {
            // Listen once
            document.removeEventListener('slideChange', forwardEvent);
            resolve(e.data.actionTrust);
          });
          document.querySelector('#go-to-last').click();
        });
      });
      await expect(actionTrust).to.equal(3); // ActionTrust.HIGH
    });
  }
);
