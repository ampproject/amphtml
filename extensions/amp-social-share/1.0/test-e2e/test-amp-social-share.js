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
  'amp-social-share',
  {
    version: '1.0',
    fixture: 'amp-social-share/amp-social-share.html',
    experiments: ['bento-social-share'],
    environments: ['single', 'viewer-demo'],
  },
  async (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('renders the default social share button', async () => {
      const host = await controller.findElement('#one');

      await controller.switchToShadowRoot(host);
      const button = await controller.findElement('[part=button]');
      await expect(
        controller.getElementProperty(button, 'clientWidth')
      ).to.not.equal(0);
    });

    it('supports rendering of a child element', async () => {
      const host = await controller.findElement('#two');
      const child = await controller.findElement('#twoChild');

      await controller.switchToShadowRoot(host);
      const button = await controller.findElement('[part=button]');
      await expect(
        controller.getElementProperty(button, 'clientWidth')
      ).to.not.equal(0);

      await expect(
        controller.getElementProperty(child, 'clientWidth')
      ).to.not.equal(0);
    });

    it('renders the social share button with custom sizing', async () => {
      const host = await controller.findElement('#three');

      await controller.switchToShadowRoot(host);
      const button = await controller.findElement('[part=button]');
      await expect(
        controller.getElementProperty(button, 'clientWidth')
      ).to.equal(400);

      await expect(
        controller.getElementProperty(button, 'clientHeight')
      ).to.equal(400);
    });

    it('renders the social share button with custom type and endpoint', async () => {
      const host = await controller.findElement('#four');

      await controller.switchToShadowRoot(host);
      const button = await controller.findElement('[part=button]');
      await expect(
        controller.getElementProperty(button, 'clientWidth')
      ).to.not.equal(0);
    });

    it('does not render the social share button with custom type and w/o endpoint', async () => {
      const child = await controller.findElement('#fiveChild');

      await expect(
        controller.getElementProperty(child, 'clientWidth')
      ).to.equal(0);
    });

    it('does not render the social share button w/o type', async () => {
      const child = await controller.findElement('#sixChild');

      await expect(
        controller.getElementProperty(child, 'clientWidth')
      ).to.equal(0);
    });
  }
);
