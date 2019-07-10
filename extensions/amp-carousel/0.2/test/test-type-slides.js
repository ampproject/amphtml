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
import {listenOncePromise} from '../../../../src/event-helper';

/**
 * @fileoverview Some simple tests for amp-carousel. Most of the functionality
 *    for changing slides, resizing, etc should be handled by the base
 *    implementation via amp-base-carousel's tests.
 */

async function afterIndexUpdate(el) {
  await listenOncePromise(el, 'indexchange');
  await el.implementation_.mutateElement(() => {});
  await el.implementation_.mutateElement(() => {});
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
  env => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      env.iframe.width = '1000';
      env.iframe.height = '1000';
    });

    async function getCarousel(looping, slideCount = 5) {
      const imgUrl =
        'https://lh3.googleusercontent.com/5rcQ32ml8E5ONp9f9-' +
        'Rf78IofLb9QjS5_0mqsY1zEFc=w300-h200-no';
      const carousel = doc.createElement('amp-carousel');
      carousel.setAttribute('type', 'slides');
      carousel.setAttribute('width', '400');
      carousel.setAttribute('height', '300');
      carousel.style.position = 'relative';
      carousel.setAttribute('controls', '');
      if (looping) {
        carousel.setAttribute('loop', '');
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

      doc.body.appendChild(carousel);
      await carousel.build();
      carousel.updateLayoutBox({
        top: 0,
        left: 0,
        width: 400,
        height: 300,
      });
      await carousel.layoutCallback();

      return carousel;
    }

    it('should create container and wrappers and show initial slides', async () => {
      const carousel = await getCarousel();
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

    describe('looping', () => {
      it('should go to the correct slide clicking next', async () => {
        const carousel = await getCarousel(true);
        const slideWrappers = getSlideWrappers(carousel);

        getNextButton(carousel).click();
        await afterIndexUpdate(carousel);
        expect(slideWrappers[0].getAttribute('aria-hidden')).to.equal('true');
        expect(slideWrappers[1].getAttribute('aria-hidden')).to.equal('false');
        expect(slideWrappers[2].getAttribute('aria-hidden')).to.equal('true');
      });

      it('should go to the correct slide clicking prev', async () => {
        const carousel = await getCarousel(true);
        const slideWrappers = getSlideWrappers(carousel);

        getPrevButton(carousel).click();
        await afterIndexUpdate(carousel);
        expect(slideWrappers[3].getAttribute('aria-hidden')).to.equal('true');
        expect(slideWrappers[4].getAttribute('aria-hidden')).to.equal('false');
        expect(slideWrappers[1].getAttribute('aria-hidden')).to.equal('true');
      });
    });

    describe('non-looping', () => {
      it('should disable the prev button when at the start', async () => {
        const carousel = await getCarousel(false);

        await carousel.implementation_.mutateElement(() => {});
        expect(getPrevButton(carousel).getAttribute('aria-disabled')).to.equal(
          'true'
        );
      });

      it('should disable the next button when at the end', async () => {
        const carousel = await getCarousel(false);

        carousel.implementation_.goToSlide(5);
        await afterIndexUpdate(carousel);
        expect(getPrevButton(carousel).getAttribute('aria-disabled')).to.equal(
          'true'
        );
      });
    });

    describe('button titles', () => {
      describe('when not looping', () => {
        it('should have the correct values on the first index', async () => {
          const carousel = await getCarousel(false, 3);
          await afterIndexUpdate(carousel);
          expect(getPrevTitle(carousel)).to.equal(
            'Previous item in carousel (1 of 3)'
          );
          expect(getNextTitle(carousel)).to.equal(
            'Next item in carousel (2 of 3)'
          );
        });

        it('should have the correct values on the last index', async () => {
          const carousel = await getCarousel(false, 3);
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

      describe('when looping', () => {
        it('should have the correct values on the first index', async () => {
          const carousel = await getCarousel(true, 3);
          await afterIndexUpdate(carousel);
          expect(getPrevTitle(carousel)).to.equal(
            'Previous item in carousel (3 of 3)'
          );
          expect(getNextTitle(carousel)).to.equal(
            'Next item in carousel (2 of 3)'
          );
        });

        it('should have the correct values on the last index', async () => {
          const carousel = await getCarousel(true, 3);
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
