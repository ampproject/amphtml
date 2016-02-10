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

import {IntersectionObserver} from '../../src/intersection-observer';
import {clientIdScope} from '../../ads/_config';
import {createIframePromise} from '../../testing/iframe';
import {installAd} from '../../builtins/amp-ad';
import {installEmbed} from '../../builtins/amp-embed';
import {installCidService} from '../../src/service/cid-impl';
import {viewportFor} from '../../src/viewport';
import {setCookie} from '../../src/cookies';
import {timer} from '../../src/timer';
import * as sinon from 'sinon';

describe('amp-ad and amp-embed', () => {
  runAdTestSuiteAgainstInstaller('amp-ad', installAd);
  runAdTestSuiteAgainstInstaller('amp-embed', installEmbed);
});


function runAdTestSuiteAgainstInstaller(name, installer) {
  return describe(name, () => {
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
        'data-width': '6666'
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
              'http://ads.localhost/dist.3p/current/frame.max.html');
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

      describe('ad resize', () => {
        it('should listen for resize events', () => {
          const iframeSrc = 'http://ads.localhost:' + location.port +
              '/base/test/fixtures/served/iframe.html';
          return getAd({
            width: 100,
            height: 100,
            type: 'a9',
            src: 'testsrc',
            resizable: ''
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
                  height: 217
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
            resizable: ''
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

      it('should toggle iframe when doc becomes inactive', () => {
        return getAd({
          width: 300,
          height: 250,
          type: 'a9',
          src: 'https://testsrc',
          'data-aax_size': '300x250',
          'data-aax_pubname': 'test123',
          'data-aax_src': '302',
          // Test precedence
          'data-width': '6666'
        }, 'https://schema.org').then(ad => {
          const iframe = ad.firstChild;
          expect(iframe.style.display).to.equal('');
          const obj = ad.implementation_;
          expect(obj.isRelayoutNeeded()).to.be.true;
          expect(obj.paused_).to.be.false;
          expect(obj.wasEverVisible_).to.be.true;
          obj.wasEverVisible_ = false;
          const ret = obj.documentInactiveCallback();
          expect(ret).to.be.true;
          expect(iframe.style.display).to.equal('none');
          expect(obj.paused_).to.be.true;
          obj.layoutCallback();
          expect(iframe.style.display).to.equal('');
          expect(obj.paused_).to.be.false;
          expect(obj.wasEverVisible_).to.be.false;
          obj.viewportCallback(true);
          expect(obj.wasEverVisible_).to.be.true;

          // Pause again
          const ret2 = obj.documentInactiveCallback();
          expect(ret2).to.be.true;
          expect(iframe.style.display).to.equal('none');
        });
      });

      it('should toggle an ad when it gets out of viewport', () => {
        return getAd({
          width: 300,
          height: 250,
          type: 'a9',
          src: 'https://testsrc',
          'data-aax_size': '300x250',
          'data-aax_pubname': 'test123',
          'data-aax_src': '302',
          // Test precedence
          'data-width': '6666'
        }, 'https://schema.org').then(ad => {
          const iframe = ad.firstChild;
          expect(iframe.style.display).to.equal('');
          const obj = ad.implementation_;
          expect(obj.isRelayoutNeeded()).to.be.true;
          expect(obj.paused_).to.be.false;
          obj.viewportCallback(false);
          expect(iframe.style.display).to.equal('none');
          expect(obj.paused_).to.be.true;
          obj.viewportCallback(true);
          expect(iframe.style.display).to.equal('');
          expect(obj.paused_).to.be.false;

          // Pause again
          obj.viewportCallback(false);
          expect(iframe.style.display).to.equal('none');
          obj.viewportCallback(true);
          expect(iframe.style.display).to.equal('');

          // Without having been in viewport
          obj.wasEverVisible_ = false;
          obj.viewportCallback(false);
          expect(iframe.style.display).to.equal('');
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

      describe('ad intersection', () => {

        let ampAd;
        let posts;

        beforeEach(() => {
          posts = [];
          return getAd({
            width: 300,
            height: 250,
            type: 'a9',
            src: 'testsrc',
          }, 'https://schema.org').then(element => {
            ampAd = element.implementation_;
            // Neutralize the frame origin since we don't care about it and
            // would like to record postMessage calls.
            ampAd.iframe_.src = 'about:blank';
            // Timeout to let the src change take effect.
            return timer.promise(10).then(() => {
              element.style.position = 'absolute';
              element.style.top = '300px';
              element.style.left = '50px';
              viewportFor(element.ownerDocument.defaultView).setScrollTop(50);
              // Record postMessage calls.
              ampAd.iframe_.contentWindow.postMessage = function(data, origin) {
                posts.push({
                  data: data,
                  targetOrigin: origin,
                });
              };
              ampAd.intersectionObserver_ =
                  new IntersectionObserver(ampAd, ampAd.iframe_, true);
              ampAd.intersectionObserver_.startSendingIntersectionChanges_();
              expect(posts).to.have.length(0);
              ampAd.getVsync().runScheduledTasks_();
              expect(posts).to.have.length(1);
            });
          });
        });

        afterEach(() => {
          ampAd.intersectionObserver_.dispose();
        });

        it('should calculate intersection', () => {
          expect(ampAd.iframeLayoutBox_).to.not.be.null;
          expect(posts).to.have.length(1);
          // The about:blank is due to the test setup. It should be whatever
          // is the origin of the iframed document.
          expect(posts[0].targetOrigin).to.equal('about:blank');
          expect(posts[0].targetOrigin).to.equal('http://ads.localhost');
          const changes = posts[0].data.changes;
          expect(changes).to.be.array;
          expect(changes).to.have.length(1);
          expect(changes[0].time).to.be.number;
          expect(changes[0].intersectionRect.height).to.equal(150);
          expect(changes[0].intersectionRect.width).to.equal(300);
        });

        it('reflect viewport changes', () => {
          const win = ampAd.element.ownerDocument.defaultView;
          const viewport = viewportFor(win);
          expect(posts).to.have.length(1);
          viewport.setScrollTop(0);
          ampAd.intersectionObserver_.fire();
          expect(posts).to.have.length(2);
          const changes = posts[1].data.changes;
          expect(changes).to.have.length(1);
          expect(changes[0].time).to.be.number;
          expect(changes[0].intersectionRect.height).to.equal(100);
          expect(changes[0].intersectionRect.width).to.equal(300);

          viewport.setScrollTop(350);
          ampAd.intersectionObserver_.fire();
          expect(posts).to.have.length(3);
          const changes2 = posts[2].data.changes;
          expect(changes2).to.have.length(1);
          expect(changes2[0].time).to.be.number;
          expect(changes2[0].intersectionRect.height).to.equal(200);
        });

        it('observe the viewport', () => {
          const win = ampAd.element.ownerDocument.defaultView;
          const viewport = viewportFor(win);
          expect(posts).to.have.length(1);
          ampAd.viewportCallback(true);
          expect(posts).to.have.length(3);
          expect(posts[2].data.type).to.equal('embed-state');
          expect(posts[2].data.inViewport).to.be.true;
          viewport.scroll_();
          expect(posts).to.have.length(4);
          viewport.resize_();
          expect(posts).to.have.length(5);
          ampAd.viewportCallback(false);
          expect(posts).to.have.length(7);
          expect(posts[6].data.type).to.equal('embed-state');
          expect(posts[6].data.inViewport).to.be.false;
          // No longer listening.
          viewport.scroll_();
          expect(posts).to.have.length(7);
          viewport.resize_();
          expect(posts).to.have.length(7);
        });

        it('should report changes upon remeasure', () => {
          expect(posts).to.have.length(1);
          ampAd.viewportCallback(true);
          expect(posts).to.have.length(3);
          ampAd.onLayoutMeasure();
          expect(posts).to.have.length(4);
          ampAd.onLayoutMeasure();
          expect(posts).to.have.length(5);
          ampAd.viewportCallback(false);
          expect(posts).to.have.length(7);
          // We also send a new record when we are currently not in the
          // viewport, because that might have just changed.
          ampAd.onLayoutMeasure();
          expect(posts).to.have.length(8);
        });

        it('should report page visibility changes', () => {
          expect(posts).to.have.length(1);
          const viewer = viewerFor(ampAd.getWin());
          viewer.visibilityState_ = 'hidden';
          viewer.onVisibilityChange_();
          expect(posts).to.have.length(2);
          expect(posts[1].data.type).to.equal('embed-state');
          expect(posts[1].data.hidden).to.equal(true);
          viewer.visibilityState_ = 'visible';
          viewer.onVisibilityChange_();
          expect(posts).to.have.length(3);
          expect(posts[2].data.type).to.equal('embed-state');
          expect(posts[2].data.hidden).to.equal(false);
        });
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
            'data-consent-notification-id': 'uid'
          }, 'https://schema.org', function(ad) {
            const win = ad.ownerDocument.defaultView;
            const cidService = installCidService(win);
            const uidService = installUserNotificationManager(win);
            sandbox.stub(uidService, 'get', id => {
              expect(id).to.equal('uid');
              const p = Promise.resolve();
              p.TEST_TAG = 'cid';
              return p;
            });
            sandbox.stub(cidService, 'get', (scope, consent) => {
              expect(scope).to.equal(cidScope);
              expect(consent.TEST_TAG).to.equal('cid');
              return Promise.resolve('cid-uid-test');
            });
            return ad;
          }).then(ad => {
            expect(consent).to.not.be.null;
            expect(ad.getAttribute('ampcid')).to.equal('cid-uid-test');
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
            'data-width': '6666'
          }, 'https://schema.org', element => {
            cb(element.implementation_);
            return element;
          }, layoutCb);
        }

        it('should return false before scrolling', () => {
          return getGoodAd(ad => {
            dump(name);
            dump(ad);
            expect(ad.renderOutsideViewport()).to.be.false;
          });
        });

        it('should return true after scrolling', () => {
          return getGoodAd(ad => {
            viewportFor(ad.element.ownerDocument.defaultView).scrollCount_++;
            expect(ad.renderOutsideViewport()).to.be.true;
          });
        });

        it('should return true after scrolling and then false for 1s', () => {
          let clock;
          return getGoodAd(ad => {
            viewportFor(ad.element.ownerDocument.defaultView).scrollCount_++;
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
    });
  });
}
