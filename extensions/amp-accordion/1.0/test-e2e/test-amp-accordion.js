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
  'amp-accordion',
  {
    version: '1.0',
    fixture: 'amp-accordion/amp-accordion.html',
    experiments: ['bento-accordion'],
    environments: ['single', 'viewer-demo'],
  },
  async (env) => {
    let controller;

    let header1;
    let header2;

    let content1;
    let content2;
    let content3;

    let button1;
    let button2;

    beforeEach(async () => {
      controller = env.controller;

      header1 = await controller.findElement('#header1');
      header2 = await controller.findElement('#header2');

      content1 = await controller.findElement('#content1');
      content2 = await controller.findElement('#content2');
      content3 = await controller.findElement('#content3');

      button1 = await controller.findElement('#button1');
      button2 = await controller.findElement('#button2');
    });

    it('expands and collapses when a header section is clicked', async () => {
      // section 1 is not expanded
      await expect(
        controller.getElementProperty(content1, 'clientHeight')
      ).to.equal(0);
      //await checkExpanded(controller, false, false, true);

      await controller.click(header1);

      // section 1 is expanded
      await expect(
        controller.getElementProperty(content1, 'clientHeight')
      ).to.equal(25);

      await controller.click(header1);

      // section 1 is collapsed
      await expect(
        controller.getElementProperty(content1, 'clientHeight')
      ).to.equal(25);
    });

    it('renders section in expanded state when expanded attribute provided', async () => {
      // section 3 should start in expanded state since it has
      // "expanded" attribute
      await expect(
        controller.getElementProperty(content3, 'clientHeight')
      ).to.equal(25);
    });

    it('expands and collapses when buttons are clicked', async () => {
      // section 1 is not expanded
      await expect(
        controller.getElementProperty(content1, 'clientHeight')
      ).to.equal(0);

      // toggle section 1
      await controller.click(button1);

      // section 1 is expanded
      await expect(
        controller.getElementProperty(content1, 'clientHeight')
      ).to.equal(25);

      // collapse all button
      await controller.click(button2);

      // all sections collapsed
      await expect(
        controller.getElementProperty(content1, 'clientHeight')
      ).to.equal(0);
      await expect(
        controller.getElementProperty(content2, 'clientHeight')
      ).to.equal(0);
      await expect(
        controller.getElementProperty(content3, 'clientHeight')
      ).to.equal(0);
    });

    it('expands only one section at a time for "expand-single-section" accordion', async () => {
      header1 = await controller.findElement('#header2-1');
      header2 = await controller.findElement('#header2-2');
      content1 = await controller.findElement('#content2-1');
      content2 = await controller.findElement('#content2-2');

      // section 1 is not expanded
      await expect(
        controller.getElementProperty(content1, 'clientHeight')
      ).to.equal(0);

      // expand section 1
      await controller.click(header1);

      // section 1 is expanded
      await expect(
        controller.getElementProperty(content1, 'clientHeight')
      ).to.equal(25);

      // expand section 2
      await controller.click(header2);

      // section 2 is expanded, section 1 is collapsed
      await expect(
        controller.getElementProperty(content1, 'clientHeight')
      ).to.equal(0);
      await expect(
        controller.getElementProperty(content2, 'clientHeight')
      ).to.equal(25);
    });
  }
);
