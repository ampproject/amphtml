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

import {adopt} from '../../../../src/runtime';
import {createIframePromise} from '../../../../testing/iframe';
import {toggleExperiment} from '../../../../src/experiments';
import {installLightboxManager} from '../amp-lightbox-viewer';

adopt(window);

describe('amp-lightbox-viewer', () => {
  let item1; // Auto lightboxable
  let item2; // Manually lightboxable
  let item3; // Not lightboxable
  let item4; // Auto lightboxable

  describe('with manual lightboxing', () => {
    runTests(/*autoLightbox*/false);
  });

  describe('with auto lightboxing', () => {
    runTests(/*autoLightbox*/true);
  });

  function runTests(autoLightbox) {
    it('should build', () => {
      return getAmpLightboxViewer(autoLightbox).then(viewer => {
        const container = viewer.querySelector('.i-amphtml-lbv');
        expect(container).to.exist;

        const mask = viewer.querySelector('.i-amphtml-lbv-mask');
        expect(mask).to.exist;

        const carousel = viewer.querySelector('amp-carousel');
        expect(carousel).to.exist;

        const btns = viewer.querySelectorAll('.i-amphtml-lbv > [role=button]');
        expect(btns.length).to.equal(2);
        expect(btns[0].className).to.equal('amp-lbv-button-close');
        expect(btns[1].className).to.equal(
            'amp-lbv-button-gallery');
      });
    });

    it('should make lightbox viewer visible on activate', () => {
      return getAmpLightboxViewer(autoLightbox).then(viewer => {
        const impl = viewer.implementation_;
        impl.vsync_.mutate = function(callback) {
          callback();
        };
        expect(viewer.style.display).to.equal('none');
        return impl.activate({source: item1}).then(() => {
          expect(viewer.style.display).to.equal('');
        });
      });
    });

    it('should make lightbox viewer invisible on close', () => {
      return getAmpLightboxViewer(autoLightbox).then(viewer => {
        const impl = viewer.implementation_;
        impl.vsync_.mutate = function(callback) {
          callback();
        };
        expect(viewer.style.display).to.equal('none');
        return impl.activate({source: item1}).then(() => {
        }).then(() => {
          expect(viewer.style.display).to.equal('');
          return impl.close_();
        }).then(() => {
          expect(viewer.style.display).to.equal('none');
        });
      });
    });

    // TODO(yuxichen): fix the description
    it.skip('should show detailed description correctly', () => {
      return getAmpLightboxViewer(autoLightbox).then(viewer => {
        const impl = viewer.implementation_;
        impl.vsync_.mutate = function(callback) {
          callback();
        };
        return impl.activate({source: item1}).then(() => {
          const container = viewer.querySelector('.i-amphtml-lbv');
          const descriptionBox = viewer.querySelector(
              '.i-amphtml-lbv-desc-box');
          const button = viewer.querySelector('.amp-lbv-button-next');
          expect(container).to.not.be.null;
          expect(descriptionBox).to.not.be.null;
          expect(descriptionBox.textContent).to.equal('test-text');
          expect(descriptionBox.classList.contains('hide')).to.be.false;
          // test click button won't toggle description box
          button.dispatchEvent(new Event('click'));
          expect(descriptionBox.classList.contains('hide')).to.be.false;
          // test click on screen will hide description
          container.dispatchEvent(new Event('click'));
          expect(descriptionBox.classList.contains('hide')).to.be.true;
          // test no content will disable toggling
          impl.updateViewer_(item2);
          container.dispatchEvent(new Event('click'));
          expect(descriptionBox.classList.contains('hide')).to.be.true;
          // test switching items
          impl.updateViewer_(item4);
          expect(descriptionBox.textContent).to.equal('test-text2');
          expect(descriptionBox.classList.contains('hide')).to.be.true;
          container.dispatchEvent(new Event('click'));
          expect(descriptionBox.classList.contains('hide')).to.be.false;
        });
      });
    });

    it('should create gallery with thumbnails', () => {
      return getAmpLightboxViewer(autoLightbox).then(viewer => {
        const impl = viewer.implementation_;
        impl.vsync_.mutate = function(callback) {
          callback();
        };
        return impl.activate({source: item1}).then(() => {
          impl.openGallery_();
          const container = viewer.querySelector('.i-amphtml-lbv');
          expect(container.hasAttribute('gallery-view')).to.be.true;
          const gallery = viewer.querySelector('.i-amphtml-lbv-gallery');
          expect(gallery.childNodes).to.have.length(3);
          gallery.childNodes[1].dispatchEvent(new Event('click'));
          expect(container.hasAttribute('gallery-view')).to.be.false;
        });
      });
    });
  }

  function setUpDocument(doc, autoLightbox) {
    const createImage = function() {
      const img = doc.createElement('amp-img');
      img.setAttribute('layout', 'responsive');
      img.setAttribute('width', '200');
      img.setAttribute('height', '200');
      img.setAttribute('src', 'someimage');
      return img;
    };

    item1 = createImage();
    if (!autoLightbox) {
      item1.setAttribute('lightbox', '');
    }
    item1.setAttribute('alt', 'test-text');

    item2 = doc.createElement('blockquote');
    item2.setAttribute('lightbox', '');

    item3 = createImage();
    if (autoLightbox) {
      item3.setAttribute('lightbox', 'none');
    }

    item4 = createImage();
    item4.setAttribute('alt', 'test-text2');
    if (!autoLightbox) {
      item4.setAttribute('lightbox', '');
    }

    const container = doc.createElement('div');
    container.appendChild(item1);
    container.appendChild(item2);
    container.appendChild(item3);
    container.appendChild(item4);

    doc.body.appendChild(container);
  }

  function getAmpLightboxViewer(autoLightbox) {
    return createIframePromise().then(iframe => {
      toggleExperiment(iframe.win, 'amp-lightbox-viewer', true);
      if (autoLightbox) {
        toggleExperiment(iframe.win, 'amp-lightbox-viewer-auto', true);
      } else {
        toggleExperiment(iframe.win, 'amp-lightbox-viewer-auto', false);
      }
      setUpDocument(iframe.doc, autoLightbox);
      const viewer = iframe.doc.createElement('amp-lightbox-viewer');
      viewer.setAttribute('layout', 'nodisplay');
      installLightboxManager(iframe.win);
      return iframe.addElement(viewer);
    });
  }
});
