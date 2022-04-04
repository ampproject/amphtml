import {
  ATTRIBUTES_TO_PROPAGATE,
  AmpImg,
  installImg,
} from '#builtins/amp-img/amp-img';

import {LayoutPriority_Enum, Layout_Enum} from '#core/dom/layout';

import {Services} from '#service';

import {createCustomEvent} from '#utils/event-helper';

import {createIframePromise} from '#testing/iframe';

import {BaseElement} from '../../../src/base-element';

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

  it('should load an img with more attributes', async () => {
    const ampImg = await getImg({
      src: '/examples/img/sample.jpg',
      width: 300,
      height: 200,
      alt: 'An image',
      title: 'Image title',
      referrerpolicy: 'origin',
    });
    const impl = await ampImg.getImpl(false);
    expect(impl.getLayoutPriority()).to.equal(LayoutPriority_Enum.CONTENT);

    const img = ampImg.querySelector('img');
    expect(img.tagName).to.equal('IMG');
    expect(img.getAttribute('src')).to.equal('/examples/img/sample.jpg');
    expect(img.getAttribute('alt')).to.equal('An image');
    expect(img.getAttribute('title')).to.equal('Image title');
    expect(img.getAttribute('referrerpolicy')).to.equal('origin');
    expect(img.getAttribute('decoding')).to.equal('async');
  });

  it('should load an img', async () => {
    const ampImg = await getImg({
      src: '/examples/img/sample.jpg',
      width: 300,
      height: 200,
    });
    const impl = await ampImg.getImpl(false);
    expect(impl.getLayoutPriority()).to.equal(LayoutPriority_Enum.CONTENT);

    const img = ampImg.querySelector('img');
    expect(img.tagName).to.equal('IMG');
    expect(img.getAttribute('src')).to.equal('/examples/img/sample.jpg');
  });

  it('should preconnect the src url', async () => {
    const preconnect = {url: sandbox.stub()};
    sandbox.stub(Services, 'preconnectFor').returns(preconnect);

    const ampImg = await getImg({
      src: '/examples/img/sample.jpg',
      width: 300,
      height: 200,
    });
    const impl = await ampImg.getImpl(false);
    impl.preconnectCallback(true);
    expect(preconnect.url).to.be.called;
    expect(preconnect.url).to.have.been.calledWith(
      sandbox.match.object,
      '/examples/img/sample.jpg'
    );
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

  it('should preconnect to the the first srcset url if src is not set', async () => {
    const preconnect = {url: sandbox.stub()};
    sandbox.stub(Services, 'preconnectFor').returns(preconnect);

    const ampImg = await getImg({
      srcset: SRCSET_STRING,
      width: 300,
      height: 200,
    });
    const impl = await ampImg.getImpl(false);
    impl.preconnectCallback(true);
    expect(preconnect.url).to.be.called;
    expect(preconnect.url).to.have.been.calledWith(
      sandbox.match.object,
      '/examples/img/hero@1x.jpg'
    );
  });

  it('should handle attribute mutations', async () => {
    const ampImg = await getImg({
      src: '/examples/img/sample.jpg',
      srcset: SRCSET_STRING,
      width: 300,
      height: 200,
    });
    const impl = await ampImg.getImpl(false);

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

  it('should propagate importance', () => {
    return getImg({
      src: '/examples/img/sample.jpg',
      importance: 'high',
      width: 320,
      height: 240,
    }).then((ampImg) => {
      const img = ampImg.querySelector('img');
      expect(img.getAttribute('importance')).to.equal('high');
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
      expect(img.getAttribute('data-amp-bind-foo')).to.be.null;
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
      el.getLayoutSize = () => ({width: 100, height: 100});
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

  it('should allow prerender by default', () => {
    const el = document.createElement('amp-img');
    el.setAttribute('src', 'test.jpg');
    el.setAttribute('width', 100);
    el.setAttribute('height', 100);
    expect(AmpImg.prerenderAllowed(el)).to.equal(true);
  });

  it('should allow preview by default', () => {
    const el = document.createElement('amp-img');
    el.setAttribute('src', 'test.jpg');
    el.setAttribute('width', 100);
    el.setAttribute('height', 100);
    expect(AmpImg.previewAllowed(el)).to.equal(true);
  });

  it('should propogate src as the final attribute', () => {
    expect(
      ATTRIBUTES_TO_PROPAGATE[ATTRIBUTES_TO_PROPAGATE.length - 1]
    ).to.equal('src');
  });

  it('should propagate ARIA attributes', () => {
    const el = document.createElement('amp-img');
    el.setAttribute('src', 'test.jpg');
    el.setAttribute('width', 100);
    el.setAttribute('height', 100);
    el.setAttribute('aria-label', 'Hello');
    el.setAttribute('aria-labelledby', 'id2');
    el.setAttribute('aria-describedby', 'id3');
    el.getLayoutSize = () => ({width: 0, height: 0});

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
     * @param {boolean} serverRendered If the image is server rendered.
     * @return {AmpImg} An amp-img object potentially with a blurry placeholder
     */
    function getImgWithBlur(
      addPlaceholder,
      addBlurClass,
      serverRendered = false
    ) {
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
      el.getLayoutSize = () => ({width: 200, height: 100});
      el.appendChild(img);
      el.getResources = () => Services.resourcesForDoc(document);
      if (serverRendered) {
        const serverRenderedImg = document.createElement('img');
        serverRenderedImg.setAttribute('src', '/examples/img/sample.jpg');
        el.appendChild(serverRenderedImg);
        el.setAttribute('i-amphtml-ssr', '');
      }
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
      const impl = getImgWithBlur(true, true, true);
      const ampImg = impl.element;
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
      el.getLayoutSize = () => ({width: layoutWidth, height: 100});
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

    it('should not generate sizes for amp-imgs that already have sizes on their rendered image children', async () => {
      const serverRenderedImg = document.createElement('img');
      serverRenderedImg.setAttribute('src', '/examples/img/sample.jpg');
      serverRenderedImg.setAttribute('srcset', SRCSET_STRING);
      serverRenderedImg.setAttribute('sizes', '50vw');
      const ampImg = await getImg(
        {
          src: '/examples/img/sample.jpg',
          srcset: SRCSET_STRING,
          sizes: '50vw',
          width: 300,
          height: 200,
        },
        [serverRenderedImg]
      );
      const impl = await ampImg.getImpl(false);
      impl.buildCallback();
      await impl.layoutCallback();
      const img = impl.img_;
      expect(img.getAttribute('sizes')).to.equal('50vw');
    });

    it('should not generate sizes for amp-imgs when rendered from the server', async () => {
      const serverRenderedImg = document.createElement('img');
      serverRenderedImg.setAttribute('src', '/examples/img/sample.jpg');
      serverRenderedImg.setAttribute('srcset', SRCSET_STRING);
      const ampImg = await getImg(
        {
          src: '/examples/img/sample.jpg',
          srcset: SRCSET_STRING,
          width: 300,
          height: 200,
          'i-amphtml-ssr': '',
        },
        [serverRenderedImg]
      );
      const impl = await ampImg.getImpl(false);
      impl.buildCallback();
      await impl.layoutCallback();
      const img = impl.img_;
      expect(img.hasAttribute('sizes')).to.be.false;
    });

    it('should not generate sizes for amp-imgs, rendered with sizes from the server', async () => {
      const ampImg = await getImg({
        src: '/examples/img/sample.jpg',
        srcset: SRCSET_STRING,
        sizes: '50vw',
        width: 300,
        height: 200,
      });
      const impl = await ampImg.getImpl(false);
      impl.buildCallback();
      await impl.layoutCallback();
      const img = impl.img_;
      expect(img.getAttribute('sizes')).to.equal('50vw');
    });

    it('should not generate sizes for amp-imgs without srcset', async () => {
      const ampImg = await getImg({
        src: '/examples/img/sample.jpg',
        width: 300,
        height: 200,
      });
      const impl = await ampImg.getImpl(false);
      impl.buildCallback();
      await impl.layoutCallback();
      const img = impl.img_;
      expect(img.getAttribute('sizes')).to.be.null;
    });

    it('should not generate sizes for amp-imgs with x descriptors', async () => {
      const ampImg = await getImg({
        srcset: '/examples/img/hero@1x.jpg, /examples/img/hero@2x.jpg 2x',
        width: 300,
        height: 200,
      });
      const impl = await ampImg.getImpl(false);
      impl.buildCallback();
      await impl.layoutCallback();
      const img = impl.img_;
      expect(img.getAttribute('sizes')).to.be.null;
    });

    it('should generate correct sizes for layout fixed', () => {
      const impl = getStubbedImg(
        {
          layout: Layout_Enum.FIXED,
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
          layout: Layout_Enum.RESPONSIVE,
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
          layout: Layout_Enum.FIXED_HEIGHT,
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
          layout: Layout_Enum.FILL,
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
          layout: Layout_Enum.FLEX_ITEM,
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
});
