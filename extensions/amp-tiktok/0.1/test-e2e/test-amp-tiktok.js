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
    'amp-tiktok',
    {
      fixture: 'amp-tiktok/0.1/amp-tiktok.html',
      environments: 'ampdoc-preset',
    },
    (env) => {
      let controller;
      let tiktokElement;
  
      beforeEach(async () => {
        controller = env.controller;
        tiktokElement = await controller.findElement('#tiktok');
      });
  
      describe('tiktok component', function () {
        it.skip(
          'should resize if the tiktok element is smaller than 578px in height ',
          async () => { 
            const iframe = await selectContentIframe('tiktok');
            const initialIframeRect = await controller.getElementRect(iframe);
            const initialHeight = await initialIframeRect.height; 
            // Expect iframe to initialize to default height
            await expect(initialHeight).to.equal(150);
                      
            // 1000ms chosen to allow sufficient time for tiktok to recieve the new height message and resize.
            await new Promise((resolve) => {
              setTimeout(() => {
                resolve();
              }, 8000);
            });

            const updatedIframeRect = await controller.getElementRect(iframe);
            const updatedHeight = await updatedIframeRect.height; 
            // Expect the iframe to be the full height of the tiktok player
            await expect(updatedHeight).to.equal(741);

          }
        );
      });

      async function selectContentIframe(id) {
        return await controller.findElement(`#${id} > iframe`);
      }
    }
  );
