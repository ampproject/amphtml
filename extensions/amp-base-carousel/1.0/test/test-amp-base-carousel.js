import '../amp-base-carousel';
import {ActionInvocation} from '#service/action-impl';
import {ActionTrust_Enum} from '#core/constants/action-constants';
import {createElementWithAttributes, waitForChildPromise} from '#core/dom';
import {setStyles} from '#core/dom/style';
import {toArray} from '#core/types/array';
import {toggleExperiment} from '#experiments';
import {useStyles} from '../component.jss';
import {waitFor, whenCalled} from '#testing/helpers/service';

describes.realWin(
  'amp-base-carousel:1.0',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-base-carousel:1.0'],
    },
  },
  (env) => {
    let win;
    let element;

    const styles = useStyles();

    async function getSlideWrappersFromShadow() {
      await whenCalled(env.sandbox.spy(element, 'attachShadow'));
      const shadow = element.shadowRoot;
      await waitForChildPromise(shadow, (shadow) => {
        return shadow.querySelectorAll('[class*=hideScrollbar]');
      });
      await waitFor(
        () =>
          shadow.querySelectorAll(`[class*=${styles.hideScrollbar}] `).length >
          0,
        'slots rendered'
      );
      return shadow.querySelectorAll(
        `[class*=${styles.hideScrollbar}] [class*=${styles.slideElement}]`
      );
    }

    async function getSlidesFromShadow() {
      const wrappers = await getSlideWrappersFromShadow();
      const slots = Array.from(wrappers)
        .map((wrapper) => wrapper.querySelector('slot'))
        .filter(Boolean);
      return toArray(slots).reduce(
        (acc, slot) => acc.concat(slot.assignedElements()),
        []
      );
    }

    /**
     * @param {number} count
     * @return {!Array<!Element>}
     */
    function setSlides(count) {
      toArray(element.querySelectorAll('test-slide')).forEach((slide) =>
        element.removeChild(slide)
      );

      const slides = new Array(count).fill(null).map((x, i) => {
        const slide = document.createElement('div');
        slide.className = 'test-slide';
        setStyles(slide, {
          flexShrink: '0',
          height: '100px',
          width: '100%',
        });
        slide.textContent = 'slide #' + (i + 1);
        return slide;
      });

      slides.forEach((slide) => element.appendChild(slide));
      return slides;
    }

    beforeEach(() => {
      win = env.win;
      toggleExperiment(win, 'bento-carousel', true, true);
      element = createElementWithAttributes(win.document, 'amp-base-carousel', {
        'layout': 'fixed',
        'width': '300px',
        'height': '200px',
      });
    });

    afterEach(() => {
      toggleExperiment(win, 'bento-carousel', false, true);
    });

    describe('imperative api', () => {
      let scroller;
      let slides;
      beforeEach(async () => {
        const userSuppliedChildren = setSlides(3);
        userSuppliedChildren.forEach((child) => element.appendChild(child));
        win.document.body.appendChild(element);
        slides = await getSlidesFromShadow();
        scroller = element.shadowRoot.querySelector(
          `[class*=${styles.scrollContainer}]`
        );
      });
      afterEach(() => {
        win.document.body.removeChild(element);
      });
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
      it('should execute next and prev actions', async () => {
        element.enqueAction(invocation('next'));
        await waitFor(
          () => scroller.scrollLeft === slides[1].offsetLeft,
          'advanced to next slide'
        );
        element.enqueAction(invocation('prev'));
        await waitFor(
          () => scroller.scrollLeft === slides[0].offsetLeft,
          'returned to prev slide'
        );
      });
      it('should execute goToSlide action', async () => {
        element.enqueAction(invocation('goToSlide', {index: 1}));
        await waitFor(() => scroller.scrollLeft > 0, 'to slide 1');
        element.enqueAction(invocation('goToSlide', {index: 0}));
        await waitFor(
          () => scroller.scrollLeft == 0,
          'returned to first slide'
        );
      });
    });

    it('should go to slide 0 when index is set to 0', async () => {
      const userSuppliedChildren = setSlides(3);
      userSuppliedChildren.forEach((child) => element.appendChild(child));
      win.document.body.appendChild(element);
      await getSlidesFromShadow();

      const scroller = element.shadowRoot.querySelector(
        `[class*=${styles.scrollContainer}]`
      );

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

      element.enqueAction(invocation('goToSlide', {index: 1}));
      await waitFor(() => scroller.scrollLeft > 0, 'go to slide 1');

      element.enqueAction(invocation('goToSlide', {index: 0}));
      await waitFor(() => scroller.scrollLeft == 0, 'returned to first slide');
    });
  }
);
