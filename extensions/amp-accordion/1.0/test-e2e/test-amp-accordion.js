describes.endtoend(
  'amp-accordion',
  {
    version: '1.0',
    fixture: 'amp-accordion/amp-accordion.html',
    experiments: ['bento-accordion'],
    environments: ['single', 'viewer-demo'],
  },
  (env) => {
    let controller;

    let header1;

    let content1;
    let content2;
    let content3;

    let button1;
    let button2;

    beforeEach(async () => {
      controller = env.controller;

      header1 = await controller.findElement('#header1');

      content1 = await controller.findElement('#content1');
      content2 = await controller.findElement('#content2');
      content3 = await controller.findElement('#content3');

      button1 = await controller.findElement('#button1');
      button2 = await controller.findElement('#button2');
    });

    it('expands and collapses when a header section is clicked', async () => {
      // section 1 is not expanded
      await expect(
        controller.getElementProperty(content1, 'clientHeight')
      ).to.equal(0);

      await controller.click(header1);

      // section 1 is expanded
      await expect(
        controller.getElementProperty(content1, 'clientHeight')
      ).to.equal(25);

      await controller.click(header1);

      // section 1 is collapsed
      await expect(
        controller.getElementProperty(content1, 'clientHeight')
      ).to.equal(0);
    });

    it('renders section in expanded state when expanded attribute provided', async () => {
      // section 3 should start in expanded state since it has
      // "expanded" attribute
      await expect(
        controller.getElementProperty(content3, 'clientHeight')
      ).to.equal(25);
    });

    it('expands and collapses when buttons are clicked', async () => {
      // section 1 is not expanded
      await expect(
        controller.getElementProperty(content1, 'clientHeight')
      ).to.equal(0);

      // toggle section 1
      await controller.click(button1);

      // section 1 is expanded
      await expect(
        controller.getElementProperty(content1, 'clientHeight')
      ).to.equal(25);

      // collapse all button
      await controller.click(button2);

      // all sections collapsed
      await expect(
        controller.getElementProperty(content1, 'clientHeight')
      ).to.equal(0);
      await expect(
        controller.getElementProperty(content2, 'clientHeight')
      ).to.equal(0);
      await expect(
        controller.getElementProperty(content3, 'clientHeight')
      ).to.equal(0);
    });
  }
);
