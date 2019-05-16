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
    testUrl: 'http://localhost:8000/test/manual/amp-script/' + 'test1.amp.html',
    experiments: ['amp-script'],
    initialRect: {width: 600, height: 600},
    environments: ['single'],
  },
  async env => {
    let controller;

    beforeEach(async () => {
      controller = env.controller;
    });

    it('should render correctly', async () => {
      const element = await controller.findElement('amp-script');
      await expect(controller.getElementAttribute(element, 'class')).to.contain(
        'i-amphtml-hydrated'
      );

      // Click.
      const button = await controller.findElement('button#simple');
      controller.click(button);

      // Output.
      const h1 = await controller.findElement('h1');
      await expect(controller.getElementText(h1, 'class')).to.equal(
        'Hello World!'
      );
    });
  }
);
