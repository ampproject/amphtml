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

describe.configure().run('amp-image-lightbox', function() {
  const extensions = ['amp-image-lightbox'];
  const imageLightboxBody = `
  <figure>
  <amp-img id="img0"
      srcset="
          https://lh4.googleusercontent.com/-okOlNNHeoOc/VbYyrlFYFII/AAAAAAABYdA/La-3j3c-QQI/w2004-h1114-no/PANO_20150726_171347%257E2.jpg 2004w,
          https://lh4.googleusercontent.com/-okOlNNHeoOc/VbYyrlFYFII/AAAAAAABYdA/La-3j3c-QQI/w1002-h557-no/PANO_20150726_171347%257E2.jpg 1002w"
      width=527 height=293 layout="responsive"
      on="tap:image-lightbox-1"
      role="button" tabindex="0"></amp-img>
  <figcaption>
    This is a figcaption.
  </figcaption>
</figure>

<amp-image-lightbox
  id="image-lightbox-1"
  layout="nodisplay"
  data-close-button-aria-label="Close">
</amp-image-lightbox>
  `;
  describes.integration('amp-image-lightbox opens', {
    body: imageLightboxBody,
    extensions,
  }, env => {

    let win;
    beforeEach(() => {
      win = env.win;
    });

    // TODO(cathyxz, #13458): Find out why this is flaky on master.
    it.skip('should activate on tap of source image', () => {
      const lightbox = win.document.getElementById('image-lightbox-1');
      expect(lightbox.style.display).to.equal('none');
      const ampImage = win.document.getElementById('img0');
      const imageLoadedPromise = waitForImageToLoad(ampImage);
      return imageLoadedPromise.then(() => {
        const ampImage = win.document.getElementById('img0');
        // Simulate a click on the img inside the amp-img, because this is
        // what people tend to actually click on.
        const openerImage = ampImage.querySelector('img[amp-img-id="img0"]');
        const openedPromise = waitForLightboxOpen(win.document);
        openerImage.click();
        return openedPromise;
      }).then(() => {
        const imageSelection = win.document
            .getElementsByClassName('i-amphtml-image-lightbox-viewer-image');
        expect(imageSelection.length).to.equal(1);
        const image = imageSelection[0];
        expect(image.tagName).to.equal('IMG');
      });
    });
  });
});

function waitForLightboxOpen(document) {
  return poll('wait for image-lightbox-1 to open', () => {
    const lightbox = document.getElementById('image-lightbox-1');
    return lightbox.style.display == '';
  });
}

function waitForImageToLoad(ampImage) {
  return poll('wait for img0 to load', () => {
    const openerImage = ampImage.querySelector('img[amp-img-id="img0"]');
    return openerImage !== null;
  });
}
