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
  'amp-subscriptions-google',
  {
    testUrl:
      'http://localhost:8000/test/manual/amp-subscriptions-google/swg.amp.html',
    environments: ['single'],
  },
  env => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('Subscription offers should render correctly', async () => {
      const btn = await controller.findElement('#swg_button');
      await controller.click(btn);

      // Check the SwG subscription offer dialog iframe.
      const iframe = await controller.findElement('.swg-dialog');
      await expect(iframe).to.exist;
    });
  }
);
