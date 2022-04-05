import {useStyles} from '#bento/components/bento-base-carousel/1.0/component.jss';

import {
  getScrollingElement,
  isElementInViewport,
  isElementOutOfViewport,
} from './helpers';

describes.endtoend(
  'bento-base-carousel',
  {
    version: '1.0',
    fixture: 'bento/base-carousel.html',
    environments: ['single'],
  },
  (env) => {
    const styles = useStyles();
    let controller;

    beforeEach(() => (controller = env.controller));

    async function expectSlideToBeAtStartingPosition(slide) {
      return await expect(controller.getElementRect(slide)).to.satisfy(
        // CircleCI slides are off by one pixel for some reason
        ({left}) => left <= 9 && left > 0
      );
    }

    async function getInitalSlides() {
      const slides = await controller.findElements('[slot]');
      await expectSlideToBeAtStartingPosition(slides[1]);

      await isElementOutOfViewport(slides[0], controller);
      await isElementInViewport(slides[1], controller);
      await isElementInViewport(slides[2], controller);
      await isElementInViewport(slides[3], controller);
      await isElementOutOfViewport(slides[4], controller);
      await isElementOutOfViewport(slides[5], controller);
      await isElementOutOfViewport(slides[6], controller);

      return slides;
    }

    describe('light DOM controls', () => {
      it('should jump to a slide', async () => {
        const slides = await getInitalSlides();

        const gotoButton = await controller.findElement('#go-to-button');
        await controller.click(gotoButton);

        await expectSlideToBeAtStartingPosition(slides[2]);
        await isElementOutOfViewport(slides[0], controller);
        await isElementOutOfViewport(slides[1], controller);
        await isElementInViewport(slides[2], controller);
        await isElementInViewport(slides[3], controller);
        await isElementInViewport(slides[4], controller);
        await isElementOutOfViewport(slides[5], controller);
        await isElementOutOfViewport(slides[6], controller);
      });

      it('should be able to go to the next slide', async () => {
        const slides = await getInitalSlides();

        const nextButton = await controller.findElement('#next-button');
        await controller.click(nextButton);
        await expectSlideToBeAtStartingPosition(slides[2]);
        await isElementOutOfViewport(slides[0], controller);
        await isElementOutOfViewport(slides[1], controller);
        await isElementInViewport(slides[2], controller);
        await isElementInViewport(slides[3], controller);
        await isElementInViewport(slides[4], controller);
        await isElementOutOfViewport(slides[5], controller);
        await isElementOutOfViewport(slides[6], controller);
      });

      it('should be able to go to the previous slide', async () => {
        const slides = await getInitalSlides();

        const previousButton = await controller.findElement('#prev-button');
        await controller.click(previousButton);

        await expectSlideToBeAtStartingPosition(slides[0]);
        await isElementInViewport(slides[0], controller);
        await isElementInViewport(slides[1], controller);
        await isElementInViewport(slides[2], controller);
        await isElementOutOfViewport(slides[3], controller);
        await isElementOutOfViewport(slides[4], controller);
        await isElementOutOfViewport(slides[5], controller);
        await isElementOutOfViewport(slides[6], controller);
      });
    });

    describe('shadowDOM controls', () => {
      it('should scroll to the previous slide', async () => {
        const slides = await getInitalSlides();
        const element = await controller.findElement('bento-base-carousel');
        await controller.switchToShadowRoot(element);

        const sliderContainer = await getScrollingElement(styles, controller);
        await controller.scrollBy(sliderContainer, {left: -300});
        await expectSlideToBeAtStartingPosition(slides[0]);
        await isElementInViewport(slides[0], controller);
        await isElementInViewport(slides[1], controller);
        await isElementInViewport(slides[2], controller);
        await isElementOutOfViewport(slides[3], controller);
        await isElementOutOfViewport(slides[4], controller);
        await isElementOutOfViewport(slides[5], controller);
        await isElementOutOfViewport(slides[6], controller);
      });

      it('should scroll the next slide when pressing the next button', async () => {
        const slides = await getInitalSlides();
        const element = await controller.findElement('bento-base-carousel');
        await controller.switchToShadowRoot(element);

        const nextButton = await controller.findElement(
          '[aria-label="Next item in carousel"]'
        );
        await controller.click(nextButton);

        await expectSlideToBeAtStartingPosition(slides[2]);
        await isElementOutOfViewport(slides[0], controller);
        await isElementOutOfViewport(slides[1], controller);
        await isElementInViewport(slides[2], controller);
        await isElementInViewport(slides[3], controller);
        await isElementInViewport(slides[4], controller);
        await isElementOutOfViewport(slides[5], controller);
        await isElementOutOfViewport(slides[6], controller);
      });

      it('should scroll to the previous slide when pressing the previous button', async () => {
        const slides = await getInitalSlides();
        const element = await controller.findElement('bento-base-carousel');
        await controller.switchToShadowRoot(element);

        const prevButton = await controller.findElement(
          '[aria-label="Previous item in carousel"]'
        );
        await controller.click(prevButton);
        await expectSlideToBeAtStartingPosition(slides[0]);
        await isElementInViewport(slides[0], controller);
        await isElementInViewport(slides[1], controller);
        await isElementInViewport(slides[2], controller);
        await isElementOutOfViewport(slides[3], controller);
        await isElementOutOfViewport(slides[4], controller);
        await isElementOutOfViewport(slides[5], controller);
        await isElementOutOfViewport(slides[6], controller);
      });
    });
  }
);
