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
  'amp-auto-lightbox e2e',
  {
    testUrl:
      'http://localhost:8000/test/fixtures/e2e/amp-auto-lightbox/amp-auto-lightbox.html',
    initialRect: {width: 600, height: 600},
    environments: ['single'],
    browsers: ['chrome'],
  },
  async (env) => {
    let controller;

    beforeEach(async () => {
      controller = env.controller;
    });

    it('should insert amp-lightbox-gallery extension script', async () => {
      const element = await controller.findElement(
        'head > script[custom-element=amp-lightbox-gallery]'
      );
      await expect(controller.getElementAttribute(element, 'src')).to.contain(
        'amp-lightbox-gallery'
      );
    });

    it('should visit all images', async () => {
      const elements = await controller.findElements('amp-img');
      for (let i = 0; i < elements.length; i++) {
        await expect(
          controller.getElementAttribute(
            elements[i],
            'i-amphtml-auto-lightbox-visited'
          )
        ).to.equal('');
      }
    });

    it('should auto lightbox images', async () => {
      const elements = await controller.findElements(
        'amp-img[data-should-be-lightboxed]'
      );
      for (let i = 0; i < elements.length; i++) {
        await expect(
          controller.getElementAttribute(elements[i], 'lightbox')
        ).to.contain('i-amphtml-auto-lightbox');
      }
    });

    it('should not auto lightbox images', async () => {
      const elements = await controller.findElements(
        'amp-img:not([data-should-be-lightboxed])'
      );
      for (let i = 0; i < elements.length; i++) {
        await expect(
          controller.getElementAttribute(elements[i], 'lightbox')
        ).to.equal(null);
      }
    });
  }
);
