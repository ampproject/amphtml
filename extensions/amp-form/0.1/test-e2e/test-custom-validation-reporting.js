import {Key} from '#testing/helpers/types';

const expectedSubmitUrl =
  'https://example.com/submit?__amp_source_origin=http%3A%2F%2Flocalhost%3A8000';

describes.endtoend(
  'amp-form',
  {
    fixture: 'amp-form/custom-validation-reporting.html',
    environments: ['single'],
  },
  (env) => {
    let controller;
    let fullnameInput;
    let submitButton;

    beforeEach(async () => {
      controller = env.controller;
      fullnameInput = await controller.findElement('#fullname');
      submitButton = await controller.findElement('[type=submit]');
    });

    it('should not send submit request when input is invalid (default)', async () => {
      await controller.click(submitButton);
      await expect(expectedSubmitUrl).to.not.have.been.sent;
    });

    it('should send submit request when input is valid', async () => {
      await controller.type(fullnameInput, 'A B');
      await controller.click(submitButton);
      await expect(expectedSubmitUrl).to.have.been.sent;
    });

    it('should toggle [visible-when-invalid="valueMissing"] on input', async () => {
      const message = await controller.findElement(
        '[validation-for="fullname"][visible-when-invalid="valueMissing"]'
      );

      await expect(
        controller.getElementProperty(message, 'className')
      ).to.not.contain('visible');

      // has input:
      await controller.type(fullnameInput, 'A');
      await expect(
        controller.getElementProperty(message, 'className')
      ).to.not.contain('visible');

      // removes input:
      await controller.type(fullnameInput, Key.Backspace);
      await expect(
        controller.getElementProperty(message, 'className')
      ).to.contain('visible');

      // has input:
      await controller.type(fullnameInput, 'A');
      await expect(
        controller.getElementProperty(message, 'className')
      ).to.not.contain('visible');
    });

    it('should toggle [visible-when-invalid="patternMismatch"] on input', async () => {
      const message = await controller.findElement(
        '[validation-for="fullname"][visible-when-invalid="patternMismatch"]'
      );

      await expect(
        controller.getElementProperty(message, 'className')
      ).to.not.contain('visible');

      // pattern is incomplete:
      await controller.type(fullnameInput, 'A');
      await expect(
        controller.getElementProperty(message, 'className')
      ).to.contain('visible');

      // pattern is complete:
      await controller.type(fullnameInput, ' B');
      await expect(
        controller.getElementProperty(message, 'className')
      ).to.not.contain('visible');

      // undoes pattern complete:
      await controller.type(fullnameInput, Key.Backspace);
      await expect(
        controller.getElementProperty(message, 'className')
      ).to.contain('visible');
    });
  }
);
