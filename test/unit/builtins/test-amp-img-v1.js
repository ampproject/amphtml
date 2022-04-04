import {AmpImg} from '#builtins/amp-img/amp-img';

import {createElementWithAttributes, dispatchCustomEvent} from '#core/dom';
import {LayoutPriority_Enum, Layout_Enum} from '#core/dom/layout';

import {testElementR1} from '#testing/element-v1';

import {BaseElement} from '../../../src/base-element';

describes.realWin('amp-img R1', {amp: true}, (env) => {
  let win, doc;
  let sandbox;
  let windowWidth;

  const SRCSET_STRING = `/examples/img/hero@1x.jpg 641w,
                        /examples/img/hero@2x.jpg 1282w`;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    sandbox = env.sandbox;

    sandbox.stub(AmpImg, 'R1').returns(true);

    windowWidth = 320;
    sandbox.stub(BaseElement.prototype, 'getViewport').callsFake(() => {
      return {
        getWidth: () => windowWidth,
      };
    });
  });

  function createImg(attributes, children) {
    const img = createElementWithAttributes(doc, 'amp-img', attributes);

    if (children != null) {
      for (let i = 0; i < children.length; i++) {
        img.appendChild(children[i]);
      }
    }
    return img;
  }

  async function getImg(attributes, children) {
    const img = createImg(attributes, children);

    img.onload = sandbox.spy();
    img.onerror = sandbox.spy();

    doc.body.appendChild(img);
    await img.mount();
    return img;
  }

  it('testElementR1', () => {
    testElementR1(AmpImg, {
      exceptions: [
        'Must not have preconnectCallback',
        'Must not have layoutCallback',
        'Must not have unlayoutCallback',
        'Must not use getLayoutSize',
      ],
    });
  });

  it('getBuildPriority', () => {
    expect(AmpImg.getBuildPriority()).to.equal(LayoutPriority_Enum.CONTENT);
  });

  it('should load an img', async () => {
    const ampImg = await getImg({
      src: '/examples/img/sample.jpg',
      width: 300,
      height: 200,
      alt: 'An image',
      title: 'Image title',
      referrerpolicy: 'origin',
    });

    const img = ampImg.querySelector('img');
    expect(img.getAttribute('src')).to.equal('/examples/img/sample.jpg');
    expect(img.getAttribute('alt')).to.equal('An image');
    expect(img.getAttribute('title')).to.equal('Image title');
    expect(img.getAttribute('referrerpolicy')).to.equal('origin');
    expect(img.getAttribute('decoding')).to.equal('async');

    const toggleFallbackSpy = sandbox.spy(ampImg, 'toggleFallback');
    const togglePlaceholderSpy = sandbox.spy(ampImg, 'togglePlaceholder');

    expect(ampImg.readyState).to.equal('loading');
    expect(ampImg.onload).to.not.be.called;

    dispatchCustomEvent(img, 'load', null, {bubbles: false});
    expect(ampImg.readyState).to.equal('complete');
    expect(ampImg.onload).to.be.calledOnce;
    expect(ampImg.onerror).to.not.be.called;
    expect(toggleFallbackSpy).to.not.be.called;
    expect(togglePlaceholderSpy).to.be.calledOnce.calledWith(false);
  });

  it('should unload the img on unmount before loaded', async () => {
    const ampImg = await getImg({
      src: '/examples/img/sample.jpg',
      width: 300,
      height: 200,
      alt: 'An image',
      title: 'Image title',
      referrerpolicy: 'origin',
    });
    const iniImg = ampImg.querySelector('img');
    expect(iniImg).to.exist;

    ampImg.unmount();
    expect(ampImg.querySelector('img')).to.not.exist;
    expect(iniImg.src).to.contain('data:image/gif;');
  });

  it('should NOT unload the img on unmount after loaded', async () => {
    const ampImg = await getImg({
      src: '/examples/img/sample.jpg',
      width: 300,
      height: 200,
      alt: 'An image',
      title: 'Image title',
      referrerpolicy: 'origin',
    });
    const iniImg = ampImg.querySelector('img');
    expect(iniImg).to.exist;

    Object.defineProperty(iniImg, 'complete', {value: true});

    ampImg.unmount();
    expect(ampImg.querySelector('img')).to.equal(iniImg);
    expect(iniImg.src).to.not.contain('data:image/gif;');
  });

  it('should set eager loading on ensureLoaded', async () => {
    const ampImg = await getImg({
      src: '/examples/img/sample.jpg',
      width: 300,
      height: 200,
      alt: 'An image',
      title: 'Image title',
      referrerpolicy: 'origin',
    });

    const img = ampImg.querySelector('img');
    expect(img.loading == 'auto' || !img.loading).to.be.true;

    const promise = ampImg.ensureLoaded();
    await new Promise(setTimeout);
    expect(img.loading).to.equal('eager');

    dispatchCustomEvent(img, 'load', null, {bubbles: false});
    await promise;
  });

  it('should fail when img fails', async () => {
    const ampImg = await getImg({
      src: 'non-existent.jpg',
      width: 300,
      height: 200,
    });

    const img = ampImg.querySelector('img');
    expect(img.getAttribute('src')).to.equal('non-existent.jpg');

    const toggleFallbackSpy = sandbox.spy(ampImg, 'toggleFallback');
    const togglePlaceholderSpy = sandbox.spy(ampImg, 'togglePlaceholder');

    expect(ampImg.readyState).to.equal('loading');
    expect(ampImg.onerror).to.not.be.called;

    dispatchCustomEvent(img, 'error', null, {bubbles: false});
    expect(ampImg.readyState).to.equal('error');
    expect(ampImg.onerror).to.be.calledOnce;
    expect(toggleFallbackSpy).to.be.calledOnce.calledWith(true);
    expect(togglePlaceholderSpy).to.be.calledOnce.calledWith(false);
    expect(ampImg.onload).to.not.be.called;
  });

  it('should fallback once and remove fallback once image loads', async () => {
    const ampImg = await getImg({
      src: 'non-existent.jpg',
      width: 300,
      height: 200,
    });
    const toggleFallbackSpy = sandbox.spy(ampImg, 'toggleFallback');

    const img = ampImg.querySelector('img');
    dispatchCustomEvent(img, 'error', null, {bubbles: false});
    expect(ampImg.readyState).to.equal('error');
    expect(ampImg.onerror).to.be.calledOnce;
    expect(ampImg.onload).to.not.be.called;
    expect(toggleFallbackSpy).to.be.calledOnce.calledWith(true);
    expect(img).to.have.class('i-amphtml-ghost');

    dispatchCustomEvent(img, 'load', null, {bubbles: false});
    expect(ampImg.readyState).to.equal('complete');
    expect(ampImg.onload).to.be.calledOnce;
    expect(ampImg.onerror).to.be.calledOnce; // no change.
    expect(toggleFallbackSpy).to.be.calledTwice.calledWith(false);
    expect(img).to.not.have.class('i-amphtml-ghost');

    // 2nd error doesn't toggle fallback.
    dispatchCustomEvent(img, 'error', null, {bubbles: false});
    expect(ampImg.readyState).to.equal('error');
    expect(ampImg.onerror).to.be.calledTwice;
    expect(toggleFallbackSpy).to.be.calledTwice; // no change.
    expect(img).to.not.have.class('i-amphtml-ghost');
  });

  it('should not remove the fallback if fetching fails', async () => {
    const ampImg = await getImg({
      src: 'non-existent.jpg',
      width: 300,
      height: 200,
    });
    const toggleFallbackSpy = sandbox.spy(ampImg, 'toggleFallback');

    const img = ampImg.querySelector('img');
    expect(img).to.not.have.class('i-amphtml-ghost');

    dispatchCustomEvent(img, 'error', null, {bubbles: false});
    expect(ampImg.readyState).to.equal('error');
    expect(ampImg.onerror).to.be.calledOnce;
    expect(ampImg.onload).to.not.be.called;
    expect(toggleFallbackSpy).to.be.calledOnce.calledWith(true);
    expect(img).to.have.class('i-amphtml-ghost');

    dispatchCustomEvent(img, 'error', null, {bubbles: false});
    expect(toggleFallbackSpy).to.be.calledOnce; // no change.
    expect(img).to.have.class('i-amphtml-ghost');
  });

  it('should preconnect the src url', () => {
    const element = createImg({src: '/examples/img/sample.jpg'});
    expect(AmpImg.getPreconnects(element)).to.deep.equal([
      '/examples/img/sample.jpg',
    ]);
  });

  it('should preconnect to the the first srcset url if src is not set', () => {
    const element = createImg({srcset: SRCSET_STRING});
    expect(AmpImg.getPreconnects(element)).to.deep.equal([
      '/examples/img/hero@1x.jpg',
    ]);
  });

  it('should allow prerender by default', () => {
    const el = createImg({src: '/examples/img/sample.jpg'});
    expect(AmpImg.prerenderAllowed(el)).to.equal(true);
  });

  it('should allow preview by default', () => {
    const el = createImg({src: '/examples/img/sample.jpg'});
    expect(AmpImg.previewAllowed(el)).to.equal(true);
  });

  it('should load an img with srcset', async () => {
    const ampImg = await getImg({
      srcset: SRCSET_STRING,
      width: 300,
      height: 200,
    });
    const img = ampImg.querySelector('img');
    expect(img.getAttribute('srcset')).to.equal(SRCSET_STRING);
  });

  it('should handle attribute mutations', async () => {
    const ampImg = await getImg({
      src: '/examples/img/sample.jpg',
      srcset: SRCSET_STRING,
      width: 300,
      height: 200,
    });
    const impl = await ampImg.getImpl();

    const img = ampImg.querySelector('img');
    expect(img.getAttribute('src')).to.equal('/examples/img/sample.jpg');
    expect(img.getAttribute('srcset')).to.equal(SRCSET_STRING);

    dispatchCustomEvent(img, 'load', null, {bubbles: false});
    expect(ampImg.readyState).to.equal('complete');
    expect(ampImg.onload).to.be.calledOnce;

    ampImg.setAttribute('src', 'foo.jpg');
    impl.mutatedAttributesCallback({src: 'foo.jpg'});

    expect(img.getAttribute('src')).to.equal('foo.jpg');
    // src mutation should override existing srcset attribute.
    expect(img.hasAttribute('srcset')).to.be.false;

    expect(ampImg.readyState).to.equal('loading');
    expect(ampImg.onload).to.be.calledOnce; // no change.

    dispatchCustomEvent(img, 'load', null, {bubbles: false});
    expect(ampImg.readyState).to.equal('complete');
    expect(ampImg.onload).to.be.calledTwice;
  });

  it('should propagate srcset and sizes', async () => {
    const ampImg = await getImg({
      src: '/examples/img/sample.jpg',
      srcset: SRCSET_STRING,
      sizes: '(max-width: 320px) 640px, 100vw',
      width: 320,
      height: 240,
    });
    const img = ampImg.querySelector('img');
    expect(img.getAttribute('srcset')).to.equal(SRCSET_STRING);
    expect(img.getAttribute('sizes')).to.equal(
      '(max-width: 320px) 640px, 100vw'
    );
  });

  it('should propagate data attributes', async () => {
    const ampImg = await getImg({
      src: '/examples/img/sample.jpg',
      width: 320,
      height: 240,
      'data-foo': 'abc',
    });
    const img = ampImg.querySelector('img');
    expect(img.getAttribute('data-foo')).to.equal('abc');
  });

  it('should not propagate bind attributes', async () => {
    const ampImg = await getImg({
      src: '/examples/img/sample.jpg',
      width: 320,
      height: 240,
      'data-amp-bind': 'abc',
      'data-amp-bind-foo': '123',
    });
    const img = ampImg.querySelector('img');
    expect(img.getAttribute('data-amp-bind')).to.equal('abc');
    expect(img.getAttribute('data-amp-bind-foo')).to.be.null;
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

  it('should propagate crossorigin attribute', async () => {
    const ampImg = await getImg({
      src: '/examples/img/sample.jpg',
      width: 320,
      height: 240,
      crossorigin: 'anonymous',
    });
    const img = ampImg.querySelector('img');
    expect(img.getAttribute('crossorigin')).to.equal('anonymous');
  });

  it('should propagate ARIA attributes', async () => {
    const ampImg = await getImg({
      src: 'test.jpg',
      width: 100,
      height: 100,
      'aria-label': 'Hello',
      'aria-labelledby': 'id2',
      'aria-describedby': 'id3',
    });
    const img = ampImg.querySelector('img');
    expect(img.getAttribute('aria-label')).to.equal('Hello');
    expect(img.getAttribute('aria-labelledby')).to.equal('id2');
    expect(img.getAttribute('aria-describedby')).to.equal('id3');
  });

  it('should propagate the object-fit attribute', async () => {
    const ampImg = await getImg({
      src: '/examples/img/sample.jpg',
      width: 300,
      height: 200,
      'object-fit': 'cover',
    });
    const img = ampImg.querySelector('img');
    expect(img.style.objectFit).to.equal('cover');
  });

  it('should not propagate the object-fit attribute if invalid', async () => {
    const ampImg = await getImg({
      src: '/examples/img/sample.jpg',
      width: 300,
      height: 200,
      'object-fit': 'foo 80%',
    });
    const img = ampImg.querySelector('img');
    expect(img.style.objectFit).to.be.empty;
  });

  it('should propagate the object-position attribute', async () => {
    const ampImg = await getImg({
      src: '/examples/img/sample.jpg',
      width: 300,
      height: 200,
      'object-position': '20% 80%',
    });
    const img = ampImg.querySelector('img');
    expect(img.style.objectPosition).to.equal('20% 80%');
  });

  it('should not propagate the object-position attribute if invalid', async () => {
    const ampImg = await getImg({
      src: '/examples/img/sample.jpg',
      width: 300,
      height: 200,
      'object-position': 'url("example.com")',
    });
    const img = ampImg.querySelector('img');
    expect(img.style.objectPosition).to.be.empty;
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
      const el = createImg({
        src: '/examples/img/sample.jpg',
        id: 'img1',
        width: 100,
        height: 100,
      });
      sandbox.stub(el, 'togglePlaceholder');
      const img = doc.createElement('img');
      img.setAttribute(
        'src',
        'data:image/svg+xml;charset=utf-8,%3Csvg%3E%3C/svg%3E'
      );
      if (addPlaceholder) {
        img.setAttribute('placeholder', '');
      }
      if (addBlurClass) {
        img.classList.add('i-amphtml-blurry-placeholder');
      }
      el.appendChild(img);
      if (serverRendered) {
        const serverRenderedImg = doc.createElement('img');
        serverRenderedImg.setAttribute('src', '/examples/img/sample.jpg');
        el.appendChild(serverRenderedImg);
        el.setAttribute('i-amphtml-ssr', '');
      }
      doc.body.appendChild(el);
      return el;
    }

    it('should set placeholder opacity to 0 on image load', async () => {
      let el, img;

      el = getImgWithBlur(true, true);
      await el.build();
      dispatchCustomEvent(el.querySelector('img[amp-img-id]'), 'load', null, {
        bubbles: false,
      });
      img = el.firstChild;
      expect(img.style.opacity).to.equal('0');
      expect(el.togglePlaceholder).to.not.be.called;

      el = getImgWithBlur(true, false);
      await el.build();
      dispatchCustomEvent(el.querySelector('img[amp-img-id]'), 'load', null, {
        bubbles: false,
      });
      img = el.firstChild;
      expect(img.style.opacity).to.be.equal('');
      expect(el.togglePlaceholder).to.have.been.calledWith(false);

      el = getImgWithBlur(false, true);
      await el.build();
      dispatchCustomEvent(el.querySelector('img[amp-img-id]'), 'load', null, {
        bubbles: false,
      });
      img = el.firstChild;
      expect(img.style.opacity).to.be.equal('');
      expect(el.togglePlaceholder).to.have.been.calledWith(false);

      el = getImgWithBlur(false, false);
      await el.build();
      dispatchCustomEvent(el.querySelector('img[amp-img-id]'), 'load', null, {
        bubbles: false,
      });
      expect(el.togglePlaceholder).to.have.been.calledWith(false);
    });

    it('does not interfere with SSR img creation', async () => {
      const ampImg = getImgWithBlur(true, true);
      await ampImg.build();

      expect(ampImg.querySelector('img[src*="sample.jpg"]')).to.exist;
      expect(ampImg.querySelector('img[src*="image/svg+xml"]')).to.exist;
    });

    it('does not interfere with SSR img before placeholder', async () => {
      const ampImg = getImgWithBlur(true, true);
      ampImg.setAttribute('i-amphtml-ssr', '');

      const img = doc.createElement('img');
      img.setAttribute('src', ampImg.getAttribute('src'));
      ampImg.insertBefore(img, ampImg.querySelector('[placeholder]'));

      await ampImg.build();

      expect(ampImg.querySelector('img[src*="sample.jpg"]')).to.exist;
      expect(ampImg.querySelectorAll('img[src*="sample.jpg"]')).to.have.length(
        1
      );
      expect(ampImg.querySelector('img[src*="sample.jpg"]')).to.equal(img);
      expect(ampImg.querySelector('img[src*="image/svg+xml"]')).to.exist;
    });

    it('does not interfere with SSR img after placeholder', async () => {
      const ampImg = getImgWithBlur(true, true);
      ampImg.setAttribute('i-amphtml-ssr', '');

      const img = document.createElement('img');
      img.setAttribute('src', ampImg.getAttribute('src'));
      ampImg.appendChild(img);

      await ampImg.build();

      expect(ampImg.querySelector('img[src*="sample.jpg"]')).to.exist;
      expect(ampImg.querySelectorAll('img[src*="sample.jpg"]')).to.have.length(
        1
      );
      expect(ampImg.querySelector('img[src*="sample.jpg"]')).to.equal(img);
      expect(ampImg.querySelector('img[src*="image/svg+xml"]')).to.exist;
    });
  });

  describe('auto-generate sizes', () => {
    async function getStubbedImg(attributes, layoutWidth) {
      const img = createImg(attributes);
      sandbox
        .stub(img, 'getLayoutSize')
        .returns({width: layoutWidth, height: 100});
      doc.body.appendChild(img);
      await img.build();
      return img;
    }

    it('should not generate sizes for amp-imgs that already have sizes', async () => {
      const ampImg = await getImg({
        src: '/examples/img/sample.jpg',
        srcset: SRCSET_STRING,
        sizes: '50vw',
        width: 300,
        height: 200,
      });
      const img = ampImg.querySelector('img');
      expect(img.getAttribute('sizes')).to.equal('50vw');
    });

    it('should not generate sizes for amp-imgs without srcset', async () => {
      const ampImg = await getImg({
        src: '/examples/img/sample.jpg',
        width: 300,
        height: 200,
      });
      const img = ampImg.querySelector('img');
      expect(img.getAttribute('sizes')).to.be.null;
    });

    it('should not generate sizes for amp-imgs with x descriptors', async () => {
      const ampImg = await getImg({
        srcset: '/examples/img/hero@1x.jpg, /examples/img/hero@2x.jpg 2x',
        width: 300,
        height: 200,
      });
      const img = ampImg.querySelector('img');
      expect(img.getAttribute('sizes')).to.be.null;
    });

    it('should generate correct sizes for layout fixed', async () => {
      const ampImg = await getStubbedImg(
        {
          layout: Layout_Enum.FIXED,
          src: 'test.jpg',
          srcset: 'large.jpg 2000w, small.jpg 1000w',
          width: 300,
          height: 200,
        },
        300
      );
      const img = ampImg.querySelector('img');
      expect(img.getAttribute('sizes')).to.equal(
        '(max-width: 320px) 300px, 300px'
      );
    });

    it('should generate correct sizes for layout responsive', async () => {
      const ampImg = await getStubbedImg(
        {
          layout: Layout_Enum.RESPONSIVE,
          src: 'test.jpg',
          srcset: 'large.jpg 2000w, small.jpg 1000w',
          width: 300,
          height: 200,
        },
        160
      );
      const img = ampImg.querySelector('img');
      expect(img.getAttribute('sizes')).to.equal(
        '(max-width: 320px) 160px, 100vw'
      );
    });

    it('should generate correct sizes for layout fixed-height', async () => {
      const ampImg = await getStubbedImg(
        {
          layout: Layout_Enum.FIXED_HEIGHT,
          src: 'test.jpg',
          srcset: 'large.jpg 2000w, small.jpg 1000w',
          width: 300,
          height: 200,
        },
        160
      );
      const img = ampImg.querySelector('img');
      expect(img.getAttribute('sizes')).to.equal(
        '(max-width: 320px) 160px, 100vw'
      );
    });

    it('should generate correct sizes for layout fill', async () => {
      const ampImg = await getStubbedImg(
        {
          layout: Layout_Enum.FILL,
          src: 'test.jpg',
          srcset: 'large.jpg 2000w, small.jpg 1000w',
          width: 300,
          height: 200,
        },
        160
      );
      const img = ampImg.querySelector('img');
      expect(img.getAttribute('sizes')).to.equal(
        '(max-width: 320px) 160px, 100vw'
      );
    });

    it('should generate correct sizes for layout flex-item', async () => {
      const ampImg = await getStubbedImg(
        {
          layout: Layout_Enum.FLEX_ITEM,
          src: 'test.jpg',
          srcset: 'large.jpg 2000w, small.jpg 1000w',
          width: 300,
          height: 200,
        },
        160
      );
      const img = ampImg.querySelector('img');
      expect(img.getAttribute('sizes')).to.equal(
        '(max-width: 320px) 160px, 100vw'
      );
    });
  });
});
