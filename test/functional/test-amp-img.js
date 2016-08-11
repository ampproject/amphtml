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
      src: '/base/examples/img/sample.jpg',
      width: 300,
      height: 200,
      alt: 'An image',
      referrerpolicy: 'origin',
    }).then(ampImg => {
      const img = ampImg.querySelector('img');
      expect(img.tagName).to.equal('IMG');
      expect(img.getAttribute('src')).to.equal('/base/examples/img/sample.jpg');
      expect(ampImg.implementation_.getPriority()).to.equal(0);
      expect(img.getAttribute('alt')).to.equal('An image');
      expect(img.getAttribute('referrerpolicy')).to.equal('origin');
    });
  });

  it('should load an img', () => {
    return getImg({
      src: '/base/examples/img/sample.jpg',
      width: 300,
      height: 200,
    }).then(ampImg => {
      const img = ampImg.querySelector('img');
      expect(img.tagName).to.equal('IMG');
      expect(img.getAttribute('src')).to.equal('/base/examples/img/sample.jpg');
      expect(ampImg.implementation_.getPriority()).to.equal(0);
    });
  });

  it('should load an img with srcset', () => {
    return getImg({
      srcset: 'bad.jpg 2000w, /base/examples/img/sample.jpg 1000w',
      width: 300,
      height: 200,
    }).then(ampImg => {
      const img = ampImg.querySelector('img');
      expect(img.tagName).to.equal('IMG');
      expect(img.getAttribute('src')).to.equal('/base/examples/img/sample.jpg');
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
      impl = new AmpImg(el);
      impl.createdCallback();
      sandbox.stub(impl, 'getLayoutWidth').returns(100);
      el.toggleFallback = function() {};
      toggleElSpy = sandbox.spy(el, 'toggleFallback');

      impl.getVsync = function() {
        return {
          mutate: function(fn) {
            fn();
          },
        };
      };
    });

    it('should not display fallback if loading succeeds', () => {
      sandbox.stub(impl, 'loadPromise_').returns(Promise.resolve());
      const errorSpy = sandbox.spy(impl, 'onImgLoadingError_');
      const toggleSpy = sandbox.spy(impl, 'toggleFallback');
      impl.buildCallback();

      expect(errorSpy.callCount).to.equal(0);
      expect(toggleSpy.callCount).to.equal(0);
      expect(toggleElSpy.callCount).to.equal(0);

      return impl.layoutCallback().then(() => {
        expect(errorSpy.callCount).to.equal(0);
        expect(toggleSpy.callCount).to.equal(0);
        expect(toggleElSpy.callCount).to.equal(0);
      });
    });

    it('should display fallback if loading fails', () => {
      sandbox.stub(impl, 'loadPromise_').returns(Promise.reject());
      const errorSpy = sandbox.spy(impl, 'onImgLoadingError_');
      const toggleSpy = sandbox.spy(impl, 'toggleFallback');
      impl.buildCallback();
      expect(errorSpy.callCount).to.equal(0);
      expect(toggleSpy.callCount).to.equal(0);
      expect(toggleElSpy.callCount).to.equal(0);

      return impl.layoutCallback().catch(() => {
        expect(errorSpy.callCount).to.equal(1);
        expect(toggleSpy.callCount).to.equal(1);
        expect(toggleSpy.firstCall.args[0]).to.be.true;
        expect(toggleElSpy.firstCall.args[0]).to.be.true;
      });
    });

    it('should fallback only once', () => {
      const loadStub = sandbox.stub(impl, 'loadPromise_');
      loadStub
          .onCall(0).returns(Promise.reject())
          .onCall(1).returns(Promise.resolve());
      loadStub.returns(Promise.resolve());
      const errorSpy = sandbox.spy(impl, 'onImgLoadingError_');
      const toggleSpy = sandbox.spy(impl, 'toggleFallback');
      impl.buildCallback();
      expect(errorSpy.callCount).to.equal(0);
      expect(toggleSpy.callCount).to.equal(0);
      expect(toggleElSpy.callCount).to.equal(0);

      return impl.layoutCallback().catch(() => {
        expect(errorSpy.callCount).to.equal(1);
        expect(toggleSpy.callCount).to.equal(1);
        expect(toggleSpy.firstCall.args[0]).to.be.true;
        expect(toggleElSpy.callCount).to.equal(1);
        expect(toggleElSpy.firstCall.args[0]).to.be.true;
        expect(errorSpy.callCount).to.equal(1);
        return impl.layoutCallback();
      }).then(() => {
        expect(errorSpy.callCount).to.equal(1);
        expect(toggleSpy.callCount).to.equal(1);
        expect(toggleElSpy.callCount).to.equal(1);
        return impl.layoutCallback();
      }).then(() => {
        expect(errorSpy.callCount).to.equal(1);
        expect(toggleSpy.callCount).to.equal(1);
        expect(toggleElSpy.callCount).to.equal(1);
      });
    });

    it('should remove the fallback if src is successfully updated', () => {
      const loadStub = sandbox.stub(impl, 'loadPromise_');
      loadStub.onCall(0).returns(Promise.reject());
      loadStub.returns(Promise.resolve());
      impl.buildCallback();

      expect(toggleElSpy.callCount).to.equal(0);

      return impl.layoutCallback().catch(() => {
        expect(toggleElSpy.callCount).to.equal(1);
        expect(toggleElSpy.getCall(0).args[0]).to.be.true;
        expect(impl.img_).to.have.class('-amp-ghost');
        impl.img_.setAttribute('src', 'test-1000.jpg');
        return impl.layoutCallback().then(() => {
          expect(toggleElSpy.callCount).to.equal(2);
          expect(toggleElSpy.getCall(1).args[0]).to.be.false;
          expect(impl.img_).to.not.have.class('-amp-ghost');
        });
      });
    });

    it('should not remove the fallback if src is not updated', () => {
      const loadStub = sandbox.stub(impl, 'loadPromise_');
      loadStub.onCall(0).returns(Promise.reject());
      loadStub.returns(Promise.resolve());
      impl.buildCallback();

      expect(el).to.not.have.class('-amp-ghost');
      expect(toggleElSpy.callCount).to.equal(0);
      return impl.layoutCallback().catch(() => {
        expect(toggleElSpy.callCount).to.equal(1);
        expect(toggleElSpy.getCall(0).args[0]).to.be.true;
        expect(impl.img_).to.have.class('-amp-ghost');
        return impl.layoutCallback().then(() => {
          expect(toggleElSpy.callCount).to.equal(1);
          expect(impl.img_).to.have.class('-amp-ghost');
        });
      });
    });

    it('should not remove the fallback if src is updated but ' +
       'fails fetching', () => {
      const loadStub = sandbox.stub(impl, 'loadPromise_');
      loadStub.returns(Promise.reject());
      impl.buildCallback();

      expect(el).to.not.have.class('-amp-ghost');
      expect(toggleElSpy.callCount).to.equal(0);
      return impl.layoutCallback().catch(() => {
        expect(toggleElSpy.callCount).to.equal(1);
        expect(toggleElSpy.getCall(0).args[0]).to.be.true;
        expect(impl.img_).to.have.class('-amp-ghost');
        impl.img_.setAttribute('src', 'test-1000.jpg');
        return impl.layoutCallback().catch(() => {
          expect(toggleElSpy.callCount).to.equal(1);
          expect(impl.img_).to.have.class('-amp-ghost');
        });
      });
    });

  });
});
