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

import {createIframePromise} from '../../testing/iframe';
import {BaseElement} from '../../src/base-element';
import {installImg, AmpImg} from '../../builtins/amp-img';
import {resourcesForDoc} from '../../src/services';
import * as sinon from 'sinon';

describe('amp-img', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  function getImg(attributes, children) {
    sandbox.stub(BaseElement.prototype, 'isInViewport')
        .returns(true);
    return createIframePromise().then(iframe => {
      installImg(iframe.win);
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
      expect(ampImg.implementation_.getPriority()).to.equal(0);
      expect(img.getAttribute('alt')).to.equal('An image');
      expect(img.getAttribute('title')).to.equal('Image title');
      expect(img.getAttribute('referrerpolicy')).to.equal('origin');
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
      expect(ampImg.implementation_.getPriority()).to.equal(0);
    });
  });

  it('should load an img with srcset', () => {
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

  describe('#fallback on initial load', () => {
    let el;
    let impl;
    let toggleElSpy;

    beforeEach(() => {
      el = document.createElement('amp-img');
      el.setAttribute('src', 'test.jpg');
      el.setAttribute('width', 100);
      el.setAttribute('height', 100);
      el.getResources = () => resourcesForDoc(document);
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
