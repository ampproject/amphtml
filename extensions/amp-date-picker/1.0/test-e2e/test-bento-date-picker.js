describes.endtoend(
  'bento-date-picker',
  {
    version: '1.0',
    fixture: 'bento/date-picker.html',
    environments: ['single'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('renders the date picker', async () => {
      const element = await controller.findElement('bento-date-picker');
      await expect(controller.isElementDisplayed(element)).to.be.true;

      const dateInput = await controller.findElement('input#date');
      await expect(controller.isElementDisplayed(dateInput)).to.be.true;
    });
  }
);
