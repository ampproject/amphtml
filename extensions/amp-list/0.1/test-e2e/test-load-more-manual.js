const pageWidth = 600;
const pageHeight = 600;

describes.endtoend(
  'AMP list load-more=manual',
  {
    fixture: 'amp-list/load-more-manual.amp.html',
    initialRect: {width: pageWidth, height: pageHeight},
    // TODO(cathyxz, cvializ): figure out why 'viewer-demo' only shows 'FALLBACK'
    environments: ['single'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should render correctly', async () => {
      const listItems = await controller.findElements('.item');
      await expect(listItems).to.have.length(2);
      const seeMore = await controller.findElement('[load-more-button]');

      // Can we assert its CSS be visible and display block?
      await expect(seeMore).to.be.ok;

      await expect(
        controller.getElementCssValue(seeMore, 'visibility')
      ).to.equal('visible');
      await expect(controller.getElementCssValue(seeMore, 'display')).to.equal(
        'block'
      );

      const loader = await controller.findElement('[load-more-loading]');
      await expect(loader).to.be.ok;

      await expect(controller.getElementCssValue(loader, 'display')).to.equal(
        'none'
      );

      const failedIndicator =
        await controller.findElement('[load-more-failed]');
      await expect(failedIndicator).to.be.ok;
      await expect(
        controller.getElementCssValue(failedIndicator, 'display')
      ).to.equal('none');
    });

    it('should load more items on click', async () => {
      let listItems = await controller.findElements('.item');
      await expect(listItems).to.have.length(2);
      const seeMore = await controller.findElement('[load-more-button]');

      await controller.click(seeMore);

      const fourthItem = await controller.findElement('div.item:nth-child(4)');
      await expect(fourthItem).to.be.ok;
      listItems = await controller.findElements('.item');
      await expect(listItems).to.have.length(4);
    });

    it('should show load-more-end when done', async () => {
      const seeMore = await controller.findElement('[load-more-button]');
      await controller.click(seeMore);
      await controller.findElement('div.item:nth-child(4)');

      const loadMoreEnd = await controller.findElement('[load-more-end]');
      await expect(
        controller.getElementCssValue(loadMoreEnd, 'display')
      ).to.equal('block');

      await expect(controller.getElementCssValue(seeMore, 'display')).to.equal(
        'none'
      );
      const loader = await controller.findElement('[load-more-loading]');
      await expect(controller.getElementCssValue(loader, 'display')).to.equal(
        'none'
      );
    });
  }
);
