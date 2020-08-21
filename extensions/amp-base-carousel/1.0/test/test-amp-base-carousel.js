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
import '../amp-base-carousel';
import {
  createElementWithAttributes,
  waitForChildPromise,
} from '../../../../src/dom';
import {setStyles} from '../../../../src/style';
import {toArray} from '../../../../src/types';
import {toggleExperiment} from '../../../../src/experiments';
import {whenCalled} from '../../../../testing/test-helper.js';

describes.realWin(
  'amp-base-carousel',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-base-carousel:1.0'],
    },
  },
  (env) => {
    let win;
    let element;

    async function getSlidesFromShadow() {
      await whenCalled(env.sandbox.spy(element, 'attachShadow'));
      const shadow = element.shadowRoot;
      await waitForChildPromise(shadow, (shadow) => {
        return shadow.querySelectorAll('[hide-scrollbar]');
      });
      const slots = await shadow.querySelectorAll('[hide-scrollbar] slot');
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
      toggleExperiment(win, 'amp-base-carousel-bento', true);
      element = createElementWithAttributes(win.document, 'amp-base-carousel', {
        'layout': 'fixed',
        'width': '300px',
        'height': '200px',
      });
    });

    afterEach(() => {
      toggleExperiment(win, 'amp-base-carousel-bento', false);
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

      const renderedSlides = await getSlidesFromShadow();
      // Given slides [0][1][2] should be rendered as [2][0][1]
      expect(renderedSlides[0]).to.equal(userSuppliedChildren[2]);
      expect(renderedSlides[1]).to.equal(userSuppliedChildren[0]);
      expect(renderedSlides[2]).to.equal(userSuppliedChildren[1]);
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

    it('should render not arrows when controls=never', async () => {
      element.setAttribute('controls', 'never');
      const userSuppliedChildren = setSlides(3);
      userSuppliedChildren.forEach((child) => element.appendChild(child));
      win.document.body.appendChild(element);

      const renderedSlides = await getSlidesFromShadow();
      expect(renderedSlides).to.have.ordered.members(userSuppliedChildren);
      const buttons = element.shadowRoot.querySelectorAll('button');
      expect(buttons).to.have.length(0);
    });
  }
);
