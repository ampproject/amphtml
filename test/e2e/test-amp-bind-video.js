/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
  'amp-bind',
  {
    testUrl: 'http://localhost:8000/test/fixtures/e2e/amp-bind/bind-video.html',
  },
  async env => {
    let controller;

    beforeEach(async () => {
      controller = env.controller;
    });

    describe('with <amp-video>', () => {
      it('should support binding to src', async () => {
        const button = await controller.findElement('#changeVidSrcButton');
        const video = await controller.findElement('#video');

        await expect(controller.getElementAttribute(video, 'src')).to.equal(
          'https://www.google.com/unbound.webm'
        );

        await controller.click(button);
        await expect(controller.getElementAttribute(video, 'src')).to.equal(
          'https://www.google.com/bound.webm'
        );
      });

      it('should NOT change src when new value is a blocked URL', async () => {
        const button = await controller.findElement('#disallowedVidUrlButton');
        const video = await controller.findElement('#video');

        await expect(controller.getElementAttribute(video, 'src')).to.equal(
          'https://www.google.com/unbound.webm'
        );

        await controller.click(button);
        await expect(controller.getElementAttribute(video, 'src')).to.equal(
          'https://www.google.com/unbound.webm'
        );
      });

      it('should NOT change src when new value uses an invalid protocol', async () => {
        const button = await controller.findElement('#httpVidSrcButton');
        const video = await controller.findElement('#video');

        await expect(controller.getElementAttribute(video, 'src')).to.equal(
          'https://www.google.com/unbound.webm'
        );

        await controller.click(button);
        // Only HTTPS is allowed
        await expect(controller.getElementAttribute(video, 'src')).to.equal(
          'https://www.google.com/unbound.webm'
        );
      });

      it('should change alt when the alt attribute binding changes', async () => {
        const button = await controller.findElement('#changeVidAltButton');
        const video = await controller.findElement('#video');

        await expect(controller.getElementAttribute(video, 'alt')).to.equal(
          'unbound'
        );

        await controller.click(button);
        await expect(controller.getElementAttribute(video, 'alt')).to.equal(
          'hello world'
        );
      });

      it('should show/hide vid controls when the control binding changes', async () => {
        const showButton = await controller.findElement(
          '#showVidControlsButton'
        );
        const hideButton = await controller.findElement(
          '#hideVidControlsButton'
        );
        const video = await controller.findElement('#video');
        await expect(controller.getElementAttribute(video, 'controls')).to.be
          .null;

        await controller.click(showButton);
        await expect(controller.getElementAttribute(video, 'controls')).to.not
          .be.null;

        await controller.click(hideButton);
        await expect(controller.getElementAttribute(video, 'controls')).to.be
          .null;
      });
    });
  }
);
