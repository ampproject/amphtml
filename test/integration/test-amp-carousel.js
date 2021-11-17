import {CommonSignals_Enum} from '#core/constants/common-signals';
import {whenUpgradedToCustomElement} from '#core/dom/amp-element-helpers';

const t = describes.sandboxed.configure().ifChrome();

t.run('amp-carousel', {}, function () {
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
    return whenUpgradedToCustomElement(carousel).then(() =>
      carousel.signals().whenSignal(CommonSignals_Enum.LOAD_START)
    );
  }

  describes.integration(
    'type=carousel with single image',
    {
      body: carouselSingleImage,
      extensions,
    },
    (env) => {
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
          amp.classList.remove('i-amphtml-carousel-has-controls');
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
          expect(prevBtn.classList.contains('amp-disabled')).to.be.true;
          expect(nextBtn.classList.contains('amp-disabled')).to.be.true;
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
    (env) => {
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
          amp.classList.remove('i-amphtml-carousel-has-controls');
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
          expect(prevBtn.classList.contains('amp-disabled')).to.be.true;
          expect(nextBtn).to.be.visible;
        }
      );

      it('should only have the next button enabled when on first item', () => {
        document.body.classList.add('amp-mode-mouse');
        const amp = document.querySelector('#carousel-1');
        const prevBtn = amp.querySelector('.amp-carousel-button-prev');
        const nextBtn = amp.querySelector('.amp-carousel-button-next');
        expect(prevBtn).to.not.be.null;
        expect(nextBtn).to.not.be.null;
        expect(prevBtn.classList.contains('amp-disabled')).to.be.true;
        expect(nextBtn).to.be.visible;
      });

      it('should not be able to go past the first or last item', async () => {
        document.body.classList.add('amp-mode-mouse');
        const amp = document.querySelector('#carousel-1');
        const impl = await amp.getImpl();
        const prevBtn = amp.querySelector('.amp-carousel-button-prev');
        const nextBtn = amp.querySelector('.amp-carousel-button-next');
        expect(prevBtn).to.have.class('amp-disabled');
        impl.go(-1, false);
        expect(prevBtn).to.have.class('amp-disabled');
        impl.go(1, false);
        expect(prevBtn).to.not.have.class('amp-disabled');
        impl.go(1, false);
        impl.go(1, false);
        expect(nextBtn).to.have.class('amp-disabled');
        impl.go(-1, false);
        expect(prevBtn).to.not.have.class('amp-disabled');
        impl.go(-1, false);
        expect(prevBtn).to.have.class('amp-disabled');
      });

      it('should only have the prev button enabled when on last item', async () => {
        document.body.classList.add('amp-mode-mouse');
        const amp = document.querySelector('#carousel-1');
        const impl = await amp.getImpl();
        const prevBtn = amp.querySelector('.amp-carousel-button-prev');
        const nextBtn = amp.querySelector('.amp-carousel-button-next');
        expect(prevBtn).to.have.class('amp-disabled');
        expect(nextBtn).to.not.have.class('amp-disabled');
        impl.go(1, false);
        impl.go(1, false);
        impl.go(1, false);
        expect(prevBtn).to.not.have.class('amp-disabled');
        expect(nextBtn).to.have.class('amp-disabled');
      });
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
    (env) => {
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
          amp.classList.remove('i-amphtml-carousel-has-controls');
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
          expect(prevBtn.classList.contains('amp-disabled')).to.be.true;
          expect(nextBtn.classList.contains('amp-disabled')).to.be.true;
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
    (env) => {
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
          amp.classList.remove('i-amphtml-carousel-has-controls');
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
          expect(prevBtn.classList.contains('amp-disabled')).to.be.true;
          expect(nextBtn).to.be.visible;
        }
      );

      it('should only have the next button enabled when on first item', () => {
        document.body.classList.add('amp-mode-mouse');
        const amp = document.querySelector('#carousel-1');
        const prevBtn = amp.querySelector('.amp-carousel-button-prev');
        const nextBtn = amp.querySelector('.amp-carousel-button-next');
        expect(prevBtn).to.not.be.null;
        expect(nextBtn).to.not.be.null;
        expect(prevBtn.classList.contains('amp-disabled')).to.be.true;
        expect(nextBtn).to.be.visible;
      });

      it('should only have the prev button enabled when on last item', async () => {
        document.body.classList.add('amp-mode-mouse');
        const amp = document.querySelector('#carousel-1');
        const impl = await amp.getImpl();
        const prevBtn = amp.querySelector('.amp-carousel-button-prev');
        const nextBtn = amp.querySelector('.amp-carousel-button-next');
        expect(prevBtn).to.have.class('amp-disabled');
        expect(nextBtn).to.not.have.class('amp-disabled');
        impl.go(1, false);
        impl.go(1, false);
        expect(prevBtn).to.not.have.class('amp-disabled');
        expect(nextBtn).to.have.class('amp-disabled');
      });
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
    (env) => {
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
          const carousel = document.querySelector('#carousel-1');
          const prevBtn = carousel.querySelector('.amp-carousel-button-prev');
          const nextBtn = carousel.querySelector('.amp-carousel-button-next');
          expect(carousel.hasAttribute('loop')).to.be.true;
          expect(carousel.hasAttribute('controls')).to.be.true;
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
