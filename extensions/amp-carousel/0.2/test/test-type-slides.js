/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-carousel';
import {ActionTrust} from '../../../../src/action-constants';
import {CarouselEvents} from '../../../amp-base-carousel/0.1/carousel-events';
import {getDetail, listenOncePromise} from '../../../../src/event-helper';

/**
 * @fileoverview Some simple tests for amp-carousel. Most of the functionality
 *    for changing slides, resizing, etc should be handled by the base
 *    implementation via amp-base-carousel's tests.
 */

/**
 * @param {!Element} el
 * @param {number=} index An index to wait for.
 * @return {!Promise<undefined>}
 */
async function afterIndexUpdate(el, index) {
  const event = await listenOncePromise(el, CarouselEvents.INDEX_CHANGE);
  await el.implementation_.mutateElement(() => {});
  await el.implementation_.mutateElement(() => {});

  if (index != undefined && getDetail(event)['index'] != index) {
    return afterIndexUpdate(el, index);
  }
}

function getNextButton(el) {
  return el.querySelector('.amp-carousel-button-next');
}

function getPrevButton(el) {
  return el.querySelector('.amp-carousel-button-prev');
}

function getNextTitle(el) {
  return getNextButton(el).getAttribute('title');
}

function getPrevTitle(el) {
  return getPrevButton(el).getAttribute('title');
}

function getSlideWrappers(el) {
  return el.querySelectorAll(
    '.i-amphtml-carousel-scroll > .i-amphtml-carousel-slide-item'
  );
}

