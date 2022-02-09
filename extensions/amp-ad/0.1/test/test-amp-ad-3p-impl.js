import '../../../amp-sticky-ad/1.0/amp-sticky-ad';
import '../amp-ad';
import * as fakeTimers from '@sinonjs/fake-timers';
import {expect} from 'chai';

import {adConfig} from '#ads/_config';

import {CONSENT_POLICY_STATE} from '#core/constants/consent-state';
import {createElementWithAttributes} from '#core/dom';
import {LayoutPriority_Enum} from '#core/dom/layout';
import * as mode from '#core/mode';

import {Services} from '#service';

import {macroTask} from '#testing/helpers';
import {stubServiceForDoc} from '#testing/helpers/service';

import * as adCid from '../../../../src/ad-cid';
import * as consent from '../../../../src/consent';
import {AmpAd3PImpl} from '../amp-ad-3p-impl';
import {AmpAdUIHandler} from '../amp-ad-ui';

function createAmpAd(win, attachToAmpdoc = false, ampdoc) {
  const ampAdElement = createElementWithAttributes(win.document, 'amp-ad', {
    type: '_ping_',
    width: 300,
    height: 250,
    src: 'https://src.test',
    'data-valid': 'true',
    'data-width': '6666',
  });

  if (attachToAmpdoc) {
    ampdoc.getBody().appendChild(ampAdElement);
  }

  ampAdElement.isBuilt = () => {
    return true;
  };

  const impl = new AmpAd3PImpl(ampAdElement);
  // Initialize internal implementation structure since `isBuilt` is forced
  // to return `true` above.
  ampAdElement.impl_ = impl;
  return impl;
}

