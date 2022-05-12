describes.endtoend(
  'bento-autocomplete',
  {
    version: '1.0',
    fixture: 'bento/autocomplete.html',
    environments: ['single'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('renders the autocomplete', async () => {
      const element = await controller.findElement('bento-autocomplete');
      await expect(controller.isElementDisplayed(element)).to.be.true;

      const input = await controller.findElement('input#autocomplete');
      await expect(controller.isElementDisplayed(input)).to.be.true;
    });
  }
);
