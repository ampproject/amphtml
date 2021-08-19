import {Key} from '#testing/helpers/types';

describes.endtoend(
  'amp-sidebar',
  {
    version: '0.1',
    fixture: 'amp-sidebar/amp-sidebar.html',
    environments: ['single', 'viewer-demo'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should render correctly', async () => {
      const sidebar = await controller.findElement('#sidebar');

      await expect(controller.getElementProperty(sidebar, 'hidden')).to.be.true;
      const image = await controller.findElement('#image');
      await expect(
        controller.getElementProperty(image, 'clientWidth')
      ).to.equal(0);
    });

    it('should open the sidebar', async () => {
      const open = await controller.findElement('#open');
      await controller.click(open);

      const sidebar = await controller.findElement('#sidebar');
      await expect(controller.getElementProperty(sidebar, 'hidden')).to.be
        .false;

      await expect(controller.getElementRect(sidebar)).to.include({
        width: 300,
        left: 0,
      });

      const backingImage = await controller.findElement('#image img');
      await expect(
        controller.getElementProperty(backingImage, 'clientWidth')
      ).to.equal(300);
    });

    it('should close the sidebar on button click', async () => {
      const open = await controller.findElement('#open');
      await controller.click(open);

      const sidebar = await controller.findElement('#sidebar');
      await expect(controller.getElementProperty(sidebar, 'hidden')).to.be
        .false;

      // Wait for the button to become visible
      await expect(controller.getElementRect(sidebar)).to.include({
        width: 300,
        right: 300,
      });

      const close = await controller.findElement('#close');
      await controller.click(close);
      await expect(controller.getElementProperty(sidebar, 'hidden')).to.be.true;
    });

    it('should close the sidebar on esc', async () => {
      const open = await controller.findElement('#open');
      await controller.click(open);

      const sidebar = await controller.findElement('#sidebar');
      await expect(controller.getElementProperty(sidebar, 'hidden')).to.be
        .false;

      await controller.type(null, Key.Escape);

      await expect(controller.getElementProperty(sidebar, 'hidden')).to.be.true;
    });

    it('should close the sidebar on click outside', async () => {
      const open = await controller.findElement('#open');
      await controller.click(open);

      const sidebar = await controller.findElement('#sidebar');
      await expect(controller.getElementProperty(sidebar, 'hidden')).to.be
        .false;

      const mask = await controller.findElement('.i-amphtml-sidebar-mask');
      await controller.click(mask);

      await expect(controller.getElementProperty(sidebar, 'hidden')).to.be.true;
    });
  }
);
