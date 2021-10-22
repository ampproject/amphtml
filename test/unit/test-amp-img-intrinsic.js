import {installImg} from '#builtins/amp-img/amp-img';

import {createElementWithAttributes} from '#core/dom';
import {applyStaticLayout} from '#core/static-layout';
import {toArray} from '#core/types/array';

import {BrowserController} from '#testing/helpers/service';
import {createIframePromise} from '#testing/iframe';

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
      natural size is larger', async () => {
        const ampImg = await getImg({
          src: '/examples/img/sample.jpg', // 641 x 481
          width: 100,
          height: 100,
          layout: 'intrinsic',
        });
        await browser.waitForElementLayout('amp-img');
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

      it('should reach given width and height even if image\
      natural size is smaller', async () => {
        const ampImg = await getImg({
          src: '/examples/img/sample.jpg', // 641 x 481
          width: 800,
          height: 600,
          layout: 'intrinsic',
        });
        await browser.waitForElementLayout('amp-img');
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

      it('expands a parent div with no explicit dimensions', async () => {
        const parentDiv = fixture.doc.getElementById('parent');
        // inline-block to force width and height to size of children
        // font-size 0 to get rid of the 4px added by inline-block for whitespace
        parentDiv.setAttribute('style', 'display: inline-block; font-size: 0;');
        const ampImg = await getImg({
          src: '/examples/img/sample.jpg', // 641 x 481
          width: 600,
          height: 400,
          layout: 'intrinsic',
        });
        await browser.waitForElementLayout('amp-img');
        expect(ampImg.getBoundingClientRect()).to.include({
          width: 600,
          height: 400,
        });
        expect(parentDiv.getBoundingClientRect()).to.include({
          width: 600,
          height: 400,
        });
      });

      it('is bounded by explicit dimensions of a parent container', async () => {
        const parentDiv = fixture.doc.getElementById('parent');
        parentDiv.setAttribute('style', 'width: 80px; height: 80px');

        const ampImg = await getImg({
          src: '/examples/img/sample.jpg', // 641 x 481
          width: 800,
          height: 600,
          layout: 'intrinsic',
        });
        await browser.waitForElementLayout('amp-img');
        expect(ampImg.getBoundingClientRect()).to.include({
          width: 80,
          height: 60,
        });
        expect(parentDiv.getBoundingClientRect()).to.include({
          width: 80,
          height: 80,
        });
      });

      it('SSR sizer does not interfere with img creation', async () => {
        const parentDiv = fixture.doc.getElementById('parent');
        parentDiv.setAttribute('style', 'width: 80px; height: 80px');

        // Hack so we don't duplicate intrinsic's layout code here.
        const tmp = createElementWithAttributes(fixture.doc, 'div', {
          src: '/examples/img/sample.jpg', // 641 x 481
          width: 800,
          height: 600,
          layout: 'intrinsic',
        });
        const serverRenderedImg = createElementWithAttributes(
          fixture.doc,
          'img',
          {
            src: '/examples/img/sample.jpg',
          }
        );
        applyStaticLayout(tmp);
        const attributes = {
          'i-amphtml-ssr': '',
        };
        for (let i = 0; i < tmp.attributes.length; i++) {
          attributes[tmp.attributes[i].name] = tmp.attributes[i].value;
        }

        const ampImg = await getImg(
          attributes,
          [serverRenderedImg].concat(toArray(tmp.children))
        );
        await browser.waitForElementLayout('amp-img');
        expect(ampImg.querySelector('img[src*="sample.jpg"]')).to.exist;
        expect(ampImg.querySelector('img[src*="image/svg+xml"]')).to.exist;
      });

      it('SSR sizer does not interfere with SSR img before', async () => {
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

        const ampImg = await getImg(attributes, children);
        await browser.waitForElementLayout('amp-img');
        expect(ampImg.querySelector('img[src*="sample.jpg"]')).to.exist;
        expect(ampImg.querySelector('img[src*="image/svg+xml"]')).to.exist;
      });

      it('SSR sizer does not interfere with SSR img after', async () => {
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

        const ampImg = await getImg(attributes, children);
        await browser.waitForElementLayout('amp-img');
        expect(ampImg.querySelector('img[src*="sample.jpg"]')).to.exist;
        expect(ampImg.querySelector('img[src*="image/svg+xml"]')).to.exist;
      });
    });
});
