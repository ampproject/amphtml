import {Key} from '../../../../build-system/tasks/e2e/e2e-types';

describes.endtoend(
  'custom browser events',
  {
    fixture: 'amp-analytics/browser-events.html',
    environments: ['single'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    function sleep(ms) {
      return new Promise((res) => setTimeout(res, ms));
    }

    it('click on input field to focus and then blur', async () => {
      const focusedInputField = await controller.findElement('#inputText');
      const blurredInputField = await controller.findElement('#inputText2');

      await controller.click(blurredInputField);
      await controller.click(focusedInputField);

      // Sleep 1 second for the blur event to be sent
      await sleep(1000);
      await expect('https://foo.com/event?type=blur&eventId=inputText2').to.have
        .been.sent;
    });

    it('click on dropdown menu to focus and then blur', async () => {
      const focusedDropdown = await controller.findElement('#dropDown');
      const blurredDropdown = await controller.findElement('#dropDown2');

      await controller.click(blurredDropdown);
      await controller.click(focusedDropdown);

      // Sleep 1 second for the blur event to be sent
      await sleep(1000);
      await expect('https://foo.com/event?type=blur&eventId=dropDown2').to.have
        .been.sent;
    });

    it('change the content of the input field to trigger on change event', async () => {
      const changedInputField = await controller.findElement('#inputText');

      await controller.click(changedInputField);
      await sleep(300);
      await controller.type(changedInputField, 'test-text');
      await controller.type(changedInputField, Key.Enter);

      // Sleep 1 second for the change event to be sent
      await sleep(1000);
      await expect('https://foo.com/event?type=change&eventId=inputText').to
        .have.been.sent;
    });

    it('change drop down option selected to trigger on change event', async () => {
      const changedDropdown = await controller.findElement('#dropDown');

      await controller.click(changedDropdown);
      await controller.type(changedDropdown, '1');
      await controller.type(changedDropdown, Key.Enter);
      // Sleep 1 second for the change event to be sent
      await sleep(1000);
      await expect('https://foo.com/event?type=change&eventId=dropDown').to.have
        .been.sent;
    });
  }
);
