
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

describes.endtoend('amp-bind', {
  testUrl: 'http://localhost:8000/test/fixtures/e2e/amp-bind/' +
      'bind-basic.html',
}, async env => {
  let controller;

  beforeEach(async() => {
    controller = env.controller;
  });

  describe('+ amp-state', () => {
    // TODO(cvializ, choumx): Update server to have an endpoint that
    // would test the infinite-loop blocking behavior
    it.skip('should not loop infinitely if updates change its ' +
        'src binding', async() => {
      const changeAmpStateSrcButton = await controller.findElement(
          '#changeAmpStateSrc');
      const setState = await controller.findElement('#setState');
      const ampState = await controller.findElement('#ampState');

      // TODO(cvializ, choumx): Replace this with a test server endpoint
      // // Stub XHR for endpoint such that it returns state that would
      // // point the amp-state element back to its original source.
      // sandbox.stub(batchedXhr, 'fetchJson')
      //     .withArgs(
      //         'https://www.google.com/bind/second/source', sinon.match.any)
      //     .returns(Promise.resolve({
      //       json() {
      //         return Promise.resolve({
      //           stateSrc: 'https://www.google.com/bind/first/source',
      //         });
      //       },
      //     }));
      // // Changes amp-state's src from
      // // .../first/source to .../second/source.

      await expect(controller.getElementAttribute(ampState, 'src'))
          .to.equal('https://www.google.com/bind/first/source');

      await controller.click(changeAmpStateSrcButton);
      // bind applications caused by an amp-state mutation SHOULD NOT
      // update src attributes on amp-state elements.
      await expect(controller.getElementAttribute(ampState, 'src'))
          .to.not.equal('https://www.google.com/bind/first/source');
      await expect(controller.getElementAttribute(ampState, 'src'))
          .to.equal('https://www.google.com/bind/second/source');

      await controller.click(setState);
      // Now that a non-amp-state mutation has ocurred, the
      // amp-state's src attribute can be updated with the new
      // src from the XHR.
      await expect(controller.getElementAttribute(ampState, 'src'))
          .to.equal('https://www.google.com/bind/first/source');
    });
  });
});
