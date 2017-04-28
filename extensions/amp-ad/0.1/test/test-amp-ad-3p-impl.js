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
import {stubService} from '../../../../testing/test-helper';
import {createElementWithAttributes} from '../../../../src/dom';
import * as adCid from '../../../../src/ad-cid';
import '../../../amp-ad/0.1/amp-ad';
import '../../../amp-sticky-ad/0.1/amp-sticky-ad';
import * as lolex from 'lolex';
import * as sinon from 'sinon';

function createAmpAd(win) {
  const ampAdElement = createElementWithAttributes(win.document, 'amp-ad', {
    type: '_ping_',
    width: 300,
    height: 250,
    src: 'https://testsrc',
    'data-valid': 'true',
    'data-width': '6666',
  });
  ampAdElement.isBuilt = () => {return true;};

  return new AmpAd3PImpl(ampAdElement);
}

describe('amp-ad-3p-impl', () => {
  let sandbox;
  let ad3p;
  let win;
  const whenFirstVisible = Promise.resolve();

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    return createIframePromise(true).then(iframe => {
      win = iframe.win;
      win.document.head.appendChild(
          createElementWithAttributes(win.document, 'link', {
            rel: 'canonical',
            href: 'https://canonical.url',
          }));
      ad3p = createAmpAd(win);
      win.document.body.appendChild(ad3p.element);
      ad3p.buildCallback();
      // Turn the doc to visible so prefetch will be proceeded.
      stubService(sandbox, win, 'viewer', 'whenFirstVisible')
          .returns(whenFirstVisible);
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('layoutCallback', () => {
    it('should create iframe and pass data via URL fragment', () => {
      return ad3p.layoutCallback().then(() => {
        const iframe = ad3p.element.querySelector('iframe[src]');
        expect(iframe).to.be.ok;
        expect(iframe.tagName).to.equal('IFRAME');
        const url = iframe.getAttribute('src');
        expect(url).to.match(/^http:\/\/ads.localhost:/);
        expect(iframe.style.display).to.equal('');

        let data;
        expect(url).to.match(/frame(.max)?.html/);
        data = JSON.parse(iframe.name).attributes;
        expect(data).to.have.property('type', '_ping_');
        expect(data).to.have.property('src', 'https://testsrc');
        expect(data).to.have.property('width', 300);
        expect(data).to.have.property('height', 250);
        expect(data._context.canonicalUrl).to.equal('https://canonical.url/');
      });
    });

    it('should only layout once', () => {
      ad3p.unlayoutCallback();
      const firstLayout = ad3p.layoutCallback();
      const secondLayout = ad3p.layoutCallback();
      expect(firstLayout).to.equal(secondLayout);

      ad3p.unlayoutCallback();
      const newLayout = ad3p.layoutCallback();
      expect(newLayout).to.not.equal(secondLayout);
    });

    it('should propagete CID to ad iframe', () => {
      sandbox.stub(adCid, 'getAdCid', () => {
        return Promise.resolve('sentinel123');
      });

      return ad3p.layoutCallback().then(() => {
        const frame = ad3p.element.querySelector('iframe[src]');
        expect(frame).to.be.ok;
        const data = JSON.parse(frame.name).attributes;
        expect(data).to.be.ok;
        expect(data._context).to.be.ok;
        expect(data._context.clientId).to.equal('sentinel123');
      });
    });

    it('should proceed w/o CID', () => {
      sandbox.stub(adCid, 'getAdCid', () => {
        return Promise.resolve(undefined);
      });
      return ad3p.layoutCallback().then(() => {
        const frame = ad3p.element.querySelector('iframe[src]');
        expect(frame).to.be.ok;
        const data = JSON.parse(frame.name).attributes;
        expect(data).to.be.ok;
        expect(data._context).to.be.ok;
        expect(data._context.clientId).to.equal(null);
      });
    });

    it('should reject if no type attribute provided', () => {
      ad3p.element.removeAttribute('type');
      return expect(ad3p.layoutCallback())
          .to.eventually.be.rejectedWith('type');
    });

    it('should throw on position:fixed', () => {
      ad3p.element.style.position = 'fixed';
      ad3p.onLayoutMeasure();
      expect(() => ad3p.layoutCallback()).to.throw('position:fixed');
    });

    it('should throw on parent being position:fixed', () => {
      const adContainerElement = win.document.createElement('div');
      adContainerElement.style.position = 'fixed';
      win.document.body.appendChild(adContainerElement);
      const ad3p = createAmpAd(win);
      adContainerElement.appendChild(ad3p.element);

      ad3p.onLayoutMeasure();
      expect(() => ad3p.layoutCallback()).to.throw('position:fixed');
    });

    it('should allow position:fixed with whitelisted ad container', () => {
      const adContainerElement = win.document.createElement('amp-sticky-ad');
      adContainerElement.style.position = 'fixed';
      win.document.body.appendChild(adContainerElement);
      const ad3p = createAmpAd(win);
      adContainerElement.appendChild(ad3p.element);
      ad3p.buildCallback();
      ad3p.onLayoutMeasure();
      return ad3p.layoutCallback();
    });

    it('should pass ad container info to child iframe via URL', () => {
      const adContainerElement = win.document.createElement('amp-sticky-ad');
      win.document.body.appendChild(adContainerElement);
      const ad3p = createAmpAd(win);
      adContainerElement.appendChild(ad3p.element);
      ad3p.buildCallback();
      ad3p.onLayoutMeasure();
      return ad3p.layoutCallback().then(() => {
        const frame = ad3p.element.querySelector('iframe[src]');
        expect(frame).to.be.ok;
        const data = JSON.parse(frame.name).attributes;
        expect(data).to.be.ok;
        expect(data._context).to.be.ok;
        expect(data._context.container).to.equal('AMP-STICKY-AD');
      });
    });
  });

  describe('preconnectCallback', () => {
    it('should add preconnect and prefech to DOM header', () => {
      ad3p.buildCallback();
      ad3p.preconnectCallback();
      return whenFirstVisible.then(() => {
        let fetches = win.document.querySelectorAll('link[rel=prefetch]');
        if (!fetches.length) {
          fetches = win.document.querySelectorAll('link[rel=preload]');
        }
        expect(fetches).to.have.length(2);
        expect(fetches[0]).to.have.property('href',
            'http://ads.localhost:9876/dist.3p/current/frame.max.html');
        expect(fetches[1]).to.have.property('href',
            'http://ads.localhost:9876/dist.3p/current/integration.js');

        const preconnects =
            win.document.querySelectorAll('link[rel=preconnect]');
        expect(preconnects[preconnects.length - 1]).to.have.property('href',
            'https://testsrc/');
      });
    });
  });

  // TODO: add test for noContentHandler_()

  describe('renderOutsideViewport', () => {
    it('should allow rendering within 3 viewports by default', () => {
      expect(ad3p.renderOutsideViewport()).to.equal(3);
    });

    it('should reduce render range when prefer-viewability-over-views ' +
        'is set', () => {
      ad3p.element.setAttribute(
          'data-loading-strategy', 'prefer-viewability-over-views');
      expect(ad3p.renderOutsideViewport()).to.equal(1.25);
    });

    it('should only allow rendering one ad a time', () => {
      const clock = lolex.install(win);
      const ad3p2 = createAmpAd(win);
      expect(ad3p.renderOutsideViewport()).to.equal(3);
      expect(ad3p2.renderOutsideViewport()).to.equal(3);

      ad3p.layoutCallback();
      expect(ad3p2.renderOutsideViewport()).to.equal(false);

      // Ad loading should only block 1s.
      clock.tick(999);
      expect(ad3p2.renderOutsideViewport()).to.equal(false);
      clock.tick(1);
      expect(ad3p2.renderOutsideViewport()).to.equal(3);
    });
  });

  describe('#getIntersectionElementLayoutBox', () => {
    it('should not cache intersection box', () => {
      return ad3p.layoutCallback().then(() => {
        const iframe = ad3p.element.querySelector('iframe');

        // Force some styles on the iframe, to display it without loading
        // the iframe and have different size than the ad itself.
        iframe.style.width = '300px';
        iframe.style.height = '200px';
        iframe.style.display = 'block';
        iframe.style.minHeight = '0px';

        const stub = sandbox.stub(ad3p, 'getLayoutBox');
        const box = {
          top: 100,
          bottom: 200,
          left: 0,
          right: 100,
          width: 100,
          height: 100,
        };
        stub.returns(box);

        ad3p.onLayoutMeasure();
        const intersection = ad3p.getIntersectionElementLayoutBox();

        // Simulate a fixed position element "moving" 100px by scrolling down
        // the page.
        box.top += 100;
        box.bottom += 100;
        const newIntersection = ad3p.getIntersectionElementLayoutBox();
        expect(newIntersection).not.to.deep.equal(intersection);
        expect(newIntersection.top).to.equal(intersection.top + 100);
        expect(newIntersection.width).to.equal(300);
        expect(newIntersection.height).to.equal(200);
      });
    });
  });
});
