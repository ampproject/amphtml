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

import '../../../../extensions/amp-ad/0.1/amp-ad-xorigin-iframe-handler';
// Need the following side-effect import because in actual production code,
// Fast Fetch impls are always loaded via an AmpAd tag, which means AmpAd is
// always available for them. However, when we test an impl in isolation,
// AmpAd is not loaded already, so we need to load it separately.
import '../../../amp-ad/0.1/amp-ad';
// The following namespaces are imported so that we can stub and spy on certain
// methods in tests.
import * as analytics from '../../../../src/analytics';
import * as analyticsExtension from '../../../../src/extension-analytics';
import {AMP_SIGNATURE_HEADER, VerificationStatus} from '../signature-verifier';
import {
  AmpA4A,
  CREATIVE_SIZE_HEADER,
  DEFAULT_SAFEFRAME_VERSION,
  EXPERIMENT_FEATURE_HEADER_NAME,
  INVALID_SPSA_RESPONSE,
  RENDERING_TYPE_HEADER,
  SAFEFRAME_VERSION_HEADER,
  assignAdUrlToError,
  protectFunctionWrapper,
} from '../amp-a4a';
import {CONSENT_POLICY_STATE} from '../../../../src/consent-state';
import {Extensions} from '../../../../src/service/extensions-impl';
import {FetchMock, networkFailure} from './fetch-mock';
import {FriendlyIframeEmbed} from '../../../../src/friendly-iframe-embed';
import {LayoutPriority} from '../../../../src/layout';
import {MockA4AImpl, TEST_URL} from './utils';
import {
  RealTimeConfigManager,
} from '../real-time-config-manager';
import {
  SINGLE_PASS_EXPERIMENT_IDS,
  isInExperiment,
} from '../../../../ads/google/a4a/traffic-experiments';
import {Services} from '../../../../src/services';
import {Signals} from '../../../../src/utils/signals';
import {Viewer} from '../../../../src/service/viewer-impl';
import {cancellation} from '../../../../src/error';
import {createElementWithAttributes} from '../../../../src/dom';
import {createIframePromise} from '../../../../testing/iframe';
import {dev, user} from '../../../../src/log';
import {getMode} from '../../../../src/mode';
import {
  incrementLoadingAds,
  is3pThrottled,
} from '../../../amp-ad/0.1/concurrent-load';
import {installDocService} from '../../../../src/service/ampdoc-impl';
import {layoutRectLtwh} from '../../../../src/layout-rect';
import {
  resetScheduledElementForTesting,
} from '../../../../src/service/custom-element-registry';
import {data as testFragments} from './testdata/test_fragments';
import {toggleExperiment} from '../../../../src/experiments';
import {
  data as validCSSAmp,
} from './testdata/valid_css_at_rules_amp.reserialized';

