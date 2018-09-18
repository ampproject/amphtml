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

const config = describe.configure().ifNewChrome();
config.run('amp-carousel', function() {
  this.timeout(10000);

  const extensions = ['amp-carousel'];

  const carousel = `
  <amp-carousel width=400 height=300 id="carousel-1">
    <amp-img src="https://lh3.googleusercontent.com/pSECrJ82R7-AqeBCOEPGPM9iG9OEIQ_QXcbubWIOdkY=w400-h300-no" layout=fill></amp-img>
    <amp-img src="https://lh3.googleusercontent.com/5rcQ32ml8E5ONp9f9-Rf78IofLb9QjS5_0mqsY1zEFc=w400-h300-no" width=400 height=300></amp-img>
    <amp-img src="https://lh3.googleusercontent.com/Z4gtm5Bkxyv21Z2PtbTf95Clb9AE4VTR6olbBKYrenM=w400-h300-no" width=400 height=300></amp-img>
  </amp-carousel>
  `;

  describes.integration('amp-carousel with 3 images', {
    body: carousel,
    extensions,
  }, env => {
    let win;
    let document;

    beforeEach(() => {
      win = env.win;
      document = env.win.document;
    });

    it('should be present', () => {
      expect(document.querySelectorAll('amp-carousel')).to.have.length.above(0);
    });

    it('should only have the next button enabled ' +
       'when on first item', () => {
      document.body.classList.add('amp-mode-mouse');
      return Promise.resolve().then(timeout(2000))
          .then(() => {
            const amp = document.querySelector('#carousel-1');
            const prevBtn = amp.querySelector('.amp-carousel-button-prev');
            const nextBtn = amp.querySelector('.amp-carousel-button-next');
            expect(prevBtn).to.not.be.null;
            expect(nextBtn).to.not.be.null;
            expect(prevBtn).to.be.hidden;
            expect(nextBtn).to.be.visible;
          });
    });
    it('should not be able to go past the first or last item', () => {
      document.body.classList.add('amp-mode-mouse');
      return Promise.resolve().then(timeout(2000))
          .then(() => {
            const amp = document.querySelector('#carousel-1');
            const impl = amp.implementation_;
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
    });
  });
});

function timeout(ms) {
  return () => new Promise(resolve => setTimeout(resolve, ms));
}
