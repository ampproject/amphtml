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
  // TODO: Restore 'environments' to default after supporting fourth test in
  // shadow environment.
  environments: ['single', 'viewer-demo'],
  experiments: ['amp-autocomplete'],
  initialRect: {width: 800, height: 800},
}, env => {
  let controller;

  beforeEach(() => {
    controller = env.controller;
  });

  it('<amp-autocomplete> should render', async() => {
    const autocomplete = await controller.findElement('#autocomplete');
    await expect(controller.getElementProperty(autocomplete, 'children'))
        .to.have.length(3);

    const input = await controller.findElement('#input');
    await expect(controller.getElementAttribute(input, 'type'))
        .to.equal('text');

    const script = await controller.findElement('#script');
    await expect(controller.getElementAttribute(script, 'type'))
        .to.equal('application/json');

    const renderedResults =
      await controller.findElement('.i-amphtml-autocomplete-results');
    await expect(controller.getElementProperty(renderedResults, 'children'))
        .to.have.length(3);
    await expect(controller.getElementAttribute(renderedResults, 'hidden'))
        .not.to.be.null;
  });

  it('<amp-autocomplete> should display results on focus', async() => {
    const renderedResults =
      await controller.findElement('.i-amphtml-autocomplete-results');
    await expect(controller.getElementProperty(renderedResults, 'children'))
        .to.have.length(3);
    await expect(controller.getElementAttribute(renderedResults, 'hidden'))
        .not.to.be.null;
    const focusButton = await controller.findElement('#focusButton');
    await controller.click(focusButton);

    // Displays all suggested items on focus.
    await expect(controller.getElementAttribute(renderedResults, 'hidden'))
        .to.be.null;
  });

  it('<amp-autocomplete> should narrow suggestions to input', async() => {
    const renderedResults =
      await controller.findElement('.i-amphtml-autocomplete-results');
    const focusButton = await controller.findElement('#focusButton');
    await expect(controller.getElementAttribute(renderedResults, 'hidden'))
        .not.to.be.null;
    await controller.click(focusButton);

    // Displays all suggested items on focus.
    await expect(controller.getElementAttribute(renderedResults, 'hidden'))
        .to.be.null;
    await expect(controller.getElementProperty(renderedResults, 'children'))
        .to.have.length(3);

    // New input narrows down suggested items.
    const input = await controller.findElement('#input');
    await controller.type(input, 'an');
    await expect(controller.getElementAttribute(renderedResults, 'hidden'))
        .to.be.null;
    await expect(controller.getElementProperty(renderedResults, 'children'))
        .to.have.length(2);
  });

  it('<amp-autocomplete> should select an item', async() => {
    const renderedResults =
      await controller.findElement('.i-amphtml-autocomplete-results');
    const focusButton = await controller.findElement('#focusButton');
    await expect(controller.getElementAttribute(renderedResults, 'hidden'))
        .not.to.be.null;
    await expect(controller.getElementProperty(renderedResults, 'children'))
        .to.have.length(3);

    // Displays all suggested items on focus.
    await controller.click(focusButton);
    await expect(controller.getElementAttribute(renderedResults, 'hidden'))
        .to.be.null;
    const itemElements =
      await controller.findElements('.i-amphtml-autocomplete-item');
    await expect(controller.getElementText(itemElements[0])).to.equal('apple');
    await controller.click(itemElements[0]);

    // Displays no items after selecting one.
    await expect(controller.getElementAttribute(renderedResults, 'hidden'))
        .not.to.be.null;
    await expect(controller.getElementProperty(renderedResults, 'children'))
        .to.have.length(1);
    const input = await controller.findElement('#input');
    await expect(controller.getElementProperty(input, 'value'))
        .to.equal('apple');
  });

});
