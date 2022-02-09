describes.endtoend(
  'amp-date-picker',
  {
    version: '1.0',
    fixture: 'bento/date-picker',
    experiments: ['bento-date-picker'],
    environments: ['single', 'viewer-demo'],
  },
  (env) => {
    let controller;
    let singleDatePicker;

    beforeEach(async () => {
      controller = env.controller;

      singleDatePicker = await controller.findElement('#single-date-picker');
    });

    it('displays the initial visible month', async () => {
      const text = await controller.getElementProperty(
        singleDatePicker,
        'textContent'
      );
      await expect(text).to.contain('January 2022');
    });
  }
);
