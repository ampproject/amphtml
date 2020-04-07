/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  'amp-script e2e',
  {
    testUrl:
      'http://localhost:8000/test/fixtures/e2e/amp-script/basic.amp.html',
    initialRect: {width: 600, height: 600},
    environments: ['single'],
    browsers: ['chrome', 'safari'],
  },
  async (env) => {
    let controller;

    beforeEach(async () => {
      controller = env.controller;
    });

    it('should support local scripts', async () => {
      const element = await controller.findElement('amp-script#local');
      await expect(controller.getElementAttribute(element, 'class')).to.contain(
        'i-amphtml-hydrated'
      );
      await expect(controller.getElementText(element)).to.equal('Hello World!');
    });

    it('should support remote scripts', async () => {
      const element = await controller.findElement('amp-script#remote');
      await expect(controller.getElementAttribute(element, 'class')).to.contain(
        'i-amphtml-hydrated'
      );

      const button = await controller.findElement('#remote button');
      controller.click(button);

      const h1 = await controller.findElement('#remote h1');
      await expect(controller.getElementText(h1)).to.equal('Hello World!');
    });

    // In layout=responsive|fluid, amp-script creates a fill-content container
    // div and reparents children to it. This ensures that the element sizing
    // is respected.
    it('should respect aspect ratio in layout=responsive', async () => {
      const element = await controller.findElement(
        'amp-script[layout="responsive"]'
      );
      await expect(controller.getElementAttribute(element, 'class')).to.contain(
        'i-amphtml-layout'
      );

      const width = await controller.getElementAttribute(element, 'width');
      const height = await controller.getElementAttribute(element, 'height');
      const targetRatio = Number(width) / Number(height);

      const rect = await controller.getElementRect(element);
      const realRatio = rect.width / rect.height;

      await expect(realRatio).to.equal(targetRatio);
    });

    // In layout=container, amp-script requires mutations to be backed by
    // user gestures. This ensures that this requirement is also enforced
    // on load AKA "hydration".
    it('should not mutate on load in layout=container', async () => {
      const element = await controller.findElement('amp-script#mutate');
      await expect(controller.getElementAttribute(element, 'class')).to.contain(
        'i-amphtml-hydrated'
      );

      // `document.body.textContent = lipsum;` should be disallowed.
      await expect(controller.getElementText(element)).to.contain(
        'Append some very long text'
      );

      // However, gesture-backed (e.g. click) mutations are OK.
      const button = await controller.findElement('#mutate button');
      controller.click(button);

      const h1 = await controller.findElement('#mutate h1');
      await expect(controller.getElementText(h1)).to.contain('Lorem Ipsum');
    });
  }
);
