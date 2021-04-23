/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

    /**
     * Tests for first load
     */

    it('when loading the page with good connection, the best quality source is played', async () => {
      const video1El = await controller.findElement('#video1 video');
      await expect(
        await controller.getElementProperty(video1El, 'currentSrc')
      ).contains('#high');
    });

    it("when on the first page, a further video doesn't load", async () => {
      const video4El = await controller.findElement('#video4 video');
      await expect(
        await controller.getElementProperty(video4El, 'currentSrc')
      ).to.equal('');
    });

    /**
     * Tests for downgrades on active video
     */

    it('when a video buffers, the video changes to a lower quality source', async () => {
      await forceEventOnVideo(VIDEO_EVENTS.UNLOAD, 1);

      const video1El = await controller.findElement('#video1 video');

      await forceEventOnVideo(VIDEO_EVENTS.DOWNGRADE, 1);

      await expect(
        await controller.getElementProperty(video1El, 'currentSrc')
      ).contains('#med');
    });

    it('when a video buffers, the low quality source starts playing at the same place the previous source was stopped at', async () => {
      const video1El = await controller.findElement('#video1 video');

      await sleep(100);

      const currentTime = await controller.getElementProperty(
        video1El,
        'currentTime'
      );

      await forceEventOnVideo(VIDEO_EVENTS.UNLOAD, 1);
      await forceEventOnVideo(VIDEO_EVENTS.DOWNGRADE, 1);

      await expect(
        await controller.getElementProperty(video1El, 'currentTime')
      ).to.be.gte(currentTime);
    });

    it("when a video buffers many times, it doesn't keep reloading", async () => {
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

    /**
     * Tests for downgrades on inactive videos
     */

    it('when a video buffers, other videos that are not already loaded lower the quality source', async () => {
      await forceEventOnVideo(VIDEO_EVENTS.UNLOAD, 2);
      await forceEventOnVideo(VIDEO_EVENTS.DOWNGRADE, 1);
      await controller.click(story);
      await controller.findElement('amp-story-page#page-2[active]');

      const video2El = await controller.findElement('#video2 video');

      await expect(
        await controller.getElementProperty(video2El, 'currentSrc')
      ).contains('#med');
    });

    it("when a video buffers, other videos that are already loaded don't lower the quality source", async () => {
      await forceEventOnVideo(VIDEO_EVENTS.LOAD, 2);
      await forceEventOnVideo(VIDEO_EVENTS.DOWNGRADE, 1);

      const video4El = await controller.findElement(
        '#video2 video.i-amphtml-pool-video'
      );

      await expect(
        await controller.getElementProperty(video4El, 'currentSrc')
      ).contains('#high');
    });

    /**
     * Tests on source generation
     */

    it('when a video contains a proxy url, it loads the cached sources', async () => {
      await controller.click(story);
      await controller.click(story);

      await controller.findElement('amp-story-page#page-3[active]');

      const video4SourceEl = await controller.findElement(
        '#video3 video.i-amphtml-pool-media source'
      );

      await expect(
        await controller.getElementProperty(video4SourceEl, 'src')
      ).contains('amp-dev.cdn.ampproject.org');
    });

    /**
     * Tests on navigation
     */

    it('when advancing to a further page, the video on that page loads', async () => {
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

    it('when the connection drops, advancing to a further page loads a low quality source on the further video', async () => {
      await forceEventOnVideo(VIDEO_EVENTS.DOWNGRADE, 1);
      await forceEventOnVideo(VIDEO_EVENTS.UNLOAD, 4);
      await controller.click(story);
      await controller.click(story);
      await controller.click(story);

      await controller.findElement('amp-story-page#page-4[active]');

      await sleep(100);

      const video4El = await controller.findElement(
        '#video4 video.i-amphtml-pool-video'
      );

      await expect(
        await controller.getElementProperty(video4El, 'currentSrc')
      ).contains('#med');
    });

    function sleep(ms) {
      return new Promise((res) => setTimeout(res, ms));
    }

    async function forceEventOnVideo(videoEvent, videoId, delayMs = 50) {
      await controller.type(debugField, videoId + videoEvent);
      await sleep(delayMs);
    }
  }
);
