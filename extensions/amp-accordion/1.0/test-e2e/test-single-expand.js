describes.endtoend(
  'amp-accordion',
  {
    version: '1.0',
    fixture: 'amp-accordion/single-expand.html',
    experiments: ['bento-accordion'],
    environments: ['single', 'viewer-demo'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('expands only one section at a time for "expand-single-section" accordion', async () => {
      const header1 = await controller.findElement('#header2-1');
      const header2 = await controller.findElement('#header2-2');
      const content1 = await controller.findElement('#content2-1');
      const content2 = await controller.findElement('#content2-2');

      // section 1 is not expanded
      await expect(
        controller.getElementProperty(content1, 'clientHeight')
      ).to.equal(0);

      // expand section 1
      await controller.click(header1);

      // section 1 is expanded
      await expect(
        controller.getElementProperty(content1, 'clientHeight')
      ).to.equal(25);

      // expand section 2
      await controller.click(header2);

      // section 2 is expanded, section 1 is collapsed
      await expect(
        controller.getElementProperty(content1, 'clientHeight')
      ).to.equal(0);
      await expect(
        controller.getElementProperty(content2, 'clientHeight')
      ).to.equal(25);
    });
  }
);
