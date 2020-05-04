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
  'documentHeight',
  {
    testUrl:
      'http://localhost:8000/test/fixtures/e2e/amp-carousel/0.1/document-height.html',
    environments: ['viewer-demo'],
  },
  async (env) => {
    let controller;

    beforeEach(async () => {
      controller = env.controller;
    });

    it('should send documentHeight once amp has completed init', async () => {
      const messages = await controller.evaluate(() => {
        // The viewer.html file will launch 7 test viewers, only one of which is the requested url.
        let viewer = window.parent.allViewers.find((v) =>
          v.url.includes('document-height')
        );
        return viewer.receivedMessages;
      });
      const documentHeights = messages.filter(
        (msg) => msg[0] === 'documentHeight'
      );

      // TODO: make not a magic number.
      await expect(documentHeights).deep.equal([
        ['documentHeight', {height: 447.875}],
      ]);
    });
  }
);
