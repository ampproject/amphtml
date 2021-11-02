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
      const navLinkInSidebar = await controller.findElement('nav');
      await expect(controller.isElementDisplayed(navLinkInSidebar)).to.be.false;

      // Open sidebar
      const openButton = await controller.findElement('#open-sidebar');
      controller.click(openButton);

      // check if sidebar content is visible
      await expect(controller.isElementDisplayed(navLinkInSidebar)).to.be.true;

      // Close sidebar
      const closeButton = await controller.findElement('#close-sidebar');
      controller.click(closeButton);

      // check if sidebar content is not visible
      await expect(controller.isElementDisplayed(navLinkInSidebar)).to.be.false;
    });
  }
);
