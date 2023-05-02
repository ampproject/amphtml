import {CSS as BentoStreamGalleryCss} from '#build/bento-stream-gallery-1.0.css';

import {useStyles} from '#bento/components/bento-base-carousel/1.0/component.jss';
import {adoptStyles} from '#bento/util/unit-helpers';

import {createElementWithAttributes, waitForChildPromise} from '#core/dom';
import {setStyles} from '#core/dom/style';
import {toArray} from '#core/types/array';

import {defineBentoElement} from '#preact/bento-ce';

import {waitFor} from '#testing/helpers/service';
import {poll} from '#testing/iframe';

import {BaseElement as BentoStreamGallery} from '../../base-element';

describes.realWin(
  'bento-stream-gallery',
  {
    amp: {
      extensions: ['bento-stream-gallery:1.0'],
    },
  },
  (env) => {
    let win;
    let element;
    const userSuppliedChildren = [];

    const styles = useStyles();

    beforeEach(async () => {
      win = env.win;
      defineBentoElement('bento-stream-gallery', BentoStreamGallery, win);
      adoptStyles(win, BentoStreamGalleryCss);
      // defineBentoElement('bento-base-carousel', BentoBaseCarousel, win);
      // adoptStyles(win, BentoBaseCarouselCss);
      element = createElementWithAttributes(
        win.document,
        'bento-stream-gallery',
        {
          style:
            'width: 300px; height: 200px; display: block; position: relative;',
        }
      );

      // Add slides.
      for (let i = 0; i < 3; i++) {
        const slide = newSlide(`${i}`);
        userSuppliedChildren[i] = slide;
        element.appendChild(slide);
      }
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

    async function getSlideWrappersFromShadow() {
      await element.getApi();
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

    it('should render slides and arrows when built', async () => {
      win.document.body.appendChild(element);
      await element.getApi();

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
      win.document.body.appendChild(element);
      await element.getApi();

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
      win.document.body.appendChild(element);
      await element.getApi();

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

    describe('imperative api', () => {
      beforeEach(async () => {
        element.setAttribute('max-visible-count', '1');
        win.document.body.appendChild(element);
        await element.getApi();
      });

      afterEach(() => {
        win.document.body.removeChild(element);
      });

      it('should execute next and prev actions', async () => {
        const api = await element.getApi();
        const eventSpy = env.sandbox.spy();
        element.addEventListener('slideChange', eventSpy);

        api.next();

        // These must wait longer than `waitFor` because of
        // the render on debounced scrolling.
        await poll(
          'advanced to next slide',
          () => eventSpy.callCount > 0,
          null,
          1000
        );

        expect(eventSpy).to.be.calledOnce;
        expect(eventSpy.firstCall).calledWithMatch({
          'data': {
            'index': 1,
          },
        });

        api.prev();
        // These must wait longer than `waitFor` because of
        // the render on debounced scrolling.
        await poll(
          'returned to prev slide',
          () => eventSpy.callCount > 1,
          null,
          1000
        );
        expect(eventSpy).to.be.calledTwice;
        expect(eventSpy.secondCall).calledWithMatch({
          'data': {
            'index': 0,
          },
        });
      });

      it('should execute goToSlide action', async () => {
        const api = await element.getApi();
        const eventSpy = env.sandbox.spy();
        element.addEventListener('slideChange', eventSpy);

        api.goToSlide(1);
        await waitFor(() => eventSpy.callCount > 0, 'go to slide 1');
        expect(eventSpy).to.be.calledOnce;
        expect(eventSpy.firstCall).calledWithMatch({
          'data': {
            'index': 1,
          },
        });

        api.goToSlide(0);
        await waitFor(() => eventSpy.callCount > 1, 'returned to first slide');
        expect(eventSpy).to.be.calledTwice;
        expect(eventSpy.secondCall).calledWithMatch({
          'data': {
            'index': 0,
          },
        });
      });
    });
  }
);
