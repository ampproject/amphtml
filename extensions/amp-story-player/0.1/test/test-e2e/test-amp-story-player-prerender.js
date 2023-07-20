import {sleep} from '#testing/helpers';

const VIEWPORT = {
  HEIGHT: 768,
  WIDTH: 1024,
};

describes.endtoend(
  'player prerendering',
  {
    fixture: 'amp-story-player/pre-rendering.amp.html',
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

      // 2 accounts for previous and next buttons in panel player.
      await expect(count).to.eql(2);
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

    it('when player becomes visible in viewport and first story finishes loading, second story starts preloading', async function () {
      this.timeout(10000);
      const doc = await controller.getDocumentElement();
      const playerRect = await controller.getElementRect(player);

      await controller./*OK*/ scrollTo(doc, {top: playerRect.top});
      const shadowHost = await controller.findElement(
        'div.i-amphtml-story-player-shadow-root-intermediary'
      );

      await controller.switchToShadowRoot(shadowHost);

      // Wait for first story iframe to load.
      await sleep(5000);

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
