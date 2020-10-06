/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
  HEIGHT: 768,
  WIDTH: 1024,
};

describes.endtoend(
  'amp-story-auto-ads:fullbleed',
  {
    testUrl:
      'http://localhost:8000/test/fixtures/e2e/amp-story-auto-ads/fullbleed.html',
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
      await validateAdSize(controller);
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
  }
);

async function validateAdSize(controller) {
  const activeIframe = await controller.findElement('[active] iframe');
  // Ad should be centered, 75vh tall, and 3/5 * 75vh wide.
  await expect(controller.getElementRect(activeIframe)).to.include({
    left: 339,
    top: 96,
    right: 685,
    bottom: 672,
  });
}

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
  // Overlayed onto centered and resized iframe.
  await expect(controller.getElementRect(ctaButton)).to.include({
    bottom: 640,
    height: 36,
    width: 120,
  });
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

  // Aligned to bottom-left of creative. Max height is 15px and asset will be
  // scaled down proportionally to fit.
  await expect(controller.getElementRect(attribution)).to.include({
    bottom: 672,
    left: 339,
    height: 15,
    width: 15,
  });

  await controller.switchToLight();
}
