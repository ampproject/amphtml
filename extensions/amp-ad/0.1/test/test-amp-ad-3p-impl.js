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
import {createIframePromise} from '../../../../testing/iframe';
import {createElementWithAttributes} from '../../../../src/dom';
import {markElementScheduledForTesting} from '../../../../src/custom-element';
import * as adCid from '../../../../src/ad-cid';
import '../../../amp-sticky-ad/0.1/amp-sticky-ad';
import * as sinon from 'sinon';
import * as lolex from 'lolex';


describe('amp-ad-3p-impl', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('should render an ad', () => {
    return getAd({
      width: 300,
      height: 250,
      type: '_ping_',
      src: 'https://testsrc',
      'data-valid': 'true',
      // Test precedence
      'data-width': '6666',
    }).then(ad => {
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

      expect(data).to.have.property('type', '_ping_');
      expect(data).to.have.property('src', 'https://testsrc');
      expect(data).to.have.property('width', 300);
      expect(data).to.have.property('height', 250);
      expect(data._context.canonicalUrl).to.equal('https://schema.org/');

      const doc = iframe.ownerDocument;
      let fetches = doc.querySelectorAll(
          'link[rel=prefetch]');
      if (!fetches.length) {
        fetches = doc.querySelectorAll(
            'link[rel=preload]');
      }
      expect(fetches).to.have.length(2);
      expect(fetches[0]).to.have.property('href',
          'http://ads.localhost:9876/dist.3p/current/frame.max.html');
      expect(fetches[1]).to.have.property('href',
          'http://ads.localhost:9876/dist.3p/current/integration.js');
      const preconnects = doc.querySelectorAll(
          'link[rel=preconnect]');
      expect(preconnects[preconnects.length - 1]).to.have.property('href',
          'https://testsrc/');
      // Make sure we run tests without CID available by default.
      const win = ad.ownerDocument.defaultView;
      expect(win.services.cid).to.be.undefined;
      expect(win.a2alistener).to.be.true;
    });
  });

  it('should only layout once', () => {
    return getAd().then(ad => {
      ad.implementation_.unlayoutCallback();

      const firstLayout = ad.implementation_.layoutCallback();
      const secondLayout = ad.implementation_.layoutCallback();
      expect(firstLayout).to.equal(secondLayout);

      ad.implementation_.unlayoutCallback();
      const newLayout = ad.implementation_.layoutCallback();
      expect(newLayout).to.not.equal(secondLayout);
    });
  });

  describe('validation checks', () => {
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
      })).to.be.rejectedWith(/type/);
    });

    it('should reject unknown type', () => {
      return expect(getAd({
        width: 300,
        height: 250,
        type: 'unknownType',
      })).to.be.rejectedWith(/unknownType/);
    });

    it('should reject on position:fixed', () => {
      return expect(getAd(undefined, undefined, function(ad) {
        ad.style.position = 'fixed';
        return ad;
      })).to.be.rejectedWith(/fixed/);
    });

    it('should reject on parent being position:fixed', () => {
      return expect(getAd(undefined, undefined, function(ad) {
        const s = document.createElement('style');
        s.textContent = '.fixed {position:fixed;}';
        ad.ownerDocument.body.appendChild(s);
        const p = ad.ownerDocument.getElementById('parent');
        p.className = 'fixed';
        return ad;
      })).to.be.rejectedWith(/fixed/);
    });

    it('should allow on position:fixed within verified ad container', () => {
      return expect(getAd(undefined, undefined, function(ad) {
        const lightbox = document.createElement('amp-lightbox');
        lightbox.style.position = 'fixed';
        const p = ad.ownerDocument.getElementById('parent');
        p.parentElement.appendChild(lightbox);
        p.parentElement.removeChild(p);
        lightbox.appendChild(p);
        return ad;
      })).to.be.not.be.rejected;
    });
  });

  describe('get CID', () => {
    it('should propagete CID to ad iframe', () => {
      sandbox.stub(adCid, 'getAdCid', () => {
        return Promise.resolve('sentinel123');
      });
      return getAd().then(ad => {
        const src = ad.firstChild.getAttribute('src');
        expect(src).to.contain('"clientId":"sentinel123"');
      });
    });

    it('should proceed w/o CID', () => {
      sandbox.stub(adCid, 'getAdCid', () => {
        return Promise.resolve(undefined);
      });
      return getAd().then(ad => {
        const src = ad.firstChild.getAttribute('src');
        expect(src).to.contain('"clientId":null');
      });
    });
  });

  describe('no content handler', () => {
    it('should display fallback when there is one and hide placeholder', () => {
      return getAd(undefined, undefined, ad => {
        const fallback = createElementWithAttributes(document, 'div', {
          fallback: '',
        });
        const placeholder = createElementWithAttributes(document, 'div', {
          placeholder: '',
        });
        ad.appendChild(fallback);
        ad.appendChild(placeholder);
        expect(placeholder.classList.contains('amp-hidden')).to.be.false;
        return ad;
      }).then(ad => {
        sandbox.stub(
            ad.implementation_, 'deferMutate', function(callback) {
              callback();
            });
        expect(ad).to.not.have.class('amp-notsupported');
        const placeholderEl = ad.querySelector('[placeholder]');

        ad.implementation_.noContentHandler_();
        expect(ad).to.have.class('amp-notsupported');
        expect(placeholderEl.classList.contains('amp-hidden')).to.be.true;
      });
    });

    it('should try to change height to 0 and collapse w/o fallback', () => {
      return getAd(undefined, undefined, ad => {
        return ad;
      }).then(ad => {
        sandbox.stub(
            ad.implementation_, 'deferMutate', function(callback) {
              callback();
            });
        ad.style.position = 'absolute';
        ad.style.top = '300px';
        ad.style.left = '50px';
        expect(ad.style.display).to.not.equal('none');

        let changeHeightResolve;
        const changeHeightPromise = new Promise(resolve => {
          changeHeightResolve = resolve;});
        sandbox.stub(ad.implementation_, 'attemptChangeHeight', newHeight => {
          expect(newHeight).to.equal(0);
          changeHeightResolve();
          return Promise.resolve();
        });
        const collapseSpy = sandbox.spy(ad.implementation_, 'collapse');

        ad.implementation_.noContentHandler_();
        return changeHeightPromise.then(() => {
          expect(collapseSpy).to.have.been.called;
          expect(ad.style.display).to.equal('none');
        });
      });
    });

    it('should destroy non-master iframe', () => {
      return getAd().then(ad => {
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
      return getAd().then(ad => {
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
    it('should not return false after scrolling, then false for 1s', () => {
      let clock;
      return getAd(undefined, undefined, ad => {
        clock = lolex.install(ad.implementation_.win);
        expect(ad.implementation_.renderOutsideViewport()).not.to.be.false;
        return ad;
      }).then(ad => {
        const impl = ad.implementation_;
        expect(impl.renderOutsideViewport()).to.be.false;
        clock.tick(900);
        expect(impl.renderOutsideViewport()).to.be.false;
        clock.tick(100);
        expect(impl.renderOutsideViewport()).not.to.be.false;
      });
    });

    it('should prefer-viewability-over-views', () => {
      let clock;
      return getAd({
        width: 300,
        height: 250,
        type: '_ping_',
        src: 'https://testsrc',
        'data-valid': 'true',
        // Test precedence
        'data-width': '6666',
        'data-loading-strategy': 'prefer-viewability-over-views',
      }, undefined, ad => {
        clock = lolex.install(ad.implementation_.win);
        expect(ad.implementation_.renderOutsideViewport()).not.to.be.false;
        return ad;
      }).then(ad => {
        const impl = ad.implementation_;
        expect(ad.renderOutsideViewport()).to.be.false;
        clock.tick(900);
        expect(ad.renderOutsideViewport()).to.be.false;
        clock.tick(100);
        expect(ad.renderOutsideViewport()).to.equal(1.25);
      });
    });
  });

  it('should add container info when ad has a container', () => {
    return getAdInAdContainer().then(obj => {
      const ampAd = obj.ampAd;
      const impl = ampAd.implementation_;
      expect(ampAd.getAttribute('amp-container-element')).to.be.null;
      impl.onLayoutMeasure();
      return impl.layoutCallback().then(() => {
        const src = ampAd.firstChild.getAttribute('src');
        expect(src).to.contain('"container":"AMP-STICKY-AD"');
      });
    });
  });
});


/*
Create an iframe with an ad inside it.
Returns a promise for when the ad is usable for testing that produces
an object with properties related to the created iframe and utility methods:
- win: The created window.
- doc: The created document.
- iframe: The host iframe element. Useful for e.g. resizing.
- awaitEvent: A function that returns a promise for when the given custom
  event fired at least the given number of times.
- errors: Array of console.error fired during page load.
*/
// Please note undefined and null are different for opt_canonical
function getAd(opt_attributes, opt_canonical, opt_handleElement,
    opt_beforeLayoutCallback) {
  const attributes = opt_attributes || {
    width: 300,
    height: 250,
    type: '_ping_',
    src: 'https://testsrc',
    'data-valid': 'true',
  };
  let canonical = opt_canonical;
  if (opt_canonical === undefined) {
    canonical = 'https://schema.org';
  }
  return createIframePromise(undefined, opt_beforeLayoutCallback)
      .then(iframe => {
        iframe.iframe.style.height = '400px';
        iframe.iframe.style.width = '400px';
        markElementScheduledForTesting(iframe.win, 'amp-user-notification');
        if (canonical) {
          const link = createElementWithAttributes(iframe.doc, 'link', {
            rel: 'canonical',
            href: canonical,
          });
          iframe.doc.head.appendChild(link);
        }
        let a = createElementWithAttributes(iframe.doc, 'amp-ad', attributes);

        // Make document long.
        a.style.marginBottom = '1000px';
        if (opt_handleElement) {
          a = opt_handleElement(a);
        }
        return iframe.addElement(a);
      });
}

function getAdInAdContainer() {
  return createIframePromise().then(iframe => {
    const adContainer = createElementWithAttributes(iframe.doc,
        'amp-sticky-ad', {layout: 'nodisplay'});
    const ampAd = createElementWithAttributes(iframe.doc, 'amp-ad', {
      width: 300,
      height: 50,
      type: '_ping_',
      src: 'testsrc',
      'data-valid': 'true',
    });
    const link = createElementWithAttributes(iframe.doc, 'link', {
      rel: 'canonical',
      href: 'blah',
    });
    iframe.doc.head.appendChild(link);
    adContainer.appendChild(ampAd);
    return iframe.addElement(adContainer).then(() => {
      return Promise.resolve({
        iframe,
        ampAd,
      });
    });
  });
}
