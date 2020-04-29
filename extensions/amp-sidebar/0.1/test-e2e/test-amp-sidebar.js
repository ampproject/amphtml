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

import {Key} from '../../../../build-system/tasks/e2e/functional-test-controller';

describes.endtoend(
  'amp-sidebar',
  {
    testUrl:
      'http://localhost:8000/test/fixtures/e2e/amp-sidebar/amp-sidebar.html',
    environments: ['single', 'viewer-demo'],
  },
  async (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should render correctly', async () => {
      const sidebar = await controller.findElement('#sidebar');

      await expect(controller.getElementProperty(sidebar, 'hidden')).to.be.true;
      const image = await controller.findElement('#image');
      await expect(
        controller.getElementProperty(image, 'clientWidth')
      ).to.equal(0);
    });

    it('should open the sidebar', async () => {
      const open = await controller.findElement('#open');
      await controller.click(open);

      const sidebar = await controller.findElement('#sidebar');
      await expect(controller.getElementProperty(sidebar, 'hidden')).to.be
        .false;

      await expect(controller.getElementRect(sidebar)).to.include({
        width: 300,
        left: 0,
      });

      const backingImage = await controller.findElement('#image img');
      await expect(
        controller.getElementProperty(backingImage, 'clientWidth')
      ).to.equal(300);
    });

    it('should close the sidebar on button click', async () => {
      const open = await controller.findElement('#open');
      await controller.click(open);

      const sidebar = await controller.findElement('#sidebar');
      await expect(controller.getElementProperty(sidebar, 'hidden')).to.be
        .false;

      // Wait for the button to become visible
      await expect(controller.getElementRect(sidebar)).to.include({
        width: 300,
        right: 300,
      });

      const close = await controller.findElement('#close');
      await controller.click(close);
      await expect(controller.getElementProperty(sidebar, 'hidden')).to.be.true;
    });

    it('should close the sidebar on esc', async () => {
      const open = await controller.findElement('#open');
      await controller.click(open);

      const sidebar = await controller.findElement('#sidebar');
      await expect(controller.getElementProperty(sidebar, 'hidden')).to.be
        .false;

      await controller.type(null, Key.Escape);

      await expect(controller.getElementProperty(sidebar, 'hidden')).to.be.true;
    });

    it('should close the sidebar on click outside', async () => {
      const open = await controller.findElement('#open');
      await controller.click(open);

      const sidebar = await controller.findElement('#sidebar');
      await expect(controller.getElementProperty(sidebar, 'hidden')).to.be
        .false;

      const mask = await controller.findElement('.i-amphtml-sidebar-mask');
      await controller.click(mask);

      await expect(controller.getElementProperty(sidebar, 'hidden')).to.be.true;
    });
  }
);