describe('amp-a4a', () => {
  const IFRAME_SANDBOXING_FLAGS = ['allow-forms', 'allow-modals',
    'allow-pointer-lock', 'allow-popups', 'allow-popups-to-escape-sandbox',
    'allow-same-origin', 'allow-scripts',
    'allow-top-navigation-by-user-activation'];

  let sandbox;
  let fetchMock;
  let getSigningServiceNamesMock;
  let viewerWhenVisibleMock;
  let adResponse;
  let onCreativeRenderSpy;
  let getResourceStub;

  beforeEach(() => {
    sandbox = sinon.sandbox;
    fetchMock = null;
    getSigningServiceNamesMock = sandbox.stub(AmpA4A.prototype,
        'getSigningServiceNames');
    onCreativeRenderSpy =
        sandbox.spy(AmpA4A.prototype, 'onCreativeRender');
    getSigningServiceNamesMock.returns(['google']);
    viewerWhenVisibleMock = sandbox.stub(Viewer.prototype, 'whenFirstVisible');
    viewerWhenVisibleMock.returns(Promise.resolve());
    getResourceStub = sandbox.stub(AmpA4A.prototype, 'getResource');
    getResourceStub.returns({
      getUpgradeDelayMs: () => 12345,
    });
    adResponse = {
      headers: {
        'AMP-Access-Control-Allow-Source-Origin': 'about:srcdoc',
        'AMP-Fast-Fetch-Signature': validCSSAmp.signatureHeader,
      },
      body: validCSSAmp.reserialized,
    };
    adResponse.headers[AMP_SIGNATURE_HEADER] = validCSSAmp.signatureHeader;
  });

  afterEach(() => {
    if (fetchMock) {
      fetchMock./*OK*/restore();
      fetchMock = null;
    }
    sandbox.restore();
    resetScheduledElementForTesting(window, 'amp-a4a');
  });

  /**
   * Sets up testing by loading iframe within which test runs.
   * @param {FixtureInterface} fixture
   */
  function setupForAdTesting(fixture) {
    expect(fetchMock).to.be.null;
    fetchMock = new FetchMock(fixture.win);
    fetchMock.getOnce(
        'https://cdn.ampproject.org/amp-ad-verifying-keyset.json', {
          body: validCSSAmp.publicKeyset,
          status: 200,
          headers: {'Content-Type': 'application/jwk-set+json'},
        });
    installDocService(fixture.win, /* isSingleDoc */ true);
    const {doc} = fixture;
    // TODO(a4a-cam@): This is necessary in the short term, until A4A is
    // smarter about host document styling.  The issue is that it needs to
    // inherit the AMP runtime style element in order for shadow DOM-enclosed
    // elements to behave properly.  So we have to set up a minimal one here.
    const ampStyle = doc.createElement('style');
    ampStyle.setAttribute('amp-runtime', 'scratch-fortesting');
    doc.head.appendChild(ampStyle);
  }

  /**
   * @param {!Document} doc
   * @param {Rect=} opt_rect
   * @param {Element=} opt_body
   */
  function createA4aElement(doc, opt_rect, opt_body) {
    const element = createElementWithAttributes(doc, 'amp-a4a', {
      'width': opt_rect ? String(opt_rect.width) : '200',
      'height': opt_rect ? String(opt_rect.height) : '50',
      'type': 'adsense',
    });
    element.getAmpDoc = () => {
      const ampdocService = Services.ampdocServiceFor(doc.defaultView);
      return ampdocService.getAmpDoc(element);
    };
    element.isBuilt = () => {return true;};
    element.getLayoutBox = () => {
      return opt_rect || layoutRectLtwh(0, 0, 200, 50);
    };
    element.getPageLayoutBox = () => {
      return element.getLayoutBox.apply(element, arguments);
    };
    element.getIntersectionChangeEntry = () => {return null;};
    const signals = new Signals();
    element.signals = () => signals;
    element.renderStarted = () => {
      signals.signal('render-start');
    };
    (opt_body || doc.body).appendChild(element);
    return element;
  }

  /**
   * @param {Object=} opt_additionalInfo
   * @return {string}
   */
  function buildCreativeString(opt_additionalInfo) {
    const baseTestDoc = testFragments.minimalDocOneStyle;
    const offsets = Object.assign({}, opt_additionalInfo || {});
    offsets.ampRuntimeUtf16CharOffsets = [
      baseTestDoc.indexOf('<style amp4ads-boilerplate'),
      baseTestDoc.lastIndexOf('</script>') + '</script>'.length,
    ];
    const splicePoint = baseTestDoc.indexOf('</body>');
    return baseTestDoc.slice(0, splicePoint) +
        '<script type="application/json" amp-ad-metadata>' +
        JSON.stringify(offsets) + '</script>' +
        baseTestDoc.slice(splicePoint);
  }

  /**
   * Checks that element is an amp-ad that is rendered via A4A.
   * @param {!Element} element
   */
  function verifyA4ARender(element) {
    expect(element.tagName.toLowerCase()).to.equal('amp-a4a');
    expect(element.querySelectorAll('iframe')).to.have.lengthOf(1);
    expect(element.querySelector('iframe[name]')).to.not.be.ok;
    expect(element.querySelector('iframe[src]')).to.not.be.ok;
    const friendlyChild = element.querySelector('iframe[srcdoc]');
    expect(friendlyChild).to.be.ok;
    expect(friendlyChild.getAttribute('srcdoc')).to.have.string(
        '<html ⚡4ads>');
    expect(element).to.be.visible;
    expect(friendlyChild).to.be.visible;
  }

  /**
   * Checks that element has expected sandbox attribute.
   * @param {!Element} element
   * @param {boolean} shouldSandbox
   */
  function verifySandbox(element, shouldSandbox) {
    const sandboxAttribute = element.getAttribute('sandbox');
    expect(!!sandboxAttribute).to.equal(shouldSandbox);
    if (shouldSandbox) {
      expect(sandboxAttribute.split(' ').sort()).to.jsonEqual(
          IFRAME_SANDBOXING_FLAGS);
    }
  }

  /**
   * Checks that element is an amp-ad that is rendered via SafeFrame.
   * @param {!Element} element
   * @param {string} sfVersion
   * @param {boolean=} shouldSandbox
   */
  function verifySafeFrameRender(element, sfVersion, shouldSandbox = false) {
    expect(element.tagName.toLowerCase()).to.equal('amp-a4a');
    expect(element).to.be.visible;
    expect(element.querySelectorAll('iframe')).to.have.lengthOf(1);
    const safeFrameUrl = 'https://tpc.googlesyndication.com/safeframe/' +
      sfVersion + '/html/container.html';
    const child = element.querySelector(`iframe[src^="${safeFrameUrl}"][name]`);
    expect(child).to.be.ok;
    const name = child.getAttribute('name');
    expect(name).to.match(/[^;]+;\d+;[\s\S]+/);
    const re = /^([^;]+);(\d+);([\s\S]*)$/;
    const match = re.exec(name);
    expect(match).to.be.ok;
    verifySandbox(child, shouldSandbox);
    const contentLength = Number(match[2]);
    const rest = match[3];
    expect(rest.length).to.be.above(contentLength);
    const data = JSON.parse(rest.substr(contentLength));
    expect(data).to.be.ok;
    verifyContext(data._context);
  }

  /** @param {!Object} context */
  function verifyContext(context) {
    expect(context).to.be.ok;
    expect(context.sentinel).to.be.ok;
    expect(context.sentinel).to.match(/((\d+)-\d+)/);
  }

  /**
   * Checks that element is an amp-ad that is rendered via nameframe.
   * @param {!Element} element
   * @param {boolean} shouldSandbox
   */
  function verifyNameFrameRender(element, shouldSandbox = false) {
    expect(element.tagName.toLowerCase()).to.equal('amp-a4a');
    expect(element).to.be.visible;
    expect(element.querySelectorAll('iframe')).to.have.lengthOf(1);
    const child = element.querySelector('iframe[src][name]');
    expect(child).to.be.ok;
    expect(child.src).to.match(/^https?:[^?#]+nameframe(\.max)?\.html/);
    const nameData = child.getAttribute('name');
    expect(nameData).to.be.ok;
    verifyNameData(nameData);
    expect(child).to.be.visible;
    verifySandbox(child, shouldSandbox);
  }

  /**
   * @param {!Element} element
   * @param {string} srcUrl
   * @param {boolean=} shouldSandbox
   */
  function verifyCachedContentIframeRender(element, srcUrl,
    shouldSandbox = false) {
    expect(element.tagName.toLowerCase()).to.equal('amp-a4a');
    expect(element).to.be.visible;
    expect(element.querySelectorAll('iframe')).to.have.lengthOf(1);
    const child = element.querySelector('iframe[src]');
    expect(child).to.be.ok;
    expect(child.src).to.have.string(srcUrl);
    const nameData = child.getAttribute('name');
    expect(nameData).to.be.ok;
    verifyNameData(nameData);
    expect(child).to.be.visible;
    verifySandbox(child, shouldSandbox);
  }

  /** @param {string} nameData */
  function verifyNameData(nameData) {
    let attributes;
    expect(() => {attributes = JSON.parse(nameData);}).not.to.throw(Error);
    expect(attributes).to.be.ok;
    verifyContext(attributes._context);
  }

  /**
   * @param {!AmpA4A} a4a
   * @param {!Function} triggerAnalyticsEventSpy
   * @param {(string|Array<string>)=} additionalEvents
   */
  function verifyA4aAnalyticsTriggersWereFired(
    a4a, triggerAnalyticsEventSpy, additionalEvents = []) {
    ['ad-request-start', 'ad-response-end', 'ad-render-start',
      'ad-render-end', 'ad-iframe-loaded'].concat(additionalEvents)
        .forEach(evnt => expect(triggerAnalyticsEventSpy).to.be.calledWith(
            a4a.element, evnt, {'time': sinon.match.number}));
  }

  describe('ads are visible', () => {
    let a4aElement;
    let a4a;
    let fixture;
    beforeEach(() => createIframePromise().then(f => {
      fixture = f;
      setupForAdTesting(fixture);
      fetchMock.getOnce(
          TEST_URL + '&__amp_source_origin=about%3Asrcdoc', () => adResponse,
          {name: 'ad'});
      a4aElement = createA4aElement(fixture.doc);
      a4a = new MockA4AImpl(a4aElement);
      a4a.releaseType_ = '0';
      return fixture;
    }));

    it('for SafeFrame rendering case', () => {
      // Make sure there's no signature, so that we go down the 3p iframe path.
      delete adResponse.headers['AMP-Fast-Fetch-Signature'];
      delete adResponse.headers[AMP_SIGNATURE_HEADER];
      // If rendering type is safeframe, we SHOULD attach a SafeFrame.
      adResponse.headers[RENDERING_TYPE_HEADER] = 'safeframe';
      a4a.buildCallback();
      const lifecycleEventStub =
          sandbox.stub(a4a, 'maybeTriggerAnalyticsEvent_');
      a4a.onLayoutMeasure();
      return a4a.layoutCallback().then(() => {
        const child = a4aElement.querySelector('iframe[name]');
        expect(child).to.be.ok;
        expect(child).to.be.visible;
        expect(onCreativeRenderSpy.withArgs(null)).to.be.called;
        expect(lifecycleEventStub).to.be.calledWith('renderSafeFrameStart');
      });
    });

    it('for ios defaults to SafeFrame rendering', () => {
      const platform = Services.platformFor(fixture.win);
      sandbox.stub(platform, 'isIos').returns(true);
      a4a = new MockA4AImpl(a4aElement);
      // Make sure there's no signature, so that we go down the 3p iframe path.
      delete adResponse.headers['AMP-Fast-Fetch-Signature'];
      delete adResponse.headers[AMP_SIGNATURE_HEADER];
      // Ensure no rendering type header (ios on safari will default to
      // safeframe).
      delete adResponse.headers[RENDERING_TYPE_HEADER];
      fixture.doc.body.appendChild(a4aElement);
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      return a4a.layoutCallback().then(() => {
        const child = a4aElement.querySelector('iframe[name]');
        expect(child).to.be.ok;
        expect(child).to.be.visible;
        expect(onCreativeRenderSpy.withArgs(null)).to.be.called;
      });
    });

    it('for cached content iframe rendering case', () => {
      // Make sure there's no signature, so that we go down the 3p iframe path.
      delete adResponse.headers['AMP-Fast-Fetch-Signature'];
      delete adResponse.headers[AMP_SIGNATURE_HEADER];
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      return a4a.layoutCallback().then(() => {
        const child = a4aElement.querySelector('iframe[src]');
        expect(child).to.be.ok;
        expect(child).to.be.visible;
        expect(onCreativeRenderSpy.withArgs(null)).to.be.called;
      });
    });

    it('populates postAdResponseExperimentFeatures', () => {
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      return a4a.layoutCallback().then(() => {
        const child = a4aElement.querySelector('iframe[srcdoc]');
        expect(child).to.be.ok;
        expect(child.srcdoc.indexOf('meta http-equiv=Content-Security-Policy'))
            .to.not.equal(-1);
      });
    });

    it('for A4A friendly iframe rendering case', () => {
      expect(a4a.friendlyIframeEmbed_).to.not.exist;
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      return a4a.layoutCallback().then(() => {
        const child = a4aElement.querySelector('iframe[srcdoc]');
        expect(child).to.be.ok;
        expect(child).to.be.visible;
        const a4aBody = child.contentDocument.body;
        expect(a4aBody).to.be.ok;
        expect(a4aBody).to.be.visible;
        expect(a4a.friendlyIframeEmbed_).to.exist;
      });
    });

    it('detachedCallback should destroy FIE and detach frame', () => {
      const fieDestroySpy =
          sandbox./*OK*/spy(FriendlyIframeEmbed.prototype, 'destroy');
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      return a4a.layoutCallback().then(() => {
        a4a.detachedCallback();
        expect(fieDestroySpy).to.be.called;
        expect(a4aElement.querySelector('iframe')).to.not.be.ok;
      });
    });

    it('for A4A layout should resolve once FIE is created', () => {
      a4a.buildCallback();
      a4a.onLayoutMeasure();

      // Never resolve
      sandbox./*OK*/stub(FriendlyIframeEmbed.prototype,'whenIniLoaded')
          .callsFake(() => {return new Promise(() => {});});
      const creativeString = buildCreativeString();
      const metaData = a4a.getAmpAdMetadata(creativeString);
      return a4a.renderAmpCreative_(metaData).then(() => {
        expect(a4a.friendlyIframeEmbed_).to.exist;
        expect(a4a.friendlyIframeEmbed_.host).to.equal(a4a.element);
      });
    });

    it('should fire amp-analytics triggers for lifecycle events', () => {
      let iniLoadResolver;
      const iniLoadPromise = new Promise(resolve => {
        iniLoadResolver = resolve;
      });
      const whenIniLoadedStub = sandbox.stub(
          FriendlyIframeEmbed.prototype,
          'whenIniLoaded').callsFake(
          () => iniLoadPromise);
      a4a.buildCallback();
      const triggerAnalyticsEventSpy =
          sandbox.spy(analytics, 'triggerAnalyticsEvent');
      a4a.onLayoutMeasure();
      const layoutPromise = a4a.layoutCallback();
      expect(whenIniLoadedStub).to.not.be.called;
      iniLoadResolver();
      layoutPromise.then(() => {
        verifyA4aAnalyticsTriggersWereFired(a4a, triggerAnalyticsEventSpy);
      });
    });

    it('should update embed visibility', () => {
      sandbox.stub(a4a, 'isInViewport').callsFake(() => false);
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      return a4a.layoutCallback().then(() => {
        expect(a4a.friendlyIframeEmbed_).to.exist;
        expect(a4a.friendlyIframeEmbed_.isVisible()).to.be.false;

        a4a.viewportCallback(true);
        expect(a4a.friendlyIframeEmbed_.isVisible()).to.be.true;

        a4a.viewportCallback(false);
        expect(a4a.friendlyIframeEmbed_.isVisible()).to.be.false;

        a4a.viewportCallback(true);
        expect(a4a.friendlyIframeEmbed_.isVisible()).to.be.true;
      });
    });

    it('for requests from insecure HTTP pages', () => {
      sandbox.stub(Services.cryptoFor(fixture.win), 'isPkcsAvailable')
          .returns(false);
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      return a4a.layoutCallback().then(() => {
        const child = a4aElement.querySelector('iframe[src]');
        expect(child).to.be.ok;
        expect(child).to.be.visible;
        expect(onCreativeRenderSpy.withArgs(null)).to.be.called;
      });
    });

    it('should fire amp-analytics triggers', () => {
      const triggerAnalyticsEventSpy =
          sandbox.spy(analytics, 'triggerAnalyticsEvent');
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      sandbox./*OK*/stub(FriendlyIframeEmbed.prototype, 'whenIniLoaded')
          .callsFake(() => Promise.resolve());
      return a4a.layoutCallback().then(() => {
        verifyA4aAnalyticsTriggersWereFired(a4a, triggerAnalyticsEventSpy);
      });
    });

    it('should not fire amp-analytics triggers without config', () => {
      sandbox.stub(MockA4AImpl.prototype, 'getA4aAnalyticsConfig').callsFake(
          () => null);
      a4a = new MockA4AImpl(a4aElement);
      const triggerAnalyticsEventSpy =
          sandbox.spy(analytics, 'triggerAnalyticsEvent');
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      return a4a.layoutCallback().then(() => {
        expect(triggerAnalyticsEventSpy).to.not.be.called;
      });
    });

    it('should insert an amp-analytics element', () => {
      sandbox.stub(MockA4AImpl.prototype, 'getA4aAnalyticsConfig').callsFake(
          () => ({'foo': 'bar'}));
      a4a = new MockA4AImpl(a4aElement);
      const insertAnalyticsElementSpy =
          sandbox.spy(analyticsExtension, 'insertAnalyticsElement');
      a4a.buildCallback();
      expect(insertAnalyticsElementSpy).to.be.calledWith(
          a4a.element, {'foo': 'bar'}, true /* loadAnalytics */);
    });

    it('should not insert an amp-analytics element if config is null', () => {
      sandbox.stub(MockA4AImpl.prototype, 'getA4aAnalyticsConfig').callsFake(
          () => null);
      a4a = new MockA4AImpl(a4aElement);
      const insertAnalyticsElementSpy =
          sandbox.spy(analyticsExtension, 'insertAnalyticsElement');
      a4a.buildCallback();
      expect(insertAnalyticsElementSpy).not.to.be.called;
    });
  });

  describe('layoutCallback cancels properly', () => {
    let a4aElement;
    let a4a;
    let fixture;
    beforeEach(() => createIframePromise().then(f => {
      fixture = f;
      setupForAdTesting(fixture);
      fetchMock.getOnce(
          TEST_URL + '&__amp_source_origin=about%3Asrcdoc', () => adResponse,
          {name: 'ad'});
      a4aElement = createA4aElement(fixture.doc);
      a4a = new MockA4AImpl(a4aElement);
      return fixture;
    }));

    it('when unlayoutCallback called after adPromise', () => {
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      let promiseResolver;
      a4a.adPromise_ = new Promise(resolver => {
        promiseResolver = resolver;
      });
      const layoutCallbackPromise = a4a.layoutCallback();
      a4a.unlayoutCallback();
      const renderNonAmpCreativeSpy = sandbox.spy(
          AmpA4A.prototype, 'renderNonAmpCreative');
      promiseResolver();
      layoutCallbackPromise.then(() => {
        // We should never get in here.
        expect(false).to.be.true;
      }).catch(err => {
        expect(renderNonAmpCreativeSpy).to.not.be.called;
        expect(err).to.be.ok;
        expect(err.message).to.equal('CANCELLED');
      });
    });

    it('when unlayoutCallback called before renderAmpCreative_', () => {
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      let promiseResolver;
      a4a.renderAmpCreative_ = new Promise(resolver => {
        promiseResolver = resolver;
      });
      const layoutCallbackPromise = a4a.layoutCallback();
      a4a.unlayoutCallback();

      promiseResolver();
      layoutCallbackPromise.then(() => {
        // We should never get in here.
        expect(false).to.be.true;
      }).catch(err => {
        expect(err).to.be.ok;
        expect(err.message).to.equal('CANCELLED');
      });
    });
  });

  describe('cross-domain rendering', () => {
    let a4aElement;
    let a4a;
    beforeEach(() => {
      // Make sure there's no signature, so that we go down the 3p iframe path.
      delete adResponse.headers['AMP-Fast-Fetch-Signature'];
      delete adResponse.headers[AMP_SIGNATURE_HEADER];
      // If rendering type is safeframe, we SHOULD attach a SafeFrame.
      adResponse.headers[RENDERING_TYPE_HEADER] = 'safeframe';
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        fetchMock.getOnce(
            TEST_URL + '&__amp_source_origin=about%3Asrcdoc', () => adResponse,
            {name: 'ad'});
        const {doc} = fixture;
        a4aElement = createA4aElement(doc);
        a4a = new MockA4AImpl(a4aElement);
        a4a.releaseType_ = '0';
        a4a.createdCallback();
        a4a.firstAttachedCallback();
        a4a.buildCallback();
        expect(onCreativeRenderSpy).to.not.be.called;
      });
    });

    describe('#renderViaIframeGet', () => {
      beforeEach(() => {
        // Verify client cache iframe rendering.
        adResponse.headers[RENDERING_TYPE_HEADER] = 'client_cache';
        a4a.onLayoutMeasure();
      });

      it('should attach a client cached iframe when set', () => {
        return a4a.layoutCallback().then(() => {
          verifyCachedContentIframeRender(a4aElement, TEST_URL);
          expect(fetchMock.called('ad')).to.be.true;
        });
      });

      it('should apply sandbox when sandboxHTMLCreativeFrame is true', () => {
        a4a.sandboxHTMLCreativeFrame = () => true;
        a4a.onLayoutMeasure();
        return a4a.layoutCallback().then(() => {
          verifyCachedContentIframeRender(a4aElement, TEST_URL,
              true /* shouldSandbox */);
          expect(fetchMock.called('ad')).to.be.true;
        });
      });

      it('should not apply sandbox when sandboxHTMLCreativeFrame false', () => {
        a4a.sandboxHTMLCreativeFrame = () => false;
        a4a.onLayoutMeasure();
        return a4a.layoutCallback().then(() => {
          verifyCachedContentIframeRender(a4aElement, TEST_URL,
              false /* shouldSandbox */);
          expect(fetchMock.called('ad')).to.be.true;
        });
      });

      it('shouldn\'t set feature policy for sync-xhr with exp off-a4a', () => {
        a4a.sandboxHTMLCreativeFrame = () => true;
        a4a.onLayoutMeasure();
        return a4a.layoutCallback().then(() => {
          verifyCachedContentIframeRender(a4aElement, TEST_URL, true);
          expect(a4a.iframe.getAttribute('allow')).to.not.match(/sync-xhr/);
        });
      });

      it('should set feature policy for sync-xhr with exp on-a4a', () => {
        a4a.sandboxHTMLCreativeFrame = () => true;
        toggleExperiment(a4a.win, 'no-sync-xhr-in-ads', true);
        a4a.onLayoutMeasure();
        return a4a.layoutCallback().then(() => {
          verifyCachedContentIframeRender(a4aElement, TEST_URL, true);
          expect(a4a.iframe.getAttribute('allow'))
              .to.equal('sync-xhr \'none\';');
        });
      });
    });

    describe('illegal render mode value', () => {
      let devErrLogStub;
      beforeEach(() => {
        devErrLogStub = sandbox.stub(dev(), 'error');
        // If rendering type is unknown, should fall back to cached content
        // iframe and generate an error.
        adResponse.headers[RENDERING_TYPE_HEADER] = 'random illegal value';
        a4a.onLayoutMeasure();
      });

      it('should render via cached iframe', () => {
        const triggerAnalyticsEventSpy =
            sandbox.spy(analytics, 'triggerAnalyticsEvent');
        return a4a.layoutCallback().then(() => {
          verifyCachedContentIframeRender(a4aElement, TEST_URL);
          // Should have reported an error.
          expect(devErrLogStub).to.be.calledOnce;
          expect(devErrLogStub.getCall(0).args[1]).to.have.string(
              'random illegal value');
          expect(fetchMock.called('ad')).to.be.true;
          verifyA4aAnalyticsTriggersWereFired(
              a4a, triggerAnalyticsEventSpy, 'ad-iframe-loaded');
        });
      });

      it('should fire amp-analytics triggers for illegal render modes', () => {
        const triggerAnalyticsEventSpy =
            sandbox.spy(analytics, 'triggerAnalyticsEvent');
        return a4a.layoutCallback().then(() =>
          verifyA4aAnalyticsTriggersWereFired(
              a4a, triggerAnalyticsEventSpy, 'ad-iframe-loaded'));
      });
    });

    describe('#renderViaNameFrame', () => {
      beforeEach(() => {
        // If rendering type is nameframe, we SHOULD attach a NameFrame.
        adResponse.headers[RENDERING_TYPE_HEADER] = 'nameframe';
        a4a.onLayoutMeasure();
      });

      it('should attach a NameFrame when header is set', () => {
        return a4a.layoutCallback().then(() => {
          verifyNameFrameRender(a4aElement);
          expect(fetchMock.called('ad')).to.be.true;
        });
      });

      it('should make only one NameFrame even if onLayoutMeasure called ' +
          'multiple times', () => {
        a4a.onLayoutMeasure();
        a4a.onLayoutMeasure();
        a4a.onLayoutMeasure();
        a4a.onLayoutMeasure();
        return a4a.layoutCallback().then(() => {
          verifyNameFrameRender(a4aElement);
          expect(fetchMock.called('ad')).to.be.true;
        });
      });

      it('should apply sandbox when sandboxHTMLCreativeFrame is true', () => {
        a4a.sandboxHTMLCreativeFrame = () => true;
        a4a.onLayoutMeasure();
        return a4a.layoutCallback().then(() => {
          verifyNameFrameRender(a4aElement, true /* shouldSandbox */);
          expect(fetchMock.called('ad')).to.be.true;
        });
      });

      it('should not apply sandbox when sandboxHTMLCreativeFrame false', () => {
        a4a.sandboxHTMLCreativeFrame = () => false;
        a4a.onLayoutMeasure();
        return a4a.layoutCallback().then(() => {
          verifyNameFrameRender(a4aElement, false /* shouldSandbox */);
          expect(fetchMock.called('ad')).to.be.true;
        });
      });

      ['', 'client_cache', 'safeframe', 'some_random_thing'].forEach(
          headerVal => {
            it(`should not attach a NameFrame when header is ${headerVal}`,
                () => {
                  const devStub = sandbox.stub(dev(), 'error');
                  // Make sure there's no signature, so that we go down the 3p
                  // iframe path.
                  delete adResponse.headers['AMP-Fast-Fetch-Signature'];
                  delete adResponse.headers[AMP_SIGNATURE_HEADER];
                  // If rendering type is anything but nameframe, we SHOULD NOT
                  // attach a NameFrame.
                  adResponse.headers[RENDERING_TYPE_HEADER] = headerVal;
                  a4a.onLayoutMeasure();
                  return a4a.layoutCallback().then(() => {
                    if (headerVal == 'some_random_thing') {
                      expect(devStub.withArgs('AMP-A4A',
                          `cross-origin render mode header ${headerVal}`))
                          .to.be.calledOnce;
                    } else {
                      expect(devStub).to.not.be.called;
                    }
                    const nameChild = a4aElement.querySelector(
                        'iframe[src^="nameframe"]');
                    expect(nameChild).to.not.be.ok;
                    if (headerVal != 'safeframe') {
                      const unsafeChild = a4aElement.querySelector('iframe');
                      expect(unsafeChild).to.be.ok;
                      expect(unsafeChild.getAttribute('src')).to.have.string(
                          TEST_URL);
                    }
                    expect(fetchMock.called('ad')).to.be.true;
                  });
                });
          });

      it('should fire amp-analytics triggers for lifecycle stages', () => {
        const triggerAnalyticsEventSpy =
            sandbox.spy(analytics, 'triggerAnalyticsEvent');
        return a4a.layoutCallback().then(() =>
          verifyA4aAnalyticsTriggersWereFired(
              a4a, triggerAnalyticsEventSpy, 'ad-iframe-loaded'));
      });
    });

    describe('#renderViaSafeFrame', () => {
      beforeEach(() => {
        // If rendering type is safeframe, we SHOULD attach a SafeFrame.
        adResponse.headers[RENDERING_TYPE_HEADER] = 'safeframe';
        a4a.onLayoutMeasure();
      });

      it('should attach a SafeFrame when header is set', () => {
        return a4a.layoutCallback().then(() => {
          verifySafeFrameRender(a4aElement, DEFAULT_SAFEFRAME_VERSION);
          expect(fetchMock.called('ad')).to.be.true;
        });
      });

      it('should use safeframe version header value', () => {
        a4a.safeframeVersion = '1-2-3';
        return a4a.layoutCallback().then(() => {
          verifySafeFrameRender(a4aElement, '1-2-3');
          expect(fetchMock.called('ad')).to.be.true;
        });
      });

      it('should make only one SafeFrame even if onLayoutMeasure called ' +
          'multiple times', () => {
        a4a.onLayoutMeasure();
        a4a.onLayoutMeasure();
        a4a.onLayoutMeasure();
        a4a.onLayoutMeasure();
        return a4a.layoutCallback().then(() => {
          verifySafeFrameRender(a4aElement, DEFAULT_SAFEFRAME_VERSION);
          expect(fetchMock.called('ad')).to.be.true;
        });
      });

      it('should apply sandbox when sandboxHTMLCreativeFrame is true', () => {
        a4a.sandboxHTMLCreativeFrame = () => true;
        a4a.onLayoutMeasure();
        return a4a.layoutCallback().then(() => {
          verifySafeFrameRender(a4aElement, DEFAULT_SAFEFRAME_VERSION,
              true /* shouldSandbox */);
          expect(fetchMock.called('ad')).to.be.true;
        });
      });

      it('should not apply sandbox when sandboxHTMLCreativeFrame false', () => {
        a4a.sandboxHTMLCreativeFrame = () => false;
        a4a.onLayoutMeasure();
        return a4a.layoutCallback().then(() => {
          verifySafeFrameRender(a4aElement, DEFAULT_SAFEFRAME_VERSION,
              false /* shouldSandbox */);
          expect(fetchMock.called('ad')).to.be.true;
        });
      });

      ['', 'client_cache', 'nameframe', 'some_random_thing'].forEach(
          headerVal => {
            it(`should not attach a SafeFrame when header is ${headerVal}`,
                () => {
                  const devStub = sandbox.stub(dev(), 'error');
                  // If rendering type is anything but safeframe, we SHOULD NOT
                  // attach a SafeFrame.
                  adResponse.headers[RENDERING_TYPE_HEADER] = headerVal;
                  a4a.onLayoutMeasure();
                  return a4a.layoutCallback().then(() => {
                    if (headerVal == 'some_random_thing') {
                      expect(devStub.withArgs('AMP-A4A',
                          `cross-origin render mode header ${headerVal}`))
                          .to.be.calledOnce;
                    } else {
                      expect(devStub).to.not.be.called;
                    }
                    const safeframeUrl = 'https://tpc.googlesyndication.com/safeframe/' +
                      DEFAULT_SAFEFRAME_VERSION + '/html/container.html';
                    const safeChild = a4aElement.querySelector(
                        `iframe[src^="${safeframeUrl}"]`);
                    expect(safeChild).to.not.be.ok;
                    if (headerVal != 'nameframe') {
                      const unsafeChild = a4aElement.querySelector('iframe');
                      expect(unsafeChild).to.be.ok;
                      expect(unsafeChild.getAttribute('src')).to.have.string(
                          TEST_URL);
                    }
                    expect(fetchMock.called('ad')).to.be.true;
                  });
                });
          });

      it('should reset state to null on unlayoutCallback', () => {
        return a4a.layoutCallback().then(() => {
          expect(a4a.experimentalNonAmpCreativeRenderMethod_)
              .to.equal('safeframe');
          a4a.unlayoutCallback();
          expect(a4a.experimentalNonAmpCreativeRenderMethod_).to.be.null;
          expect(fetchMock.called('ad')).to.be.true;
        });
      });

      it('should fire amp-analytics triggers for lifecycle stages', () => {
        const triggerAnalyticsEventSpy =
            sandbox.spy(analytics, 'triggerAnalyticsEvent');
        return a4a.layoutCallback().then(() =>
          verifyA4aAnalyticsTriggersWereFired(
              a4a, triggerAnalyticsEventSpy, 'ad-iframe-loaded'));
      });
    });
  });

  describe('cross-domain vs A4A', () => {
    let a4a;
    let a4aElement;
    beforeEach(() => createIframePromise().then(fixture => {
      setupForAdTesting(fixture);
      fetchMock.getOnce(
          TEST_URL + '&__amp_source_origin=about%3Asrcdoc', () => adResponse,
          {name: 'ad'});
      const {doc} = fixture;
      a4aElement = createA4aElement(doc);
      a4a = new MockA4AImpl(a4aElement);
    }));
    afterEach(() => {
      expect(fetchMock.called('ad')).to.be.true;
    });

    ['nameframe', 'safeframe'].forEach(renderType => {
      it(`should not use ${renderType} if creative is A4A`, () => {
        adResponse.headers[RENDERING_TYPE_HEADER] = renderType;
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        return a4a.layoutCallback().then(() => {
          verifyA4ARender(a4aElement);
        });
      });

      it(`should not use ${renderType} even if onLayoutMeasure called ` +
          'multiple times', () => {
        adResponse.headers[RENDERING_TYPE_HEADER] = renderType;
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        a4a.onLayoutMeasure();
        a4a.onLayoutMeasure();
        a4a.onLayoutMeasure();
        return a4a.layoutCallback().then(() => {
          const safeChild = a4aElement.querySelector('iframe[name]');
          expect(safeChild).to.not.be.ok;
          const crossDomainChild = a4aElement.querySelector('iframe[src]');
          expect(crossDomainChild).to.not.be.ok;
          const friendlyChild = a4aElement.querySelector('iframe[srcdoc]');
          expect(friendlyChild).to.be.ok;
          expect(friendlyChild.getAttribute('srcdoc')).to.have.string(
              '<html ⚡4ads>');
        });
      });
    });
  });

  it('should set height/width on iframe matching header value', () => {
    // Make sure there's no signature, so that we go down the 3p iframe path.
    delete adResponse.headers['AMP-Fast-Fetch-Signature'];
    delete adResponse.headers[AMP_SIGNATURE_HEADER];
    adResponse.headers['X-CreativeSize'] = '320x50';
    return createIframePromise().then(fixture => {
      setupForAdTesting(fixture);
      fetchMock.getOnce(
          TEST_URL + '&__amp_source_origin=about%3Asrcdoc', () => adResponse,
          {name: 'ad'});
      const {doc} = fixture;
      const a4aElement = createA4aElement(doc);
      a4aElement.setAttribute('width', 480);
      a4aElement.setAttribute('height', 75);
      a4aElement.setAttribute('type', 'doubleclick');
      const a4a = new MockA4AImpl(a4aElement);
      doc.body.appendChild(a4aElement);
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      const renderPromise = a4a.layoutCallback();
      return renderPromise.then(() => {
        const child = a4aElement.querySelector('iframe[name]');
        expect(child).to.be.ok;
        expect(child.getAttribute('width')).to.equal('320');
        expect(child.getAttribute('height')).to.equal('50');
      });
    });
  });

  describe('#onLayoutMeasure', () => {
    it('resumeCallback calls onLayoutMeasure', () => {
      // Force non-FIE
      delete adResponse.headers['AMP-Fast-Fetch-Signature'];
      delete adResponse.headers[AMP_SIGNATURE_HEADER];
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        fetchMock.getOnce(
            TEST_URL + '&__amp_source_origin=about%3Asrcdoc', () => adResponse,
            {name: 'ad'});
        const {doc} = fixture;
        const a4aElement = createA4aElement(doc);
        const s = doc.createElement('style');
        s.textContent = '.fixed {position:fixed;}';
        doc.head.appendChild(s);
        const a4a = new MockA4AImpl(a4aElement);
        const renderNonAmpCreativeSpy =
          sandbox.spy(a4a, 'renderNonAmpCreative');
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.be.ok;
        return a4a.layoutCallback().then(() => {
          expect(renderNonAmpCreativeSpy.calledOnce,
              'renderNonAmpCreative called exactly once').to.be.true;
          a4a.unlayoutCallback();
          getResourceStub.returns({
            'hasBeenMeasured': () => true,
            'isMeasureRequested': () => false});
          const onLayoutMeasureSpy = sandbox.spy(a4a, 'onLayoutMeasure');
          a4a.resumeCallback();
          expect(onLayoutMeasureSpy).to.be.calledOnce;
          expect(a4a.fromResumeCallback).to.be.true;
        });
      });
    });
    it('resumeCallback does not call onLayoutMeasure for FIE', () => {
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        fetchMock.getOnce(
            TEST_URL + '&__amp_source_origin=about%3Asrcdoc', () => adResponse,
            {name: 'ad'});
        const {doc} = fixture;
        const a4aElement = createA4aElement(doc);
        const s = doc.createElement('style');
        s.textContent = '.fixed {position:fixed;}';
        doc.head.appendChild(s);
        const a4a = new MockA4AImpl(a4aElement);
        const renderAmpCreativeSpy = sandbox.spy(a4a, 'renderAmpCreative_');
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.be.ok;
        return a4a.layoutCallback().then(() => {
          expect(renderAmpCreativeSpy.calledOnce,
              'renderAmpCreative_ called exactly once').to.be.true;
          sandbox.stub(a4a, 'unlayoutCallback').callsFake(() => false);
          const onLayoutMeasureSpy = sandbox.spy(a4a, 'onLayoutMeasure');
          a4a.resumeCallback();
          expect(onLayoutMeasureSpy).to.not.be.called;
          expect(a4a.fromResumeCallback).to.be.false;
        });
      });
    });
    it('resumeCallback w/ measure required no onLayoutMeasure', () => {
      // Force non-FIE
      delete adResponse.headers['AMP-Fast-Fetch-Signature'];
      delete adResponse.headers[AMP_SIGNATURE_HEADER];
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        fetchMock.getOnce(
            TEST_URL + '&__amp_source_origin=about%3Asrcdoc', () => adResponse,
            {name: 'ad'});
        const {doc} = fixture;
        const a4aElement = createA4aElement(doc);
        const s = doc.createElement('style');
        s.textContent = '.fixed {position:fixed;}';
        doc.head.appendChild(s);
        const a4a = new MockA4AImpl(a4aElement);
        const renderNonAmpCreativeSpy =
          sandbox.spy(a4a, 'renderNonAmpCreative');
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.be.ok;
        return a4a.layoutCallback().then(() => {
          expect(renderNonAmpCreativeSpy.calledOnce,
              'renderNonAmpCreative called exactly once').to.be.true;
          a4a.unlayoutCallback();
          const onLayoutMeasureSpy = sandbox.spy(a4a, 'onLayoutMeasure');
          getResourceStub.returns({'hasBeenMeasured': () => false});
          a4a.resumeCallback();
          expect(onLayoutMeasureSpy).to.not.be.called;
          expect(a4a.fromResumeCallback).to.be.true;
        });
      });
    });
    it('should run end-to-end and render in friendly iframe', () => {
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        fetchMock.getOnce(
            TEST_URL + '&__amp_source_origin=about%3Asrcdoc', () => adResponse,
            {name: 'ad'});
        const {doc} = fixture;
        const a4aElement = createA4aElement(doc);
        const a4a = new MockA4AImpl(a4aElement);
        a4a.releaseType_ = '0';
        const getAdUrlSpy = sandbox.spy(a4a, 'getAdUrl');
        const rtcResponse = Promise.resolve(
            [{response: 'a', rtcTime: 1, callout: 'https://a.com'}]);
        const maybeExecuteRealTimeConfigStub = sandbox.stub().returns(
            rtcResponse);
        AMP.RealTimeConfigManager = RealTimeConfigManager;
        sandbox.stub(AMP.RealTimeConfigManager.prototype,
            'maybeExecuteRealTimeConfig').callsFake(
            maybeExecuteRealTimeConfigStub);
        const tryExecuteRealTimeConfigSpy =
              sandbox.spy(a4a, 'tryExecuteRealTimeConfig_');
        const updateLayoutPriorityStub = sandbox.stub(
            a4a, 'updateLayoutPriority');
        const renderAmpCreativeSpy = sandbox.spy(a4a, 'renderAmpCreative_');
        const preloadExtensionSpy =
            sandbox.spy(Extensions.prototype, 'preloadExtension');
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.be.instanceof(Promise);
        return a4a.adPromise_.then(promiseResult => {
          expect(promiseResult).to.be.ok;
          expect(promiseResult.minifiedCreative).to.be.ok;
          expect(a4a.isVerifiedAmpCreative()).to.be.true;
          expect(tryExecuteRealTimeConfigSpy.calledOnce).to.be.true;
          expect(maybeExecuteRealTimeConfigStub.calledOnce).to.be.true;
          expect(maybeExecuteRealTimeConfigStub.calledWith(
              {}, null)).to.be.true;
          expect(getAdUrlSpy.calledOnce, 'getAdUrl called exactly once')
              .to.be.true;
          expect(getAdUrlSpy.calledWith(null, rtcResponse)).to.be.true;
          expect(fetchMock.called('ad')).to.be.true;
          expect(preloadExtensionSpy.withArgs('amp-font')).to.be.calledOnce;
          expect(doc.querySelector('link[rel=preload]' +
            '[href="https://fonts.googleapis.com/css?family=Questrial"]'))
              .to.be.ok;
          return a4a.layoutCallback().then(() => {
            expect(renderAmpCreativeSpy.calledOnce,
                'renderAmpCreative_ called exactly once').to.be.true;
            expect(a4aElement.getElementsByTagName('iframe').length)
                .to.equal(1);
            const friendlyIframe = a4aElement.querySelector('iframe[srcdoc]');
            expect(friendlyIframe).to.not.be.null;
            expect(friendlyIframe.getAttribute('src')).to.be.null;
            const expectedAttributes = {
              'frameborder': '0', 'allowfullscreen': '',
              'allowtransparency': '', 'scrolling': 'no'};
            Object.keys(expectedAttributes).forEach(key => {
              expect(friendlyIframe.getAttribute(key)).to.equal(
                  expectedAttributes[key]);
            });
            // Should not contain v0.js, any extensions, or amp-boilerplate.
            const iframeDoc = friendlyIframe.contentDocument;
            expect(iframeDoc.querySelector('script[src]')).to.not.be.ok;
            expect(iframeDoc.querySelector('script[custom-element]'))
                .to.not.be.ok;
            expect(iframeDoc.querySelector('style[amp-boilerplate]'))
                .to.not.be.ok;
            expect(iframeDoc.querySelector('noscript')).to.not.be.ok;
            // Should contain font link and extension in main document.
            expect(iframeDoc.querySelector(
                'link[href="https://fonts.googleapis.com/css?family=Questrial"]'))
                .to.be.ok;
            expect(doc.querySelector('script[src*="amp-font-0.1"]')).to.be.ok;
            expect(onCreativeRenderSpy.withArgs(sinon.match.object))
                .to.be.calledOnce;
            expect(updateLayoutPriorityStub).to.be.calledOnce;
            expect(updateLayoutPriorityStub.args[0][0]).to.equal(
                LayoutPriority.CONTENT);
          });
        });
      });
    });
    it('should update priority for non AMP if in experiment', () => {
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        delete adResponse.headers['AMP-Fast-Fetch-Signature'];
        delete adResponse.headers[AMP_SIGNATURE_HEADER];
        adResponse.headers[EXPERIMENT_FEATURE_HEADER_NAME] =
            'pref_neutral_enabled=1,';
        adResponse.headers[CREATIVE_SIZE_HEADER] = '123x456';
        fetchMock.getOnce(
            TEST_URL + '&__amp_source_origin=about%3Asrcdoc', () => adResponse,
            {name: 'ad'});
        const element = createA4aElement(fixture.doc);
        element.setAttribute('type', 'adsense');
        const a4a = new MockA4AImpl(element);
        const updateLayoutPriorityStub = sandbox.stub(
            a4a, 'updateLayoutPriority');
        const renderNonAmpCreativeSpy =
          sandbox.spy(a4a, 'renderNonAmpCreative');
        sandbox.stub(a4a, 'maybeValidateAmpCreative').returns(
            Promise.resolve());
        a4a.onLayoutMeasure();
        return a4a.layoutCallback().then(() => {
          expect(renderNonAmpCreativeSpy.calledOnce,
              'renderNonAmpCreative_ called exactly once').to.be.true;
          expect(updateLayoutPriorityStub.args[0][0]).to.equal(
              LayoutPriority.CONTENT);
          expect(is3pThrottled(a4a.win)).to.be.false;
        });
      });
    });
    // TODO (keithwrightbos) - move into above e2e once signed creative with
    // image within creative can be regenerated.
    it('should prefetch amp images', () => {
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        fetchMock.getOnce(
            TEST_URL + '&__amp_source_origin=about%3Asrcdoc', () => adResponse,
            {name: 'ad'});
        const {doc} = fixture;
        const a4aElement = createA4aElement(doc);
        const a4a = new MockA4AImpl(a4aElement);
        sandbox.stub(a4a, 'getAmpAdMetadata').callsFake(creative => {
          const metaData = AmpA4A.prototype.getAmpAdMetadata.call(a4a,
              creative);
          metaData.images = [
            'https://prefetch.me.com?a=b',
            'http://do.not.prefetch.me.com?c=d',
            'https://prefetch.metoo.com?e=f',
          ];
          return metaData;
        });
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        return a4a.layoutCallback().then(() => {
          expect(doc.querySelector('link[rel=preload]' +
            '[href="https://prefetch.me.com?a=b"]')).to.be.ok;
          expect(doc.querySelector('link[rel=preload]' +
            '[href="https://prefetch.metoo.com?e=f"]')).to.be.ok;
          expect(doc.querySelector('link[rel=preload]' +
            '[href="http://do.not.prefetch.me.com?c=d"]')).to.not.be.ok;
        });
      });
    });
    it('must not be position:fixed', () => {
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        fetchMock.getOnce(
            TEST_URL + '&__amp_source_origin=about%3Asrcdoc', () => adResponse,
            {name: 'ad'});
        const {doc} = fixture;
        const a4aElement = createA4aElement(doc);
        const s = doc.createElement('style');
        s.textContent = '.fixed {position:fixed;}';
        doc.head.appendChild(s);
        a4aElement.className = 'fixed';
        const a4a = new MockA4AImpl(a4aElement);
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.not.be.ok;
      });
    });
    it('does not initialize promise chain 0 height/width', () => {
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        fetchMock.getOnce(
            TEST_URL + '&__amp_source_origin=about%3Asrcdoc', () => adResponse,
            {name: 'ad'});
        const {doc} = fixture;
        const rect = layoutRectLtwh(0, 0, 200, 0);
        const a4aElement = createA4aElement(doc, rect);
        const a4a = new MockA4AImpl(a4aElement);
        // test 0 height
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.not.be.ok;
        // test 0 width
        rect.height = 50;
        rect.width = 0;
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.not.be.ok;
        // test with non-zero height/width
        rect.width = 200;
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.be.ok;
      });
    });

    /**
     * @param {boolean} isValidCreative
     * @param {boolean} opt_failAmpRender
     */
    function executeLayoutCallbackTest(isValidCreative, opt_failAmpRender) {
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        fetchMock.getOnce(
            TEST_URL + '&__amp_source_origin=about%3Asrcdoc', () => adResponse,
            {name: 'ad'});
        const {doc} = fixture;
        const a4aElement = createA4aElement(doc);
        const a4a = new MockA4AImpl(a4aElement);
        const getAdUrlSpy = sandbox.spy(a4a, 'getAdUrl');
        const updateLayoutPriorityStub = sandbox.stub(
            a4a, 'updateLayoutPriority');
        if (!isValidCreative) {
          delete adResponse.headers['AMP-Fast-Fetch-Signature'];
          delete adResponse.headers[AMP_SIGNATURE_HEADER];
        }
        a4a.promiseErrorHandler_ = () => {};
        if (opt_failAmpRender) {
          sandbox.stub(a4a, 'renderAmpCreative_').returns(
              Promise.reject('amp render failure'));
        }
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.be.instanceof(Promise);
        return a4a.adPromise_.then(promiseResult => {
          expect(getAdUrlSpy.calledOnce, 'getAdUrl called exactly once')
              .to.be.true;
          expect(fetchMock.called('ad')).to.be.true;
          expect(a4a.isVerifiedAmpCreative()).to.equal(isValidCreative);
          if (isValidCreative) {
            expect(promiseResult).to.be.ok;
            expect(promiseResult.minifiedCreative).to.be.ok;
          } else {
            expect(promiseResult).to.not.be.ok;
          }
          return a4a.layoutCallback().then(() => {
            expect(a4aElement.getElementsByTagName('iframe').length)
                .to.not.equal(0);
            const iframe = a4aElement.getElementsByTagName('iframe')[0];
            if (isValidCreative && !opt_failAmpRender) {
              expect(iframe.getAttribute('src')).to.be.null;
              expect(onCreativeRenderSpy.withArgs(sinon.match.object))
                  .to.be.calledOnce;
              expect(updateLayoutPriorityStub).to.be.calledOnce;
              expect(updateLayoutPriorityStub.args[0][0]).to.equal(
                  LayoutPriority.CONTENT);
            } else {
              expect(iframe.getAttribute('srcdoc')).to.be.null;
              expect(iframe.src, 'verify iframe src w/ origin').to
                  .equal(TEST_URL +
                         '&__amp_source_origin=about%3Asrcdoc');
              expect(onCreativeRenderSpy.withArgs(null)).to.be.called;
              if (!opt_failAmpRender) {
                expect(updateLayoutPriorityStub).to.not.be.called;
              }
            }
          });
        });
      });
    }
    it('#layoutCallback valid AMP', () => {
      return executeLayoutCallbackTest(true);
    });
    it('#layoutCallback not valid AMP', () => {
      return executeLayoutCallbackTest(false);
    });
    it('#layoutCallback AMP render fail, recover non-AMP', () => {
      return executeLayoutCallbackTest(true, true);
    });
    it('should run end-to-end in the presence of an XHR error', () => {
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        fetchMock.getOnce(
            TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
            Promise.reject(networkFailure()), {name: 'ad'});
        const {doc} = fixture;
        const a4aElement = createA4aElement(doc);
        const a4a = new MockA4AImpl(a4aElement);
        const getAdUrlSpy = sandbox.spy(a4a, 'getAdUrl');
        const onNetworkFailureSpy = sandbox.spy(a4a, 'onNetworkFailure');
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.be.instanceof(Promise);
        return a4a.layoutCallback().then(() => {
          expect(getAdUrlSpy, 'getAdUrl called exactly once').to.be.calledOnce;
          expect(onNetworkFailureSpy,
              'onNetworkFailureSpy called exactly once').to.be.calledOnce;
          // Verify iframe presence and lack of visibility hidden
          const iframe = a4aElement.querySelector('iframe[src]');
          expect(iframe).to.be.ok;
          expect(iframe.src.indexOf(TEST_URL)).to.equal(0);
          expect(iframe).to.be.visible;
          expect(onCreativeRenderSpy.withArgs(null)).to.be.called;
        });
      });
    });
    it('should use adUrl from onNetworkFailure', () => {
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        fetchMock.getOnce(
            TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
            Promise.reject(networkFailure()), {name: 'ad'});
        const {doc} = fixture;
        const a4aElement = createA4aElement(doc);
        const a4a = new MockA4AImpl(a4aElement);
        const getAdUrlSpy = sandbox.spy(a4a, 'getAdUrl');
        sandbox.stub(a4a, 'onNetworkFailure')
            .withArgs(sinon.match(val =>
              val.message && val.message.indexOf('XHR Failed fetching') == 0),
            TEST_URL)
            .returns({adUrl: TEST_URL + '&err=true'});
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.be.instanceof(Promise);
        return a4a.layoutCallback().then(() => {
          expect(getAdUrlSpy, 'getAdUrl called exactly once').to.be.calledOnce;
          // Verify iframe presence and lack of visibility hidden
          const iframe = a4aElement.querySelector('iframe[src]');
          expect(iframe).to.be.ok;
          expect(iframe.src.indexOf(TEST_URL)).to.equal(0);
          expect(/&err=true/.test(iframe.src), iframe.src).to.be.true;
          expect(iframe).to.be.visible;
          expect(onCreativeRenderSpy.withArgs(null)).to.be.called;
        });
      });
    });
    it('should not execute frame GET if disabled via onNetworkFailure', () => {
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        fetchMock.getOnce(
            TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
            Promise.reject(networkFailure()), {name: 'ad'});
        const {doc} = fixture;
        const a4aElement = createA4aElement(doc);
        const a4a = new MockA4AImpl(a4aElement);
        a4a.promiseErrorHandler_ = () => {};
        const getAdUrlSpy = sandbox.spy(a4a, 'getAdUrl');
        sandbox.stub(a4a, 'onNetworkFailure')
            .withArgs(sinon.match(val =>
              val.message && val.message.indexOf('XHR Failed fetching') == 0),
            TEST_URL)
            .returns({frameGetDisabled: true});
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        return a4a.layoutCallback().then(() => {
          expect(getAdUrlSpy, 'getAdUrl called exactly once').to.be.calledOnce;
          const iframe = a4aElement.querySelector('iframe');
          expect(iframe).to.not.be.ok;
        });
      });
    });
    it('should handle XHR error when resolves before layoutCallback', () => {
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        fetchMock.getOnce(
            TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
            Promise.reject(networkFailure()), {name: 'ad'});
        const {doc} = fixture;
        const a4aElement = createA4aElement(doc);
        const a4a = new MockA4AImpl(a4aElement);
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        return a4a.adPromise_.then(() => a4a.layoutCallback().then(() => {
          // Verify iframe presence and lack of visibility hidden
          expect(a4aElement.querySelectorAll('iframe').length).to.equal(1);
          const iframe = a4aElement.querySelectorAll('iframe')[0];
          expect(iframe.src.indexOf(TEST_URL)).to.equal(0);
          expect(iframe).to.be.visible;
          expect(onCreativeRenderSpy.withArgs(null)).to.be.called;
        }));
      });
    });
    it('should handle XHR error when resolves after layoutCallback', () => {
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        let rejectXhr;
        fetchMock.getOnce(
            TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
            new Promise((unusedResolve, reject) => {
              rejectXhr = reject;
            }),
            {name: 'ad'});
        const {doc} = fixture;
        const a4aElement = createA4aElement(doc);
        const a4a = new MockA4AImpl(a4aElement);
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        const layoutCallbackPromise = a4a.layoutCallback();
        rejectXhr(networkFailure());
        return layoutCallbackPromise.then(() => {
          // Verify iframe presence and lack of visibility hidden
          expect(a4aElement.querySelectorAll('iframe').length).to.equal(1);
          const iframe = a4aElement.querySelectorAll('iframe')[0];
          expect(iframe.src.indexOf(TEST_URL)).to.equal(0);
          expect(iframe).to.be.visible;
          expect(onCreativeRenderSpy.withArgs(null)).to.be.called;
        });
      });
    });

    [
      {
        name: '204',
        fn: () => {
          adResponse.status = 204;
          // Response constructor requires null body for non 200 responses.
          adResponse.body = null;
        },
      },
      {
        name: '500',
        fn: () => {
          adResponse.status = 500;
          // Response constructor requires null body for non 200 responses.
          adResponse.body = null;
        },
      },
      {
        name: 'empty body',
        fn: () => adResponse.body = '',
      },
      {
        name: 'no fill header',
        fn: () => adResponse.headers['amp-ff-empty-creative'] = '',
      },
    ].forEach(test => {
      it(`should collapse ${test.name}`, () => {
        return createIframePromise().then(fixture => {
          setupForAdTesting(fixture);
          test.fn();
          fetchMock.getOnce(
              TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
              adResponse,
              {name: 'ad'});
          const {doc} = fixture;
          const a4aElement = createA4aElement(doc);
          const a4a = new MockA4AImpl(a4aElement);
          a4a.buildCallback();
          const forceCollapseSpy = sandbox.spy(a4a, 'forceCollapse');
          const noContentUISpy = sandbox.spy();
          const unlayoutUISpy = sandbox.spy();
          a4a.uiHandler = {
            applyNoContentUI: () => {noContentUISpy();},
            applyUnlayoutUI: () => {unlayoutUISpy();},
          };
          sandbox.stub(a4a, 'getLayoutBox').returns(
              {width: 123, height: 456});
          a4a.onLayoutMeasure();
          expect(a4a.adPromise_).to.be.ok;
          return a4a.adPromise_.then(() => {
            expect(forceCollapseSpy).to.be.calledOnce;
            expect(noContentUISpy).to.be.calledOnce;
            return a4a.layoutCallback().then(() => {
              // should have no iframe.
              expect(a4aElement.querySelector('iframe')).to.not.be.ok;
              expect(onCreativeRenderSpy).to.not.be.called;
              // call unlayout callback & verify it attempts to revert size
              expect(a4a.originalSlotSize_).to.deep
                  .equal({width: 123, height: 456});
              let attemptChangeSizeResolver;
              const attemptChangeSizePromise = new Promise(resolve => {
                attemptChangeSizeResolver = resolve;
              });
              sandbox.stub(AMP.BaseElement.prototype, 'attemptChangeSize')
                  .returns(attemptChangeSizePromise);
              a4a.unlayoutCallback();
              expect(unlayoutUISpy).to.be.calledOnce;
              expect(a4a.originalSlotSize_).to.be.ok;
              attemptChangeSizeResolver();
              return Services.timerFor(a4a.win).promise(1).then(() => {
                expect(a4a.originalSlotSize_).to.not.be.ok;
              });
            });
          });
        });
      });
    });

    it('should process safeframe version header properly', () => {
      adResponse.headers[SAFEFRAME_VERSION_HEADER] = '1-2-3';
      adResponse.headers[RENDERING_TYPE_HEADER] = 'safeframe';
      delete adResponse.headers['AMP-Fast-Fetch-Signature'];
      delete adResponse.headers[AMP_SIGNATURE_HEADER];
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        fetchMock.getOnce(
            TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
            () => adResponse, {name: 'ad'});
        const {doc} = fixture;
        const a4aElement = createA4aElement(doc);
        const a4a = new MockA4AImpl(a4aElement);
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        return a4a.adPromise_.then(() => {
          expect(fetchMock.called('ad')).to.be.true;
          return a4a.layoutCallback().then(() => {
            verifySafeFrameRender(a4aElement, '1-2-3');
            // Verify preload to safeframe with header version.
            expect(doc.querySelector('link[rel=preload]' +
              '[href="https://tpc.googlesyndication.com/safeframe/' +
              '1-2-3/html/container.html"]')).to.be.ok;
          });
        });
      });
    });

    describe('delay request experiment', () => {
      let getAdUrlSpy;
      let a4a;
      beforeEach(() => {
        return createIframePromise().then(fixture => {
          setupForAdTesting(fixture);
          fetchMock.getOnce(
              TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
              () => adResponse, {name: 'ad'});
          const {doc} = fixture;
          const a4aElement = createA4aElement(doc);
          a4a = new MockA4AImpl(a4aElement);
          getAdUrlSpy = sandbox.spy(a4a, 'getAdUrl');
        });
      });
      it('should delay request until within renderOutsideViewport',() => {
        sandbox.stub(a4a, 'delayAdRequestEnabled').returns(true);
        let whenWithinViewportResolve;
        getResourceStub.returns(
            {
              getUpgradeDelayMs: () => 1,
              renderOutsideViewport: () => 3,
              whenWithinViewport: viewport => {
                expect(viewport).to.equal(3);
                return new Promise(resolve => {
                  whenWithinViewportResolve = resolve;
                });
              },
            });
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.be.instanceof(Promise);
        // Delay to all getAdUrl to potentially execute.
        return Services.timerFor(a4a.win).promise(1).then(() => {
          expect(getAdUrlSpy).to.not.be.called;
          whenWithinViewportResolve();
          return a4a.adPromise_.then(() => {
            expect(getAdUrlSpy).to.be.calledOnce;
          });
        });
      });
      it('should delay request until numeric value',() => {
        sandbox.stub(a4a, 'delayAdRequestEnabled').returns(6);
        let whenWithinViewportResolve;
        getResourceStub.returns(
            {
              getUpgradeDelayMs: () => 1,
              renderOutsideViewport: () => 3,
              whenWithinViewport: viewport => {
                expect(viewport).to.equal(6);
                return new Promise(resolve => {
                  whenWithinViewportResolve = resolve;
                });
              },
            });
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.be.instanceof(Promise);
        // Delay to all getAdUrl to potentially execute.
        return Services.timerFor(a4a.win).promise(1).then(() => {
          expect(getAdUrlSpy).to.not.be.called;
          whenWithinViewportResolve();
          return a4a.adPromise_.then(() => {
            expect(getAdUrlSpy).to.be.calledOnce;
          });
        });
      });
    });
    it('should ignore invalid safeframe version header', () => {
      adResponse.headers[SAFEFRAME_VERSION_HEADER] = 'some-bad-item';
      adResponse.headers[RENDERING_TYPE_HEADER] = 'safeframe';
      delete adResponse.headers['AMP-Fast-Fetch-Signature'];
      delete adResponse.headers[AMP_SIGNATURE_HEADER];
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        fetchMock.getOnce(
            TEST_URL + '&__amp_source_origin=about%3Asrcdoc', () => adResponse,
            {name: 'ad'});
        const {doc} = fixture;
        const a4aElement = createA4aElement(doc);
        const a4a = new MockA4AImpl(a4aElement);
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        return a4a.adPromise_.then(() => {
          expect(fetchMock.called('ad')).to.be.true;
          return a4a.layoutCallback().then(() => {
            verifySafeFrameRender(a4aElement, DEFAULT_SAFEFRAME_VERSION);
          });
        });
      });
    });
    // TODO(tdrl): Go through case analysis in amp-a4a.js#onLayoutMeasure and
    // add one test for each case / ensure that all cases are covered.
  });

  describe('#preconnectCallback', () => {
    it('validate', () => {
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const {doc} = fixture;
        const a4aElement = createA4aElement(doc);
        const a4a = new MockA4AImpl(a4aElement);
        //a4a.config = {};
        a4a.buildCallback();
        a4a.preconnectCallback(false);
        return Promise.resolve().then(() => {
          const preconnects = doc.querySelectorAll('link[rel=preconnect]');
          expect(preconnects).to.have.lengthOf(1);
          // AdSense origin.
          expect(preconnects[0]).to.have.property(
              'href', 'https://googleads.g.doubleclick.net/');
        });
      });
    });
  });

  describe('#getAmpAdMetadata', () => {
    let a4a;
    let metaData;
    beforeEach(() => {
      metaData = {
        customElementExtensions: ['amp-vine', 'amp-vine', 'amp-vine'],
        customStylesheets: [
          {href: 'https://fonts.googleapis.com/css?foobar'},
          {href: 'https://fonts.com/css?helloworld'},
        ],
        images: ['https://some.image.com/a=b', 'https://other.image.com'],
      };
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        a4a = new MockA4AImpl(createA4aElement(fixture.doc));
        return fixture;
      });
    });
    it('should parse metadata', () => {
      const actual = a4a.getAmpAdMetadata(buildCreativeString(metaData));
      const expected = Object.assign(metaData, {
        minifiedCreative: testFragments.minimalDocOneStyleSrcDoc,
      });
      expect(actual).to.deep.equal(expected);
    });
    // TODO(levitzky) remove the following two tests after metadata bug is
    // fixed.
    it('should parse metadata with wrong opening tag', () => {
      const creative = buildCreativeString(metaData).replace(
          '<script type="application/json" amp-ad-metadata>',
          '<script type=application/json amp-ad-metadata>');
      const actual = a4a.getAmpAdMetadata(creative);
      const expected = Object.assign({
        minifiedCreative: testFragments.minimalDocOneStyleSrcDoc,
      }, metaData);
      expect(actual).to.deep.equal(expected);
    });
    it('should return null if metadata opening tag is (truly) wrong', () => {
      const creative = buildCreativeString(metaData).replace(
          '<script type="application/json" amp-ad-metadata>',
          '<script type=application/json" amp-ad-metadata>');
      expect(a4a.getAmpAdMetadata(creative)).to.be.null;
    });

    it('should return null if missing ampRuntimeUtf16CharOffsets', () => {
      const baseTestDoc = testFragments.minimalDocOneStyle;
      const splicePoint = baseTestDoc.indexOf('</body>');
      expect(a4a.getAmpAdMetadata(
          baseTestDoc.slice(0, splicePoint) +
        '<script type="application/json" amp-ad-metadata></script>' +
        baseTestDoc.slice(splicePoint))).to.be.null;
    });
    it('should return null if invalid extensions', () => {
      metaData.customElementExtensions = 'amp-vine';
      expect(a4a.getAmpAdMetadata(buildCreativeString(metaData))).to.be.null;
    });
    it('should return null if non-array stylesheets', () => {
      metaData.customStylesheets = 'https://fonts.googleapis.com/css?foobar';
      expect(a4a.getAmpAdMetadata(buildCreativeString(metaData))).to.be.null;
    });
    it('should return null if invalid stylesheet object', () => {
      metaData.customStylesheets = [
        {href: 'https://fonts.googleapis.com/css?foobar'},
        {foo: 'https://fonts.com/css?helloworld'},
      ];
      expect(a4a.getAmpAdMetadata(buildCreativeString(metaData))).to.be.null;
    });
    it('should not include amp images if not an array', () => {
      metaData.images = 'https://foo.com';
      const actual = a4a.getAmpAdMetadata(buildCreativeString(metaData));
      const expected = Object.assign({
        minifiedCreative: testFragments.minimalDocOneStyleSrcDoc,
      }, metaData);
      delete expected.images;
      expect(actual).to.deep.equal(expected);
    });
    it('should tolerate missing images', () => {
      delete metaData.images;
      const actual = a4a.getAmpAdMetadata(buildCreativeString(metaData));
      const expected = Object.assign({
        minifiedCreative: testFragments.minimalDocOneStyleSrcDoc,
      }, metaData);
      delete expected.images;
      expect(actual).to.deep.equal(expected);
    });
    it('should limit to 5 images', () => {
      while (metaData.images.length < 10) {
        metaData.images.push('https://another.image.com?abc=def');
      }
      expect(a4a.getAmpAdMetadata(buildCreativeString(metaData)).images.length)
          .to.equal(5);
    });

    it('should throw due to missing CTA type', () => {
      metaData.ctaUrl = 'http://foo.com';
      a4a.isSinglePageStoryAd = true;
      expect(() => a4a.getAmpAdMetadata(buildCreativeString(metaData)))
          .to.throw(new RegExp(INVALID_SPSA_RESPONSE));
    });

    it('should throw due to missing outlink', () => {
      metaData.ctaType = '0';
      a4a.isSinglePageStoryAd = true;
      expect(() => a4a.getAmpAdMetadata(buildCreativeString(metaData)))
          .to.throw(new RegExp(INVALID_SPSA_RESPONSE));
    });

    it('should set appropriate attributes and return metadata object', () => {
      metaData.ctaType = '0';
      metaData.ctaUrl = 'http://foo.com';
      a4a.isSinglePageStoryAd = true;
      const actual = a4a.getAmpAdMetadata(buildCreativeString(metaData));
      const expected = Object.assign({
        minifiedCreative: testFragments.minimalDocOneStyleSrcDoc,
      }, metaData);
      delete expected.ctaType;
      delete expected.ctaUrl;
      expect(actual).to.deep.equal(expected);
      expect(a4a.element.dataset.varsCtatype).to.equal('0');
      expect(a4a.element.dataset.varsCtaurl).to.equal('http://foo.com');
    });

    // FAILURE cases here
  });

  describe('#maybeValidateAmpCreative', () => {

    let a4a;
    let verifier;

    beforeEach(() => {
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        a4a = new MockA4AImpl(createA4aElement(fixture.doc));
        verifier = a4a.win['AMP_FAST_FETCH_SIGNATURE_VERIFIER_'] = {};
        a4a.keysetPromise_ = Promise.resolve();
        return fixture;
      });
    });

    it('should pass verification with story ad', () => {
      a4a.isSinglePageStoryAd = true;
      verifier.verify = () => Promise.resolve(VerificationStatus.OK);
      return a4a.maybeValidateAmpCreative(/* bytes */ 'foo').then(result => {
        expect(result).to.equal('foo');
      });
    });

    it('should throw due to invalid AMP creative with story ad', () => {
      a4a.isSinglePageStoryAd = true;
      verifier.verify = () => Promise.resolve(VerificationStatus.UNVERIFIED);
      return a4a.maybeValidateAmpCreative().catch(error => {
        expect(error.message).to.equal(INVALID_SPSA_RESPONSE);
      });
    });
  });

  describe('#renderOutsideViewport', () => {
    let a4aElement;
    let a4a;
    let fixture;
    beforeEach(() => {
      return createIframePromise().then(f => {
        setupForAdTesting(f);
        fixture = f;
        a4aElement = createA4aElement(fixture.doc);
        a4a = new MockA4AImpl(a4aElement);
        a4a.buildCallback();
        return fixture;
      });
    });
    it('should return false if throttled', () => {
      incrementLoadingAds(fixture.win);
      expect(a4a.renderOutsideViewport()).to.be.false;
    });
    it('should return true if throttled, but AMP creative', () => {
      incrementLoadingAds(fixture.win);
      a4a.isVerifiedAmpCreative_ = true;
      expect(a4a.renderOutsideViewport()).to.equal(3);
    });
    it('should return 1.25 if prefer-viewability-over-views', () => {
      a4aElement.setAttribute(
          'data-loading-strategy', 'prefer-viewability-over-views');
      expect(a4a.renderOutsideViewport()).to.equal(1.25);
      a4a.isVerifiedAmpCreative_ = true;
      expect(a4a.renderOutsideViewport()).to.equal(1.25);
    });
  });

  describe('#renderAmpCreative_', () => {
    const metaData = AmpA4A.prototype.getAmpAdMetadata(buildCreativeString());
    let a4aElement;
    let a4a;
    beforeEach(() => {
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const {doc} = fixture;
        a4aElement = createA4aElement(doc);
        a4a = new AmpA4A(a4aElement);
        sandbox.stub(a4a, 'getFallback').callsFake(() => {return true;});
        a4a.buildCallback();
        a4a.adUrl_ = 'https://nowhere.org';
      });
    });
    it('should render correctly', () => {
      return a4a.renderAmpCreative_(metaData).then(() => {
        // Verify iframe presence.
        expect(a4aElement.children.length).to.equal(1);
        const friendlyIframe = a4aElement.children[0];
        expect(friendlyIframe.tagName).to.equal('IFRAME');
        expect(friendlyIframe.src).to.not.be.ok;
        expect(friendlyIframe.srcdoc).to.be.ok;
        const frameDoc = friendlyIframe.contentDocument;
        const styles = frameDoc.querySelectorAll('style[amp-custom]');
        expect(Array.prototype.some.call(styles,
            s => {
              return s.innerHTML == 'p { background: green }';
            }),
        'Some style is "background: green"').to.be.true;
        expect(frameDoc.body.innerHTML.trim()).to.equal('<p>some text</p>');
        expect(Services.urlReplacementsForDoc(frameDoc.documentElement))
            .to.not.equal(Services.urlReplacementsForDoc(a4aElement));
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
        const body = env.ampdoc.getBody();
        const a4aElement = createA4aElement(env.win.document, null, body);
        const a4a = new MockA4AImpl(a4aElement);
        expect(a4a.getLayoutPriority()).to.equal(LayoutPriority.METADATA);
      });
    });

    describes.realWin('with single AmpDoc', {
      amp: {
        ampdoc: 'single',
      },
    }, env => {
      it('should return priority of 2', () => {
        const body = env.ampdoc.getBody();
        const a4aElement = createA4aElement(env.win.document, null, body);
        const a4a = new MockA4AImpl(a4aElement);
        expect(a4a.getLayoutPriority()).to.equal(LayoutPriority.ADS);
      });
    });
  });

  describe('#unlayoutCallback', () => {
    it('verify state reset', () => {
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        fetchMock.getOnce(
            TEST_URL + '&__amp_source_origin=about%3Asrcdoc', () => adResponse,
            {name: 'ad'});
        const {doc} = fixture;
        const a4aElement = createA4aElement(doc);
        const a4a = new MockA4AImpl(a4aElement);
        a4a.buildCallback();
        return a4a.onLayoutMeasure(() => {
          expect(a4a.adPromise_).to.not.be.null;
          expect(a4a.element.children).to.have.lengthOf(1);
        });
      });
    });

    it('attemptChangeSize reverts', () => {
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        fetchMock.getOnce(
            TEST_URL + '&__amp_source_origin=about%3Asrcdoc', () => adResponse,
            {name: 'ad'});
        const {doc} = fixture;
        const a4aElement = createA4aElement(doc);
        const a4a = new MockA4AImpl(a4aElement);
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        const attemptChangeSizeStub =
          sandbox.stub(AMP.BaseElement.prototype, 'attemptChangeSize');
        // Expect called twice: one for resize and second for reverting.
        attemptChangeSizeStub.withArgs(123, 456).returns(Promise.resolve());
        attemptChangeSizeStub.withArgs(200, 50).returns(Promise.resolve());
        a4a.attemptChangeSize(123, 456);
        a4a.layoutCallback(() => {
          expect(a4aElement.querySelector('iframe')).to.be.ok;
          a4a.unlayoutCallback();
        });
      });
    });

    it('verify cancelled promise', () => {
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        let whenFirstVisibleResolve = null;
        viewerWhenVisibleMock.returns(new Promise(resolve => {
          whenFirstVisibleResolve = resolve;
        }));
        const {doc} = fixture;
        const a4aElement = createA4aElement(doc);
        const a4a = new MockA4AImpl(a4aElement);
        const getAdUrlSpy = sandbox.spy(a4a, 'getAdUrl');
        const errorHandlerSpy = sandbox.spy(a4a, 'promiseErrorHandler_');
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        const adPromise = a4a.adPromise_;
        // This is to prevent `applyUnlayoutUI` to be called;
        a4a.uiHandler.state = 0;
        a4a.unlayoutCallback();
        whenFirstVisibleResolve();
        return adPromise.then(unusedError => {
          assert.fail('cancelled ad promise should not succeed');
        }).catch(reason => {
          expect(getAdUrlSpy.called, 'getAdUrl never called')
              .to.be.false;
          expect(reason.message).to.equal(cancellation().message);
          expect(errorHandlerSpy).to.be.calledOnce;
        });
      });
    });

    describe('consent integration', () => {

      let fixture, a4aElement, a4a, consentString;
      beforeEach(() => createIframePromise().then(f => {
        fixture = f;
        setupForAdTesting(fixture);
        fetchMock.getOnce(
            TEST_URL + '&__amp_source_origin=about%3Asrcdoc', () => adResponse,
            {name: 'ad'});
        a4aElement = createA4aElement(fixture.doc);
        a4a = new MockA4AImpl(a4aElement);
        consentString = 'test-consent-string';
        return fixture;
      }));

      it('should delay ad url by getConsentPolicyState', () => {
        sandbox.stub(AMP.BaseElement.prototype, 'getConsentPolicy')
            .returns('default');
        let inResolver;
        const policyPromise = new Promise(resolver => inResolver = resolver);
        sandbox.stub(Services, 'consentPolicyServiceForDocOrNull')
            .returns(Promise.resolve({
              whenPolicyResolved: () => policyPromise,
              getConsentStringInfo: () => consentString,
            }));

        const getAdUrlSpy = sandbox.spy(
            a4a,
            'getAdUrl'
        );
        const tryExecuteRealTimeConfigSpy = sandbox.spy(
            a4a,
            'tryExecuteRealTimeConfig_'
        );

        a4a.buildCallback();
        a4a.onLayoutMeasure();
        // allow ad promise to start execution, unfortunately timer is only way.
        return Services.timerFor(a4a.win).promise(50).then(() => {
          expect(getAdUrlSpy).to.not.be.called;
          inResolver(CONSENT_POLICY_STATE.SUFFICIENT);
          return a4a.layoutCallback().then(() => {
            expect(getAdUrlSpy.withArgs(
                CONSENT_POLICY_STATE.SUFFICIENT
            )).calledOnce;
            expect(tryExecuteRealTimeConfigSpy.withArgs(
                CONSENT_POLICY_STATE.SUFFICIENT,
                consentString
            )).calledOnce;
          });
        });
      });

      it('should not wait on consent if no policy', () => {
        sandbox.stub(AMP.BaseElement.prototype, 'getConsentPolicy')
            .returns(null);
        const consentServiceSpy =
          sandbox.spy(Services, 'consentPolicyServiceForDocOrNull');
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        return a4a.layoutCallback().then(() =>
          expect(consentServiceSpy).to.not.be.called);
      });

      it('should pass consent state to getAdUrl', () => {
        sandbox.stub(AMP.BaseElement.prototype, 'getConsentPolicy')
            .returns('default');
        sandbox.stub(Services, 'consentPolicyServiceForDocOrNull')
            .returns(Promise.resolve({
              whenPolicyResolved: () =>
                Promise.resolve(CONSENT_POLICY_STATE.SUFFICIENT),
              getConsentStringInfo: () => consentString,
            }));

        const getAdUrlSpy = sandbox.spy(
            a4a,
            'getAdUrl'
        );
        const tryExecuteRealTimeConfigSpy = sandbox.spy(
            a4a,
            'tryExecuteRealTimeConfig_'
        );

        a4a.buildCallback();
        a4a.onLayoutMeasure();
        return a4a.layoutCallback().then(() => {
          expect(getAdUrlSpy.withArgs(
              CONSENT_POLICY_STATE.SUFFICIENT
          )).calledOnce;
          expect(tryExecuteRealTimeConfigSpy.withArgs(
              CONSENT_POLICY_STATE.SUFFICIENT,
              consentString
          )).calledOnce;
        });
      });

      it('should return UNKNOWN if consent exception', () => {
        expectAsyncConsoleError(/Error determining consent state.*consent err/);
        sandbox.stub(AMP.BaseElement.prototype, 'getConsentPolicy')
            .returns('default');
        sandbox.stub(Services, 'consentPolicyServiceForDocOrNull')
            .returns(Promise.resolve({
              whenPolicyResolved: () => {throw new Error('consent err!');},
              getConsentStringInfo: () => {throw new Error('consent err!');},
            }));

        const getAdUrlSpy = sandbox.spy(
            a4a,
            'getAdUrl'
        );
        const tryExecuteRealTimeConfigSpy = sandbox.spy(
            a4a,
            'tryExecuteRealTimeConfig_'
        );

        a4a.buildCallback();
        a4a.onLayoutMeasure();
        return a4a.layoutCallback().then(() => {

          expect(getAdUrlSpy.withArgs(
              CONSENT_POLICY_STATE.UNKNOWN
          )).calledOnce;
          expect(tryExecuteRealTimeConfigSpy.withArgs(
              CONSENT_POLICY_STATE.UNKNOWN,
              null
          )).calledOnce;

        });
      });
    });

    describe('protectFunctionWrapper', () => {
      it('works properly with no error', () => {
        let errorCalls = 0;
        expect(protectFunctionWrapper(name => {
          return `hello ${name}`;
        }, null, () => {errorCalls++;})('world')).to.equal('hello world');
        expect(errorCalls).to.equal(0);
      });

      it('handles error properly', () => {
        const err = new Error('test fail');
        expect(protectFunctionWrapper((name, suffix) => {
          expect(name).to.equal('world');
          expect(suffix).to.equal('!');
          throw err;
        }, null, (currErr, name, suffix) => {
          expect(currErr).to.equal(err);
          expect(name).to.equal('world');
          expect(suffix).to.equal('!');
          return 'pass';
        })('world', '!')).to.equal('pass');
      });

      it('returns undefined if error thrown in error handler', () => {
        const err = new Error('test fail within fn');
        expect(protectFunctionWrapper((name, suffix) => {
          expect(name).to.equal('world');
          expect(suffix).to.be.undefined;
          throw err;
        }, null, (currErr, name, suffix) => {
          expect(currErr).to.equal(err);
          expect(name).to.equal('world');
          expect(suffix).to.be.undefined;
          throw new Error('test fail within error fn');
        })('world')).to.be.undefined;
      });
    });
  });

  describe('error handler', () => {
    let a4aElement;
    let a4a;
    let userErrorStub;
    let userWarnStub;
    let devExpectedErrorStub;

    beforeEach(() => {
      userErrorStub = sandbox.stub(user(), 'error');
      userWarnStub = sandbox.stub(user(), 'warn');
      devExpectedErrorStub = sandbox.stub(dev(), 'expectedError');
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const {doc} = fixture;
        a4aElement = createA4aElement(doc);
        a4a = new MockA4AImpl(a4aElement);
        a4a.adUrl_ = 'https://acme.org?query';
      });
    });

    it('should rethrow cancellation', () => {
      expect(() => {
        a4a.promiseErrorHandler_(cancellation());
      }).to.throw(/CANCELLED/);
    });

    it('should create an error if needed', () => {
      window.AMP_MODE = {development: true};
      a4a.promiseErrorHandler_('intentional');
      expect(userErrorStub).to.be.calledOnce;
      expect(userErrorStub.args[0][1]).to.be.instanceOf(Error);
      expect(userErrorStub.args[0][1].message).to.be.match(/intentional/);
      expect(userErrorStub.args[0][1].ignoreStack).to.be.undefined;
    });

    it('should configure ignoreStack when specified', () => {
      window.AMP_MODE = {development: true};
      a4a.promiseErrorHandler_('intentional', /* ignoreStack */ true);
      expect(userErrorStub).to.be.calledOnce;
      expect(userErrorStub.args[0][1]).to.be.instanceOf(Error);
      expect(userErrorStub.args[0][1].message).to.be.match(/intentional/);
      expect(userErrorStub.args[0][1].ignoreStack).to.equal(true);
    });

    it('should route error to user.error in dev mode', () => {
      const error = new Error('intentional');
      window.AMP_MODE = {development: true};
      a4a.promiseErrorHandler_(error);
      expect(userErrorStub).to.be.calledOnce;
      expect(userErrorStub.args[0][1]).to.be.equal(error);
      expect(error.message).to.equal('amp-a4a: adsense: intentional');
      expect(error.args).to.deep.equal({au: 'query'});
      expect(devExpectedErrorStub).to.not.be.called;
    });

    it('should route error to user.warn in prod mode', () => {
      const error = new Error('intentional');
      window.AMP_MODE = {development: false};
      a4a.promiseErrorHandler_(error);
      expect(userWarnStub).to.be.calledOnce;
      expect(userWarnStub.args[0][1]).to.be.equal(error);
      expect(error.message).to.equal('amp-a4a: adsense: intentional');
      expect(error.args).to.deep.equal({au: 'query'});
    });

    it('should send an expected error in prod mode with sampling', () => {
      const error = new Error('intentional');
      sandbox.stub(Math, 'random').callsFake(() => 0.005);
      window.AMP_MODE = {development: false};
      a4a.promiseErrorHandler_(error);
      expect(devExpectedErrorStub).to.be.calledOnce;
      expect(devExpectedErrorStub.args[0][1]).to.be.equal(error);
      expect(error.message).to.equal('amp-a4a: adsense: intentional');
      expect(error.args).to.deep.equal({au: 'query'});
    });

    it('should NOT send an expected error in prod mode with sampling', () => {
      const error = new Error('intentional');
      sandbox.stub(Math, 'random').callsFake(() => 0.011);
      window.AMP_MODE = {development: false};
      a4a.promiseErrorHandler_(error);
      expect(devExpectedErrorStub).to.not.be.called;
    });
  });

  describe('#assignAdUrlToError', () => {

    it('should attach info to error correctly', () => {
      const error = new Error('foo');
      let queryString = '';
      while (queryString.length < 300) {
        queryString += 'def=abcdefg&';
      }
      const url = 'https://foo.com?' + queryString;
      assignAdUrlToError(error, url);
      expect(error.args).to.jsonEqual({au: queryString.substring(0, 250)});
      // Calling again with different url has no effect.
      assignAdUrlToError(error, 'https://someothersite.com?bad=true');
      expect(error.args).to.jsonEqual({au: queryString.substring(0, 250)});
    });

    it('should not modify if no query string', () => {
      const error = new Error('foo');
      assignAdUrlToError(error, 'https://foo.com');
      expect(error.args).to.not.be.ok;
    });
  });

  describe('#extractSize', () => {

    it('should return a size', () => {
      expect(AmpA4A.prototype.extractSize(new Headers({
        'X-CreativeSize': '320x50',
      }))).to.deep.equal({width: 320, height: 50});
    });

    it('should return no size', () => {
      expect(AmpA4A.prototype.extractSize(new Headers())).to.be.null;
    });
  });

  describe('refresh', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.sandbox;
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should effectively reset the slot and invoke given callback', () => {
      return createIframePromise().then(f => {
        const fixture = f;
        setupForAdTesting(fixture);
        const a4aElement = createA4aElement(fixture.doc);
        const a4a = new MockA4AImpl(a4aElement);
        a4a.adPromise_ = Promise.resolve();
        a4a.getAmpDoc = () => a4a.win.document;
        a4a.getResource = () => {
          return {
            layoutCanceled: () => {},
          };
        };
        a4a.mutateElement = func => func();
        a4a.togglePlaceholder = sandbox.spy();

        // We don't really care about the behavior of the following methods, so
        // long as they're called the appropriate number of times. We stub them
        // out here because they would otherwise throw errors unrelated to the
        // behavior actually being tested.
        const initiateAdRequestMock =
            sandbox.stub(AmpA4A.prototype, 'initiateAdRequest');
        initiateAdRequestMock.returns(undefined);
        const tearDownSlotMock = sandbox.stub(AmpA4A.prototype, 'tearDownSlot');
        tearDownSlotMock.returns(undefined);
        const destroyFrameMock = sandbox.stub(AmpA4A.prototype, 'destroyFrame');
        destroyFrameMock.returns(undefined);
        sandbox.stub(analytics, 'triggerAnalyticsEvent');

        expect(a4a.isRefreshing).to.be.false;
        return a4a.refresh(() => {}).then(() => {
          expect(initiateAdRequestMock).to.be.calledOnce;
          expect(tearDownSlotMock).to.be.calledOnce;
          expect(a4a.togglePlaceholder).to.be.calledOnce;
          expect(a4a.isRefreshing).to.be.true;
          expect(a4a.isRelayoutNeededFlag).to.be.true;
        });
      });
    });


    it('should fire an analytics event when refreshing', () => {
      return createIframePromise().then(f => {
        const fixture = f;
        setupForAdTesting(fixture);
        const a4aElement = createA4aElement(fixture.doc);
        const a4a = new MockA4AImpl(a4aElement);
        a4a.adPromise_ = Promise.resolve();
        a4a.getAmpDoc = () => a4a.win.document;
        a4a.getResource = () => {
          return {
            layoutCanceled: () => {},
          };
        };
        a4a.mutateElement = func => func();
        a4a.togglePlaceholder = sandbox.spy();

        // We don't really care about the behavior of the following methods, so
        // long as they're called the appropriate number of times. We stub them
        // out here because they would otherwise throw errors unrelated to the
        // behavior actually being tested.
        const initiateAdRequestMock =
            sandbox.stub(AmpA4A.prototype, 'initiateAdRequest');
        initiateAdRequestMock.returns(undefined);
        const tearDownSlotMock = sandbox.stub(AmpA4A.prototype, 'tearDownSlot');
        tearDownSlotMock.returns(undefined);
        const destroyFrameMock = sandbox.stub(AmpA4A.prototype, 'destroyFrame');
        destroyFrameMock.returns(undefined);

        const triggerAnalyticsEventStub = sandbox.stub(analytics,
            'triggerAnalyticsEvent');

        expect(a4a.isRefreshing).to.be.false;
        return a4a.refresh(() => {}).then(() => {
          expect(triggerAnalyticsEventStub)
              .calledWith(a4a.element, 'ad-refresh');
        });
      });
    });

    it('should fail gracefully if race conditions nullify adPromise', () => {
      return createIframePromise().then(f => {
        const fixture = f;
        setupForAdTesting(fixture);
        const a4aElement = createA4aElement(fixture.doc);
        const a4a = new MockA4AImpl(a4aElement);
        a4a.adPromise_ = null;
        a4a.getAmpDoc = () => a4a.win.document;
        a4a.getResource = () => {
          return {
            layoutCanceled: () => {},
          };
        };
        a4a.mutateElement = func => func();
        a4a.togglePlaceholder = sandbox.spy();

        sandbox.stub(AmpA4A.prototype, 'initiateAdRequest').returns(undefined);
        sandbox.stub(AmpA4A.prototype, 'tearDownSlot').returns(undefined);
        const callback = sandbox.spy();
        return a4a.refresh(callback).then(() => {
          expect(callback).to.not.be.called;
        });
      });
    });
  });

  describe('buildCallback', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.sandbox;
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should set isSinglePageStoryAd to false', () => {
      return createIframePromise().then(fixture => {
        const element = createA4aElement(fixture.doc);
        const a4a = new MockA4AImpl(element);
        a4a.buildCallback();
        expect(a4a.isSinglePageStoryAd).to.be.false;
      });
    });

    it('should set isSinglePageStoryAd to true', () => {
      return createIframePromise().then(fixture => {
        const element = createA4aElement(fixture.doc);
        element.setAttribute('amp-story', 1);
        const a4a = new MockA4AImpl(element);
        a4a.buildCallback();
        expect(a4a.isSinglePageStoryAd).to.be.true;
      });
    });
  });

  describe('canonical AMP', () => {
    describe('preferential rendering', () => {
      let a4aElement;
      let a4a;
      let fixture;
      beforeEach(() => createIframePromise().then(f => {
        fixture = f;
        setupForAdTesting(fixture);
        fetchMock.getOnce(
            TEST_URL + '&__amp_source_origin=about%3Asrcdoc', () => adResponse,
            {name: 'ad'});
        a4aElement = createA4aElement(fixture.doc);
        a4a = new MockA4AImpl(a4aElement);
        a4a.releaseType_ = '0';
        return fixture;
      }));

      it('by default not allowed if crypto signature present but no SSL',
          () => {
            sandbox.stub(Services.cryptoFor(fixture.win), 'isPkcsAvailable')
                .returns(false);
            a4a.buildCallback();
            a4a.onLayoutMeasure();
            return a4a.layoutCallback().then(() => {
              expect(a4aElement.querySelector('iframe[src]')).to.be.ok;
              expect(a4aElement.querySelector('iframe[srcdoc]')).to.not.be.ok;
            });
          });

      it('allowed if crypto signature present, no SSL, and overrided' +
         ' shouldPreferentialRenderWithoutCrypto', () => {
        sandbox.stub(Services.cryptoFor(fixture.win), 'isPkcsAvailable')
            .returns(false);
        sandbox.stub(
            AmpA4A.prototype,
            'shouldPreferentialRenderWithoutCrypto').callsFake(
            () => true);
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        return a4a.layoutCallback().then(() => {
          verifyA4ARender(a4aElement);
        });
      });

      it('not allowed if no crypto signature present', () => {
        delete adResponse.headers['AMP-Fast-Fetch-Signature'];
        delete adResponse.headers[AMP_SIGNATURE_HEADER];
        sandbox.stub(
            AmpA4A.prototype,
            'shouldPreferentialRenderWithoutCrypto').callsFake(
            () => true);
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        return a4a.layoutCallback().then(() => {
          expect(a4aElement.querySelector('iframe[src]')).to.be.ok;
          expect(a4aElement.querySelector('iframe[srcdoc]')).to.not.be.ok;
        });
      });
    });

    it('shouldPreferentialRenderWithoutCrypto returns false by default', () => {
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const {doc} = fixture;
        const a4aElement = createA4aElement(doc);
        const a4a = new AmpA4A(a4aElement);
        expect(a4a.shouldPreferentialRenderWithoutCrypto()).to.be.false;
      });
    });
  });

  // TODO(tdrl): Other cases to handle for parsing JSON metadata:
  //   - Metadata tag(s) missing
  //   - JSON parse failure
  //   - Tags present, but JSON empty
  // Other cases to handle for CSS reformatting:
  //   - CSS embedded in larger doc
  //   - Multiple replacement offsets
  //   - Erroneous replacement offsets
  // Other cases to handle for body reformatting:
  //   - All
});


