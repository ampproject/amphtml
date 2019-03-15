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

/**
 * Amp-list test for standalone and in an SSR enabled viewer. Verifies that
 * the rendered output is the same if the response from the REST endpoint is
 * the same as from the SSR endpoint.
 */

describes.endtoend.only('AMP list server side rendered templates', {
  testUrl: 'http://localhost:8000/test/fixtures/e2e/amp-list/amp-list.ssr.html',
  environments: ['single', 'viewer-demo'],
  experiments: ['layers'],
}, async env => {
  let controller;

  beforeEach(async() => {
    controller = env.controller;
  });

  it('should render ssr rendered list', async function() {
    const container = await controller.findElement('div[role=list]');
    // Verify that container is present and has the right properties.
    await expect(controller.getElementAttribute(container, 'class'))
        .to.equal('i-amphtml-fill-content i-amphtml-replaced-content');

    // Verify that all items rendered.
    const listItems = await controller.findElements('div[role=listitem]');
    await expect(listItems).to.have.length(6);

    // Verify that bindings work in SSR.
    await expect(controller.getElementText(listItems[0])).to.equal('Pineapple');

    await controller.takeScreenshot('screenshots/amp-list-ssr.png');
  });

});
