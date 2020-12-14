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
  'layoutCallback depends on updated viewport size after documentHeight change.',
  {
    testUrl:
      'http://localhost:8000/test/fixtures/e2e/amp4email/viewport-size-race.html',
    environments: ['email-demo'],
  },
  async (env) => {
    it('Should call amp-img layoutCallback', async () => {
      const {controller} = env;
      const imgEl = await controller.findElement('img');
      await expect(imgEl).ok;
    });
  }
);

describes.endtoend(
  'layoutCallback depending on element remeasurement after documentHeight change.',
  {
    testUrl:
      'http://localhost:8000/test/fixtures/e2e/amp4email/element-size-race.html',
    environments: ['email-demo'],
  },
  async (env) => {
    it('Should call amp-list layoutCallback', async () => {
      const {controller} = env;
      const ampListChild = await controller.findElement('.fruit');
      await expect(ampListChild).ok;
    });
  }
);
