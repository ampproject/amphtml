import '../../../amp-base-carousel/1.0/amp-base-carousel';
import '../amp-stream-gallery';

import {ActionTrust_Enum} from '#core/constants/action-constants';
import {createElementWithAttributes} from '#core/dom';
import {setStyles} from '#core/dom/style';

import {toggleExperiment} from '#experiments';

import {ActionInvocation} from '#service/action-impl';

import {waitFor} from '#testing/helpers/service';
import {poll} from '#testing/iframe';

describes.realWin(
  'amp-stream-gallery',
  {
    amp: {
      extensions: ['amp-stream-gallery:1.0'],
    },
  },
  (env) => {
    let win;
    let element;
    const userSuppliedChildren = [];

    beforeEach(async () => {
      win = env.win;
      toggleExperiment(win, 'bento-stream-gallery', true, true);
      element = createElementWithAttributes(
        win.document,
        'amp-stream-gallery',
        {
          'layout': 'fixed',
          'width': '300px',
          'height': '200px',
        }
      );

      // Add slides.
      for (let i = 0; i < 3; i++) {
        const slide = newSlide(`${i}`);
        userSuppliedChildren[i] = slide;
        element.appendChild(slide);
      }
    });

    afterEach(() => {
      toggleExperiment(win, 'bento-stream-gallery', false, true);
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
    describe('imperative api', () => {
      beforeEach(async () => {
        element.setAttribute('max-visible-count', '1');
        win.document.body.appendChild(element);
        await element.buildInternal();
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
        const eventSpy = env.sandbox.spy();
        element.addEventListener('slideChange', eventSpy);

        element.enqueAction(invocation('next'));
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

        element.enqueAction(invocation('prev'));
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
        const eventSpy = env.sandbox.spy();
        element.addEventListener('slideChange', eventSpy);

        element.enqueAction(invocation('goToSlide', {index: 1}));
        await waitFor(() => eventSpy.callCount > 0, 'go to slide 1');
        expect(eventSpy).to.be.calledOnce;
        expect(eventSpy.firstCall).calledWithMatch({
          'data': {
            'index': 1,
          },
        });

        element.enqueAction(invocation('goToSlide', {index: 0}));
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
