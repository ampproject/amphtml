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

import {clientIdScope} from '../../ads/_config';
import {createIframePromise} from '../../testing/iframe';
import {installAd} from '../../builtins/amp-ad';
import {installEmbed} from '../../builtins/amp-embed';
import {installCidService} from '../../src/service/cid-impl';
import {
  installUserNotificationManager,
} from '../../build/all/v0/amp-user-notification-0.1.max';
import {markElementScheduledForTesting} from '../../src/custom-element';
import {setCookie} from '../../src/cookies';
import * as sinon from 'sinon';


describe('amp-ad', tests('amp-ad', installAd));
describe('amp-embed', tests('amp-embed', win => {
  installAd(win);
  installEmbed(win);
}));

function tests(name, installer) {
  return () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
    });
    afterEach(() => {
      sandbox.restore();
      sandbox = null;
    });

    function getAd(attributes, canonical, opt_handleElement,
        opt_beforeLayoutCallback) {
      return createIframePromise(undefined, opt_beforeLayoutCallback)
          .then(iframe => {
            iframe.iframe.style.height = '400px';
            iframe.iframe.style.width = '400px';
            installer(iframe.win);
            markElementScheduledForTesting(iframe.win, 'amp-user-notification');
            if (canonical) {
              const link = iframe.doc.createElement('link');
              link.setAttribute('rel', 'canonical');
              link.setAttribute('href', canonical);
              iframe.doc.head.appendChild(link);
            }
            let a = iframe.doc.createElement(name);
            for (const key in attributes) {
              a.setAttribute(key, attributes[key]);
            }
            if (attributes.resizable !== undefined) {
              const overflowEl = iframe.doc.createElement('div');
              overflowEl.setAttribute('overflow', '');
              a.appendChild(overflowEl);
            }
            // Make document long.
            a.style.marginBottom = '1000px';
            if (opt_handleElement) {
              a = opt_handleElement(a);
            }
            return iframe.addElement(a);
          });
    }

    it('render an ad', () => {
      return getAd({
        width: 300,
        height: 250,
        type: 'a9',
        src: 'https://testsrc',
        'data-aax_size': '300x250',
        'data-aax_pubname': 'test123',
        'data-aax_src': '302',
        // Test precedence
        'data-width': '6666',
      }, 'https://schema.org').then(ad => {
        const iframe = ad.firstChild;
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        const url = iframe.getAttribute('src');
        expect(url).to.match(/^http:\/\/ads.localhost:/);
        expect(url).to.match(/frame(.max)?.html#{/);
        expect(iframe.style.display).to.equal('');

        const fragment = url.substr(url.indexOf('#') + 1);
        const data = JSON.parse(fragment);

        expect(data.type).to.equal('a9');
        expect(data.src).to.equal('https://testsrc');
        expect(data.width).to.equal(300);
        expect(data.height).to.equal(250);
        expect(data._context.canonicalUrl).to.equal('https://schema.org/');
        expect(data.aax_size).to.equal('300x250');

        describe('ad preconnect', () => {
          const doc = iframe.ownerDocument;
          const fetches = doc.querySelectorAll(
              'link[rel=prefetch]');
          expect(fetches).to.have.length(3);
          expect(fetches[0].href).to.equal(
              'http://ads.localhost:' + location.port +
              '/dist.3p/current/frame.max.html');
          expect(fetches[1].href).to.equal(
              'https://3p.ampproject.net/$internalRuntimeVersion$/f.js');
          expect(fetches[2].href).to.equal(
              'https://c.amazon-adsystem.com/aax2/assoc.js');
          const preconnects = doc.querySelectorAll(
              'link[rel=preconnect]');
          expect(preconnects[preconnects.length - 1].href).to.equal(
              'https://testsrc/');
          // Make sure we run tests without CID available by default.
          expect(ad.ownerDocument.defaultView.services.cid).to.be.undefined;
        });
      });
    });

    describe('ad resize', () => {
      it('should listen for resize events', () => {
        const iframeSrc = 'http://ads.localhost:' + location.port +
            '/base/test/fixtures/served/iframe.html';
        return getAd({
          width: 100,
          height: 100,
          type: 'a9',
          src: 'testsrc',
          resizable: '',
        }, 'https://schema.org').then(element => {
          return new Promise((resolve, unusedReject) => {
            impl = element.implementation_;
            impl.layoutCallback();
            impl.updateHeight_ = newHeight => {
              expect(newHeight).to.equal(217);
              resolve(impl);
            };
            impl.iframe_.onload = function() {
              impl.iframe_.contentWindow.postMessage({
                sentinel: 'amp-test',
                type: 'requestHeight',
                is3p: true,
                height: 217,
              }, '*');
            };
            impl.iframe_.src = iframeSrc;
          });
        }).then(impl => {
          expect(impl.iframe_.height).to.equal('217');
        });
      });

      it('should fallback for resize with overflow element', () => {
        return getAd({
          width: 100,
          height: 100,
          type: 'a9',
          src: 'testsrc',
          resizable: '',
        }, 'https://schema.org').then(element => {
          impl = element.implementation_;
          impl.attemptChangeHeight = sinon.spy();
          impl.changeHeight = sinon.spy();
          impl.updateHeight_(217);
          expect(impl.changeHeight.callCount).to.equal(0);
          expect(impl.attemptChangeHeight.callCount).to.equal(1);
          expect(impl.attemptChangeHeight.firstCall.args[0]).to.equal(217);
        });
      });
    });

    it('should require a canonical', () => {
      return expect(getAd({
        width: 300,
        height: 250,
        type: 'a9',
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
        type: 'a9',
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
        type: 'a9',
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
        type: 'a9',
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
          type: 'a9',
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
          type: 'a9',
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
          ad.style.position = 'absolute';
          ad.style.top = '300px';
          ad.style.left = '50px';
          expect(ad.style.display).to.not.equal('none');
          ad.implementation_.noContentHandler_();
          expect(ad.style.display).to.equal('none');
        });
      });

      it('should hide placeholder when ad falls back', () => {
        return getAd({
          width: 300,
          height: 750,
          type: 'a9',
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
    });

    describe('cid-ad support', () => {
      const cidScope = 'cid-in-ads-test';
      let sandbox;

      beforeEach(() => {
        sandbox = sinon.sandbox.create();
      });

      afterEach(() => {
        sandbox.restore();
        setCookie(window, cidScope, '', new Date().getTime() - 5000);
      });

      it('provides cid to ad', () => {
        clientIdScope['with_cid'] = cidScope;
        return getAd({
          width: 300,
          height: 250,
          type: 'with_cid',
          src: 'testsrc',
        }, 'https://schema.org', function(ad) {
          const win = ad.ownerDocument.defaultView;
          setCookie(window, cidScope, 'sentinel123',
              new Date().getTime() + 5000);
          installCidService(win);
          return ad;
        }).then(ad => {
          expect(ad.getAttribute('ampcid')).to.equal('sentinel123');
        });
      });

      it('waits for consent', () => {
        clientIdScope['with_cid'] = cidScope;
        return getAd({
          width: 300,
          height: 250,
          type: 'with_cid',
          src: 'testsrc',
          'data-consent-notification-id': 'uid',
        }, 'https://schema.org', function(ad) {
          const win = ad.ownerDocument.defaultView;
          const cidService = installCidService(win);
          const uidService = installUserNotificationManager(win);
          sandbox.stub(uidService, 'get', id => {
            expect(id).to.equal('uid');
            return Promise.resolve('consent');
          });
          sandbox.stub(cidService, 'get', (scope, consent) => {
            expect(scope).to.equal(cidScope);
            return consent.then(val => {
              return val + '-cid';
            });
          });
          return ad;
        }).then(ad => {
          expect(ad.getAttribute('ampcid')).to.equal('consent-cid');
        });
      });

      it('provides null if cid service not available', () => {
        clientIdScope['with_cid'] = cidScope;
        return getAd({
          width: 300,
          height: 250,
          type: 'with_cid',
          src: 'testsrc',
        }, 'https://schema.org', function(ad) {
          setCookie(window, cidScope, 'XXX',
              new Date().getTime() + 5000);
          return ad;
        }).then(ad => {
          expect(ad.getAttribute('ampcid')).to.be.null;
        });
      });
    });

    describe('renderOutsideViewport', () => {
      function getGoodAd(cb, layoutCb) {
        return getAd({
          width: 300,
          height: 250,
          type: 'a9',
          src: 'https://testsrc',
          'data-aax_size': '300x250',
          'data-aax_pubname': 'test123',
          'data-aax_src': '302',
          // Test precedence
          'data-width': '6666',
        }, 'https://schema.org', element => {
          cb(element.implementation_);
          return element;
        }, layoutCb);
      }

      it('should return true after scrolling and then false for 1s', () => {
        let clock;
        return getGoodAd(ad => {
          expect(ad.renderOutsideViewport()).to.be.true;
        }, () => {
          clock = sandbox.useFakeTimers();
        }).then(ad => {
          // False because we just rendered one.
          expect(ad.renderOutsideViewport()).to.be.false;
          clock.tick(900);
          expect(ad.renderOutsideViewport()).to.be.false;
          clock.tick(100);
          expect(ad.renderOutsideViewport()).to.be.true;
        });
      });
    });
  };
}
