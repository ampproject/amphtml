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

const viewport = {
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
    initialRect: {width: viewport.WIDTH, height: viewport.HEIGHT},
    environments: ['single'],
  },
  (env) => {
    let player;
    let controller;

    beforeEach(async () => {
      controller = env.controller;
      player = await controller.findElement(
        'amp-story-player.i-amphtml-story-player-loaded'
      );
      await expect(player);
    });

    it('first story is displayed', async () => {
      const shadowHost = await controller.findElement(
        'div.i-amphtml-story-player-shadow-root-intermediary'
      );

      await controller.switchToShadowRoot(shadowHost);

      const iframes = await controller.findElements(
        'iframe.story-player-iframe'
      );

      const transform = await controller.getElementCssValue(
        iframes[0],
        'transform'
      );

      await expect(transform).to.eql(
        'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1)'
      );
    });

    it('clicking on the last page of the story navigates to the next one', async () => {
      await controller.click(player);
      await controller.click(player);
      await controller.click(player);

      const shadowHost = await controller.findElement(
        'div.i-amphtml-story-player-shadow-root-intermediary'
      );

      await controller.switchToShadowRoot(shadowHost);

      const iframes = await controller.findElements(
        'iframe.story-player-iframe'
      );

      const transform = await controller.getElementCssValue(
        iframes[1],
        'transform'
      );

      await expect(transform).to.eql('matrix(1, 0, 0, 1, 360, 0)');
    });
  }
);
