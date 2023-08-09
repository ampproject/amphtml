import '../../../amp-ad/0.1/amp-ad-xorigin-iframe-handler';
// Need the following side-effect import because in actual production code,
// Fast Fetch impls are always loaded via an AmpAd tag, which means AmpAd is
// always available for them. However, when we test an impl in isolation,
// AmpAd is not loaded already, so we need to load it separately.
import '../../../amp-ad/0.1/amp-ad';
// The following namespaces are imported so that we can stub and spy on certain
// methods in tests.
import {CONSENT_POLICY_STATE} from '#core/constants/consent-state';
import {Signals} from '#core/data-structures/signals';
import {createElementWithAttributes} from '#core/dom';
import {LayoutPriority_Enum} from '#core/dom/layout';
import {layoutRectLtwh, layoutSizeFromRect} from '#core/dom/layout/rect';

import {Services} from '#service';
import {AmpDoc, installDocService} from '#service/ampdoc-impl';
import {resetScheduledElementForTesting} from '#service/custom-element-registry';
import {Extensions} from '#service/extensions-impl';
import {installRealTimeConfigServiceForDoc} from '#service/real-time-config/real-time-config-impl';

import * as analytics from '#utils/analytics';
import {dev, user} from '#utils/log';
import * as privacySandboxUtils from '#utils/privacy-sandbox-utils';

import {macroTask} from '#testing/helpers';
import {createIframePromise} from '#testing/iframe';

import {FetchMock, networkFailure} from './fetch-mock';
import {data as testFragments} from './testdata/test_fragments';
import {data as validCSSAmp} from './testdata/valid_css_at_rules_amp.reserialized';
import {MockA4AImpl, TEST_URL} from './utils';

import {cancellation} from '../../../../src/error-reporting';
import * as analyticsExtension from '../../../../src/extension-analytics';
import {FriendlyIframeEmbed} from '../../../../src/friendly-iframe-embed';
import * as mode from '../../../../src/mode';
import {AmpAdXOriginIframeHandler} from '../../../amp-ad/0.1/amp-ad-xorigin-iframe-handler';
import {
  incrementLoadingAds,
  is3pThrottled,
} from '../../../amp-ad/0.1/concurrent-load';
import {GEO_IN_GROUP} from '../../../amp-geo/0.1/amp-geo-in-group';
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
import {AMP_SIGNATURE_HEADER, VerificationStatus} from '../signature-verifier';

describes.realWin('amp-a4a: no signing', {amp: true}, (env) => {
  let doc;
  let element;
  let a4a;
  let attachShadowStub;

  beforeEach(() => {
    doc = env.win.document;
    env.sandbox.stub(AmpA4A.prototype, 'isInNoSigningExp').returns(true);
    element = createElementWithAttributes(env.win.document, 'amp-ad', {
      'width': '300',
      'height': '250',
      'type': 'doubleclick',
      'layout': 'fixed',
    });
    doc.body.appendChild(element);
    a4a = new AmpA4A(element);
    // Make the ad think it has size.
    env.sandbox.stub(a4a, 'getIntersectionElementLayoutBox').returns({
      height: 250,
      width: 300,
    });
    env.sandbox.stub(a4a, 'getAdUrl').returns('https://adnetwork.com');
    env.fetchMock.mock(
      'begin:https://adnetwork.com',
      validCSSAmp.minifiedCreative
    );

    attachShadowStub = env.sandbox.stub(
      env.win.Element.prototype,
      'attachShadow'
    );
    // Emulate native function.
    attachShadowStub.value(function () {
      return '[native code]';
    });
  });

  it('should contain the correct csp meta content', async () => {
    await a4a.buildCallback();
    a4a.onLayoutMeasure();
    await a4a.layoutCallback();
    const fie = doc.body.querySelector('iframe[srcdoc]');
    expect(fie.getAttribute('sandbox')).to.equal(
      'allow-forms allow-popups allow-popups-to-escape-sandbox ' +
        'allow-same-origin allow-scripts allow-top-navigation'
    );
    const cspMeta = fie.contentDocument.querySelector(
      'meta[http-equiv=Content-Security-Policy]'
    );
    expect(cspMeta).to.be.ok;
    expect(cspMeta.content).to.include('img-src * data:;');
    expect(cspMeta.content).to.include('media-src *;');
    expect(cspMeta.content).to.include('font-src *;');
    expect(cspMeta.content).to.include('connect-src *;');
    expect(cspMeta.content).to.include(
      'script-src http://localhost:8000/dist/lts/ ' +
        'http://localhost:8000/dist/rtv/ ' +
        'http://localhost:8000/dist/sw/;'
    );
    expect(cspMeta.content).to.include("object-src 'none';");
    expect(cspMeta.content).to.include("child-src 'none';");
    expect(cspMeta.content).to.include("default-src 'none';");
    expect(cspMeta.content).to.include(
      'style-src ' +
        'https://cdn.materialdesignicons.com ' +
        'https://cloud.typography.com ' +
        'https://fast.fonts.net ' +
        'https://fonts.googleapis.com ' +
        'https://maxcdn.bootstrapcdn.com https://p.typekit.net https://pro.fontawesome.com ' +
        'https://use.fontawesome.com ' +
        'https://use.typekit.net ' +
        "'unsafe-inline';"
    );
  });

  it('should set the correct sandbox features', async () => {
    env.sandbox.stub(Services.platformFor(env.win), 'isSafari').returns(false);
    await a4a.buildCallback();
    a4a.onLayoutMeasure();
    await a4a.layoutCallback();
    const fie = doc.body.querySelector('iframe[srcdoc]');
    expect(fie.getAttribute('sandbox')).to.equal(
      'allow-forms allow-popups allow-popups-to-escape-sandbox ' +
        'allow-same-origin allow-scripts allow-top-navigation'
    );
  });

  it('FIE should contain <base> with adurl', async () => {
    await a4a.buildCallback();
    a4a.onLayoutMeasure();
    await a4a.layoutCallback();
    const fie = doc.body.querySelector('iframe[srcdoc]');
    const base = fie.contentDocument.querySelector('base');
    expect(base).to.be.ok;
    expect(base.href).to.equal('https://adnetwork.com/');
  });

  it('should complete the rendering FIE', async () => {
    const prioritySpy = env.sandbox.spy(a4a, 'updateLayoutPriority');
    await a4a.buildCallback();
    a4a.onLayoutMeasure();
    await a4a.layoutCallback();
    const fie = doc.body.querySelector('iframe[srcdoc]');
    expect(fie).to.be.ok;
    expect(fie.contentDocument.body.textContent).to.contain.string(
      'Hello, world.'
    );
    expect(prioritySpy).to.be.calledWith(LayoutPriority_Enum.CONTENT);
  });

  it('should not throw on polyfill scripts', async () => {
    env.sandbox.stub(mode, 'getMode').returns({localDev: false});
    await a4a.buildCallback();
    a4a.onLayoutMeasure();
    await a4a.layoutCallback();
    const fie = doc.body.querySelector('iframe[srcdoc]');
    const violationSpy = env.sandbox.spy();
    fie.contentWindow.addEventListener('securitypolicyviolation', violationSpy);
    const fakePolyfill = doc.createElement('script');
    fakePolyfill.src = 'https://cdn.ampproject.org/rtv/some-polyfill.js';
    fie.contentDocument.head.appendChild(fakePolyfill);
    await macroTask();
    expect(violationSpy).not.to.be.called;
  });

  it('should throw on non-approved injected scripts', async () => {
    env.sandbox.stub(mode, 'getMode').returns({localDev: false});
    await a4a.buildCallback();
    a4a.onLayoutMeasure();
    await a4a.layoutCallback();
    const fie = doc.body.querySelector('iframe[srcdoc]');
    const violationSpy = env.sandbox.spy();
    fie.contentWindow.addEventListener('securitypolicyviolation', violationSpy);
    const fakePolyfill = doc.createElement('script');
    fakePolyfill.src = 'https://www.cats.example';
    fie.contentDocument.head.appendChild(fakePolyfill);
    await macroTask();
    expect(violationSpy).to.be.called;
  });

  it('should collapse on no content', async () => {
    env.fetchMock.config.overwriteRoutes = true;
    env.fetchMock.mock('begin:https://adnetwork.com', ''); // no content.
    const iframe3pInit = env.sandbox
      .stub(AmpAdXOriginIframeHandler.prototype, 'init')
      .resolves();
    const collapseSpy = env.sandbox.spy(a4a, 'forceCollapse');

    await a4a.buildCallback();
    a4a.onLayoutMeasure();
    await a4a.layoutCallback();
    expect(collapseSpy).to.be.called;
    expect(iframe3pInit).not.to.be.called;
  });

  it('should fallback to x-domain without ⚡️4ads', async () => {
    env.fetchMock.config.overwriteRoutes = true;
    env.fetchMock.mock(
      'begin:https://adnetwork.com',
      testFragments.minimalDocOneStyle
    );
    const iframe3pInit = env.sandbox
      .stub(AmpAdXOriginIframeHandler.prototype, 'init')
      .resolves();
    await a4a.buildCallback();
    a4a.onLayoutMeasure();
    await a4a.layoutCallback();
    expect(iframe3pInit).to.be.called;
  });

  it('should not try to validate if #skipClientSideValidation', async () => {
    const fallbackSpy = env.sandbox.spy(a4a, 'handleFallback_');
    env.sandbox.stub(a4a, 'skipClientSideValidation').returns(true);
    await a4a.buildCallback();
    a4a.onLayoutMeasure();
    await a4a.adPromise_;
    expect(fallbackSpy).to.be.called;
  });

  it('should validate if #skipClientSideValidation == false', async () => {
    const fallbackSpy = env.sandbox.spy(a4a, 'handleFallback_');
    env.sandbox.stub(a4a, 'skipClientSideValidation').returns(false);
    await a4a.buildCallback();
    await a4a.onLayoutMeasure();
    await a4a.adPromise_;
    expect(fallbackSpy).not.to.be.called;
  });

  it('should fallback when shadow DOM is not supported', async () => {
    attachShadowStub.value(undefined);
    const fallbackSpy = env.sandbox.spy(a4a, 'handleFallback_');
    env.sandbox.stub(a4a, 'skipClientSideValidation').returns(false);
    await a4a.buildCallback();
    a4a.onLayoutMeasure();
    await a4a.adPromise_;
    expect(fallbackSpy).to.be.called;
  });

  it('should fallback when shadow DOM is polyfilled', async () => {
    attachShadowStub.value(function () {
      // A non-native function.
      return null;
    });
    const fallbackSpy = env.sandbox.spy(a4a, 'handleFallback_');
    env.sandbox.stub(a4a, 'skipClientSideValidation').returns(false);
    await a4a.buildCallback();
    a4a.onLayoutMeasure();
    await a4a.adPromise_;
    expect(fallbackSpy).to.be.called;
  });
});

