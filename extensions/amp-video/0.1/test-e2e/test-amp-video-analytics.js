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
  'amp-video with video analytics',
  {
    fixture: 'amp-video/analytics-triggers.html',
    environments: ['single'],
  },
  (env) => {
    let controller;

    beforeEach(async () => {
      controller = env.controller;
    });

    function isPaused(elem) {
      return controller.getElementProperty(elem, 'paused');
    }

    function sleep(ms) {
      return new Promise((res) => setTimeout(res, ms));
    }

    it('control buttons should manipulate video box behavior', async () => {
      const videoElem1 = await controller.findElement('#myVideo video');
      const videoElem2 = await controller.findElement('#myVideo2 video');
      const playBtn1 = await controller.findElement('#playBtn1');
      const playBtn2 = await controller.findElement('#playBtn2');

      // Play video 1
      await controller.click(playBtn1);
      await expect(isPaused(videoElem1)).to.be.false;
      await expect(isPaused(videoElem2)).to.be.true;

      // Sleep 5 seconds for the `video-percentage-played` event trigger
      // and the request to be sent
      await sleep(5000);
      await expect(
        'http://localhost:8000/amp4test/request-bank/e2e/deposit/tracking&id=myVideo'
      ).to.have.been.sent;

      // Play video 2
      await controller.click(playBtn2);
      await expect(isPaused(videoElem1)).to.be.true;
      await expect(isPaused(videoElem2)).to.be.false;
      // Sleep 5 seconds for the `video-percentage-played` event trigger
      // and the request to be sent
      await sleep(5000);
      await expect(
        'http://localhost:8000/amp4test/request-bank/e2e/deposit/tracking&id=myVideo2'
      ).to.have.been.sent;
    });
  }
);
