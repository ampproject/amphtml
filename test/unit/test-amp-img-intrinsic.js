/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {BrowserController} from '../../testing/test-helper';
import {applyStaticLayout} from '../../src/layout';
import {createElementWithAttributes} from '../../src/dom';
import {createIframePromise} from '../../testing/iframe';
import {installImg} from '../../builtins/amp-img';
import {toArray} from '../../src/types';

describes.sandboxed('amp-img layout intrinsic', {}, () => {
  let fixture;

  beforeEach(() => {
    return createIframePromise().then((iframeFixture) => {
      fixture = iframeFixture;
    });
  });

  function getImg(attributes, children) {
    installImg(fixture.win);

    const img = fixture.doc.createElement('amp-img');
    for (const key in attributes) {
      img.setAttribute(key, attributes[key]);
    }

    if (children != null) {
      for (let i = 0; i < children.length; i++) {
        img.appendChild(children[i]);
      }
    }
    return Promise.resolve(fixture.addElement(img));
  }

  // Firefox misbehaves on Windows for this test because getBoundingClientRect
  // returns 0x0 for width and height. Strangely Firefox on MacOS will return
  // reasonable values for getBoundingClientRect if we add an explicit wait
  // for laid out attributes via waitForElementLayout. If we change the test to
  // test for client or offset values, Safari yields 0px measurements.
  // For details, see: https://github.com/ampproject/amphtml/pull/24574
  describe
    .configure()
    .skipFirefox()
    .run('layout intrinsic', () => {
      let browser;
      beforeEach(() => {
        fixture.iframe.height = 800;
        fixture.iframe.width = 800;
        browser = new BrowserController(fixture.win);
      });
      it('should not exceed given width and height even if image\
      natural size is larger', () => {
        let ampImg;
        return getImg({
          src: '/examples/img/sample.jpg', // 641 x 481
          width: 100,
          height: 100,
          layout: 'intrinsic',
        })
          .then((image) => {
            ampImg = image;
            return browser.waitForElementLayout('amp-img');
          })
          .then(() => {
            expect(ampImg.getBoundingClientRect()).to.include({
              width: 100,
              height: 100,
            });
            const img = ampImg.querySelector('img');
            expect(img.getBoundingClientRect()).to.include({
              width: 100,
              height: 100,
            });
          });
      });

      it('should reach given width and height even if image\
      natural size is smaller', () => {
        let ampImg;
        return getImg({
          src: '/examples/img/sample.jpg', // 641 x 481
          width: 800,
          height: 600,
          layout: 'intrinsic',
        })
          .then((image) => {
            ampImg = image;
            return browser.waitForElementLayout('amp-img');
          })
          .then(() => {
            expect(ampImg.getBoundingClientRect()).to.include({
              width: 800,
              height: 600,
            });
            const img = ampImg.querySelector('img');
            expect(img.getBoundingClientRect()).to.include({
              width: 800,
              height: 600,
            });
          });
      });

      it('expands a parent div with no explicit dimensions', () => {
        let ampImg;
        const parentDiv = fixture.doc.getElementById('parent');
        // inline-block to force width and height to size of children
        // font-size 0 to get rid of the 4px added by inline-block for whitespace
        parentDiv.setAttribute('style', 'display: inline-block; font-size: 0;');
        return getImg({
          src: '/examples/img/sample.jpg', // 641 x 481
          width: 600,
          height: 400,
          layout: 'intrinsic',
        })
          .then((image) => {
            ampImg = image;
            return browser.waitForElementLayout('amp-img');
          })
          .then(() => {
            expect(ampImg.getBoundingClientRect()).to.include({
              width: 600,
              height: 400,
            });
            const parentDiv = fixture.doc.getElementById('parent');
            expect(parentDiv.getBoundingClientRect()).to.include({
              width: 600,
              height: 400,
            });
          });
      });

      it('is bounded by explicit dimensions of a parent container', () => {
        let ampImg;
        const parentDiv = fixture.doc.getElementById('parent');
        parentDiv.setAttribute('style', 'width: 80px; height: 80px');
        return getImg({
          src: '/examples/img/sample.jpg', // 641 x 481
          width: 800,
          height: 600,
          layout: 'intrinsic',
        })
          .then((image) => {
            ampImg = image;
            return browser.waitForElementLayout('amp-img');
          })
          .then(() => {
            expect(ampImg.getBoundingClientRect()).to.include({
              width: 80,
              height: 60,
            });
            const parentDiv = fixture.doc.getElementById('parent');
            expect(parentDiv.getBoundingClientRect()).to.include({
              width: 80,
              height: 80,
            });
          });
      });

      it('SSR sizer does not interfere with img creation', () => {
        let ampImg;
        const parentDiv = fixture.doc.getElementById('parent');
        parentDiv.setAttribute('style', 'width: 80px; height: 80px');

        // Hack so we don't duplicate intrinsic's layout code here.
        const tmp = createElementWithAttributes(fixture.doc, 'div', {
          src: '/examples/img/sample.jpg', // 641 x 481
          width: 800,
          height: 600,
          layout: 'intrinsic',
        });
        applyStaticLayout(tmp);
        const attributes = {
          'i-amphtml-ssr': '',
        };
        for (let i = 0; i < tmp.attributes.length; i++) {
          attributes[tmp.attributes[i].name] = tmp.attributes[i].value;
        }

        return getImg(attributes, toArray(tmp.children))
          .then((image) => {
            ampImg = image;
            return browser.waitForElementLayout('amp-img');
          })
          .then(() => {
            expect(ampImg.querySelector('img[src*="sample.jpg"]')).to.exist;
            expect(ampImg.querySelector('img[src*="image/svg+xml"]')).to.exist;
          });
      });

      it('SSR sizer does not interfere with SSR img before', () => {
        let ampImg;
        const parentDiv = fixture.doc.getElementById('parent');
        parentDiv.setAttribute('style', 'width: 80px; height: 80px');

        // Hack so we don't duplicate intrinsic's layout code here.
        const tmp = createElementWithAttributes(fixture.doc, 'div', {
          src: '/examples/img/sample.jpg', // 641 x 481
          width: 800,
          height: 600,
          layout: 'intrinsic',
        });
        applyStaticLayout(tmp);
        const attributes = {
          'i-amphtml-ssr': '',
        };
        for (let i = 0; i < tmp.attributes.length; i++) {
          attributes[tmp.attributes[i].name] = tmp.attributes[i].value;
        }

        const children = toArray(tmp.children);
        children.unshift(
          createElementWithAttributes(fixture.doc, 'img', {
            decoding: 'async',
            class: 'i-amphtml-fill-content i-amphtml-replaced-content',
            src: tmp.getAttribute('src'),
          })
        );

        return getImg(attributes, children)
          .then((image) => {
            ampImg = image;
            return browser.waitForElementLayout('amp-img');
          })
          .then(() => {
            expect(ampImg.querySelector('img[src*="sample.jpg"]')).to.exist;
            expect(ampImg.querySelector('img[src*="image/svg+xml"]')).to.exist;
          });
      });

      it('SSR sizer does not interfere with SSR img after', () => {
        let ampImg;
        const parentDiv = fixture.doc.getElementById('parent');
        parentDiv.setAttribute('style', 'width: 80px; height: 80px');

        // Hack so we don't duplicate intrinsic's layout code here.
        const tmp = createElementWithAttributes(fixture.doc, 'div', {
          src: '/examples/img/sample.jpg', // 641 x 481
          width: 800,
          height: 600,
          layout: 'intrinsic',
        });
        applyStaticLayout(tmp);
        const attributes = {
          'i-amphtml-ssr': '',
        };
        for (let i = 0; i < tmp.attributes.length; i++) {
          attributes[tmp.attributes[i].name] = tmp.attributes[i].value;
        }

        const children = toArray(tmp.children);
        children.push(
          createElementWithAttributes(fixture.doc, 'img', {
            decoding: 'async',
            class: 'i-amphtml-fill-content i-amphtml-replaced-content',
            src: tmp.getAttribute('src'),
          })
        );

        return getImg(attributes, children)
          .then((image) => {
            ampImg = image;
            return browser.waitForElementLayout('amp-img');
          })
          .then(() => {
            expect(ampImg.querySelector('img[src*="sample.jpg"]')).to.exist;
            expect(ampImg.querySelector('img[src*="image/svg+xml"]')).to.exist;
          });
      });
    });
});
