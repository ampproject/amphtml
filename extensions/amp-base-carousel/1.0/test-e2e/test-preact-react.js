import {useStyles} from '#bento/components/bento-base-carousel/1.0/component.jss';

import {
  getScrollingElement,
  isElementInViewport,
  isElementOutOfViewport,
} from './helpers';

describes.endtoend(
  'bento-base-carousel react e2e',
  {
    bentoComponentName: 'base-carousel',
    testFor: 'react',
    version: '1.0',
    fixture: 'dist/bento-base-carousel-e2e-build-react.html',
    environments: ['single'],
  },
  TestSuite
);
describes.endtoend(
  'bento-base-carousel preact e2e',
  {
    bentoComponentName: 'base-carousel',
    testFor: 'preact',
    version: '1.0',
    fixture: 'dist/bento-base-carousel-e2e-build-preact.html',
    environments: ['single'],
  },
  TestSuite
);

function TestSuite(env) {
  const styles = useStyles();
  let controller;

  beforeEach(() => {
    controller = env.controller;
  });

  it('should display 2 slides and loop back to the start when pressing next', async () => {
    const initSlides = await controller.findElements('[data-slide]');

    await isElementOutOfViewport(initSlides[0], controller);
    await expect(controller.getElementText(initSlides[0])).to.equal('3');
    await isElementOutOfViewport(initSlides[1], controller);
    await expect(controller.getElementText(initSlides[1])).to.equal('4');
    await isElementInViewport(initSlides[2], controller);
    await expect(controller.getElementText(initSlides[2])).to.equal('0');
    await isElementInViewport(initSlides[3], controller);
    await expect(controller.getElementText(initSlides[3])).to.equal('1');
    await isElementOutOfViewport(initSlides[4], controller);
    await expect(controller.getElementText(initSlides[4])).to.equal('2');

    const nextButton = await controller.findElement(
      '[aria-label="Next item in carousel"]'
    );
    await controller.click(nextButton);
    const slides2 = await controller.findElements('[data-slide]');

    await isElementOutOfViewport(slides2[0], controller);
    await expect(controller.getElementText(slides2[0])).to.equal('4');
    await isElementOutOfViewport(slides2[1], controller);
    await expect(controller.getElementText(slides2[1])).to.equal('0');
    await isElementInViewport(slides2[2], controller);
    await expect(controller.getElementText(slides2[2])).to.equal('1');
    await isElementInViewport(slides2[3], controller);
    await expect(controller.getElementText(slides2[3])).to.equal('2');
    await isElementOutOfViewport(slides2[4], controller);
    await expect(controller.getElementText(slides2[4])).to.equal('3');

    const exernalNextButton = await controller.findElement(
      '[data-testid="next"]'
    );
    await controller.click(exernalNextButton);
    const slides3 = await controller.findElements('[data-slide]');
    await isElementOutOfViewport(slides3[0], controller);
    await expect(controller.getElementText(slides3[0])).to.equal('0');
    await isElementOutOfViewport(slides3[1], controller);
    await expect(controller.getElementText(slides3[1])).to.equal('1');
    await isElementInViewport(slides3[2], controller);
    await expect(controller.getElementText(slides3[2])).to.equal('2');
    await isElementInViewport(slides3[3], controller);
    await expect(controller.getElementText(slides3[3])).to.equal('3');
    await isElementOutOfViewport(slides3[4], controller);
    await expect(controller.getElementText(slides3[4])).to.equal('4');

    const el = await getScrollingElement(styles, controller);
    await controller.scrollBy(el, {top: 200});
    // This will wait for the animation to play before running the other expects
    // Another problem is that it takes a short delay before the DOM shuffles the slides around
    // Once we fix the animations we might need to do this for ALL the asserts
    await expect(
      controller.getElementRect(
        await controller.findElement('[data-slide="3"]')
      )
    ).to.include({top: 8});

    await controller.click(nextButton);
    await controller.click(nextButton);
    const slides4 = await controller.findElements('[data-slide]');

    await isElementOutOfViewport(slides4[0], controller);
    await expect(controller.getElementText(slides4[0])).to.equal('3');
    await isElementOutOfViewport(slides4[1], controller);
    await expect(controller.getElementText(slides4[1])).to.equal('4');
    await isElementInViewport(slides4[2], controller);
    await expect(controller.getElementText(slides4[2])).to.equal('0');
    await isElementInViewport(slides4[3], controller);
    await expect(controller.getElementText(slides4[3])).to.equal('1');
    await isElementOutOfViewport(slides4[4], controller);
    await expect(controller.getElementText(slides4[4])).to.equal('2');
  });

  it('should be able to jump around the slider', async () => {
    const initSlides = await controller.findElements('[data-slide]');

    await isElementOutOfViewport(initSlides[0], controller);
    await expect(controller.getElementText(initSlides[0])).to.equal('3');
    await isElementOutOfViewport(initSlides[1], controller);
    await expect(controller.getElementText(initSlides[1])).to.equal('4');
    await isElementInViewport(initSlides[2], controller);
    await expect(controller.getElementText(initSlides[2])).to.equal('0');
    await isElementInViewport(initSlides[3], controller);
    await expect(controller.getElementText(initSlides[3])).to.equal('1');
    await isElementOutOfViewport(initSlides[4], controller);
    await expect(controller.getElementText(initSlides[4])).to.equal('2');

    const exernalGoToButton = await controller.findElement(
      '[data-testid="goto"]'
    );
    await controller.click(exernalGoToButton);
    await expect(
      controller.getElementRect(
        await controller.findElement('[data-slide="3"]')
      )
    ).to.include({top: 8});
    await expect(
      controller.getElementRect(
        await controller.findElement('[data-slide="4"]')
      )
    ).to.include({top: 228});

    // If this tests starts to become flacky, consider removing everything after this comment
    const prevButton = await controller.findElement(
      '[aria-label="Previous item in carousel"]'
    );
    await controller.click(prevButton);
    await expect(
      controller.getElementRect(
        await controller.findElement('[data-slide="2"]')
      )
    ).to.include({top: 8});
    await expect(
      controller.getElementRect(
        await controller.findElement('[data-slide="3"]')
      )
    ).to.include({top: 228});

    const exernalPrevButton = await controller.findElement(
      '[data-testid="prev"]'
    );
    await controller.click(exernalPrevButton);
    await expect(
      controller.getElementRect(
        await controller.findElement('[data-slide="1"]')
      )
    ).to.include({top: 8});
    await expect(
      controller.getElementRect(
        await controller.findElement('[data-slide="2"]')
      )
    ).to.include({top: 228});
  });
}
