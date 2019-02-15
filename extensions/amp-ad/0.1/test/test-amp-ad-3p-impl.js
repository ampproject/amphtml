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

import '../../../amp-ad/0.1/amp-ad';
import '../../../amp-sticky-ad/1.0/amp-sticky-ad';
import * as adCid from '../../../../src/ad-cid';
import * as consent from '../../../../src/consent';
import * as lolex from 'lolex';
import {AmpAd3PImpl} from '../amp-ad-3p-impl';
import {CONSENT_POLICY_STATE} from '../../../../src/consent-state';
import {LayoutPriority} from '../../../../src/layout';
import {Services} from '../../../../src/services';
import {adConfig} from '../../../../ads/_config';
import {createElementWithAttributes} from '../../../../src/dom';
import {macroTask} from '../../../../testing/yield';
import {stubService} from '../../../../testing/test-helper';
import {user} from '../../../../src/log';


function createAmpAd(win, attachToAmpdoc = false, ampdoc) {
  const ampAdElement = createElementWithAttributes(win.document, 'amp-ad', {
    type: '_ping_',
    width: 300,
    height: 250,
    src: 'https://testsrc',
    'data-valid': 'true',
    'data-width': '6666',
  });

  if (attachToAmpdoc) {
    ampdoc.getBody().appendChild(ampAdElement);
  }

  ampAdElement.isBuilt = () => {return true;};

  return new AmpAd3PImpl(ampAdElement);
}

