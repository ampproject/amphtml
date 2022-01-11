describes.endtoend(
  'bento-timeago',
  {
    version: '1.0',
    fixture: 'bento/timeago.html',
    environments: ['single'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    const setup = async () => {
      return [
        await controller.findElement('bento-timeago'),
        await controller.findElement('#displayTimeInput'),
        await controller.findElement('#bentoChangeTimeFormSubmit'),
      ];
    };

    it('should render how long ago a time was set to', async () => {
      const [timeago, timeInput, timeSubmit] = await setup();

      await expect(controller.getElementAttribute(timeago, 'class')).to.equal(
        'i-amphtml-built'
      );
      await expect(controller.getElementText(timeago)).to.contain(
        '3 years ago'
      );

      const currentTime = new Date();
      await controller.type(timeInput, currentTime.toISOString());
      await controller.click(timeSubmit);

      await expect(
        controller.getElementAttribute(timeago, 'datetime')
      ).to.equal(currentTime.toISOString());
      await expect(controller.getElementText(timeago)).to.contain('just now');
    });
  }
);
