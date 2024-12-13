/**
 * @fileoverview Some unit tests of the internal carousel implementation.
 */

import {setInitialDisplay, setStyle, setStyles} from '#core/dom/style';
import {toArray} from '#core/types/array';

import {dev} from '#utils/log';

import {Carousel} from '../carousel';

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
  async function createCarousel({
    forwards = true,
    initialIndex,
    loop,
    slideCount,
  }) {
    const carousel = new Carousel({
      win,
      element,
      scrollContainer,
      runMutate,
      initialIndex,
    });
    carousel.updateLoop(loop);
    carousel.updateSlides(setSlides(slideCount));
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

    it('should return false when at not at end for RTL', async () => {
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

    it('should return true when at start for RTL', async () => {
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
    it(
      'currentElementOffset_ & currentIndex_ should be set when it is a' +
        ' programmatic scroll',
      async () => {
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
      }
    );
  });

  it('should warn if no slides', async () => {
    const warnSpy = env.sandbox.spy(dev(), 'warn');
    await createCarousel({slideCount: 0, loop: false});

    expect(warnSpy).to.be.calledOnce;
    expect(warnSpy.args[0][1]).to.match(/No slides were found./);

    warnSpy.resetHistory();
    await createCarousel({
      slideCount: 12,
      loop: false,
    });
    expect(warnSpy).to.not.be.called;
  });

  describe('initialIndex', () => {
    it('should start at slide 1 with initialIndex set to 1', async () => {
      const carousel = await createCarousel({
        slideCount: 3,
        initialIndex: 1,
      });
      expect(carousel.isAtStart()).to.be.false;
    });

    it('should start at slide 0 with negative initialIndex', async () => {
      const carousel = await createCarousel({
        slideCount: 3,
        initialIndex: -1,
      });
      expect(carousel.isAtStart()).to.be.true;
    });

    it('should clamp to last index with initialIndex that is greater than last slide index', async () => {
      const carousel = await createCarousel({
        slideCount: 3,
        initialIndex: 4,
      });
      expect(carousel.isAtEnd()).to.be.true;
    });

    it('should start at slide 0 with invalid initialIndex', async () => {
      const carousel = await createCarousel({
        slideCount: 3,
        initialIndex: NaN,
      });
      expect(carousel.isAtStart()).to.be.true;
    });

    it('should start at slide 1 with initialIndex set to 1', async () => {
      const carousel = await createCarousel({
        slideCount: 3,
        initialIndex: 1,
        loop: true,
      });
      expect(carousel.getCurrentIndex()).to.equal(1);
    });

    it('should normalize slide with negative initialIndex when looping', async () => {
      const carousel = await createCarousel({
        slideCount: 3,
        initialIndex: -1,
        loop: true,
      });
      expect(carousel.getCurrentIndex()).to.equal(2);
    });

    it('should normalize slide with initialIndex that is greater than last slide index when looping', async () => {
      const carousel = await createCarousel({
        slideCount: 3,
        initialIndex: 4,
        loop: true,
      });
      expect(carousel.getCurrentIndex()).to.equal(1);
    });

    it('should start at slide 0 with invalid initialIndex when looping', async () => {
      const carousel = await createCarousel({
        slideCount: 3,
        initialIndex: NaN,
        loop: true,
      });
      expect(carousel.getCurrentIndex()).to.equal(0);
    });
  });
});
