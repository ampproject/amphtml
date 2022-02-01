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
    fixture: 'amp-consent/amp-consent-basic-uses.amp.html#amp-geo=mx',
    // TODO (micajuineho): Add shadow-demo after #25985 is fixed, and viewer-demo when...
    environments: ['single'],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should respect server side decision and clear on next visit', async function () {
      this.timeout(10000);
      resetAllElements();
      const currentUrl = await controller.getCurrentUrl();
      const nextGeoUrl = currentUrl.replace('mx', 'ca');

      // Check the analytics request consentState
      await awaitFrameAfter(1000);
      await expect(
        'http://localhost:8000/amp4test/request-bank/e2e/deposit/tracking?consentState=insufficient'
      ).to.have.been.sent;

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
      // TODO (micajuineho) this should change once #26006 is fixed.
      await verifyPromptsHidden(controller, {
        'ui1': false,
        'ui2': true,
        'postPromptUi': true,
      });

      // Navigate away to random page
      await controller.navigateTo('http://localhost:8000/');
      // Refresh to differnt geolocation
      await controller.navigateTo(nextGeoUrl);

      // Verify it listened to new response
      await findElements(controller);
      await verifyElementsBuilt(controller, {
        'tillResponded': true,
        'accepted': true,
        'autoReject': true,
        'defaultBlock': true,
        'notBlocked': true,
        'twitter': true,
      });
      // TODO (micajuineho) this should change once #26006 is fixed.
      await verifyPromptsHidden(controller, {
        'ui1': false,
        'ui2': true,
        'postPromptUi': true,
      });

      // Check the analytics request consentState
      await awaitFrameAfter(1000);
      await expect(
        'http://localhost:8000/amp4test/request-bank/e2e/deposit/tracking?consentState=sufficient'
      ).to.have.been.sent;
    });
  }
);
