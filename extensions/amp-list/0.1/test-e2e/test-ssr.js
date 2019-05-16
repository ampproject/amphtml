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
  'amp-list SSR templates',
  {
    testUrl: 'http://localhost:8000/test/fixtures/e2e/amp-list/amp-list.html',
    environments: ['viewer-demo'],
  },
  async env => {
    let controller;

    beforeEach(async () => {
      controller = env.controller;
    });

    it('should render ssr rendered list', async function() {
      const container = await getListContainer(controller);
      await verifyContainer(controller, container);

      // Verify that all items rendered.
      const listItems = await getListItems(controller);
      await expect(listItems).to.have.length(6);

      // Verify that bindings work.
      await expect(controller.getElementText(listItems[0])).to.equal(
        'Pineapple'
      );

      await controller.takeScreenshot('screenshots/amp-list-ssr.png');
    });
  }
);

describes.endtoend(
  'amp-list',
  {
    testUrl: 'http://localhost:8000/test/fixtures/e2e/amp-list/amp-list.html',
    environments: ['single'],
  },
  async env => {
    let controller;

    beforeEach(async () => {
      controller = env.controller;
    });

    it('should render list', async function() {
      const container = await getListContainer(controller);
      await verifyContainer(controller, container);

      // Verify that all items rendered.
      const listItems = await getListItems(controller);
      await expect(listItems).to.have.length(5);

      await controller.takeScreenshot('screenshots/amp-list.png');
    });
  }
);

function getListContainer(controller) {
  return controller.findElement('div[role=list]');
}

function getListItems(controller) {
  return controller.findElements('div[role=listitem]');
}

async function verifyContainer(controller, container) {
  await expect(controller.getElementAttribute(container, 'class')).to.equal(
    'i-amphtml-fill-content i-amphtml-replaced-content'
  );
}
