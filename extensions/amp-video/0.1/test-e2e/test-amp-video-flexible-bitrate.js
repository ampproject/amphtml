import {afterRenderPromise} from '#testing/helpers';

const VIEWPORT = {
  HEIGHT: 768,
  WIDTH: 1024,
};

const VIDEO_EVENTS = {
  DOWNGRADE: 'd',
  LOAD: 'l',
  UNLOAD: 'u',
};

describes.endtoend(
  'amp-video flexible bitrate',
  {
    fixture: 'amp-video/videos-cdn.html',
    environments: ['single'],
    experiments: ['flexible-bitrate'],
    initialRect: {width: VIEWPORT.WIDTH, height: VIEWPORT.HEIGHT},
  },
  (env) => {
    let controller;
    let story;
    let debugField;

    beforeEach(async () => {
      controller = env.controller;

      story = await controller.findElement('amp-story.i-amphtml-story-loaded');
      await controller.findElement('amp-story-page#page-1[active]');

      debugField = await controller.findElement('input#flexible-bitrate-debug');
    });

    describe('first load', () => {
      it('plays the best quality when loading the page with good connection', async () => {
        const video1El = await controller.findElement('#video1 video');
        await expect(
          await controller.getElementProperty(video1El, 'currentSrc')
        ).contains('#high');
      });

      it('does not load a video far away when on the first page', async () => {
        const video4El = await controller.findElement('#video4 video');
        await expect(
          await controller.getElementProperty(video4El, 'currentSrc')
        ).to.equal('');
      });
    });

    describe('downgrades on active videos', () => {
      it('changes the video to a lower quality when it buffers', async () => {
        await forceEventOnVideo(VIDEO_EVENTS.UNLOAD, 1);
        await forceEventOnVideo(VIDEO_EVENTS.DOWNGRADE, 1);

        const video1El = await controller.findElement('#video1 video');

        await expect(
          await controller.getElementProperty(video1El, 'currentSrc')
        ).contains('#med');
      });

      it('keeps playing the video at the same time when a video downgrades', async () => {
        await afterRenderPromise();

        await forceEventOnVideo(VIDEO_EVENTS.UNLOAD, 1);
        await forceEventOnVideo(VIDEO_EVENTS.DOWNGRADE, 1);

        const video1El = await controller.findElement('#video1 video');

        const currentTime = await controller.getElementProperty(
          video1El,
          'currentTime'
        );

        await expect(
          await controller.getElementProperty(video1El, 'currentTime')
        ).to.be.gte(currentTime);
      });

      it('does not keep reloading the video when a video buffers multiple times', async () => {
        await forceEventOnVideo(VIDEO_EVENTS.UNLOAD, 1);
        await forceEventOnVideo(VIDEO_EVENTS.DOWNGRADE, 1);
        await forceEventOnVideo(VIDEO_EVENTS.DOWNGRADE, 1);
        await forceEventOnVideo(VIDEO_EVENTS.DOWNGRADE, 1);

        const video1El = await controller.findElement(
          '#video1 video.i-amphtml-pool-video'
        );

        await expect(
          await controller.getElementProperty(video1El, 'currentSrc')
        ).contains('#low');
        await expect(await controller.getElementProperty(video1El, 'paused')).is
          .false;
      });
    });

    describe('downgrades on inactive videos', () => {
      it('does not load videos out of range when a video buffers', async () => {
        await forceEventOnVideo(VIDEO_EVENTS.DOWNGRADE, 1);

        const video4El = await controller.findElement('#video4 video');

        // If currentSrc is empty, video is not loaded.
        await expect(
          await controller.getElementProperty(video4El, 'currentSrc')
        ).equal('');
      });

      it('lowers the quality on close videos that are not already loaded when a video buffers', async () => {
        await forceEventOnVideo(VIDEO_EVENTS.UNLOAD, 2);
        await forceEventOnVideo(VIDEO_EVENTS.DOWNGRADE, 1);

        const video2El = await controller.findElement('#video2 video');

        // Flake here: result is sometimes #low4 instead of #med
        await expect(
          await controller.getElementProperty(video2El, 'currentSrc')
        ).contains('#med');
      });

      it('does not lower the quality on close videos that are already loaded when a video buffers', async () => {
        await forceEventOnVideo(VIDEO_EVENTS.LOAD, 2);
        await forceEventOnVideo(VIDEO_EVENTS.DOWNGRADE, 1);

        const video4El = await controller.findElement(
          '#video2 video.i-amphtml-pool-video'
        );

        await expect(
          await controller.getElementProperty(video4El, 'currentSrc')
        ).contains('#high');
      });
    });

    describe('source generation', () => {
      it('configures the 3 qualities for CDN sources when a video contains a CDN url source element', async () => {
        await controller.click(story);
        await controller.click(story);

        await controller.findElement('amp-story-page#page-3[active]');

        const sources = await controller.findElements(
          '#video3 video.i-amphtml-pool-media source'
        );

        await testElementForSrcAndBitrate(
          controller,
          sources[0],
          '?amp_video_quality=high',
          '2000'
        );
        await testElementForSrcAndBitrate(
          controller,
          sources[1],
          '?amp_video_quality=medium',
          '720'
        );
        await testElementForSrcAndBitrate(
          controller,
          sources[2],
          '?amp_video_quality=low',
          '400'
        );
      });

      it('configures the 3 qualities for CDN sources when a video contains a CDN url src attribute', async () => {
        await controller.click(story);
        await controller.click(story);
        await controller.click(story);
        await controller.click(story);
        await controller.click(story);

        await controller.findElement('amp-story-page#page-6[active]');

        const sources = await controller.findElements(
          '#video6 video.i-amphtml-pool-media source'
        );

        await testElementForSrcAndBitrate(
          controller,
          sources[0],
          '?amp_video_quality=high',
          '2000'
        );
        await testElementForSrcAndBitrate(
          controller,
          sources[1],
          '?amp_video_quality=medium',
          '720'
        );
        await testElementForSrcAndBitrate(
          controller,
          sources[2],
          '?amp_video_quality=low',
          '400'
        );
      });

      it('sends a network request to fetch cached sources when video is configured with the cache attribute', async () => {
        await controller.click(story);
        await controller.click(story);
        await controller.click(story);
        await controller.click(story);

        await controller.findElement('amp-story-page#page-5[active]');

        await controller.findElement(
          '#video5 video.i-amphtml-replaced-content'
        );

        await expect(
          'https://amp-dev.cdn.ampproject.org/mbv/s/amp.dev/static/samples/video/tokyo.mp4?amp_video_host_url=https%3A%2F%2Famp.dev%2F&amp_video_require_acao_header=1&__amp_source_origin=http%3A%2F%2Flocalhost%3A8000'
        ).to.have.been.sent;
      });
    });

    describe('navigation', () => {
      it('loads a video on a far page when navigating to the page', async () => {
        await controller.click(story);
        await controller.click(story);
        await controller.click(story);

        await controller.findElement('amp-story-page#page-4[active]');

        const video4El = await controller.findElement(
          '#video4 video.i-amphtml-pool-media'
        );

        await expect(
          await controller.getElementProperty(video4El, 'currentSrc')
        ).contains('#high');
      });

      it('loads a low quality source on a far video when the connection drops and the user advances to that page', async () => {
        await forceEventOnVideo(VIDEO_EVENTS.DOWNGRADE, 1);
        await forceEventOnVideo(VIDEO_EVENTS.UNLOAD, 4);
        await controller.click(story);
        await controller.click(story);
        await controller.click(story);

        await controller.findElement('amp-story-page#page-4[active]');

        await afterRenderPromise();

        const video4El = await controller.findElement(
          '#video4 video.i-amphtml-pool-video'
        );

        await expect(
          await controller.getElementProperty(video4El, 'currentSrc')
        ).contains('#med');
      });
    });

    async function forceEventOnVideo(videoEvent, videoId) {
      await controller.type(debugField, videoId + videoEvent);
      await afterRenderPromise();
    }
  }
);

/**
 * Tests that the element contains the {srcContains} in the [src], and the [data-bitrate] is {bitrateEquals}
 */
async function testElementForSrcAndBitrate(
  controller,
  element,
  srcContains,
  bitrateEquals
) {
  await expect(await controller.getElementProperty(element, 'src')).contains(
    srcContains
  );
  await expect(
    await controller.getElementAttribute(element, 'data-bitrate')
  ).equals(bitrateEquals);
}
