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
    testUrl:
      'http://localhost:8000/test/fixtures/e2e/amp-bind/' +
      'bind-amp4email.html',
  },
  async env => {
    let controller;

    beforeEach(async () => {
      controller = env.controller;
    });

    // The only difference in amp4email is that URL attributes cannot be bound.
    // TODO(choumx): fails in shadow env when using shadow-v0.js but succeeds when using amp-shadow.js
    describe
      .configure()
      .skipShadowDemo()
      .run('amp4email', () => {
        it('should NOT allow mutation of a[href]', async () => {
          const button = await controller.findElement('#changeHrefButton');
          const a = await controller.findElement('#anchorElement');

          await expect(controller.getElementAttribute(a, 'href')).to.equal(
            'https://foo.com'
          );

          await controller.click(button);
          await expect(controller.getElementAttribute(a, 'href')).to.equal(
            'https://foo.com'
          );
        });

        it('should NOT allow mutation of img[src]', async () => {
          const button = await controller.findElement('#changeImgSrcButton');
          const image = await controller.findElement('#image');

          await expect(controller.getElementAttribute(image, 'src')).to.equal(
            'https://foo.com/foo.jpg'
          );

          await controller.click(button);
          await expect(controller.getElementAttribute(image, 'src')).to.equal(
            'https://foo.com/foo.jpg'
          );
        });
      });
  }
);
