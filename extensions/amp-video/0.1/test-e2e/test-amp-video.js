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
  'amp-video autoplay with control',
  {
    testUrl: 'http://localhost:8000/test/fixtures/e2e/amp-video/autoplay.html',
    environments: 'amp4ads-preset',
  },
  (env) => {
    let controller;

    beforeEach(async () => {
      controller = env.controller;
    });

    function isPaused(elem) {
      return controller.getElementProperty(elem, 'paused');
    }

    it('control buttons should manipulate video box behavior', async () => {
      const videoElem = await controller.findElement('#myVideo video');
      // Wait until video starts to play
      await expect(isPaused(videoElem)).to.be.false;

      const pauseBtn = await controller.findElement('#pauseBtn');
      await controller.click(pauseBtn);
      await expect(isPaused(videoElem)).to.be.true;

      const playBtn = await controller.findElement('#playBtn');
      await controller.click(playBtn);
      await expect(isPaused(videoElem)).to.be.false;
    });
  }
);
