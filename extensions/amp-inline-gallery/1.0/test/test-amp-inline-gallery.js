import '../../../amp-base-carousel/1.0/amp-base-carousel';
import '../amp-inline-gallery';
import {CarouselContextProp} from '#bento/components/bento-base-carousel/1.0/carousel-props';

import {ActionTrust_Enum} from '#core/constants/action-constants';
import {subscribe} from '#core/context';
import {createElementWithAttributes} from '#core/dom';
import {setStyles} from '#core/dom/style';

import {toggleExperiment} from '#experiments';

import {ActionInvocation} from '#service/action-impl';

import {waitFor} from '#testing/helpers/service';

describes.realWin(
  'amp-inline-gallery',
  {
    amp: {
      extensions: ['amp-inline-gallery:1.0', 'amp-base-carousel:1.0'],
    },
  },
  (env) => {
    let win;
    let element, carousel, pagination;
    let lastContext;

    beforeEach(async () => {
      win = env.win;
      toggleExperiment(win, 'bento-inline-gallery', true, true);
      toggleExperiment(win, 'bento-carousel', true, true);
      carousel = createElementWithAttributes(
        win.document,
        'amp-base-carousel',
        {
          'layout': 'fixed',
          'width': '300px',
          'height': '200px',
        }
      );
      pagination = createElementWithAttributes(
        win.document,
        'amp-inline-gallery-pagination',
        {
          'layout': 'fixed-height',
          'height': 24,
        }
      );
      element = createElementWithAttributes(
        win.document,
        'amp-inline-gallery',
        {
          'layout': 'container',
        }
      );
      element.appendChild(carousel);
      element.appendChild(pagination);

      // Add slides.
      for (let i = 0; i < 3; i++) {
        carousel.appendChild(newSlide(`${i}`));
      }

      // Wait until ready.
      win.document.body.appendChild(element);
      await element.buildInternal();
      await carousel.buildInternal();
      await pagination.buildInternal();

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

    afterEach(() => {
      toggleExperiment(win, 'bento-inline-gallery', false, true);
      toggleExperiment(win, 'bento-carousel', false, true);
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

    function invocation(method, args = {}) {
      const source = null;
      const caller = null;
      const event = null;
      const trust = ActionTrust_Enum.DEFAULT;
      return new ActionInvocation(
        element,
        method,
        args,
        source,
        caller,
        event,
        trust
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

    it('should navigate pagination using carousel', async () => {
      const scroller = getScroller();
      const dots = getDots();
      expect(lastContext.currentSlide).to.equal(0);
      expect(scroller.scrollLeft).to.equal(0);
      expect(dots[0].getAttribute('aria-selected')).to.equal('true');
      expect(dots[1].getAttribute('aria-selected')).to.equal('false');

      // Scroll carousel.
      carousel.enqueAction(invocation('goToSlide', {index: 1}));
      await waitFor(() => scroller.scrollLeft > 0, 'to to slide 1');

      // Context updated.
      await waitFor(() => lastContext.currentSlide == 1, 'currentSlide == 1');

      // Pagination updated.
      await waitFor(
        () => dots[1].getAttribute('aria-selected') == 'true',
        'pagination updated'
      );
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
