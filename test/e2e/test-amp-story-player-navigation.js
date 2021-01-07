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

const VIEWPORT = {
  HEIGHT: 768,
  WIDTH: 1024,
};

/**
 * @param {number} ms
 * @return {!Promise}
 */
function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describes.endtoend(
  'story player navigation',
  {
    testUrl:
      'http://localhost:8000/test/fixtures/e2e/amp-story-player/navigation.html',
    initialRect: {width: VIEWPORT.WIDTH, height: VIEWPORT.HEIGHT},
    environments: ['single'],
  },
  (env) => {
    let player;
    let controller;

    beforeEach(async () => {
      controller = env.controller;

      await timeout(500);

      player = await controller.findElement(
        'amp-story-player.i-amphtml-story-player-loaded'
      );
      await expect(player);
    });

    it('first story should be playing video', async () => {
      const shadowHost = await controller.findElement(
        'div.i-amphtml-story-player-shadow-root-intermediary'
      );

      await controller.switchToShadowRoot(shadowHost);

      const iframe = await controller.findElement('iframe.story-player-iframe');

      await controller.switchToShadowRoot(iframe);
      await controller.switchToFrame(iframe);

      const firstStoryVideo = await controller.findElement('#story1 video');
      const isVideoPaused = await controller.getElementProperty(
        firstStoryVideo,
        'paused'
      );

      await timeout(500);
      await expect(isVideoPaused).to.eql(false);
    });

    it('navigating to next story pauses the previous one', async () => {
      // Navigate to next story.
      await controller.click(player);

      await timeout(500);

      const shadowHost = await controller.findElement(
        'div.i-amphtml-story-player-shadow-root-intermediary'
      );
      await controller.switchToShadowRoot(shadowHost);

      const iframe = await controller.findElement('iframe.story-player-iframe');
      await controller.switchToShadowRoot(iframe);
      await controller.switchToFrame(iframe);

      const firstStoryVideo = await controller.findElement('#story1 video');
      const isVideoPaused = await controller.getElementProperty(
        firstStoryVideo,
        'paused'
      );

      await timeout(500);
      await expect(isVideoPaused).to.eql(true);
    });
  }
);
