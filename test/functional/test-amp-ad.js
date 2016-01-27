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
import {createIframePromise} from '../../testing/iframe';
import {installAd} from '../../builtins/amp-ad';
import {viewportFor} from
    '../../src/viewport';
import * as sinon from 'sinon';

describe('amp-ad', () => {

  function getAd(attributes, canonical, opt_handleElement,
      opt_beforeLayoutCallback) {
    return createIframePromise(undefined, opt_beforeLayoutCallback)
        .then(iframe => {
          iframe.iframe.style.height = '400px';
          iframe.iframe.style.width = '400px';
          installAd(iframe.win);
          if (canonical) {
            const link = iframe.doc.createElement('link');
            link.setAttribute('rel', 'canonical');
            link.setAttribute('href', canonical);
            iframe.doc.head.appendChild(link);
          }
          let a = iframe.doc.createElement('amp-ad');
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

      const fragment = url.substr(url.indexOf('#') + 1);
      const data = JSON.parse(fragment);

      expect(data.type).to.equal('a9');
      expect(data.src).to.equal('https://testsrc');
      expect(data.width).to.equal(300);
      expect(data.height).to.equal(250);
      expect(data._context.canonicalUrl).to.equal('https://schema.org/');
      expect(data.aax_size).to.equal('300x250');

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

  describe('ad resize', () => {
    it('should listen for resize events',() => {
      const iframeSrc = 'http://iframe.localhost:' + location.port +
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
    it('should fallback for resize with overflow element',() => {
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
        element.style.position = 'absolute';
        element.style.top = '300px';
        element.style.left = '50px';
        viewportFor(element.ownerDocument.defaultView).setScrollTop(50);
        ampAd = element.implementation_;
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

    afterEach(() => {
      ampAd.intersectionObserver_.dispose();
    });

    it('should calculate intersection', () => {
      expect(ampAd.iframeLayoutBox_).to.not.be.null;
      expect(posts).to.have.length(1);
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

    it('report changes upon remeasure', () => {
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
        const deferMutateStub = sinon.stub(
          ad.implementation_, 'deferMutate', function(callback) {
            callback();
          });
        expect(ad).to.not.have.class('amp-notsupported');
        ad.implementation_.noContentHandler_();
        expect(ad).to.have.class('amp-notsupported');
        deferMutateStub.restore();
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
        const deferMutateStub = sinon.stub(
          ad.implementation_, 'deferMutate', function(callback) {
            callback();
          });
        const attemptChangeHeightStub = sinon.stub(ad.implementation_,
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
        deferMutateStub.restore();
        attemptChangeHeightStub.restore();
      });
    });
  });

  describe('renderOutsideViewport', () => {

    let clock;
    let sandbox;

    afterEach(() => {
      if (clock) {
        clock.restore();
      }
      if (sandbox) {
        sandbox.restore();
      }
    });

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
      return getGoodAd(ad => {
        viewportFor(ad.element.ownerDocument.defaultView).scrollCount_++;
        expect(ad.renderOutsideViewport()).to.be.true;
      }, () => {
        sandbox = sinon.sandbox.create();
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
