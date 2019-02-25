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


describes.endtoend('AMP list', {
}, async env => {
  const pageWidth = 800;
  const pageHeight = 600;
  let controller;
  let ampDriver;

  beforeEach(async() => {
    controller = env.controller;
    ampDriver = env.ampDriver;

    await controller.navigateTo('http://localhost:8000/test/manual/amp-list/load-more-manual.amp.html');
    await ampDriver.toggleExperiment('amp-list-load-more', true);

    await controller.setWindowRect({
      width: pageWidth,
      height: pageHeight,
    });
    await controller.navigateTo(
        'http://localhost:8000/test/manual/amp-list/load-more-manual.amp.html');
  });

  it('should render correctly', async() => {
    const listItems = await controller.findElements('.item');
    expect(listItems.length).to.equal(2);
    const seeMoreButton = await controller.findElement('[load-more-button]');

    // Can we assert its CSS be visible and display block?
    expect(seeMoreButton).to.not.be.null;

    const visibility = await controller.getElementCssValue(seeMoreButton,
        'visibility', 'visible');
    expect(visibility).to.equal('visible');
    const display = await controller.getElementCssValue(seeMoreButton,
        'display');
    expect(display).to.equal('block');

    const loader = await controller.findElement('[load-more-loading]');
    expect(loader).to.not.be.null;

    const loaderDisplay = await controller.getElementCssValue(loader,
        'display');
    expect(loaderDisplay).to.equal('none');

    const failedIndicator = await controller.findElement('[load-more-failed]');
    expect(failedIndicator).to.not.be.null;
    const failedIndicatorDisplay = await controller.getElementCssValue(
        failedIndicator, 'display');
    expect(failedIndicatorDisplay).to.equal('none');

    await controller.takeScreenshot('screenshots/amp-list-load-more.png');
  });

});
