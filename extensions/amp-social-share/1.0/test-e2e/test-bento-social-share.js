describes.endtoend(
  'bento-social-share',
  {
    version: '1.0',
    fixture: 'bento/social-share.html',
    environments: ['single'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should open a window to a share page', async () => {
      const element = await controller.findElement('bento-social-share');
      await controller.switchToShadowRoot(element);

      const shareBtn = await controller.findElement('[role="button"]');

      let windows = await controller.getAllWindows();
      await expect(windows.length).to.equal(1);

      await controller.click(shareBtn);

      windows = await controller.getAllWindows();
      await expect(windows.length).to.equal(2);

      await controller.switchToWindow(windows[1]);

      await expect(controller.getCurrentUrl()).to.equal(
        'https://twitter.com/intent/tweet?text=Bento%20Social%20Share&url=http%3A%2F%2Fexample.com%2F'
      );
    });

    it('should replace title and conanical url on the same share url', async () => {
      const element = await controller.findElement(
        'bento-social-share[type="whatsapp"]'
      );
      await controller.switchToShadowRoot(element);

      const shareBtn = await controller.findElement('[role="button"]');

      let windows = await controller.getAllWindows();
      await expect(windows.length).to.equal(1);

      await controller.click(shareBtn);

      windows = await controller.getAllWindows();
      await expect(windows.length).to.equal(2);

      await controller.switchToWindow(windows[1]);

      await expect(controller.getCurrentUrl()).to.equal(
        'https://api.whatsapp.com/send?text=Bento%20Social%20Share%20-%20http%3A%2F%2Fexample.com%2F'
      );
    });
  }
);
