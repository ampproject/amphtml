import '../amp-stream-gallery';
import {setStyle, setStyles} from '#core/dom/style';
import {toArray} from '#core/types/array';

import {toggleExperiment} from '#experiments';

import {getDetail, listenOncePromise} from '#utils/event-helper';

import {CarouselEvents} from '../../../amp-base-carousel/0.1/carousel-events';

/**
 * @fileoverview Some simple tests for amp-stream-gallery. Most of the
 *    functionality for changing slides, resizing, etc should be handled by
 *    the base implementation via amp-base-carousel's tests.
 */

/**
 * @param {!Element} el
 * @param {number=} index An indtex to wait for.
 * @return {!Promise<undefined>}
 */
async function afterIndexUpdate(el, index) {
  const event = await listenOncePromise(el, CarouselEvents.INDEX_CHANGE);
  const impl = await el.getImpl(false);
  await impl.mutateElement(() => {});
  await impl.mutateElement(() => {});

  if (index != undefined && getDetail(event)['index'] != index) {
    return afterIndexUpdate(el, index);
  }
}

/**
 * @param {!Element} el
 * @param {string} attributeName
 * @return {!Promise<undefined>}
 */
async function afterAttributeMutation(el, attributeName) {
  return new Promise((resolve) => {
    const mo = new el.ownerDocument.defaultView.MutationObserver(() => {
      resolve();
    });
    mo.observe(el, {
      attributes: true,
      attributeFilter: [attributeName],
    });
  });
}

function getNextArrowSlot(el) {
  return el.querySelector('.i-amphtml-stream-gallery-arrow-next-slot');
}

function getNextButton(el) {
  return el.querySelector('.i-amphtml-stream-gallery-arrow-next-slot > *');
}

function getPrevArrowSlot(el) {
  return el.querySelector('.i-amphtml-stream-gallery-arrow-prev-slot');
}

function getPrevButton(el) {
  return el.querySelector('.i-amphtml-stream-gallery-arrow-prev-slot > *');
}

// Use an empty gif as the image source, since we do not care what it is.
const IMG_URL =
  'data:image/gif;base64,' +
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

