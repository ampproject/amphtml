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

describes.endtoend(
  'amp-video flexible bitrate',
  {
    fixture: 'amp-video/videos-cdn.html',
    environments: ['single'],
    experiments: ['flexible-bitrate'],
  },
  (env) => {
    let controller;

    beforeEach(async () => {
      controller = env.controller;

      await expect(controller.findElement('amp-story.i-amphtml-story-loaded'))
        .to.exist;

      await expect(controller.findElement('amp-story-page#page-1[active]')).to
        .exist;
    });

    it('should manage the first video in the story', async () => {
      const videoEl = await controller.findElement('#video1 video');

      await expect(
        controller.findElement('#video1 video.i-amphtml-replaced-content')
      ).to.exist;

      await expect(
        await controller.getElementProperty(videoEl, 'changedSources')
      ).to.not.be.null;
    });

    it('should not manage a video far away in the story', async () => {
      const videoEl = await controller.findElement('#video4 video');

      await expect(
        await controller.getElementProperty(videoEl, 'changedSources')
      ).to.be.null;
    });
  }
);
