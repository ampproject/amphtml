import 'babel-regenerator-runtime';
import * as describes from '../../../../testing/e2e/describes-e2e';

describes.endtoend('AMP carousel', {
  engines: ['selenium'],
}, async env => {
  const slottedClass = 'i-amphtml-carousel-slotted';

  let controller;

  async function getSlide(n) {
    return await controller.findElementXPath(
        `//amp-carousel//div[contains(@class, "${slottedClass}")][${n + 1}]`);
  }

  beforeEach(async() => {
    controller = env.controller;

    // Enable the amp-carousel-v2 and layers experiments.
    await controller.navigateTo(
        'http://localhost:8000/test/manual/amp-carousel-0-2/enable-experiment.html');
    await controller.findElement('.msg-div');

    await controller.navigateTo(
        'http://localhost:8000/test/manual/amp-carousel-0-2/basic.amp.html');
  });

  it('should distribute slides', async() => {
    // Having the 7th slide means we have all the previous ones too.
    await getSlide(6);
  });
});
