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

import {poll} from '../../../../../testing/iframe';

describe.configure().ifNewChrome().run('amp-lightbox-gallery', function() {
  this.timeout(5000);
  const extensions = ['amp-lightbox-gallery'];
  const body = `
  <figure>
  <amp-img id="img0"
      src="/examples/img/sample.jpg"
      width=641 height=481 layout="responsive"
      lightbox
      role="button" tabindex="0"></amp-img>
  <figcaption>
    This is a figcaption.
  </figcaption>
</figure>
  `;
  const experiments = ['amp-lightbox-gallery'];
  describes.integration('amp-lightbox-gallery opens', {
    body,
    extensions,
    experiments,
  }, env => {

    let win;
    beforeEach(() => {
      win = env.win;
      win.AMP_MODE.localDev = true;
    });

    it('should open and close correctly', () => {
      const lightbox = win.document.getElementById('amp-lightbox-gallery');
      expect(lightbox.style.display).to.equal('none');
      const ampImage = win.document.getElementById('img0');
      const imageLoadedPromise = waitForImageToLoad(ampImage);
      return imageLoadedPromise.then(() => {
        const ampImage = win.document.getElementById('img0');
        // Simulate a click on the img inside the amp-img, because this is
        // what people tend to actually click on.
        const openerImage = ampImage.querySelector('img[amp-img-id="img0"]');
        const openedPromise = waitForLightboxOpen(lightbox);
        openerImage.click();
        return openedPromise;
      }).then(() => {
        expect(lightbox.style.display).to.not.equal('none');
        const carouselQuery = lightbox.getElementsByTagName('AMP-CAROUSEL');
        expect(carouselQuery.length).to.equal(1);
        const carousel = carouselQuery[0];
        const imageViewerQuery = carousel
            .getElementsByTagName('AMP-IMAGE-VIEWER');
        expect(imageViewerQuery.length).to.equal(1);
        const imageViewer = imageViewerQuery[0];
        const img = imageViewer
            .querySelector('img.i-amphtml-image-viewer-image');
        expect(img.getAttribute('src')).to.equal('/examples/img/sample.jpg');
        const closeButton = lightbox
            .querySelector('.i-amphtml-lbg-button-close.i-amphtml-lbg-button');
        const lightboxClose = waitForLightboxClose(lightbox, carousel);
        closeButton.click();
        return lightboxClose;
      }).then(() => {
        expect(lightbox.style.display).to.equal('none');
      });
    });
  });
});

function waitForLightboxOpen(lightbox) {
  return poll('wait for amp-lightbox-gallery to open', () => {
    return lightbox.style.display == '' && lightbox.style.opacity == '';
  });
}

function waitForLightboxClose(lightbox, carousel) {
  return poll('wait for amp-lightbox-gallery to close', () => {
    return carousel.style.display == 'none';
  });
}

function waitForImageToLoad(ampImage) {
  return poll('wait for img0 to load', () => {
    const openerImage = ampImage.querySelector('img[amp-img-id="img0"]');
    return openerImage !== null;
  });
}
