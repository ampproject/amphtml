describes.endtoend(
  'bento-sidebar',
  {
    version: '1.0',
    fixture: 'bento/sidebar.html',
    environments: ['single'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should be able to open and close', async () => {
      // check if sidebar content is not visibile
      const navInLightDom = await controller.findElement('nav');
      await expect(controller.isElementDisplayed(navInLightDom)).to.be.false;

      // Open sidebar
      const openButton = await controller.findElement('#open-sidebar');
      controller.click(openButton);

      // wait for sidebar to finish open animation
      const element = await controller.findElement('bento-sidebar');
      await controller.switchToShadowRoot(element);
      const navInShadowDom = await controller.findElement('[part="sidebar"]');

      // check if sidebar content is visible
      await expect(controller.isElementDisplayed(navInShadowDom)).to.be.true;
      await expect(controller.getElementRect(navInShadowDom)).to.include({
        width: 128,
        right: 128,
      });

      await controller.switchToLight();
      // Close sidebar
      const closeButton = await controller.findElement('#close-sidebar');
      controller.click(closeButton);

      // check if sidebar content is not visible
      await expect(controller.isElementDisplayed(navInShadowDom)).to.be.false;
    });
  }
);
