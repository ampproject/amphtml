/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {AmpImg, installImg} from '../../builtins/amp-img';
import {BaseElement} from '../../src/base-element';
import {BrowserController} from '../../testing/test-helper';
import {Layout, LayoutPriority, applyStaticLayout} from '../../src/layout';
import {Services} from '../../src/services';
import {createCustomEvent} from '../../src/event-helper';
import {createElementWithAttributes} from '../../src/dom';
import {createIframePromise} from '../../testing/iframe';
import {toArray} from '../../src/types';

describes.sandboxed('amp-img', {}, (env) => {
  let sandbox;
  let screenWidth;
  let windowWidth;
  let fixture;

  const SRCSET_STRING = `/examples/img/hero@1x.jpg 641w,
                        /examples/img/hero@2x.jpg 1282w`;

  beforeEach(() => {
    sandbox = env.sandbox;

    screenWidth = 320;
    windowWidth = 320;
    sandbox.stub(BaseElement.prototype, 'isInViewport').returns(true);
    sandbox.stub(BaseElement.prototype, 'getViewport').callsFake(() => {
      return {
        getWidth: () => windowWidth,
      };
    });

    return createIframePromise().then((iframeFixture) => {
      fixture = iframeFixture;
    });
  });

  function getImg(attributes, children) {
    installImg(fixture.win);
    Object.defineProperty(fixture.win.screen, 'width', {
      get: () => screenWidth,
    });

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

  it('should load an img with more attributes', () => {
    return getImg({
      src: '/examples/img/sample.jpg',
      width: 300,
      height: 200,
      alt: 'An image',
      title: 'Image title',
      referrerpolicy: 'origin',
    }).then((ampImg) => {
      const img = ampImg.querySelector('img');
      expect(img.tagName).to.equal('IMG');
      expect(img.getAttribute('src')).to.equal('/examples/img/sample.jpg');
      expect(ampImg.implementation_.getLayoutPriority()).to.equal(
        LayoutPriority.CONTENT
      );
      expect(img.getAttribute('alt')).to.equal('An image');
      expect(img.getAttribute('title')).to.equal('Image title');
      expect(img.getAttribute('referrerpolicy')).to.equal('origin');
      expect(img.getAttribute('decoding')).to.equal('async');
    });
  });

  it('should load an img', () => {
    return getImg({
      src: '/examples/img/sample.jpg',
      width: 300,
      height: 200,
    }).then((ampImg) => {
      const img = ampImg.querySelector('img');
      expect(img.tagName).to.equal('IMG');
      expect(img.getAttribute('src')).to.equal('/examples/img/sample.jpg');
      expect(ampImg.implementation_.getLayoutPriority()).to.equal(
        LayoutPriority.CONTENT
      );
    });
  });

  it('should preconnect the src url', () => {
    const preconnect = {url: sandbox.stub()};
    sandbox.stub(Services, 'preconnectFor').returns(preconnect);

    return getImg({
      src: '/examples/img/sample.jpg',
      width: 300,
      height: 200,
    }).then((ampImg) => {
      const impl = ampImg.implementation_;
      impl.preconnectCallback(true);
      expect(preconnect.url).to.be.called;
      expect(preconnect.url).to.have.been.calledWith(
        sandbox.match.object,
        '/examples/img/sample.jpg'
      );
    });
  });

  it('should load an img with srcset', () => {
    windowWidth = 320;
    screenWidth = 4000;
    return getImg({
      srcset: SRCSET_STRING,
      width: 300,
      height: 200,
    }).then((ampImg) => {
      const img = ampImg.querySelector('img');
      expect(img.tagName).to.equal('IMG');
      expect(img.getAttribute('srcset')).to.equal(SRCSET_STRING);
      expect(img.hasAttribute('referrerpolicy')).to.be.false;
    });
  });

  it('should preconnect to the the first srcset url if src is not set', () => {
    const preconnect = {url: sandbox.stub()};
    sandbox.stub(Services, 'preconnectFor').returns(preconnect);

    return getImg({
      srcset: SRCSET_STRING,
      width: 300,
      height: 200,
    }).then((ampImg) => {
      const impl = ampImg.implementation_;
      impl.preconnectCallback(true);
      expect(preconnect.url).to.be.called;
      expect(preconnect.url).to.have.been.calledWith(
        sandbox.match.object,
        '/examples/img/hero@1x.jpg'
      );
    });
  });

  it('should handle attribute mutations', async () => {
    const ampImg = await getImg({
      src: '/examples/img/sample.jpg',
      srcset: SRCSET_STRING,
      width: 300,
      height: 200,
    });
    const impl = ampImg.implementation_;

    expect(impl.img_.hasAttribute('srcset')).to.be.true;

    ampImg.setAttribute('src', 'foo.jpg');
    impl.mutatedAttributesCallback({src: 'foo.jpg'});

    expect(impl.img_.getAttribute('src')).to.equal('foo.jpg');
    // src mutation should override existing srcset attribute.
    expect(impl.img_.hasAttribute('srcset')).to.be.false;
  });

  it('should propagate srcset and sizes', () => {
    return getImg({
      src: '/examples/img/sample.jpg',
      srcset: SRCSET_STRING,
      sizes: '(max-width: 320px) 640px, 100vw',
      width: 320,
      height: 240,
    }).then((ampImg) => {
      const img = ampImg.querySelector('img');
      expect(img.getAttribute('srcset')).to.equal(SRCSET_STRING);
      expect(img.getAttribute('sizes')).to.equal(
        '(max-width: 320px) 640px, 100vw'
      );
    });
  });

  it('should propagate data attributes', () => {
    return getImg({
      src: '/examples/img/sample.jpg',
      width: 320,
      height: 240,
      'data-foo': 'abc',
    }).then((ampImg) => {
      const img = ampImg.querySelector('img');
      expect(img.getAttribute('data-foo')).to.equal('abc');
    });
  });

  it('should not propagate bind attributes', () => {
    return getImg({
      src: '/examples/img/sample.jpg',
      width: 320,
      height: 240,
      'data-amp-bind': 'abc',
      'data-amp-bind-foo': '123',
    }).then((ampImg) => {
      const img = ampImg.querySelector('img');
      expect(img.getAttribute('data-amp-bind')).to.equal('abc');
      expect(img.getAttribute('data-amp-bind-foo')).to.be.undefined;
    });
  });

  it('should propagate srcset and sizes with disable-inline-width', async () => {
    const ampImg = await getImg({
      src: '/examples/img/sample.jpg',
      srcset: SRCSET_STRING,
      sizes: '(max-width: 320px) 640px, 100vw',
      width: 320,
      height: 240,
      'disable-inline-width': null,
    });
    const img = ampImg.querySelector('img');
    expect(img.getAttribute('srcset')).to.equal(SRCSET_STRING);
    expect(img.getAttribute('sizes')).to.equal(
      '(max-width: 320px) 640px, 100vw'
    );
  });

  it('should propagate crossorigin attribute', () => {
    return getImg({
      src: '/examples/img/sample.jpg',
      width: 320,
      height: 240,
      crossorigin: 'anonymous',
    }).then((ampImg) => {
      const img = ampImg.querySelector('img');
      expect(img.getAttribute('crossorigin')).to.equal('anonymous');
    });
  });

  describe('#fallback on initial load', () => {
    let el;
    let impl;
    let toggleFallbackSpy;
    let togglePlaceholderSpy;
    let errorSpy;
    let toggleSpy;

    beforeEach(() => {
      el = document.createElement('amp-img');
      el.setAttribute('src', '/examples/img/sample.jpg');
      el.setAttribute('width', 100);
      el.setAttribute('height', 100);
      el.getResources = () => Services.resourcesForDoc(document);
      el.getPlaceholder = sandbox.stub();
      el.getLayoutWidth = () => 100;
      impl = new AmpImg(el);
      el.toggleFallback = function () {};
      el.togglePlaceholder = function () {};
      toggleFallbackSpy = sandbox.spy(el, 'toggleFallback');
      togglePlaceholderSpy = sandbox.spy(el, 'togglePlaceholder');
      errorSpy = sandbox.spy(impl, 'onImgLoadingError_');
      toggleSpy = sandbox.spy(impl, 'toggleFallback');

      impl.getVsync = function () {
        return {
          mutate(fn) {
            fn();
          },
        };
      };
      impl.getViewport = function () {
        return {
          getWidth: () => windowWidth,
        };
      };
    });

    afterEach(() => {
      impl.unlayoutCallback();
    });

    it('should not display fallback if loading succeeds', () => {
      impl.buildCallback();
      expect(errorSpy).to.have.not.been.called;
      expect(toggleSpy).to.have.not.been.called;
      expect(toggleFallbackSpy).to.have.not.been.called;

      return impl.layoutCallback().then(() => {
        expect(errorSpy).to.have.not.been.called;
        expect(toggleSpy).to.have.not.been.called;
        expect(toggleFallbackSpy).to.have.not.been.called;
        expect(togglePlaceholderSpy).to.have.not.been.called;
      });
    });

    it('should display fallback if loading fails', () => {
      el.setAttribute('src', 'non-existent.jpg');
      impl.buildCallback();
      expect(errorSpy).to.have.not.been.called;
      expect(toggleSpy).to.have.not.been.called;
      expect(toggleFallbackSpy).to.have.not.been.called;
      return impl.layoutCallback().catch(() => {
        expect(errorSpy).to.be.calledOnce;
        expect(toggleSpy).to.be.calledOnce;
        expect(toggleSpy.firstCall.args[0]).to.be.true;
        expect(toggleFallbackSpy.firstCall.args[0]).to.be.true;
      });
    });

    it('should hide child placeholder elements if loading fails', () => {
      el.setAttribute('src', 'non-existent.jpg');
      impl.buildCallback();
      expect(errorSpy).to.have.not.been.called;
      expect(toggleSpy).to.have.not.been.called;
      expect(togglePlaceholderSpy).to.have.not.been.called;
      expect(toggleFallbackSpy).to.have.not.been.called;
      return impl.layoutCallback().catch(() => {
        expect(errorSpy).to.be.calledOnce;
        expect(toggleSpy).to.be.calledOnce;
        expect(toggleSpy.firstCall.args[0]).to.be.true;
        expect(togglePlaceholderSpy).to.be.calledOnce;
        expect(togglePlaceholderSpy.firstCall.args[0]).to.be.false;
        expect(toggleFallbackSpy.firstCall.args[0]).to.be.true;
      });
    });

    it('should fallback once and remove fallback once image loads', () => {
      el.setAttribute('src', 'non-existent.jpg');
      impl.buildCallback();
      expect(errorSpy).to.have.not.been.called;
      expect(toggleSpy).to.have.not.been.called;
      expect(toggleFallbackSpy).to.have.not.been.called;
      return impl.layoutCallback().catch(() => {
        expect(errorSpy).to.be.calledOnce;
        expect(toggleSpy).to.be.calledOnce;
        expect(toggleSpy.firstCall.args[0]).to.be.true;
        expect(toggleFallbackSpy).to.be.calledOnce;
        expect(toggleFallbackSpy.firstCall.args[0]).to.be.true;
        expect(impl.img_).to.have.class('i-amphtml-ghost');

        // On load, remove fallback
        const loadEvent = createCustomEvent(fixture.win, 'load');
        impl.img_.dispatchEvent(loadEvent);

        expect(errorSpy).to.be.calledOnce;
        expect(toggleSpy).to.have.callCount(2);
        expect(toggleSpy.getCall(1).args[0]).to.be.false;
        expect(toggleFallbackSpy).to.have.callCount(2);
        expect(toggleFallbackSpy.getCall(1).args[0]).to.be.false;
        expect(impl.img_).to.not.have.class('i-amphtml-ghost');

        // On further error, do not bring back the fallback image
        const errorEvent = createCustomEvent(fixture.win, 'error');
        impl.img_.dispatchEvent(errorEvent);

        expect(errorSpy).to.be.calledTwice;
        expect(toggleSpy).to.have.callCount(2);
        expect(toggleFallbackSpy).to.have.callCount(2);
        expect(impl.img_).to.not.have.class('i-amphtml-ghost');
      });
    });

    it('should not remove the fallback if fetching fails', () => {
      el.setAttribute('src', 'non-existent.jpg');
      impl.buildCallback();
      expect(el).to.not.have.class('i-amphtml-ghost');
      expect(toggleFallbackSpy).to.have.not.been.called;
      return impl.layoutCallback().catch(() => {
        expect(toggleFallbackSpy).to.be.calledOnce;
        expect(toggleFallbackSpy.getCall(0).args[0]).to.be.true;
        expect(impl.img_).to.have.class('i-amphtml-ghost');
        impl.img_.setAttribute('src', 'test-1000.jpg');
        return impl.layoutCallback().catch(() => {
          expect(toggleFallbackSpy).to.be.calledOnce;
          expect(impl.img_).to.have.class('i-amphtml-ghost');
        });
      });
    });
  });

  it('should respect noprerender attribute', () => {
    const el = document.createElement('amp-img');
    el.setAttribute('src', 'test.jpg');
    el.setAttribute('width', 100);
    el.setAttribute('height', 100);
    el.setAttribute('noprerender', '');
    const impl = new AmpImg(el);
    expect(impl.prerenderAllowed()).to.equal(false);
  });

  it('should allow prerender by default', () => {
    const el = document.createElement('amp-img');
    el.setAttribute('src', 'test.jpg');
    el.setAttribute('width', 100);
    el.setAttribute('height', 100);
    const impl = new AmpImg(el);
    impl.buildCallback();
    expect(impl.prerenderAllowed()).to.equal(true);
  });

  it('should propagate ARIA attributes', () => {
    const el = document.createElement('amp-img');
    el.setAttribute('src', 'test.jpg');
    el.setAttribute('width', 100);
    el.setAttribute('height', 100);
    el.setAttribute('aria-label', 'Hello');
    el.setAttribute('aria-labelledby', 'id2');
    el.setAttribute('aria-describedby', 'id3');
    el.getLayoutWidth = () => -1;

    el.getPlaceholder = sandbox.stub();
    const impl = new AmpImg(el);
    impl.getAmpDoc = function () {
      return window.AMP.ampdoc;
    };
    impl.buildCallback();
    impl.layoutCallback();
    const img = el.querySelector('img');
    expect(img.getAttribute('aria-label')).to.equal('Hello');
    expect(img.getAttribute('aria-labelledby')).to.equal('id2');
    expect(img.getAttribute('aria-describedby')).to.equal('id3');
    impl.unlayoutCallback();
  });

  it('should propagate the object-fit attribute', () => {
    return getImg({
      src: '/examples/img/sample.jpg',
      width: 300,
      height: 200,
      'object-fit': 'cover',
    }).then((ampImg) => {
      const img = ampImg.querySelector('img');
      expect(img.style.objectFit).to.equal('cover');
    });
  });

  it('should not propagate the object-fit attribute if invalid', () => {
    return getImg({
      src: '/examples/img/sample.jpg',
      width: 300,
      height: 200,
      'object-fit': 'foo 80%',
    }).then((ampImg) => {
      const img = ampImg.querySelector('img');
      expect(img.style.objectFit).to.be.empty;
    });
  });

  it('should propagate the object-position attribute', () => {
    return getImg({
      src: '/examples/img/sample.jpg',
      width: 300,
      height: 200,
      'object-position': '20% 80%',
    }).then((ampImg) => {
      const img = ampImg.querySelector('img');
      expect(img.style.objectPosition).to.equal('20% 80%');
    });
  });

  it('should not propagate the object-position attribute if invalid', () => {
    return getImg({
      src: '/examples/img/sample.jpg',
      width: 300,
      height: 200,
      'object-position': 'url("example.com")',
    }).then((ampImg) => {
      const img = ampImg.querySelector('img');
      expect(img.style.objectPosition).to.be.empty;
    });
  });

  it('should not error on unlayoutCallback before layoutCallback', () => {
    const el = document.createElement('amp-img');
    el.setAttribute('src', 'test.jpg');
    el.setAttribute('width', 100);
    el.setAttribute('height', 100);
    el.setAttribute('noprerender', '');
    const impl = new AmpImg(el);
    impl.buildCallback();
    impl.unlayoutCallback();
  });

  describe('blurred image placeholder', () => {
    /**
     * Creates an amp-img with an image child that could potentially be a
     * blurry placeholder.
     * @param {boolean} addPlaceholder Whether the child should have a
     *     placeholder attribute.
     * @param {boolean} addBlurClass Whether the child should have the
     *     class that allows it to be a blurred placeholder.
     * @return {AmpImg} An amp-img object potentially with a blurry placeholder
     */
    function getImgWithBlur(addPlaceholder, addBlurClass) {
      const el = document.createElement('amp-img');
      const img = document.createElement('img');
      el.setAttribute('src', '/examples/img/sample.jpg');
      img.src = 'data:image/svg+xml;charset=utf-8,%3Csvg%3E%3C/svg%3E';
      if (addPlaceholder) {
        img.setAttribute('placeholder', '');
        el.getPlaceholder = () => img;
      } else {
        el.getPlaceholder = sandbox.stub();
      }
      if (addBlurClass) {
        img.classList.add('i-amphtml-blurry-placeholder');
      }
      el.getLayoutWidth = () => 200;
      el.appendChild(img);
      el.getResources = () => Services.resourcesForDoc(document);
      const impl = new AmpImg(el);
      impl.togglePlaceholder = sandbox.stub();
      return impl;
    }

    it('should set placeholder opacity to 0 on image load', () => {
      let impl = getImgWithBlur(true, true);
      impl.buildCallback();
      impl.layoutCallback();
      impl.firstLayoutCompleted();
      let el = impl.element;
      let img = el.firstChild;
      expect(img.style.opacity).to.equal('0');
      expect(impl.togglePlaceholder).to.not.be.called;

      impl = getImgWithBlur(true, false);
      impl.buildCallback();
      impl.layoutCallback();
      impl.firstLayoutCompleted();
      el = impl.element;
      img = el.firstChild;
      expect(img.style.opacity).to.be.equal('');
      expect(impl.togglePlaceholder).to.have.been.calledWith(false);

      impl = getImgWithBlur(false, true);
      impl.buildCallback();
      impl.layoutCallback();
      impl.firstLayoutCompleted();
      el = impl.element;
      img = el.firstChild;
      expect(img.style.opacity).to.be.equal('');
      expect(impl.togglePlaceholder).to.have.been.calledWith(false);

      impl = getImgWithBlur(false, false);
      impl.buildCallback();
      impl.layoutCallback();
      impl.firstLayoutCompleted();
      el = impl.element;
      img = el.firstChild;
      expect(impl.togglePlaceholder).to.have.been.calledWith(false);
    });

    it('does not interfere with SSR img creation', () => {
      const impl = getImgWithBlur(true, true);
      const ampImg = impl.element;
      ampImg.setAttribute('i-amphtml-ssr', '');
      impl.buildCallback();
      impl.layoutCallback();

      expect(ampImg.querySelector('img[src*="sample.jpg"]')).to.exist;
      expect(ampImg.querySelector('img[src*="image/svg+xml"]')).to.exist;
    });

    it('does not interfere with SSR img before placeholder', () => {
      const impl = getImgWithBlur(true, true);
      const ampImg = impl.element;
      ampImg.setAttribute('i-amphtml-ssr', '');

      const img = document.createElement('img');
      img.src = ampImg.getAttribute('src');
      ampImg.insertBefore(img, impl.getPlaceholder());

      impl.buildCallback();
      impl.layoutCallback();

      expect(ampImg.querySelector('img[src*="sample.jpg"]')).to.exist;
      expect(ampImg.querySelector('img[src*="image/svg+xml"]')).to.exist;
    });

    it('does not interfere with SSR img after placeholder', () => {
      const impl = getImgWithBlur(true, true);
      const ampImg = impl.element;
      ampImg.setAttribute('i-amphtml-ssr', '');

      const img = document.createElement('img');
      img.src = ampImg.getAttribute('src');
      ampImg.appendChild(img);

      impl.buildCallback();
      impl.layoutCallback();

      expect(ampImg.querySelector('img[src*="sample.jpg"]')).to.exist;
      expect(ampImg.querySelector('img[src*="image/svg+xml"]')).to.exist;
    });
  });

  describe('auto-generate sizes', () => {
    function getStubbedImg(attributes, layoutWidth) {
      const el = document.createElement('amp-img');
      for (const key in attributes) {
        el.setAttribute(key, attributes[key]);
      }
      el.getResources = () => Services.resourcesForDoc(document);
      el.getPlaceholder = sandbox.stub();
      el.getLayoutWidth = () => layoutWidth;
      const impl = new AmpImg(el);
      sandbox.stub(impl, 'getLayout').returns(attributes['layout']);
      el.toggleFallback = function () {};
      el.togglePlaceholder = function () {};

      impl.getViewport = function () {
        return {
          getWidth: () => windowWidth,
        };
      };
      return impl;
    }

    it('should not generate sizes for amp-imgs that already have sizes', () => {
      let impl;
      return getImg({
        src: '/examples/img/sample.jpg',
        srcset: SRCSET_STRING,
        sizes: '50vw',
        width: 300,
        height: 200,
      })
        .then((ampImg) => {
          impl = ampImg.implementation_;
          impl.buildCallback();
          return impl.layoutCallback();
        })
        .then(() => {
          const img = impl.img_;
          expect(img.getAttribute('sizes')).to.equal('50vw');
        });
    });

    it('should not generate sizes for amp-imgs without srcset', () => {
      let impl;
      return getImg({
        src: '/examples/img/sample.jpg',
        width: 300,
        height: 200,
      })
        .then((ampImg) => {
          impl = ampImg.implementation_;
          impl.buildCallback();
          return impl.layoutCallback();
        })
        .then(() => {
          const img = impl.img_;
          expect(img.getAttribute('sizes')).to.be.null;
        });
    });

    it('should not generate sizes for amp-imgs with x descriptors', () => {
      let impl;
      return getImg({
        srcset: '/examples/img/hero@1x.jpg, /examples/img/hero@2x.jpg 2x',
        width: 300,
        height: 200,
      })
        .then((ampImg) => {
          impl = ampImg.implementation_;
          impl.buildCallback();
          return impl.layoutCallback();
        })
        .then(() => {
          const img = impl.img_;
          expect(img.getAttribute('sizes')).to.be.null;
        });
    });

    it('should generate correct sizes for layout fixed', () => {
      const impl = getStubbedImg(
        {
          layout: Layout.FIXED,
          src: 'test.jpg',
          srcset: 'large.jpg 2000w, small.jpg 1000w',
          width: 300,
          height: 200,
        },
        300
      );
      impl.buildCallback();
      impl.initialize_();
      const img = impl.img_;
      expect(impl.getViewport().getWidth()).to.equal(320);
      expect(img.getAttribute('sizes')).to.equal(
        '(max-width: 320px) 300px, 300px'
      );
    });

    it('should generate correct sizes for layout responsive', () => {
      const impl = getStubbedImg(
        {
          layout: Layout.RESPONSIVE,
          src: 'test.jpg',
          srcset: 'large.jpg 2000w, small.jpg 1000w',
          width: 300,
          height: 200,
        },
        160
      );
      impl.buildCallback();
      impl.initialize_();
      const img = impl.img_;
      expect(impl.getViewport().getWidth()).to.equal(320);
      expect(img.getAttribute('sizes')).to.equal(
        '(max-width: 320px) 160px, 100vw'
      );
    });

    it('should generate correct sizes for layout fixed-height', () => {
      const impl = getStubbedImg(
        {
          layout: Layout.FIXED_HEIGHT,
          src: 'test.jpg',
          srcset: 'large.jpg 2000w, small.jpg 1000w',
          width: 300,
          height: 200,
        },
        160
      );
      impl.buildCallback();
      impl.initialize_();
      const img = impl.img_;
      expect(impl.getViewport().getWidth()).to.equal(320);
      expect(img.getAttribute('sizes')).to.equal(
        '(max-width: 320px) 160px, 100vw'
      );
    });

    it('should generate correct sizes for layout fill', () => {
      const impl = getStubbedImg(
        {
          layout: Layout.FILL,
          src: 'test.jpg',
          srcset: 'large.jpg 2000w, small.jpg 1000w',
          width: 300,
          height: 200,
        },
        160
      );
      impl.buildCallback();
      impl.initialize_();
      const img = impl.img_;
      expect(impl.getViewport().getWidth()).to.equal(320);
      expect(img.getAttribute('sizes')).to.equal(
        '(max-width: 320px) 160px, 100vw'
      );
    });

    it('should generate correct sizes for layout flex-item', () => {
      const impl = getStubbedImg(
        {
          layout: Layout.FLEX_ITEM,
          src: 'test.jpg',
          srcset: 'large.jpg 2000w, small.jpg 1000w',
          width: 300,
          height: 200,
        },
        160
      );
      impl.buildCallback();
      impl.initialize_();
      const img = impl.img_;
      expect(impl.getViewport().getWidth()).to.equal(320);
      expect(img.getAttribute('sizes')).to.equal(
        '(max-width: 320px) 160px, 100vw'
      );
    });
  });

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
