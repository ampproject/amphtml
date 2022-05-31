describes.endtoend(
  'amp-selector',
  {
    fixture: 'amp-selector/amp-selector-tabs.html',

    versions: {
      '0.1': {
        environments: ['single', 'viewer-demo'],
      },
      '1.0': {
        environments: ['single', 'viewer-demo'],
        experiments: ['bento-selector'],
      },
    },
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should render correctly', async () => {
      const selector = await controller.findElement('#tabs');

      await expect(controller.getElementAttribute(selector, 'role')).to.equal(
        'tablist'
      );

      const firstTab = await controller.findElement('#tab1Selector');
      await expect(controller.getElementAttribute(firstTab, 'selected')).to
        .exist;

      const image = await controller.findElement('#firstImage');
      await expect(
        controller.getElementProperty(image, 'clientWidth')
      ).to.be.greaterThan(0);

      const internalImg = await controller.findElement('#firstImage img');
      await expect(internalImg).to.exist;
    });

    it('should switch tabs on button click', async () => {
      const secondTab = await controller.findElement('#tab2Selector');
      await expect(controller.getElementAttribute(secondTab, 'selected')).to.not
        .exist;

      await controller.click(secondTab);
      await expect(controller.getElementAttribute(secondTab, 'selected')).to
        .exist;

      const image = await controller.findElement('#secondImage');
      await expect(
        controller.getElementProperty(image, 'clientWidth')
      ).to.be.greaterThan(0);

      const internalImg = await controller.findElement('#secondImage img');
      await expect(internalImg).to.exist;
    });

    it('should switch tabs on toggle ', async () => {
      const thirdTabToggle = await controller.findElement('#tab3Toggle');
      const thirdTab = await controller.findElement('#tab3Selector');
      await expect(controller.getElementAttribute(thirdTab, 'selected')).to.not
        .exist;

      await controller.click(thirdTabToggle);
      await expect(controller.getElementAttribute(thirdTab, 'selected')).to
        .exist;

      const image = await controller.findElement('#thirdImage');
      await expect(
        controller.getElementProperty(image, 'clientWidth')
      ).to.be.greaterThan(0);

      const internalImg = await controller.findElement('#thirdImage img');
      await expect(internalImg).to.exist;
    });
  }
);
