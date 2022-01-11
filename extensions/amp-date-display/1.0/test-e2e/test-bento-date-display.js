describes.endtoend(
  'bento-timeago',
  {
    version: '1.0',
    fixture: 'bento/date-display.html',
    environments: ['single'], // TODO
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should render the date', async () => {
      const element = await controller.findElement('bento-date-display');

      await expect(controller.getElementText(element)).to.contain(
        'Thursday, December 9th 2021'
      );
    });

    it('should render the date for locale=fr-FR', async () => {
      const element = await controller.findElement('#fr');

      await expect(controller.getElementText(element)).to.contain(
        'jeudi, décembre 9th 2021'
      );
    });
  }
);
