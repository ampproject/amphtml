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
      await controller.findElement(
        '#video1 video.i-amphtml-replaced-content source'
      );

      debugField = await controller.findElement(
        'input[flexible-bitrate-debug]'
      );
    });

    it('should play the highest bitrate video by default', async () => {
      const video1El = await controller.findElement('#video1 video');
      await expect(
        await controller.getElementProperty(video1El, 'currentSrc')
      ).contains('#high');
    });

    it('should play a lower bitrate when video is downgraded', async () => {
      const video1El = await controller.findElement('#video1 video');

      await downgradeCurrentVideo();

      await expect(
        await controller.getElementProperty(video1El, 'currentSrc')
      ).contains('#med');
    });

    it('should keep the currentTime when video is downgraded', async () => {
      const video1El = await controller.findElement('#video1 video');

      // Pass some time so currentTime is not 0
      await sleep(100);

      const currentTime = await controller.getElementProperty(
        video1El,
        'currentTime'
      );

      await downgradeCurrentVideo(50);

      // Check that currentTime in new source is passed from old source.
      await expect(
        await controller.getElementProperty(video1El, 'currentTime')
      ).to.be.gte(currentTime);
    });

    it('should lower quality on other videos when video is downgraded', async () => {
      await downgradeCurrentVideo(50);
      await controller.click(story);
      await controller.findElement('amp-story-page#page-2[active]');

      const video2El = await controller.findElement('#video2 video');

      await expect(
        await controller.getElementProperty(video2El, 'currentSrc')
      ).contains('#med');
    });

    it('should not load video far away on init', async () => {
      const video4El = await controller.findElement('#video4 video');
      await expect(
        await controller.getElementProperty(video4El, 'currentSrc')
      ).to.equal('');
    });

    it('should load video far away when advancing to the last page', async () => {
      sleep(50);
      await controller.click(story);
      await controller.click(story);
      await controller.click(story);

      await controller.findElement('amp-story-page#page-4[active]');

      const video4El = await controller.findElement(
        '#video4 video.i-amphtml-replaced-content'
      );

      await expect(
        await controller.getElementProperty(video4El, 'currentSrc')
      ).contains('#high');
    });

    it('should load lower bitrate video far away when advancing to the last page after a downgrade', async () => {
      await downgradeCurrentVideo();
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

    it('should work when called downgrade past lower bitrate', async () => {
      await downgradeCurrentVideo(100);
      await downgradeCurrentVideo(100);
      await downgradeCurrentVideo(100);

      const video1El = await controller.findElement(
        '#video1 video.i-amphtml-pool-video'
      );

      await expect(
        await controller.getElementProperty(video1El, 'currentSrc')
      ).contains('#low');
    });

    function sleep(ms) {
      return new Promise((res) => setTimeout(res, ms));
    }

    async function downgradeCurrentVideo(delayMs = 50) {
      await controller.type(debugField, 'd');
      await sleep(delayMs);
    }
  }
);
