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

import {
  MockA4AImpl,
  TEST_URL,
  SIGNATURE_HEADER,
} from './utils';
import {createIframePromise} from '../../../../testing/iframe';
import {
  AmpA4A,
  RENDERING_TYPE_HEADER,
  DEFAULT_SAFEFRAME_VERSION,
  SAFEFRAME_VERSION_HEADER,
  protectFunctionWrapper,
  assignAdUrlToError,
} from '../amp-a4a';
import {FriendlyIframeEmbed} from '../../../../src/friendly-iframe-embed';
import {Signals} from '../../../../src/utils/signals';
import {Xhr} from '../../../../src/service/xhr-impl';
import {Extensions} from '../../../../src/service/extensions-impl';
import {Viewer} from '../../../../src/service/viewer-impl';
import {ampdocServiceFor} from '../../../../src/ampdoc';
import {cryptoFor} from '../../../../src/crypto';
import {isExperimentOn, toggleExperiment} from '../../../../src/experiments';
import {cancellation} from '../../../../src/error';
import {
  data as validCSSAmp,
} from './testdata/valid_css_at_rules_amp.reserialized';
import {data as testFragments} from './testdata/test_fragments';
import {FetchResponseHeaders} from '../../../../src/service/xhr-impl';
import {base64UrlDecodeToBytes} from '../../../../src/utils/base64';
import {utf8Encode} from '../../../../src/utils/bytes';
import {resetScheduledElementForTesting} from '../../../../src/custom-element';
import {urlReplacementsForDoc} from '../../../../src/services';
import {incrementLoadingAds} from '../../../amp-ad/0.1/concurrent-load';
import {platformFor, timerFor} from '../../../../src/services';
import '../../../../extensions/amp-ad/0.1/amp-ad-xorigin-iframe-handler';
import {dev, user} from '../../../../src/log';
import {createElementWithAttributes} from '../../../../src/dom';
import {layoutRectLtwh} from '../../../../src/layout-rect';
import {installDocService} from '../../../../src/service/ampdoc-impl';
import * as sinon from 'sinon';

function setupForAdTesting(fixture) {
  installDocService(fixture.win, /* isSingleDoc */ true);
  const doc = fixture.doc;
  // TODO(a4a-cam@): This is necessary in the short term, until A4A is
  // smarter about host document styling.  The issue is that it needs to
  // inherit the AMP runtime style element in order for shadow DOM-enclosed
  // elements to behave properly.  So we have to set up a minimal one here.
  const ampStyle = doc.createElement('style');
  ampStyle.setAttribute('amp-runtime', 'scratch-fortesting');
  doc.head.appendChild(ampStyle);
}

