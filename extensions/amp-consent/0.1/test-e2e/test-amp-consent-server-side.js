import {awaitFrameAfter} from '#testing/helpers';

import {
  findElements,
  resetAllElements,
  verifyElementsBuilt,
  verifyPromptsHidden,
} from './common';

describes.endtoend(
  'amp-consent',
  {
    fixture: 'amp-consent/amp-consent-basic-uses.amp.html#amp-geo=us',
    // TODO (micajuineho): Add shadow-demo after #25985 is fixed and viewer-demo when...
    environments: ['single'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should respect server side decision and persist it', async function () {
      this.timeout(5000);
      resetAllElements();

      const currentUrl = await controller.getCurrentUrl();

      // Block/unblock elements based off of 'reject' from response
      await findElements(controller);
      await verifyElementsBuilt(controller, {
        'tillResponded': true,
        'accepted': false,
        'autoReject': true,
        'defaultBlock': false,
        'notBlocked': true,
        'twitter': false,
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

      // Verify same behavior after refresh
      await findElements(controller);
      await verifyElementsBuilt(controller, {
        'tillResponded': true,
        'accepted': false,
        'autoReject': true,
        'defaultBlock': false,
        'notBlocked': true,
        'twitter': false,
      });
      await verifyPromptsHidden(controller, {
        'ui1': true,
        'ui2': true,
        'postPromptUi': false,
      });

      // Check the analytics request consentState. Wait for 1 second for the
      // request to arrive to avoid flaky test.
      await awaitFrameAfter(500);
      await expect(
        'http://localhost:8000/amp4test/request-bank/e2e/deposit/tracking?consentState=insufficient'
      ).to.have.been.sent;
    });
  }
);
