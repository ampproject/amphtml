import {CSS as BaseCarouselCss} from '#build/bento-base-carousel-1.0.css';
import {CSS as InlineGalleryCss} from '#build/bento-inline-gallery-1.0.css';
import {CSS as InlineGalleryPaginationCss} from '#build/bento-inline-gallery-pagination-1.0.css';

import {BaseElement as BentoBaseCarousel} from '#bento/components/bento-base-carousel/1.0/base-element';
import {CarouselContextProp} from '#bento/components/bento-base-carousel/1.0/carousel-props';
import {defineElement} from '#bento/components/bento-inline-gallery/1.0/web-component';
import {adoptStyles} from '#bento/util/unit-helpers';

import {subscribe} from '#core/context';
import {createElementWithAttributes} from '#core/dom';
import {setStyles} from '#core/dom/style';

import {defineBentoElement} from '#preact/bento-ce';

import {waitFor} from '#testing/helpers/service';

describes.realWin(
  'bento-inline-gallery',
  {
    amp: false,
  },
  (env) => {
    let win;
    let element, carousel, pagination;
    let lastContext;

    beforeEach(async () => {
      win = env.win;
      defineElement(win);
      defineBentoElement('bento-base-carousel', BentoBaseCarousel, win);
      adoptStyles(win, BaseCarouselCss);
      adoptStyles(win, InlineGalleryCss);
      adoptStyles(win, InlineGalleryPaginationCss);

      carousel = createElementWithAttributes(
        win.document,
        'bento-base-carousel',
        {
          style: 'width: 300px; height: 200px;',
        }
      );
      pagination = createElementWithAttributes(
        win.document,
        'bento-inline-gallery-pagination',
        {
          style: 'height: 24px;',
        }
      );
      element = createElementWithAttributes(
        win.document,
        'bento-inline-gallery'
      );
      element.appendChild(carousel);
      element.appendChild(pagination);

      // Add slides.
      for (let i = 0; i < 3; i++) {
        carousel.appendChild(newSlide(`${i}`));
      }

      // Wait until ready.
      win.document.body.appendChild(element);
      await Promise.all([
        element.getApi(),
        carousel.getApi(),
        pagination.getApi(),
      ]);

      lastContext = null;
      subscribe(element, [CarouselContextProp], (context) => {
        lastContext = context;
      });
      await waitFor(
        () =>
          lastContext && lastContext.slides && lastContext.slides.length > 0,
        'context and slide set'
      );
      await waitFor(() => getScroller(), 'carousel rendered');
      await waitFor(() => getDots().length > 0, 'pagination rendered');
    });

    function newSlide(id) {
      const slide = document.createElement('div');
      slide.className = 'test-slide';
      setStyles(slide, {
        flexShrink: '0',
        height: '100px',
        width: '100%',
      });
      slide.textContent = 'slide ' + id;
      return slide;
    }

    function getDots() {
      const dots =
        pagination.shadowRoot &&
        pagination.shadowRoot.querySelectorAll('[role=button],button');
      return dots;
    }

    function getScroller() {
      const {shadowRoot} = carousel;
      return (
        shadowRoot && shadowRoot.querySelector('[class*=scroll-container]')
      );
    }

    it('should render the right number of slides', () => {
      expect(lastContext.slides.length).to.equal(3);
      const dots = getDots();
      expect(dots).to.have.lengthOf(3);
    });

    it('should navigate carousel using pagination', async () => {
      const dots = getDots();
      dots[1].click();

      // Context updated.
      await waitFor(() => lastContext.currentSlide == 1, 'currentSlide == 1');

      // Carousel updated.
      const scroller = getScroller();
      await waitFor(() => scroller.scrollLeft > 0, 'advanced to next slide');
    });

    it('should add a new slide', async () => {
      carousel.appendChild(newSlide('new'));

      // Context updated.
      await waitFor(() => lastContext.slides.length == 4, 'slide.length == 4');

      // Pagination updated.
      await waitFor(() => getDots().length == 4, 'pagination updated');
    });
  }
);