describe('amp-a4a', () => {
  let sandbox;
  let xhrMock;
  let xhrMockJson;
  let getSigningServiceNamesMock;
  let viewerWhenVisibleMock;
  let mockResponse;
  let onCreativeRenderSpy;
  let headers;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    xhrMock = sandbox.stub(Xhr.prototype, 'fetch');
    xhrMockJson = sandbox.stub(Xhr.prototype, 'fetchJson');
    getSigningServiceNamesMock = sandbox.stub(AmpA4A.prototype,
        'getSigningServiceNames');
    onCreativeRenderSpy =
        sandbox.spy(AmpA4A.prototype, 'onCreativeRender');
    getSigningServiceNamesMock.returns(['google']);
    xhrMockJson.withArgs(
      'https://cdn.ampproject.org/amp-ad-verifying-keyset.json',
      {
        mode: 'cors',
        method: 'GET',
        ampCors: false,
        credentials: 'omit',
      }).returns(Promise.resolve({
        json() {
          return Promise.resolve({keys: [JSON.parse(validCSSAmp.publicKey)]});
        },
      }));
    viewerWhenVisibleMock = sandbox.stub(Viewer.prototype, 'whenFirstVisible');
    viewerWhenVisibleMock.returns(Promise.resolve());
    mockResponse = {
      arrayBuffer: function() {
        return utf8Encode(validCSSAmp.reserialized);
      },
      bodyUsed: false,
      headers: new FetchResponseHeaders({
        getResponseHeader(name) {
          return headers[name];
        },
      }),
      catch: callback => callback(),
    };
    headers = {};
    headers[SIGNATURE_HEADER] = validCSSAmp.signature;
  });

  afterEach(() => {
    sandbox.restore();
    resetScheduledElementForTesting(window, 'amp-a4a');
  });

  function createA4aElement(doc, opt_rect) {
    const element = createElementWithAttributes(doc, 'amp-a4a', {
      'width': opt_rect ? String(opt_rect.width) : '200',
      'height': opt_rect ? String(opt_rect.height) : '50',
      'type': 'adsense',
    });
    element.getAmpDoc = () => {
      const ampdocService = ampdocServiceFor(doc.defaultView);
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
    doc.body.appendChild(element);
    return element;
  }

  function buildCreativeString(opt_additionalInfo) {
    const baseTestDoc = testFragments.minimalDocOneStyle;
    const offsets = opt_additionalInfo || {};
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

  // Checks that element is an amp-ad that is rendered via A4A.
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

  // Checks that element is an amp-ad that is rendered via SafeFrame.
  function verifySafeFrameRender(element, sfVersion) {
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
    const contentLength = Number(match[2]);
    const rest = match[3];
    expect(rest.length > contentLength).to.be.true;
    const data = JSON.parse(rest.substr(contentLength));
    expect(data).to.be.ok;
    verifyContext(data._context);
  }

  function verifyContext(context) {
    expect(context).to.be.ok;
    expect(context.sentinel).to.be.ok;
    expect(context.sentinel).to.match(/((\d+)-\d+)/);
  }

  // Checks that element is an amp-ad that is rendered via nameframe.
  function verifyNameFrameRender(element) {
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
  }

  function verifyCachedContentIframeRender(element, srcUrl) {
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
  }

  function verifyNameData(nameData) {
    let attributes;
    expect(() => {attributes = JSON.parse(nameData);}).not.to.throw(Error);
    expect(attributes).to.be.ok;
    verifyContext(attributes._context);
  }

  describe('ads are visible', () => {
    let a4aElement;
    let a4a;
    let fixture;
    beforeEach(() => {
      xhrMock.withArgs(TEST_URL, {
        mode: 'cors',
        method: 'GET',
        credentials: 'include',
      }).onFirstCall().returns(Promise.resolve(mockResponse));
      return createIframePromise().then(f => {
        fixture = f;
        setupForAdTesting(fixture);
        a4aElement = createA4aElement(fixture.doc);
        a4a = new MockA4AImpl(a4aElement);
        return fixture;
      });
    });

    it('for SafeFrame rendering case', () => {
      // Make sure there's no signature, so that we go down the 3p iframe path.
      delete headers[SIGNATURE_HEADER];
      // If rendering type is safeframe, we SHOULD attach a SafeFrame.
      headers[RENDERING_TYPE_HEADER] = 'safeframe';
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      return a4a.layoutCallback().then(() => {
        const child = a4aElement.querySelector('iframe[name]');
        expect(child).to.be.ok;
        expect(child).to.be.visible;
        expect(onCreativeRenderSpy.withArgs(false)).to.be.called;
      });
    });

    it('for ios defaults to SafeFrame rendering', () => {
      const platform = platformFor(fixture.win);
      sandbox.stub(platform, 'isIos').returns(true);
      a4a = new MockA4AImpl(a4aElement);
      // Make sure there's no signature, so that we go down the 3p iframe path.
      delete headers[SIGNATURE_HEADER];
      // Ensure no rendering type header (ios on safari will default to
      // safeframe).
      delete headers[RENDERING_TYPE_HEADER];
      fixture.doc.body.appendChild(a4aElement);
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      return a4a.layoutCallback().then(() => {
        // Force vsync system to run all queued tasks, so that DOM mutations
        // are actually completed before testing.
        a4a.vsync_.runScheduledTasks_();
        const child = a4aElement.querySelector('iframe[name]');
        expect(child).to.be.ok;
        expect(child).to.be.visible;
        expect(onCreativeRenderSpy.withArgs(false)).to.be.called;
      });
    });

    it('for cached content iframe rendering case', () => {
      // Make sure there's no signature, so that we go down the 3p iframe path.
      delete headers[SIGNATURE_HEADER];
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      return a4a.layoutCallback().then(() => {
        const child = a4aElement.querySelector('iframe[src]');
        expect(child).to.be.ok;
        expect(child).to.be.visible;
        expect(onCreativeRenderSpy.withArgs(false)).to.be.called;
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

    it('for A4A FIE should wait for initial layout', () => {
      let iniLoadResolver;
      const iniLoadPromise = new Promise(resolve => {
        iniLoadResolver = resolve;
      });
      const whenIniLoadedStub = sandbox.stub(
          FriendlyIframeEmbed.prototype,
          'whenIniLoaded',
          () => iniLoadPromise);
      const lifecycleEventStub = sandbox.stub(
          a4a, 'protectedEmitLifecycleEvent_');
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      const layoutPromise = a4a.layoutCallback();
      return Promise.resolve().then(() => {
        expect(whenIniLoadedStub).to.not.be.called;
        iniLoadResolver();
        return layoutPromise;
      }).then(() => {
        expect(a4a.friendlyIframeEmbed_).to.exist;
        expect(a4a.friendlyIframeEmbed_.host).to.equal(a4a.element);
        expect(whenIniLoadedStub).to.be.calledOnce;
        expect(lifecycleEventStub).to.be.calledWith('friendlyIframeIniLoad');
      });
    });

    it('should reset state to null on non-FIE unlayoutCallback', () => {
      // Make sure there's no signature, so that we go down the 3p iframe path.
      delete headers[SIGNATURE_HEADER];
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      return a4a.layoutCallback().then(() => {
        expect(a4aElement.querySelector('iframe[src]')).to.be.ok;
        expect(a4a.unlayoutCallback()).to.be.true;
        expect(a4aElement.querySelector('iframe[src]')).to.not.be.ok;
      });
    });

    it('should not reset state to null on FIE unlayoutCallback', () => {
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      return a4a.layoutCallback().then(() => {
        a4a.vsync_.runScheduledTasks_();
        expect(a4a.friendlyIframeEmbed_).to.exist;
        const destroySpy = sandbox.spy();
        a4a.friendlyIframeEmbed_.destroy = destroySpy;
        expect(a4a.unlayoutCallback()).to.be.false;
        expect(a4a.friendlyIframeEmbed_).to.exist;
        expect(destroySpy).to.not.be.called;
      });
    });

    it('should reset state to null on FIE unlayoutCallback if exp set', () => {
      toggleExperiment(fixture.win, 'a4a-fie-unlayout-enabled', true, true);
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      return a4a.layoutCallback().then(() => {
        expect(a4a.friendlyIframeEmbed_).to.exist;
        const destroySpy = sandbox.spy();
        a4a.friendlyIframeEmbed_.destroy = destroySpy;
        expect(a4a.unlayoutCallback()).to.be.true;
        expect(a4a.friendlyIframeEmbed_).to.not.exist;
        expect(destroySpy).to.be.calledOnce;
      });
    });

    it('should update embed visibility', () => {
      sandbox.stub(a4a, 'isInViewport', () => false);
      a4a.buildCallback();
      a4a.onLayoutMeasure();
      return a4a.layoutCallback().then(() => {
        a4a.vsync_.runScheduledTasks_();
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
  });
  describe('layoutCallback cancels properly', () => {
    let a4aElement;
    let a4a;
    let fixture;
    beforeEach(() => {
      xhrMock.withArgs(TEST_URL, {
        mode: 'cors',
        method: 'GET',
        credentials: 'include',
      }).onFirstCall().returns(Promise.resolve(mockResponse));
      return createIframePromise().then(f => {
        fixture = f;
        setupForAdTesting(fixture);
        a4aElement = createA4aElement(fixture.doc);
        a4a = new MockA4AImpl(a4aElement);
        return fixture;
      });
    });

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
          AmpA4A.prototype, 'renderNonAmpCreative_');
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
      delete headers[SIGNATURE_HEADER];
      // If rendering type is safeframe, we SHOULD attach a SafeFrame.
      headers[RENDERING_TYPE_HEADER] = 'safeframe';
      xhrMock.withArgs(TEST_URL, {
        mode: 'cors',
        method: 'GET',
        credentials: 'include',
      }).onFirstCall().returns(Promise.resolve(mockResponse));
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const doc = fixture.doc;
        a4aElement = createA4aElement(doc);
        a4a = new MockA4AImpl(a4aElement);
        a4a.createdCallback();
        a4a.firstAttachedCallback();
        a4a.buildCallback();
        expect(onCreativeRenderSpy).to.not.be.called;
      });
    });

    describe('illegal render mode value', () => {
      let devErrLogSpy;
      beforeEach(() => {
        devErrLogSpy = sandbox.spy(dev(), 'error');
        // If rendering type is unknown, should fall back to cached content
        // iframe and generate an error.
        headers[RENDERING_TYPE_HEADER] = 'random illegal value';
        a4a.onLayoutMeasure();
      });

      it('should render via cached iframe', () => {
        return a4a.layoutCallback().then(() => {
          verifyCachedContentIframeRender(a4aElement, TEST_URL);
          // Should have reported an error.
          expect(devErrLogSpy).to.be.calledOnce;
          expect(devErrLogSpy.getCall(0).args[1]).to.have.string(
            'random illegal value');
          expect(xhrMock).to.be.calledOnce;
        });
      });
    });

    describe('#renderViaNameFrame', () => {
      beforeEach(() => {
        // If rendering type is nameframe, we SHOULD attach a NameFrame.
        headers[RENDERING_TYPE_HEADER] = 'nameframe';
        a4a.onLayoutMeasure();
      });

      it('should attach a NameFrame when header is set', () => {
        return a4a.layoutCallback().then(() => {
          // Force vsync system to run all queued tasks, so that DOM mutations
          // are actually completed before testing.
          a4a.vsync_.runScheduledTasks_();
          verifyNameFrameRender(a4aElement);
          expect(xhrMock).to.be.calledOnce;
        });
      });

      it('should make only one NameFrame even if onLayoutMeasure called ' +
          'multiple times', () => {
        a4a.onLayoutMeasure();
        a4a.onLayoutMeasure();
        a4a.onLayoutMeasure();
        a4a.onLayoutMeasure();
        return a4a.layoutCallback().then(() => {
          // Force vsync system to run all queued tasks, so that DOM mutations
          // are actually completed before testing.
          a4a.vsync_.runScheduledTasks_();
          verifyNameFrameRender(a4aElement);
          expect(xhrMock).to.be.calledOnce;
        });
      });

      ['', 'client_cache', 'safeframe', 'some_random_thing'].forEach(
          headerVal => {
            it(`should not attach a NameFrame when header is ${headerVal}`,
                () => {
                  // Make sure there's no signature, so that we go down the 3p iframe path.
                  delete headers[SIGNATURE_HEADER];
                  // If rendering type is anything but nameframe, we SHOULD NOT
                  // attach a NameFrame.
                  headers[RENDERING_TYPE_HEADER] = headerVal;
                  a4a.onLayoutMeasure();
                  return a4a.layoutCallback().then(() => {
                    // Force vsync system to run all queued tasks, so that
                    // DOM mutations are actually completed before testing.
                    a4a.vsync_.runScheduledTasks_();
                    const nameChild = a4aElement.querySelector(
                        `iframe[src^="nameframe"]`);
                    expect(nameChild).to.not.be.ok;
                    if (headerVal != 'safeframe') {
                      const unsafeChild = a4aElement.querySelector('iframe');
                      expect(unsafeChild).to.be.ok;
                      expect(unsafeChild.getAttribute('src')).to.have.string(
                          TEST_URL);
                    }
                    expect(xhrMock).to.be.calledOnce;
                  });
                });
          });
    });

    describe('#renderViaSafeFrame', () => {
      beforeEach(() => {
        // If rendering type is safeframe, we SHOULD attach a SafeFrame.
        headers[RENDERING_TYPE_HEADER] = 'safeframe';
        a4a.onLayoutMeasure();
      });

      it('should attach a SafeFrame when header is set', () => {
        return a4a.layoutCallback().then(() => {
          // Force vsync system to run all queued tasks, so that DOM mutations
          // are actually completed before testing.
          a4a.vsync_.runScheduledTasks_();
          verifySafeFrameRender(a4aElement, DEFAULT_SAFEFRAME_VERSION);
          expect(xhrMock).to.be.calledOnce;
        });
      });

      it('should use safeframe version header value', () => {
        a4a.safeframeVersion_ = '1-2-3';
        return a4a.layoutCallback().then(() => {
          // Force vsync system to run all queued tasks, so that DOM mutations
          // are actually completed before testing.
          a4a.vsync_.runScheduledTasks_();
          verifySafeFrameRender(a4aElement, '1-2-3');
          expect(xhrMock).to.be.calledOnce;
        });
      });

      it('should make only one SafeFrame even if onLayoutMeasure called ' +
          'multiple times', () => {
        a4a.onLayoutMeasure();
        a4a.onLayoutMeasure();
        a4a.onLayoutMeasure();
        a4a.onLayoutMeasure();
        return a4a.layoutCallback().then(() => {
          // Force vsync system to run all queued tasks, so that DOM mutations
          // are actually completed before testing.
          a4a.vsync_.runScheduledTasks_();
          verifySafeFrameRender(a4aElement, DEFAULT_SAFEFRAME_VERSION);
          expect(xhrMock).to.be.calledOnce;
        });
      });

      ['', 'client_cache', 'nameframe', 'some_random_thing'].forEach(
          headerVal => {
            it(`should not attach a SafeFrame when header is ${headerVal}`,
                () => {
                  // If rendering type is anything but safeframe, we SHOULD NOT attach a
                  // SafeFrame.
                  headers[RENDERING_TYPE_HEADER] = headerVal;
                  a4a.onLayoutMeasure();
                  return a4a.layoutCallback().then(() => {
                    // Force vsync system to run all queued tasks, so that
                    // DOM mutations are actually completed before testing.
                    a4a.vsync_.runScheduledTasks_();
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
                    expect(xhrMock).to.be.calledOnce;
                  });
                });
          });

      it('should reset state to null on unlayoutCallback', () => {
        return a4a.layoutCallback().then(() => {
          // Force vsync system to run all queued tasks, so that DOM mutations
          // are actually completed before testing.
          a4a.vsync_.runScheduledTasks_();
          expect(a4a.experimentalNonAmpCreativeRenderMethod_)
              .to.equal('safeframe');
          a4a.unlayoutCallback();
          // QUESTION TO REVIEWERS: Do we really need the vsync.mutate in
          // AmpA4A.unlayoutCallback?  We have an open question there about
          // whether it's necessary or perhaps hazardous.  Feedback welcome.
          a4a.vsync_.runScheduledTasks_();
          expect(a4a.experimentalNonAmpCreativeRenderMethod_).to.be.null;
          expect(xhrMock).to.be.calledOnce;
        });
      });
    });
  });

  describe('cross-domain vs A4A', () => {
    let a4a;
    let a4aElement;
    beforeEach(() => {
      xhrMock.withArgs(TEST_URL, {
        mode: 'cors',
        method: 'GET',
        credentials: 'include',
      }).onFirstCall().returns(Promise.resolve(mockResponse));
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const doc = fixture.doc;
        a4aElement = createA4aElement(doc);
        a4a = new MockA4AImpl(a4aElement);
      });
    });
    afterEach(() => {
      expect(xhrMock).to.be.calledOnce;
    });

    ['nameframe', 'safeframe'].forEach(renderType => {
      it(`should not use ${renderType} if creative is A4A`, () => {
        headers[RENDERING_TYPE_HEADER] = renderType;
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        return a4a.layoutCallback().then(() => {
          // Force vsync system to run all queued tasks, so that DOM mutations
          // are actually completed before testing.
          a4a.vsync_.runScheduledTasks_();
          verifyA4ARender(a4aElement);
        });
      });

      it(`should not use ${renderType} even if onLayoutMeasure called ` +
          'multiple times', () => {
        headers[RENDERING_TYPE_HEADER] = renderType;
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        a4a.onLayoutMeasure();
        a4a.onLayoutMeasure();
        a4a.onLayoutMeasure();
        return a4a.layoutCallback().then(() => {
          const safeChild = a4aElement.querySelector('iframe[name]');
          expect(safeChild).to.not.be.ok;
          const crossDomainChild = a4aElement.querySelector('iframe[src]');
          expect(crossDomainChild).to.not.be.okay;
          const friendlyChild = a4aElement.querySelector('iframe[srcdoc]');
          expect(friendlyChild).to.be.ok;
          expect(friendlyChild.getAttribute('srcdoc')).to.have.string(
              '<html ⚡4ads>');
        });
      });
    });

    it('should set height/width on iframe matching header value', () => {
      // Make sure there's no signature, so that we go down the 3p iframe path.
      delete headers[SIGNATURE_HEADER];
      headers['X-CreativeSize'] = '320x50';
      xhrMock.withArgs(TEST_URL, {
        mode: 'cors',
        method: 'GET',
        credentials: 'include',
        requireAmpResponseSourceOrigin: true,
      }).onFirstCall().returns(Promise.resolve(mockResponse));
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const doc = fixture.doc;
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
          // Force vsync system to run all queued tasks, so that DOM mutations
          // are actually completed before testing.
          a4a.vsync_.runScheduledTasks_();
          const child = a4aElement.querySelector('iframe[name]');
          expect(child).to.be.ok;
          expect(child.getAttribute('width')).to.equal('320');
          expect(child.getAttribute('height')).to.equal('50');
        });
      });
    });
  });

  describe('#onLayoutMeasure', () => {
    it('resumeCallback calls onLayoutMeasure', () => {
      // Force non-FIE
      delete headers[SIGNATURE_HEADER];
      xhrMock.onFirstCall().returns(Promise.resolve(mockResponse));
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const doc = fixture.doc;
        const a4aElement = createA4aElement(doc);
        const s = doc.createElement('style');
        s.textContent = '.fixed {position:fixed;}';
        doc.head.appendChild(s);
        const a4a = new MockA4AImpl(a4aElement);
        const renderNonAmpCreativeSpy =
          sandbox.spy(a4a, 'renderNonAmpCreative_');
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.be.ok;
        return a4a.layoutCallback().then(() => {
          expect(renderNonAmpCreativeSpy.calledOnce,
              'renderNonAmpCreative_ called exactly once').to.be.true;
          a4a.unlayoutCallback();
          sandbox.stub(AmpA4A.prototype, 'getResource').returns(
            {'hasBeenMeasured': () => true, 'isMeasureRequested': () => false});
          const onLayoutMeasureSpy = sandbox.spy(a4a, 'onLayoutMeasure');
          a4a.resumeCallback();
          expect(onLayoutMeasureSpy).to.be.calledOnce;
          expect(a4a.fromResumeCallback).to.be.true;
        });
      });
    });
    it('resumeCallback does not call onLayoutMeasure for FIE', () => {
      xhrMock.onFirstCall().returns(Promise.resolve(mockResponse));
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const doc = fixture.doc;
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
          a4a.unlayoutCallback();
          const onLayoutMeasureSpy = sandbox.spy(a4a, 'onLayoutMeasure');
          a4a.resumeCallback();
          expect(onLayoutMeasureSpy).to.not.be.called;
          expect(a4a.fromResumeCallback).to.be.false;
        });
      });
    });
    it('resumeCallback does call onLayoutMeasure for FIE if exp set', () => {
      xhrMock.onFirstCall().returns(Promise.resolve(mockResponse));
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const doc = fixture.doc;
        const a4aElement = createA4aElement(doc);
        const s = doc.createElement('style');
        s.textContent = '.fixed {position:fixed;}';
        doc.head.appendChild(s);
        toggleExperiment(fixture.win, 'a4a-fie-unlayout-enabled', true, true);
        const a4a = new MockA4AImpl(a4aElement);
        const renderAmpCreativeSpy = sandbox.spy(a4a, 'renderAmpCreative_');
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.be.ok;
        return a4a.layoutCallback().then(() => {
          expect(renderAmpCreativeSpy.calledOnce,
              'renderAmpCreative_ called exactly once').to.be.true;
          a4a.unlayoutCallback();
          const onLayoutMeasureSpy = sandbox.spy(a4a, 'onLayoutMeasure');
          sandbox.stub(AmpA4A.prototype, 'getResource').returns(
            {'hasBeenMeasured': () => true, 'isMeasureRequested': () => false});
          a4a.resumeCallback();
          expect(onLayoutMeasureSpy).to.be.called;
          expect(a4a.fromResumeCallback).to.be.true;
        });
      });
    });
    it('resumeCallback w/ measure required no onLayoutMeasure', () => {
      // Force non-FIE
      delete headers[SIGNATURE_HEADER];
      xhrMock.onFirstCall().returns(Promise.resolve(mockResponse));
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const doc = fixture.doc;
        const a4aElement = createA4aElement(doc);
        const s = doc.createElement('style');
        s.textContent = '.fixed {position:fixed;}';
        doc.head.appendChild(s);
        const a4a = new MockA4AImpl(a4aElement);
        const renderNonAmpCreativeSpy =
          sandbox.spy(a4a, 'renderNonAmpCreative_');
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.be.ok;
        return a4a.layoutCallback().then(() => {
          expect(renderNonAmpCreativeSpy.calledOnce,
              'renderNonAmpCreative_ called exactly once').to.be.true;
          a4a.unlayoutCallback();
          const onLayoutMeasureSpy = sandbox.spy(a4a, 'onLayoutMeasure');
          sandbox.stub(AmpA4A.prototype, 'getResource').returns(
            {'hasBeenMeasured': () => false});
          a4a.resumeCallback();
          expect(onLayoutMeasureSpy).to.not.be.called;
          expect(a4a.fromResumeCallback).to.be.true;
        });
      });
    });
    it('should run end-to-end and render in friendly iframe', () => {
      xhrMock.withArgs(TEST_URL, {
        mode: 'cors',
        method: 'GET',
        credentials: 'include',
      }).onFirstCall().returns(Promise.resolve(mockResponse));
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const doc = fixture.doc;
        const a4aElement = createA4aElement(doc);
        const a4a = new MockA4AImpl(a4aElement);
        const getAdUrlSpy = sandbox.spy(a4a, 'getAdUrl');
        const updatePriorityStub = sandbox.stub(a4a, 'updatePriority');
        const extractCreativeAndSignatureSpy = sandbox.spy(
            a4a, 'extractCreativeAndSignature');
        const renderAmpCreativeSpy = sandbox.spy(a4a, 'renderAmpCreative_');
        const loadExtensionSpy =
            sandbox.spy(Extensions.prototype, 'loadExtension');
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.be.instanceof(Promise);
        return a4a.adPromise_.then(promiseResult => {
          expect(promiseResult).to.be.ok;
          expect(promiseResult.minifiedCreative).to.be.ok;
          expect(a4a.isVerifiedAmpCreative_).to.be.true;
          expect(getAdUrlSpy.calledOnce, 'getAdUrl called exactly once')
              .to.be.true;
          expect(xhrMock.calledOnce,
              'xhr.fetchTextAndHeaders called exactly once').to.be.true;
          expect(extractCreativeAndSignatureSpy.calledOnce,
              'extractCreativeAndSignatureSpy called exactly once').to.be.true;
          expect(loadExtensionSpy.withArgs('amp-font')).to.be.calledOnce;
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
            expect(onCreativeRenderSpy).to.be.calledOnce;
            expect(updatePriorityStub).to.be.calledOnce;
            expect(updatePriorityStub.args[0][0]).to.equal(0);
          });
        });
      });
    });
    it('must not be position:fixed', () => {
      xhrMock.onFirstCall().returns(Promise.resolve(mockResponse));
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const doc = fixture.doc;
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
      xhrMock.onFirstCall().returns(Promise.resolve(mockResponse));
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const doc = fixture.doc;
        const rect = layoutRectLtwh(0, 0, 200, 0);
        const a4aElement = createA4aElement(doc, rect);
        const a4a = new MockA4AImpl(a4aElement);
        // test 0 height
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
    function executeLayoutCallbackTest(isValidCreative, opt_failAmpRender) {
      xhrMock.withArgs(TEST_URL, {
        mode: 'cors',
        method: 'GET',
        credentials: 'include',
      }).onFirstCall().returns(Promise.resolve(mockResponse));
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const doc = fixture.doc;
        const a4aElement = createA4aElement(doc);
        const a4a = new MockA4AImpl(a4aElement);
        const getAdUrlSpy = sandbox.spy(a4a, 'getAdUrl');
        const updatePriorityStub = sandbox.stub(a4a, 'updatePriority');
        if (!isValidCreative) {
          sandbox.stub(a4a, 'extractCreativeAndSignature').returns(
            Promise.resolve({creative: mockResponse.arrayBuffer()}));
        }
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
          expect(xhrMock.calledOnce,
              'xhr.fetchTextAndHeaders called exactly once').to.be.true;
          expect(a4a.isVerifiedAmpCreative_).to.equal(isValidCreative);
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
              expect(onCreativeRenderSpy.withArgs(true)).to.be.calledOnce;
              expect(updatePriorityStub).to.be.calledOnce;
              expect(updatePriorityStub.args[0][0]).to.equal(0);
            } else {
              expect(iframe.getAttribute('srcdoc')).to.be.null;
              expect(iframe.src, 'verify iframe src w/ origin').to
                  .equal(TEST_URL +
                         '&__amp_source_origin=about%3Asrcdoc');
              expect(onCreativeRenderSpy.withArgs(false)).to.be.called;
              if (!opt_failAmpRender) {
                expect(updatePriorityStub).to.not.be.called;
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
    it('should not leak full response to rendered dom', () => {
      xhrMock.withArgs(TEST_URL, {
        mode: 'cors',
        method: 'GET',
        credentials: 'include',
      }).onFirstCall().returns(Promise.resolve(mockResponse));
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const doc = fixture.doc;
        const a4aElement = createA4aElement(doc);
        const a4a = new MockA4AImpl(a4aElement);
        const fullResponse = `<html amp>
            <body>
            <div class="forTest"></div>
            <script class="hostile">
            // Some hostile JavaScript
            assert.fail('This code should never be executed!');
            </script>
            <noscript>${validCSSAmp.reserialized}</noscript>
            <script type="application/json" amp-ad-metadata>
            {
               "bodyAttributes" : "",
               "bodyUtf16CharOffsets" : [ 10, 1000000 ],
               "cssUtf16CharOffsets" : [ 0, 0 ]
            }
            </script>
            </body></html>`;
        mockResponse.arrayBuffer = () => {
          return utf8Encode(fullResponse);
        };
        // Return value from `#extractCreativeAndSignature` is a sub-doc of
        // the full response.  To validate this test, comment out the following
        // statement and verify that test fails, with full response spliced in
        // to shadow doc.
        sandbox.stub(a4a, 'extractCreativeAndSignature').returns(
            utf8Encode(validCSSAmp.reserialized).then(c => {
              return {
                creative: c,
                signature: base64UrlDecodeToBytes(validCSSAmp.signature),
              };
            }));
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        return a4a.layoutCallback().then(() => {
          expect(a4a.isVerifiedAmpCreative_).to.be.true;
          const friendlyIframe = a4aElement.getElementsByTagName('iframe')[0];
          expect(friendlyIframe).to.be.ok;
          expect(friendlyIframe.getAttribute('srcdoc')).to.be.ok;
          expect(friendlyIframe.src).to.not.be.ok;
          const frameDoc = friendlyIframe.contentDocument;
          expect(frameDoc.querySelector('div[class=forTest]')).to.not.be.ok;
          expect(frameDoc.querySelector('script[class=hostile]')).to.not.be.ok;
          expect(frameDoc.querySelector('style[amp-custom]')).to.be.ok;
          expect(frameDoc.body.innerHTML, 'body content')
              .to.contain('Hello, world.');
          expect(onCreativeRenderSpy.withArgs(true)).to.be.calledOnce;
        });
      });
    });
    it('should run end-to-end in the presence of an XHR error', () => {
      xhrMock.onFirstCall().returns(Promise.reject(new Error('XHR Error')));
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const doc = fixture.doc;
        const a4aElement = createA4aElement(doc);
        const a4a = new MockA4AImpl(a4aElement);
        const lifecycleEventStub = sandbox.stub(
            a4a, 'protectedEmitLifecycleEvent_');
        const getAdUrlSpy = sandbox.spy(a4a, 'getAdUrl');
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.be.instanceof(Promise);
        return a4a.layoutCallback().then(() => {
          expect(getAdUrlSpy.calledOnce, 'getAdUrl called exactly once')
              .to.be.true;
          // Verify iframe presence and lack of visibility hidden
          const iframe = a4aElement.querySelector('iframe[src]');
          expect(iframe).to.be.ok;
          expect(iframe.src.indexOf(TEST_URL)).to.equal(0);
          expect(iframe).to.be.visible;
          expect(onCreativeRenderSpy.withArgs(false)).to.be.called;
          expect(lifecycleEventStub).to.be.calledWith('networkError');
        });
      });
    });
    it('should handle XHR error when resolves before layoutCallback', () => {
      xhrMock.onFirstCall().returns(Promise.reject(new Error('XHR Error')));
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const doc = fixture.doc;
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
          expect(onCreativeRenderSpy.withArgs(false)).to.be.called;
        }));
      });
    });
    it('should handle XHR error when resolves after layoutCallback', () => {
      let rejectXhr;
      xhrMock.onFirstCall().returns(new Promise((unusedResolve, reject) => {
        rejectXhr = reject;
      }));
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const doc = fixture.doc;
        const a4aElement = createA4aElement(doc);
        const a4a = new MockA4AImpl(a4aElement);
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        const layoutCallbackPromise = a4a.layoutCallback();
        rejectXhr(new Error('XHR Error'));
        return layoutCallbackPromise.then(() => {
          // Verify iframe presence and lack of visibility hidden
          expect(a4aElement.querySelectorAll('iframe').length).to.equal(1);
          const iframe = a4aElement.querySelectorAll('iframe')[0];
          expect(iframe.src.indexOf(TEST_URL)).to.equal(0);
          expect(iframe).to.be.visible;
          expect(onCreativeRenderSpy.withArgs(false)).to.be.called;
        });
      });
    });
    it('should collapse for 204 response code', () => {
      xhrMock.onFirstCall().returns(Promise.resolve({
        arrayBuffer: function() {
          return utf8Encode(validCSSAmp.reserialized);
        },
        bodyUsed: false,
        headers: new FetchResponseHeaders({
          getResponseHeader(name) {
            return headers[name];
          },
        }),
        catch: callback => callback(),
        status: 204,
      }));
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const doc = fixture.doc;
        const a4aElement = createA4aElement(doc);
        const a4a = new MockA4AImpl(a4aElement);
        const forceCollapseSpy = sandbox.spy(a4a, 'forceCollapse');
        const noContentUISpy = sandbox.spy();
        const unlayoutUISpy = sandbox.spy();
        a4a.uiHandler = {
          applyNoContentUI: () => {noContentUISpy();},
          applyUnlayoutUI: () => {unlayoutUISpy();},
        };
        sandbox.stub(a4a, 'getLayoutBox').returns({width: 123, height: 456});
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.be.ok;
        return a4a.adPromise_.then(() => {
          expect(forceCollapseSpy).to.be.calledOnce;
          expect(noContentUISpy).to.be.calledOnce;
          return a4a.layoutCallback().then(() => {
            // should have no iframe.
            expect(a4aElement.querySelector('iframe')).to.not.be.ok;
            expect(onCreativeRenderSpy).to.not.be.called;
            // call unlayout callback and verify it attempts to revert the size
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
            return timerFor(a4a.win).promise(1).then(() => {
              expect(a4a.originalSlotSize_).to.not.be.ok;
            });
          });
        });
      });
    });
    it('should collapse for empty array buffer', () => {
      xhrMock.onFirstCall().returns(Promise.resolve({
        arrayBuffer: function() {
          return utf8Encode('');
        },
        bodyUsed: false,
        headers: new FetchResponseHeaders({
          getResponseHeader(name) {
            return headers[name];
          },
        }),
        catch: callback => callback(),
      }));
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const doc = fixture.doc;
        const a4aElement = createA4aElement(doc);
        const a4a = new MockA4AImpl(a4aElement);
        const forceCollapseSpy = sandbox.spy(a4a, 'forceCollapse');
        const noContentUISpy = sandbox.spy();
        a4a.uiHandler = {
          applyNoContentUI: () => {noContentUISpy();},
          applyUnlayoutUI: () => {},
        };
        sandbox.stub(a4a, 'getLayoutBox').returns({width: 123, height: 456});
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_).to.be.ok;
        return a4a.adPromise_.then(() => {
          expect(forceCollapseSpy).to.be.calledOnce;
          expect(noContentUISpy).to.be.calledOnce;
          return a4a.layoutCallback().then(() => {
            // should have no iframe.
            expect(a4aElement.querySelector('iframe')).to.not.be.ok;
            expect(onCreativeRenderSpy).to.not.be.called;
            // call unlayout callback and verify it attempts to revert the size
            expect(a4a.originalSlotSize_).to.deep
              .equal({width: 123, height: 456});
            let attemptChangeSizeResolver;
            const attemptChangeSizePromise = new Promise(resolve => {
              attemptChangeSizeResolver = resolve;
            });
            sandbox.stub(AMP.BaseElement.prototype, 'attemptChangeSize')
              .returns(attemptChangeSizePromise);
            a4a.unlayoutCallback();
            expect(a4a.originalSlotSize_).to.be.ok;
            attemptChangeSizeResolver();
            return timerFor(a4a.win).promise(1).then(() => {
              expect(a4a.originalSlotSize_).to.not.be.ok;
            });
          });
        });
      });

      it('should process safeframe version header properly', () => {
        headers[SAFEFRAME_VERSION_HEADER] = '1-2-3';
        headers[RENDERING_TYPE_HEADER] = 'safeframe';
        delete headers[SIGNATURE_HEADER];
        xhrMock.onFirstCall().returns(Promise.resolve(mockResponse));
        return createIframePromise().then(fixture => {
          setupForAdTesting(fixture);
          const doc = fixture.doc;
          const a4aElement = createA4aElement(doc);
          const a4a = new MockA4AImpl(a4aElement);
          a4a.buildCallback();
          a4a.onLayoutMeasure();
          return a4a.adPromise_.then(() => {
            expect(xhrMock).to.be.calledOnce;
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
    });

    describe('delay request experiment', () => {
      let getAdUrlSpy;
      let a4a;
      beforeEach(() => {
        xhrMock.withArgs(TEST_URL, {
          mode: 'cors',
          method: 'GET',
          credentials: 'include',
        }).onFirstCall().returns(Promise.resolve(mockResponse));
        return createIframePromise().then(fixture => {
          setupForAdTesting(fixture);
          const doc = fixture.doc;
          const a4aElement = createA4aElement(doc);
          a4aElement.setAttribute('data-experiment-id', '117152655');
          a4a = new MockA4AImpl(a4aElement);
          expect(a4a.delayRequestEnabled_).to.be.true;
          getAdUrlSpy = sandbox.spy(a4a, 'getAdUrl');
        });
      });
      it('should not delay request when in viewport', () => {
        sandbox.stub(AmpA4A.prototype, 'getResource').returns(
          {
            renderOutsideViewport: () => true,
            whenWithinRenderOutsideViewport: () => {
              throw new Error('failure!');
            },
          });
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_);
        return a4a.adPromise_.then(() => {
          expect(getAdUrlSpy).to.be.calledOnce;
        });
      });
      it('should delay request until within renderOutsideViewport',() => {
        let whenWithinRenderOutsideViewportResolve;
        sandbox.stub(AmpA4A.prototype, 'getResource').returns(
          {
            renderOutsideViewport: () => false,
            whenWithinRenderOutsideViewport: () => new Promise(resolve => {
              whenWithinRenderOutsideViewportResolve = resolve;
            }),
          });
        a4a.onLayoutMeasure();
        expect(a4a.adPromise_);
        // Delay to all getAdUrl to potentially execute.
        return timerFor(a4a.win).promise(1).then(() => {
          expect(getAdUrlSpy).to.not.be.called;
          whenWithinRenderOutsideViewportResolve();
          return a4a.adPromise_.then(() => {
            expect(getAdUrlSpy).to.be.calledOnce;
          });
        });
      });
    });
    it('should ignore invalid safeframe version header', () => {
      headers[SAFEFRAME_VERSION_HEADER] = 'some-bad-item';
      headers[RENDERING_TYPE_HEADER] = 'safeframe';
      delete headers[SIGNATURE_HEADER];
      xhrMock.onFirstCall().returns(Promise.resolve(mockResponse));
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const doc = fixture.doc;
        const a4aElement = createA4aElement(doc);
        const a4a = new MockA4AImpl(a4aElement);
        a4a.buildCallback();
        a4a.onLayoutMeasure();
        return a4a.adPromise_.then(() => {
          expect(xhrMock).to.be.calledOnce;
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
    it('validate adsense', () => {
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const doc = fixture.doc;
        const a4aElement = createA4aElement(doc);
        const a4a = new MockA4AImpl(a4aElement);
        //a4a.config = {};
        a4a.buildCallback();
        a4a.preconnectCallback(false);
        const preconnects = doc.querySelectorAll('link[rel=preconnect]');
        expect(preconnects).to.have.lengthOf(3);
        // SafeFrame origin.
        expect(preconnects[0]).to.have.property(
            'href', 'https://tpc.googlesyndication.com/');
        // NameFrame origin (in testing mode).  Use a substring match here to
        // be agnostic about localhost server port.
        expect(preconnects[1]).to.have.property('href')
            .that.has.string('http://ads.localhost');
        // AdSense origin.
        expect(preconnects[2]).to.have.property(
            'href', 'https://googleads.g.doubleclick.net/');
      });
    });
  });

  describe('#getAmpAdMetadata_', () => {
    let a4a;
    beforeEach(() => {
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        a4a = new MockA4AImpl(createA4aElement(fixture.doc));
        return fixture;
      });
    });
    it('should parse metadata', () => {
      const actual = a4a.getAmpAdMetadata_(buildCreativeString({
        customElementExtensions: ['amp-vine', 'amp-vine', 'amp-vine'],
        customStylesheets: [
          {href: 'https://fonts.googleapis.com/css?foobar'},
          {href: 'https://fonts.com/css?helloworld'},
        ],
      }));
      const expected = {
        minifiedCreative: testFragments.minimalDocOneStyleSrcDoc,
        customElementExtensions: ['amp-vine', 'amp-vine', 'amp-vine'],
        customStylesheets: [
          {href: 'https://fonts.googleapis.com/css?foobar'},
          {href: 'https://fonts.com/css?helloworld'},
        ],
      };
      expect(actual).to.deep.equal(expected);
    });
    // TODO(levitzky) remove the following two tests after metadata bug is
    // fixed.
    it('should parse metadata with wrong opening tag', () => {
      const creative = buildCreativeString({
        customElementExtensions: ['amp-vine', 'amp-vine', 'amp-vine'],
        customStylesheets: [
          {href: 'https://fonts.googleapis.com/css?foobar'},
          {href: 'https://fonts.com/css?helloworld'},
        ],
      }).replace('<script type="application/json" amp-ad-metadata>',
          '<script type=application/json amp-ad-metadata>');
      const actual = a4a.getAmpAdMetadata_(creative);
      const expected = {
        minifiedCreative: testFragments.minimalDocOneStyleSrcDoc,
        customElementExtensions: ['amp-vine', 'amp-vine', 'amp-vine'],
        customStylesheets: [
          {href: 'https://fonts.googleapis.com/css?foobar'},
          {href: 'https://fonts.com/css?helloworld'},
        ],
      };
      expect(actual).to.deep.equal(expected);
    });
    it('should return null if metadata opening tag is (truly) wrong', () => {
      const creative = buildCreativeString({
        customElementExtensions: ['amp-vine', 'amp-vine', 'amp-vine'],
        customStylesheets: [
          {href: 'https://fonts.googleapis.com/css?foobar'},
          {href: 'https://fonts.com/css?helloworld'},
        ],
      }).replace('<script type="application/json" amp-ad-metadata>',
          '<script type=application/json" amp-ad-metadata>');
      expect(a4a.getAmpAdMetadata_(creative)).to.be.null;
    });

    it('should return null if missing ampRuntimeUtf16CharOffsets', () => {
      const baseTestDoc = testFragments.minimalDocOneStyle;
      const splicePoint = baseTestDoc.indexOf('</body>');
      expect(a4a.getAmpAdMetadata_(
        baseTestDoc.slice(0, splicePoint) +
        '<script type="application/json" amp-ad-metadata></script>' +
        baseTestDoc.slice(splicePoint))).to.be.null;
    });
    it('should return null if invalid extensions', () => {
      expect(a4a.getAmpAdMetadata_(buildCreativeString({
        customElementExtensions: 'amp-vine',
        customStylesheets: [
          {href: 'https://fonts.googleapis.com/css?foobar'},
          {href: 'https://fonts.com/css?helloworld'},
        ],
      }))).to.be.null;
    });
    it('should return null if non-array stylesheets', () => {
      expect(a4a.getAmpAdMetadata_(buildCreativeString({
        customElementExtensions: ['amp-vine', 'amp-vine', 'amp-vine'],
        customStylesheets: 'https://fonts.googleapis.com/css?foobar',
      }))).to.be.null;
    });
    it('should return null if invalid stylesheet object', () => {
      expect(a4a.getAmpAdMetadata_(buildCreativeString({
        customElementExtensions: ['amp-vine', 'amp-vine', 'amp-vine'],
        customStylesheets: [
          {href: 'https://fonts.googleapis.com/css?foobar'},
          {foo: 'https://fonts.com/css?helloworld'},
        ],
      }))).to.be.null;
    });
    // FAILURE cases here
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
    const metaData = AmpA4A.prototype.getAmpAdMetadata_(buildCreativeString());
    let a4aElement;
    let a4a;
    beforeEach(() => {
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const doc = fixture.doc;
        a4aElement = createA4aElement(doc);
        a4a = new AmpA4A(a4aElement);
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
        expect(urlReplacementsForDoc(frameDoc))
            .to.not.equal(urlReplacementsForDoc(a4aElement));
      });
    });

    it('should handle click expansion correctly', () => {
      return a4a.renderAmpCreative_(metaData).then(() => {
        const adBody = a4aElement.querySelector('iframe')
            .contentDocument.querySelector('body');
        let clickHandlerCalled = 0;

        adBody.onclick = function(e) {
          expect(e.defaultPrevented).to.be.false;
          e.preventDefault();  // Make the test not actually navigate.
          clickHandlerCalled++;
        };
        adBody.innerHTML = '<a ' +
            'href="https://f.co?CLICK_X,CLICK_Y,RANDOM">' +
            '<button id="target"><button></div>';
        const button = adBody.querySelector('#target');
        const a = adBody.querySelector('a');
        const ev1 = new Event('click', {bubbles: true});
        ev1.pageX = 10;
        ev1.pageY = 20;
        button.dispatchEvent(ev1);
        expect(a.href).to.equal('https://f.co/?10,20,RANDOM');
        expect(clickHandlerCalled).to.equal(1);

        const ev2 = new Event('click', {bubbles: true});
        ev2.pageX = 111;
        ev2.pageY = 222;
        a.dispatchEvent(ev2);
        expect(a.href).to.equal('https://f.co/?111,222,RANDOM');
        expect(clickHandlerCalled).to.equal(2);

        const ev3 = new Event('click', {bubbles: true});
        ev3.pageX = 666;
        ev3.pageY = 666;
        // Click parent of a tag.
        a.parentElement.dispatchEvent(ev3);
        // Had no effect, because actual link wasn't clicked.
        expect(a.href).to.equal('https://f.co/?111,222,RANDOM');
        expect(clickHandlerCalled).to.equal(3);
      });
    });
  });

  describe('#getPriority', () => {
    it('validate priority', () => {
      expect(AmpA4A.prototype.getPriority()).to.equal(2);
    });
  });

  describe('#unlayoutCallback', () => {
    it('verify state reset', () => {
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const doc = fixture.doc;
        const a4aElement = createA4aElement(doc);
        const a4a = new MockA4AImpl(a4aElement);
        xhrMock.withArgs(TEST_URL, {
          mode: 'cors',
          method: 'GET',
          credentials: 'include',
        }).returns(Promise.resolve(mockResponse));
        return a4a.onLayoutMeasure(() => {
          expect(a4a.adPromise_).to.not.be.null;
          expect(a4a.element.children).to.have.lengthOf(1);
        });
      });
    });

    it('attemptChangeSize reverts', () => {
      return createIframePromise().then(fixture => {
        setupForAdTesting(fixture);
        const doc = fixture.doc;
        const a4aElement = createA4aElement(doc);
        const a4a = new MockA4AImpl(a4aElement);
        xhrMock.withArgs(TEST_URL, {
          mode: 'cors',
          method: 'GET',
          credentials: 'include',
        }).returns(Promise.resolve(mockResponse));
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
        const doc = fixture.doc;
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
        // Force vsync system to run all queued tasks, so that DOM mutations
        // are actually completed before testing.
        a4a.vsync_.runScheduledTasks_();
        whenFirstVisibleResolve();
        return adPromise.then(unusedError => {
          assert.fail('cancelled ad promise should not succeed');
        }).catch(reason => {
          expect(getAdUrlSpy.called, 'getAdUrl never called')
              .to.be.false;
          expect(reason).to.deep.equal(cancellation());
          expect(errorHandlerSpy).to.be.calledOnce;
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

    describe('verifyCreativeSignature_', () => {
      let stubVerifySignature;
      let a4a;
      beforeEach(() => {
        return createIframePromise().then(fixture => {
          setupForAdTesting(fixture);
          stubVerifySignature =
              sandbox.stub(cryptoFor(fixture.win), 'verifySignature');
          const a4aElement = createA4aElement(fixture.doc);
          a4a = new MockA4AImpl(a4aElement);
        });
      });

      it('properly handles all failures', () => {
        // Single provider with first key fails but second key passes validation
        a4a.win.ampA4aValidationKeys = (() => {
          const providers = [];
          for (let i = 0; i < 10; i++) {
            const serviceName = `test-service${i}`;
            providers[i] = Promise.resolve({serviceName, keys: [
              Promise.resolve({serviceName}),
              Promise.resolve({serviceName}),
            ]});
          }
          return providers;
        })();
        stubVerifySignature.returns(Promise.resolve(false));
        return a4a.verifyCreativeSignature_('some_creative', 'some_sig')
        .then(() => {
          throw new Error('should have triggered rejection');
        })
        .catch(err => {
          expect(stubVerifySignature).to.be.callCount(20);
          expect(err).to.equal('No validation service could verify this key');
        });
      });

      it('properly handles multiple keys for one provider', () => {
        // Single provider with first key fails but second key passes validation
        const serviceName = 'test-service';
        a4a.win.ampA4aValidationKeys = [
          Promise.resolve({serviceName, keys: [
            Promise.resolve({serviceName: '1'}),
            Promise.resolve({serviceName: '2'}),
          ]}),
        ];
        const creative = 'some_creative';
        stubVerifySignature.onCall(0).returns(Promise.resolve(false));
        stubVerifySignature.onCall(1).returns(Promise.resolve(true));
        return a4a.verifyCreativeSignature_(creative, 'some_sig')
          .then(verifiedCreative => {
            expect(stubVerifySignature).to.be.calledTwice;
            expect(verifiedCreative).to.equal(creative);
          });
      });

      it('properly stops verification at first valid key', () => {
        // Single provider where first key fails, second passes, and third
        // never calls verifySignature.
        const serviceName = 'test-service';
        let keyInfoResolver;
        a4a.win.ampA4aValidationKeys = [
          Promise.resolve({serviceName, keys: [
            Promise.resolve({}),
            Promise.resolve({}),
            new Promise(resolver => {
              keyInfoResolver = resolver;
            }),
          ]}),
        ];
        const creative = 'some_creative';
        const signature = 'some_signature';
        stubVerifySignature.onCall(0).returns(Promise.resolve(false));
        stubVerifySignature.onCall(1).returns(Promise.resolve(true));

        // From testing have found that need to yield prior to calling last
        // key info resolver to ensure previous keys have had a chance to
        // execute.
        setTimeout(() => {keyInfoResolver({}); }, 0);

        return a4a.verifyCreativeSignature_(creative, signature)
          .then(verifiedCreative => {
            expect(stubVerifySignature).to.be.calledTwice;
            expect(verifiedCreative).to.equal(creative);
          });
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
        const doc = fixture.doc;
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
      sandbox.stub(Math, 'random', () => 0.005);
      window.AMP_MODE = {development: false};
      a4a.promiseErrorHandler_(error);
      expect(devExpectedErrorStub).to.be.calledOnce;
      expect(devExpectedErrorStub.args[0][1]).to.be.equal(error);
      expect(error.message).to.equal('amp-a4a: adsense: intentional');
      expect(error.args).to.deep.equal({au: 'query'});
    });

    it('should NOT send an expected error in prod mode with sampling', () => {
      const error = new Error('intentional');
      sandbox.stub(Math, 'random', () => 0.011);
      window.AMP_MODE = {development: false};
      a4a.promiseErrorHandler_(error);
      expect(devExpectedErrorStub).to.not.be.called;
    });
  });

  describe('#getKeyInfoSets_', () => {
    let fixture;
    let win;
    let a4aElement;
    beforeEach(() => {
      return createIframePromise().then(f => {
        setupForAdTesting(f);
        fixture = f;
        win = fixture.win;
        a4aElement = createA4aElement(fixture.doc);
        toggleExperiment(
          win, 'a4a-disable-cryptokey-viewer-check', false, true);
        return fixture;
      });
    });

    function verifyIsKeyInfo(keyInfo) {
      expect(keyInfo).to.be.ok;
      expect(keyInfo).to.have.all.keys(
          ['serviceName', 'hash', 'cryptoKey']);
      expect(keyInfo.serviceName).to.be.a('string').and.not.to.equal('');
      expect(keyInfo.hash).to.be.instanceOf(Uint8Array);
    }

    it('should fetch a single key', () => {
      expect(win.ampA4aValidationKeys).not.to.exist;
      // Key fetch happens on A4A class construction.
      const a4a = new MockA4AImpl(a4aElement);  // eslint-disable-line no-unused-vars
      a4a.buildCallback();
      const result = win.ampA4aValidationKeys;
      expect(result).to.be.instanceof(Array);
      expect(result).to.have.lengthOf(1);
      return Promise.all(result).then(serviceInfos => {
        expect(xhrMockJson).to.be.calledOnce;
        expect(xhrMockJson).to.be.calledWith(
            'https://cdn.ampproject.org/amp-ad-verifying-keyset.json', {
              mode: 'cors',
              method: 'GET',
              ampCors: false,
              credentials: 'omit',
            });
        const serviceInfo = serviceInfos[0];
        expect(serviceInfo).to.have.all.keys(['serviceName', 'keys']);
        expect(serviceInfo['serviceName']).to.equal('google');
        expect(serviceInfo['keys']).to.be.an.instanceof(Array);
        expect(serviceInfo['keys']).to.have.lengthOf(1);
        const keyInfoPromise = serviceInfo['keys'][0];
        expect(keyInfoPromise).to.be.an.instanceof(Promise);
        return keyInfoPromise.then(keyInfo => {
          verifyIsKeyInfo(keyInfo);
        });
      });
    });

    it('should wait for first visible', () => {
      let firstVisibleResolve;
      viewerWhenVisibleMock.returns(
        new Promise(resolve => {
          firstVisibleResolve = resolve;
        }));
      expect(win.ampA4aValidationKeys).not.to.exist;
      // Key fetch happens on A4A class construction.
      const a4a = new MockA4AImpl(a4aElement);  // eslint-disable-line no-unused-vars
      a4a.buildCallback();
      const result = win.ampA4aValidationKeys;
      expect(xhrMockJson).to.not.be.called;
      firstVisibleResolve();
      return Promise.all(result).then(() => {
        expect(xhrMockJson).to.be.calledOnce;
      });
    });

    it('should not wait for first visible if exp disabled', () => {
      toggleExperiment(win, 'a4a-disable-cryptokey-viewer-check', true, true);
      expect(isExperimentOn(win, 'a4a-disable-cryptokey-viewer-check'))
        .to.be.true;
      expect(win.ampA4aValidationKeys).not.to.exist;
      // Key fetch happens on A4A class construction.
      const a4a = new MockA4AImpl(a4aElement);  // eslint-disable-line no-unused-vars
      a4a.buildCallback();
      const result = win.ampA4aValidationKeys;
      expect(result).to.be.instanceof(Array);
      expect(result).to.have.lengthOf(1);  // Only one service.
      return Promise.all(result).then(() => {
        expect(viewerWhenVisibleMock).to.not.be.called;
        expect(xhrMockJson).to.be.calledOnce;
      });
    });

    it('should fetch multiple keys', () => {
      // For our purposes, re-using the same key is fine.
      const testKey = JSON.parse(validCSSAmp.publicKey);
      xhrMockJson.withArgs(
          'https://cdn.ampproject.org/amp-ad-verifying-keyset.json', {
            mode: 'cors',
            method: 'GET',
            ampCors: false,
            credentials: 'omit',
          }).returns(Promise.resolve({
            json() {
              return Promise.resolve({keys: [testKey, testKey, testKey]});
            },
          }));
      expect(win.ampA4aValidationKeys).not.to.exist;
      // Key fetch happens on A4A class construction.
      const a4a = new MockA4AImpl(a4aElement);  // eslint-disable-line no-unused-vars
      a4a.buildCallback();
      const result = win.ampA4aValidationKeys;
      expect(result).to.be.instanceof(Array);
      expect(result).to.have.lengthOf(1);  // Only one service.
      return Promise.all(result).then(serviceInfos => {
        expect(xhrMockJson).to.be.calledOnce;
        expect(xhrMockJson).to.be.calledWith(
          'https://cdn.ampproject.org/amp-ad-verifying-keyset.json', {
            mode: 'cors',
            method: 'GET',
            ampCors: false,
            credentials: 'omit',
          });
        expect(serviceInfos).to.have.lengthOf(1);  // Only one service.
        const serviceInfo = serviceInfos[0];
        expect(serviceInfo).to.have.all.keys(['serviceName', 'keys']);
        expect(serviceInfo['serviceName']).to.equal('google');
        expect(serviceInfo['keys']).to.be.an.instanceof(Array);
        expect(serviceInfo['keys']).to.have.lengthOf(3);
        return Promise.all(serviceInfo['keys'].map(keyInfoPromise =>
          keyInfoPromise.then(keyInfo => verifyIsKeyInfo(keyInfo))));
      });
    });

    it('should fetch from multiple services', () => {
      getSigningServiceNamesMock.returns(['google', 'google-dev']);
      // For our purposes, we don't care what the key is, so long as it's valid.
      xhrMockJson.withArgs(
          'https://cdn.ampproject.org/amp-ad-verifying-keyset-dev.json', {
            mode: 'cors',
            method: 'GET',
            ampCors: false,
            credentials: 'omit',
          }).returns(Promise.resolve({
            json() {
              return Promise.resolve({keys: [
                JSON.parse(validCSSAmp.publicKey),
              ]});
            },
          }));
      expect(win.ampA4aValidationKeys).not.to.exist;
      // Key fetch happens on A4A class construction.
      const a4a = new MockA4AImpl(a4aElement);  // eslint-disable-line no-unused-vars
      a4a.buildCallback();
      const result = win.ampA4aValidationKeys;
      expect(result).to.be.instanceof(Array);
      expect(result).to.have.lengthOf(2);  // Two services.
      return Promise.all(result).then(serviceInfos => {
        expect(xhrMockJson).to.be.calledTwice;
        serviceInfos.map(serviceInfo => {
          expect(serviceInfo).to.have.all.keys(['serviceName', 'keys']);
          expect(serviceInfo['serviceName']).to.have.string('google');
          expect(serviceInfo['keys']).to.be.an.instanceof(Array);
          expect(serviceInfo['keys']).to.have.lengthOf(1);
          const keyInfoPromise = serviceInfo['keys'][0];
          expect(keyInfoPromise).to.be.an.instanceof(Promise);
          return keyInfoPromise.then(keyInfo => {
            verifyIsKeyInfo(keyInfo);
          });
        });
      });
    });

    it('Should gracefully handle malformed key responses', () => {
      xhrMockJson.withArgs(
          'https://cdn.ampproject.org/amp-ad-verifying-keyset.json', {
            mode: 'cors',
            method: 'GET',
            ampCors: false,
            credentials: 'omit',
          }).returns(Promise.resolve({
            json() {
              return Promise.resolve({keys: ['invalid key data']});
            },
          }));
      expect(win.ampA4aValidationKeys).not.to.exist;
      // Key fetch happens on A4A class construction.
      const a4a = new MockA4AImpl(a4aElement);  // eslint-disable-line no-unused-vars
      a4a.buildCallback();
      const result = win.ampA4aValidationKeys;
      expect(result).to.be.instanceof(Array);
      expect(result).to.have.lengthOf(1);  // Only one service.
      return Promise.all(result).then(serviceInfos => {
        expect(xhrMockJson).to.be.calledOnce;
        expect(xhrMockJson).to.be.calledWith(
            'https://cdn.ampproject.org/amp-ad-verifying-keyset.json', {
              mode: 'cors',
              method: 'GET',
              ampCors: false,
              credentials: 'omit',
            });
        expect(serviceInfos[0]).to.have.all.keys(['serviceName', 'keys']);
        expect(serviceInfos[0]['serviceName']).to.equal('google');
        expect(serviceInfos[0]['keys']).to.be.an.instanceof(Array);
        expect(serviceInfos[0]['keys']).to.be.empty;
      });
    });

    it('should gracefully handle network errors in a single service', () => {
      xhrMockJson.withArgs(
          'https://cdn.ampproject.org/amp-ad-verifying-keyset.json', {
            mode: 'cors',
            method: 'GET',
            ampCors: false,
            credentials: 'omit',
          }).returns(Promise.reject(
              new TypeError('some random network error')));
      expect(win.ampA4aValidationKeys).not.to.exist;
      // Key fetch happens on A4A class construction.
      const a4a = new MockA4AImpl(a4aElement);  // eslint-disable-line no-unused-vars
      a4a.buildCallback();
      const result = win.ampA4aValidationKeys;
      expect(result).to.be.instanceof(Array);
      expect(result).to.have.lengthOf(1);  // Only one service.
      return result[0].then(serviceInfo => {
        expect(serviceInfo).to.have.all.keys(['serviceName', 'keys']);
        expect(serviceInfo['serviceName']).to.equal('google');
        expect(serviceInfo['keys']).to.be.an.instanceof(Array);
        expect(serviceInfo['keys']).to.be.empty;
      });
    });

    it('should handle success in one service and net error in another', () => {
      getSigningServiceNamesMock.returns(['google', 'google-dev']);
      xhrMockJson.withArgs(
          'https://cdn.ampproject.org/amp-ad-verifying-keyset-dev.json', {
            mode: 'cors',
            method: 'GET',
            ampCors: false,
            credentials: 'omit',
          }).returns(Promise.reject(
              new TypeError('some random network error')));
      expect(win.ampA4aValidationKeys).not.to.exist;
      // Key fetch happens on A4A class construction.
      const a4a = new MockA4AImpl(a4aElement);  // eslint-disable-line no-unused-vars
      a4a.buildCallback();
      const result = win.ampA4aValidationKeys;
      expect(result).to.be.instanceof(Array);
      expect(result).to.have.lengthOf(2);  // Two services.
      return Promise.all(result.map(  // For each service...
          serviceInfoPromise => serviceInfoPromise.then(serviceInfo => {
            expect(serviceInfo).to.have.all.keys(['serviceName', 'keys']);
            const serviceName = serviceInfo.serviceName;
            expect(serviceInfo['keys']).to.be.an.instanceof(Array);
            if (serviceName == 'google') {
              expect(serviceInfo['keys']).to.have.lengthOf(1);
              const keyInfoPromise = serviceInfo['keys'][0];
              expect(keyInfoPromise).to.be.an.instanceof(Promise);
              return keyInfoPromise.then(keyInfo => {
                verifyIsKeyInfo(keyInfo);
              });
            } else if (serviceName == 'google-dev') {
              expect(serviceInfo['keys']).to.be.empty;
            } else {
              throw new Error(
                  `Unexpected service name: ${serviceName} is neither ` +
                  'google nor google-dev');
            }
          }))).then(() => {
            expect(xhrMockJson).to.be.calledTwice;
          });
    });

    it('should return valid object on invalid service name', () => {
      getSigningServiceNamesMock.returns(['fnord']);
      expect(win.ampA4aValidationKeys).not.to.exist;
      // Key fetch happens on A4A class construction.
      const a4a = new MockA4AImpl(a4aElement);  // eslint-disable-line no-unused-vars
      a4a.buildCallback();
      const result = win.ampA4aValidationKeys;
      expect(xhrMockJson).not.to.be.called;
      expect(result).to.be.instanceof(Array);
      expect(result).to.have.lengthOf(1);
      expect(result[0]).to.be.instanceof(Promise);
      return result[0].then(serviceInfo => {
        expect(serviceInfo).to.have.all.keys(['serviceName', 'keys']);
        expect(serviceInfo['serviceName']).to.equal('fnord');
        expect(serviceInfo['keys']).to.be.an.instanceof(Array);
        expect(serviceInfo['keys']).to.be.empty;
      });
    });
  });

  describe.only('#assignAdUrlToError', () => {

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
