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
  'player prerendering',
  {
    fixture: 'amp-story-player/pre-rendering.html',
    initialRect: {width: VIEWPORT.WIDTH, height: VIEWPORT.HEIGHT},
    environments: ['single'],
  },
  (env) => {
    let player;
    let controller;

    beforeEach(async () => {
      controller = env.controller;
      player = await controller.findElement('amp-story-player');
      await expect(player);
    });

    it('when player is not visible in first viewport, it builds the shadow DOM container', async () => {
      const shadowHost = await controller.findElement(
        'div.i-amphtml-story-player-shadow-root-intermediary'
      );

      await expect(shadowHost);
    });

    it('when player is not visible in first viewport, no stories are loaded or prerendered', async () => {
      const shadowHost = await controller.findElement(
        'div.i-amphtml-story-player-shadow-root-intermediary'
      );

      await controller.switchToShadowRoot(shadowHost);
      const iframeContainer = await controller.findElement(
        '.i-amphtml-story-player-main-container'
      );

      const count = await controller.getElementProperty(
        iframeContainer,
        'childElementCount'
      );

      await expect(count).to.eql(0);
    });

    it('when player is not visible in first viewport and on first user scroll, iframe loads first story in prerender', async () => {
      const doc = await controller.getDocumentElement();

      await controller./*OK*/ scrollTo(doc, {top: 1});

      const shadowHost = await controller.findElement(
        'div.i-amphtml-story-player-shadow-root-intermediary'
      );

      await controller.switchToShadowRoot(shadowHost);

      const iframe = await controller.findElement('iframe');
      const iframeSrc = await controller.getElementAttribute(iframe, 'src');

      await expect(iframeSrc).to.eql(
        'http://localhost:8000/examples/amp-story/ampconf.html#visibilityState=prerender&origin=http%3A%2F%2Flocalhost%3A8000&showStoryUrlInfo=0&storyPlayer=v0&cap=swipe'
      );
    });

    it('when player is not visible in first viewport and on first user scroll, only one story in iframe is loaded', async () => {
      const doc = await controller.getDocumentElement();

      await controller./*OK*/ scrollTo(doc, {top: 1});

      const shadowHost = await controller.findElement(
        'div.i-amphtml-story-player-shadow-root-intermediary'
      );

      await controller.switchToShadowRoot(shadowHost);

      const iframes = await controller.findElements('iframe');
      const iframeSrc = await controller.getElementAttribute(iframes[1], 'src');

      await expect(iframeSrc).to.not.exist;
    });

    it('when player becomes visible in viewport, first story starts playing', async () => {
      const doc = await controller.getDocumentElement();
      const playerRect = await controller.getElementRect(player);

      await controller./*OK*/ scrollTo(doc, {top: playerRect.top});
      const shadowHost = await controller.findElement(
        'div.i-amphtml-story-player-shadow-root-intermediary'
      );

      await controller.switchToShadowRoot(shadowHost);

      const iframe = await controller.findElement('iframe.story-player-iframe');

      await controller.switchToShadowRoot(iframe);
      await controller.switchToFrame(iframe);

      const storyEl = await controller.findElement(
        'amp-story.i-amphtml-story-loaded'
      );

      await expect(storyEl).to.exist;
    });

    it('when player becomes visible in viewport and first story finishes loading, second story starts preloading', async () => {
      const doc = await controller.getDocumentElement();
      const playerRect = await controller.getElementRect(player);

      await controller./*OK*/ scrollTo(doc, {top: playerRect.top});
      const shadowHost = await controller.findElement(
        'div.i-amphtml-story-player-shadow-root-intermediary'
      );

      await controller.switchToShadowRoot(shadowHost);

      // Wait for first story iframe to load.
      await timeout(5000);

      const iframes = await controller.findElements(
        'iframe.story-player-iframe'
      );
      const iframeSrc = await controller.getElementAttribute(iframes[1], 'src');

      await expect(iframeSrc).to.eql(
        'http://localhost:8000/examples/amp-story/amp-story-animation.html#visibilityState=prerender&origin=http%3A%2F%2Flocalhost%3A8000&showStoryUrlInfo=0&storyPlayer=v0&cap=swipe'
      );
    });
  }
);
