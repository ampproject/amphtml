describes.endtoend(
  'amp-position-observer in AMPHTML ad',
  {
    fixture: 'amp-position-observer/scrollbound-animation.html',
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
      'width': 53,
      'height': 39,
      'x': 151,
      'y': 110,
    };
    const midPoint = {
      'width': 37,
      'height': 54,
      'x': 150,
      'y': 111,
    };
    const endPoint = {
      'width': 14,
      'height': 60,
      'x': 150,
      'y': 112,
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
  await expect(controller.getElementRect(clockHand)).to.include(rect);
}
