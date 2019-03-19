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

const pageWidth = 400;
const pageHeight = 600;

describes.endtoend('AMP list load-more=manual', {
  testUrl: 'http://localhost:8000/test/manual/amp-list/' +
      'load-more-manual.amp.html',
  experiments: ['amp-list-load-more'],
  initialRect: {width: pageWidth, height: pageHeight},
  // TODO(cathyxz, cvializ): figure out why 'viewer-demo' only shows 'FALLBACK'
  environments: ['single', 'shadow-demo'],
}, async env => {
  let controller;

  beforeEach(async() => {
    controller = env.controller;
  });

  it('should render correctly', async() => {
    const listItems = await controller.findElements('.item');
    await expect(listItems).to.have.length(2);
    const seeMore = await controller.findElement('[load-more-button]');

    // Can we assert its CSS be visible and display block?
    await expect(seeMore).to.be.ok;

    await expect(controller.getElementCssValue(seeMore, 'visibility'))
        .to.equal('visible');
    await expect(controller.getElementCssValue(seeMore, 'display'))
        .to.equal('block');

    const loader = await controller.findElement('[load-more-loading]');
    await expect(loader).to.be.ok;

    await expect(controller.getElementCssValue(loader, 'display'))
        .to.equal('none');

    const failedIndicator = await controller.findElement('[load-more-failed]');
    await expect(failedIndicator).to.be.ok;
    await expect(controller.getElementCssValue(failedIndicator, 'display'))
        .to.equal('none');

    await controller.takeScreenshot('screenshots/amp-list-load-more.png');
  });

  it('should load more items on click', async() => {
    let listItems = await controller.findElements('.item');
    await expect(listItems).to.have.length(2);
    const seeMore = await controller.findElement('[load-more-button]');

    await controller.click(seeMore);

    const fourthItem = await controller.findElement('div.item:nth-child(4)');
    await expect(fourthItem).to.be.ok;
    listItems = await controller.findElements('.item');
    await expect(listItems).to.have.length(4);

    // TODO(cathyxz): Figure out why the button is not visible after
    // clicking load more the first time.
    await controller.click(seeMore);

    const sixthItem = await controller.findElement('div.item:nth-child(6)');
    await expect(sixthItem).to.be.ok;
    listItems = await controller.findElements('.item');
    await expect(listItems).to.have.length(6);
  });


  it('should show load-more-end when done', async() => {
    const seeMore = await controller.findElement('[load-more-button]');
    await controller.click(seeMore);
    await controller.findElement('div.item:nth-child(4)');

    // TODO(cathyxz): Figure out why the button is not visible after
    // clicking load more the first time.
    await controller.click(seeMore);

    await controller.findElement('div.item:nth-child(6)');

    const loadMoreEnd = await controller.findElement('[load-more-end]');
    await expect(controller.getElementCssValue(loadMoreEnd, 'display'))
        .to.equal('block');

    await expect(controller.getElementCssValue(seeMore, 'display'))
        .to.equal('none');
    const loader = await controller.findElement('[load-more-loading]');
    await expect(controller.getElementCssValue(loader, 'display'))
        .to.equal('none');
  });
});
