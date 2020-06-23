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

describes.endtoend(
  'amp-position-observer target in AMPHTML ad',
  {
    testUrl:
      'http://localhost:8000/test/fixtures/e2e/amp-position-observer/target-id.html',
    environments: 'amp4ads-preset',
    initialRect: {width: 800, height: 600},
  },
  testScroll
);

async function testScroll(env) {
  let controller;

  beforeEach(() => {
    controller = env.controller;
  });

  it('should animate clock hand while scrolling', async () => {
    const step = 50;
    const initPoint = {
      'width': 45,
      'height': 48,
      'x': 151,
      'y': 190,
    };
    const midPoint = {
      'width': 33,
      'height': 56,
      'x': 150,
      'y': 191,
    };
    const endPoint = {
      'width': 18,
      'height': 60,
      'x': 150,
      'y': 192,
    };
    await verifyClockHandRect(controller, initPoint);
    await scrollParentWindowYBy(controller, step);
    await verifyClockHandRect(controller, midPoint);
    await scrollParentWindowYBy(controller, step);
    await verifyClockHandRect(controller, endPoint);
    await scrollParentWindowYBy(controller, -step);
    await verifyClockHandRect(controller, midPoint);
    await scrollParentWindowYBy(controller, -step);
    await verifyClockHandRect(controller, initPoint);
  });
}

async function scrollParentWindowYBy(controller, px) {
  await controller.switchToParent();
  const article = await controller.getDocumentElement();
  await controller.scrollBy(article, {top: px});
  await controller
    .findElement('iframe')
    .then((frame) => controller.switchToFrame(frame));
}

async function verifyClockHandRect(controller, rect) {
  const clockHand = await controller.findElement('.clock-hand');
  const delta = controller
    .getElementRect(clockHand)
    .then((clockRect) =>
      Math.max(
        Math.abs(clockRect.x - rect.x),
        Math.abs(clockRect.y - rect.y),
        Math.abs(clockRect.width - rect.width),
        Math.abs(clockRect.height - rect.height)
      )
    );
  await expect(delta).to.be.below(2);
}
