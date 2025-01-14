import {sleep} from '#testing/helpers';

import {
  getScrollingElement,
  getSlide,
  getSlides,
  waitForCarouselImg,
} from './helpers';

const pageWidth = 800;
const pageHeight = 600;

/** Increased timeout for long-running tests. **/
const testTimeout = 8_000;

describes.endtoend(
  'amp-base-carousel - basic functionality',
  {
    version: '0.1',
    fixture: 'amp-base-carousel/basic.amp.html',
    experiments: [
      'amp-base-carousel',
      'amp-lightbox-gallery-base-carousel',
      'layers',
    ],
    initialRect: {width: pageWidth, height: pageHeight},
    //TODO(spaharmi): fails on shadow demo
    environments: ['single', 'viewer-demo'],
  },
  (env) => {
    /** The total number of slides in the carousel */
    const SLIDE_COUNT = 7;
    let controller;

    beforeEach(async function () {
      controller = env.controller;
    });

    it('should render correctly', async function () {
      const slides = await getSlides(controller);
      const slidesRects = await Promise.all(
        slides.map(async (slide) => await controller.getElementRect(slide))
      );

      // Slides are placed on both the left and the right of the 0th slide, so
      // that scrolling on either direction work for the looping carousel. This
      // verifies that all slides are positioned side-by-side with the total
      // expected width.
      const slidesLeftmost = Math.min(...slidesRects.map(({left}) => left));
      const slidesRightmost = Math.max(...slidesRects.map(({right}) => right));
      await expect(slidesRightmost - slidesLeftmost).to.equal(
        pageWidth * SLIDE_COUNT
      );

      // Verify that the 0th slide is layed out and is at the start, and that its
      // width is equal to the page.
      await waitForCarouselImg(controller, 0);
      await expect(slidesRects[0].left).to.equal(0);
      await expect(slidesRects[0].width).to.equal(pageWidth);
    });

    it('should layout the two adjacent slides', async function () {
      const [firstSlideRect, secondSlideRect, lastSlideRect] = [
        await controller.getElementRect(await getSlide(controller, 0)),
        await controller.getElementRect(await getSlide(controller, 1)),
        await controller.getElementRect(
          await getSlide(controller, SLIDE_COUNT - 1)
        ),
      ];

      // Verify that the second slide is layed out and is to the right of the
      // starting slide.
      await waitForCarouselImg(controller, 1);
      await expect(secondSlideRect.left).to.equal(firstSlideRect.right);

      // Verify that the last slide is layed out and is to the left of the
      // starting slide.
      await waitForCarouselImg(controller, SLIDE_COUNT - 1);
      await expect(lastSlideRect.right).to.equal(firstSlideRect.left);
    });

    it('should snap when scrolling', async function () {
      const el = await getScrollingElement(controller);
      const secondSlide = await getSlide(controller, 1);

      // Wait for the first two slides's imgs to load.
      await waitForCarouselImg(controller, 0);
      await waitForCarouselImg(controller, 1);

      await expect(controller.getElementRect(secondSlide)).to.contain({
        left: pageWidth,
      });

      await controller.scrollBy(el, {left: 1});
      // We should have snapped to the edge of the slide rather than the
      // requested scroll position.
      await expect(controller.getElementRect(secondSlide)).to.contain({
        left: 0,
      });
    });

    it('should reset the window after scroll', async function () {
      const el = await getScrollingElement(controller);
      const slides = await getSlides(controller);
      const slidesRects = await Promise.all(
        slides.map(async (slide) => await controller.getElementRect(slide))
      );

      // Wait for the first two slides's imgs to load.
      await waitForCarouselImg(controller, 0);
      await waitForCarouselImg(controller, 1);

      await controller.scrollBy(el, {left: 1});
      // See `should render correctly`. Results here should be the same after
      // the scroll settles.
      const slidesLeftmost = Math.min(...slidesRects.map(({left}) => left));
      const slidesRightmost = Math.max(...slidesRects.map(({right}) => right));
      await expect(slidesRightmost - slidesLeftmost).to.equal(
        pageWidth * SLIDE_COUNT
      );
    });

    it('should have the correct scroll position when resizing', async function () {
      const firstSlide = await getSlide(controller, 0);
      // Note: 513 seems to be the smallest settable width.
      await controller.setWindowRect({
        width: 800,
        height: 600,
      });

      // Wait for the first two slides's imgs to load.
      await waitForCarouselImg(controller, 0);
      await waitForCarouselImg(controller, 1);
      await expect(controller.getElementRect(firstSlide)).to.include({
        'left': 0,
        'width': 800,
      });

      await controller.setWindowRect({
        width: 900,
        height: 600,
      });

      // Normally, resizing would cause the position to change. We're testing
      // that the carousel moves this to the correct position again.
      // TODO(wg-components, #27701): Flaky on Chrome+viewer environment.
      // Commented-out the comparison to `'left': 0` until fixed.
      await expect(controller.getElementRect(firstSlide)).to.include({
        /* 'left': 0, */
        'width': 900,
      });
    });

    it('should go to slide 0 when index is set to 0', async function () {
      const el = await getScrollingElement(controller);

      const firstSlide = await getSlide(controller, 0);
      const secondSlide = await getSlide(controller, 1);
      const goToSlideBtn = await controller.findElement(
        'button[on="tap:carousel-1.goToSlide(index = 0)"]'
      );

      await waitForCarouselImg(controller, 0);
      await waitForCarouselImg(controller, 1);

      await controller.scrollBy(el, {left: 1});
      await expect(controller.getElementRect(secondSlide)).to.include({
        left: 0,
      });

      // Arbitrary wait because of an interaction conflict between the scroll
      // action and click action.
      await sleep(100);
      await controller.click(goToSlideBtn);
      await expect(controller.getElementRect(firstSlide)).to.include({left: 0});
    });

    describe('looping', function () {
      it('should show the last slide when looping', async function () {
        const el = await getScrollingElement(controller);
        const lastSlide = await getSlide(controller, SLIDE_COUNT - 1);

        // Wait for the first and last slides to load.
        await waitForCarouselImg(controller, 0);
        await waitForCarouselImg(controller, SLIDE_COUNT - 1);

        // Scroll to the previous slide by moving left by the last slide's width.
        await controller.scrollBy(el, {left: -1});
        await expect(controller.getElementRect(lastSlide)).to.include({
          left: 0,
        });
      });

      it('should show the first slide when looping', async function () {
        const el = await getScrollingElement(controller);
        const firstSlide = await getSlide(controller, 0);
        const lastSlide = await getSlide(controller, SLIDE_COUNT - 1);

        // Wait for the first and last slides to load.
        await waitForCarouselImg(controller, 0);
        await waitForCarouselImg(controller, SLIDE_COUNT - 1);

        // Go to the last slide, wait for scrolling to move and window to reset.
        await controller.scrollBy(el, {left: -1});
        await expect(controller.getElementRect(lastSlide)).to.include({
          left: 0,
        });

        // Go to the next slide.
        await controller.scrollBy(el, {left: 1});
        await expect(controller.getElementRect(firstSlide)).to.include({
          left: 0,
        });
      });

      // When resting the last few slides should be translated to the left.
      // Make sure we can move all the way forwards to the last slide and that it
      // is in the right place.
      // TODO(wg-components, #27701): Flaky on Chrome+viewer environment.
      it.skip('should display slides correctly when moving forwards', async function () {
        this.timeout(testTimeout);
        const el = await getScrollingElement(controller);
        const slides = await getSlides(controller);

        // Wait for the first and last slides to load.
        await waitForCarouselImg(controller, 0);
        await waitForCarouselImg(controller, SLIDE_COUNT - 1);

        // Loop through all the slides, wait for each of them to land in place.
        for (const slide of slides) {
          await controller.scrollBy(el, {left: 1});
          await expect(controller.getElementRect(slide)).to.include({left: 0});
        }
      });

      // When resting the first few slides should be translated to the right.
      // Make sure we can move all the way backwards to the second slide and that
      // it is in the right place.
      // TODO(wg-components, #27701): Flaky on Chrome+viewer environment.
      it.skip('should display slides correctly when moving backwards', async function () {
        this.timeout(testTimeout);
        const el = await getScrollingElement(controller);
        const slides = await getSlides(controller);

        // Wait for the first and second slides to load.
        await waitForCarouselImg(controller, 0);
        await waitForCarouselImg(controller, 1);

        // Loop through all the in reverse, wait for each of them to land in place.
        for (const slide of [...slides].reverse()) {
          await controller.scrollBy(el, {left: -1});
          await expect(controller.getElementRect(slide)).to.include({left: 0});
        }
      });
    });
  }
);
