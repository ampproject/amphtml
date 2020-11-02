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
/**
 * @fileoverview Some unit tests of the internal carousel implementation.
 */

import {Carousel} from '../carousel';
import {setInitialDisplay, setStyle, setStyles} from '../../../../src/style';
import {toArray} from '../../../../src/types';

describes.realWin('carousel implementation', {}, (env) => {
  let win;
  let doc;
  let element;
  let scrollContainer;

  /**
   * @param {function()} cb
   * @return {!Promise<undefined>}
   */
  function runMutate(cb) {
    return Promise.resolve().then(cb);
  }

  /**
   * @param {number} count
   * @return {!Array<!Element>}
   */
  function setSlides(count) {
    toArray(scrollContainer.querySelectorAll('test-slide')).forEach((slide) => {
      scrollContainer.removeChild(slide);
    });

    const slides = new Array(count).fill(null).map(() => {
      const slide = document.createElement('div');
      slide.className = 'test-slide';
      setStyles(slide, {
        flexShrink: '0',
        height: '100px',
        width: '100%',
      });
      return slide;
    });

    slides.forEach((slide) => scrollContainer.appendChild(slide));

    return slides;
  }

  /**
   *
   * @param {{
   *  slideCount: number,
   *  loop: boolean,
   *  forwards: boolean,
   * }} options
   */
  async function createCarousel({slideCount, loop, forwards = true}) {
    const carousel = new Carousel({
      win,
      element,
      scrollContainer,
      runMutate,
    });
    carousel.updateSlides(setSlides(slideCount));
    carousel.updateLoop(loop);
    carousel.updateForwards(forwards);
    await runMutate(() => {});

    return carousel;
  }

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    env.iframe.width = '1000';
    env.iframe.height = '1000';
    element = doc.createElement('div');
    scrollContainer = doc.createElement('div');
    setStyles(scrollContainer, {
      overflowX: 'auto',
      height: '100%',
    });
    setInitialDisplay(scrollContainer, 'flex');

    element.appendChild(scrollContainer);
    doc.body.appendChild(element);
    element.getAmpDoc = () => env.ampdoc;
  });

  afterEach(() => {
    doc.body.removeChild(element);
  });

  describe('isAtEnd', () => {
    it('should return true for fractional widths', async () => {
      setStyle(element, 'width', '299.2px');

      const carousel = await createCarousel({
        slideCount: 3,
        loop: false,
      });
      carousel.goToSlide(2, {smoothScroll: false});

      expect(carousel.isAtEnd()).to.be.true;
    });

    it('should return false when not at end', async () => {
      setStyle(element, 'width', '299.2px');

      const carousel = await createCarousel({
        slideCount: 3,
        loop: false,
      });
      carousel.goToSlide(1, {smoothScroll: false});

      expect(carousel.isAtEnd()).to.be.false;
    });

    it('should return false when looping', async () => {
      setStyle(element, 'width', '299.2px');

      const carousel = await createCarousel({
        slideCount: 3,
        loop: true,
      });
      carousel.goToSlide(2, {smoothScroll: false});

      expect(carousel.isAtEnd()).to.be.false;
    });

    it('should return true when at end for RTL', async () => {
      setStyle(element, 'width', '299.2px');
      element.setAttribute('dir', 'rtl');

      const carousel = await createCarousel({
        slideCount: 3,
        loop: false,
        forwards: false,
      });
      carousel.goToSlide(2, {smoothScroll: false});

      expect(carousel.isAtEnd()).to.be.true;
    });

    // TODO(#30563): fix and unskip.
    it.skip('should return false when at not at end for RTL', async () => {
      setStyle(element, 'width', '299.2px');
      element.setAttribute('dir', 'rtl');

      const carousel = await createCarousel({
        slideCount: 3,
        loop: false,
        forwards: false,
      });
      carousel.goToSlide(1, {smoothScroll: false});

      expect(carousel.isAtEnd()).to.be.false;
    });
  });

  describe('isAtStart', () => {
    it('should return true for fractional widths', async () => {
      setStyle(element, 'width', '299.2px');

      const carousel = await createCarousel({
        slideCount: 3,
        loop: false,
      });
      await runMutate(() => {});

      expect(carousel.isAtStart()).to.be.true;
    });

    it('should return false when not at start', async () => {
      setStyle(element, 'width', '299.2px');

      const carousel = await createCarousel({
        slideCount: 3,
        loop: false,
      });
      carousel.goToSlide(1, {smoothScroll: false});

      expect(carousel.isAtStart()).to.be.false;
    });

    it('should return false when looping', async () => {
      setStyle(element, 'width', '299.2px');

      const carousel = await createCarousel({
        slideCount: 3,
        loop: true,
      });

      expect(carousel.isAtStart()).to.be.false;
    });

    // TODO(#30563): fix and unskip.
    it.skip('should return true when at start for RTL', async () => {
      setStyle(element, 'width', '299.2px');
      element.setAttribute('dir', 'rtl');

      const carousel = await createCarousel({
        slideCount: 3,
        loop: false,
        forwards: false,
      });

      expect(carousel.isAtStart()).to.be.true;
    });

    it('should return false when not at start for RTL', async () => {
      setStyle(element, 'width', '299.2px');
      element.setAttribute('dir', 'rtl');

      const carousel = await createCarousel({
        slideCount: 3,
        loop: false,
        forwards: false,
      });
      carousel.goToSlide(1, {smoothScroll: false});

      expect(carousel.isAtStart()).to.be.false;
    });
  });

  describe('resetScrollReferencePoint_', () => {
    it('currentElementOffset_ & currentIndex_ should be set when it is a' + 
    ' programmatic scroll', async () => {
      setStyle(element, 'width', '299.2px');

      const carousel = await createCarousel({
        slideCount: 12,
        loop: false,
      });

      // Fake the scroll that ends short of the correct index.
      // This is handled by scroll event listener.
      carousel.touching_ = false;
      carousel.requestedIndex_ = 1;
      carousel.currentIndex_ = 0;
      carousel.restingIndex_ = 0;
      carousel.currentElementOffset_ = -0.99382;

      carousel.resetScrollReferencePoint_();

      expect(carousel.currentElementOffset_).to.equal(0);
      expect(carousel.currentIndex_).to.equal(1);
      expect(carousel.requestedIndex_).to.be.null;
    });
  });
});
