describes.endtoend(
  'amp-script e2e',
  {
    fixture: 'amp-script/basic.amp.html',
    initialRect: {width: 600, height: 600},
    environments: ['single'],
    browsers: ['chrome'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should support local scripts', async function () {
      this.timeout(10000);
      const element = await controller.findElement('amp-script#local');
      await expect(controller.getElementAttribute(element, 'class')).to.contain(
        'i-amphtml-hydrated'
      );
      await expect(controller.getElementText(element)).to.equal('Hello World!');
    });

    it('should support remote scripts', async () => {
      const element = await controller.findElement('amp-script#remote');
      await expect(controller.getElementAttribute(element, 'class')).to.contain(
        'i-amphtml-hydrated'
      );

      const button = await controller.findElement('#remote button');
      controller.click(button);

      const h1 = await controller.findElement('#remote h1');
      await expect(controller.getElementText(h1)).to.equal('Hello World!');
    });

    // In layout=responsive|fluid, amp-script creates a fill-content container
    // div and reparents children to it. This ensures that the element sizing
    // is respected.
    it('should respect aspect ratio in layout=responsive', async () => {
      const element = await controller.findElement(
        'amp-script[layout="responsive"]'
      );
      await expect(controller.getElementAttribute(element, 'class')).to.contain(
        'i-amphtml-layout'
      );

      const width = await controller.getElementAttribute(element, 'width');
      const height = await controller.getElementAttribute(element, 'height');
      const targetRatio = Number(width) / Number(height);

      const rect = await controller.getElementRect(element);
      const realRatio = rect.width / rect.height;

      await expect(realRatio).to.equal(targetRatio);
    });

    // In layout=container, amp-script requires mutations to be backed by
    // user gestures. This ensures that this requirement is also enforced
    // on load AKA "hydration".
    it('should not mutate on load in layout=container', async () => {
      const element = await controller.findElement('amp-script#mutate');
      await expect(controller.getElementAttribute(element, 'class')).to.contain(
        'i-amphtml-hydrated'
      );

      // `document.body.textContent = lipsum;` should be disallowed.
      await expect(controller.getElementText(element)).to.contain(
        'Append some very long text'
      );

      // However, gesture-backed (e.g. click) mutations are OK.
      const button = await controller.findElement('#mutate button');
      controller.click(button);

      const h1 = await controller.findElement('#mutate h1');
      await expect(controller.getElementText(h1)).to.contain('Lorem Ipsum');
    });
  }
);
