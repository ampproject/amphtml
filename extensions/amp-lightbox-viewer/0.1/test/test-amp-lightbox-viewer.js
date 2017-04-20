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


import {ancestorElements} from '../../../../src/dom';
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

        const btns = viewer.querySelectorAll('[role=button]');
        expect(btns.length).to.equal(4);
        expect(btns[2].className).to.equal('amp-lbv-button-close');
        expect(btns[3].className).to.equal(
            'amp-lbv-button-gallery');
      });
    });

    it('should lightbox item on activate', () => {
      return getAmpLightboxViewer(autoLightbox).then(viewer => {
        const impl = viewer.implementation_;
        impl.vsync_.mutate = function(callback) {
          callback();
        };
        assertLightboxed(item1, impl, false, /*closed*/ true);
        return impl.activate({source: item1}).then(() => {
          assertLightboxed(item1, impl, true, /*closed*/ false);
        });
      });
    });

    it('should unlightbox item on close', () => {
      return getAmpLightboxViewer(autoLightbox).then(viewer => {
        const impl = viewer.implementation_;
        impl.vsync_.mutate = function(callback) {
          callback();
        };
        assertLightboxed(item1, impl, false, /*closed*/ true);
        return impl.activate({source: item1}).then(() => {
          assertLightboxed(item1, impl, true, /*closed*/ false);
        }).then(() => {
          return impl.close_();
        }).then(() => {
          assertLightboxed(item1, impl, false, /*closed*/ true);
        });
      });
    });

    it('should lightbox next/previous elements', () => {
      return getAmpLightboxViewer(autoLightbox).then(viewer => {
        const impl = viewer.implementation_;
        impl.vsync_.mutate = function(callback) {
          callback();
        };
        assertLightboxed(item1, impl, false, /*closed*/ true);
        impl.activate({source: item1});
        assertLightboxed(item1, impl, true, /*closed*/ false);
        // Should go to item2
        return impl.next_().then(() => {
          assertLightboxed(item1, impl, false, /*closed*/ false);
          assertLightboxed(item2, impl, true, /*closed*/ false);
          assertLightboxed(item3, impl, false, /*closed*/ false);
          assertLightboxed(item4, impl, false, /*closed*/ false);
        }).then(() => {
          // Should skip item3 since it is not lightboxable
          return impl.next_();
        }).then(() => {
          assertLightboxed(item1, impl, false, /*closed*/ false);
          assertLightboxed(item2, impl, false, /*closed*/ false);
          assertLightboxed(item3, impl, false, /*closed*/ false);
          assertLightboxed(item4, impl, true, /*closed*/ false);
        }).then(() => {
          // Should be a no-op now that we are at the end of the roll
          return impl.next_();
        }).then(() => {
          assertLightboxed(item1, impl, false, /*closed*/ false);
          assertLightboxed(item2, impl, false, /*closed*/ false);
          assertLightboxed(item3, impl, false, /*closed*/ false);
          assertLightboxed(item4, impl, true, /*closed*/ false);
        }).then(() => {
          // Should go back to item2 since item3 is not lightboxable
          return impl.previous_();
        }).then(() => {
          assertLightboxed(item1, impl, false, /*closed*/ false);
          assertLightboxed(item2, impl, true, /*closed*/ false);
          assertLightboxed(item3, impl, false, /*closed*/ false);
          assertLightboxed(item4, impl, false, /*closed*/ false);
        }).then(() => {
          // Should go back to item1
          return impl.previous_();
        }).then(() => {
          assertLightboxed(item1, impl, true, /*closed*/ false);
          assertLightboxed(item2, impl, false, /*closed*/ false);
          assertLightboxed(item3, impl, false, /*closed*/ false);
          assertLightboxed(item4, impl, false, /*closed*/ false);
        }).then(() => {
          // Should be a no-op now that we are at the beginning of the roll
          return impl.previous_();
        }).then(() => {
          assertLightboxed(item1, impl, true, /*closed*/ false);
          assertLightboxed(item2, impl, false, /*closed*/ false);
          assertLightboxed(item3, impl, false, /*closed*/ false);
          assertLightboxed(item4, impl, false, /*closed*/ false);
        }).then(() => {
          return impl.close_();
        }).then(() => {
          assertLightboxed(item1, impl, false, /*closed*/ true);
          assertLightboxed(item2, impl, false, /*closed*/ true);
          assertLightboxed(item3, impl, false, /*closed*/ true);
          assertLightboxed(item4, impl, false, /*closed*/ true);
        });
      });
    });

    it('should show detailed description correctly', () => {
      return getAmpLightboxViewer(autoLightbox).then(viewer => {
        const impl = viewer.implementation_;
        impl.vsync_.mutate = function(callback) {
          callback();
        };
        return impl.activate({source: item1}).then(() => {
          assertLightboxed(item1, impl, true, /*closed*/ false);
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
          expect(impl.activeElement_).to.equal(item1);
          assertLightboxed(item1, impl, true, /*closed*/ false);
          impl.openGallery_();
          const container = viewer.querySelector('.i-amphtml-lbv');
          expect(container.getAttribute('gallery-view')).to.equal('');
          const gallery = viewer.querySelector(
              '.i-amphtml-lbv-gallery ');
          expect(gallery.childNodes).to.have.length(3);
          gallery.childNodes[1].dispatchEvent(new Event('click'));
          expect(container.getAttribute('gallery-view')).to.be.null;
          expect(impl.activeElement_).to.equal(item2);
        });
      });
    });
  }

  function assertLightboxed(element, impl, isIt, closed) {
    expect(element.classList.contains('amp-lightboxed')).to.equal(isIt);

    ancestorElements(element, p => {
      expect(p.classList.contains('i-amphtml-lightboxed-ancestor'))
        .to.equal(!closed);
    });

    if (isIt) {
      expect(impl.activeElement_).to.equal(element);
    } else {
      expect(impl.activeElement_).not.to.equal(element);
    }
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
