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

describes.endtoend(
  'player prerendering',
  {
    testUrl:
      'http://localhost:8000/test/fixtures/e2e/amp-story-player/basic.html',
    initialRect: {width: VIEWPORT.WIDTH, height: VIEWPORT.HEIGHT},
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

    it('loads first story in page load', async () => {
      const shadowHost = await controller.findElement(
        'div.i-amphtml-story-player-shadow-root-intermediary'
      );

      await controller.switchToShadowRoot(shadowHost);

      const iframes = await controller.findElement('iframe');
      const iframeSrc = await controller.getElementAttribute(iframes, 'src');

      await expect(iframeSrc).to.eql(
        'http://localhost:8000/examples/amp-story/ampconf.html#visibilityState=prerender&origin=http%3A%2F%2Flocalhost%3A8000&showStoryUrlInfo=0&storyPlayer=v0&cap=swipe'
      );
    });
  }
);
