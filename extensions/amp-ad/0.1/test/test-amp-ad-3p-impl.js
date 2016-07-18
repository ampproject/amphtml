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

import {AmpAd3PImpl} from '../amp-ad-3p-impl';
import {createAdPromise} from '../../../../testing/ad-iframe';
import * as sinon from 'sinon';

describe('amp-ad-3p-impl', tests('amp-ad'));

function tests(name) {
  function getAd(attributes, canonical, opt_handleElement,
      opt_beforeLayoutCallback) {
    return createAdPromise(name, attributes, canonical,
        opt_handleElement, opt_beforeLayoutCallback);
  }

  return () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
    });
    afterEach(() => {
      sandbox.restore();
    });

    it('render an ad', () => {
      return getAd({
        width: 300,
        height: 250,
        type: '_ping_',
        src: 'https://testsrc',
        // Test precedence
        'data-width': '6666',
      }, 'https://schema.org').then(ad => {
        expect(ad.implementation_).to.be.instanceof(AmpAd3PImpl);

        const iframe = ad.firstChild;
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        const url = iframe.getAttribute('src');
        expect(url).to.match(/^http:\/\/ads.localhost:/);
        expect(url).to.match(/frame(.max)?.html#{/);
        expect(iframe.style.display).to.equal('');
        expect(ad.implementation_.getPriority()).to.equal(2);

        const fragment = url.substr(url.indexOf('#') + 1);
        const data = JSON.parse(fragment);

        expect(data.type).to.equal('_ping_');
        expect(data.src).to.equal('https://testsrc');
        expect(data.width).to.equal(300);
        expect(data.height).to.equal(250);
        expect(data._context.canonicalUrl).to.equal('https://schema.org/');

        const doc = iframe.ownerDocument;
        let fetches = doc.querySelectorAll(
            'link[rel=prefetch]');
        if (!fetches.length) {
          fetches = doc.querySelectorAll(
              'link[rel=preload]');
        }
        expect(fetches).to.have.length(2);
        expect(fetches[0].href).to.equal(
            'http://ads.localhost:' + location.port +
            '/base/dist.3p/current/frame.max.html');
        expect(fetches[1].href).to.equal(
            'https://3p.ampproject.net/$internalRuntimeVersion$/f.js');
        const preconnects = doc.querySelectorAll(
            'link[rel=preconnect]');
        expect(preconnects[preconnects.length - 1].href).to.equal(
            'https://testsrc/');
        // Make sure we run tests without CID available by default.
        const win = ad.ownerDocument.defaultView;
        expect(win.services.cid).to.be.undefined;
        expect(win.a2alistener).to.be.true;
      });
    });

    describe('ad resize', () => {
      it('should listen for resize events', () => {
        const iframeSrc = 'http://ads.localhost:' + location.port +
            '/base/test/fixtures/served/iframe.html';
        return getAd({
          width: 100,
          height: 100,
          type: '_ping_',
          src: 'testsrc',
          resizable: '',
        }, 'https://schema.org').then(element => {
          return new Promise((resolve, unusedReject) => {
            const impl = element.implementation_;
            impl.layoutCallback();
            impl.apiHandler_.updateSize_ = (newHeight, newWidth) => {
              expect(newHeight).to.equal(217);
              expect(newWidth).to.equal(114);
              resolve(impl);
            };
            impl.iframe_.onload = function() {
              impl.iframe_.contentWindow.postMessage({
                sentinel: 'amp-test',
                type: 'requestHeight',
                is3p: true,
                height: 217,
                width: 114,
                amp3pSentinel:
                    impl.iframe_.getAttribute('data-amp-3p-sentinel'),
              }, '*');
            };
            impl.iframe_.src = iframeSrc;
          });
        }).then(impl => {
          expect(impl.iframe_.height).to.equal('217');
          expect(impl.iframe_.width).to.equal('114');
        });
      });

      it('should resize height only', () => {
        const iframeSrc = 'http://ads.localhost:' + location.port +
            '/base/test/fixtures/served/iframe.html';
        return getAd({
          width: 100,
          height: 100,
          type: '_ping_',
          src: 'testsrc',
          resizable: '',
        }, 'https://schema.org').then(element => {
          return new Promise((resolve, unusedReject) => {
            const impl = element.implementation_;
            impl.layoutCallback();
            impl.apiHandler_.updateSize_ = (newHeight, newWidth) => {
              expect(newHeight).to.equal(217);
              expect(newWidth).to.be.undefined;
              resolve(impl);
            };
            impl.iframe_.onload = function() {
              impl.iframe_.contentWindow.postMessage({
                sentinel: 'amp-test',
                type: 'requestHeight',
                is3p: true,
                height: 217,
                amp3pSentinel:
                    impl.iframe_.getAttribute('data-amp-3p-sentinel'),
              }, '*');
            };
            impl.iframe_.src = iframeSrc;
          });
        }).then(impl => {
          expect(impl.iframe_.height).to.equal('217');
        });
      });

      it('should fallback for resize with overflow', () => {
        return getAd({
          width: 100,
          height: 100,
          type: '_ping_',
          src: 'testsrc',
          resizable: '',
        }, 'https://schema.org').then(element => {
          const impl = element.implementation_;
          impl.attemptChangeSize = sandbox.spy();
          impl.apiHandler_.updateSize_(217, 114);
          expect(impl.attemptChangeSize.callCount).to.equal(1);
          expect(impl.attemptChangeSize.firstCall.args[0]).to.equal(217);
          expect(impl.attemptChangeSize.firstCall.args[1]).to.equal(114);
        });
      });

      it('should fallback for resize (height only) with overflow', () => {
        return getAd({
          width: 100,
          height: 100,
          type: '_ping_',
          src: 'testsrc',
          resizable: '',
        }, 'https://schema.org').then(element => {
          const impl = element.implementation_;
          impl.attemptChangeSize = sandbox.spy();
          impl.apiHandler_.updateSize_(217);
          expect(impl.attemptChangeSize.callCount).to.equal(1);
          expect(impl.attemptChangeSize.firstCall.args[0]).to.equal(217);
        });
      });
    });

    it('should require a canonical', () => {
      return expect(getAd({
        width: 300,
        height: 250,
        type: '_ping_',
      }, null)).to.be.rejectedWith(/canonical/);
    });

    it('should require a type', () => {
      return expect(getAd({
        width: 300,
        height: 250,
      }, null)).to.be.rejectedWith(/type/);
    });

    it('must not be position:fixed', () => {
      return expect(getAd({
        width: 300,
        height: 250,
        type: '_ping_',
        src: 'testsrc',
      }, 'https://schema.org', function(ad) {
        ad.style.position = 'fixed';
        return ad;
      })).to.be.rejectedWith(/fixed/);
    });

    it('parent must not be position:fixed', () => {
      return expect(getAd({
        width: 300,
        height: 250,
        type: '_ping_',
        src: 'testsrc',
      }, 'https://schema.org', function(ad) {
        const s = document.createElement('style');
        s.textContent = '.fixed {position:fixed;}';
        ad.ownerDocument.body.appendChild(s);
        const p = ad.ownerDocument.getElementById('parent');
        p.className = 'fixed';
        return ad;
      })).to.be.rejectedWith(/fixed/);
    });

    it('amp-lightbox can be position:fixed', () => {
      return expect(getAd({
        width: 300,
        height: 250,
        type: '_ping_',
        src: 'testsrc',
      }, 'https://schema.org', function(ad) {
        const lightbox = document.createElement('amp-lightbox');
        lightbox.style.position = 'fixed';
        const p = ad.ownerDocument.getElementById('parent');
        p.parentElement.appendChild(lightbox);
        p.parentElement.removeChild(p);
        lightbox.appendChild(p);
        return ad;
      })).to.be.not.be.rejected;
    });

    describe('has no-content', () => {
      it('should display fallback', () => {
        return getAd({
          width: 300,
          height: 250,
          type: '_ping_',
          src: 'testsrc',
        }, 'https://schema.org', ad => {
          const fallback = document.createElement('div');
          fallback.setAttribute('fallback', '');
          ad.appendChild(fallback);
          return ad;
        }).then(ad => {
          sandbox.stub(
              ad.implementation_, 'deferMutate', function(callback) {
                callback();
              });
          expect(ad).to.not.have.class('amp-notsupported');
          ad.implementation_.noContentHandler_();
          expect(ad).to.have.class('amp-notsupported');
        });
      });

      it('should collapse when attemptChangeHeight succeeds', () => {
        return getAd({
          width: 300,
          height: 750,
          type: '_ping_',
          src: 'testsrc',
        }, 'https://schema.org', ad => {
          return ad;
        }).then(ad => {
          sandbox.stub(
              ad.implementation_, 'deferMutate', function(callback) {
                callback();
              });
          sandbox.stub(ad.implementation_,
              'attemptChangeHeight',
              function(height, callback) {
                ad.style.height = height;
                callback();
              });
          const collapse = sandbox.spy(ad.implementation_, 'collapse');
          ad.style.position = 'absolute';
          ad.style.top = '300px';
          ad.style.left = '50px';
          expect(ad.style.display).to.not.equal('none');
          ad.implementation_.noContentHandler_();
          expect(ad.style.display).to.equal('none');
          expect(collapse).to.have.been.called;
        });
      });

      it('should hide placeholder when ad falls back', () => {
        return getAd({
          width: 300,
          height: 750,
          type: '_ping_',
          src: 'testsrc',
        }, 'https://schema.org', ad => {
          const placeholder = document.createElement('div');
          placeholder.setAttribute('placeholder', '');
          ad.appendChild(placeholder);
          expect(placeholder.classList.contains('amp-hidden')).to.be.false;

          const fallback = document.createElement('div');
          fallback.setAttribute('fallback', '');
          ad.appendChild(fallback);
          return ad;
        }).then(ad => {
          const placeholderEl = ad.querySelector('[placeholder]');
          sandbox.stub(
              ad.implementation_, 'deferMutate', function(callback) {
                callback();
              });
          ad.implementation_.noContentHandler_();
          expect(placeholderEl.classList.contains('amp-hidden')).to.be.true;
        });
      });

      it('should destroy non-master iframe', () => {
        return getAd({
          width: 300,
          height: 750,
          type: '_ping_',
          src: 'testsrc',
        }, 'https://schema.org', ad => {
          const placeholder = document.createElement('div');
          placeholder.setAttribute('placeholder', '');
          ad.appendChild(placeholder);
          expect(placeholder.classList.contains('amp-hidden')).to.be.false;

          const fallback = document.createElement('div');
          fallback.setAttribute('fallback', '');
          ad.appendChild(fallback);
          return ad;
        }).then(ad => {
          ad.implementation_.iframe_.setAttribute(
              'name', 'frame_doubleclick_0');
          sandbox.stub(
              ad.implementation_, 'deferMutate', function(callback) {
                callback();
              });
          ad.implementation_.noContentHandler_();
          expect(ad.implementation_.iframe_).to.be.null;
        });
      });

      it('should not destroy a master iframe', () => {
        return getAd({
          width: 300,
          height: 750,
          type: '_ping_',
          src: 'testsrc',
        }, 'https://schema.org', ad => {
          const placeholder = document.createElement('div');
          placeholder.setAttribute('placeholder', '');
          ad.appendChild(placeholder);
          expect(placeholder.classList.contains('amp-hidden')).to.be.false;
          const fallback = document.createElement('div');
          fallback.setAttribute('fallback', '');
          ad.appendChild(fallback);
          return ad;
        }).then(ad => {
          ad.implementation_.iframe_.setAttribute(
              'name', 'frame_doubleclick_master');
          sandbox.stub(
              ad.implementation_, 'deferMutate', function(callback) {
                callback();
              });
          ad.implementation_.noContentHandler_();
          expect(ad.implementation_.iframe_).to.not.be.null;
        });
      });

    });

    describe('renderOutsideViewport', () => {
      function getGoodAd(cb, opt_loadingStrategy) {
        const attributes = {
          width: 300,
          height: 250,
          type: '_ping_',
          src: 'https://testsrc',
          // Test precedence
          'data-width': '6666',
        };
        if (opt_loadingStrategy) {
          attributes['data-loading-strategy'] = opt_loadingStrategy;
        }
        return getAd(attributes, 'https://schema.org', element => {
          cb(element.implementation_);
          return element;
        });
      }

      it('should not return false after scrolling, then false for 1s', () => {
        const clock = sandbox.useFakeTimers();
        return getGoodAd(ad => {
          expect(ad.renderOutsideViewport()).not.to.be.false;
        }).then(ad => {
          // False because we just rendered one.
          expect(ad.renderOutsideViewport()).to.be.false;
          clock.tick(900);
          expect(ad.renderOutsideViewport()).to.be.false;
          clock.tick(100);
          expect(ad.renderOutsideViewport()).not.to.be.false;
        });
      });

      it('should prefer-viewability-over-views', () => {
        const clock = sandbox.useFakeTimers();
        return getGoodAd(ad => {
          expect(ad.renderOutsideViewport()).not.to.be.false;
        }, 'prefer-viewability-over-views').then(ad => {
          // False because we just rendered one.
          expect(ad.renderOutsideViewport()).to.be.false;
          clock.tick(900);
          expect(ad.renderOutsideViewport()).to.be.false;
          clock.tick(100);
          expect(ad.renderOutsideViewport()).to.equal(1.25);
        });
      });
    });
  };
}
