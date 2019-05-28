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
  'service worker',
  {
    testUrl: 'http://localhost:8000/test/fixtures/e2e/testsw/sw.html',
  },
  async env => {
    let controller;

    beforeEach(async () => {
      controller = env.controller;
    });

    describe('request logging', () => {
      it('should log requests from images loading', async () => {
        const scroll = await controller.getDocumentElement();
        await controller.scroll(scroll, {top: 10000});

        await expect(controller.getNetworkRequest('sample.jpg?wow')).to.include(
          {
            url: 'http://localhost:8000/examples/img/sample.jpg?wow',
          }
        );
      });

      it('should log requests that post', async () => {
        const submit = await controller.findElement('[type="submit"]');
        await controller.click(submit);

        await expect(controller.getNetworkRequest('echo-json')).to.include({
          url:
            'http://localhost:8000/form/echo-json/post?__amp_source_origin=http%3A%2F%2Flocalhost%3A8000',
        });
      });
    });
  }
);
