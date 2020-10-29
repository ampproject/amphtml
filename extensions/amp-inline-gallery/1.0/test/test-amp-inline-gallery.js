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
import '../amp-inline-gallery';
import {ActionInvocation} from '../../../../src/service/action-impl';
import {ActionTrust} from '../../../../src/action-constants';
import {CarouselContextProp} from '../../../amp-base-carousel/1.0/carousel-props';
import {createElementWithAttributes} from '../../../../src/dom';
import {setStyles} from '../../../../src/style';
import {subscribe} from '../../../../src/context';
import {toggleExperiment} from '../../../../src/experiments';
import {waitFor} from '../../../../testing/test-helper';

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
      toggleExperiment(win, 'amp-inline-gallery-bento', true, true);
      toggleExperiment(win, 'amp-base-carousel-bento', true, true);
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
      await element.build();
      await carousel.build();
      await pagination.build();

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
      toggleExperiment(win, 'amp-inline-gallery-bento', false, true);
      toggleExperiment(win, 'amp-base-carousel-bento', false, true);
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
