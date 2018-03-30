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

import * as sinon from 'sinon';
import {AmpImg, installImg} from '../../builtins/amp-img';
import {BaseElement} from '../../src/base-element';
import {LayoutPriority} from '../../src/layout';
import {Services} from '../../src/services';
import {createIframePromise} from '../../testing/iframe';

describe('amp-img', () => {
  let sandbox;
  let screenWidth;
  let windowWidth;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    screenWidth = 320;
    windowWidth = 320;
    sandbox.stub(BaseElement.prototype, 'isInViewport')
        .returns(true);
    sandbox.stub(BaseElement.prototype, 'getViewport').callsFake(() => {
      return {
        getWidth: () => windowWidth,
      };
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  function getImg(attributes, children) {
    return createIframePromise().then(iframe => {
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
      return iframe.addElement(img);
    });
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
      srcset: 'bad.jpg 2000w, /examples/img/sample.jpg 1000w',
      width: 300,
      height: 200,
    }).then(ampImg => {
      const img = ampImg.querySelector('img');
      expect(img.tagName).to.equal('IMG');
      expect(img.getAttribute('src')).to.equal('/examples/img/sample.jpg');
      expect(img.hasAttribute('referrerpolicy')).to.be.false;
    });
  });

  it('should load larger image on larger screen', () => {
    windowWidth = 3000;
    screenWidth = 300;
    return getImg({
      srcset: '/examples/img/sample.jpg?large 2000w, ' +
          '/examples/img/small.jpg?small 1000w',
      width: 300,
      height: 200,
    }).then(ampImg => {
      const img = ampImg.querySelector('img');
      expect(img.tagName).to.equal('IMG');
      expect(img.getAttribute('src')).to.equal(
          '/examples/img/sample.jpg?large');
      expect(img.hasAttribute('referrerpolicy')).to.be.false;
    });
  });

  it('should fall back to screen width for srcset', () => {
    windowWidth = 0;
    screenWidth = 3000;
    return getImg({
      srcset: '/examples/img/sample.jpg?large 2000w, ' +
          '/examples/img/small.jpg?small 1000w',
      width: 300,
      height: 200,
    }).then(ampImg => {
      const img = ampImg.querySelector('img');
      expect(img.tagName).to.equal('IMG');
      expect(img.getAttribute('src')).to.equal(
          '/examples/img/sample.jpg?large');
      expect(img.hasAttribute('referrerpolicy')).to.be.false;
    });
  });

  it('should preconnect to the the first srcset url if src is not set', () => {
    return getImg({
      srcset: 'http://google.com/bad.jpg 2000w, /examples/img/sample.jpg 1000w',
      width: 300,
      height: 200,
    }).then(ampImg => {
      const impl = ampImg.implementation_;
      sandbox.stub(impl.preconnect, 'url');
      impl.preconnectCallback(true);
      expect(impl.preconnect.url.called).to.be.true;
      expect(impl.preconnect.url).to.have.been.calledWith(
          'http://google.com/bad.jpg'
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

  describe('#fallback on initial load', () => {
    let el;
    let impl;
    let toggleElSpy;

    beforeEach(() => {
      el = document.createElement('amp-img');
      el.setAttribute('src', 'test.jpg');
      el.setAttribute('width', 100);
      el.setAttribute('height', 100);
      el.getResources = () => Services.resourcesForDoc(document);
      impl = new AmpImg(el);
      impl.createdCallback();
      sandbox.stub(impl, 'getLayoutWidth').returns(100);
      el.toggleFallback = function() {};
      toggleElSpy = sandbox.spy(el, 'toggleFallback');

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

    it('should not display fallback if loading succeeds', () => {
      sandbox.stub(impl, 'loadPromise').returns(Promise.resolve());
      const errorSpy = sandbox.spy(impl, 'onImgLoadingError_');
      const toggleSpy = sandbox.spy(impl, 'toggleFallback');
      impl.buildCallback();

      expect(errorSpy).to.have.not.been.called;
      expect(toggleSpy).to.have.not.been.called;
      expect(toggleElSpy).to.have.not.been.called;

      return impl.layoutCallback().then(() => {
        expect(errorSpy).to.have.not.been.called;
        expect(toggleSpy).to.have.not.been.called;
        expect(toggleElSpy).to.have.not.been.called;
      });
    });

    it('should display fallback if loading fails', () => {
      sandbox.stub(impl, 'loadPromise').returns(Promise.reject());
      const errorSpy = sandbox.spy(impl, 'onImgLoadingError_');
      const toggleSpy = sandbox.spy(impl, 'toggleFallback');
      impl.buildCallback();
      expect(errorSpy).to.have.not.been.called;
      expect(toggleSpy).to.have.not.been.called;
      expect(toggleElSpy).to.have.not.been.called;

      return impl.layoutCallback().catch(() => {
        expect(errorSpy).to.be.calledOnce;
        expect(toggleSpy).to.be.calledOnce;
        expect(toggleSpy.firstCall.args[0]).to.be.true;
        expect(toggleElSpy.firstCall.args[0]).to.be.true;
      });
    });

    it('should hide child placeholder elements if loading fails', () => {
      sandbox.stub(impl, 'loadPromise').returns(Promise.reject());
      const errorSpy = sandbox.spy(impl, 'onImgLoadingError_');
      const toggleSpy = sandbox.spy(impl, 'toggleFallback');
      const togglePlaceholderSpy = sandbox.spy(impl, 'togglePlaceholder');
      impl.buildCallback();
      expect(errorSpy).to.have.not.been.called;
      expect(toggleSpy).to.have.not.been.called;
      expect(togglePlaceholderSpy).to.have.not.been.called;
      expect(toggleElSpy).to.have.not.been.called;

      return impl.layoutCallback().catch(() => {
        expect(errorSpy).to.be.calledOnce;
        expect(toggleSpy).to.be.calledOnce;
        expect(toggleSpy.firstCall.args[0]).to.be.true;
        expect(togglePlaceholderSpy).to.be.calledOnce;
        expect(togglePlaceholderSpy.firstCall.args[0]).to.be.false;
        expect(toggleElSpy.firstCall.args[0]).to.be.true;
      });
    });

    it('should fallback only once', () => {
      const loadStub = sandbox.stub(impl, 'loadPromise');
      loadStub
          .onCall(0).returns(Promise.reject())
          .onCall(1).returns(Promise.resolve());
      loadStub.returns(Promise.resolve());
      const errorSpy = sandbox.spy(impl, 'onImgLoadingError_');
      const toggleSpy = sandbox.spy(impl, 'toggleFallback');
      impl.buildCallback();
      expect(errorSpy).to.have.not.been.called;
      expect(toggleSpy).to.have.not.been.called;
      expect(toggleElSpy).to.have.not.been.called;

      return impl.layoutCallback().catch(() => {
        expect(errorSpy).to.be.calledOnce;
        expect(toggleSpy).to.be.calledOnce;
        expect(toggleSpy.firstCall.args[0]).to.be.true;
        expect(toggleElSpy).to.be.calledOnce;
        expect(toggleElSpy.firstCall.args[0]).to.be.true;
        expect(errorSpy).to.be.calledOnce;
        return impl.layoutCallback();
      }).then(() => {
        expect(errorSpy).to.be.calledOnce;
        expect(toggleSpy).to.be.calledOnce;
        expect(toggleElSpy).to.be.calledOnce;
        return impl.layoutCallback();
      }).then(() => {
        expect(errorSpy).to.be.calledOnce;
        expect(toggleSpy).to.be.calledOnce;
        expect(toggleElSpy).to.be.calledOnce;
      });
    });

    it('should remove the fallback if src is successfully updated', () => {
      const loadStub = sandbox.stub(impl, 'loadPromise');
      loadStub.onCall(0).returns(Promise.reject());
      loadStub.returns(Promise.resolve());
      impl.buildCallback();

      expect(toggleElSpy).to.have.not.been.called;

      return impl.layoutCallback().catch(() => {
        expect(toggleElSpy).to.be.calledOnce;
        expect(toggleElSpy.getCall(0).args[0]).to.be.true;
        expect(impl.img_).to.have.class('i-amphtml-ghost');
        impl.img_.setAttribute('src', 'test-1000.jpg');
        return impl.layoutCallback().then(() => {
          expect(toggleElSpy).to.have.callCount(2);
          expect(toggleElSpy.getCall(1).args[0]).to.be.false;
          expect(impl.img_).to.not.have.class('i-amphtml-ghost');
        });
      });
    });

    it('should not remove the fallback if src is not updated', () => {
      const loadStub = sandbox.stub(impl, 'loadPromise');
      loadStub.onCall(0).returns(Promise.reject());
      loadStub.returns(Promise.resolve());
      impl.buildCallback();

      expect(el).to.not.have.class('i-amphtml-ghost');
      expect(toggleElSpy).to.have.not.been.called;
      return impl.layoutCallback().catch(() => {
        expect(toggleElSpy).to.be.calledOnce;
        expect(toggleElSpy.getCall(0).args[0]).to.be.true;
        expect(impl.img_).to.have.class('i-amphtml-ghost');
        return impl.layoutCallback().then(() => {
          expect(toggleElSpy).to.be.calledOnce;
          expect(impl.img_).to.have.class('i-amphtml-ghost');
        });
      });
    });

    it('should not remove the fallback if src is updated but ' +
       'fails fetching', () => {
      const loadStub = sandbox.stub(impl, 'loadPromise');
      loadStub.returns(Promise.reject());
      impl.buildCallback();

      expect(el).to.not.have.class('i-amphtml-ghost');
      expect(toggleElSpy).to.have.not.been.called;
      return impl.layoutCallback().catch(() => {
        expect(toggleElSpy).to.be.calledOnce;
        expect(toggleElSpy.getCall(0).args[0]).to.be.true;
        expect(impl.img_).to.have.class('i-amphtml-ghost');
        impl.img_.setAttribute('src', 'test-1000.jpg');
        return impl.layoutCallback().catch(() => {
          expect(toggleElSpy).to.be.calledOnce;
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
    impl.buildCallback();
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

    const impl = new AmpImg(el);
    impl.buildCallback();
    impl.layoutCallback();
    const img = el.querySelector('img');
    expect(img.getAttribute('aria-label')).to.equal('Hello');
    expect(img.getAttribute('aria-labelledby')).to.equal('id2');
    expect(img.getAttribute('aria-describedby')).to.equal('id3');
  });
});
