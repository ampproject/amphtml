import {sleep} from '#testing/helpers';

const VIEWPORT = {
  HEIGHT: 768,
  WIDTH: 1024,
};

describes.endtoend(
  'story player navigation',
  {
    fixture: 'amp-story-player/navigation.amp.html',
    initialRect: {width: VIEWPORT.WIDTH, height: VIEWPORT.HEIGHT},
    environments: ['single'],
  },
  (env) => {
    let player;
    let controller;

    beforeEach(async () => {
      controller = env.controller;

      await sleep(500);

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

      await sleep(800);
      await expect(isVideoPaused).to.eql(false);
    });

    it('navigating to next story pauses the previous one', async () => {
      // Navigate to next story.
      await controller.click(player);

      await sleep(500);

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

      await sleep(800);
      await expect(isVideoPaused).to.eql(true);
    });
  }
);
