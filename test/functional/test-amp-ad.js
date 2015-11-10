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
import {installAd, scoreDimensions_, upgradeImages_, AD_LOAD_TIME_MS} from
    '../../builtins/amp-ad';
import {viewportFor} from
    '../../src/viewport';
import {timer} from '../../src/timer';
import {vsync} from '../../src/vsync';
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
        expect(ampAd.shouldSendIntersectionChanges_).to.be.false;
        ampAd.startSendingIntersectionChanges_();
        expect(ampAd.shouldSendIntersectionChanges_).to.be.true;
        expect(ampAd.iframeLayoutBox_).to.be.null;
        expect(posts).to.have.length(0);
        ampAd.getVsync().runScheduledTasks();
        expect(posts).to.have.length(1);
      });
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
      ampAd.sendAdIntersection_();
      expect(posts).to.have.length(2);
      const changes = posts[1].data.changes;
      expect(changes).to.have.length(1);
      expect(changes[0].time).to.be.number;
      expect(changes[0].intersectionRect.height).to.equal(100);
      expect(changes[0].intersectionRect.width).to.equal(300);

      viewport.setScrollTop(350);
      ampAd.sendAdIntersection_();
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
      expect(posts).to.have.length(2);
      viewport.changed_(false, 0);
      expect(posts).to.have.length(3);
      ampAd.viewportCallback(false);
      expect(posts).to.have.length(4);
      // No longer listening.
      viewport.changed_(false, 0);
      expect(posts).to.have.length(4);
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
        expect(ad).to.not.have.class('amp-notsupported');
        ad.implementation_.noContentHandler_();
        expect(ad).to.have.class('amp-notsupported');
      });
    });
  });

  describe('scoreDimensions_', () => {

    it('should choose a matching dimension', () => {
      const dims = [[320, 200], [320, 210], [320, 200]];
      const scores = scoreDimensions_(dims, 320, 200);
      const winner = scores.indexOf(Math.max.apply(Math, scores));
      expect(winner).to.equal(0);
    });

    it('should be biased to a smaller height delta', () => {
      const dims = [[300, 200], [320, 50]];
      const scores = scoreDimensions_(dims, 300, 50);
      const winner = scores.indexOf(Math.max.apply(Math, scores));
      expect(winner).to.equal(1);
    });
  });

  describe('upgradeImages_', () => {
    let images;
    beforeEach(() => {
      images = {
        '300x200': [
          'backfill-1@1x.png',
          'backfill-2@1x.png',
          'backfill-3@1x.png',
          'backfill-4@1x.png',
          'backfill-5@1x.png',
        ],
        '320x50': [
          'backfill-6@1x.png',
          'backfill-7@1x.png',
        ],
      };
    });

    it('should upgrade an image from 1x to 2x', () => {
      expect(images['300x200'][0]).to.equal('backfill-1@1x.png');
      expect(images['320x50'][0]).to.equal('backfill-6@1x.png');
      upgradeImages_(images);
      expect(images['300x200'][0]).to.equal('backfill-1@2x.png');
      expect(images['320x50'][0]).to.equal('backfill-6@2x.png');
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
