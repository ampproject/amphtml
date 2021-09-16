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
  'amp-list "amp-script:" uri',
  {
    testUrl:
      'http://localhost:8000/test/fixtures/e2e/amp-list/amp-list-function-src.html',
    experiments: ['protocol-adapters'],
    environments: ['single'],
  },
  async (env) => {
    let controller;

    beforeEach(async () => {
      controller = env.controller;
    });

    // TODO(choumx): Unskip when #29752 is merged.
    it.configure().skip(
      'should render list backed by amp-script data',
      async function () {
        const container = await getListContainer(controller);
        await verifyContainer(controller, container);

        // Verify that all items rendered.
        const listItems = await getListItems(controller);
        await expect(listItems).to.have.length(2);
      }
    );
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
