import {expect} from 'chai';

describes.endtoend(
  'bento-date-countdown',
  {
    version: '1.0',
    fixture: 'bento/date-countdown.html',
    environments: ['single'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should render the date', async () => {
      const template = await controller.findElement('#one div p');

      const text = await controller.getElementProperty(template, 'textContent');
      const data = JSON.parse(text.trim());

      await expect(data['d']).to.equal('0');
      await expect(data['dd']).to.equal('00');
      await expect(data['h']).to.equal('0');
      await expect(data['hh']).to.equal('00');
      await expect(data['m']).to.equal('0');
      await expect(data['mm']).to.equal('00');
      await expect(data['s']).to.equal('0');
      await expect(data['ss']).to.equal('00');
    });
  }
);
