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

describes.endtoend('amp-autocomplete', {
  testUrl: 'http://localhost:8000/test/manual/amp-autocomplete/amp-autocomplete.amp.html',
  experiments: ['amp-autocomplete'],
  // By default, the browser opens at 800x600
  // initialRect: {width: 800, height: 600},

  // By default, E2E tests run in all three environments
  // environments: ['single', 'viewer-demo', 'shadow-demo']
}, env => {
  let controller;

  beforeEach(() => {
    controller = env.controller;
  });

  it('<amp-autocomplete> should render correctly', async() => {
    const autocomplete = await controller.findElement('#autocomplete');
    const input = await controller.findElement('#input');
    const renderedResults =
      await controller.findElement('.i-amphtml-autocomplete-results');
    await expect(autocomplete).not.to.be.null;
    await expect(input).not.to.be.null;
    await expect(renderedResults).not.to.be.null;
  });

  it('<amp-autocomplete> should display results on focus', async() => {
    const renderedResults =
      await controller.findElement('.i-amphtml-autocomplete-results');
    await expect(controller.getElementAttribute(renderedResults, 'hidden'))
        .not.to.be.null;
    const focusButton = await controller.findElement('#focusButton');
    await controller.click(focusButton);

    // Displays all suggested items on focus.
    const itemElements =
      await controller.findElements('.i-amphtml-autocomplete-item');
    await expect(renderedResults).not.to.be.null;
    await expect(controller.getElementAttribute(renderedResults, 'hidden'))
        .to.be.null;
    await expect(itemElements).to.have.length(3);
  });

  it('<amp-autocomplete> should narrow suggestions to input', async() => {
    const renderedResults =
      await controller.findElement('.i-amphtml-autocomplete-results');
    const focusButton = await controller.findElement('#focusButton');
    const input = await controller.findElement('#input');
    await expect(input).not.to.be.null;
    await controller.click(focusButton);

    // Displays all suggested items on focus.
    const itemElements =
      await controller.findElements('.i-amphtml-autocomplete-item');
    await expect(itemElements).to.have.length(3);

    // New input narrows down suggested items.
    await controller.type(input, 'an');
    await expect(controller.getElementAttribute(renderedResults, 'hidden'))
        .to.be.null;
    const newItemElements =
      await controller.findElements('.i-amphtml-autocomplete-item');
    await expect(newItemElements).to.have.length(2);
  });

});