describes.realWin('amp-a4a', {amp: true}, (env) => {
  const IFRAME_SANDBOXING_FLAGS = [
    'allow-forms',
    'allow-modals',
    'allow-pointer-lock',
    'allow-popups',
    'allow-popups-to-escape-sandbox',
    'allow-same-origin',
    'allow-scripts',
    'allow-top-navigation-by-user-activation',
  ];

  let fetchMock;
  let getSigningServiceNamesMock;
  let whenVisibleMock;
  let adResponse;
  let onCreativeRenderSpy;
  let getResourceStub;

  beforeEach(() => {
    fetchMock = null;
    getSigningServiceNamesMock = env.sandbox.stub(
      AmpA4A.prototype,
      'getSigningServiceNames'
    );
    onCreativeRenderSpy = env.sandbox.spy(AmpA4A.prototype, 'onCreativeRender');
    getSigningServiceNamesMock.returns(['google']);
    whenVisibleMock = env.sandbox.stub(AmpDoc.prototype, 'whenFirstVisible');
    whenVisibleMock.returns(Promise.resolve());
    getResourceStub = env.sandbox.stub(AmpA4A.prototype, 'getResource');
    getResourceStub.returns({
      getUpgradeDelayMs: () => 12345,
    });
    adResponse = {
      headers: {
        'AMP-Fast-Fetch-Signature': validCSSAmp.signatureHeader,
      },
      body: validCSSAmp.reserialized,
    };
    adResponse.headers[AMP_SIGNATURE_HEADER] = validCSSAmp.signatureHeader;
  });

  afterEach(() => {
    if (fetchMock) {
      fetchMock./*OK*/ restore();
      fetchMock = null;
    }
    resetScheduledElementForTesting(env.win, 'amp-a4a');
  });

  /**
   * Sets up testing by loading iframe within which test runs.
   * @param {FixtureInterface} fixture
   */
  function setupForAdTesting(fixture) {
    expect(fetchMock).to.be.null;
    fetchMock = new FetchMock(fixture.win);
    fetchMock.getOnce(
      'https://cdn.ampproject.org/amp-ad-verifying-keyset.json',
      {
        body: validCSSAmp.publicKeyset,
        status: 200,
        headers: {'Content-Type': 'application/jwk-set+json'},
      }
    );
    installDocService(fixture.win, /* isSingleDoc */ true);
    const {doc} = fixture;
    // TODO(a4a-cam@): This is necessary in the short term, until A4A is
    // smarter about host document styling.  The issue is that it needs to
    // inherit the AMP runtime style element in order for shadow DOM-enclosed
    // elements to behave properly.  So we have to set up a minimal one here.
    const ampStyle = doc.createElement('style');
    ampStyle.setAttribute('amp-runtime', 'scratch-fortesting');
    doc.head.appendChild(ampStyle);

    // Emulate native shadow DOM support. Will be reverted for some tests.
    const attachShadowStub = env.sandbox.stub(
      fixture.win.Element.prototype,
      'attachShadow'
    );
    attachShadowStub.value(function () {
      return '[native code]';
    });
    return {attachShadowStub};
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
    const layoutBox = opt_rect || layoutRectLtwh(0, 0, 200, 50);
    element.getAmpDoc = () => {
      const ampdocService = Services.ampdocServiceFor(doc.defaultView);
      return ampdocService.getAmpDoc(element);
    };
    element.isBuilt = () => {
      return true;
    };
    element.getLayout = () => 'fixed';
    element.getLayoutBox = () => layoutBox;
    element.getLayoutSize = () => layoutSizeFromRect(layoutBox);
    element.getIntersectionChangeEntry = () => {
      return {
        time: null,
        boundingClientRect: {},
        rootBounds: {},
        intersectionRect: {},
      };
    };
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
    const offsets = {...(opt_additionalInfo || {})};
    offsets.ampRuntimeUtf16CharOffsets = [
      baseTestDoc.indexOf('<style amp4ads-boilerplate'),
      baseTestDoc.lastIndexOf('</script>') + '</script>'.length,
    ];
    const splicePoint = baseTestDoc.indexOf('</body>');
    return (
      baseTestDoc.slice(0, splicePoint) +
      '<script type="application/json" amp-ad-metadata>' +
      JSON.stringify(offsets) +
      '</script>' +
      baseTestDoc.slice(splicePoint)
    );
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
    expect(friendlyChild.getAttribute('srcdoc')).to.have.string('<html ⚡4ads');
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
        IFRAME_SANDBOXING_FLAGS
      );
    }
  }

  /**
   * Checks that element is an amp-ad that is rendered via SafeFrame.
   * @param {!Element} element
   * @param {string} sfVersion
   * @param {boolean=} shouldSandbox
   */
  function verifySafeFrameRender(element, sfVersion, shouldSandbox = true) {
    expect(element.tagName.toLowerCase()).to.equal('amp-a4a');
    expect(element).to.be.visible;
    expect(element.querySelectorAll('iframe')).to.have.lengthOf(1);
    const safeFrameUrl =
      'googlesyndication.com/safeframe/' + sfVersion + '/html/container.html';
    const child = element.querySelector(`iframe[src*="${safeFrameUrl}"][name]`);
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
  function verifyNameFrameRender(element, shouldSandbox = true) {
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
  function verifyCachedContentIframeRender(
    element,
    srcUrl,
    shouldSandbox = true
  ) {
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
    expect(() => {
      attributes = JSON.parse(nameData);
    }).not.to.throw(Error);
    expect(attributes).to.be.ok;
    verifyContext(attributes._context);
  }

  /**
   * @param {!AmpA4A} a4a
   * @param {!Function} triggerAnalyticsEventSpy
   * @param {(string|Array<string>)=} additionalEvents
   */
  function verifyA4aAnalyticsTriggersWereFired(
    a4a,
    triggerAnalyticsEventSpy,
    additionalEvents = []
  ) {
    [
      'ad-request-start',
      'ad-response-end',
      'ad-render-start',
      'ad-render-end',
      'ad-iframe-loaded',
    ]
      .concat(additionalEvents)
      .forEach((evnt) =>
        expect(triggerAnalyticsEventSpy).to.be.calledWith(a4a.element, evnt, {
          'time': env.sandbox.match.number,
        })
      );
  }

  describe('ads are visible', () => {
    let a4aElement;
    let a4a;
    let fixture;
    beforeEach(async () => {
      fixture = await createIframePromise();
      setupForAdTesting(fixture);
      fetchMock.getOnce(
        TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
        () => adResponse,
        {name: 'ad'}
      );
      a4aElement = createA4aElement(fixture.doc);
      a4a = new MockA4AImpl(a4aElement);
      a4a.releaseType_ = '0';
      return fixture;
    });

    it('for SafeFrame rendering case', async () => {
      // Make sure there's no signature, so that we go down the 3p iframe path.
      adResponse.body = adResponse.body.replace('⚡4ads', '');
      delete adResponse.headers['AMP-Fast-Fetch-Signature'];
      delete adResponse.headers[AMP_SIGNATURE_HEADER];
      // If rendering type is safeframe, we SHOULD attach a SafeFrame.
      adResponse.headers[RENDERING_TYPE_HEADER] = 'safeframe';
      a4a.buildCallback();
      const lifecycleEventStub = env.sandbox.stub(
        a4a,
        'maybeTriggerAnalyticsEvent_'
      );
      a4a.onLayoutMeasure();
      await a4a.layoutCallback();
      const child = a4aElement.querySelector('iframe[name]');
      expect(child).to.be.ok;
      expect(child).to.be.visible;
      expect(onCreativeRenderSpy.withArgs(null)).to.be.called;
      expect(lifecycleEventStub).to.be.calledWith('renderSafeFrameStart');
    });

    it('for ios defaults to SafeFrame rendering', async () => {
      const platform = Services.platformFor(fixture.win);
      env.sandbox.stub(platform, 'isIos').returns(true);
      a4a = new MockA4AImpl(a4aElement);
      // Make sure there's no signature, so that we go down the 3p iframe path.
      adResponse.body = adResponse.body.replace('⚡4ads', '');
      delete adResponse.headers['AMP-Fast-Fetch-Signature'];
      delete adResponse.headers[AMP_SIGNATURE_HEADER];
      // Ensure no rendering type header (ios on safari will default to
      // safeframe).
      delete adResponse.headers[RENDERING_TYPE_HEADER];
      fixture.doc.body.appendChild(a4aElement);
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      await a4a.layoutCallback();
      const child = a4aElement.querySelector('iframe[name]');
      expect(child).to.be.ok;
      expect(child).to.be.visible;
      expect(onCreativeRenderSpy.withArgs(null)).to.be.called;
    });

    it('for cached content iframe rendering case', async () => {
      // Make sure there's no signature, so that we go down the 3p iframe path.
      adResponse.body = adResponse.body.replace('⚡4ads', '');
      delete adResponse.headers['AMP-Fast-Fetch-Signature'];
      delete adResponse.headers[AMP_SIGNATURE_HEADER];
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      await a4a.layoutCallback();
      const child = a4aElement.querySelector('iframe[src]');
      expect(child).to.be.ok;
      expect(child).to.be.visible;
      expect(onCreativeRenderSpy.withArgs(null)).to.be.called;
    });

    it('populates postAdResponseExperimentFeatures', async () => {
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      await a4a.layoutCallback();
      const child = a4aElement.querySelector('iframe[srcdoc]');
      expect(child).to.be.ok;
      expect(
        child.srcdoc.indexOf('meta http-equiv=Content-Security-Policy')
      ).to.not.equal(-1);
    });

    it('for A4A friendly iframe rendering case', async () => {
      expect(a4a.friendlyIframeEmbed_).to.not.exist;
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      await a4a.layoutCallback();
      const child = a4aElement.querySelector('iframe[srcdoc]');
      expect(child).to.be.ok;
      expect(child).to.be.visible;
      const a4aBody = child.contentDocument.body;
      expect(a4aBody).to.be.ok;
      expect(a4aBody).to.be.visible;
      expect(a4a.friendlyIframeEmbed_).to.exist;
    });

    it('detachedCallback should destroy FIE and detach frame', async () => {
      const fieDestroySpy = env.sandbox./*OK*/ spy(
        FriendlyIframeEmbed.prototype,
        'destroy'
      );
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      await a4a.layoutCallback();
      a4a.detachedCallback();
      expect(fieDestroySpy).to.be.called;
      expect(a4aElement.querySelector('iframe')).to.not.be.ok;
    });

    it('for A4A layout should resolve once FIE is created', async () => {
      // This test calls renderAmpCreative before onlayoutMeasure has
      // populated adUrl_. This cannot happen in real world because rendering
      // is blocked by A4A.adPromise_.
      a4a.adUrl_ = 'https://adnetwork.com';
      a4a.buildCallback();
      a4a.onLayoutMeasure();

      // Never resolve
      env.sandbox
        ./*OK*/ stub(FriendlyIframeEmbed.prototype, 'whenIniLoaded')
        .callsFake(() => {
          return new Promise(() => {});
        });
      const creativeString = buildCreativeString();
      const metaData = a4a.getAmpAdMetadata(creativeString);
      await a4a.renderAmpCreative_(metaData);
      expect(a4a.friendlyIframeEmbed_).to.exist;
      expect(a4a.friendlyIframeEmbed_.host).to.equal(a4a.element);
    });

    it('should fire amp-analytics triggers for lifecycle events', async () => {
      let iniLoadResolver;
      const iniLoadPromise = new Promise((resolve) => {
        iniLoadResolver = resolve;
      });
      const whenIniLoadedStub = env.sandbox
        .stub(FriendlyIframeEmbed.prototype, 'whenIniLoaded')
        .callsFake(() => iniLoadPromise);
      a4a.buildCallback();
      const triggerAnalyticsEventSpy = env.sandbox.spy(
        analytics,
        'triggerAnalyticsEvent'
      );
      a4a.onLayoutMeasure();
      const layoutPromise = a4a.layoutCallback();
      expect(whenIniLoadedStub).to.not.be.called;
      iniLoadResolver();
      await layoutPromise;
      verifyA4aAnalyticsTriggersWereFired(a4a, triggerAnalyticsEventSpy);
    });

    it('for requests from insecure HTTP pages', async () => {
      // TODO(ccordry): delete this test when we remove crypto.
      if (NO_SIGNING_RTV) {
        return;
      }
      env.sandbox
        .stub(Services.cryptoFor(fixture.win), 'isPkcsAvailable')
        .returns(false);
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      await a4a.layoutCallback();
      const child = a4aElement.querySelector('iframe[src]');
      expect(child).to.be.ok;
      expect(child).to.be.visible;
      expect(onCreativeRenderSpy.withArgs(null)).to.be.called;
    });

    it('should fire amp-analytics triggers', async () => {
      const triggerAnalyticsEventSpy = env.sandbox.spy(
        analytics,
        'triggerAnalyticsEvent'
      );
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      env.sandbox
        ./*OK*/ stub(FriendlyIframeEmbed.prototype, 'whenIniLoaded')
        .callsFake(() => Promise.resolve());
      await a4a.layoutCallback();
      verifyA4aAnalyticsTriggersWereFired(a4a, triggerAnalyticsEventSpy);
    });

    it('should not fire amp-analytics triggers without config', async () => {
      env.sandbox
        .stub(MockA4AImpl.prototype, 'getA4aAnalyticsConfig')
        .callsFake(() => null);
      a4a = new MockA4AImpl(a4aElement);
      const triggerAnalyticsEventSpy = env.sandbox.spy(
        analytics,
        'triggerAnalyticsEvent'
      );
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      await a4a.layoutCallback();
      expect(triggerAnalyticsEventSpy).to.not.be.called;
    });

    it('should insert an amp-analytics element', async () => {
      env.sandbox
        .stub(MockA4AImpl.prototype, 'getA4aAnalyticsConfig')
        .callsFake(() => ({'foo': 'bar'}));
      a4a = new MockA4AImpl(a4aElement);
      const insertAnalyticsElementSpy = env.sandbox.spy(
        analyticsExtension,
        'insertAnalyticsElement'
      );
      await a4a.buildCallback();
      expect(insertAnalyticsElementSpy).to.be.calledWith(
        a4a.element,
        {'foo': 'bar'},
        true /* loadAnalytics */
      );
    });

    it('should not insert an amp-analytics element if config is null', () => {
      env.sandbox
        .stub(MockA4AImpl.prototype, 'getA4aAnalyticsConfig')
        .callsFake(() => null);
      a4a = new MockA4AImpl(a4aElement);
      const insertAnalyticsElementSpy = env.sandbox.spy(
        analyticsExtension,
        'insertAnalyticsElement'
      );
      a4a.buildCallback();
      expect(insertAnalyticsElementSpy).not.to.be.called;
    });
  });

  describe('layoutCallback cancels properly', () => {
    let a4aElement;
    let a4a;
    let fixture;
    beforeEach(async () => {
      fixture = await createIframePromise();

      setupForAdTesting(fixture);
      fetchMock.getOnce(
        TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
        () => adResponse,
        {name: 'ad'}
      );
      a4aElement = createA4aElement(fixture.doc);
      a4a = new MockA4AImpl(a4aElement);
      return fixture;
    });

    it('when unlayoutCallback called after adPromise', async () => {
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      let promiseResolver;
      a4a.adPromise_ = new Promise((resolver) => {
        promiseResolver = resolver;
      });
      const layoutCallbackPromise = a4a.layoutCallback();
      a4a.unlayoutCallback();
      const renderNonAmpCreativeSpy = env.sandbox.spy(
        AmpA4A.prototype,
        'renderNonAmpCreative'
      );
      promiseResolver();
      try {
        await layoutCallbackPromise;
        // We should never get in here.
        expect(false).to.be.true;
      } catch (err) {
        expect(renderNonAmpCreativeSpy).to.not.be.called;
        expect(err).to.be.ok;
        expect(err.message).to.equal('CANCELLED');
      }
    });

    it('when unlayoutCallback called before renderAmpCreative_', async () => {
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      let promiseResolver;
      a4a.renderAmpCreative_ = new Promise((resolver) => {
        promiseResolver = resolver;
      });
      const layoutCallbackPromise = a4a.layoutCallback();
      a4a.unlayoutCallback();

      promiseResolver();
      try {
        await layoutCallbackPromise;
        // We should never get in here.
        expect(false).to.be.true;
      } catch (err) {
        expect(err).to.be.ok;
        expect(err.message).to.equal('CANCELLED');
      }
    });
  });

  describe('cross-domain rendering', () => {
    let a4aElement;
    let a4a;
    beforeEach(async () => {
      // Make sure there's no signature, so that we go down the 3p iframe path.
      adResponse.body = adResponse.body.replace('⚡4ads', '');
      delete adResponse.headers['AMP-Fast-Fetch-Signature'];
      delete adResponse.headers[AMP_SIGNATURE_HEADER];
      // If rendering type is safeframe, we SHOULD attach a SafeFrame.
      adResponse.headers[RENDERING_TYPE_HEADER] = 'safeframe';
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      fetchMock.getOnce(
        TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
        () => adResponse,
        {name: 'ad'}
      );
      const {doc} = fixture;
      a4aElement = createA4aElement(doc);
      a4a = new MockA4AImpl(a4aElement);
      a4a.releaseType_ = '0';
      a4a.buildCallback();
      expect(onCreativeRenderSpy).to.not.be.called;
    });

    describe('#renderViaIframeGet', () => {
      beforeEach(() => {
        // Verify client cache iframe rendering.
        adResponse.headers[RENDERING_TYPE_HEADER] = 'client_cache';
        a4a.onLayoutMeasure();
      });

      it('should attach a client cached iframe when set', async () => {
        await a4a.layoutCallback();
        verifyCachedContentIframeRender(a4aElement, TEST_URL);
        expect(fetchMock.called('ad')).to.be.true;
      });

      it('should apply sandbox when sandboxHTMLCreativeFrame is true', async () => {
        a4a.sandboxHTMLCreativeFrame = () => true;
        a4a.onLayoutMeasure();
        await a4a.layoutCallback();
        verifyCachedContentIframeRender(
          a4aElement,
          TEST_URL,
          true /* shouldSandbox */
        );
        expect(fetchMock.called('ad')).to.be.true;
      });

      it('should not apply sandbox when sandboxHTMLCreativeFrame false', async () => {
        a4a.sandboxHTMLCreativeFrame = () => false;
        a4a.onLayoutMeasure();
        await a4a.layoutCallback();
        verifyCachedContentIframeRender(
          a4aElement,
          TEST_URL,
          false /* shouldSandbox */
        );
        expect(fetchMock.called('ad')).to.be.true;
      });

      it('should set feature policy for sync-xhr', async () => {
        a4a.sandboxHTMLCreativeFrame = () => true;
        a4a.onLayoutMeasure();
        await a4a.layoutCallback();
        verifyCachedContentIframeRender(a4aElement, TEST_URL, true);
        expect(a4a.iframe.getAttribute('allow')).to.equal("sync-xhr 'none';");
      });

      it('should set feature policy for attribution-reporting when supported', async () => {
        env.sandbox
          .stub(privacySandboxUtils, 'isAttributionReportingAllowed')
          .returns(true);
        a4a.sandboxHTMLCreativeFrame = () => true;
        a4a.onLayoutMeasure();
        await a4a.layoutCallback();
        verifyCachedContentIframeRender(a4aElement, TEST_URL, true);
        expect(a4a.iframe.getAttribute('allow')).to.equal(
          "sync-xhr 'none';attribution-reporting 'src';"
        );
      });

      it('should not set feature policy for attribution-reporting when not supported', async () => {
        env.sandbox
          .stub(privacySandboxUtils, 'isAttributionReportingAllowed')
          .returns(false);
        a4a.sandboxHTMLCreativeFrame = () => true;
        a4a.onLayoutMeasure();
        await a4a.layoutCallback();
        verifyCachedContentIframeRender(a4aElement, TEST_URL, true);
        expect(a4a.iframe.getAttribute('allow')).to.equal("sync-xhr 'none';");
      });
    });

    describe('illegal render mode value', () => {
      let devErrLogStub;
      beforeEach(() => {
        devErrLogStub = env.sandbox.stub(dev(), 'error');
        // If rendering type is unknown, should fall back to cached content
        // iframe and generate an error.
        adResponse.headers[RENDERING_TYPE_HEADER] = 'random illegal value';
        a4a.onLayoutMeasure();
      });

      it('should render via cached iframe', async () => {
        const triggerAnalyticsEventSpy = env.sandbox.spy(
          analytics,
          'triggerAnalyticsEvent'
        );
        await a4a.layoutCallback();
        verifyCachedContentIframeRender(a4aElement, TEST_URL);
        // Should have reported an error.
        expect(devErrLogStub).to.be.calledOnce;
        expect(devErrLogStub.getCall(0).args[1]).to.have.string(
          'random illegal value'
        );
        expect(fetchMock.called('ad')).to.be.true;
        verifyA4aAnalyticsTriggersWereFired(
          a4a,
          triggerAnalyticsEventSpy,
          'ad-iframe-loaded'
        );
      });

      it('should fire amp-analytics triggers for illegal render modes', async () => {
        const triggerAnalyticsEventSpy = env.sandbox.spy(
          analytics,
          'triggerAnalyticsEvent'
        );
        await a4a.layoutCallback();
        return verifyA4aAnalyticsTriggersWereFired(
          a4a,
          triggerAnalyticsEventSpy,
          'ad-iframe-loaded'
        );
      });
    });

    describe('#renderViaNameFrame', () => {
      beforeEach(() => {
        // If rendering type is nameframe, we SHOULD attach a NameFrame.
        adResponse.headers[RENDERING_TYPE_HEADER] = 'nameframe';
        a4a.onLayoutMeasure();
      });

      it('should attach a NameFrame when header is set', async () => {
        await a4a.layoutCallback();
        verifyNameFrameRender(a4aElement);
        expect(fetchMock.called('ad')).to.be.true;
      });

      it(
        'should make only one NameFrame even if onLayoutMeasure called ' +
          'multiple times',
        async () => {
          a4a.onLayoutMeasure();
          a4a.onLayoutMeasure();
          a4a.onLayoutMeasure();
          a4a.onLayoutMeasure();
          await a4a.layoutCallback();
          verifyNameFrameRender(a4aElement);
          expect(fetchMock.called('ad')).to.be.true;
        }
      );

      it('should apply sandbox when sandboxHTMLCreativeFrame is true', async () => {
        a4a.sandboxHTMLCreativeFrame = () => true;
        a4a.onLayoutMeasure();
        await a4a.layoutCallback();
        verifyNameFrameRender(a4aElement, true /* shouldSandbox */);
        expect(fetchMock.called('ad')).to.be.true;
      });

      it('should not apply sandbox when sandboxHTMLCreativeFrame false', async () => {
        a4a.sandboxHTMLCreativeFrame = () => false;
        a4a.onLayoutMeasure();
        await a4a.layoutCallback();
        verifyNameFrameRender(a4aElement, false /* shouldSandbox */);
        expect(fetchMock.called('ad')).to.be.true;
      });

      it('should set feature policy for attribution-reporting when supported', async () => {
        env.sandbox
          .stub(privacySandboxUtils, 'isAttributionReportingAllowed')
          .returns(true);
        a4a.sandboxHTMLCreativeFrame = () => false;
        a4a.onLayoutMeasure();
        await a4a.layoutCallback();
        verifyNameFrameRender(a4aElement, false /* shouldSandbox */);
        expect(a4a.iframe.getAttribute('allow')).to.equal(
          "sync-xhr 'none';attribution-reporting 'src';"
        );
      });

      it('should not set feature policy for attribution-reporting when not supported', async () => {
        env.sandbox
          .stub(privacySandboxUtils, 'isAttributionReportingAllowed')
          .returns(false);
        a4a.sandboxHTMLCreativeFrame = () => false;
        a4a.onLayoutMeasure();
        await a4a.layoutCallback();
        verifyNameFrameRender(a4aElement, false /* shouldSandbox */);
        expect(a4a.iframe.getAttribute('allow')).to.equal("sync-xhr 'none';");
      });

      ['', 'client_cache', 'safeframe', 'some_random_thing'].forEach(
        (headerVal) => {
          it(`should not attach a NameFrame when header is ${headerVal}`, async () => {
            const devStub = env.sandbox.stub(dev(), 'error');
            // Make sure there's no signature, so that we go down the 3p
            // iframe path.
            delete adResponse.headers['AMP-Fast-Fetch-Signature'];
            delete adResponse.headers[AMP_SIGNATURE_HEADER];
            // If rendering type is anything but nameframe, we SHOULD NOT
            // attach a NameFrame.
            adResponse.headers[RENDERING_TYPE_HEADER] = headerVal;
            a4a.onLayoutMeasure();
            await a4a.layoutCallback();
            if (headerVal == 'some_random_thing') {
              expect(
                devStub.withArgs(
                  'AMP-A4A',
                  `cross-origin render mode header ${headerVal}`
                )
              ).to.be.calledOnce;
            } else {
              expect(devStub).to.not.be.called;
            }
            const nameChild = a4aElement.querySelector(
              'iframe[src^="nameframe"]'
            );
            expect(nameChild).to.not.be.ok;
            if (headerVal != 'safeframe') {
              const unsafeChild = a4aElement.querySelector('iframe');
              expect(unsafeChild).to.be.ok;
              expect(unsafeChild.getAttribute('src')).to.have.string(TEST_URL);
            }
            expect(fetchMock.called('ad')).to.be.true;
          });
        }
      );

      it('should fire amp-analytics triggers for lifecycle stages', async () => {
        const triggerAnalyticsEventSpy = env.sandbox.spy(
          analytics,
          'triggerAnalyticsEvent'
        );
        await a4a.layoutCallback();
        return verifyA4aAnalyticsTriggersWereFired(
          a4a,
          triggerAnalyticsEventSpy,
          'ad-iframe-loaded'
        );
      });
    });

    describe('#renderViaSafeFrame', () => {
      beforeEach(() => {
        // If rendering type is safeframe, we SHOULD attach a SafeFrame.
        adResponse.headers[RENDERING_TYPE_HEADER] = 'safeframe';
        a4a.onLayoutMeasure();
      });

      it('should attach a SafeFrame when header is set', async () => {
        await a4a.layoutCallback();
        verifySafeFrameRender(a4aElement, DEFAULT_SAFEFRAME_VERSION);
        expect(fetchMock.called('ad')).to.be.true;
      });

      it('should use safeframe version header value', async () => {
        a4a.safeframeVersion = '1-2-3';
        await a4a.layoutCallback();
        verifySafeFrameRender(a4aElement, '1-2-3');
        expect(fetchMock.called('ad')).to.be.true;
      });

      it(
        'should make only one SafeFrame even if onLayoutMeasure called ' +
          'multiple times',
        async () => {
          a4a.onLayoutMeasure();
          a4a.onLayoutMeasure();
          a4a.onLayoutMeasure();
          a4a.onLayoutMeasure();
          await a4a.layoutCallback();
          verifySafeFrameRender(a4aElement, DEFAULT_SAFEFRAME_VERSION);
          expect(fetchMock.called('ad')).to.be.true;
        }
      );

      it('should apply sandbox when sandboxHTMLCreativeFrame is true', async () => {
        a4a.sandboxHTMLCreativeFrame = () => true;
        a4a.onLayoutMeasure();
        await a4a.layoutCallback();
        verifySafeFrameRender(
          a4aElement,
          DEFAULT_SAFEFRAME_VERSION,
          true /* shouldSandbox */
        );
        expect(fetchMock.called('ad')).to.be.true;
      });

      it('should not apply sandbox when sandboxHTMLCreativeFrame false', async () => {
        a4a.sandboxHTMLCreativeFrame = () => false;
        a4a.onLayoutMeasure();
        await a4a.layoutCallback();
        verifySafeFrameRender(
          a4aElement,
          DEFAULT_SAFEFRAME_VERSION,
          false /* shouldSandbox */
        );
        expect(fetchMock.called('ad')).to.be.true;
      });

      it('should set feature policy for attribution-reporting when supported', async () => {
        env.sandbox
          .stub(privacySandboxUtils, 'isAttributionReportingAllowed')
          .returns(true);
        a4a.sandboxHTMLCreativeFrame = () => false;
        a4a.onLayoutMeasure();
        await a4a.layoutCallback();
        verifySafeFrameRender(
          a4aElement,
          DEFAULT_SAFEFRAME_VERSION,
          false /* shouldSandbox */
        );
        expect(a4a.iframe.getAttribute('allow')).to.equal(
          "sync-xhr 'none';attribution-reporting 'src';"
        );
      });

      it('should not set feature policy for attribution-reporting when not supported', async () => {
        env.sandbox
          .stub(privacySandboxUtils, 'isAttributionReportingAllowed')
          .returns(false);
        a4a.sandboxHTMLCreativeFrame = () => false;
        a4a.onLayoutMeasure();
        await a4a.layoutCallback();
        verifySafeFrameRender(
          a4aElement,
          DEFAULT_SAFEFRAME_VERSION,
          false /* shouldSandbox */
        );
        expect(a4a.iframe.getAttribute('allow')).to.equal("sync-xhr 'none';");
      });

      ['', 'client_cache', 'nameframe', 'some_random_thing'].forEach(
        (headerVal) => {
          it(`should not attach a SafeFrame when header is ${headerVal}`, async () => {
            const devStub = env.sandbox.stub(dev(), 'error');
            // If rendering type is anything but safeframe, we SHOULD NOT
            // attach a SafeFrame.
            adResponse.headers[RENDERING_TYPE_HEADER] = headerVal;
            a4a.onLayoutMeasure();
            await a4a.layoutCallback();
            if (headerVal == 'some_random_thing') {
              expect(
                devStub.withArgs(
                  'AMP-A4A',
                  `cross-origin render mode header ${headerVal}`
                )
              ).to.be.calledOnce;
            } else {
              expect(devStub).to.not.be.called;
            }
            const safeframeUrl =
              '.googlesyndication.com/safeframe/' +
              DEFAULT_SAFEFRAME_VERSION +
              '/html/container.html';
            const safeChild = a4aElement.querySelector(
              `iframe[src*="${safeframeUrl}"]`
            );
            expect(safeChild).to.not.be.ok;
            if (headerVal != 'nameframe') {
              const unsafeChild = a4aElement.querySelector('iframe');
              expect(unsafeChild).to.be.ok;
              expect(unsafeChild.getAttribute('src')).to.have.string(TEST_URL);
            }
            expect(fetchMock.called('ad')).to.be.true;
          });
        }
      );

      it('should reset state to null on unlayoutCallback', async () => {
        await a4a.layoutCallback();
        expect(a4a.experimentalNonAmpCreativeRenderMethod_).to.equal(
          'safeframe'
        );
        a4a.unlayoutCallback();
        expect(a4a.experimentalNonAmpCreativeRenderMethod_).to.be.null;
        expect(fetchMock.called('ad')).to.be.true;
      });

      it('should fire amp-analytics triggers for lifecycle stages', async () => {
        const triggerAnalyticsEventSpy = env.sandbox.spy(
          analytics,
          'triggerAnalyticsEvent'
        );
        await a4a.layoutCallback();
        return verifyA4aAnalyticsTriggersWereFired(
          a4a,
          triggerAnalyticsEventSpy,
          'ad-iframe-loaded'
        );
      });
    });
  });

  describe('cross-domain vs A4A', () => {
    let a4a;
    let a4aElement;
    beforeEach(async () => {
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      fetchMock.getOnce(
        TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
        () => adResponse,
        {name: 'ad'}
      );
      const {doc} = fixture;
      a4aElement = createA4aElement(doc);
      a4a = new MockA4AImpl(a4aElement);
      return fixture;
    });
    afterEach(() => {
      expect(fetchMock.called('ad')).to.be.true;
    });

    ['nameframe', 'safeframe'].forEach((renderType) => {
      it(`should not use ${renderType} if creative is A4A`, async () => {
        adResponse.headers[RENDERING_TYPE_HEADER] = renderType;
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        await a4a.layoutCallback();
        verifyA4ARender(a4aElement);
      });

      it(
        `should not use ${renderType} even if onLayoutMeasure called ` +
          'multiple times',
        async () => {
          adResponse.headers[RENDERING_TYPE_HEADER] = renderType;
          a4a.buildCallback();
          a4a.onLayoutMeasure();
          a4a.onLayoutMeasure();
          a4a.onLayoutMeasure();
          a4a.onLayoutMeasure();
          await a4a.layoutCallback();
          const safeChild = a4aElement.querySelector('iframe[name]');
          expect(safeChild).to.not.be.ok;
          const crossDomainChild = a4aElement.querySelector('iframe[src]');
          expect(crossDomainChild).to.not.be.ok;
          const friendlyChild = a4aElement.querySelector('iframe[srcdoc]');
          expect(friendlyChild).to.be.ok;
          expect(friendlyChild.getAttribute('srcdoc')).to.have.string(
            '<html ⚡4ads'
          );
        }
      );
    });
  });

  it('should set height/width on iframe matching header value', async () => {
    // Make sure there's no signature, so that we go down the 3p iframe path.
    adResponse.body = adResponse.body.replace('⚡4ads', '');
    delete adResponse.headers['AMP-Fast-Fetch-Signature'];
    delete adResponse.headers[AMP_SIGNATURE_HEADER];
    adResponse.headers['X-CreativeSize'] = '320x50';
    const fixture = await createIframePromise();
    setupForAdTesting(fixture);
    fetchMock.getOnce(
      TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
      () => adResponse,
      {name: 'ad'}
    );
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
    await renderPromise;
    const child = a4aElement.querySelector('iframe[name]');
    expect(child).to.be.ok;
    expect(child.getAttribute('width')).to.equal('320');
    expect(child.getAttribute('height')).to.equal('50');
  });

  it('should set a default title on the iframe', async () => {
    // Make sure there's no signature, so that we go down the 3p iframe path.
    adResponse.body = adResponse.body.replace('⚡4ads', '');
    delete adResponse.headers['AMP-Fast-Fetch-Signature'];
    delete adResponse.headers[AMP_SIGNATURE_HEADER];
    adResponse.headers['X-CreativeSize'] = '320x50';
    const fixture = await createIframePromise();
    setupForAdTesting(fixture);
    fetchMock.getOnce(
      TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
      () => adResponse,
      {name: 'ad'}
    );
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
    await renderPromise;
    const child = a4aElement.querySelector('iframe[name]');
    expect(child).to.be.ok;
    expect(child.getAttribute('title')).to.equal('3rd party ad content');
  });

  it('should use the amp-ad title on the iframe if set', async () => {
    // Make sure there's no signature, so that we go down the 3p iframe path.
    adResponse.body = adResponse.body.replace('⚡4ads', '');
    delete adResponse.headers['AMP-Fast-Fetch-Signature'];
    delete adResponse.headers[AMP_SIGNATURE_HEADER];
    adResponse.headers['X-CreativeSize'] = '320x50';
    const fixture = await createIframePromise();
    setupForAdTesting(fixture);
    fetchMock.getOnce(
      TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
      () => adResponse,
      {name: 'ad'}
    );
    const {doc} = fixture;
    const a4aElement = createA4aElement(doc);
    a4aElement.setAttribute('width', 480);
    a4aElement.setAttribute('height', 75);
    a4aElement.setAttribute('type', 'doubleclick');
    a4aElement.setAttribute('title', 'Custom title');
    const a4a = new MockA4AImpl(a4aElement);
    doc.body.appendChild(a4aElement);
    a4a.buildCallback();
    a4a.onLayoutMeasure();
    const renderPromise = a4a.layoutCallback();
    await renderPromise;
    const child = a4aElement.querySelector('iframe[name]');
    expect(child).to.be.ok;
    expect(child.getAttribute('title')).to.equal('Custom title');
  });

  describe('#onLayoutMeasure', () => {
    it('resumeCallback calls onLayoutMeasure', async () => {
      // Force non-FIE
      adResponse.body = adResponse.body.replace('⚡4ads', '');
      delete adResponse.headers['AMP-Fast-Fetch-Signature'];
      delete adResponse.headers[AMP_SIGNATURE_HEADER];
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      fetchMock.getOnce(
        TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
        () => adResponse,
        {name: 'ad'}
      );
      const {doc} = fixture;
      const a4aElement = createA4aElement(doc);
      const s = doc.createElement('style');
      s.textContent = '.fixed {position:fixed;}';
      doc.head.appendChild(s);
      const a4a = new MockA4AImpl(a4aElement);
      const renderNonAmpCreativeSpy = env.sandbox.spy(
        a4a,
        'renderNonAmpCreative'
      );
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      expect(a4a.adPromise_).to.be.ok;
      await a4a.layoutCallback();
      expect(
        renderNonAmpCreativeSpy.calledOnce,
        'renderNonAmpCreative called exactly once'
      ).to.be.true;
      a4a.unlayoutCallback();
      getResourceStub.returns({
        'hasBeenMeasured': () => true,
        'isMeasureRequested': () => false,
      });
      const onLayoutMeasureSpy = env.sandbox.spy(a4a, 'onLayoutMeasure');
      a4a.resumeCallback();
      expect(onLayoutMeasureSpy).to.be.calledOnce;
    });

    it('resumeCallback does not call onLayoutMeasure for FIE', async () => {
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      fetchMock.getOnce(
        TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
        () => adResponse,
        {name: 'ad'}
      );
      const {doc} = fixture;
      const a4aElement = createA4aElement(doc);
      const s = doc.createElement('style');
      s.textContent = '.fixed {position:fixed;}';
      doc.head.appendChild(s);
      const a4a = new MockA4AImpl(a4aElement);
      const renderAmpCreativeSpy = env.sandbox.spy(
        a4a,
        NO_SIGNING_RTV ? 'renderFriendlyTrustless_' : 'renderAmpCreative_'
      );
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      expect(a4a.adPromise_).to.be.ok;
      await a4a.layoutCallback();
      expect(
        renderAmpCreativeSpy.calledOnce,
        'renderAmpCreative_ called exactly once'
      ).to.be.true;
      env.sandbox.stub(a4a, 'unlayoutCallback').callsFake(() => false);
      const onLayoutMeasureSpy = env.sandbox.spy(a4a, 'onLayoutMeasure');
      a4a.resumeCallback();
      expect(onLayoutMeasureSpy).to.not.be.called;
    });

    it('resumeCallback w/ measure required no onLayoutMeasure', async () => {
      // Force non-FIE
      adResponse.body = adResponse.body.replace('⚡4ads', '');
      delete adResponse.headers['AMP-Fast-Fetch-Signature'];
      delete adResponse.headers[AMP_SIGNATURE_HEADER];
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      fetchMock.getOnce(
        TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
        () => adResponse,
        {name: 'ad'}
      );
      const {doc} = fixture;
      const a4aElement = createA4aElement(doc);
      const s = doc.createElement('style');
      s.textContent = '.fixed {position:fixed;}';
      doc.head.appendChild(s);
      const a4a = new MockA4AImpl(a4aElement);
      const renderNonAmpCreativeSpy = env.sandbox.spy(
        a4a,
        'renderNonAmpCreative'
      );
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      expect(a4a.adPromise_).to.be.ok;
      await a4a.layoutCallback();
      expect(
        renderNonAmpCreativeSpy.calledOnce,
        'renderNonAmpCreative called exactly once'
      ).to.be.true;
      a4a.unlayoutCallback();
      const onLayoutMeasureSpy = env.sandbox.spy(a4a, 'onLayoutMeasure');
      getResourceStub.returns({'hasBeenMeasured': () => false});
      a4a.resumeCallback();
      expect(onLayoutMeasureSpy).to.not.be.called;
    });

    it('should run end-to-end and render in friendly iframe', async () => {
      // TODO(ccordry): delete this test when no signing launches.
      if (NO_SIGNING_RTV) {
        return;
      }
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      fetchMock.getOnce(
        TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
        () => adResponse,
        {name: 'ad'}
      );
      const {doc} = fixture;
      const a4aElement = createA4aElement(doc);
      a4aElement.setAttribute('rtc-config', true);
      const a4a = new MockA4AImpl(a4aElement);
      a4a.releaseType_ = '0';
      const getAdUrlSpy = env.sandbox.spy(a4a, 'getAdUrl');
      const rtcResponse = Promise.resolve([
        {response: 'a', rtcTime: 1, callout: 'https://a.com'},
      ]);

      installRealTimeConfigServiceForDoc(doc);
      const maybeExecuteRealTimeConfigStub = env.sandbox
        .stub()
        .returns(rtcResponse);
      const rtc = await Services.realTimeConfigForDoc(doc);
      env.sandbox
        .stub(rtc, 'maybeExecuteRealTimeConfig')
        .callsFake(maybeExecuteRealTimeConfigStub);
      const tryExecuteRealTimeConfigSpy = env.sandbox.spy(
        a4a,
        'tryExecuteRealTimeConfig_'
      );
      const updateLayoutPriorityStub = env.sandbox.stub(
        a4a,
        'updateLayoutPriority'
      );
      const renderAmpCreativeSpy = env.sandbox.spy(a4a, 'renderAmpCreative_');
      const preloadExtensionSpy = env.sandbox.spy(
        Extensions.prototype,
        'preloadExtension'
      );
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      expect(a4a.adPromise_).to.be.instanceof(Promise);
      const promiseResult = await a4a.adPromise_;
      expect(promiseResult).to.be.ok;
      expect(promiseResult.minifiedCreative).to.be.ok;
      expect(a4a.isVerifiedAmpCreative()).to.be.true;
      expect(tryExecuteRealTimeConfigSpy.calledOnce).to.be.true;
      expect(maybeExecuteRealTimeConfigStub.calledOnce).to.be.true;
      expect(
        maybeExecuteRealTimeConfigStub.calledWith(
          a4aElement,
          {},
          null,
          null,
          null,
          env.sandbox.match.any
        )
      ).to.be.true;
      expect(getAdUrlSpy.calledOnce, 'getAdUrl called exactly once').to.be.true;
      expect(
        getAdUrlSpy.calledWith(
          {
            consentState: null,
            consentString: null,
            gdprApplies: null,
            consentStringType: null,
            additionalConsent: null,
            consentSharedData: null,
          },
          rtcResponse
        )
      ).to.be.true;
      expect(fetchMock.called('ad')).to.be.true;
      expect(preloadExtensionSpy.withArgs('amp-font')).to.be.calledOnce;
      expect(
        doc.querySelector(
          'link[rel=preload]' +
            '[href="https://fonts.googleapis.com/css?family=Questrial"]'
        )
      ).to.be.ok;
      await a4a.layoutCallback();
      expect(
        renderAmpCreativeSpy.calledOnce,
        'renderAmpCreative_ called exactly once'
      ).to.be.true;
      expect(a4aElement.getElementsByTagName('iframe').length).to.equal(1);
      const friendlyIframe = a4aElement.querySelector('iframe[srcdoc]');
      expect(friendlyIframe).to.not.be.null;
      expect(friendlyIframe.getAttribute('src')).to.be.null;
      const expectedAttributes = {
        'frameborder': '0',
        'allowfullscreen': '',
        'allowtransparency': '',
        'scrolling': 'no',
        'role': 'region',
        'aria-label': 'Advertisement',
        'tabindex': '0',
      };
      Object.keys(expectedAttributes).forEach((key) => {
        expect(friendlyIframe.getAttribute(key)).to.equal(
          expectedAttributes[key]
        );
      });
      // Should not contain v0.js, any extensions, or amp-boilerplate.
      const iframeDoc = friendlyIframe.contentDocument;
      expect(iframeDoc.querySelector('script[src]')).to.not.be.ok;
      expect(iframeDoc.querySelector('script[custom-element]')).to.not.be.ok;
      expect(iframeDoc.querySelector('style[amp-boilerplate]')).to.not.be.ok;
      expect(iframeDoc.querySelector('noscript')).to.not.be.ok;
      // Should contain font link and extension in main document.
      expect(
        iframeDoc.querySelector(
          'link[href="https://fonts.googleapis.com/css?family=Questrial"]'
        )
      ).to.be.ok;
      expect(doc.querySelector('script[src*="amp-font-0.1"]')).to.be.ok;
      expect(onCreativeRenderSpy.withArgs(env.sandbox.match.object)).to.be
        .calledOnce;
      expect(updateLayoutPriorityStub).to.be.calledOnce;
      expect(updateLayoutPriorityStub.args[0][0]).to.equal(
        LayoutPriority_Enum.CONTENT
      );
    });

    it('should fallback to non-AMP creative if shadow dom not supported', async () => {
      const fixture = await createIframePromise();
      const {attachShadowStub} = setupForAdTesting(fixture);

      // Remove attachShadow.
      attachShadowStub.value(undefined);

      fetchMock.getOnce(
        TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
        () => adResponse,
        {name: 'ad'}
      );
      const {doc} = fixture;
      const a4aElement = createA4aElement(doc);
      a4aElement.setAttribute('rtc-config', true);
      const a4a = new MockA4AImpl(a4aElement);
      const rtcResponse = Promise.resolve([
        {response: 'a', rtcTime: 1, callout: 'https://a.com'},
      ]);

      installRealTimeConfigServiceForDoc(doc);
      const maybeExecuteRealTimeConfigStub = env.sandbox
        .stub()
        .returns(rtcResponse);
      const rtc = await Services.realTimeConfigForDoc(doc);
      env.sandbox
        .stub(rtc, 'maybeExecuteRealTimeConfig')
        .callsFake(maybeExecuteRealTimeConfigStub);
      const renderAmpCreativeSpy = env.sandbox.spy(a4a, 'renderAmpCreative_');
      const renderNonAmpCreativeSpy = env.sandbox.spy(
        a4a,
        'renderNonAmpCreative'
      );

      a4a.buildCallback();
      a4a.onLayoutMeasure();
      await a4a.layoutCallback();
      expect(renderAmpCreativeSpy).to.not.be.called;
      expect(renderNonAmpCreativeSpy).to.be.calledOnce;
      expect(a4aElement.getElementsByTagName('iframe').length).to.equal(1);
      expect(a4aElement.querySelector('iframe[src]')).to.exist;
      expect(a4aElement.querySelector('iframe[srcdoc]')).to.be.null;
    });

    it('should fallback to non-AMP creative if shadow dom is polyfilled', async () => {
      const fixture = await createIframePromise();
      const {attachShadowStub} = setupForAdTesting(fixture);

      // Emulate polyfill.
      attachShadowStub.value(function () {
        return null;
      });

      fetchMock.getOnce(
        TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
        () => adResponse,
        {name: 'ad'}
      );
      const {doc} = fixture;
      const a4aElement = createA4aElement(doc);
      a4aElement.setAttribute('rtc-config', true);
      const a4a = new MockA4AImpl(a4aElement);
      const rtcResponse = Promise.resolve([
        {response: 'a', rtcTime: 1, callout: 'https://a.com'},
      ]);

      installRealTimeConfigServiceForDoc(doc);
      const maybeExecuteRealTimeConfigStub = env.sandbox
        .stub()
        .returns(rtcResponse);
      const rtc = await Services.realTimeConfigForDoc(doc);
      env.sandbox
        .stub(rtc, 'maybeExecuteRealTimeConfig')
        .callsFake(maybeExecuteRealTimeConfigStub);
      const renderAmpCreativeSpy = env.sandbox.spy(a4a, 'renderAmpCreative_');
      const renderNonAmpCreativeSpy = env.sandbox.spy(
        a4a,
        'renderNonAmpCreative'
      );

      a4a.buildCallback();
      a4a.onLayoutMeasure();
      await a4a.layoutCallback();
      expect(renderAmpCreativeSpy).to.not.be.called;
      expect(renderNonAmpCreativeSpy).to.be.calledOnce;
      expect(a4aElement.getElementsByTagName('iframe').length).to.equal(1);
      expect(a4aElement.querySelector('iframe[src]')).to.exist;
      expect(a4aElement.querySelector('iframe[srcdoc]')).to.be.null;
    });

    it('should update priority for non AMP if in experiment', async () => {
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      adResponse.body = adResponse.body.replace('⚡4ads', '');
      delete adResponse.headers['AMP-Fast-Fetch-Signature'];
      delete adResponse.headers[AMP_SIGNATURE_HEADER];
      adResponse.headers[EXPERIMENT_FEATURE_HEADER_NAME] =
        'pref_neutral_enabled=1,';
      adResponse.headers[CREATIVE_SIZE_HEADER] = '123x456';
      fetchMock.getOnce(
        TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
        () => adResponse,
        {name: 'ad'}
      );
      const element = createA4aElement(fixture.doc);
      element.setAttribute('type', 'adsense');
      const a4a = new MockA4AImpl(element);
      const updateLayoutPriorityStub = env.sandbox.stub(
        a4a,
        'updateLayoutPriority'
      );
      const renderNonAmpCreativeSpy = env.sandbox.spy(
        a4a,
        'renderNonAmpCreative'
      );
      env.sandbox
        .stub(a4a, 'maybeValidateAmpCreative')
        .returns(Promise.resolve());
      a4a.uiHandler = {
        getScrollPromiseForStickyAd: () => Promise.resolve(null),
        isStickyAd: () => false,
        maybeInitStickyAd: () => {},
      };
      a4a.onLayoutMeasure();
      await a4a.buildCallback();
      await a4a.layoutCallback();
      expect(
        renderNonAmpCreativeSpy.calledOnce,
        'renderNonAmpCreative_ called exactly once'
      ).to.be.true;
      expect(updateLayoutPriorityStub.args[0][0]).to.equal(
        LayoutPriority_Enum.CONTENT
      );
      expect(is3pThrottled(a4a.win)).to.be.false;
    });

    // TODO (keithwrightbos) - move into above e2e once signed creative with
    // image within creative can be regenerated.
    it('should prefetch amp images', async () => {
      // TODO(ccordry): delete this test when launched.
      if (NO_SIGNING_RTV) {
        return;
      }
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      fetchMock.getOnce(
        TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
        () => adResponse,
        {name: 'ad'}
      );
      const {doc} = fixture;
      const a4aElement = createA4aElement(doc);
      const a4a = new MockA4AImpl(a4aElement);
      env.sandbox.stub(a4a, 'getAmpAdMetadata').callsFake((creative) => {
        const metaData = AmpA4A.prototype.getAmpAdMetadata.call(a4a, creative);
        metaData.images = [
          'https://prefetch.me.com?a=b',
          'http://do.not.prefetch.me.com?c=d',
          'https://prefetch.metoo.com?e=f',
        ];
        return metaData;
      });
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      await a4a.layoutCallback();
      expect(
        doc.querySelector(
          'link[rel=preload][href="https://prefetch.me.com?a=b"]'
        )
      ).to.be.ok;
      expect(
        doc.querySelector(
          'link[rel=preload][href="https://prefetch.metoo.com?e=f"]'
        )
      ).to.be.ok;
      expect(
        doc.querySelector(
          'link[rel=preload][href="http://do.not.prefetch.me.com?c=d"]'
        )
      ).to.not.be.ok;
    });

    it('must not be position:fixed', async () => {
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      fetchMock.getOnce(
        TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
        () => adResponse,
        {name: 'ad'}
      );
      const {doc} = fixture;
      const a4aElement = createA4aElement(doc);
      const s = doc.createElement('style');
      s.textContent = '.fixed {position:fixed;}';
      doc.head.appendChild(s);
      a4aElement.className = 'fixed';
      const a4a = new MockA4AImpl(a4aElement);
      a4a.uiHandler = {
        isStickyAd: () => false,
      };
      a4a.onLayoutMeasure();
      expect(a4a.adPromise_).to.not.be.ok;
    });

    it('does not initialize promise chain 0 height/width', async () => {
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      fetchMock.getOnce(
        TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
        () => adResponse,
        {name: 'ad'}
      );
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

    it('does not initialize promise chain when hidden by media query', async () => {
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      fetchMock.getOnce(
        TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
        () => adResponse,
        {name: 'ad'}
      );
      const {doc} = fixture;
      const rect = layoutRectLtwh(0, 0, 200, 200);
      const a4aElement = createA4aElement(doc, rect);
      a4aElement.classList.add('i-amphtml-hidden-by-media-query');
      const a4a = new MockA4AImpl(a4aElement);
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      expect(a4a.adPromise_).to.not.be.ok;
      // test without media query
      a4aElement.classList.remove('i-amphtml-hidden-by-media-query');
      a4a.onLayoutMeasure();
      expect(a4a.adPromise_).to.be.ok;
    });

    it('does not initialize promise chain when has attribute "hidden"', async () => {
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      fetchMock.getOnce(
        TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
        () => adResponse,
        {name: 'ad'}
      );
      const {doc} = fixture;
      const rect = layoutRectLtwh(0, 0, 200, 200);
      const a4aElement = createA4aElement(doc, rect);
      a4aElement.setAttribute('hidden', '');
      const a4a = new MockA4AImpl(a4aElement);
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      expect(a4a.adPromise_).to.not.be.ok;
      // test without media query
      a4aElement.removeAttribute('hidden');
      a4a.onLayoutMeasure();
      expect(a4a.adPromise_).to.be.ok;
    });

    /**
     * @param {boolean} isValidCreative
     * @param {boolean} opt_failAmpRender
     */
    async function executeLayoutCallbackTest(
      isValidCreative,
      opt_failAmpRender
    ) {
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      fetchMock.getOnce(
        TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
        () => adResponse,
        {name: 'ad'}
      );
      const {doc} = fixture;
      const a4aElement = createA4aElement(doc);
      const a4a = new MockA4AImpl(a4aElement);
      const getAdUrlSpy = env.sandbox.spy(a4a, 'getAdUrl');
      const updateLayoutPriorityStub = env.sandbox.stub(
        a4a,
        'updateLayoutPriority'
      );
      if (!isValidCreative) {
        adResponse.body = adResponse.body.replace('⚡4ads', '');
        delete adResponse.headers['AMP-Fast-Fetch-Signature'];
        delete adResponse.headers[AMP_SIGNATURE_HEADER];
      }
      a4a.promiseErrorHandler_ = () => {};
      if (opt_failAmpRender) {
        // TODO(ccordry): remove renderAmpCreative_ when no signing launched.
        env.sandbox
          .stub(a4a, 'renderAmpCreative_')
          .returns(Promise.reject('amp render failure'));
        env.sandbox
          .stub(a4a, 'renderFriendlyTrustless_')
          .returns(Promise.reject('amp render failure'));
      }
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      expect(a4a.adPromise_).to.be.instanceof(Promise);
      const promiseResult = await a4a.adPromise_;
      expect(getAdUrlSpy.calledOnce, 'getAdUrl called exactly once').to.be.true;
      expect(fetchMock.called('ad')).to.be.true;
      expect(a4a.isVerifiedAmpCreative()).to.equal(isValidCreative);
      if (isValidCreative) {
        expect(promiseResult).to.be.ok;
        // TODO(ccordry): delete this check when launched.
        !NO_SIGNING_RTV && !expect(promiseResult.minifiedCreative).to.be.ok;
      } else {
        expect(promiseResult).to.not.be.ok;
      }
      await a4a.layoutCallback();
      expect(a4aElement.getElementsByTagName('iframe').length).to.not.equal(0);
      const iframe = a4aElement.getElementsByTagName('iframe')[0];
      if (isValidCreative && !opt_failAmpRender) {
        expect(iframe.getAttribute('src')).to.be.null;
        expect(onCreativeRenderSpy.withArgs(env.sandbox.match.object)).to.be
          .calledOnce;
        expect(updateLayoutPriorityStub).to.be.calledOnce;
        expect(updateLayoutPriorityStub.args[0][0]).to.equal(
          LayoutPriority_Enum.CONTENT
        );
      } else {
        expect(iframe.getAttribute('srcdoc')).to.be.null;
        expect(iframe.src, 'verify iframe src w/ origin').to.equal(
          TEST_URL + '&__amp_source_origin=about%3Asrcdoc'
        );
        expect(onCreativeRenderSpy.withArgs(null)).to.be.called;
        if (!opt_failAmpRender) {
          expect(updateLayoutPriorityStub).to.not.be.called;
        }
      }
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

    it('should run end-to-end in the presence of an XHR error', async () => {
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      fetchMock.getOnce(
        TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
        Promise.reject(networkFailure()),
        {name: 'ad'}
      );
      const {doc} = fixture;
      const a4aElement = createA4aElement(doc);
      const a4a = new MockA4AImpl(a4aElement);
      const getAdUrlSpy = env.sandbox.spy(a4a, 'getAdUrl');
      const onNetworkFailureSpy = env.sandbox.spy(a4a, 'onNetworkFailure');
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      expect(a4a.adPromise_).to.be.instanceof(Promise);
      await a4a.layoutCallback();
      expect(getAdUrlSpy, 'getAdUrl called exactly once').to.be.calledOnce;
      expect(onNetworkFailureSpy, 'onNetworkFailureSpy called exactly once').to
        .be.calledOnce;
      // Verify iframe presence and lack of visibility hidden
      const iframe = a4aElement.querySelector('iframe[src]');
      expect(iframe).to.be.ok;
      expect(iframe.src.indexOf(TEST_URL)).to.equal(0);
      expect(iframe).to.be.visible;
      expect(onCreativeRenderSpy.withArgs(null)).to.be.called;
    });

    it('should use adUrl from onNetworkFailure', async () => {
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      fetchMock.getOnce(
        TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
        Promise.reject(networkFailure()),
        {name: 'ad'}
      );
      const {doc} = fixture;
      const a4aElement = createA4aElement(doc);
      const a4a = new MockA4AImpl(a4aElement);
      const getAdUrlSpy = env.sandbox.spy(a4a, 'getAdUrl');
      env.sandbox
        .stub(a4a, 'onNetworkFailure')
        .withArgs(
          env.sandbox.match(
            (val) =>
              val.message && val.message.indexOf('XHR Failed fetching') == 0
          ),
          TEST_URL
        )
        .returns({adUrl: TEST_URL + '&err=true'});
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      expect(a4a.adPromise_).to.be.instanceof(Promise);
      await a4a.layoutCallback();
      expect(getAdUrlSpy, 'getAdUrl called exactly once').to.be.calledOnce;
      // Verify iframe presence and lack of visibility hidden
      const iframe = a4aElement.querySelector('iframe[src]');
      expect(iframe).to.be.ok;
      expect(iframe.src.indexOf(TEST_URL)).to.equal(0);
      expect(/&err=true/.test(iframe.src), iframe.src).to.be.true;
      expect(iframe).to.be.visible;
      expect(onCreativeRenderSpy.withArgs(null)).to.be.called;
    });

    it('should not execute frame GET if disabled via onNetworkFailure', async () => {
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      fetchMock.getOnce(
        TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
        Promise.reject(networkFailure()),
        {name: 'ad'}
      );
      const {doc} = fixture;
      const a4aElement = createA4aElement(doc);
      const a4a = new MockA4AImpl(a4aElement);
      a4a.promiseErrorHandler_ = () => {};
      const getAdUrlSpy = env.sandbox.spy(a4a, 'getAdUrl');
      env.sandbox
        .stub(a4a, 'onNetworkFailure')
        .withArgs(
          env.sandbox.match(
            (val) =>
              val.message && val.message.indexOf('XHR Failed fetching') == 0
          ),
          TEST_URL
        )
        .returns({frameGetDisabled: true});
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      await a4a.layoutCallback();
      expect(getAdUrlSpy, 'getAdUrl called exactly once').to.be.calledOnce;
      const iframe = a4aElement.querySelector('iframe');
      expect(iframe).to.not.be.ok;
    });

    it('should handle XHR error when resolves before layoutCallback', async () => {
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      fetchMock.getOnce(
        TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
        Promise.reject(networkFailure()),
        {name: 'ad'}
      );
      const {doc} = fixture;
      const a4aElement = createA4aElement(doc);
      const a4a = new MockA4AImpl(a4aElement);
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      await a4a.adPromise_;
      await a4a.layoutCallback();
      // Verify iframe presence and lack of visibility hidden
      expect(a4aElement.querySelectorAll('iframe').length).to.equal(1);
      const iframe = a4aElement.querySelectorAll('iframe')[0];
      expect(iframe.src.indexOf(TEST_URL)).to.equal(0);
      expect(iframe).to.be.visible;
      expect(onCreativeRenderSpy.withArgs(null)).to.be.called;
    });

    it('should handle XHR error when resolves after layoutCallback', async () => {
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      let rejectXhr;
      fetchMock.getOnce(
        TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
        new Promise((unusedResolve, reject) => {
          rejectXhr = reject;
        }),
        {name: 'ad'}
      );
      const {doc} = fixture;
      const a4aElement = createA4aElement(doc);
      const a4a = new MockA4AImpl(a4aElement);
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      const layoutCallbackPromise = a4a.layoutCallback();
      rejectXhr(networkFailure());
      await layoutCallbackPromise;
      // Verify iframe presence and lack of visibility hidden
      expect(a4aElement.querySelectorAll('iframe').length).to.equal(1);
      const iframe = a4aElement.querySelectorAll('iframe')[0];
      expect(iframe.src.indexOf(TEST_URL)).to.equal(0);
      expect(iframe).to.be.visible;
      expect(onCreativeRenderSpy.withArgs(null)).to.be.called;
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
        fn: () => (adResponse.body = ''),
      },
      {
        name: 'no fill header',
        fn: () => {
          adResponse.body = adResponse.body.replace('⚡4ads', '');
          adResponse.headers['amp-ff-empty-creative'] = '';
        },
      },
    ].forEach((test) => {
      it(`should collapse ${test.name}`, async () => {
        const fixture = await createIframePromise();
        setupForAdTesting(fixture);
        test.fn();
        fetchMock.getOnce(
          TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
          adResponse,
          {name: 'ad'}
        );
        const {doc} = fixture;
        const a4aElement = createA4aElement(doc);
        const a4a = new MockA4AImpl(a4aElement);
        a4a.buildCallback();
        const forceCollapseSpy = env.sandbox.spy(a4a, 'forceCollapse');
        const noContentUISpy = env.sandbox.spy();
        const unlayoutUISpy = env.sandbox.spy();
        a4a.uiHandler = {
          applyNoContentUI: () => {
            noContentUISpy();
          },
          applyUnlayoutUI: () => {
            unlayoutUISpy();
          },
          getScrollPromiseForStickyAd: () => Promise.resolve(null),
          isStickyAd: () => false,
          maybeInitStickyAd: () => {},
          cleanup: () => {},
        };
        env.sandbox
          .stub(a4a, 'getLayoutSize')
          .returns({width: 123, height: 456});
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.be.ok;
        await a4a.adPromise_;
        expect(forceCollapseSpy).to.be.calledOnce;
        expect(noContentUISpy).to.be.calledOnce;
        await a4a.layoutCallback();
        // should have no iframe.
        expect(a4aElement.querySelector('iframe')).to.not.be.ok;
        expect(onCreativeRenderSpy).to.not.be.called;
        // call unlayout callback & verify it attempts to revert size
        expect(a4a.originalSlotSize_).to.deep.equal({
          width: 123,
          height: 456,
        });
        let attemptChangeSizeResolver;
        const attemptChangeSizePromise = new Promise((resolve) => {
          attemptChangeSizeResolver = resolve;
        });
        env.sandbox
          .stub(AMP.BaseElement.prototype, 'attemptChangeSize')
          .returns(attemptChangeSizePromise);
        a4a.unlayoutCallback();
        expect(unlayoutUISpy).to.be.calledOnce;
        expect(a4a.originalSlotSize_).to.be.ok;
        attemptChangeSizeResolver();
        await Services.timerFor(a4a.win).promise(1);
        expect(a4a.originalSlotSize_).to.not.be.ok;
      });
    });

    it('should process safeframe version header properly', async () => {
      adResponse.headers[SAFEFRAME_VERSION_HEADER] = '1-2-3';
      adResponse.headers[RENDERING_TYPE_HEADER] = 'safeframe';
      adResponse.body = adResponse.body.replace('⚡4ads', '');
      delete adResponse.headers['AMP-Fast-Fetch-Signature'];
      delete adResponse.headers[AMP_SIGNATURE_HEADER];
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      fetchMock.getOnce(
        TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
        () => adResponse,
        {name: 'ad'}
      );
      const {doc} = fixture;
      const a4aElement = createA4aElement(doc);
      const a4a = new MockA4AImpl(a4aElement);
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      await a4a.adPromise_;
      expect(fetchMock.called('ad')).to.be.true;
      await a4a.layoutCallback();
      verifySafeFrameRender(a4aElement, '1-2-3');
      // Verify preload to safeframe with header version.
      expect(
        doc.querySelector(
          'link[rel=preload]' +
            '[href*=".googlesyndication.com/safeframe/' +
            '1-2-3/html/container.html"]'
        )
      ).to.be.ok;
    });

    describe('delay request experiment', () => {
      let getAdUrlSpy;
      let a4a;

      beforeEach(async () => {
        const fixture = await createIframePromise();
        setupForAdTesting(fixture);
        fetchMock.getOnce(
          TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
          () => adResponse,
          {name: 'ad'}
        );
        const {doc} = fixture;
        const a4aElement = createA4aElement(doc);
        a4a = new MockA4AImpl(a4aElement);
        getAdUrlSpy = env.sandbox.spy(a4a, 'getAdUrl');
      });

      it('should delay request until within renderOutsideViewport', async () => {
        env.sandbox.stub(a4a, 'delayAdRequestEnabled').returns(true);
        let whenWithinViewportResolve;
        getResourceStub.returns({
          getUpgradeDelayMs: () => 1,
          renderOutsideViewport: () => 3,
        });
        const whenWithinViewportStub = env.sandbox
          .stub(a4a, 'whenWithinViewport')
          .callsFake(() => {
            return new Promise((resolve) => {
              whenWithinViewportResolve = resolve;
            });
          });
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.be.instanceof(Promise);
        // Delay to all getAdUrl to potentially execute.
        await Services.timerFor(a4a.win).promise(1);
        expect(getAdUrlSpy).to.not.be.called;
        expect(whenWithinViewportStub).to.be.calledOnce.calledWith(3);
        whenWithinViewportResolve();
        await a4a.adPromise_;
        return expect(getAdUrlSpy).to.be.calledOnce;
      });

      it('should delay request until numeric value', async () => {
        env.sandbox.stub(a4a, 'delayAdRequestEnabled').returns(6);
        let whenWithinViewportResolve;
        getResourceStub.returns({
          getUpgradeDelayMs: () => 1,
          renderOutsideViewport: () => 3,
        });
        const whenWithinViewportStub = env.sandbox
          .stub(a4a, 'whenWithinViewport')
          .callsFake(() => {
            return new Promise((resolve) => {
              whenWithinViewportResolve = resolve;
            });
          });
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.be.instanceof(Promise);
        // Delay to all getAdUrl to potentially execute.
        await Services.timerFor(a4a.win).promise(1);
        expect(getAdUrlSpy).to.not.be.called;
        expect(whenWithinViewportStub).to.be.calledOnce.calledWith(6);
        whenWithinViewportResolve();
        await a4a.adPromise_;
        return expect(getAdUrlSpy).to.be.calledOnce;
      });
    });

    it('should ignore invalid safeframe version header', async () => {
      adResponse.headers[SAFEFRAME_VERSION_HEADER] = 'some-bad-item';
      adResponse.headers[RENDERING_TYPE_HEADER] = 'safeframe';
      adResponse.body = adResponse.body.replace('⚡4ads', '');
      delete adResponse.headers['AMP-Fast-Fetch-Signature'];
      delete adResponse.headers[AMP_SIGNATURE_HEADER];
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      fetchMock.getOnce(
        TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
        () => adResponse,
        {name: 'ad'}
      );
      const {doc} = fixture;
      const a4aElement = createA4aElement(doc);
      const a4a = new MockA4AImpl(a4aElement);
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      await a4a.adPromise_;
      expect(fetchMock.called('ad')).to.be.true;
      await a4a.layoutCallback();
      verifySafeFrameRender(a4aElement, DEFAULT_SAFEFRAME_VERSION);
    });
    // TODO(tdrl): Go through case analysis in amp-a4a.js#onLayoutMeasure and
    // add one test for each case / ensure that all cases are covered.
  });

  describe('#preconnectCallback', () => {
    it('validate', async () => {
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      const {doc} = fixture;
      const a4aElement = createA4aElement(doc);
      const a4a = new MockA4AImpl(a4aElement);
      //a4a.config = {};
      a4a.buildCallback();
      a4a.preconnectCallback(false);
      await Promise.resolve();
      const preconnects = doc.querySelectorAll('link[rel=preconnect]');
      expect(preconnects).to.have.lengthOf(1);
      // AdSense origin.
      expect(preconnects[0]).to.have.property(
        'href',
        'https://googleads.g.doubleclick.net/'
      );
    });
  });

  describe('#getAmpAdMetadata', () => {
    let a4a;
    let metaData;
    beforeEach(async () => {
      metaData = {
        customElementExtensions: ['amp-vine', 'amp-vine', 'amp-vine'],
        customStylesheets: [
          {href: 'https://fonts.googleapis.com/css?foobar'},
          {href: 'https://fonts.com/css?helloworld'},
        ],
        images: ['https://some.image.com/a=b', 'https://other.image.com'],
      };
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      a4a = new MockA4AImpl(createA4aElement(fixture.doc));
      return fixture;
    });

    it('should parse metadata', () => {
      const actual = a4a.getAmpAdMetadata(buildCreativeString(metaData));
      const expected = Object.assign(metaData, {
        minifiedCreative: testFragments.minimalDocOneStyleSrcDoc,
      });
      expect(actual).to.deep.equal(expected);
    });

    it('should copy over any extensions detail', () => {
      metaData.extensions = [
        {
          'custom-element': 'amp-analytics',
          'src': 'https://cdn.ampproject.org/v0/amp-analytics-0.1.js',
        },
        {
          'custom-element': 'amp-mustache',
          'src': 'https://cdn.ampproject.org/v0/amp-mustache-1.0.js',
        },
      ];
      const actual = a4a.getAmpAdMetadata(buildCreativeString(metaData));
      expect(actual.extensions).to.deep.include({
        'custom-element': 'amp-analytics',
        'src': 'https://cdn.ampproject.org/v0/amp-analytics-0.1.js',
      });
      expect(actual.extensions).to.deep.include({
        'custom-element': 'amp-mustache',
        'src': 'https://cdn.ampproject.org/v0/amp-mustache-1.0.js',
      });
    });

    // TODO(levitzky) remove the following two tests after metadata bug is
    // fixed.
    it('should parse metadata with wrong opening tag', () => {
      const creative = buildCreativeString(metaData).replace(
        '<script type="application/json" amp-ad-metadata>',
        '<script type=application/json amp-ad-metadata>'
      );
      const actual = a4a.getAmpAdMetadata(creative);
      const expected = {
        minifiedCreative: testFragments.minimalDocOneStyleSrcDoc,
        ...metaData,
      };
      expect(actual).to.deep.equal(expected);
    });

    it('should return null if metadata opening tag is (truly) wrong', () => {
      const creative = buildCreativeString(metaData).replace(
        '<script type="application/json" amp-ad-metadata>',
        '<script type=application/json" amp-ad-metadata>'
      );
      expect(a4a.getAmpAdMetadata(creative)).to.be.null;
    });

    it('should return null if missing ampRuntimeUtf16CharOffsets', () => {
      const baseTestDoc = testFragments.minimalDocOneStyle;
      const splicePoint = baseTestDoc.indexOf('</body>');
      expect(
        a4a.getAmpAdMetadata(
          baseTestDoc.slice(0, splicePoint) +
            '<script type="application/json" amp-ad-metadata></script>' +
            baseTestDoc.slice(splicePoint)
        )
      ).to.be.null;
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
      const expected = {
        minifiedCreative: testFragments.minimalDocOneStyleSrcDoc,
        ...metaData,
      };
      delete expected.images;
      expect(actual).to.deep.equal(expected);
    });

    it('should tolerate missing images', () => {
      delete metaData.images;
      const actual = a4a.getAmpAdMetadata(buildCreativeString(metaData));
      const expected = {
        minifiedCreative: testFragments.minimalDocOneStyleSrcDoc,
        ...metaData,
      };
      delete expected.images;
      expect(actual).to.deep.equal(expected);
    });

    it('should limit to 5 images', () => {
      while (metaData.images.length < 10) {
        metaData.images.push('https://another.image.com?abc=def');
      }
      expect(
        a4a.getAmpAdMetadata(buildCreativeString(metaData)).images.length
      ).to.equal(5);
    });

    it('should throw due to missing CTA type', () => {
      metaData.ctaUrl = 'http://foo.com';
      a4a.isSinglePageStoryAd = true;
      expect(() =>
        a4a.getAmpAdMetadata(buildCreativeString(metaData))
      ).to.throw(new RegExp(INVALID_SPSA_RESPONSE));
    });

    it('should not throw due to missing outlink', () => {
      metaData.ctaType = '0';
      a4a.isSinglePageStoryAd = true;
      const actual = a4a.getAmpAdMetadata(buildCreativeString(metaData));
      const expected = {
        minifiedCreative: testFragments.minimalDocOneStyleSrcDoc,
        ...metaData,
      };
      delete expected.ctaType;
      expect(actual).to.deep.equal(expected);
      expect(a4a.element.dataset.varsCtatype).to.equal('0');
    });

    it('should set appropriate attributes and return metadata object', () => {
      metaData.ctaType = '0';
      metaData.ctaUrl = 'http://foo.com';
      a4a.isSinglePageStoryAd = true;
      const actual = a4a.getAmpAdMetadata(buildCreativeString(metaData));
      const expected = {
        minifiedCreative: testFragments.minimalDocOneStyleSrcDoc,
        ...metaData,
      };
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

    beforeEach(async () => {
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      a4a = new MockA4AImpl(createA4aElement(fixture.doc));
      verifier = a4a.win['AMP_FAST_FETCH_SIGNATURE_VERIFIER_'] = {};
      a4a.keysetPromise_ = Promise.resolve();
      return fixture;
    });

    it('should pass verification with story ad', async () => {
      a4a.isSinglePageStoryAd = true;
      verifier.verify = () => Promise.resolve(VerificationStatus.OK);
      const result = await a4a.maybeValidateAmpCreative(/* bytes */ 'foo');
      expect(result).to.equal('foo');
    });

    it('should throw due to invalid AMP creative with story ad', async () => {
      a4a.isSinglePageStoryAd = true;
      verifier.verify = () => Promise.resolve(VerificationStatus.UNVERIFIED);
      try {
        await a4a.maybeValidateAmpCreative();
      } catch (error) {
        expect(error.message).to.equal(INVALID_SPSA_RESPONSE);
      }
    });
  });

  describe('#renderOutsideViewport', () => {
    let a4aElement;
    let a4a;
    let fixture;

    beforeEach(async () => {
      fixture = await createIframePromise();
      setupForAdTesting(fixture);
      a4aElement = createA4aElement(fixture.doc);
      a4a = new MockA4AImpl(a4aElement);
      a4a.buildCallback();
      return fixture;
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
        'data-loading-strategy',
        'prefer-viewability-over-views'
      );
      expect(a4a.renderOutsideViewport()).to.equal(1.25);
      a4a.isVerifiedAmpCreative_ = true;
      expect(a4a.renderOutsideViewport()).to.equal(1.25);
    });
  });

  describe('#renderAmpCreative_', () => {
    const metaData = AmpA4A.prototype.getAmpAdMetadata(buildCreativeString());
    let a4aElement;
    let a4a;

    beforeEach(async () => {
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      const {doc} = fixture;
      a4aElement = createA4aElement(doc);
      a4a = new AmpA4A(a4aElement);
      env.sandbox.stub(a4a, 'getFallback').callsFake(() => {
        return true;
      });
      a4a.buildCallback();
      a4a.adUrl_ = 'https://nowhere.org';
    });

    it('should render correctly', async () => {
      await a4a.renderAmpCreative_(metaData);
      // Verify iframe presence.
      expect(a4aElement.children.length).to.equal(1);
      const friendlyIframe = a4aElement.children[0];
      expect(friendlyIframe.tagName).to.equal('IFRAME');
      expect(friendlyIframe.src).to.not.be.ok;
      expect(friendlyIframe.srcdoc).to.be.ok;
      const frameDoc = friendlyIframe.contentDocument;
      const styles = frameDoc.querySelectorAll('style[amp-custom]');
      expect(
        Array.prototype.some.call(styles, (s) => {
          return s.innerHTML == 'p { background: green }';
        }),
        'Some style is "background: green"'
      ).to.be.true;
      expect(frameDoc.body.innerHTML.trim()).to.equal('<p>some text</p>');
      expect(
        Services.urlReplacementsForDoc(frameDoc.documentElement)
      ).to.not.equal(Services.urlReplacementsForDoc(a4aElement));
      expect(
        Services.urlReplacementsForDoc(frameDoc.documentElement).ampdoc.win
      ).to.equal(frameDoc.defaultView);
    });
  });

  describe('#getLayoutPriority', () => {
    describes.realWin(
      'with shadow AmpDoc',
      {
        amp: {
          ampdoc: 'shadow',
        },
      },
      (env) => {
        it('should return priority of 1', () => {
          const body = env.ampdoc.getBody();
          const a4aElement = createA4aElement(env.win.document, null, body);
          const a4a = new MockA4AImpl(a4aElement);
          expect(a4a.getLayoutPriority()).to.equal(
            LayoutPriority_Enum.METADATA
          );
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
          const body = env.ampdoc.getBody();
          const a4aElement = createA4aElement(env.win.document, null, body);
          const a4a = new MockA4AImpl(a4aElement);
          expect(a4a.getLayoutPriority()).to.equal(LayoutPriority_Enum.ADS);
        });
      }
    );
  });

  describe('#unlayoutCallback', () => {
    it('verify state reset', async () => {
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      fetchMock.getOnce(
        TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
        () => adResponse,
        {name: 'ad'}
      );
      const {doc} = fixture;
      const a4aElement = createA4aElement(doc);
      const a4a = new MockA4AImpl(a4aElement);
      a4a.buildCallback();
      return a4a.onLayoutMeasure(() => {
        expect(a4a.adPromise_).to.not.be.null;
        expect(a4a.element.children).to.have.lengthOf(1);
      });
    });

    it('attemptChangeSize reverts', async () => {
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      fetchMock.getOnce(
        TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
        () => adResponse,
        {name: 'ad'}
      );
      const {doc} = fixture;
      const a4aElement = createA4aElement(doc);
      const a4a = new MockA4AImpl(a4aElement);
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      const attemptChangeSizeStub = env.sandbox.stub(
        AMP.BaseElement.prototype,
        'attemptChangeSize'
      );
      // Expect called twice: one for resize and second for reverting.
      attemptChangeSizeStub.withArgs(123, 456).returns(Promise.resolve());
      attemptChangeSizeStub.withArgs(200, 50).returns(Promise.resolve());
      a4a.attemptChangeSize(123, 456);
      a4a.layoutCallback(() => {
        expect(a4aElement.querySelector('iframe')).to.be.ok;
        a4a.unlayoutCallback();
      });
    });

    it('verify cancelled promise', async () => {
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      let whenFirstVisibleResolve = null;
      whenVisibleMock.returns(
        new Promise((resolve) => {
          whenFirstVisibleResolve = resolve;
        })
      );
      const {doc} = fixture;
      const a4aElement = createA4aElement(doc);
      const a4a = new MockA4AImpl(a4aElement);
      const getAdUrlSpy = env.sandbox.spy(a4a, 'getAdUrl');
      const errorHandlerSpy = env.sandbox.spy(a4a, 'promiseErrorHandler_');
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      const adPromise = a4a.adPromise_;
      // This is to prevent `applyUnlayoutUI` to be called;
      a4a.uiHandler.state = 0;
      a4a.unlayoutCallback();
      whenFirstVisibleResolve();
      try {
        await adPromise;
        assert.fail('cancelled ad promise should not succeed');
      } catch (reason) {
        expect(getAdUrlSpy.called, 'getAdUrl never called').to.be.false;
        expect(reason.message).to.equal(cancellation().message);
        expect(errorHandlerSpy).to.be.calledOnce;
      }
    });

    describe('consent integration', () => {
      let fixture,
        a4aElement,
        a4a,
        consentString,
        consentMetadata,
        gdprApplies,
        consentSharedData;
      beforeEach(async () => {
        fixture = await createIframePromise();
        setupForAdTesting(fixture);
        fetchMock.getOnce(
          TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
          () => adResponse,
          {name: 'ad'}
        );
        a4aElement = createA4aElement(fixture.doc);
        a4a = new MockA4AImpl(a4aElement);
        consentString = 'test-consent-string';
        gdprApplies = true;
        consentMetadata = {
          gdprApplies,
          'consentStringType': 1,
          'additionalConsent': 'abc123',
        };
        consentSharedData = {
          'doubleclick-tfcd': 1,
          'doubleclick-tfua': 1,
        };
        return fixture;
      });

      it('should delay ad url by getConsentPolicyState', async () => {
        env.sandbox
          .stub(AMP.BaseElement.prototype, 'getConsentPolicy')
          .returns('default');
        let inResolver;
        const policyPromise = new Promise(
          (resolver) => (inResolver = resolver)
        );
        env.sandbox.stub(Services, 'consentPolicyServiceForDocOrNull').returns(
          Promise.resolve({
            whenPolicyResolved: () => policyPromise,
            getConsentStringInfo: () => consentString,
            getConsentMetadataInfo: () => consentMetadata,
            getMergedSharedData: () => consentSharedData,
          })
        );

        const getAdUrlSpy = env.sandbox.spy(a4a, 'getAdUrl');
        const tryExecuteRealTimeConfigSpy = env.sandbox.spy(
          a4a,
          'tryExecuteRealTimeConfig_'
        );

        a4a.buildCallback();
        a4a.onLayoutMeasure();
        // allow ad promise to start execution, unfortunately timer is only way.
        await Services.timerFor(a4a.win).promise(50);
        expect(getAdUrlSpy).to.not.be.called;
        inResolver(CONSENT_POLICY_STATE.SUFFICIENT);
        await a4a.layoutCallback();
        expect(
          getAdUrlSpy.withArgs({
            consentState: CONSENT_POLICY_STATE.SUFFICIENT,
            consentString,
            gdprApplies,
            consentStringType: consentMetadata['consentStringType'],
            additionalConsent: consentMetadata['additionalConsent'],
            consentSharedData,
          })
        ).calledOnce;
        expect(
          tryExecuteRealTimeConfigSpy.withArgs(
            CONSENT_POLICY_STATE.SUFFICIENT,
            consentString,
            consentMetadata
          )
        ).calledOnce;
      });

      it('should not wait on consent if no policy', async () => {
        env.sandbox
          .stub(AMP.BaseElement.prototype, 'getConsentPolicy')
          .returns(null);
        const consentServiceSpy = env.sandbox.spy(
          Services,
          'consentPolicyServiceForDocOrNull'
        );
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        await a4a.layoutCallback();
        expect(consentServiceSpy).to.not.be.called;
      });

      it('should pass consent state to getAdUrl', async () => {
        env.sandbox
          .stub(AMP.BaseElement.prototype, 'getConsentPolicy')
          .returns('default');
        env.sandbox.stub(Services, 'consentPolicyServiceForDocOrNull').returns(
          Promise.resolve({
            whenPolicyResolved: () =>
              Promise.resolve(CONSENT_POLICY_STATE.SUFFICIENT),
            getConsentStringInfo: () => consentString,
            getConsentMetadataInfo: () => consentMetadata,
            getMergedSharedData: () => consentSharedData,
          })
        );

        const getAdUrlSpy = env.sandbox.spy(a4a, 'getAdUrl');
        const tryExecuteRealTimeConfigSpy = env.sandbox.spy(
          a4a,
          'tryExecuteRealTimeConfig_'
        );

        a4a.buildCallback();
        a4a.onLayoutMeasure();
        await a4a.layoutCallback();
        expect(
          getAdUrlSpy.withArgs({
            consentState: CONSENT_POLICY_STATE.SUFFICIENT,
            consentString,
            gdprApplies,
            consentStringType: consentMetadata['consentStringType'],
            additionalConsent: consentMetadata['additionalConsent'],
            consentSharedData,
          })
        ).calledOnce;
        expect(
          tryExecuteRealTimeConfigSpy.withArgs(
            CONSENT_POLICY_STATE.SUFFICIENT,
            consentString,
            consentMetadata
          )
        ).calledOnce;
      });

      it('should return UNKNOWN if consent exception', async () => {
        expectAsyncConsoleError(/Error determining consent state.*consent err/);
        env.sandbox
          .stub(AMP.BaseElement.prototype, 'getConsentPolicy')
          .returns('default');
        env.sandbox.stub(Services, 'consentPolicyServiceForDocOrNull').returns(
          Promise.resolve({
            whenPolicyResolved: () => {
              throw new Error('consent err!');
            },
            getConsentStringInfo: () => {
              throw new Error('consent err!');
            },
            getConsentMetadata: () => {
              throw new Error('consent err!');
            },
            getMergedSharedData: () => {
              throw new Error('consent err!');
            },
          })
        );

        const getAdUrlSpy = env.sandbox.spy(a4a, 'getAdUrl');
        const tryExecuteRealTimeConfigSpy = env.sandbox.spy(
          a4a,
          'tryExecuteRealTimeConfig_'
        );

        a4a.buildCallback();
        a4a.onLayoutMeasure();
        await a4a.layoutCallback();
        expect(
          getAdUrlSpy.withArgs({
            consentState: CONSENT_POLICY_STATE.UNKNOWN,
            consentString: null,
            consentStringType: null,
            gdprApplies: null,
            additionalConsent: null,
            consentSharedData: null,
          })
        ).calledOnce;
        expect(
          tryExecuteRealTimeConfigSpy.withArgs(
            CONSENT_POLICY_STATE.UNKNOWN,
            null,
            null
          )
        ).calledOnce;
      });
    });

    describe('protectFunctionWrapper', () => {
      it('works properly with no error', () => {
        let errorCalls = 0;
        expect(
          protectFunctionWrapper(
            (name) => {
              return `hello ${name}`;
            },
            null,
            () => {
              errorCalls++;
            }
          )('world')
        ).to.equal('hello world');
        expect(errorCalls).to.equal(0);
      });

      it('handles error properly', () => {
        const err = new Error('test fail');
        expect(
          protectFunctionWrapper(
            (name, suffix) => {
              expect(name).to.equal('world');
              expect(suffix).to.equal('!');
              throw err;
            },
            null,
            (currErr, name, suffix) => {
              expect(currErr).to.equal(err);
              expect(name).to.equal('world');
              expect(suffix).to.equal('!');
              return 'pass';
            }
          )('world', '!')
        ).to.equal('pass');
      });

      it('returns undefined if error thrown in error handler', () => {
        const err = new Error('test fail within fn');
        expect(
          protectFunctionWrapper(
            (name, suffix) => {
              expect(name).to.equal('world');
              expect(suffix).to.be.undefined;
              throw err;
            },
            null,
            (currErr, name, suffix) => {
              expect(currErr).to.equal(err);
              expect(name).to.equal('world');
              expect(suffix).to.be.undefined;
              throw new Error('test fail within error fn');
            }
          )('world')
        ).to.be.undefined;
      });
    });
  });

  describe('error handler', () => {
    let a4aElement;
    let a4a;
    let userErrorStub;
    let userWarnStub;
    let devExpectedErrorStub;

    beforeEach(async () => {
      userErrorStub = env.sandbox.stub(user(), 'error');
      userWarnStub = env.sandbox.stub(user(), 'warn');
      devExpectedErrorStub = env.sandbox.stub(dev(), 'expectedError');
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      const {doc} = fixture;
      a4aElement = createA4aElement(doc);
      a4a = new MockA4AImpl(a4aElement);
      a4a.adUrl_ = 'https://acme.org?query';
    });

    it('should rethrow cancellation', () => {
      expect(() => {
        a4a.promiseErrorHandler_(cancellation());
      }).to.throw(/CANCELLED/);
    });

    it('should create an error if needed', () => {
      env.sandbox.stub(mode, 'getMode').returns({development: true});
      a4a.promiseErrorHandler_('intentional');
      expect(userErrorStub).to.be.calledOnce;
      expect(userErrorStub.args[0][1]).to.be.instanceOf(Error);
      expect(userErrorStub.args[0][1].message).to.be.match(/intentional/);
      expect(userErrorStub.args[0][1].ignoreStack).to.be.undefined;
    });

    it('should configure ignoreStack when specified', () => {
      env.sandbox.stub(mode, 'getMode').returns({development: true});
      a4a.promiseErrorHandler_('intentional', /* ignoreStack */ true);
      expect(userErrorStub).to.be.calledOnce;
      expect(userErrorStub.args[0][1]).to.be.instanceOf(Error);
      expect(userErrorStub.args[0][1].message).to.be.match(/intentional/);
      expect(userErrorStub.args[0][1].ignoreStack).to.equal(true);
    });

    it('should route error to user.error in dev mode', () => {
      const error = new Error('intentional');
      env.sandbox.stub(mode, 'getMode').returns({development: true});
      a4a.promiseErrorHandler_(error);
      expect(userErrorStub).to.be.calledOnce;
      expect(userErrorStub.args[0][1]).to.be.equal(error);
      expect(error.message).to.equal('amp-a4a: adsense: intentional');
      expect(error.args).to.deep.equal({au: 'query'});
      expect(devExpectedErrorStub).to.not.be.called;
    });

    it('should route error to user.warn in prod mode', () => {
      const error = new Error('intentional');
      env.sandbox.stub(mode, 'getMode').returns({development: false});
      a4a.promiseErrorHandler_(error);
      expect(userWarnStub).to.be.calledOnce;
      expect(userWarnStub.args[0][1]).to.be.equal(error);
      expect(error.message).to.equal('amp-a4a: adsense: intentional');
      expect(error.args).to.deep.equal({au: 'query'});
    });

    it('should send an expected error in prod mode with sampling', () => {
      const error = new Error('intentional');
      env.sandbox.stub(Math, 'random').callsFake(() => 0.005);
      env.sandbox.stub(mode, 'getMode').returns({development: false});
      a4a.promiseErrorHandler_(error);
      expect(devExpectedErrorStub).to.be.calledOnce;
      expect(devExpectedErrorStub.args[0][1]).to.be.equal(error);
      expect(error.message).to.equal('amp-a4a: adsense: intentional');
      expect(error.args).to.deep.equal({au: 'query'});
    });

    it('should NOT send an expected error in prod mode with sampling', () => {
      const error = new Error('intentional');
      env.sandbox.stub(Math, 'random').callsFake(() => 0.011);
      env.sandbox.stub(mode, 'getMode').returns({development: false});
      a4a.promiseErrorHandler_(error);
      expect(devExpectedErrorStub).to.not.be.called;
    });
  });

  describe('block-rtc attribute', () => {
    describes.realWin('block-rtc attribute', {}, (env) => {
      let geoService, a4a, element, fixture;

      beforeEach(async () => {
        fixture = await createIframePromise();
        element = createA4aElement(fixture.doc);
        a4a = new MockA4AImpl(element);
        geoService = {
          isInCountryGroup(country) {
            switch (country) {
              case 'usca':
                return GEO_IN_GROUP.IN;
              case 'gdpr':
                return GEO_IN_GROUP.NOT_IN;
              default:
                return GEO_IN_GROUP.NOT_DEFINED;
            }
          },
        };
        return fixture;
      });

      it('should return false if no attribute found', async () => {
        expect(await a4a.getBlockRtc_()).to.false;
      });

      it('should return false if empty string', async () => {
        element.setAttribute('block-rtc', '');
        expect(await a4a.getBlockRtc_()).to.false;
      });

      it('should return if doc is served from a defined geo group', async () => {
        env.sandbox
          .stub(Services, 'geoForDocOrNull')
          .returns(Promise.resolve(geoService));
        element.setAttribute('block-rtc', 'gdpr,usca');
        expect(await a4a.getBlockRtc_()).to.true;
      });

      it('should return false when doc is in an undefined group or not in', async () => {
        const warnSpy = env.sandbox.stub(user(), 'warn');
        env.sandbox
          .stub(Services, 'geoForDocOrNull')
          .returns(Promise.resolve(geoService));

        // Undefined group
        element.setAttribute('block-rtc', 'tx');
        expect(await a4a.getBlockRtc_()).to.false;
        expect(warnSpy.args[0][0]).to.match(/AMP-AD/);
        expect(warnSpy.args[0][1]).to.match(/Geo group "tx" was not defined./);
        expect(warnSpy).to.have.been.calledOnce;
        // Not in
        element.setAttribute('block-rtc', 'gdpr');
        expect(await a4a.getBlockRtc_()).to.false;
      });

      it('should throw an error when there is no geoService', async () => {
        geoService = null;
        env.sandbox
          .stub(Services, 'geoForDocOrNull')
          .returns(Promise.resolve(geoService));
        element.setAttribute('block-rtc', 'usca');
        await expect(a4a.getBlockRtc_()).to.be.rejectedWith(
          /requires <amp-geo> to use `block-rtc`/
        );
      });

      it('should not execute RealTimeConfig if the attribute is valid', async () => {
        env.sandbox
          .stub(Services, 'geoForDocOrNull')
          .returns(Promise.resolve(geoService));

        const realTimeConfigStub = env.sandbox.stub(
          Services,
          'realTimeConfigForDoc'
        );
        element.setAttribute('block-rtc', 'usca');
        await a4a.tryExecuteRealTimeConfig_();
        expect(realTimeConfigStub).to.not.be.called;
      });
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
      expect(
        AmpA4A.prototype.extractSize(
          new Headers({
            'X-CreativeSize': '320x50',
          })
        )
      ).to.deep.equal({width: 320, height: 50});
    });

    it('should return no size', () => {
      expect(AmpA4A.prototype.extractSize(new Headers())).to.be.null;
    });
  });

  describe('refresh', () => {
    it('should effectively reset the slot and invoke given callback', async () => {
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      const a4aElement = createA4aElement(fixture.doc);
      const a4a = new MockA4AImpl(a4aElement);
      a4a.adPromise_ = Promise.resolve();
      a4a.getAmpDoc = () => fixture.ampdoc;
      a4a.getResource = () => {
        return {
          layoutCanceled: () => {},
        };
      };
      a4a.mutateElement = (func) => func();
      a4a.togglePlaceholder = env.sandbox.spy();

      // We don't really care about the behavior of the following methods, so
      // long as they're called the appropriate number of times. We stub them
      // out here because they would otherwise throw errors unrelated to the
      // behavior actually being tested.
      const initiateAdRequestMock = env.sandbox.stub(
        AmpA4A.prototype,
        'initiateAdRequest'
      );
      initiateAdRequestMock.returns(undefined);
      const tearDownSlotMock = env.sandbox.stub(
        AmpA4A.prototype,
        'tearDownSlot'
      );
      tearDownSlotMock.returns(undefined);
      const destroyFrameMock = env.sandbox.stub(
        AmpA4A.prototype,
        'destroyFrame'
      );
      destroyFrameMock.returns(undefined);
      env.sandbox.stub(analytics, 'triggerAnalyticsEvent');

      expect(a4a.isRefreshing).to.be.false;
      await a4a.refresh(() => {});
      expect(initiateAdRequestMock).to.be.calledOnce;
      expect(tearDownSlotMock).to.be.calledOnce;
      expect(a4a.togglePlaceholder).to.be.calledOnce;
      expect(a4a.isRefreshing).to.be.true;
      expect(a4a.isRelayoutNeededFlag).to.be.true;
    });

    it('should fire an analytics event when refreshing', async () => {
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      const a4aElement = createA4aElement(fixture.doc);
      const a4a = new MockA4AImpl(a4aElement);
      a4a.adPromise_ = Promise.resolve();
      a4a.getAmpDoc = () => fixture.ampdoc;
      a4a.getResource = () => {
        return {
          layoutCanceled: () => {},
        };
      };
      a4a.mutateElement = (func) => func();
      a4a.togglePlaceholder = env.sandbox.spy();

      // We don't really care about the behavior of the following methods, so
      // long as they're called the appropriate number of times. We stub them
      // out here because they would otherwise throw errors unrelated to the
      // behavior actually being tested.
      const initiateAdRequestMock = env.sandbox.stub(
        AmpA4A.prototype,
        'initiateAdRequest'
      );
      initiateAdRequestMock.returns(undefined);
      const tearDownSlotMock = env.sandbox.stub(
        AmpA4A.prototype,
        'tearDownSlot'
      );
      tearDownSlotMock.returns(undefined);
      const destroyFrameMock = env.sandbox.stub(
        AmpA4A.prototype,
        'destroyFrame'
      );
      destroyFrameMock.returns(undefined);

      const triggerAnalyticsEventStub = env.sandbox.stub(
        analytics,
        'triggerAnalyticsEvent'
      );

      expect(a4a.isRefreshing).to.be.false;
      await a4a.refresh(() => {});
      expect(triggerAnalyticsEventStub).calledWith(a4a.element, 'ad-refresh');
    });

    it('should fail gracefully if race conditions nullify adPromise', async () => {
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      const a4aElement = createA4aElement(fixture.doc);
      const a4a = new MockA4AImpl(a4aElement);
      a4a.adPromise_ = null;
      a4a.getAmpDoc = () => fixture.ampdoc;
      a4a.getResource = () => {
        return {
          layoutCanceled: () => {},
        };
      };
      a4a.mutateElement = (func) => func();
      a4a.togglePlaceholder = env.sandbox.spy();

      env.sandbox
        .stub(AmpA4A.prototype, 'initiateAdRequest')
        .returns(undefined);
      env.sandbox.stub(AmpA4A.prototype, 'tearDownSlot').returns(undefined);
      const callback = env.sandbox.spy();
      await a4a.refresh(callback);
      expect(callback).to.not.be.called;
    });
  });

  describe('buildCallback', () => {
    it('should set isSinglePageStoryAd to false', async () => {
      const fixture = await createIframePromise();
      const element = createA4aElement(fixture.doc);
      const a4a = new MockA4AImpl(element);
      a4a.buildCallback();
      expect(a4a.isSinglePageStoryAd).to.be.false;
    });

    it('should set isSinglePageStoryAd to true', async () => {
      const fixture = await createIframePromise();
      const element = createA4aElement(fixture.doc);
      element.setAttribute('amp-story', 1);
      const a4a = new MockA4AImpl(element);
      a4a.buildCallback();
      expect(a4a.isSinglePageStoryAd).to.be.true;
    });
  });

  describe('pause and resume', () => {
    let a4a;
    let pauseStub, resumeStub;

    beforeEach(async () => {
      const fixture = await createIframePromise();
      const element = createA4aElement(fixture.doc);
      a4a = new MockA4AImpl(element);
      await a4a.buildCallback();
      a4a.onLayoutMeasure();
      await a4a.layoutCallback();

      // Never resolve
      env.sandbox
        ./*OK*/ stub(FriendlyIframeEmbed.prototype, 'whenIniLoaded')
        .callsFake(() => {
          return new Promise(() => {});
        });
      const creativeString = buildCreativeString();
      const metaData = a4a.getAmpAdMetadata(creativeString);
      await a4a.renderAmpCreative_(metaData);

      pauseStub = env.sandbox./*OK*/ stub(
        FriendlyIframeEmbed.prototype,
        'pause'
      );
      resumeStub = env.sandbox./*OK*/ stub(
        FriendlyIframeEmbed.prototype,
        'resume'
      );
    });

    it('should pause the embed', () => {
      expect(pauseStub).to.not.be.called;
      expect(resumeStub).to.not.be.called;

      a4a.pauseCallback();
      expect(pauseStub).to.be.calledOnce;

      a4a.resumeCallback();
      expect(resumeStub).to.be.calledOnce;
    });
  });

  describe('canonical AMP', () => {
    describe('preferential rendering', () => {
      let a4aElement;
      let a4a;
      let fixture;
      beforeEach(async () => {
        fixture = await createIframePromise();
        setupForAdTesting(fixture);
        fetchMock.getOnce(
          TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
          () => adResponse,
          {name: 'ad'}
        );
        a4aElement = createA4aElement(fixture.doc);
        a4a = new MockA4AImpl(a4aElement);
        a4a.releaseType_ = '0';
        return fixture;
      });

      // TODO(ccordry): delete crypto tests when launched.
      it('by default not allowed if crypto signature present but no SSL', async () => {
        if (NO_SIGNING_RTV) {
          return;
        }
        env.sandbox
          .stub(Services.cryptoFor(fixture.win), 'isPkcsAvailable')
          .returns(false);
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        await a4a.layoutCallback();
        expect(a4aElement.querySelector('iframe[src]')).to.be.ok;
        expect(a4aElement.querySelector('iframe[srcdoc]')).to.not.be.ok;
      });

      it(
        'allowed if crypto signature present, no SSL, and overrided' +
          ' shouldPreferentialRenderWithoutCrypto',
        async () => {
          env.sandbox
            .stub(Services.cryptoFor(fixture.win), 'isPkcsAvailable')
            .returns(false);
          env.sandbox
            .stub(AmpA4A.prototype, 'shouldPreferentialRenderWithoutCrypto')
            .callsFake(() => true);
          a4a.buildCallback();
          a4a.onLayoutMeasure();
          await a4a.layoutCallback();
          verifyA4ARender(a4aElement);
        }
      );

      it('not allowed if no crypto signature present', async () => {
        if (NO_SIGNING_RTV) {
          return;
        }
        delete adResponse.headers['AMP-Fast-Fetch-Signature'];
        delete adResponse.headers[AMP_SIGNATURE_HEADER];
        env.sandbox
          .stub(AmpA4A.prototype, 'shouldPreferentialRenderWithoutCrypto')
          .callsFake(() => true);
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        await a4a.layoutCallback();
        expect(a4aElement.querySelector('iframe[src]')).to.be.ok;
        expect(a4aElement.querySelector('iframe[srcdoc]')).to.not.be.ok;
      });
    });

    it('shouldPreferentialRenderWithoutCrypto returns false by default', async () => {
      const fixture = await createIframePromise();
      setupForAdTesting(fixture);
      const {doc} = fixture;
      const a4aElement = createA4aElement(doc);
      const a4a = new AmpA4A(a4aElement);
      expect(a4a.shouldPreferentialRenderWithoutCrypto()).to.be.false;
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

describes.realWin('AmpA4a-RTC', {amp: true}, (env) => {
  let element;
  let a4a;

  beforeEach(() => {
    // ensures window location == AMP cache passes
    env.win.__AMP_MODE.test = true;
    const doc = env.win.document;
    element = createElementWithAttributes(env.win.document, 'amp-ad', {
      'width': '200',
      'height': '50',
      'type': 'doubleclick',
      'layout': 'fixed',
    });
    doc.body.appendChild(element);
    a4a = new AmpA4A(element);
  });

  describe('#tryExecuteRealTimeConfig', () => {
    it('should not execute if RTC never imported', () => {
      expect(a4a.tryExecuteRealTimeConfig_()).to.be.undefined;
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
    ].forEach((test) =>
      it(JSON.stringify(test), () => {
        const {expected, prefVal, type} = test;
        if (type) {
          a4a.element.setAttribute('type', type);
        }
        a4a.postAdResponseExperimentFeatures['pref_neutral_enabled'] = prefVal;
        expect(a4a.inNonAmpPreferenceExp()).to.equal(!!expected);
      })
    );
  });
});
