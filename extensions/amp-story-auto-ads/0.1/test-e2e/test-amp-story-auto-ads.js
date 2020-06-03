/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  clickThroughPages,
  switchToAdFrame,
} from './test-amp-story-auto-ads-utils';

const viewport = {
  HEIGHT: 823,
  WIDTH: 500,
};

describes.endtoend(
  'amp-story-auto-ads:basic',
  {
    testUrl:
      'http://localhost:8000/test/fixtures/e2e/amp-story-auto-ads/basic.html',
    initialRect: {width: viewport.WIDTH, height: viewport.HEIGHT},
    // TODO(ccordry): reenable shadow demo? fails while waiting for
    // .amp-doc-host[style="visibility: visible;"]
    // TODO(ccordry): re-enable viewer-demo that should handle the 64px
    // offset set by the viewer header.
    environments: ['single' /*, 'viewer-demo'*/],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should render correctly', async () => {
      await clickThroughPages(controller, /* numPages */ 7);
      const activePage = await controller.findElement('[active]');
      await expect(controller.getElementAttribute(activePage, 'ad')).to.exist;
      await validateAdOverlay(controller);
      await validateAdAttribution(
        controller,
        '/test/fixtures/e2e/amphtml-ads/resource/icon.png' // iconUrl
      );
      await validateCta(
        controller,
        'https://www.amp.dev' // ctaUrl
      );

      await switchToAdFrame(controller);
      const body = await controller.findElement('body');
      await expect(controller.getElementAttribute(body, 'amp-story-visible')).to
        .exist;
      await controller.switchToParent();
    });

    // TODO(ccordry): write test that checks attribution click -- will
    // require additional changes to controller interface.
  }
);

describes.endtoend(
  'amp-story-auto-ads:dv3',
  {
    testUrl:
      'http://localhost:8000/test/fixtures/e2e/amp-story-auto-ads/dv3-request.html',
    initialRect: {width: viewport.WIDTH, height: viewport.HEIGHT},
    // TODO(ccordry): re-enable viewer-demo that should handle the 64px
    // offset set by the viewer header.
    environments: ['single' /*, 'viewer-demo'*/],
  },
  (env) => {
    let controller;

    beforeEach(() => {
      controller = env.controller;
    });

    it('should render correctly', async () => {
      await clickThroughPages(controller, /* numPages */ 7);
      const activePage = await controller.findElement('[active]');
      await expect(controller.getElementAttribute(activePage, 'ad')).to.exist;
      await validateAdOverlay(controller);
      await validateAdAttribution(
        controller,
        'https://googleads.g.doubleclick.net/pagead/images/mtad/ad_choices_blue.png' // iconUrl
      );
      await validateCta(
        controller,
        'https://adclick.g.doubleclick.net/pcs/123'
      );

      switchToAdFrame(controller);
      const movedBody = await controller.findElement('#x-a4a-former-body');
      await expect(
        controller.getElementAttribute(movedBody, 'amp-story-visible')
      ).to.exist;
    });
  }
);

async function validateAdOverlay(controller) {
  const overlayHost = await controller.findElement(
    '.i-amphtml-ad-overlay-host'
  );
  await controller.switchToShadowRoot(overlayHost);

  const adOverlayContainer = await controller.findElement(
    '.i-amphtml-ad-overlay-container'
  );
  await expect(controller.getElementAttribute(adOverlayContainer, 'ad-showing'))
    .to.exist;

  const adBadge = await controller.findElement('.i-amphtml-story-ad-badge');
  await expect(controller.getElementText(adBadge)).to.equal('Ad');
  await expect(controller.getElementCssValue(adBadge, 'visibility')).to.equal(
    'visible'
  );
  // Design spec is 14px from top, 16px from left.
  await expect(controller.getElementRect(adBadge)).to.include({
    left: 16,
    top: 14,
  });

  await controller.switchToLight();
}

async function validateCta(controller, ctaUrl) {
  const ctaButton = await controller.findElement('.i-amphtml-story-ad-link');
  await expect(controller.getElementCssValue(ctaButton, 'visibility')).to.equal(
    'visible'
  );
  await expect(controller.getElementAttribute(ctaButton, 'target')).to.equal(
    '_blank'
  );
  await expect(controller.getElementAttribute(ctaButton, 'href')).to.equal(
    ctaUrl
  );
  await expect(controller.getElementAttribute(ctaButton, 'role')).to.equal(
    'link'
  );
  // Design spec: 32px from bottom, min-width 120px, 36px height.
  await expect(controller.getElementRect(ctaButton)).to.include({
    bottom: viewport.HEIGHT - 32,
    height: 36,
    width: 120,
  });
  // TODO(ccordry): write e2e test for dynamic font scaling when launched.
  await expect(controller.getElementCssValue(ctaButton, 'font-size')).to.equal(
    '14px'
  );
}

async function validateAdAttribution(controller, iconUrl) {
  const attributionHost = await controller.findElement(
    '.i-amphtml-attribution-host'
  );
  await controller.switchToShadowRoot(attributionHost);

  const attribution = await controller.findElement(
    '.i-amphtml-story-ad-attribution'
  );
  await expect(controller.getElementAttribute(attribution, 'src')).to.equal(
    iconUrl
  );
  await expect(
    controller.getElementCssValue(attribution, 'visibility')
  ).to.equal('visible');

  // Design spec: aligned to bottom-left. Max height is 15px and asset will be
  // scaled down proportionally to fit.
  // TODO(ccordry): write test for oversized asset.
  await expect(controller.getElementRect(attribution)).to.include({
    bottom: viewport.HEIGHT,
    left: 0,
    height: 15,
    width: 15,
  });

  await controller.switchToLight();
}
