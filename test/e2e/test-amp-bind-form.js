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
  'amp-bind',
  {
    testUrl: 'http://localhost:8000/test/fixtures/e2e/amp-bind/bind-form.html',
  },
  async env => {
    let controller;

    beforeEach(async () => {
      controller = env.controller;
    });

    describe('with <amp-form>', () => {
      it('should NOT allow invalid bindings or values', async function() {
        const xhrText = await controller.findElement('#xhrText');
        const templatedText = await controller.findElement('#templatedText');
        const illegalHref = await controller.findElement('#illegalHref');
        const submitButton = await controller.findElement('#submitButton');

        await expect(controller.getElementText(xhrText)).to.equal('');
        await expect(controller.getElementAttribute(illegalHref, 'href')).to.be
          .null;
        await expect(controller.getElementAttribute(templatedText, 'onclick'))
          .to.be.null;
        await expect(
          controller.getElementAttribute(templatedText, 'onmouseover')
        ).to.be.null;
        await expect(controller.getElementAttribute(templatedText, 'style')).to
          .be.null;
        await expect(controller.getElementText(templatedText)).to.equal('');

        await controller.click(submitButton);

        // The <amp-form> has on="submit-success:AMP.setState(...)".

        // References to XHR JSON data should work on submit-success.
        await expect(controller.getElementText(xhrText)).to.equal(
          'John Miller'
        );
        await expect(controller.getElementAttribute(illegalHref, 'href')).to.be
          .null;
        await expect(controller.getElementAttribute(templatedText, 'onclick'))
          .to.be.null;
        await expect(
          controller.getElementAttribute(templatedText, 'onmouseover')
        ).to.be.null;
        await expect(controller.getElementAttribute(templatedText, 'style')).to
          .be.null;
        await expect(controller.getElementText(templatedText)).to.equal(
          'textIsLegal'
        );
      });
    });
  }
);
