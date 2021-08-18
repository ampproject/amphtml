describes.endtoend(
  'layoutCallback depends on updated viewport size after documentHeight change.',
  {
    fixture: 'amp4email/viewport-size-race.html',
    environments: ['email-demo'],
  },
  (env) => {
    it('Should call amp-img layoutCallback', async () => {
      const {controller} = env;
      const imgEl = await controller.findElement('img');
      await expect(imgEl).ok;
    });
  }
);

describes.endtoend(
  'layoutCallback depending on element remeasurement after documentHeight change.',
  {
    fixture: 'amp4email/element-size-race.html',
    environments: ['email-demo'],
  },
  (env) => {
    it('Should call amp-list layoutCallback', async () => {
      const {controller} = env;
      const ampListChild = await controller.findElement('.fruit');
      await expect(ampListChild).ok;
    });
  }
);