describes.realWin(
  'amp-ad-3p-impl',
  {
    amp: {
      runtimeOn: false,
      canonicalUrl: 'https://canonical.test',
    },
    allowExternalResources: true,
  },
  (env) => {
    let ad3p;
    let win;
    let registryBackup;
    const whenFirstVisible = Promise.resolve();

    beforeEach(() => {
      registryBackup = Object.create(null);
      Object.keys(adConfig).forEach((k) => {
        registryBackup[k] = adConfig[k];
        delete adConfig[k];
      });
      adConfig['_ping_'] = {...registryBackup['_ping_']};
      win = env.win;
      ad3p = createAmpAd(win);
      win.document.body.appendChild(ad3p.element);
      ad3p.buildCallback();
      // Turn the doc to visible so prefetch will be proceeded.
      env.sandbox
        .stub(env.ampdoc, 'whenFirstVisible')
        .returns(whenFirstVisible);
    });

    afterEach(() => {
      Object.keys(registryBackup).forEach((k) => {
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
          expect(data).to.have.property('src', 'https://src.test');
          expect(data).to.have.property('width', 300);
          expect(data).to.have.property('height', 250);
          expect(data._context.canonicalUrl).to.equal(
            'https://canonical.test/'
          );
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

      it('should propagate CID to ad iframe', () => {
        env.sandbox.stub(adCid, 'getAdCid').resolves('sentinel123');

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
        env.sandbox.stub(adCid, 'getAdCid').resolves(undefined);
        return ad3p.layoutCallback().then(() => {
          const frame = ad3p.element.querySelector('iframe[src]');
          expect(frame).to.be.ok;
          const data = JSON.parse(frame.name).attributes;
          expect(data).to.be.ok;
          expect(data._context).to.be.ok;
          expect(data._context.clientId).to.equal(null);
        });
      });

      it('should propagate consent values to ad iframe', () => {
        ad3p.element.setAttribute('data-block-on-consent', '');
        env.sandbox
          .stub(consent, 'getConsentPolicyState')
          .resolves(CONSENT_POLICY_STATE.SUFFICIENT);
        env.sandbox
          .stub(consent, 'getConsentPolicySharedData')
          .resolves({a: 1, b: 2});
        env.sandbox
          .stub(consent, 'getConsentMetadata')
          .resolves({consentStringType: 2, gdprApplies: true});

        return ad3p.layoutCallback().then(() => {
          const frame = ad3p.element.querySelector('iframe[src]');
          expect(frame).to.be.ok;
          const data = JSON.parse(frame.name).attributes;
          expect(data).to.be.ok;
          expect(data._context).to.be.ok;
          expect(data._context.initialConsentState).to.equal(
            CONSENT_POLICY_STATE.SUFFICIENT
          );
          expect(data._context.consentSharedData).to.deep.equal({a: 1, b: 2});
          expect(data._context.initialConsentMetadata).to.deep.equal({
            consentStringType: 2,
            gdprApplies: true,
          });
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

      it('should propagate pageViewId64 to ad iframe', () => {
        stubServiceForDoc(
          env.sandbox,
          env.ampdoc,
          'documentInfo',
          'get'
        ).returns({
          get pageViewId64() {
            return Promise.resolve('pageViewId64Stub');
          },
        });

        return ad3p.layoutCallback().then(() => {
          const frame = ad3p.element.querySelector('iframe[src]');
          expect(frame).to.be.ok;
          const data = JSON.parse(frame.name).attributes;
          expect(data).to.be.ok;
          expect(data._context).to.be.ok;
          expect(data._context.pageViewId64).to.equal('pageViewId64Stub');
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
        ad3p.uiHandler = new AmpAdUIHandler(ad3p);
        adContainerElement.appendChild(ad3p.element);

        ad3p.onLayoutMeasure();
        allowConsoleError(() => {
          expect(() => ad3p.layoutCallback()).to.throw('position:fixed');
        });
      });

      it('should allow position:fixed with an allowed ad container', () => {
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
        const remoteUrl = 'https://src.test/boot/remote.html';
        const meta = win.document.createElement('meta');
        meta.setAttribute('name', 'amp-3p-iframe-src');
        meta.setAttribute('content', remoteUrl);
        win.document.head.appendChild(meta);
        ad3p.onLayoutMeasure();
        return ad3p.layoutCallback().then(() => {
          expect(
            win.document.querySelector(
              `iframe[src="${remoteUrl}?$internalRuntimeVersion$"]`
            )
          ).to.be.ok;
        });
      });
    });

    describe('pause/resume', () => {
      describe('before layout', () => {
        it('should require unlayout before initialization', () => {
          expect(ad3p.unlayoutOnPause()).to.be.true;
        });

        it('should noop pause', () => {
          expect(() => ad3p.pauseCallback()).to.not.throw();
        });

        it('should noop resume', () => {
          expect(() => ad3p.resumeCallback()).to.not.throw();
        });
      });

      describe('during layout', () => {
        it('sticky ad: should not layout w/o scroll', () => {
          ad3p.element.setAttribute('sticky', 'bottom');
          ad3p.buildCallback();
          const maybeInitStickyAdSpy = env.sandbox.spy(
            ad3p.uiHandler,
            'maybeInitStickyAd'
          );
          expect(maybeInitStickyAdSpy).to.not.be.called;
          Services.viewportForDoc(env.ampdoc).scrollObservable_.fire();
          return Promise.resolve().then(() => {
            expect(maybeInitStickyAdSpy).to.be.called;
          });
        });
      });

      describe('after layout', () => {
        beforeEach(async () => {
          await ad3p.layoutCallback();
        });

        it('should require unlayout', () => {
          expect(ad3p.unlayoutOnPause()).to.be.true;
        });
      });
    });

    describe('preconnectCallback', () => {
      it('should add preconnect and prefetch to DOM header', () => {
        env.sandbox.stub(mode, 'isProd').returns(true);
        ad3p.buildCallback();
        ad3p.preconnectCallback();
        return whenFirstVisible.then(() => {
          const fetches = win.document.querySelectorAll('link[rel=preload]');
          expect(fetches).to.have.length(2);
          expect(fetches[0].href).to.match(
            /^https:\/\/d-\d+\.ampproject\.net\/\$internalRuntimeVersion\$\/frame\.html$/
          );
          expect(fetches[1]).to.have.property(
            'href',
            'https://3p.ampproject.net/$internalRuntimeVersion$/vendor/_ping_.js'
          );

          const preconnects = win.document.querySelectorAll(
            'link[rel=preconnect]'
          );
          expect(preconnects[preconnects.length - 1]).to.have.property(
            'href',
            'https://src.test/'
          );
        });
      });

      it('should use remote html path for preload', () => {
        const remoteUrl = 'https://src.test/boot/remote.html';
        const meta = win.document.createElement('meta');
        meta.setAttribute('name', 'amp-3p-iframe-src');
        meta.setAttribute('content', remoteUrl);
        win.document.head.appendChild(meta);
        ad3p.buildCallback();
        ad3p.preconnectCallback();
        return whenFirstVisible.then(() => {
          expect(
            Array.from(win.document.querySelectorAll('link[rel=preload]')).some(
              (link) => link.href == `${remoteUrl}?$internalRuntimeVersion$`
            )
          ).to.be.true;
        });
      });
    });

    // TODO: add test for noContentHandler_()

    describe('renderOutsideViewport', () => {
      it('should allow rendering within 3 viewports by default', () => {
        expect(ad3p.renderOutsideViewport()).to.equal(3);
      });

      it(
        'should reduce render range when prefer-viewability-over-views ' +
          'is set',
        () => {
          ad3p.element.setAttribute(
            'data-loading-strategy',
            'prefer-viewability-over-views'
          );
          expect(ad3p.renderOutsideViewport()).to.equal(1.25);
        }
      );

      it('should only allow rendering one ad per second', async () => {
        ad3p.getVsync().runScheduledTasks_();
        const clock = fakeTimers.withGlobal(win).install({
          toFake: ['Date', 'setTimeout', 'clearTimeout'],
        });
        const ad3p2 = createAmpAd(win);
        const oneSecPromise = Services.timerFor(win).promise(1001);
        expect(ad3p.renderOutsideViewport()).to.equal(3);
        expect(ad3p2.renderOutsideViewport()).to.equal(3);

        ad3p.layoutCallback();
        expect(ad3p2.renderOutsideViewport()).to.equal(false);

        // Ad loading should only block 1s.
        clock.tick(999);
        await macroTask();
        expect(ad3p2.renderOutsideViewport()).to.equal(false);
        clock.tick(2);
        await oneSecPromise;
        clock.tick(2);
        await macroTask();
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

          const stub = env.sandbox.stub(ad3p, 'getLayoutBox');
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
          impl.getViewport().getSize = () => ({
            width: VIEWPORT_WIDTH,
            height: VIEWPORT_HEIGHT,
          });
        }

        it('should do nothing for non-responsive', () => {
          constructImpl({
            width: '280',
            height: '280',
          });
          const attemptChangeSizeSpy = env.sandbox.spy(
            impl,
            'attemptChangeSize'
          );
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
          const attemptChangeSizeSpy = env.sandbox
            .stub(impl, 'attemptChangeSize')
            .callsFake((height, width) => {
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
          const attemptChangeSizeSpy = env.sandbox
            .stub(impl, 'attemptChangeSize')
            .callsFake((height, width) => {
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
          impl.getViewport().getSize = () => ({
            width: VIEWPORT_WIDTH,
            height: VIEWPORT_HEIGHT,
          });

          return impl.buildCallback();
        }

        beforeEach(() => {
          viewer = win.__AMP_SERVICES.viewer.obj;
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
  }
);

describes.sandboxed('#getLayoutPriority', {}, () => {
  describes.realWin(
    'with shadow AmpDoc',
    {
      amp: {
        ampdoc: 'shadow',
      },
    },
    (env) => {
      it('should return priority of 1', () => {
        const ad3p = createAmpAd(env.ampdoc.win, /*attach*/ true, env.ampdoc);
        expect(ad3p.getLayoutPriority()).to.equal(LayoutPriority_Enum.METADATA);
      });
    }
  );

  describes.realWin(
    'with single AmpDoc',
    {
      amp: {
        ampdoc: 'single',
      },
    },
    (env) => {
      it('should return priority of 2', () => {
        const ad3p = createAmpAd(env.ampdoc.win, /*attach*/ true, env.ampdoc);
        expect(ad3p.getLayoutPriority()).to.equal(LayoutPriority_Enum.ADS);
      });
    }
  );
});
