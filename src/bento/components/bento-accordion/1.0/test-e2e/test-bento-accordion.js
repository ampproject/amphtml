describes.endtoend(
  'bento-accordion',
  {
    version: '1.0',
    fixture: 'bento/accordion.html',
    environments: ['single'],
  },
  (env) => {
    /**
     * @type {SeleniumWebDriverController}
     */
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should render accordion content and respond to button clicks', async () => {
      const {
        collapseBtn,
        content1,
        content2,
        content3,
        expandBtn,
        section1,
        section2,
        section3,
        toggle2Btn,
        toggleBtn,
      } = await getContents();

      await expect(await isOpen(content1, section1)).to.equal(false);
      await expect(await isOpen(content2, section2)).to.equal(false);
      await expect(await isOpen(content3, section3)).to.equal(true);

      await controller.click(toggle2Btn);

      await expect(await isOpen(content1, section1)).to.equal(false);
      await expect(await isOpen(content2, section2)).to.equal(true);
      await expect(await isOpen(content3, section3)).to.equal(true);

      await controller.click(toggleBtn);

      await expect(await isOpen(content1, section1)).to.equal(true);
      await expect(await isOpen(content2, section2)).to.equal(false);
      await expect(await isOpen(content3, section3)).to.equal(false);

      await controller.click(toggle2Btn);

      await expect(await isOpen(content1, section1)).to.equal(true);
      await expect(await isOpen(content2, section2)).to.equal(true);
      await expect(await isOpen(content3, section3)).to.equal(false);

      await controller.click(expandBtn);

      await expect(await isOpen(content1, section1)).to.equal(true);
      await expect(await isOpen(content2, section2)).to.equal(true);
      await expect(await isOpen(content3, section3)).to.equal(true);

      await controller.click(collapseBtn);

      await expect(await isOpen(content1, section1)).to.equal(false);
      await expect(await isOpen(content2, section2)).to.equal(false);
      await expect(await isOpen(content3, section3)).to.equal(false);

      await controller.click(toggleBtn);

      await expect(await isOpen(content1, section1)).to.equal(true);
      await expect(await isOpen(content2, section2)).to.equal(true);
      await expect(await isOpen(content3, section3)).to.equal(true);

      await controller.click(toggleBtn);

      await expect(await isOpen(content1, section1)).to.equal(false);
      await expect(await isOpen(content2, section2)).to.equal(false);
      await expect(await isOpen(content3, section3)).to.equal(false);
    });

    async function getContents() {
      const [
        section1,
        header1,
        content1,
        section2,
        header2,
        content2,
        section3,
        header3,
        content3,
        expandBtn,
        collapseBtn,
        toggleBtn,
        expand2Btn,
        collapse2Btn,
        toggle2Btn,
      ] = await Promise.all([
        controller.findElement('#section1'),
        controller.findElement('#header1'),
        controller.findElement('#content1'),
        controller.findElement('#section2'),
        controller.findElement('#header2'),
        controller.findElement('#content2'),
        controller.findElement('#section3'),
        controller.findElement('#header3'),
        controller.findElement('#content3'),
        controller.findElement('#expand'),
        controller.findElement('#collapse'),
        controller.findElement('#toggle'),
        controller.findElement('#expand2'),
        controller.findElement('#collapse2'),
        controller.findElement('#toggle2'),
      ]);
      return {
        section1,
        header1,
        content1,
        section2,
        header2,
        content2,
        section3,
        header3,
        content3,
        expandBtn,
        collapseBtn,
        toggleBtn,
        expand2Btn,
        collapse2Btn,
        toggle2Btn,
      };
    }

    async function isOpen(content, section) {
      const clientHeight = await controller.getElementProperty(
        content,
        'clientHeight'
      );

      const isExpanded =
        (await controller.getElementAttribute(section, 'expanded')) === '';
      return clientHeight > 0 && isExpanded;
    }
  }
);
