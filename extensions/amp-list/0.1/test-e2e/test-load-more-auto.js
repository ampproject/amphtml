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
const pageHeight = 420; // unusually small to force a scrollbar

describes.endtoend(
  'AMP list load-more=auto',
  {
    testUrl:
      'http://localhost:8000/test/manual/amp-list/load-more-auto.amp.html',
    experiments: ['amp-list-load-more'],
    initialRect: {width: pageWidth, height: pageHeight},
    // TODO(cathyxz, cvializ): figure out why 'viewer' only shows 'FALLBACK'
    // TODO(cathyxz): figure out why shadow-demo doesn't work
    environments: ['single'],
  },
  env => {
    let controller;

    beforeEach(async () => {
      controller = env.controller;
    });

    // TODO(cathyxz): flaky in single env
    it.skip('should render correctly', async () => {
      const listItems = await controller.findElements('.item');
      await expect(listItems).to.have.length(2);

      const loader = await controller.findElement('[load-more-loading]');
      await expect(loader).to.be.ok;
      await expect(controller.getElementCssValue(loader, 'display')).to.equal(
        'none'
      );

      const failedIndicator = await controller.findElement(
        '[load-more-failed]'
      );
      await expect(failedIndicator).to.be.ok;
      await expect(
        controller.getElementCssValue(failedIndicator, 'display')
      ).to.equal('none');

      const seeMore = await controller.findElement('[load-more-button]');
      await expect(seeMore).to.be.ok;
      await expect(
        controller.getElementCssValue(seeMore, 'visibility')
      ).to.equal('visible');
      await expect(controller.getElementCssValue(seeMore, 'display')).to.equal(
        'block'
      );

      await controller.takeScreenshot('screenshots/amp-list-load-more.png');
    });

    it.skip('should load more items on scroll', async () => {
      let listItems = await controller.findElements('.item');
      await expect(listItems).to.have.length(2);

      // wait for load more to be ready?
      await controller.findElement('[load-more-button]');

      const article = await controller.getDocumentElement();
      await controller.scrollBy(article, {top: 100});

      const fourthItem = await controller.findElement('div.item:nth-child(4)');
      await expect(fourthItem).to.be.ok;
      listItems = await controller.findElements('.item');
      await expect(listItems).to.have.length(4);
    });
  }
);