describes.realWin(
  'amp-carousel-0.2 type slides',
  {
    amp: {
      extensions: ['amp-carousel:0.2'],
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
    });

    afterEach(() => {
      doc.body.removeChild(container);
    });

    async function getCarousel({
      loop = false,
      slideCount = 5,
      dir = null,
    } = {}) {
      const imgUrl =
        'https://lh3.googleusercontent.com/5rcQ32ml8E5ONp9f9-' +
        'Rf78IofLb9QjS5_0mqsY1zEFc=w300-h200-no';
      const carousel = doc.createElement('amp-carousel');
      carousel.setAttribute('type', 'slides');
      carousel.setAttribute('width', '400');
      carousel.setAttribute('height', '300');
      carousel.style.position = 'relative';
      carousel.setAttribute('controls', '');
      if (loop) {
        carousel.setAttribute('loop', '');
      }
      if (dir) {
        carousel.setAttribute('dir', dir);
      }

      for (let i = 0; i < slideCount; i++) {
        const img = doc.createElement('amp-img');
        img.setAttribute('src', imgUrl);
        img.setAttribute('width', '400');
        img.setAttribute('height', '300');
        // See https://github.com/ampproject/amphtml/issues/3989
        img.style.display = 'inline';
        if (i == 0) {
          img.setAttribute('data-slide-id', 'slide-id');
        }
        carousel.appendChild(img);
      }

      container.appendChild(carousel);
      await carousel.build();
      carousel.updateLayoutBox({
        top: 0,
        left: 0,
        width: 400,
        height: 300,
      });
      await carousel.layoutCallback();
      await afterIndexUpdate(carousel);

      return carousel;
    }

    it('should create container and wrappers and show initial slides', async () => {
      const carousel = await getCarousel({loop: false});
      const slideWrappers = getSlideWrappers(carousel);

      expect(
        carousel.getElementsByClassName('i-amphtml-carousel-scroll').length
      ).to.equal(1);
      expect(slideWrappers.length).to.equal(5);
      expect(
        carousel.getElementsByClassName('amp-carousel-slide').length
      ).to.equal(5);
      expect(
        carousel
          .querySelector('.i-amphtml-carousel-scroll')
          .getAttribute('aria-live')
      ).to.equal('polite');
      expect(slideWrappers[4].getAttribute('aria-hidden')).to.equal('true');
      expect(slideWrappers[0].getAttribute('aria-hidden')).to.equal('false');
      expect(slideWrappers[1].getAttribute('aria-hidden')).to.equal('true');
    });

    it('should show focus outline and border on next and prev buttons', async () => {
      const carousel = await getCarousel({loop: false});

      carousel.implementation_.interactionNext();
      await afterIndexUpdate(carousel);

      const impl = carousel.implementation_;
      impl.prevButton_.focus();
      expect(doc.activeElement).to.equal(impl.prevButton_);
      expect(win.getComputedStyle(impl.prevButton_).outline).to.equal(
        'rgb(255, 255, 255) solid 1px'
      );
      expect(win.getComputedStyle(impl.prevButton_).border).to.equal(
        '1px solid rgb(0, 0, 0)'
      );

      impl.nextButton_.focus();
      expect(doc.activeElement).to.equal(impl.nextButton_);
      expect(win.getComputedStyle(impl.nextButton_).outline).to.equal(
        'rgb(255, 255, 255) solid 1px'
      );
      expect(win.getComputedStyle(impl.nextButton_).border).to.equal(
        '1px solid rgb(0, 0, 0)'
      );
    });

    describe('loop', () => {
      it('should go to the correct slide clicking next', async () => {
        const carousel = await getCarousel({loop: true});
        const slideWrappers = getSlideWrappers(carousel);

        getNextButton(carousel).click();
        await afterIndexUpdate(carousel);
        expect(slideWrappers[0].getAttribute('aria-hidden')).to.equal('true');
        expect(slideWrappers[1].getAttribute('aria-hidden')).to.equal('false');
        expect(slideWrappers[2].getAttribute('aria-hidden')).to.equal('true');
      });

      it('should go to the correct slide clicking prev', async () => {
        const carousel = await getCarousel({loop: true});
        const slideWrappers = getSlideWrappers(carousel);

        getPrevButton(carousel).click();
        await afterIndexUpdate(carousel);
        expect(slideWrappers[3].getAttribute('aria-hidden')).to.equal('true');
        expect(slideWrappers[4].getAttribute('aria-hidden')).to.equal('false');
        expect(slideWrappers[1].getAttribute('aria-hidden')).to.equal('true');
      });
    });

    describe('non-loop', () => {
      it('should disable the prev button when at the start', async () => {
        const carousel = await getCarousel({loop: false});

        expect(getPrevButton(carousel).getAttribute('aria-disabled')).to.equal(
          'true'
        );
      });

      it('should disable the next button when at the end', async () => {
        const carousel = await getCarousel({loop: false});

        carousel.implementation_.goToSlide(4);
        await afterIndexUpdate(carousel);

        expect(getNextButton(carousel).getAttribute('aria-disabled')).to.equal(
          'true'
        );
      });
    });

    describe('slideChange event', () => {
      it('should not dispatch on initial render', async () => {
        const eventSpy = env.sandbox.spy();
        container.addEventListener('slideChange', eventSpy);
        await getCarousel({loop: false});

        expect(eventSpy).to.have.not.been.called;
      });

      it('should dispatch when changing slides', async () => {
        const eventSpy = env.sandbox.spy();
        container.addEventListener('slideChange', eventSpy);
        const carousel = await getCarousel({loop: false});

        carousel.implementation_.interactionNext();
        await afterIndexUpdate(carousel);

        expect(eventSpy).to.have.been.calledOnce;
      });
    });

    describe('goToSlide action', () => {
      it('should propagate high trust', async () => {
        const carousel = await getCarousel({loop: false});
        const impl = carousel.implementation_;
        const triggerSpy = env.sandbox.spy(impl.action_, 'trigger');

        impl.executeAction({
          method: 'goToSlide',
          args: {index: 1},
          trust: ActionTrust.HIGH,
          satisfiesTrust: () => true,
        });
        await afterIndexUpdate(carousel);

        expect(triggerSpy).to.have.been.calledWith(
          carousel,
          'slideChange',
          /* CustomEvent */ env.sandbox.match.has('detail', {index: 1}),
          ActionTrust.HIGH
        );
      });

      it('should propagate low trust', async () => {
        const carousel = await getCarousel({loop: false});
        const impl = carousel.implementation_;
        const triggerSpy = env.sandbox.spy(impl.action_, 'trigger');

        impl.executeAction({
          method: 'goToSlide',
          args: {index: 1},
          trust: ActionTrust.LOW,
          satisfiesTrust: () => true,
        });
        await afterIndexUpdate(carousel);

        expect(triggerSpy).to.have.been.calledWith(
          carousel,
          'slideChange',
          /* CustomEvent */ env.sandbox.match.has('detail', {index: 1}),
          ActionTrust.LOW
        );
      });

      it('should allow string-valued index', async () => {
        const carousel = await getCarousel({loop: false});
        const impl = carousel.implementation_;
        const triggerSpy = env.sandbox.spy(impl.action_, 'trigger');

        impl.executeAction({
          method: 'goToSlide',
          args: {index: '1'},
          trust: ActionTrust.LOW,
          satisfiesTrust: () => true,
        });
        await afterIndexUpdate(carousel);

        expect(triggerSpy).to.have.been.calledWith(
          carousel,
          'slideChange',
          /* CustomEvent */ env.sandbox.match.has('detail', {index: 1}),
          ActionTrust.LOW
        );
      });

      it('should cause error with invalid index', async () => {
        const carousel = await getCarousel({loop: false});
        const impl = carousel.implementation_;
        const triggerSpy = env.sandbox.spy(impl.action_, 'trigger');

        try {
          allowConsoleError(() => {
            impl.executeAction({
              method: 'goToSlide',
              args: {index: 'one'},
              trust: ActionTrust.LOW,
              satisfiesTrust: () => true,
            });
          });
          await afterIndexUpdate(carousel);
        } catch (expected) {
          expect(triggerSpy).to.not.have.been.called;
          return;
        }
        expect.fail();
      });
    });

    describe('layout direction', () => {
      it('should use the initial rtl context if not specified', async () => {
        container.setAttribute('dir', 'rtl');

        const carousel = await getCarousel({loop: false});
        const slideWrappers = getSlideWrappers(carousel);

        const {left: firstLeft} = slideWrappers[0].getBoundingClientRect();
        const {left: secondLeft} = slideWrappers[1].getBoundingClientRect();
        const {left: nextLeft} = getNextButton(
          carousel
        ).getBoundingClientRect();
        const {left: prevLeft} = getPrevButton(
          carousel
        ).getBoundingClientRect();

        expect(firstLeft).to.be.greaterThan(secondLeft);
        expect(prevLeft).to.be.greaterThan(nextLeft);
      });

      it("should use the carousel's rtl direction", async () => {
        container.setAttribute('dir', 'ltr');

        const carousel = await getCarousel({loop: false, dir: 'rtl'});
        const slideWrappers = getSlideWrappers(carousel);

        const {left: firstLeft} = slideWrappers[0].getBoundingClientRect();
        const {left: secondLeft} = slideWrappers[1].getBoundingClientRect();
        const {left: nextLeft} = getNextButton(
          carousel
        ).getBoundingClientRect();
        const {left: prevLeft} = getPrevButton(
          carousel
        ).getBoundingClientRect();

        expect(firstLeft).to.be.greaterThan(secondLeft);
        expect(prevLeft).to.be.greaterThan(nextLeft);
      });

      it('should use the initial ltr context if not specified', async () => {
        container.setAttribute('dir', 'ltr');

        const carousel = await getCarousel({loop: false});
        const slideWrappers = getSlideWrappers(carousel);

        const {left: firstLeft} = slideWrappers[0].getBoundingClientRect();
        const {left: secondLeft} = slideWrappers[1].getBoundingClientRect();
        const {left: nextLeft} = getNextButton(
          carousel
        ).getBoundingClientRect();
        const {left: prevLeft} = getPrevButton(
          carousel
        ).getBoundingClientRect();

        expect(secondLeft).to.be.greaterThan(firstLeft);
        expect(nextLeft).to.be.greaterThan(prevLeft);
      });

      it("should use the carousel's ltr direction", async () => {
        container.setAttribute('dir', 'rtl');

        const carousel = await getCarousel({loop: false, dir: 'ltr'});
        const slideWrappers = getSlideWrappers(carousel);

        const {left: firstLeft} = slideWrappers[0].getBoundingClientRect();
        const {left: secondLeft} = slideWrappers[1].getBoundingClientRect();
        const {left: nextLeft} = getNextButton(
          carousel
        ).getBoundingClientRect();
        const {left: prevLeft} = getPrevButton(
          carousel
        ).getBoundingClientRect();

        expect(secondLeft).to.be.greaterThan(firstLeft);
        expect(nextLeft).to.be.greaterThan(prevLeft);
      });
    });

    describe('button titles', () => {
      describe('when not loop', () => {
        it('should have the correct values on the first index', async () => {
          const carousel = await getCarousel({loop: false, slideCount: 3});

          expect(getPrevTitle(carousel)).to.equal(
            'Previous item in carousel (1 of 3)'
          );
          expect(getNextTitle(carousel)).to.equal(
            'Next item in carousel (2 of 3)'
          );
        });

        it('should have the correct values on the last index', async () => {
          const carousel = await getCarousel({loop: false, slideCount: 3});

          carousel.implementation_.goToSlide(2);
          await afterIndexUpdate(carousel);

          expect(getPrevTitle(carousel)).to.equal(
            'Previous item in carousel (2 of 3)'
          );
          expect(getNextTitle(carousel)).to.equal(
            'Next item in carousel (3 of 3)'
          );
        });
      });

      describe('when loop', () => {
        it('should have the correct values on the first index', async () => {
          const carousel = await getCarousel({loop: true, slideCount: 3});

          expect(getPrevTitle(carousel)).to.equal(
            'Previous item in carousel (3 of 3)'
          );
          expect(getNextTitle(carousel)).to.equal(
            'Next item in carousel (2 of 3)'
          );
        });

        it('should have the correct values on the last index', async () => {
          const carousel = await getCarousel({loop: true, slideCount: 3});

          carousel.implementation_.goToSlide(2);
          await afterIndexUpdate(carousel);

          expect(getPrevTitle(carousel)).to.equal(
            'Previous item in carousel (2 of 3)'
          );
          expect(getNextTitle(carousel)).to.equal(
            'Next item in carousel (1 of 3)'
          );
        });
      });
    });
  }
);