describes.realWin('AmpA4a-RTC', {amp: true}, env => {
  let element;
  let a4a;
  let sandbox;
  let errorSpy;

  beforeEach(() => {
    sandbox = env.sandbox;
    // ensures window location == AMP cache passes
    env.win.AMP_MODE.test = true;
    const doc = env.win.document;
    element = createElementWithAttributes(env.win.document, 'amp-ad', {
      'width': '200',
      'height': '50',
      'type': 'doubleclick',
      'layout': 'fixed',
    });
    doc.body.appendChild(element);
    a4a = new AmpA4A(element);
    errorSpy = sandbox.spy(user(), 'error');
  });

  describe('#tryExecuteRealTimeConfig', () => {
    beforeEach(() => {
      AMP.RealTimeConfigManager = undefined;
    });

    it('should not execute if RTC never imported', () => {
      expect(a4a.tryExecuteRealTimeConfig_()).to.be.undefined;
    });
    it('should log user error if RTC Config set but RTC not supported', () => {
      element.setAttribute('rtc-config',
          JSON.stringify({'urls': ['https://a.com']}));
      expect(allowConsoleError(() => a4a.tryExecuteRealTimeConfig_()))
          .to.be.undefined;
      expect(errorSpy.calledOnce).to.be.true;
      expect(errorSpy.calledWith(
          'amp-a4a',
          'RTC not supported for ad network doubleclick')).to.be.true;
    });
  });

  describe('#getCustomRealTimeConfigMacros_', () => {
    it('should return empty object', () => {
      expect(a4a.getCustomRealTimeConfigMacros_()).to.deep.equal({});
    });
  });

  describe('#inNonAmpPreferenceExp', () => {
    [
      {},
      {type: 'doubleclick', prefVal: true, expected: true},
      {type: 'adsense', prefVal: true, expected: true},
      {type: 'adsense', prefVal: 'true', expected: true},
      {type: 'doubleclick', prefVal: false},
      {type: 'adsense', prefVal: false},
      {type: 'doubleclick'},
      {type: 'doubleclick', prefVal: ''},
      {type: 'otherNetwork', prefVal: true},
    ].forEach(test =>
      it(JSON.stringify(test), () => {
        const {type, prefVal, expected} = test;
        if (type) {
          a4a.element.setAttribute('type', type);
        }
        a4a.postAdResponseExperimentFeatures['pref_neutral_enabled'] = prefVal;
        expect(a4a.inNonAmpPreferenceExp()).to.equal(!!expected);
      }));
  });

  describe('#sandboxHTMLCreativeFrame', () => {
    it('should return true if experiment enabled', () => {
      toggleExperiment(a4a.win, 'sandbox-ads', true);
      expect(a4a.sandboxHTMLCreativeFrame()).to.be.true;
    });

    it('should return true if experiment disabled', () => {
      toggleExperiment(a4a.win, 'sandbox-ads', false);
      expect(a4a.sandboxHTMLCreativeFrame()).to.be.false;
    });
  });

  describe('single pass experiments', () => {
    it('should add single pass id', () => {
      getMode().singlePassType = 'sp';
      a4a.maybeAddSinglePassExperiment();

      const isInSinglePass = isInExperiment(
          a4a.element, SINGLE_PASS_EXPERIMENT_IDS.SINGLE_PASS);
      const isInMultiPass = isInExperiment(
          a4a.element, SINGLE_PASS_EXPERIMENT_IDS.MULTI_PASS);

      expect(isInSinglePass).to.be.true;
      expect(isInMultiPass).to.be.false;

      getMode().singlePassType = '';
    });

    it('should add multi pass id', () => {
      getMode().singlePassType = 'mp';
      a4a.maybeAddSinglePassExperiment();

      const isInSinglePass = isInExperiment(
          a4a.element, SINGLE_PASS_EXPERIMENT_IDS.SINGLE_PASS);
      const isInMultiPass = isInExperiment(
          a4a.element, SINGLE_PASS_EXPERIMENT_IDS.MULTI_PASS);

      expect(isInSinglePass).to.be.false;
      expect(isInMultiPass).to.be.true;

      getMode().singlePassType = '';
    });

    it('should not add any single pass experiment ids', () => {
      getMode().singlePassType = undefined;
      a4a.maybeAddSinglePassExperiment();

      const isInSinglePass = isInExperiment(
          a4a.element, SINGLE_PASS_EXPERIMENT_IDS.SINGLE_PASS);
      const isInMultiPass = isInExperiment(
          a4a.element, SINGLE_PASS_EXPERIMENT_IDS.MULTI_PASS);

      expect(isInSinglePass).to.be.false;
      expect(isInMultiPass).to.be.false;
    });
  });
});
