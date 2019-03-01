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
import {Layout, LayoutPriority} from '../../src/layout';
import {Services} from '../../src/services';
import {createCustomEvent} from '../../src/event-helper';
import {createIframePromise} from '../../testing/iframe';
import {isExperimentOn, toggleExperiment} from '../../src/experiments';

describe('amp-img', () => {
  let sandbox;
  let screenWidth;
  let windowWidth;
  let iframe;

  const SRCSET_STRING = `/examples/img/hero@1x.jpg 641w,
                        /examples/img/hero@2x.jpg 1282w`;

  beforeEach(() => {
    sandbox = sinon.sandbox;
    screenWidth = 320;
    windowWidth = 320;
    sandbox.stub(BaseElement.prototype, 'isInViewport')
        .returns(true);
    sandbox.stub(BaseElement.prototype, 'getViewport').callsFake(() => {
      return {
        getWidth: () => windowWidth,
      };
    });

    return createIframePromise().then(iframeFixture => {
      iframe = iframeFixture;
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  function getImg(attributes, children) {
    installImg(iframe.win);
    Object.defineProperty(iframe.win.screen, 'width', {
      get: () => screenWidth,
    });

    const img = iframe.doc.createElement('amp-img');
    for (const key in attributes) {
      img.setAttribute(key, attributes[key]);
    }

    if (children != null) {
      for (const key in children) {
        img.appendChild(children[key]);
      }
    }
    return Promise.resolve(iframe.addElement(img));
  }

  it('should load an img with more attributes', () => {
    return getImg({
      src: '/examples/img/sample.jpg',
      width: 300,
      height: 200,
      alt: 'An image',
      title: 'Image title',
      referrerpolicy: 'origin',
    }).then(ampImg => {
      const img = ampImg.querySelector('img');
      expect(img.tagName).to.equal('IMG');
      expect(img.getAttribute('src')).to.equal('/examples/img/sample.jpg');
      expect(ampImg.implementation_.getLayoutPriority()).to.equal(
          LayoutPriority.CONTENT);
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
    }).then(ampImg => {
      const img = ampImg.querySelector('img');
      expect(img.tagName).to.equal('IMG');
      expect(img.getAttribute('src')).to.equal('/examples/img/sample.jpg');
      expect(ampImg.implementation_.getLayoutPriority()).to.equal(
          LayoutPriority.CONTENT);
    });
  });

  it('should preconnect the src url', () => {
    return getImg({
      src: '/examples/img/sample.jpg',
      width: 300,
      height: 200,
    }).then(ampImg => {
      const impl = ampImg.implementation_;
      sandbox.stub(impl.preconnect, 'url');
      impl.preconnectCallback(true);
      const preconnecturl = impl.preconnect.url;
      expect(preconnecturl.called).to.be.true;
      expect(preconnecturl).to.have.been.calledWith('/examples/img/sample.jpg');
    });
  });

  it('should load an img with srcset', () => {
    windowWidth = 320;
    screenWidth = 4000;
    return getImg({
      srcset: SRCSET_STRING,
      width: 300,
      height: 200,
    }).then(ampImg => {
      const img = ampImg.querySelector('img');
      expect(img.tagName).to.equal('IMG');
      expect(img.getAttribute('srcset')).to.equal(SRCSET_STRING);
      expect(img.hasAttribute('referrerpolicy')).to.be.false;
    });
  });

  it('should preconnect to the the first srcset url if src is not set', () => {
    return getImg({
      srcset: SRCSET_STRING,
      width: 300,
      height: 200,
    }).then(ampImg => {
      const impl = ampImg.implementation_;
      sandbox.stub(impl.preconnect, 'url');
      impl.preconnectCallback(true);
      expect(impl.preconnect.url.called).to.be.true;
      expect(impl.preconnect.url).to.have.been.calledWith(
          '/examples/img/hero@1x.jpg'
      );
    });
  });

  // TODO(cvializ, #12336): unskip
  it.skip('should handle attribute mutations', () => {
    return getImg({
      src: 'test.jpg',
      srcset: 'large.jpg 2000w, small.jpg 1000w',
      width: 300,
      height: 200,
    }).then(ampImg => {
      const impl = ampImg.implementation_;

      ampImg.setAttribute('srcset', 'mutated-srcset.jpg 500w');
      ampImg.setAttribute('src', 'mutated-src.jpg');

      // `srcset` mutation should take precedence over `src` mutation.
      impl.mutatedAttributesCallback({
        srcset: 'mutated-srcset.jpg 1000w',
        src: 'mutated-src.jpg',
      });
      expect(impl.img_.getAttribute('src')).to.equal('mutated-srcset.jpg');

      // `src` mutation should override existing `srcset` attribute.
      impl.mutatedAttributesCallback({src: 'mutated-src.jpg'});
      expect(impl.img_.getAttribute('src')).to.equal('mutated-src.jpg');
    });
  });

  it('should propagate srcset and sizes', () => {
    return getImg({
      src: '/examples/img/sample.jpg',
      srcset: SRCSET_STRING,
      sizes: '(max-width: 320px) 640px, 100vw',
      width: 320,
      height: 240,
    }).then(ampImg => {
      const img = ampImg.querySelector('img');
      expect(img.getAttribute('srcset')).to.equal(SRCSET_STRING);
      expect(img.getAttribute('sizes')).to
          .equal('(max-width: 320px) 640px, 100vw');
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
      impl = new AmpImg(el);
      impl.createdCallback();
      sandbox.stub(impl, 'getLayoutWidth').returns(100);
      el.toggleFallback = function() {};
      el.togglePlaceholder = function() {};
      toggleFallbackSpy = sandbox.spy(el, 'toggleFallback');
      togglePlaceholderSpy = sandbox.spy(el, 'togglePlaceholder');
      errorSpy = sandbox.spy(impl, 'onImgLoadingError_');
      toggleSpy = sandbox.spy(impl, 'toggleFallback');

      impl.getVsync = function() {
        return {
          mutate(fn) {
            fn();
          },
        };
      };
      impl.getViewport = function() {
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
        const loadEvent = createCustomEvent(iframe.win, 'load');
        impl.img_.dispatchEvent(loadEvent);

        expect(errorSpy).to.be.calledOnce;
        expect(toggleSpy).to.have.callCount(2);
        expect(toggleSpy.getCall(1).args[0]).to.be.false;
        expect(toggleFallbackSpy).to.have.callCount(2);
        expect(toggleFallbackSpy.getCall(1).args[0]).to.be.false;
        expect(impl.img_).to.not.have.class('i-amphtml-ghost');

        // On further error, do not bring back the fallback image
        const errorEvent = createCustomEvent(iframe.win, 'error');
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
    impl.firstAttachedCallback();
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

    el.getPlaceholder = sandbox.stub();
    const impl = new AmpImg(el);
    impl.getAmpDoc = function() {
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

  describe('blurred image placeholder', () => {
    beforeEach(() => {
      toggleExperiment(window, 'blurry-placeholder', true, true);
    });

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
      if (addPlaceholder) {
        img.setAttribute('placeholder', '');
        el.getPlaceholder = () => img;
      } else {
        el.getPlaceholder = sandbox.stub();
      }
      if (addBlurClass) {
        img.classList.add('i-amphtml-blurry-placeholder');
      }
      el.appendChild(img);
      el.getResources = () => Services.resourcesForDoc(document);
      const impl = new AmpImg(el);
      sandbox.stub(impl, 'getLayoutWidth').returns(200);
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
  });

  describe('auto-generate sizes', () => {

    function getStubbedImg(attributes, layoutWidth) {
      const el = document.createElement('amp-img');
      for (const key in attributes) {
        el.setAttribute(key, attributes[key]);
      }
      el.getResources = () => Services.resourcesForDoc(document);
      el.getPlaceholder = sandbox.stub();
      const impl = new AmpImg(el);
      impl.createdCallback();
      sandbox.stub(impl, 'getLayoutWidth').returns(layoutWidth);
      sandbox.stub(impl, 'getLayout').returns(attributes['layout']);
      el.toggleFallback = function() {};
      el.togglePlaceholder = function() {};

      impl.mutateElement = fn => fn();
      impl.getViewport = function() {
        return {
          getWidth: () => windowWidth,
        };
      };
      return impl;
    }

    beforeEach(() => {
      toggleExperiment(window, 'amp-img-auto-sizes', true, true);
    });

    it('should not generate sizes for amp-imgs that already have sizes', () => {
      let impl;
      expect(isExperimentOn(window, 'amp-img-auto-sizes')).to.be.true;
      return getImg({
        src: '/examples/img/sample.jpg',
        srcset: SRCSET_STRING,
        sizes: '50vw',
        width: 300,
        height: 200,
      }).then(ampImg => {
        impl = ampImg.implementation_;
        impl.buildCallback();
        return impl.layoutCallback();
      }).then(() => {
        const img = impl.img_;
        expect(img.getAttribute('sizes')).to.equal('50vw');
      });
    });

    it('should not generate sizes for amp-imgs without srcset', () => {
      let impl;
      expect(isExperimentOn(window, 'amp-img-auto-sizes')).to.be.true;
      return getImg({
        src: '/examples/img/sample.jpg',
        width: 300,
        height: 200,
      }).then(ampImg => {
        impl = ampImg.implementation_;
        impl.buildCallback();
        return impl.layoutCallback();
      }).then(() => {
        const img = impl.img_;
        expect(img.getAttribute('sizes')).to.be.null;
      });
    });

    it('should not generate sizes for amp-imgs with x descriptors', () => {
      let impl;
      expect(isExperimentOn(window, 'amp-img-auto-sizes')).to.be.true;
      return getImg({
        srcset: '/examples/img/hero@1x.jpg, /examples/img/hero@2x.jpg 2x',
        width: 300,
        height: 200,
      }).then(ampImg => {
        impl = ampImg.implementation_;
        impl.buildCallback();
        return impl.layoutCallback();
      }).then(() => {
        const img = impl.img_;
        expect(img.getAttribute('sizes')).to.be.null;
      });
    });

    it('should generate correct sizes for layout fixed', () => {
      expect(isExperimentOn(window, 'amp-img-auto-sizes')).to.be.true;
      const impl = getStubbedImg({
        layout: Layout.FIXED,
        src: 'test.jpg',
        srcset: 'large.jpg 2000w, small.jpg 1000w',
        width: 300,
        height: 200,
      }, 300);
      impl.buildCallback();
      impl.initialize_();
      const img = impl.img_;
      expect(impl.getViewport().getWidth()).to.equal(320);
      expect(img.getAttribute('sizes')).to
          .equal('(max-width: 320px) 300px, 300px');
    });

    it('should generate correct sizes for layout responsive', () => {
      expect(isExperimentOn(window, 'amp-img-auto-sizes')).to.be.true;
      const impl = getStubbedImg({
        layout: Layout.RESPONSIVE,
        src: 'test.jpg',
        srcset: 'large.jpg 2000w, small.jpg 1000w',
        width: 300,
        height: 200,
      }, 160);
      impl.buildCallback();
      impl.initialize_();
      const img = impl.img_;
      expect(impl.getViewport().getWidth()).to.equal(320);
      expect(img.getAttribute('sizes')).to
          .equal('(max-width: 320px) 160px, 100vw');
    });

    it('should generate correct sizes for layout fixed-height', () => {
      expect(isExperimentOn(window, 'amp-img-auto-sizes')).to.be.true;
      const impl = getStubbedImg({
        layout: Layout.FIXED_HEIGHT,
        src: 'test.jpg',
        srcset: 'large.jpg 2000w, small.jpg 1000w',
        width: 300,
        height: 200,
      }, 160);
      impl.buildCallback();
      impl.initialize_();
      const img = impl.img_;
      expect(impl.getViewport().getWidth()).to.equal(320);
      expect(img.getAttribute('sizes')).to
          .equal('(max-width: 320px) 160px, 100vw');
    });

    it('should generate correct sizes for layout fill', () => {
      expect(isExperimentOn(window, 'amp-img-auto-sizes')).to.be.true;
      const impl = getStubbedImg({
        layout: Layout.FILL,
        src: 'test.jpg',
        srcset: 'large.jpg 2000w, small.jpg 1000w',
        width: 300,
        height: 200,
      }, 160);
      impl.buildCallback();
      impl.initialize_();
      const img = impl.img_;
      expect(impl.getViewport().getWidth()).to.equal(320);
      expect(img.getAttribute('sizes')).to
          .equal('(max-width: 320px) 160px, 100vw');
    });

    it('should generate correct sizes for layout flex-item', () => {
      expect(isExperimentOn(window, 'amp-img-auto-sizes')).to.be.true;
      const impl = getStubbedImg({
        layout: Layout.FLEX_ITEM,
        src: 'test.jpg',
        srcset: 'large.jpg 2000w, small.jpg 1000w',
        width: 300,
        height: 200,
      }, 160);
      impl.buildCallback();
      impl.initialize_();
      const img = impl.img_;
      expect(impl.getViewport().getWidth()).to.equal(320);
      expect(img.getAttribute('sizes')).to
          .equal('(max-width: 320px) 160px, 100vw');
    });

  });
});
