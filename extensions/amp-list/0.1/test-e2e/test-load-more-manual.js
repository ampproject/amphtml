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

describes.endtoend('AMP list load-more=manual', {
  testUrl: 'http://localhost:8000/test/manual/amp-list/' +
      'load-more-manual.amp.html',
  experiments: ['amp-list-load-more'],
  initialRect: {width: pageWidth, height: pageHeight},
}, async env => {
  let controller;

  beforeEach(async() => {
    controller = env.controller;
  });

  it('should render correctly', async() => {
    const listItems = await controller.findElements('.item');
    expect(listItems).to.have.length(2);
    const seeMoreButton = await controller.findElement('[load-more-button]');

    // Can we assert its CSS be visible and display block?
    expect(seeMoreButton).to.be.ok;

    const visibility = await controller.getElementCssValue(seeMoreButton,
        'visibility', 'visible');
    expect(visibility).to.equal('visible');
    const display = await controller.getElementCssValue(seeMoreButton,
        'display');
    expect(display).to.equal('block');

    const loader = await controller.findElement('[load-more-loading]');
    expect(loader).to.be.ok;

    const loaderDisplay = await controller.getElementCssValue(loader,
        'display');
    expect(loaderDisplay).to.equal('none');

    const failedIndicator = await controller.findElement('[load-more-failed]');
    expect(failedIndicator).to.be.ok;
    const failedIndicatorDisplay = await controller.getElementCssValue(
        failedIndicator, 'display');
    expect(failedIndicatorDisplay).to.equal('none');

    await controller.takeScreenshot('screenshots/amp-list-load-more.png');
  });

  it('should load more items on click', async() => {
    let listItems = await controller.findElements('.item');
    expect(listItems).to.have.length(2);
    const seeMoreButton = await controller.findElement('[load-more-button]');

    controller.click(seeMoreButton);

    const fourthItem = await controller.findElement(
        'div.item:nth-child(4)');
    expect(fourthItem).to.be.ok;
    listItems = await controller.findElements('.item');
    expect(listItems).to.have.length(4);

    controller.click(seeMoreButton);

    const sixthItem = await controller.findElement(
        'div.item:nth-child(6)');
    expect(sixthItem).to.be.ok;
    listItems = await controller.findElements('.item');
    expect(listItems).to.have.length(6);
  });


  it('should show load-more-end when done', async() => {
    const seeMoreButton = await controller.findElement('[load-more-button]');
    controller.click(seeMoreButton);
    await controller.findElement('div.item:nth-child(4)');
    controller.click(seeMoreButton);
    await controller.findElement('div.item:nth-child(6)');

    const loadMoreEnd = await controller.findElement('[load-more-end]');
    const loadEndDisplay = await controller.getElementCssValue(loadMoreEnd,
        'display');
    expect(loadEndDisplay).to.equal('block');

    const seeMoreButtonDisplay = await controller.getElementCssValue(
        seeMoreButton, 'display');
    expect(seeMoreButtonDisplay).to.equal('none');

    const loader = await controller.findElement('[load-more-loading]');
    const loaderDisplay = await controller.getElementCssValue(loader,
        'display');
    expect(loaderDisplay).to.equal('none');
  });
});
