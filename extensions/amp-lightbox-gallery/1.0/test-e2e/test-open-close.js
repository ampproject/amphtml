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

const pageWidth = 800;
const pageHeight = 600;

describes.endtoend(
  'AMP Lightbox Gallery Open/Close',
  {
    fixture: 'amp-lightbox-gallery/open-close.amp.html',
    initialRect: {width: pageWidth, height: pageHeight},
    environments: ['single'],
  },
  async (env) => {
    let controller;

    beforeEach(async () => {
      controller = env.controller;
    });

    it('should open/close lightbox', async () => {
      // First open the gallery.
      const firstAmpImg = await controller.findElement('amp-img');
      await controller.click(firstAmpImg);

      // Verify it opened.
      await controller.findElement('amp-lightbox-gallery[open]');
      const closeButton = await controller.findElement(
        'svg[aria-label="Close the lightbox"]'
      );

      // Now close the gallery via button click and wait for it to close.
      await controller.click(closeButton);
      await controller.findElement('amp-lightbox-gallery[hidden]');
    });
  }
);
