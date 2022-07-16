import {afterRenderPromise} from '#testing/helpers';

import {
  findElements,
  resetAllElements,
  verifyElementsBuilt,
  verifyPromptsHidden,
} from './common';

describes.endtoend(
  'amp-consent',
  {
    fixture: 'amp-consent/amp-consent-basic-uses.amp.html#amp-geo=de',
    // TODO (micajuineho): Add shadow-demo after #25985 is fixed and viewer-demo when...
    environments: ['single'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should work with client side decision', async function () {
      this.timeout(5000);
      resetAllElements();
      const currentUrl = await controller.getCurrentUrl();

      // Verify no local storage decision
      await findElements(controller);
      await verifyElementsBuilt(controller, {
        'tillResponded': false,
        'accepted': false,
        'autoReject': true,
        'defaultBlock': false,
        'notBlocked': true,
        'twitter': false,
      });
      await verifyPromptsHidden(controller, {
        'ui1': true,
        'ui2': false,
        'postPromptUi': true,
      });

      // Client-side decision
      const acceptButton = await controller.findElement('#accept');
      await controller.click(acceptButton);

      await verifyElementsBuilt(controller, {
        'tillResponded': true,
        'accepted': true,
        'autoReject': true,
        'defaultBlock': true,
        'notBlocked': true,
        'twitter': true,
      });
      await verifyPromptsHidden(controller, {
        'ui1': true,
        'ui2': true,
        'postPromptUi': false,
      });

      // Navigate away to random page
      await controller.navigateTo('http://localhost:8000/');
      // Visit website again
      await controller.navigateTo(currentUrl);

      // Verify all elements are still built
      await findElements(controller);
      await verifyElementsBuilt(controller, {
        'tillResponded': true,
        'accepted': true,
        'autoReject': true,
        'defaultBlock': true,
        'notBlocked': true,
        'twitter': true,
      });
      await verifyPromptsHidden(controller, {
        'ui1': true,
        'ui2': true,
        'postPromptUi': false,
      });

      // Check the analytics request consentState. Wait for 1 second for the
      // request to arrive to avoid flaky test.
      await afterRenderPromise();
      await expect(
        'http://localhost:8000/amp4test/request-bank/e2e/deposit/tracking?consentState=sufficient'
      ).to.have.been.sent;
    });
  }
);