describes.realWin(
  'amp-stream-gallery',
  {
    amp: {
      extensions: ['amp-stream-gallery'],
    },
  },
  (env) => {
    let win;
    let doc;
    let container;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      env.iframe.width = '1000';
      env.iframe.height = '1000';
      container = doc.createElement('div');
      doc.body.appendChild(container);

      toggleExperiment(win, 'amp-stream-gallery', true);
    });

    afterEach(() => {
      doc.body.removeChild(container);
    });

    /**
     * @param {!Element} el
     * @return {!Array<!Element>}
     */
    function getItems(el) {
      return toArray(el.querySelectorAll('[role="list"] > [role="listitem"]'));
    }

    /**
     * @param {!Element} el
     * @return {!Element}
     */
    function getScrollContainer(el) {
      return el.querySelector('.i-amphtml-carousel-scroll');
    }

    async function getGallery({
      attrs = {},
      customArrows = false,
      slideCount = 5,
      width,
    } = {}) {
      const el = doc.createElement('amp-stream-gallery');
      el.setAttribute('layout', 'fixed');
      el.setAttribute('width', width);
      el.setAttribute('height', '200');

      for (const attr in attrs) {
        el.setAttribute(attr, attrs[attr]);
      }

      for (let i = 0; i < slideCount; i++) {
        const img = doc.createElement('amp-img');
        img.setAttribute('src', IMG_URL);
        img.setAttribute('width', '200');
        img.setAttribute('height', '200');
        el.appendChild(img);
      }

      if (customArrows) {
        const prevArrow = document.createElement('div');
        prevArrow.className = 'custom-arrow';
        prevArrow.setAttribute('slot', 'prev-arrow');
        setStyles(prevArrow, {
          width: '60px',
          height: '60px',
        });
        el.appendChild(prevArrow);

        const nextArrow = document.createElement('div');
        nextArrow.className = 'custom-arrow';
        nextArrow.setAttribute('slot', 'next-arrow');
        setStyles(nextArrow, {
          width: '60px',
          height: '60px',
        });
        el.appendChild(nextArrow);
      }

      container.appendChild(el);

      await el.buildInternal();
      await el.layoutCallback();
      await afterIndexUpdate(el);

      return el;
    }

    describe('rendering', () => {
      describe('inset arrows', () => {
        it('should be correct for default arrows', async () => {
          const el = await getGallery({
            slideCount: 5,
            width: 800,
            attrs: {
              'min-item-width': '200',
            },
          });

          expect(toArray(getItems(el))).to.have.length(5);
          expect(getPrevButton(el).getBoundingClientRect()).to.include({
            width: 40,
            left: 0,
          });
          expect(getNextButton(el).getBoundingClientRect()).to.include({
            width: 40,
            right: 800,
          });
        });

        it('should be correct for custom arrows', async () => {
          const el = await getGallery({
            slideCount: 5,
            customArrows: true,
            width: 800,
            attrs: {
              'min-item-width': '200',
            },
          });

          expect(toArray(getItems(el))).to.have.length(5);
          expect(getPrevButton(el).className).to.equal('custom-arrow');
          expect(getNextButton(el).className).to.equal('custom-arrow');
          expect(getPrevButton(el).getBoundingClientRect()).to.include({
            width: 60,
            left: 0,
          });
          expect(getNextButton(el).getBoundingClientRect()).to.include({
            width: 60,
            right: 800,
          });
        });
      });

      describe('outset arrows', () => {
        it('should be correct for default arrows', async () => {
          const el = await getGallery({
            slideCount: 5,
            width: 800,
            attrs: {
              'min-item-width': '200',
              'outset-arrows': 'true',
            },
          });

          expect(getItems(el)).to.have.length(5);
          expect(getScrollContainer(el).getBoundingClientRect()).to.include({
            width: 700,
            left: 50,
            right: 750,
          });
          expect(getPrevButton(el).getBoundingClientRect()).to.include({
            width: 32,
            left: 6,
          });
          expect(getNextButton(el).getBoundingClientRect()).to.include({
            width: 32,
            right: 794,
          });
        });

        it('should be correct for custom arrows', async () => {
          const el = await getGallery({
            slideCount: 5,
            customArrows: true,
            width: 800,
            attrs: {
              'min-item-width': '200',
              'outset-arrows': 'true',
            },
          });

          expect(getItems(el)).to.have.length(5);
          expect(getScrollContainer(el).getBoundingClientRect()).to.include({
            width: 680,
            left: 60,
            right: 740,
          });
          expect(getPrevButton(el).getBoundingClientRect()).to.include({
            width: 60,
            left: 0,
          });
          expect(getNextButton(el).getBoundingClientRect()).to.include({
            width: 60,
            right: 800,
          });
        });
      });
    });

    describe('min-item-width', () => {
      it('should have correct widths on a boundary', async () => {
        const slideCount = 5;
        const el = await getGallery({
          slideCount,
          width: 800,
          attrs: {
            'min-item-width': '200',
          },
        });

        getItems(el).forEach((item) => {
          expect(item.getBoundingClientRect().width).to.be.closeTo(
            800 / 4,
            0.1
          );
        });
        expect(getScrollContainer(el).getBoundingClientRect().width).to.equal(
          800
        );
      });

      it('should have correct widths before a boundary', async () => {
        const slideCount = 5;
        const el = await getGallery({
          slideCount,
          width: 799,
          attrs: {
            'min-item-width': '200',
          },
        });

        getItems(el).forEach((item) => {
          expect(item.getBoundingClientRect().width).to.be.closeTo(
            799 / 3,
            0.1
          );
        });
        expect(getScrollContainer(el).getBoundingClientRect().width).to.equal(
          799
        );
      });

      it('should have correct widths after a boundary', async () => {
        const slideCount = 5;
        const el = await getGallery({
          slideCount,
          width: 801,
          attrs: {
            'min-item-width': '200',
          },
        });

        getItems(el).forEach((item) => {
          expect(item.getBoundingClientRect().width).to.be.closeTo(
            801 / 4,
            0.1
          );
        });
        expect(getScrollContainer(el).getBoundingClientRect().width).to.equal(
          801
        );
      });

      it('should account for peeking slides', async () => {
        const slideCount = 5;
        const el = await getGallery({
          slideCount,
          width: 600,
          attrs: {
            'min-item-width': '150',
            'peek': '0.5',
          },
        });

        getItems(el).forEach((item) => {
          expect(item.getBoundingClientRect().width).to.be.closeTo(
            600 / 3.5,
            0.1
          );
        });
        expect(getScrollContainer(el).getBoundingClientRect().width).to.equal(
          600
        );
      });
    });

    describe('max-item-width', () => {
      it('should not cap width when larger than item width', async () => {
        const slideCount = 5;
        const el = await getGallery({
          slideCount,
          width: 750,
          attrs: {
            'min-item-width': '200',
            'max-item-width': '300',
          },
        });

        getItems(el).forEach((item) => {
          expect(item.getBoundingClientRect().width).to.be.closeTo(
            750 / 3,
            0.1
          );
        });
        expect(getScrollContainer(el).getBoundingClientRect().width).to.equal(
          750
        );
      });

      it('should cap width when needed', async () => {
        const slideCount = 5;
        const el = await getGallery({
          slideCount,
          width: 750,
          attrs: {
            'min-item-width': '200',
            'max-item-width': '225',
          },
        });

        getItems(el).forEach((item) => {
          expect(item.getBoundingClientRect().width).to.be.closeTo(225, 0.1);
        });
        expect(getScrollContainer(el).getBoundingClientRect().width).to.equal(
          675
        );
      });

      it('should cap for peeking slides', async () => {
        const slideCount = 5;
        const el = await getGallery({
          slideCount,
          width: 600,
          attrs: {
            'min-item-width': '150',
            'max-item-width': '160',
            'peek': '0.5',
          },
        });

        getItems(el).forEach((item) => {
          expect(item.getBoundingClientRect().width).to.be.closeTo(160, 0.1);
        });
        expect(getScrollContainer(el).getBoundingClientRect().width).to.equal(
          560
        );
      });
    });

    describe('min-visible-count', () => {
      it('should enforce a min number of visible items', async () => {
        const slideCount = 5;
        const el = await getGallery({
          slideCount,
          width: 300,
          attrs: {
            'min-item-width': '200',
            'min-visible-count': '2',
          },
        });

        getItems(el).forEach((item) => {
          expect(item.getBoundingClientRect().width).to.be.closeTo(
            300 / 2,
            0.1
          );
        });
        expect(getScrollContainer(el).getBoundingClientRect().width).to.equal(
          300
        );
      });
    });

    describe('max-visible-count', () => {
      it('should enforce a max number of visible items', async () => {
        const slideCount = 5;
        const el = await getGallery({
          slideCount,
          width: 800,
          attrs: {
            'min-item-width': '200',
            'max-visible-count': '3',
          },
        });

        getItems(el).forEach((item) => {
          expect(item.getBoundingClientRect().width).to.be.closeTo(
            800 / 3,
            0.1
          );
        });
        expect(getScrollContainer(el).getBoundingClientRect().width).to.equal(
          800
        );
      });

      it('should limit width of the scrolling container', async () => {
        const slideCount = 5;
        const el = await getGallery({
          slideCount,
          width: 800,
          attrs: {
            'min-item-width': '100',
            'max-item-width': '100',
            'max-visible-count': '4',
          },
        });

        getItems(el).forEach((item) => {
          expect(item.getBoundingClientRect().width).to.be.closeTo(100, 0.1);
        });
        expect(getScrollContainer(el).getBoundingClientRect().width).to.equal(
          400
        );
      });

      it('should not take effect when there are fewer slides', async () => {
        const slideCount = 5;
        const el = await getGallery({
          slideCount,
          width: 800,
          attrs: {
            'min-item-width': '100',
            'max-item-width': '100',
            'max-visible-count': '7',
          },
        });

        getItems(el).forEach((item) => {
          expect(item.getBoundingClientRect().width).to.be.closeTo(100, 0.1);
        });
        expect(getScrollContainer(el).getBoundingClientRect().width).to.equal(
          500
        );
      });
    });

    describe('outset arrows', () => {
      it('should affect space given to each slide', async () => {
        const slideCount = 5;
        const el = await getGallery({
          slideCount,
          width: 800,
          attrs: {
            'outset-arrows': 'true',
            'min-item-width': '200',
          },
        });

        expect(getNextArrowSlot(el).getBoundingClientRect().width).to.equal(50);
        expect(getPrevArrowSlot(el).getBoundingClientRect().width).to.equal(50);

        getItems(el).forEach((item) => {
          expect(item.getBoundingClientRect().width).to.be.closeTo(
            700 / 3,
            0.1
          );
        });
        expect(getScrollContainer(el).getBoundingClientRect().width).to.equal(
          700
        );
      });
    });

    describe('extra-space', () => {
      it('should go to the right by default', async () => {
        const slideCount = 5;
        const el = await getGallery({
          slideCount,
          width: 800,
          attrs: {
            'min-item-width': '150',
            'max-item-width': '150',
            'max-visible-count': '3',
          },
        });

        expect(getScrollContainer(el).getBoundingClientRect().width).to.equal(
          450
        );
        expect(getScrollContainer(el).getBoundingClientRect().left).to.equal(0);
      });

      it('should go around when specified', async () => {
        const slideCount = 5;
        const el = await getGallery({
          slideCount,
          width: 800,
          attrs: {
            'min-item-width': '150',
            'max-item-width': '150',
            'max-visible-count': '3',
            'extra-space': 'around',
          },
        });

        expect(getScrollContainer(el).getBoundingClientRect().width).to.equal(
          450
        );
        expect(getScrollContainer(el).getBoundingClientRect().left).to.equal(
          175
        );
      });

      it('should go around when specified and using outset arrows', async () => {
        const slideCount = 5;
        const el = await getGallery({
          slideCount,
          width: 800,
          attrs: {
            'min-item-width': '150',
            'max-item-width': '150',
            'max-visible-count': '3',
            'extra-space': 'around',
            'outset-arrows': 'true',
          },
        });

        expect(getNextArrowSlot(el).getBoundingClientRect().width).to.equal(50);
        expect(getPrevArrowSlot(el).getBoundingClientRect().width).to.equal(50);

        expect(getScrollContainer(el).getBoundingClientRect().width).to.equal(
          450
        );
        expect(getScrollContainer(el).getBoundingClientRect().left).to.equal(
          175
        );
        expect(getPrevArrowSlot(el).getBoundingClientRect().left).to.equal(125);
        expect(getNextArrowSlot(el).getBoundingClientRect().left).to.equal(625);
      });
    });

    describe('next button', () => {
      it('should move forwards by a whole item count', async () => {
        const slideCount = 10;
        const el = await getGallery({
          slideCount,
          width: 500,
          attrs: {
            'min-item-width': '200',
            'peek': '0.5',
            'loop': 'true',
          },
        });
        const items = getItems(el);

        // Go to slide instantly for testing.
        setStyle(getScrollContainer(el), 'scroll-behavior', 'auto');

        expect(items[0].getBoundingClientRect().left).to.equal(0);
        expect(items[0].getBoundingClientRect().width).to.equal(200);

        getNextButton(el).click();

        expect(items[0].getBoundingClientRect().left).to.equal(-400);
        expect(items[2].getBoundingClientRect().left).to.equal(0);
      });

      it('should be disabled at the end when not looping', async function () {
        const slideCount = 10;
        const el = await getGallery({
          slideCount,
          width: 500,
          attrs: {
            'min-item-width': '200',
            'max-item-width': '200',
            'peek': '0.5',
            'loop': 'false',
          },
        });
        const items = getItems(el);
        const nextButton = getNextButton(el);

        // Go to slide instantly for testing.
        setStyle(getScrollContainer(el), 'scroll-behavior', 'auto');

        items[9].scrollIntoView();
        await afterAttributeMutation(nextButton, 'disabled');

        expect(nextButton.disabled).to.be.true;
      });
    });

    describe('prev button', () => {
      it('should move backwards by a whole item count', async () => {
        const slideCount = 10;
        const el = await getGallery({
          slideCount,
          width: 500,
          attrs: {
            'min-item-width': '200',
            'peek': '0.5',
            'loop': 'true',
          },
        });
        const items = getItems(el);

        // Go to slide instantly for testing.
        setStyle(getScrollContainer(el), 'scroll-behavior', 'auto');

        expect(items[0].getBoundingClientRect().left).to.equal(0);
        expect(items[0].getBoundingClientRect().width).to.equal(200);

        getPrevButton(el).click();

        expect(items[0].getBoundingClientRect().left).to.equal(400);
        expect(items[8].getBoundingClientRect().left).to.equal(0);
      });

      it('should be disabled at start when not looping', async () => {
        const slideCount = 10;
        const el = await getGallery({
          slideCount,
          width: 500,
          attrs: {
            'min-item-width': '200',
            'peek': '0.5',
            'loop': 'false',
          },
        });

        expect(getPrevButton(el).disabled).to.be.true;
      });
    });
  }
);
