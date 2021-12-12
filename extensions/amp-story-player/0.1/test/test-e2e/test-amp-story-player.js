const VIEWPORT = {
  HEIGHT: 768,
  WIDTH: 1024,
};

describes.endtoend(
  'player prerendering',
  {
    fixture: 'amp-story-player/basic.amp.html',
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

    it('loads and displays first story on page load when player is visible in viewport', async () => {
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
