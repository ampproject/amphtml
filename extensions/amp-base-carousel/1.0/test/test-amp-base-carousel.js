import '../amp-base-carousel';
import {useStyles} from '#bento/components/bento-base-carousel/1.0/component.jss';

import {ActionTrust_Enum} from '#core/constants/action-constants';
import {createElementWithAttributes, waitForChildPromise} from '#core/dom';
import {setStyles} from '#core/dom/style';
import {mod} from '#core/math';
import {toArray} from '#core/types/array';

import {toggleExperiment} from '#experiments';

import {ActionInvocation} from '#service/action-impl';

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

    it('should render slides and arrows when built', async () => {
      const userSuppliedChildren = setSlides(3);
      userSuppliedChildren.forEach((child) => element.appendChild(child));
      win.document.body.appendChild(element);

      const renderedSlides = await getSlidesFromShadow();
      expect(renderedSlides).to.have.ordered.members(userSuppliedChildren);
      const buttons = element.shadowRoot.querySelectorAll('button');
      expect(buttons).to.have.length(2);
    });

    it('should render custom arrows when given', async () => {
      const customPrev = createElementWithAttributes(win.document, 'button', {
        'slot': 'prev-arrow',
      });
      const customNext = createElementWithAttributes(win.document, 'button', {
        'slot': 'next-arrow',
      });
      element.appendChild(customPrev);
      element.appendChild(customNext);
      const userSuppliedChildren = setSlides(3);
      userSuppliedChildren.forEach((child) => element.appendChild(child));
      win.document.body.appendChild(element);

      const renderedSlides = await getSlidesFromShadow();
      expect(renderedSlides).to.have.ordered.members(userSuppliedChildren);

      const defaultButtons = element.shadowRoot.querySelectorAll('button');
      expect(defaultButtons).to.have.length(0);

      const slotButtons = element.shadowRoot.querySelectorAll(
        'slot[name="prev-arrow"], slot[name="next-arrow"]'
      );
      expect(slotButtons).to.have.length(2);
      expect(slotButtons[0].assignedElements()).to.have.ordered.members([
        customPrev,
      ]);
      expect(slotButtons[1].assignedElements()).to.have.ordered.members([
        customNext,
      ]);
    });

    it('should render in preparation for looping with loop prop', async () => {
      element.setAttribute('loop', '');
      const userSuppliedChildren = setSlides(3);
      userSuppliedChildren.forEach((child) => element.appendChild(child));
      win.document.body.appendChild(element);

      const renderedSlideWrappers = await getSlideWrappersFromShadow();
      // Given slides [0][1][2] should be rendered as [2][0][1]. But [2] is
      // a placeholder.
      expect(renderedSlideWrappers).to.have.lengthOf(3);
      expect(
        renderedSlideWrappers[0].querySelector('slot').assignedElements()
      ).to.deep.equal([userSuppliedChildren[2]]);
      expect(
        renderedSlideWrappers[1].querySelector('slot').assignedElements()
      ).to.deep.equal([userSuppliedChildren[0]]);
      expect(
        renderedSlideWrappers[2].querySelector('slot').assignedElements()
      ).to.deep.equal([userSuppliedChildren[1]]);
    });

    describe('snapping', () => {
      it('should snap to slides by default', async () => {
        const userSuppliedChildren = setSlides(3);
        userSuppliedChildren.forEach((child) => element.appendChild(child));
        win.document.body.appendChild(element);

        const renderedSlideWrappers = await getSlideWrappersFromShadow();
        expect(renderedSlideWrappers).to.have.lengthOf(3);
        renderedSlideWrappers.forEach((slide) => {
          expect(slide.classList.contains(styles.enableSnap)).to.be.true;
        });
      });

      it('should snap to slides with snap attribute', async () => {
        element.setAttribute('snap', '');
        const userSuppliedChildren = setSlides(3);
        userSuppliedChildren.forEach((child) => element.appendChild(child));
        win.document.body.appendChild(element);

        const renderedSlideWrappers = await getSlideWrappersFromShadow();
        expect(renderedSlideWrappers).to.have.lengthOf(3);
        renderedSlideWrappers.forEach((slide) => {
          expect(slide.classList.contains(styles.enableSnap)).to.be.true;
        });
      });

      it('should snap to slides with snap="true"', async () => {
        element.setAttribute('snap', 'true');
        const userSuppliedChildren = setSlides(3);
        userSuppliedChildren.forEach((child) => element.appendChild(child));
        win.document.body.appendChild(element);

        const renderedSlideWrappers = await getSlideWrappersFromShadow();
        expect(renderedSlideWrappers).to.have.lengthOf(3);
        renderedSlideWrappers.forEach((slide) => {
          expect(slide.classList.contains(styles.enableSnap)).to.be.true;
        });
      });

      it('should not snap to slides with snap="false"', async () => {
        element.setAttribute('snap', 'false');
        const userSuppliedChildren = setSlides(3);
        userSuppliedChildren.forEach((child) => element.appendChild(child));
        win.document.body.appendChild(element);

        const renderedSlideWrappers = await getSlideWrappersFromShadow();
        expect(renderedSlideWrappers).to.have.lengthOf(3);
        renderedSlideWrappers.forEach((slide) => {
          expect(slide.classList.contains(styles.disableSnap)).to.be.true;
        });
      });

      it('should only set snap on slides according to snap-by', async () => {
        element.setAttribute('snap', '');
        element.setAttribute('snap-by', '2');
        const userSuppliedChildren = setSlides(4);
        userSuppliedChildren.forEach((child) => element.appendChild(child));
        win.document.body.appendChild(element);

        const renderedSlideWrappers = await getSlideWrappersFromShadow();
        expect(renderedSlideWrappers).to.have.lengthOf(4);
        renderedSlideWrappers.forEach((slide, index) => {
          if (mod(index, 2) === 0) {
            expect(slide.classList.contains(styles.enableSnap)).to.be.true;
            expect(slide.classList.contains(styles.disableSnap)).to.be.false;
          } else {
            expect(slide.classList.contains(styles.enableSnap)).to.be.false;
            expect(slide.classList.contains(styles.disableSnap)).to.be.true;
          }
        });
      });
    });

    it('should fire DOM event', async () => {
      const userSuppliedChildren = setSlides(3);
      userSuppliedChildren.forEach((child) => element.appendChild(child));
      win.document.body.appendChild(element);
      await getSlidesFromShadow();

      const eventSpy = env.sandbox.spy();
      element.addEventListener('slideChange', eventSpy);
      element.setAttribute('slide', '1');

      await waitFor(() => eventSpy.callCount > 0, 'event fired');
      expect(eventSpy).to.be.calledOnce;
      expect(eventSpy.firstCall).calledWithMatch({
        'data': {
          'index': 1,
        },
      });
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

      // TODO(#38975): fix skipped test.
      it.skip('should execute next and prev actions', async () => {
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

    it('should render arrows when controls=always', async () => {
      element.setAttribute('controls', 'always');
      const userSuppliedChildren = setSlides(3);
      userSuppliedChildren.forEach((child) => element.appendChild(child));
      win.document.body.appendChild(element);

      const renderedSlides = await getSlidesFromShadow();
      expect(renderedSlides).to.have.ordered.members(userSuppliedChildren);
      const buttons = element.shadowRoot.querySelectorAll('button');
      expect(buttons).to.have.length(2);
    });

    it('should not render arrows when controls=never', async () => {
      element.setAttribute('controls', 'never');
      const userSuppliedChildren = setSlides(3);
      userSuppliedChildren.forEach((child) => element.appendChild(child));
      win.document.body.appendChild(element);

      const renderedSlides = await getSlidesFromShadow();
      expect(renderedSlides).to.have.ordered.members(userSuppliedChildren);
      const buttons = element.shadowRoot.querySelectorAll('button');
      expect(buttons).to.have.length(0);
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

    it('should go to slide 0 when slide attr is mutated to 0', async () => {
      const userSuppliedChildren = setSlides(3);
      userSuppliedChildren.forEach((child) => element.appendChild(child));
      win.document.body.appendChild(element);
      await getSlidesFromShadow();

      const scroller = element.shadowRoot.querySelector(
        `[class*=${styles.scrollContainer}]`
      );

      element.setAttribute('slide', '1');
      await waitFor(() => scroller.scrollLeft > 0, 'go to slide 1');

      element.setAttribute('slide', '0');
      await waitFor(() => scroller.scrollLeft == 0, 'returned to first slide');
    });

    it('should start at slide 1 with slide attr set to 1', async () => {
      element.setAttribute('slide', '1');
      const userSuppliedChildren = setSlides(3);
      userSuppliedChildren.forEach((child) => element.appendChild(child));
      win.document.body.appendChild(element);
      await getSlidesFromShadow();

      const scroller = element.shadowRoot.querySelector(
        `[class*=${styles.scrollContainer}]`
      );
      await waitFor(() => scroller.scrollLeft > 0, 'render at slide 1');
    });

    it('should respect outset-arrows even if controls=never', async () => {
      element.setAttribute('controls', 'never');
      element.setAttribute('outset-arrows', '');
      const userSuppliedChildren = setSlides(3);
      userSuppliedChildren.forEach((child) => element.appendChild(child));
      win.document.body.appendChild(element);

      await whenCalled(env.sandbox.spy(element, 'attachShadow'));
      const shadow = element.shadowRoot;

      // Container is 300px and arrows each take up 50px after padding
      expect(element.offsetWidth).to.equal(300);
      const scroller = shadow.querySelector(`[class*=${styles.hideScrollbar}]`);
      expect(scroller.offsetWidth).to.equal(200);

      const prevButton = shadow.querySelector(`[class*=${styles.arrowPrev}]`);
      expect(prevButton.offsetWidth).to.equal(36);
      const nextButton = shadow.querySelector(`[class*=${styles.arrowNext}]`);
      expect(nextButton.offsetWidth).to.equal(36);
    });
  }
);
