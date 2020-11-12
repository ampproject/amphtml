/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
  'amp-selector',
  {
    testUrl:
      'http://localhost:8000/test/fixtures/e2e/amp-selector/1.0/amp-selector-tabs.html',
    environments: ['single', 'viewer-demo'],
    experiments: ['amp-selector-bento'],
  },
  async (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should render correctly', async () => {
      const selector = await controller.findElement('#tabs');

      await expect(controller.getElementAttribute(selector, 'role')).to.equal(
        'tablist'
      );

      const firstTab = await controller.findElement('#tab1Selector');
      await expect(controller.getElementAttribute(firstTab, 'selected')).to
        .exist;

      const image = await controller.findElement('#firstImage');
      await expect(
        controller.getElementProperty(image, 'clientWidth')
      ).to.be.greaterThan(0);

      const internalImg = await controller.findElement('#firstImage img');
      await expect(internalImg).to.exist;
    });

    it('should switch tabs on button click', async () => {
      const secondTab = await controller.findElement('#tab2Selector');
      await expect(controller.getElementAttribute(secondTab, 'selected')).to.not
        .exist;

      await controller.click(secondTab);
      await expect(controller.getElementAttribute(secondTab, 'selected')).to
        .exist;

      const image = await controller.findElement('#secondImage');
      await expect(
        controller.getElementProperty(image, 'clientWidth')
      ).to.be.greaterThan(0);

      const internalImg = await controller.findElement('#secondImage img');
      await expect(internalImg).to.exist;
    });

    it('should switch tabs on toggle ', async () => {
      const thirdTabToggle = await controller.findElement('#tab3Toggle');
      const thirdTab = await controller.findElement('#tab3Selector');
      await expect(controller.getElementAttribute(thirdTab, 'selected')).to.not
        .exist;

      await controller.click(thirdTabToggle);
      await expect(controller.getElementAttribute(thirdTab, 'selected')).to
        .exist;

      const image = await controller.findElement('#thirdImage');
      await expect(
        controller.getElementProperty(image, 'clientWidth')
      ).to.be.greaterThan(0);

      const internalImg = await controller.findElement('#thirdImage img');
      await expect(internalImg).to.exist;
    });
  }
);
