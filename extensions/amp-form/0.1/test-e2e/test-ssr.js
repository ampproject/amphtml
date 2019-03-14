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

const pageWidth = 800;
const pageHeight = 600;

/**
 * Amp-form test for SSR enabled viewer.
 */

describes.endtoend('AMP form server side rendered templates', {
  testUrl: 'http://localhost:8000/test/fixtures/e2e/amp-form.ssr.html',
  environments: ['viewer-demo'],
  experiments: ['layers'],
  initialRect: {width: pageWidth, height: pageHeight},
}, async env => {
  let controller;

  beforeEach(async() => {
    controller = env.controller;
  });

  it('should render server side render form response', async() => {
    const searchInput =
        await controller.findElement('#xhr-get  input[name=term]');
    controller.type(searchInput, 'search term');
    const submitForm =
        await controller.findElement('#xhr-get input[type=submit]');
    await controller.click(submitForm);

    const submitSuccess = await controller.findElement(
        '#xhr-get div[submit-success]');
    await expect(controller.getElementText(submitSuccess))
        .to.equal('Server side rendered search result');

    await controller.takeScreenshot('screenshots/amp-form-ssr.png');
  });

});
