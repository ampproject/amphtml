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

describes.endtoend('AMP carousel', {
}, async env => {
  /** The total number of slides in the carousel */
  const SLIDE_COUNT = 7;
  const slottedClass = 'i-amphtml-carousel-slotted';
  const scrollerSelector = 'amp-carousel .i-amphtml-carousel-scroll';

  let controller;

  function prop(el, name) {
    return controller.getElementProperty(el, name);
  }

  async function waitForImgLoad(el) {
    await expect(prop(el, 'naturalWidth')).to.be.greaterThan(0);
  }

  async function waitForCarouselImg(n) {
    // We cannot use CSS's nth child due to non-slide elements in the scroll
    // container. We query all the imgs upfront, since they might not have
    // laid out yet.
    const el = await controller.findElementXPath(
        `//amp-carousel//div[contains(@class, "${slottedClass}")][${n + 1}]` +
        '//img');
    return await waitForImgLoad(el);
  }

  async function getSlide(n) {
    return await controller.findElementXPath(
        `//amp-carousel//div[contains(@class, "${slottedClass}")][${n + 1}]`);
  }

  beforeEach(async() => {
    controller = env.controller;

    // Enable the amp-carousel-v2 and layers experiments.
    await controller.navigateTo(
        'http://localhost:8000/test/manual/amp-carousel-0-2/enable-experiment.html');
    await controller.findElement('.msg-div');

    await controller.navigateTo(
        'http://localhost:8000/test/manual/amp-carousel-0-2/basic.amp.html');
  });

  it('should render correctly', async() => {
    await waitForCarouselImg(0);
    await controller.takeScreenshot('screenshots/render.png');
  });

  it('should layout the two adjacent slides', async() => {
    // TODO(sparhami) Verify this is on the right of the 0th slide
    await waitForCarouselImg(1);
    // TODO(sparhami) Verify this is on the left of the 0th slide
    await waitForCarouselImg(SLIDE_COUNT - 1);
  });

  it('should snap when scrolling', async() => {
    const el = await controller.findElement(scrollerSelector);
    const firstSlide = await getSlide(0);

    // Wait for the first two slides's imgs to load.
    await waitForCarouselImg(0);
    await waitForCarouselImg(1);

    const slideWidth = await prop(firstSlide, 'offsetWidth');
    const scrollLeft = await prop(el, 'scrollLeft');
    const snappedScrollLeft = scrollLeft + slideWidth;
    const requestedScrollLeft = snappedScrollLeft + 1;

    await controller.scroll(el, {left: requestedScrollLeft});
    // We should have snapped to the edge of the slide rather than the
    // requested scroll position.
    await expect(prop(el, 'scrollLeft')).to.equal(snappedScrollLeft);
    await controller.takeScreenshot('screenshots/snapped.png');
  });

  it('should reset the window after scroll', async() => {
    const el = await controller.findElement(scrollerSelector);
    const firstSlide = await getSlide(0);

    // Wait for the first two slides's imgs to load.
    await waitForCarouselImg(0);
    await waitForCarouselImg(1);

    const slideWidth = await prop(firstSlide, 'offsetWidth');
    const scrollWidth = await prop(el, 'scrollWidth');
    const scrollLeft = await prop(el, 'scrollLeft');
    const snappedScrollLeft = scrollLeft + slideWidth;
    const requestedScrollLeft = snappedScrollLeft + 1;

    await controller.scroll(el, {left: requestedScrollLeft});
    // Wait for the scrolling to settle
    await expect(prop(el, 'scrollLeft')).to.equal(snappedScrollLeft);
    // The new scroll width/left should eventually be the same as before,
    // since the windowing should have been reset around the new element.
    await expect(prop(el, 'scrollWidth')).to.equal(scrollWidth);
    await expect(prop(el, 'scrollLeft')).to.equal(scrollLeft);
    await controller.takeScreenshot('screenshots/after-reset.png');
  });

  it('should have the correct scroll position when resizing', async() => {
    // Note: 513 seems to be the smallest settable width.
    controller.setWindowRect({
      width: 300,
      height: 1000,
    });

    const firstSlide = await getSlide(0);

    // Wait for the first two slides's imgs to load.
    await waitForCarouselImg(0);
    await waitForCarouselImg(1);
    await expect(controller.getElementRect(firstSlide)).to.include({
      'x': 0,
      'width': 300,
    });

    controller.setWindowRect({
      width: 700,
      height: 1000,
    });

    // Normally, resizing would cause the position to change. We're testing
    // that the carousel moves this to the correct position again.
    await expect(controller.getElementRect(firstSlide)).to.include({
      'x': 0,
      'width': 700,
    });
    await controller.takeScreenshot('screenshots/after-resize.png');
  });

  describe('looping', () => {
    it('should show the last slide when looping', async() => {
      const el = await controller.findElement(scrollerSelector);
      const lastSlide = await getSlide(SLIDE_COUNT - 1);

      // Wait for the first and last slides to load.
      await waitForCarouselImg(0);
      await waitForCarouselImg(SLIDE_COUNT - 1);

      // Scroll to the previous slide by moving left by the last slide's width.
      const slideWidth = await prop(lastSlide, 'offsetWidth');
      const restingScrollLeft = await prop(el, 'scrollLeft');
      const snappedScrollLeft = restingScrollLeft - slideWidth;
      const requestedScrollLeft = snappedScrollLeft - 1;
      await controller.scroll(el, {left: requestedScrollLeft});

      await expect(prop(el, 'scrollLeft')).to.equal(snappedScrollLeft);
      await controller.takeScreenshot('screenshots/loop-past-start.png');
    });

    it('should show the first slide when looping', async() => {
      const el = await controller.findElement(scrollerSelector);
      const lastSlide = await getSlide(SLIDE_COUNT - 1);

      // Wait for the first and last slides to load.
      await waitForCarouselImg(0);
      await waitForCarouselImg(SLIDE_COUNT - 1);

      // Go to the last slide, wait for scrolling to move and window to reset.
      const slideWidth = await prop(lastSlide, 'offsetWidth');
      const restingScrollLeft = await prop(el, 'scrollLeft');
      const lastSlideScrollPos = restingScrollLeft - slideWidth;
      await controller.scroll(el, {left: lastSlideScrollPos});
      await expect(prop(el, 'scrollLeft')).to.equal(lastSlideScrollPos);
      await expect(prop(el, 'scrollLeft')).to.equal(restingScrollLeft);

      // Go to the next slide by moving the slides width to the right.
      const snappedScrollLeft = restingScrollLeft + slideWidth;
      const requestedScrollLeft = snappedScrollLeft + 1;
      await controller.scroll(el, {left: requestedScrollLeft});

      await expect(prop(el, 'scrollLeft')).to.equal(snappedScrollLeft);
      await controller.takeScreenshot('screenshots/loop-past-end.png');
    });

    // When resting the last few slides should be translated to the left.
    // Make sure we can move all the way forwards to the last slide and that it
    // is in the right place.
    it('should display slides correctly when moving forwards', async() => {
      const el = await controller.findElement(scrollerSelector);
      const lastSlide = await getSlide(SLIDE_COUNT - 1);

      // Wait for the first and last slides to load.
      await waitForCarouselImg(0);
      await waitForCarouselImg(SLIDE_COUNT - 1);

      // Go to the last slide, wait for scrolling to move.
      const slideWidth = await prop(lastSlide, 'offsetWidth');
      const restingScrollLeft = await prop(el, 'scrollLeft');
      const lastSlideScrollPos = restingScrollLeft +
          (slideWidth * (SLIDE_COUNT - 1));
      await controller.scroll(el, {left: lastSlideScrollPos});

      await expect(prop(el, 'scrollLeft')).to.not.equal(restingScrollLeft);
      await expect(prop(el, 'scrollLeft')).to.equal(restingScrollLeft);
      // TODO(sparhami) Make sure the slide is in the right place.
      await controller.takeScreenshot(
          'screenshots/loop-move-forwards-to-end.png');
    });

    // When resting the first few slides should be translated to the right.
    // Make sure we can move all the way backwards to the second slide and that
    // it is in the right place.
    it('should display slides correctly when moving backwards', async() => {
      const el = await controller.findElement(scrollerSelector);
      const secondSlide = await getSlide(1);

      // Wait for the first and second slides to load.
      await waitForCarouselImg(0);
      await waitForCarouselImg(1);

      // Go to the last slide, wait for scrolling to move.
      const slideWidth = await prop(secondSlide, 'offsetWidth');
      const restingScrollLeft = await prop(el, 'scrollLeft');
      const secondSlideScrollPos = restingScrollLeft -
          (slideWidth * (SLIDE_COUNT - 1));
      await controller.scroll(el, {left: secondSlideScrollPos});

      await expect(prop(el, 'scrollLeft')).to.not.equal(restingScrollLeft);
      await expect(prop(el, 'scrollLeft')).to.equal(restingScrollLeft);
      // TODO(sparhami) Make sure the slide is in the right place.
      await controller.takeScreenshot(
          'screenshots/loop-move-backwards-to-second.png');
    });
  });
});
