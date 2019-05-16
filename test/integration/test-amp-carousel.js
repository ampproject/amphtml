/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {whenUpgradedToCustomElement} from '../../src/dom';

const t = describe
  .configure()
  .ifChrome()
  .skipSinglePass()
  .skipWindows(); // TODO(#19647): Flaky on Chrome 71 on Windows 10.

t.run('amp-carousel', function() {
  this.timeout(10000);
  let document;

  const extensions = ['amp-carousel'];

  const carouselSingleImage = `
  <amp-carousel width=400 height=300 id="carousel-1">
    <amp-img src="https://lh3.googleusercontent.com/pSECrJ82R7-AqeBCOEPGPM9iG9OEIQ_QXcbubWIOdkY=w400-h300-no" layout=fill></amp-img>
  </amp-carousel>
  `;

  function waitForCarouselLayout() {
    const carousel = document.querySelector('amp-carousel');
    return whenUpgradedToCustomElement(carousel).then(() => {
      return carousel.whenBuilt();
    });
  }

  describes.integration(
    'type=carousel with single image',
    {
      body: carouselSingleImage,
      extensions,
    },
    env => {
      beforeEach(() => {
        document = env.win.document;
        return waitForCarouselLayout();
      });

      it('should be present', () => {
        expect(document.querySelectorAll('amp-carousel')).to.have.length.above(
          0
        );
      });

      it(
        'should not have the buttons visible ' +
          'when amp-mode-mouse class is not on body',
        () => {
          document.body.classList.remove('amp-mode-mouse');
          const amp = document.querySelector('#carousel-1');
          const prevBtn = amp.querySelector('.amp-carousel-button-prev');
          const nextBtn = amp.querySelector('.amp-carousel-button-next');
          expect(document.body).to.not.have.class('amp-mode-mouse');
          expect(prevBtn).to.not.be.null;
          expect(nextBtn).to.not.be.null;
          expect(prevBtn).to.be.hidden;
          expect(nextBtn).to.be.hidden;
        }
      );

      it(
        'should not have any buttons visible when theres only a single ' +
          'item',
        () => {
          document.body.classList.add('amp-mode-mouse');
          const amp = document.querySelector('#carousel-1');
          const prevBtn = amp.querySelector('.amp-carousel-button-prev');
          const nextBtn = amp.querySelector('.amp-carousel-button-next');
          expect(prevBtn).to.not.be.null;
          expect(nextBtn).to.not.be.null;
          expect(prevBtn).to.be.hidden;
          expect(nextBtn).to.be.hidden;
        }
      );
    }
  );

  const carouselMultipleImages = `
  <amp-carousel width=400 height=300 id="carousel-1">
    <amp-img src="https://lh3.googleusercontent.com/pSECrJ82R7-AqeBCOEPGPM9iG9OEIQ_QXcbubWIOdkY=w400-h300-no" layout=fill></amp-img>
    <amp-img src="https://lh3.googleusercontent.com/5rcQ32ml8E5ONp9f9-Rf78IofLb9QjS5_0mqsY1zEFc=w400-h300-no" width=400 height=300></amp-img>
    <amp-img src="https://lh3.googleusercontent.com/Z4gtm5Bkxyv21Z2PtbTf95Clb9AE4VTR6olbBKYrenM=w400-h300-no" width=400 height=300></amp-img>
  </amp-carousel>
  `;

  describes.integration(
    'type=carousel with multiple images',
    {
      body: carouselMultipleImages,
      extensions,
    },
    env => {
      beforeEach(() => {
        document = env.win.document;
        return waitForCarouselLayout();
      });

      it('should be present', () => {
        expect(document.querySelectorAll('amp-carousel')).to.have.length.above(
          0
        );
      });

      it(
        'should not have the buttons visible ' +
          'when amp-mode-mouse class is not on body',
        () => {
          document.body.classList.remove('amp-mode-mouse');
          const amp = document.querySelector('#carousel-1');
          const prevBtn = amp.querySelector('.amp-carousel-button-prev');
          const nextBtn = amp.querySelector('.amp-carousel-button-next');
          expect(document.body).to.not.have.class('amp-mode-mouse');
          expect(prevBtn).to.not.be.null;
          expect(nextBtn).to.not.be.null;
          expect(prevBtn).to.be.hidden;
          expect(nextBtn).to.be.hidden;
        }
      );

      it.skip(
        'should have the next button visible when amp-mode-mouse ' +
          'class is not on body & `controls` specified',
        () => {
          document.body.classList.remove('amp-mode-mouse');
          const amp = document.querySelector('#carousel-1');
          amp.setAttribute('controls', '');
          const prevBtn = amp.querySelector('.amp-carousel-button-prev');
          const nextBtn = amp.querySelector('.amp-carousel-button-next');
          expect(document.body).to.not.have.class('amp-mode-mouse');
          expect(prevBtn).to.not.be.null;
          expect(nextBtn).to.not.be.null;
          expect(prevBtn).to.be.hidden;
          expect(nextBtn).to.be.visible;
        }
      );

      it.skip(
        'should only have the next button enabled ' + 'when on first item',
        () => {
          document.body.classList.add('amp-mode-mouse');
          const amp = document.querySelector('#carousel-1');
          const prevBtn = amp.querySelector('.amp-carousel-button-prev');
          const nextBtn = amp.querySelector('.amp-carousel-button-next');
          expect(prevBtn).to.not.be.null;
          expect(nextBtn).to.not.be.null;
          expect(prevBtn).to.be.hidden;
          expect(nextBtn).to.be.visible;
        }
      );

      it.skip('should not be able to go past the first or last item', () => {
        document.body.classList.add('amp-mode-mouse');
        const amp = document.querySelector('#carousel-1');
        const impl = amp.implementation_;
        const prevBtn = amp.querySelector('.amp-carousel-button-prev');
        const nextBtn = amp.querySelector('.amp-carousel-button-next');
        expect(prevBtn).to.have.class('amp-disabled');
        impl.goCallback(-1, false);
        expect(prevBtn).to.have.class('amp-disabled');
        impl.goCallback(1, false);
        expect(prevBtn).to.not.have.class('amp-disabled');
        impl.goCallback(1, false);
        impl.goCallback(1, false);
        expect(nextBtn).to.have.class('amp-disabled');
        impl.goCallback(-1, false);
        expect(prevBtn).to.not.have.class('amp-disabled');
        impl.goCallback(-1, false);
        expect(prevBtn).to.have.class('amp-disabled');
      });

      it.skip(
        'should only have the prev button enabled ' + 'when on last item',
        () => {
          document.body.classList.add('amp-mode-mouse');
          const amp = document.querySelector('#carousel-1');
          const impl = amp.implementation_;
          const prevBtn = amp.querySelector('.amp-carousel-button-prev');
          const nextBtn = amp.querySelector('.amp-carousel-button-next');
          expect(prevBtn).to.have.class('amp-disabled');
          expect(nextBtn).to.not.have.class('amp-disabled');
          impl.goCallback(1, false);
          impl.goCallback(1, false);
          impl.goCallback(1, false);
          expect(prevBtn).to.not.have.class('amp-disabled');
          expect(nextBtn).to.have.class('amp-disabled');
        }
      );
    }
  );

  const slidesSingleImage = `
  <amp-carousel width=400 height=300 type=slides id="carousel-1">
    <amp-img src="https://lh3.googleusercontent.com/pSECrJ82R7-AqeBCOEPGPM9iG9OEIQ_QXcbubWIOdkY=w400-h300-no"></amp-img>
  </amp-carousel>
  `;

  describes.integration(
    'type=slides with single image',
    {
      body: slidesSingleImage,
      extensions,
    },
    env => {
      beforeEach(() => {
        document = env.win.document;
        return waitForCarouselLayout();
      });

      it('should be present', () => {
        expect(document.querySelectorAll('amp-carousel')).to.have.length.above(
          0
        );
      });

      it(
        'should not have the buttons visible ' +
          'when amp-mode-mouse class is not on body',
        () => {
          document.body.classList.remove('amp-mode-mouse');
          const amp = document.querySelector('#carousel-1');
          const prevBtn = amp.querySelector('.amp-carousel-button-prev');
          const nextBtn = amp.querySelector('.amp-carousel-button-next');
          expect(document.body).to.not.have.class('amp-mode-mouse');
          expect(prevBtn).to.not.be.null;
          expect(nextBtn).to.not.be.null;
          expect(prevBtn).to.be.hidden;
          expect(nextBtn).to.be.hidden;
        }
      );

      it(
        '(type=slides) should not have any buttons enabled when theres ' +
          'only a single item',
        () => {
          document.body.classList.add('amp-mode-mouse');
          const amp = document.querySelector('#carousel-1');
          const prevBtn = amp.querySelector('.amp-carousel-button-prev');
          const nextBtn = amp.querySelector('.amp-carousel-button-next');
          expect(prevBtn).to.not.be.null;
          expect(nextBtn).to.not.be.null;
          expect(prevBtn).to.be.hidden;
          expect(nextBtn).to.be.hidden;
        }
      );
    }
  );

  const slidesMultipleImages = `
  <amp-carousel width=400 height=300 type=slides id="carousel-1">
    <amp-img src="https://lh3.googleusercontent.com/pSECrJ82R7-AqeBCOEPGPM9iG9OEIQ_QXcbubWIOdkY=w400-h300-no" layout=fill></amp-img>
    <amp-img src="https://lh3.googleusercontent.com/5rcQ32ml8E5ONp9f9-Rf78IofLb9QjS5_0mqsY1zEFc=w400-h300-no" width=400 height=300></amp-img>
    <amp-img src="https://lh3.googleusercontent.com/Z4gtm5Bkxyv21Z2PtbTf95Clb9AE4VTR6olbBKYrenM=w400-h300-no" width=400 height=300></amp-img>
  </amp-carousel>
  `;

  describes.integration(
    'type=slides with multiple images',
    {
      body: slidesMultipleImages,
      extensions,
    },
    env => {
      beforeEach(() => {
        document = env.win.document;
        return waitForCarouselLayout();
      });

      it('should be present', () => {
        expect(document.querySelectorAll('amp-carousel')).to.have.length.above(
          0
        );
      });

      it(
        'should not have the buttons visible ' +
          'when amp-mode-mouse class is not on body',
        () => {
          document.body.classList.remove('amp-mode-mouse');
          const amp = document.querySelector('#carousel-1');
          const prevBtn = amp.querySelector('.amp-carousel-button-prev');
          const nextBtn = amp.querySelector('.amp-carousel-button-next');
          expect(document.body).to.not.have.class('amp-mode-mouse');
          expect(prevBtn).to.not.be.null;
          expect(nextBtn).to.not.be.null;
          expect(prevBtn).to.be.hidden;
          expect(nextBtn).to.be.hidden;
        }
      );

      it(
        'should have the buttons visible when amp-mode-mouse ' +
          'class is not on body & `controls` specified',
        () => {
          document.body.classList.remove('amp-mode-mouse');
          const amp = document.querySelector('#carousel-1');
          amp.setAttribute('controls', '');
          const prevBtn = amp.querySelector('.amp-carousel-button-prev');
          const nextBtn = amp.querySelector('.amp-carousel-button-next');
          expect(document.body).to.not.have.class('amp-mode-mouse');
          expect(prevBtn).to.not.be.null;
          expect(nextBtn).to.not.be.null;
          expect(prevBtn).to.be.hidden;
          expect(nextBtn).to.be.visible;
        }
      );

      it(
        'should only have the next button enabled ' + 'when on first item',
        () => {
          document.body.classList.add('amp-mode-mouse');
          const amp = document.querySelector('#carousel-1');
          const prevBtn = amp.querySelector('.amp-carousel-button-prev');
          const nextBtn = amp.querySelector('.amp-carousel-button-next');
          expect(prevBtn).to.not.be.null;
          expect(nextBtn).to.not.be.null;
          expect(prevBtn).to.be.hidden;
          expect(nextBtn).to.be.visible;
        }
      );

      it.skip(
        'should only have the prev button enabled ' + 'when on last item',
        () => {
          document.body.classList.add('amp-mode-mouse');
          const amp = document.querySelector('#carousel-1');
          const impl = amp.implementation_;
          const prevBtn = amp.querySelector('.amp-carousel-button-prev');
          const nextBtn = amp.querySelector('.amp-carousel-button-next');
          expect(prevBtn).to.have.class('amp-disabled');
          expect(nextBtn).to.not.have.class('amp-disabled');
          impl.goCallback(1, false);
          impl.goCallback(1, false);
          expect(prevBtn).to.not.have.class('amp-disabled');
          expect(nextBtn).to.have.class('amp-disabled');
        }
      );
    }
  );

  const slidesMultipleImagesControlsLoop = `
  <amp-carousel width=400 height=300 type=slides id="carousel-1" controls loop>
    <amp-img src="https://lh3.googleusercontent.com/pSECrJ82R7-AqeBCOEPGPM9iG9OEIQ_QXcbubWIOdkY=w400-h300-no" layout=fill></amp-img>
    <amp-img src="https://lh3.googleusercontent.com/5rcQ32ml8E5ONp9f9-Rf78IofLb9QjS5_0mqsY1zEFc=w400-h300-no" width=400 height=300></amp-img>
    <amp-img src="https://lh3.googleusercontent.com/Z4gtm5Bkxyv21Z2PtbTf95Clb9AE4VTR6olbBKYrenM=w400-h300-no" width=400 height=300></amp-img>
  </amp-carousel>
  `;

  describes.integration(
    'type=slides with multiple images',
    {
      body: slidesMultipleImagesControlsLoop,
      extensions,
    },
    env => {
      beforeEach(() => {
        document = env.win.document;
        return waitForCarouselLayout();
      });

      it('should be present', () => {
        expect(document.querySelectorAll('amp-carousel')).to.have.length.above(
          0
        );
      });

      it(
        '(type=slides loop) should always have a prev and next button be ' +
          'able to get past the first and last item',
        () => {
          document.body.classList.add('amp-mode-mouse');
          const amp = document.querySelector('#carousel-1');
          const prevBtn = amp.querySelector('.amp-carousel-button-prev');
          const nextBtn = amp.querySelector('.amp-carousel-button-next');
          expect(amp.hasAttribute('loop')).to.be.true;
          expect(amp.hasAttribute('controls')).to.be.true;
          expect(prevBtn).to.not.be.null;
          expect(nextBtn).to.not.be.null;
          expect(prevBtn).to.be.visible;
          expect(nextBtn).to.be.visible;
          expect(prevBtn).to.not.have.class('amp-disabled');
          expect(nextBtn).to.not.have.class('amp-disabled');
          nextBtn.click();
          expect(prevBtn).to.not.have.class('amp-disabled');
          expect(nextBtn).to.not.have.class('amp-disabled');
          nextBtn.click();
          expect(prevBtn).to.not.have.class('amp-disabled');
          expect(nextBtn).to.not.have.class('amp-disabled');
          nextBtn.click();
          expect(prevBtn).to.not.have.class('amp-disabled');
          expect(nextBtn).to.not.have.class('amp-disabled');
          nextBtn.click();
          expect(prevBtn).to.not.have.class('amp-disabled');
          expect(nextBtn).to.not.have.class('amp-disabled');
          nextBtn.click();
          expect(prevBtn).to.not.have.class('amp-disabled');
          expect(nextBtn).to.not.have.class('amp-disabled');
        }
      );
    }
  );
});
