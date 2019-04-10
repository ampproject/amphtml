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
      'bind-live-list.html',
}, async env => {
  let controller;

  beforeEach(async() => {
    controller = env.controller;
  });

  describe('with <amp-live-list>', () => {

    it('should detect bindings in initial live-list elements', async() => {
      const liveListChildren = await controller.findElements(
          '#liveListItems > *');
      await expect(liveListChildren.length).to.equal(1);

      const existingItem = await controller.findElement('#liveListItem1');
      await expect(controller.getElementText(existingItem)).to.equal('unbound');

      const button = await controller.findElement('#changeLiveListTextButton');
      await controller.click(button);

      const firstChild = await controller.findElement(
          '#liveListItem1 > :first-child');
      await expect(controller.getElementText(firstChild)).to.equal(
          'hello world');
    });

    // TODO(cvializ,choumx): Configure the server to send different data on the
    // second request. A queryparam should be able to implement this.
    it.skip('should apply scope to bindings in new list items', async() => {
      const liveListChildren = await controller.findElements(
          '#liveListItems > *');
      await expect(liveListChildren.length).to.equal(1);

      const existingItem = await controller.findElement('#liveListItem1');
      await expect(controller.getElementText(existingItem)).to.equal('unbound');

      // The test server should handle this
      // const impl = liveList.implementation_;
      // const update = document.createElement('div');
      // update.innerHTML =
      //     '<div items>' +
      //     ` <div id="newItem" data-sort-time=${Date.now()}>` +
      //     '    <p [text]="liveListText">unbound</p>' +
      //     ' </div>' +
      //     '</div>';
      // impl.update(update);

      const updateButton = await controller.findElement(
          '#liveListUpdateButton');
      await controller.click(updateButton);

      await controller.findElement('#liveListItems > :nth-child(2)');
      const newItem = controller.findElement('#newItem');

      const button = await controller.findElement('#changeLiveListTextButton');
      await controller.click(button);

      await expect(controller.getElementText(existingItem))
          .to.equal('hello world');
      await expect(controller.getElementText(newItem))
          .to.equal('hello world');
    });
  });
});
