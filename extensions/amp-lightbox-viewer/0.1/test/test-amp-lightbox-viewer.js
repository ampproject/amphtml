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

import '../../../amp-carousel/0.1/amp-carousel';
import {installLightboxManager} from '../amp-lightbox-viewer';
import {toggleExperiment} from '../../../../src/experiments';


describes.realWin('amp-lightbox-viewer', {
  amp: {
    amp: true,
    extensions: ['amp-lightbox-viewer', 'amp-carousel'],
  },
}, env => {
  let win, doc;
  let item1; // Auto lightboxable
  let item2; // Manually lightboxable
  let item3; // Not lightboxable
  let item4; // Auto lightboxable

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  function getAmpLightboxViewer(autoLightbox) {
    toggleExperiment(win, 'amp-lightbox-viewer', true);
    if (autoLightbox) {
      toggleExperiment(win, 'amp-lightbox-viewer-auto', true);
    } else {
      toggleExperiment(win, 'amp-lightbox-viewer-auto', false);
    }
    setUpDocument(doc, autoLightbox);
    const viewer = doc.createElement('amp-lightbox-viewer');
    viewer.setAttribute('layout', 'nodisplay');
    installLightboxManager(win);
    doc.body.appendChild(viewer);
    return viewer.build()
        .then(() => viewer.layoutCallback())
        .then(() => {
          const impl = viewer.implementation_;
          // stub vsync and resource function
          sandbox.stub(impl.vsync_, 'mutate').callsFake(callback => {
            callback();
          });
          sandbox.stub(impl.vsync_, 'mutatePromise').callsFake(callback => {
            callback();
            return Promise.resolve();
          });
          sandbox.stub(impl.resources_, 'requireLayout').callsFake(() => {
            return Promise.resolve();
          });
        })
        .then(() => viewer);
  }

  // TODO (cathyzhu): rewrite these tests after finalizing lightbox API.
  describe.skip('with manual lightboxing', function() {
    runTests(/*autoLightbox*/false);
  });

  describe.skip('with auto lightboxing', function() {
    runTests(/*autoLightbox*/true);
  });

  function runTests(autoLightbox) {
    it('should build on open', () => {
      let viewer = null;
      return getAmpLightboxViewer(autoLightbox).then(v => {
        viewer = v;
        const impl = viewer.implementation_;
        expect(viewer.style.display).to.equal('none');
        return impl.open_(item1);
      }).then(() => {
        const container = viewer.querySelector('.i-amphtml-lbv');
        expect(container).to.exist;

        const mask = viewer.querySelector('.i-amphtml-lbv-mask');
        expect(mask).to.exist;

        const topBar = viewer.querySelector('.i-amphtml-lbv-top-bar');
        expect(topBar).to.exist;

        const btns = viewer.querySelectorAll(
            '.i-amphtml-lbv-top-bar > [role=button]');
        expect(btns.length).to.equal(3);
        expect(btns[0].className).to.equal('amp-lbv-button-close');
        expect(btns[1].className).to.equal('amp-lbv-button-gallery');
        expect(btns[2].className).to.equal('amp-lbv-button-slide');

        const descriptionBox = viewer.querySelector('.i-amphtml-lbv-desc-box');
        expect(descriptionBox).to.exist;

        const descriptionTextArea = viewer.querySelector(
            '.i-amphtml-lbv-desc-text');
        expect(descriptionTextArea).to.exist;

        const carousel = viewer.querySelector('amp-carousel');
        expect(carousel).to.exist;
      });
    });

    it('should make lightbox viewer visible on activate', () => {
      return getAmpLightboxViewer(autoLightbox).then(viewer => {
        const impl = viewer.implementation_;
        expect(viewer.style.display).to.equal('none');
        return impl.open_(item1).then(() => {
          expect(viewer.style.display).to.equal('');
        });
      });
    });

    it('should make lightbox viewer invisible on close', () => {
      return getAmpLightboxViewer(autoLightbox).then(viewer => {
        const impl = viewer.implementation_;
        expect(viewer.style.display).to.equal('none');
        return impl.open_(item1).then(() => {
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
        return impl.open_(item1).then(() => {
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
        return impl.open_(item1).then(() => {
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
      img.updateLayoutBox({top: 0, left: 0, width: 200, height: 200});
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

    const resources = item1.getResources();
    resources.getResourceForElement(item1).measure();
    resources.getResourceForElement(item3).measure();
    resources.getResourceForElement(item4).measure();
  }
});
