/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
import '../../../amp-base-carousel/1.0/amp-base-carousel';
import '../amp-stream-gallery';
import {ActionInvocation} from '../../../../src/service/action-impl';
import {ActionTrust} from '../../../../src/action-constants';
import {
  createElementWithAttributes,
  waitForChildPromise,
} from '../../../../src/dom';
import {poll} from '../../../../testing/iframe';
import {setStyles} from '../../../../src/style';
import {toArray} from '../../../../src/types';
import {toggleExperiment} from '../../../../src/experiments';
import {useStyles} from '../../../amp-base-carousel/1.0/base-carousel.jss';
import {waitFor} from '../../../../testing/test-helper';

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

    const styles = useStyles();

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

    async function getSlideWrappersFromShadow() {
      await element.build();
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
        .filter((slot) => !!slot);
      return toArray(slots).reduce(
        (acc, slot) => acc.concat(slot.assignedElements()),
        []
      );
    }

    it('should render slides and arrows when built', async () => {
      win.document.body.appendChild(element);
      await element.build();

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
      await element.build();

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
      await element.build();

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
      let scroller;

      beforeEach(async () => {
        element.setAttribute('max-visible-count', '1');
        win.document.body.appendChild(element);
        await getSlidesFromShadow();

        scroller = element.shadowRoot.querySelector(
          `[class*=${styles.scrollContainer}]`
        );
      });

      afterEach(() => {
        win.document.body.removeChild(element);
        scroller = null;
      });

      function invocation(method, args = {}) {
        const source = null;
        const caller = null;
        const event = null;
        const trust = ActionTrust.DEFAULT;
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
        await waitFor(() => scroller.scrollLeft > 0, 'advanced to next slide');

        // Make sure internal state index is updated before attempting to call prev(),
        // Since this is typically updated automatically on debounce, there is a risk that
        // the test will call prev() on the slide at the 0th index unless we force is here.
        element.enqueAction(invocation('goToSlide', {index: 1}));
        await waitFor(() => scroller.scrollLeft > 0, 'to slide 1');

        element.enqueAction(invocation('prev'));
        // Wait for a longer timeout than the 200 default in waitFor.
        await poll(
          'returned to prev slide',
          () => scroller.scrollLeft == 0,
          undefined /* opt_onError */,
          400 /* opt_timeout */
        );
      });

      it('should execute goToSlide action', async () => {
        element.enqueAction(invocation('goToSlide', {index: 1}));
        await waitFor(() => scroller.scrollLeft > 0, 'go to slide 1');

        element.enqueAction(invocation('goToSlide', {index: 0}));
        await waitFor(
          () => scroller.scrollLeft == 0,
          'returned to first slide'
        );
      });
    });
  }
);
