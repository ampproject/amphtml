describes.endtoend(
  'amp-sidebar with toolbar',
  {
    fixture: 'amp-sidebar/amp-sidebar-toolbar.html',
    environments: ['single', 'viewer-demo'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should trigger the toolbar layout when viewport is resized', async () => {
      await controller.setWindowRect({width: 800, height: 600});

      const navElement = await controller.findElement('#nav-target-element');
      await expect(controller.getElementProperty(navElement, 'hidden')).to.be
        .false;

      // change orientation to potrait mode.
      await controller.setWindowRect({width: 600, height: 800});
      await expect(controller.getElementProperty(navElement, 'hidden')).to.be
        .true;

      // revert to landscape mode.
      await controller.setWindowRect({width: 800, height: 600});
      await expect(controller.getElementProperty(navElement, 'hidden')).to.be
        .false;
    });
  }
);
