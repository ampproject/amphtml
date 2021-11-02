describes.endtoend(
  'amp-lightbox with amp-autocomplete',
  {
    version: '0.1',
    fixture: 'amp-lightbox/amp-lightbox-autocomplete.html',
    environments: 'ampdoc-preset',
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should show autocomplete options when lightbox opens', async () => {
      const open = await controller.findElement('#open');
      await controller.click(open);

      const results = await controller.findElement(
        '.i-amphtml-autocomplete-results'
      );
      await expect(controller.getElementProperty(results, 'hidden')).to.be
        .false;

      const options = await controller.findElements(
        '.i-amphtml-autocomplete-item'
      );
      // auto-complete options are apple, orange, banana.
      await expect(options).to.have.lengthOf(3);
    });
  }
);
