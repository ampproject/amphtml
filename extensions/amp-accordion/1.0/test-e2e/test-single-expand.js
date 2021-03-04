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
    fixture: 'amp-accordion/single-expand.html',
    experiments: ['bento-accordion'],
    environments: ['single', 'viewer-demo'],
  },
  async (env) => {
    let controller;

    beforeEach(async () => {
      controller = env.controller;
    });

    it('expands only one section at a time for "expand-single-section" accordion', async () => {
      const header1 = await controller.findElement('#header2-1');
      const header2 = await controller.findElement('#header2-2');
      const content1 = await controller.findElement('#content2-1');
      const content2 = await controller.findElement('#content2-2');

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