describes.realWin('amp-ad-3p-impl', {
  amp: {
    runtimeOn: false,
    canonicalUrl: 'https://canonical.url',
  },
  allowExternalResources: true,
}, env => {
  let sandbox;
  let ad3p;
  let win;
  let registryBackup;
  const whenFirstVisible = Promise.resolve();

  beforeEach(() => {
    registryBackup = Object.create(null);
    Object.keys(adConfig).forEach(k => {
      registryBackup[k] = adConfig[k];
      delete adConfig[k];
    });
    adConfig['_ping_'] = Object.assign({}, registryBackup['_ping_']);
    sandbox = env.sandbox;
    win = env.win;
    ad3p = createAmpAd(win);
    win.document.body.appendChild(ad3p.element);
    ad3p.buildCallback();
    // Turn the doc to visible so prefetch will be proceeded.
    stubService(sandbox, win, 'viewer', 'whenFirstVisible')
        .returns(whenFirstVisible);
  });

  afterEach(() => {
    Object.keys(registryBackup).forEach(k => {
      adConfig[k] = registryBackup[k];
    });
    registryBackup = null;
  });

  describe('layoutCallback', () => {
    it('should create iframe and pass data via URL fragment', () => {
      return ad3p.layoutCallback().then(() => {
        const iframe = ad3p.element.querySelector('iframe[src]');
        expect(iframe).to.be.ok;
        expect(iframe.tagName).to.equal('IFRAME');
        const url = iframe.getAttribute('src');
        expect(url).to.match(/^http:\/\/ads.localhost:/);
        expect(iframe).to.not.have.attribute('hidden');

        expect(url).to.match(/frame(.max)?.html/);
        const data = JSON.parse(iframe.name).attributes;
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
      sandbox.stub(adCid, 'getAdCid').resolves('sentinel123');

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
      sandbox.stub(adCid, 'getAdCid').resolves(undefined);
      return ad3p.layoutCallback().then(() => {
        const frame = ad3p.element.querySelector('iframe[src]');
        expect(frame).to.be.ok;
        const data = JSON.parse(frame.name).attributes;
        expect(data).to.be.ok;
        expect(data._context).to.be.ok;
        expect(data._context.clientId).to.equal(null);
      });
    });

    it('should propagate consent state to ad iframe', () => {
      ad3p.element.setAttribute('data-block-on-consent', '');
      sandbox.stub(consent, 'getConsentPolicyState')
          .resolves(CONSENT_POLICY_STATE.SUFFICIENT);
      sandbox.stub(consent, 'getConsentPolicySharedData')
          .resolves({a: 1, b: 2});

      return ad3p.layoutCallback().then(() => {
        const frame = ad3p.element.querySelector('iframe[src]');
        expect(frame).to.be.ok;
        const data = JSON.parse(frame.name).attributes;
        expect(data).to.be.ok;
        expect(data._context).to.be.ok;
        expect(data._context.initialConsentState)
            .to.equal(CONSENT_POLICY_STATE.SUFFICIENT);
        expect(data._context.consentSharedData)
            .to.deep.equal({a: 1, b: 2});
      });
    });

    it('should propagate null consent state to ad iframe', () => {
      return ad3p.layoutCallback().then(() => {
        const frame = ad3p.element.querySelector('iframe[src]');
        expect(frame).to.be.ok;
        const data = JSON.parse(frame.name).attributes;
        expect(data).to.be.ok;
        expect(data._context).to.be.ok;
        expect(data._context.initialConsentState).to.be.null;
      });
    });

    it('should throw on position:fixed', () => {
      ad3p.element.style.position = 'fixed';
      ad3p.onLayoutMeasure();
      allowConsoleError(() => {
        expect(() => ad3p.layoutCallback()).to.throw('position:fixed');
      });
    });

    it('should throw on parent being position:fixed', () => {
      const adContainerElement = win.document.createElement('div');
      adContainerElement.style.position = 'fixed';
      win.document.body.appendChild(adContainerElement);
      const ad3p = createAmpAd(win);
      adContainerElement.appendChild(ad3p.element);

      ad3p.onLayoutMeasure();
      allowConsoleError(() => {
        expect(() => ad3p.layoutCallback()).to.throw('position:fixed');
      });
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

    it('should use custom path', () => {
      const remoteUrl = 'https://example.com/boot/remote.html';
      const meta = win.document.createElement('meta');
      meta.setAttribute('name', 'amp-3p-iframe-src');
      meta.setAttribute('content', remoteUrl);
      win.document.head.appendChild(meta);
      ad3p.onLayoutMeasure();
      return ad3p.layoutCallback().then(() => {
        expect(win.document.querySelector('iframe[src="' +
            `${remoteUrl}?$internalRuntimeVersion$"]`)).to.be.ok;
      });
    });

    it('should use default path if custom disabled', () => {
      const meta = win.document.createElement('meta');
      meta.setAttribute('name', 'amp-3p-iframe-src');
      meta.setAttribute('content', 'https://example.com/boot/remote.html');
      win.document.head.appendChild(meta);
      ad3p.config.remoteHTMLDisabled = true;
      ad3p.onLayoutMeasure();
      sandbox.stub(user(), 'error');
      return ad3p.layoutCallback().then(() => {
        expect(win.document.querySelector('iframe[src="' +
            'http://ads.localhost:9876/dist.3p/current/frame.max.html"]'))
            .to.be.ok;
      });
    });
  });

  describe('preconnectCallback', () => {
    it('should add preconnect and prefetch to DOM header', () => {
      ad3p.buildCallback();
      ad3p.preconnectCallback();
      return whenFirstVisible.then(() => {
        const fetches = win.document.querySelectorAll('link[rel=preload]');
        expect(fetches).to.have.length(2);
        expect(Array.from(fetches).map(link => link.href).sort()).to
            .jsonEqual([
              'http://ads.localhost:9876/dist.3p/current/frame.max.html',
              'http://ads.localhost:9876/dist.3p/current/integration.js',
            ]);

        const preconnects =
            win.document.querySelectorAll('link[rel=preconnect]');
        expect(preconnects[preconnects.length - 1]).to.have.property('href',
            'https://testsrc/');
      });
    });

    it('should use remote html path for preload', () => {
      const remoteUrl = 'https://example.com/boot/remote.html';
      const meta = win.document.createElement('meta');
      meta.setAttribute('name', 'amp-3p-iframe-src');
      meta.setAttribute('content', remoteUrl);
      win.document.head.appendChild(meta);
      ad3p.buildCallback();
      ad3p.preconnectCallback();
      return whenFirstVisible.then(() => {
        expect(Array.from(win.document.querySelectorAll('link[rel=preload]'))
            .some(link => link.href == `${remoteUrl}?$internalRuntimeVersion$`))
            .to.be.true;
      });
    });

    it('should not use remote html path for preload if disabled', () => {
      const meta = win.document.createElement('meta');
      meta.setAttribute('name', 'amp-3p-iframe-src');
      meta.setAttribute('content', 'https://example.com/boot/remote.html');
      win.document.head.appendChild(meta);
      ad3p.config.remoteHTMLDisabled = true;
      ad3p.buildCallback();
      allowConsoleError(() => {
        ad3p.preconnectCallback();
      });
      return whenFirstVisible.then(() => {
        expect(Array.from(win.document.querySelectorAll('link[rel=preload]'))
            .some(link => link.href ==
              'http://ads.localhost:9876/dist.3p/current/frame.max.html'))
            .to.be.true;
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

    it('should only allow rendering one ad per second', function* () {
      const clock = lolex.install({
        target: win, toFake: ['Date', 'setTimeout', 'clearTimeout']});
      const ad3p2 = createAmpAd(win);
      const oneSecPromise = Services.timerFor(win).promise(1001);
      expect(ad3p.renderOutsideViewport()).to.equal(3);
      expect(ad3p2.renderOutsideViewport()).to.equal(3);

      ad3p.layoutCallback();
      expect(ad3p2.renderOutsideViewport()).to.equal(false);

      // Ad loading should only block 1s.
      clock.tick(999);
      yield macroTask();
      expect(ad3p2.renderOutsideViewport()).to.equal(false);
      clock.tick(2);
      yield oneSecPromise;
      expect(ad3p2.renderOutsideViewport()).to.equal(3);
    });

    it('should only allow rendering one ad a time', function* () {
      const ad3p2 = createAmpAd(win);
      expect(ad3p.renderOutsideViewport()).to.equal(3);
      expect(ad3p2.renderOutsideViewport()).to.equal(3);

      const layoutPromise = ad3p.layoutCallback();
      expect(ad3p2.renderOutsideViewport()).to.equal(false);

      // load ad one a time
      yield layoutPromise; // wait for iframe load
      yield macroTask(); // yield to promise resolution after iframe load
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

  describe('full width responsive ad', () => {

    const VIEWPORT_WIDTH = 300;
    const VIEWPORT_HEIGHT = 600;

    beforeEach(() => {
      adConfig['_ping_'].fullWidthHeightRatio = 1.2;
      win.document.body.removeChild(ad3p.element);
    });

    describe('should resize correctly', () => {
      let impl;
      let element;

      function constructImpl(config) {
        config.type = '_ping_';
        element = createElementWithAttributes(win.document, 'amp-ad', config);
        win.document.body.appendChild(element);
        impl = new AmpAd3PImpl(element);
        impl.element.style.display = 'block';
        impl.element.style.position = 'relative';
        impl.element.style.top = '101vh';

        // Fix the viewport to a consistent size to that the test doesn't depend
        // on the actual browser window opened.
        impl.getViewport().getSize =
          () => ({width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT});
      }

      it('should do nothing for non-responsive', () => {
        constructImpl({
          width: '280',
          height: '280',
        });
        const attemptChangeSizeSpy = sandbox.spy(impl, 'attemptChangeSize');
        expect(impl.buildCallback()).to.be.undefined;
        expect(attemptChangeSizeSpy).to.not.be.called;
      });

      it('should schedule a resize for responsive', () => {
        constructImpl({
          width: '100vw',
          height: '280',
          'data-auto-format': 'rspv',
          'data-full-width': '',
        });
        const attemptChangeSizeSpy =
            sandbox.stub(impl, 'attemptChangeSize').callsFake(
                (height, width) => {
                  expect(width).to.equal(VIEWPORT_WIDTH);
                  expect(height).to.equal(250);
                  return Promise.resolve();
                });

        const callback = impl.buildCallback();
        expect(callback).to.exist;
        expect(attemptChangeSizeSpy).to.be.calledOnce;
      });

      it('should schedule a resize for matched content responsive', () => {
        constructImpl({
          width: '100vw',
          height: '280',
          'data-auto-format': 'mcrspv',
          'data-full-width': '',
        });
        const attemptChangeSizeSpy =
            sandbox.stub(impl, 'attemptChangeSize').callsFake(
                (height, width) => {
                  expect(width).to.equal(VIEWPORT_WIDTH);
                  expect(height).to.equal(1131);
                  return Promise.resolve();
                });

        const callback = impl.buildCallback();
        expect(callback).to.exist;
        expect(attemptChangeSizeSpy).to.be.calledOnce;
      });
    });

    describe('should align correctly', () => {
      // Nested elements to contain the ad. (container contains the ad, and
      // containerContainer contains that container.)
      let containerContainer, container;
      let viewer;
      let element;
      let impl;

      function buildImpl(config) {
        containerContainer = win.document.createElement('div');
        container = win.document.createElement('div');
        // Create an element with horizontal margins for the ad to break out
        // of.
        containerContainer.style.marginLeft = '5px';
        containerContainer.style.marginRight = '9px';

        // Create an element with horizontal margins for the ad to break out
        // of.
        container.style.marginLeft = '14px';
        container.style.paddingLeft = '5px';
        container.style.marginRight = '20px';
        container.style.paddingRight = '5px';

        config.type = '_ping_';

        element = createElementWithAttributes(win.document, 'amp-ad', config);

        container.appendChild(element);
        containerContainer.appendChild(container);
        win.document.body.appendChild(containerContainer);

        impl = new AmpAd3PImpl(element);
        impl.element.style.display = 'block';
        impl.element.style.position = 'relative';
        impl.element.style.top = '150vh';

        // Stub out vsync tasks to run immediately.
        impl.getVsync().run = (vsyncTaskSpec, vsyncState) => {
          if (vsyncTaskSpec.measure) {
            vsyncTaskSpec.measure(vsyncState);
          }
          if (vsyncTaskSpec.mutate) {
            vsyncTaskSpec.mutate(vsyncState);
          }
        };

        // Fix the viewport to a consistent size to that the test doesn't
        // depend on the actual browser window opened.
        impl.getViewport().getSize =
              () => ({width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT});

        return impl.buildCallback();
      }

      beforeEach(() => {
        viewer = win.services.viewer.obj;
        viewer.toggleRuntime(); // Turn runtime on for these tests.
      });

      afterEach(() => {
        viewer.toggleRuntime(); // Turn runtime off again.
        win.document.body.style.direction = '';
      });

      it('should change left margin for responsive', () => {
        return buildImpl({
          width: '100vw',
          height: '280',
          'data-auto-format': 'rspv',
          'data-full-width': '',
        }).then(() => {
          expect(element.offsetWidth).to.equal(VIEWPORT_WIDTH);

          impl.onLayoutMeasure();
          // Left margin is 19px from container and 5px from body.
          expect(element.style.marginRight).to.be.equal('');
          expect(element.style.marginLeft).to.be.equal('-24px');
        });
      });

      it('should change right margin for responsive in RTL', () => {
        win.document.body.style.direction = 'rtl';

        return buildImpl({
          width: '100vw',
          height: '320',
          'data-auto-format': 'rspv',
          'data-full-width': '',
        }).then(() => {
          expect(element.offsetWidth).to.equal(VIEWPORT_WIDTH);

          impl.onLayoutMeasure();
          // Right margin is 9px from containerContainer and 25px from
          // container.
          expect(element.style.marginLeft).to.be.equal('');
          expect(element.style.marginRight).to.be.equal('-34px');
        });
      });
    });
  });
});

describe('#getLayoutPriority', () => {
  describes.realWin('with shadow AmpDoc', {
    amp: {
      ampdoc: 'shadow',
    },
  }, env => {
    it('should return priority of 1', () => {
      const ad3p = createAmpAd(env.ampdoc.win, /*attach*/ true, env.ampdoc);
      expect(ad3p.getLayoutPriority()).to.equal(LayoutPriority.METADATA);
    });
  });

  describes.realWin('with single AmpDoc', {
    amp: {
      ampdoc: 'single',
    },
  }, env => {
    it('should return priority of 2', () => {
      const ad3p = createAmpAd(env.ampdoc.win, /*attach*/ true, env.ampdoc);
      expect(ad3p.getLayoutPriority()).to.equal(LayoutPriority.ADS);
    });
  });
});
