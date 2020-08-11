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

import '../../../../extensions/amp-ad/0.1/amp-ad-ui';
import '../../../../extensions/amp-ad/0.1/amp-ad-xorigin-iframe-handler';
import * as IniLoad from '../../../../src/ini-load';
import {CONSENT_POLICY_STATE} from '../../../../src/consent-state';
import {
  EXPERIMENT_ATTRIBUTE,
  TRUNCATION_PARAM,
  ValidAdContainerTypes,
  addCsiSignalsToAmpAnalyticsConfig,
  additionalDimensions,
  extractAmpAnalyticsConfig,
  extractHost,
  getAmpRuntimeTypeParameter,
  getCorrelator,
  getCsiAmpAnalyticsVariables,
  getEnclosingContainerTypes,
  getIdentityToken,
  getIdentityTokenRequestUrl,
  googleAdUrl,
  groupAmpAdsByType,
  maybeAppendErrorParameter,
  mergeExperimentIds,
} from '../utils';
import {MockA4AImpl} from '../../../../extensions/amp-a4a/0.1/test/utils';
import {Services} from '../../../../src/services';
import {buildUrl} from '../shared/url-builder';
import {createElementWithAttributes} from '../../../../src/dom';
import {createIframePromise} from '../../../../testing/iframe';
import {installDocService} from '../../../../src/service/ampdoc-impl';
import {installExtensionsService} from '../../../../src/service/extensions-impl';
import {installXhrService} from '../../../../src/service/xhr-impl';
import {toggleExperiment} from '../../../../src/experiments';

function setupForAdTesting(fixture) {
  installDocService(fixture.win, /* isSingleDoc */ true);
  installExtensionsService(fixture.win);
  const {doc} = fixture;
  // TODO(a4a-cam@): This is necessary in the short term, until A4A is
  // smarter about host document styling.  The issue is that it needs to
  // inherit the AMP runtime style element in order for shadow DOM-enclosed
  // elements to behave properly.  So we have to set up a minimal one here.
  const ampStyle = doc.createElement('style');
  ampStyle.setAttribute('amp-runtime', 'scratch-fortesting');
  doc.head.appendChild(ampStyle);
}

// Because of the way the element is constructed, it doesn't have all of the
// machinery that AMP expects it to have, so just no-op the irrelevant
// functions.
function noopMethods(
  impl,
  ampdoc,
  sandbox,
  pageLayoutBox = {
    top: 11.1,
    left: 12.1,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
  }
) {
  const noop = () => {};
  impl.element.build = noop;
  impl.element.getPlaceholder = noop;
  impl.element.createPlaceholder = noop;
  sandbox.stub(impl, 'getAmpDoc').returns(ampdoc);
  sandbox.stub(impl, 'getPageLayoutBox').returns(pageLayoutBox);
}

describe('Google A4A utils', () => {
  //TODO: Add tests for other utils functions.

  describe('#additionalDimensions', () => {
    it('should return the right value when fed mocked inputs', () => {
      const fakeWin = {
        screenX: 1,
        screenY: 2,
        screenLeft: 3,
        screenTop: 4,
        outerWidth: 5,
        outerHeight: 6,
        screen: {
          availWidth: 11,
          availTop: 12,
        },
      };
      const fakeSize = {
        width: '100px',
        height: '101px',
      };
      return expect(additionalDimensions(fakeWin, fakeSize)).to.equal(
        '3,4,1,2,11,12,5,6,100px,101px'
      );
    });
  });

  describe('#ActiveView AmpAnalytics integration', () => {
    const builtConfig = {
      transport: {beacon: false, xhrpost: false},
      requests: {
        visibility1: 'https://foo.com?hello=world',
        visibility2: 'https://bar.com?a=b',
      },
      triggers: {
        continuousVisible: {
          on: 'visible',
          request: ['visibility1', 'visibility2'],
          visibilitySpec: {
            selector: 'amp-ad',
            selectionMethod: 'closest',
            visiblePercentageMin: 50,
            continuousTimeMin: 1000,
          },
        },
      },
    };

    const btrConfig = {
      transport: {beacon: false, xhrpost: false},
      requests: {
        visibility1: 'https://foo.com?hello=world',
        visibility2: 'https://bar.com?a=b',
        btr1: 'https://example.test?id=1',
        btr2: 'https://example.test?id=2',
      },
      triggers: {
        continuousVisible: {
          on: 'visible',
          request: ['visibility1', 'visibility2'],
          visibilitySpec: {
            selector: 'amp-ad',
            selectionMethod: 'closest',
            visiblePercentageMin: 50,
            continuousTimeMin: 1000,
          },
        },
        beginToRender: {
          on: 'ini-load',
          request: ['btr1', 'btr2'],
          selector: 'amp-ad',
          selectionMethod: 'closest',
        },
      },
    };

    it('should extract correct config from header', () => {
      return createIframePromise().then((fixture) => {
        setupForAdTesting(fixture);
        let url;
        let btrUrl;
        const headers = {
          get(name) {
            if (name == 'X-AmpAnalytics') {
              return JSON.stringify({url, btrUrl});
            }
            if (name == 'X-QQID') {
              return 'qqid_string';
            }
          },
          has(name) {
            if (name == 'X-AmpAnalytics') {
              return true;
            }
            if (name == 'X-QQID') {
              return true;
            }
          },
        };
        const element = createElementWithAttributes(fixture.doc, 'amp-a4a', {
          'width': '200',
          'height': '50',
          'type': 'adsense',
          'data-experiment-id': '00000001,0000002',
        });
        const a4a = new MockA4AImpl(element);
        url = 'not an array';
        allowConsoleError(
          () => expect(extractAmpAnalyticsConfig(a4a, headers)).to.not.be.ok
        );
        allowConsoleError(
          () => expect(extractAmpAnalyticsConfig(a4a, headers)).to.be.null
        );
        url = [];
        expect(extractAmpAnalyticsConfig(a4a, headers)).to.not.be.ok;
        expect(extractAmpAnalyticsConfig(a4a, headers)).to.be.null;

        url = ['https://foo.com?hello=world', 'https://bar.com?a=b'];
        let config = extractAmpAnalyticsConfig(a4a, headers);
        expect(config).to.deep.equal(builtConfig);

        btrUrl = [];
        config = extractAmpAnalyticsConfig(a4a, headers);
        expect(config).to.deep.equal(builtConfig);

        btrUrl = ['https://example.test?id=1', 'https://example.test?id=2'];
        config = extractAmpAnalyticsConfig(a4a, headers);
        expect(config).to.deep.equal(btrConfig);

        headers.has = function (name) {
          expect(name).to.equal('X-AmpAnalytics');
          return false;
        };
        expect(extractAmpAnalyticsConfig(a4a, headers)).to.not.be.ok;
      });
    });

    it('should add the correct CSI signals', () => {
      window.sandbox
        .stub(Services, 'documentInfoForDoc')
        .returns({pageViewId: 777});
      const mockElement = {
        getAttribute: function (name) {
          switch (name) {
            case EXPERIMENT_ATTRIBUTE:
              return '00000001,00000002';
            case 'type':
              return 'fake-type';
            case 'data-amp-slot-index':
              return '0';
          }
          return null;
        },
      };
      const qqid = 'qqid_string';
      let newConfig = addCsiSignalsToAmpAnalyticsConfig(
        window,
        mockElement,
        builtConfig,
        qqid,
        /* isVerifiedAmpCreative */ true
      );

      expect(newConfig.requests.iniLoadCsi).to.not.be.null;
      expect(newConfig.requests.renderStartCsi).to.not.be.null;
      expect(newConfig.triggers.continuousVisibleIniLoad.request).to.equal(
        'iniLoadCsi'
      );
      expect(newConfig.triggers.continuousVisibleRenderStart.request).to.equal(
        'renderStartCsi'
      );
      const getRegExps = (metricName) => [
        /^https:\/\/csi\.gstatic\.com\/csi\?/,
        /(\?|&)s=a4a(&|$)/,
        /(\?|&)c=[0-9]+(&|$)/,
        /(\?|&)slotId=0(&|$)/,
        /(\?|&)qqid\.0=[a-zA-Z_]+(&|$)/,
        new RegExp(`(\\?|&)met\\.a4a\\.0=${metricName}\\.-?[0-9]+(&|$)`),
        /(\?|&)dt=-?[0-9]+(&|$)/,
        /(\?|&)e\.0=00000001%2C00000002(&|$)/,
        /(\?|&)rls=\$internalRuntimeVersion\$(&|$)/,
        /(\?|&)adt.0=fake-type(&|$)/,
      ];
      getRegExps('visibilityCsi').forEach((regExp) => {
        expect(newConfig.requests.visibilityCsi).to.match(regExp);
      });
      getRegExps('iniLoadCsiFriendly').forEach((regExp) => {
        expect(newConfig.requests.iniLoadCsi).to.match(regExp);
      });
      getRegExps('renderStartCsiFriendly').forEach((regExp) => {
        expect(newConfig.requests.renderStartCsi).to.match(regExp);
      });
      newConfig = addCsiSignalsToAmpAnalyticsConfig(
        window,
        mockElement,
        builtConfig,
        qqid,
        /* isVerifiedAmpCreative */ false,
        /* lifecycle time events; not relevant here */ -1,
        -1
      );
      getRegExps('iniLoadCsiCrossDomain').forEach((regExp) => {
        expect(newConfig.requests.iniLoadCsi).to.match(regExp);
      });
      getRegExps('renderStartCsiCrossDomain').forEach((regExp) => {
        expect(newConfig.requests.renderStartCsi).to.match(regExp);
      });
    });
  });

  describe('#getAmpRuntimeTypeParameter', () => {
    it('should specify that this is experimental', () => {
      expect(
        getAmpRuntimeTypeParameter({
          AMP_CONFIG: {type: 'experimental'},
          location: {origin: 'https://www-example-com.cdn.ampproject.org'},
        })
      ).to.equal('2');
    });
    it('should specify that this is control', () => {
      expect(
        getAmpRuntimeTypeParameter({
          AMP_CONFIG: {type: 'control'},
          location: {origin: 'https://www-example-com.cdn.ampproject.org'},
        })
      ).to.equal('1');
    });
    it('should specify that this is experimentA', () => {
      expect(
        getAmpRuntimeTypeParameter({
          AMP_CONFIG: {type: 'experimentA'},
          location: {origin: 'https://www-example-com.cdn.ampproject.org'},
        })
      ).to.equal('10');
    });
    it('should not have `art` parameter when AMP_CONFIG is undefined', () => {
      expect(
        getAmpRuntimeTypeParameter({
          location: {origin: 'https://www-example-com.cdn.ampproject.org'},
        })
      ).to.be.null;
    });
    it('should not have `art` parameter when binary type is production', () => {
      expect(
        getAmpRuntimeTypeParameter({
          AMP_CONFIG: {type: 'production'},
          location: {origin: 'https://www-example-com.cdn.ampproject.org'},
        })
      ).to.be.null;
    });
    it('should not have `art` parameter when canonical', () => {
      expect(
        getAmpRuntimeTypeParameter({
          AMP_CONFIG: {type: 'experimental'},
          location: {origin: 'https://www.example.test'},
        })
      ).to.be.null;
    });
  });

  describe('#googleAdUrl', () => {
    it('should set ad position', function () {
      // When ran locally, this test tends to exceed 2000ms timeout.
      this.timeout(5000);
      return createIframePromise().then((fixture) => {
        setupForAdTesting(fixture);
        const {doc} = fixture;
        doc.win = window;
        const elem = createElementWithAttributes(doc, 'amp-a4a', {
          'type': 'adsense',
          'width': '320',
          'height': '50',
        });
        const impl = new MockA4AImpl(elem);
        noopMethods(impl, fixture.ampdoc, window.sandbox);
        return fixture.addElement(elem).then(() => {
          return googleAdUrl(impl, '', 0, [], false, []).then((url1) => {
            expect(url1).to.match(/ady=11.1/);
            expect(url1).to.match(/adx=12.1/);
            return googleAdUrl(impl, '', 0, [], true, []).then((url1) => {
              expect(url1).to.match(/ady=11/);
              expect(url1).to.match(/adx=12/);
            });
          });
        });
      });
    });

    it('should include scroll position', function () {
      return createIframePromise().then((fixture) => {
        setupForAdTesting(fixture);
        const {doc} = fixture;
        doc.win = window;
        const elem = createElementWithAttributes(doc, 'amp-a4a', {
          'type': 'adsense',
          'width': '320',
          'height': '50',
        });
        const impl = new MockA4AImpl(elem);
        noopMethods(impl, fixture.ampdoc, window.sandbox);
        const getRect = () => {
          return {'width': 100, 'height': 200};
        };
        const getSize = () => {
          return {'width': 100, 'height': 200};
        };
        const getScrollLeft = () => 12.1;
        const getScrollTop = () => 34.2;
        const viewportStub = window.sandbox.stub(Services, 'viewportForDoc');
        viewportStub.returns({getRect, getSize, getScrollTop, getScrollLeft});
        return fixture.addElement(elem).then(() => {
          return googleAdUrl(impl, '', 0, {}, false, []).then((url1) => {
            expect(url1).to.match(/scr_x=12.1&scr_y=34.2/);
          });
          return googleAdUrl(impl, '', 0, {}, true, []).then((url1) => {
            expect(url1).to.match(/scr_x=12&scr_y=34/);
          });
        });
      });
    });

    it('should include all experiment ids', function () {
      // When ran locally, this test tends to exceed 2000ms timeout.
      this.timeout(5000);
      return createIframePromise().then((fixture) => {
        setupForAdTesting(fixture);
        const {doc} = fixture;
        doc.win = window;
        const elem = createElementWithAttributes(doc, 'amp-a4a', {
          'type': 'adsense',
          'width': '320',
          'height': '50',
          'data-experiment-id': '123,456',
        });
        const impl = new MockA4AImpl(elem);
        noopMethods(impl, fixture.ampdoc, window.sandbox);
        return fixture.addElement(elem).then(() => {
          return googleAdUrl(impl, '', 0, {}, false, ['789', '098']).then(
            (url1) => {
              expect(url1).to.match(/eid=123%2C456%2C789%2C098/);
            }
          );
        });
      });
    });

    it('should include debug_experiment_id if local mode w/ deid hash', () => {
      return createIframePromise().then((fixture) => {
        setupForAdTesting(fixture);
        const {doc} = fixture;
        doc.win = fixture.win;
        const elem = createElementWithAttributes(doc, 'amp-a4a', {
          'type': 'adsense',
          'width': '320',
          'height': '50',
        });
        const impl = new MockA4AImpl(elem);
        noopMethods(impl, fixture.ampdoc, window.sandbox);
        impl.win.AMP_CONFIG = {type: 'production'};
        impl.win.location.hash = 'foo,deid=123456,654321,bar';
        return fixture.addElement(elem).then(() => {
          return googleAdUrl(impl, '', 0, [], false, []).then((url1) => {
            expect(url1).to.match(/[&?]debug_experiment_id=123456%2C654321/);
          });
        });
      });
    });

    it('should include GA cid/hid', () => {
      return createIframePromise().then((fixture) => {
        setupForAdTesting(fixture);
        const {doc} = fixture;
        doc.win = fixture.win;
        const elem = createElementWithAttributes(doc, 'amp-a4a', {
          'type': 'adsense',
          'width': '320',
          'height': '50',
        });
        const impl = new MockA4AImpl(elem);
        noopMethods(impl, fixture.ampdoc, window.sandbox);
        impl.win.gaGlobal = {cid: 'foo', hid: 'bar'};
        return fixture.addElement(elem).then(() => {
          return googleAdUrl(impl, '', 0, [], false, []).then((url) => {
            expect(url).to.match(/[&?]ga_cid=foo[&$]/);
            expect(url).to.match(/[&?]ga_hid=bar[&$]/);
          });
        });
      });
    });

    it('should have correct bc value when everything supported', () => {
      return createIframePromise().then((fixture) => {
        setupForAdTesting(fixture);
        const {doc} = fixture;
        doc.win = fixture.win;
        const elem = createElementWithAttributes(doc, 'amp-a4a', {
          'type': 'adsense',
          'width': '320',
          'height': '50',
        });
        const impl = new MockA4AImpl(elem);
        noopMethods(impl, fixture.ampdoc, window.sandbox);
        const createElementStub = window.sandbox.stub(
          impl.win.document,
          'createElement'
        );
        createElementStub.withArgs('iframe').returns({
          sandbox: {
            supports: () => true,
          },
        });
        return fixture.addElement(elem).then(() => {
          return expect(
            googleAdUrl(impl, '', 0, {}, false, [])
          ).to.eventually.match(/[&?]bc=7[&$]/);
        });
      });
    });

    it('should have correct bc value when sandbox not supported', () => {
      return createIframePromise().then((fixture) => {
        setupForAdTesting(fixture);
        const {doc} = fixture;
        doc.win = fixture.win;
        const elem = createElementWithAttributes(doc, 'amp-a4a', {
          'type': 'adsense',
          'width': '320',
          'height': '50',
        });
        const impl = new MockA4AImpl(elem);
        noopMethods(impl, fixture.ampdoc, window.sandbox);
        const createElementStub = window.sandbox.stub(
          impl.win.document,
          'createElement'
        );
        createElementStub.withArgs('iframe').returns({
          sandbox: {},
        });
        return fixture.addElement(elem).then(() => {
          return expect(
            googleAdUrl(impl, '', 0, {}, false, [])
          ).to.eventually.match(/[&?]bc=1[&$]/);
        });
      });
    });

    it('should not include bc when nothing supported', () => {
      return createIframePromise().then((fixture) => {
        setupForAdTesting(fixture);
        const {doc} = fixture;
        doc.win = fixture.win;
        const elem = createElementWithAttributes(doc, 'amp-a4a', {
          'type': 'adsense',
          'width': '320',
          'height': '50',
        });
        const impl = new MockA4AImpl(elem);
        noopMethods(impl, fixture.ampdoc, window.sandbox);
        impl.win.SVGElement = undefined;
        const createElementStub = window.sandbox.stub(
          impl.win.document,
          'createElement'
        );
        createElementStub.withArgs('iframe').returns({
          sandbox: {
            supports: () => false,
          },
        });
        return fixture.addElement(elem).then(() => {
          return expect(
            googleAdUrl(impl, '', 0, {}, false, [])
          ).to.eventually.not.match(/[&?]bc=1[&$]/);
        });
      });
    });

    it('should handle referrer url promise timeout', () => {
      return createIframePromise().then((fixture) => {
        setupForAdTesting(fixture);
        const {doc} = fixture;
        doc.win = fixture.win;
        const elem = createElementWithAttributes(doc, 'amp-a4a', {
          'type': 'adsense',
          'width': '320',
          'height': '50',
        });
        const impl = new MockA4AImpl(elem);
        noopMethods(impl, fixture.ampdoc, window.sandbox);
        window.sandbox
          .stub(Services.viewerForDoc(impl.getAmpDoc()), 'getReferrerUrl')
          .returns(new Promise(() => {}));
        const createElementStub = window.sandbox.stub(
          impl.win.document,
          'createElement'
        );
        createElementStub.withArgs('iframe').returns({
          sandbox: {
            supports: () => false,
          },
        });
        expectAsyncConsoleError(/Referrer timeout/, 1);
        return fixture.addElement(elem).then(() => {
          return expect(
            googleAdUrl(impl, '', 0, {}, false, [])
          ).to.eventually.not.match(/[&?]ref=[&$]/);
        });
      });
    });

    it('should include domLoading time', () => {
      return createIframePromise().then((fixture) => {
        setupForAdTesting(fixture);
        const {doc} = fixture;
        doc.win = fixture.win;
        const elem = createElementWithAttributes(doc, 'amp-a4a', {});
        const impl = new MockA4AImpl(elem);
        noopMethods(impl, fixture.ampdoc, window.sandbox);
        return fixture.addElement(elem).then(() => {
          return googleAdUrl(impl, '', Date.now(), [], false, []).then(
            (url) => {
              expect(url).to.match(/[&?]bdt=[1-9][0-9]*[&$]/);
            }
          );
        });
      });
    });
  });

  describe('#mergeExperimentIds', () => {
    it('should merge a single id to itself', () => {
      expect(mergeExperimentIds(['12345'])).to.equal('12345');
    });
    it('should merge a single ID to a list', () => {
      expect(mergeExperimentIds(['12345'], '3,4,5,6')).to.equal(
        '3,4,5,6,12345'
      );
    });
    it('should merge multiple IDs into a list', () => {
      expect(mergeExperimentIds(['12345', '6789'], '3,4,5,6')).to.equal(
        '3,4,5,6,12345,6789'
      );
    });
    it('should discard invalid ID', () => {
      expect(mergeExperimentIds(['frob'], '3,4,5,6')).to.equal('3,4,5,6');
    });
    it('should return empty string for invalid input', () => {
      expect(mergeExperimentIds(['frob'])).to.equal('');
    });
  });

  describe('#maybeAppendErrorParameter', () => {
    const url = 'https://foo.com/bar?hello=world&one=true';
    it('should append parameter', () => {
      expect(maybeAppendErrorParameter(url, 'n')).to.equal(url + '&aet=n');
    });
    it('should not append parameter if already present', () => {
      expect(maybeAppendErrorParameter(url + '&aet=already', 'n')).to.not.be.ok;
    });
    it('should not append parameter if truncated', () => {
      const truncUrl = buildUrl(
        'https://foo.com/bar',
        {hello: 'world'},
        15,
        TRUNCATION_PARAM
      );
      expect(truncUrl.indexOf(TRUNCATION_PARAM.name)).to.not.equal(-1);
      expect(maybeAppendErrorParameter(truncUrl, 'n')).to.not.be.ok;
    });
  });

  describes.realWin('#getEnclosingContainerTypes', {}, (env) => {
    it('should return empty if no containers', () => {
      expect(
        getEnclosingContainerTypes(env.win.document.createElement('amp-ad'))
          .length
      ).to.equal(0);
    });

    Object.keys(ValidAdContainerTypes).forEach((container) => {
      it(`should return container: ${container}`, () => {
        const containerElem = env.win.document.createElement(container);
        env.win.document.body.appendChild(containerElem);
        const ampAdElem = env.win.document.createElement('amp-ad');
        containerElem.appendChild(ampAdElem);
        expect(getEnclosingContainerTypes(ampAdElem)).to.deep.equal([
          ValidAdContainerTypes[container],
        ]);
      });
    });

    it('should include ALL containers', () => {
      let prevContainer;
      Object.keys(ValidAdContainerTypes).forEach((container) => {
        const containerElem = env.win.document.createElement(container);
        (prevContainer || env.win.document.body).appendChild(containerElem);
        prevContainer = containerElem;
      });
      const ampAdElem = env.win.document.createElement('amp-ad');
      prevContainer.appendChild(ampAdElem);
      const ValidAdContainerTypeValues = Object.keys(ValidAdContainerTypes).map(
        function (key) {
          return ValidAdContainerTypes[key];
        }
      );
      expect(getEnclosingContainerTypes(ampAdElem).sort()).to.deep.equal(
        ValidAdContainerTypeValues.sort()
      );
    });
  });

  describes.fakeWin('#getIdentityTokenRequestUrl', {}, (env) => {
    let doc;
    let fakeWin;
    beforeEach(() => {
      const documentInfoStub = env.sandbox.stub(Services, 'documentInfoForDoc');
      doc = {};
      fakeWin = {location: {}};
      documentInfoStub
        .withArgs(doc)
        .returns({canonicalUrl: 'http://f.blah.com?some_site'});
    });

    it('should use google.com if at top', () => {
      fakeWin.top = fakeWin;
      fakeWin.location.ancestorOrigins = ['foo.google.com.eu'];
      expect(getIdentityTokenRequestUrl(fakeWin, doc)).to.equal(
        'https://adservice.google.com/adsid/integrator.json?' +
          'domain=f.blah.com'
      );
    });

    it('should use google.com if no ancestorOrigins', () => {
      expect(getIdentityTokenRequestUrl(fakeWin, doc)).to.equal(
        'https://adservice.google.com/adsid/integrator.json?' +
          'domain=f.blah.com'
      );
    });

    it('should use google.com if non-google top', () => {
      fakeWin.location.ancestorOrigins = ['foo.google2.com'];
      expect(getIdentityTokenRequestUrl(fakeWin, doc)).to.equal(
        'https://adservice.google.com/adsid/integrator.json?' +
          'domain=f.blah.com'
      );
    });

    it('should use google ancestor origin based top domain', () => {
      fakeWin.location.ancestorOrigins = ['foo.google.eu', 'blah.google.fr'];
      expect(getIdentityTokenRequestUrl(fakeWin, doc)).to.equal(
        'https://adservice.google.fr/adsid/integrator.json?' +
          'domain=f.blah.com'
      );
    });

    it('should use supplied domain', () => {
      fakeWin.location.ancestorOrigins = ['foo.google.fr'];
      expect(getIdentityTokenRequestUrl(fakeWin, doc, '.google.eu')).to.equal(
        'https://adservice.google.eu/adsid/integrator.json?' +
          'domain=f.blah.com'
      );
    });
  });

  describes.fakeWin(
    '#getIdentityToken',
    {amp: true, mockFetch: true},
    (env) => {
      beforeEach(() => {
        installXhrService(env.win);
        const documentInfoStub = env.sandbox.stub(
          Services,
          'documentInfoForDoc'
        );
        documentInfoStub
          .withArgs(env.ampdoc)
          .returns({canonicalUrl: 'http://f.blah.com?some_site'});
      });

      afterEach(() => {
        // Verify fetch mocks are all consumed.
        expect(env.fetchMock.done()).to.be.true;
      });

      const getUrl = (domain) => {
        domain = domain || 'google.com';
        return (
          `https:\/\/adservice\.${domain}\/adsid\/integrator\.json\?` +
          'domain=f.blah.com'
        );
      };

      it('should ignore response if required fields are missing', () => {
        env.expectFetch(getUrl(), JSON.stringify({newToken: 'abc'}));
        return getIdentityToken(env.win, env.ampdoc).then((result) => {
          expect(result.token).to.not.be.ok;
          expect(result.jar).to.not.be.ok;
          expect(result.pucrd).to.not.be.ok;
          expect(result.freshLifetimeSecs).to.not.be.ok;
          expect(result.validLifetimeSecs).to.not.be.ok;
          expect(result.fetchTimeMs).to.be.at.least(0);
        });
      });

      it('should fetch full token as expected', () => {
        env.expectFetch(
          getUrl(),
          JSON.stringify({
            newToken: 'abc',
            '1p_jar': 'some_jar',
            pucrd: 'some_pucrd',
            freshLifetimeSecs: '1234',
            validLifetimeSecs: '5678',
          })
        );
        return getIdentityToken(env.win, env.ampdoc).then((result) => {
          expect(result.token).to.equal('abc');
          expect(result.jar).to.equal('some_jar');
          expect(result.pucrd).to.equal('some_pucrd');
          expect(result.freshLifetimeSecs).to.equal(1234);
          expect(result.validLifetimeSecs).to.equal(5678);
          expect(result.fetchTimeMs).to.be.at.least(0);
        });
      });

      it('should redirect as expected', () => {
        env.expectFetch(getUrl(), JSON.stringify({altDomain: '.google.fr'}));
        env.expectFetch(
          getUrl('google.fr'),
          JSON.stringify({
            newToken: 'abc',
            freshLifetimeSecs: '1234',
            validLifetimeSecs: '5678',
          })
        );
        return getIdentityToken(env.win, env.ampdoc, '').then((result) => {
          expect(result.token).to.equal('abc');
          expect(result.jar).to.equal('');
          expect(result.pucrd).to.equal('');
          expect(result.freshLifetimeSecs).to.equal(1234);
          expect(result.validLifetimeSecs).to.equal(5678);
          expect(result.fetchTimeMs).to.be.at.least(0);
        });
      });

      it('should stop after 1 redirect', () => {
        env.expectFetch(getUrl(), JSON.stringify({altDomain: '.google.fr'}));
        env.expectFetch(
          getUrl('google.fr'),
          JSON.stringify({altDomain: '.google.com'})
        );
        return getIdentityToken(env.win, env.ampdoc).then((result) => {
          expect(result.token).to.not.be.ok;
          expect(result.jar).to.not.be.ok;
          expect(result.pucrd).to.not.be.ok;
          expect(result.fetchTimeMs).to.be.at.least(0);
        });
      });

      it('should use previous execution', () => {
        const ident = {
          newToken: 'foo',
          freshLifetimeSecs: '1234',
          validLifetimeSecs: '5678',
        };
        env.win['goog_identity_prom'] = Promise.resolve(ident);
        return getIdentityToken(env.win, env.ampdoc).then((result) =>
          expect(result).to.jsonEqual(ident)
        );
      });

      it('should handle fetch error', () => {
        env.sandbox
          .stub(Services, 'xhrFor')
          .returns({fetchJson: () => Promise.reject('some network failure')});
        return getIdentityToken(env.win, env.ampdoc).then((result) =>
          expect(result).to.jsonEqual({})
        );
      });

      it('should fetch if SUFFICIENT consent', () => {
        env.expectFetch(
          getUrl(),
          JSON.stringify({
            newToken: 'abc',
            '1p_jar': 'some_jar',
            pucrd: 'some_pucrd',
            freshLifetimeSecs: '1234',
            validLifetimeSecs: '5678',
          })
        );
        env.sandbox.stub(Services, 'consentPolicyServiceForDocOrNull').returns(
          Promise.resolve({
            whenPolicyResolved: () => CONSENT_POLICY_STATE.SUFFICIENT,
          })
        );
        return getIdentityToken(env.win, env.ampdoc, 'default').then((result) =>
          expect(result.token).to.equal('abc')
        );
      });

      it.configure()
        .skipFirefox()
        .run('should not fetch if INSUFFICIENT consent', () => {
          env.sandbox
            .stub(Services, 'consentPolicyServiceForDocOrNull')
            .returns(
              Promise.resolve({
                whenPolicyResolved: () => CONSENT_POLICY_STATE.INSUFFICIENT,
              })
            );
          return expect(
            getIdentityToken(env.win, env.ampdoc, 'default')
          ).to.eventually.jsonEqual({});
        });

      it.configure()
        .skipFirefox()
        .run('should not fetch if UNKNOWN consent', () => {
          env.sandbox
            .stub(Services, 'consentPolicyServiceForDocOrNull')
            .returns(
              Promise.resolve({
                whenPolicyResolved: () => CONSENT_POLICY_STATE.UNKNOWN,
              })
            );
          return expect(
            getIdentityToken(env.win, env.ampdoc, 'default')
          ).to.eventually.jsonEqual({});
        });
    }
  );

  describe('variables for amp-analytics', () => {
    let a4a;
    let ampdoc;

    beforeEach(() => {
      return createIframePromise().then((fixture) => {
        setupForAdTesting(fixture);
        const element = createElementWithAttributes(fixture.doc, 'amp-a4a', {
          'width': '200',
          'height': '50',
          'type': 'adsense',
          'data-amp-slot-index': '4',
        });
        ampdoc = fixture.ampdoc;
        element.getAmpDoc = () => ampdoc;
        a4a = new MockA4AImpl(element);
      });
    });

    it('should include the correlator', () => {
      const vars = getCsiAmpAnalyticsVariables('trigger', a4a, null);
      expect(vars['correlator']).not.to.be.undefined;
      expect(vars['correlator']).to.be.greaterThan(0);
    });

    it('should include the slot index', () => {
      const vars = getCsiAmpAnalyticsVariables('trigger', a4a, null);
      expect(vars['slotId']).to.equal('4');
    });

    it('should include the qqid when provided', () => {
      const vars = getCsiAmpAnalyticsVariables('trigger', a4a, '<qqid>');
      expect(vars['qqid']).to.equal('<qqid>');
    });

    it('should omit the qqid when null', () => {
      const vars = getCsiAmpAnalyticsVariables('trigger', a4a, null);
      expect(vars['qqid']).to.be.undefined;
    });

    it('should include scheduleTime for ad render start triggers', () => {
      a4a.element.layoutScheduleTime = 200;
      const vars = getCsiAmpAnalyticsVariables('ad-render-start', a4a, null);
      expect(vars['scheduleTime']).to.be.a('number');
      expect(vars['scheduleTime']).not.to.equal(0);
    });

    it('should omit scheduleTime by default', () => {
      a4a.element.layoutScheduleTime = 200;
      const vars = getCsiAmpAnalyticsVariables('trigger', a4a, null);
      expect(vars['scheduleTime']).to.be.undefined;
    });

    it('should include viewer lastVisibleTime', () => {
      window.sandbox.stub(ampdoc, 'getLastVisibleTime').returns(300);

      const vars = getCsiAmpAnalyticsVariables('trigger', a4a, null);
      expect(vars['viewerLastVisibleTime']).to.be.a('number');
      expect(vars['viewerLastVisibleTime']).not.to.equal(0);
    });
  });

  describe('#extractHost', () => {
    [
      {in: 'http://foo.com/sl?lj=fl', out: 'foo.com'},
      {in: 'Http://bar.com?lj=fl', out: 'bar.com'},
      {in: 'htTps://foo.com?lj=fl', out: 'foo.com'},
      {in: 'http://bar.com', out: 'bar.com'},
      {in: 'https://foo.com', out: 'foo.com'},
      {in: 'https://foo.com:8080', out: 'foo.com'},
      {in: 'https://bar.com:8080/lkjs?a=b', out: 'bar.com'},
      {in: 'bar.com:8080/lkjs?a=b', out: 'bar.com'},
      {in: 'bar.com:8080/', out: 'bar.com'},
      {in: 'bar.com/sl?lj=fl', out: 'bar.com'},
      {in: 'foo.com/sl/lj=fl?ls=f', out: 'foo.com'},
      {in: 'bar.com?lj=fl', out: 'bar.com'},
      {in: 'foo.com?lj=fl', out: 'foo.com'},
      {in: 'hello.com', out: 'hello.com'},
      {in: '', out: ''},
    ].forEach((test) =>
      it(test.in, () => expect(extractHost(test.in)).to.equal(test.out))
    );
  });

  describes.realWin('#getCorrelator', {}, (env) => {
    let win;

    beforeEach(() => {
      win = env.win;
    });

    afterEach(() => {
      toggleExperiment(win, 'exp-new-correlator', false);
    });

    it('should return cached value if it exists', () => {
      const correlator = '12345678910';
      win.ampAdPageCorrelator = correlator;
      expect(getCorrelator(win, win.document)).to.equal(correlator);
    });

    it('should calculate correlator from PVID and CID if possible', () => {
      const pageViewId = '818181';
      env.sandbox.stub(Services, 'documentInfoForDoc').callsFake(() => {
        return {pageViewId};
      });
      const cid = '12345678910';
      const correlator = getCorrelator(win, win.document, cid);
      expect(String(correlator).includes(pageViewId)).to.be.true;
    });

    it('should calculate randomly if experiment on', () => {
      toggleExperiment(win, 'exp-new-correlator', true);
      const correlator = getCorrelator(win, win.document);
      expect(correlator).to.be.below(2 ** 52);
      expect(correlator).to.be.above(0);
    });
  });
});

describes.realWin('#groupAmpAdsByType', {amp: true}, (env) => {
  let doc, win, ampdoc;
  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ampdoc = env.ampdoc;
  });

  function createResource(config, tagName = 'amp-ad', parent = doc.body) {
    const element = createElementWithAttributes(doc, tagName, config);
    parent.appendChild(element);
    element.getImpl = () => Promise.resolve({element});
    return {element};
  }

  it('should find amp-ad of only given type', () => {
    const resources = [
      createResource({type: 'doubleclick'}),
      createResource({type: 'blah'}),
      createResource({}, 'amp-foo'),
    ];
    env.sandbox
      .stub(IniLoad, 'getMeasuredResources')
      .callsFake((doc, win, fn) => Promise.resolve(resources.filter(fn)));
    return groupAmpAdsByType(ampdoc, 'doubleclick', () => 'foo').then(
      (result) => {
        expect(Object.keys(result).length).to.equal(1);
        expect(result['foo']).to.be.ok;
        expect(result['foo'].length).to.equal(1);
        return result['foo'][0].then((baseElement) =>
          expect(baseElement.element.getAttribute('type')).to.equal(
            'doubleclick'
          )
        );
      }
    );
  });

  it('should find amp-ad within sticky container', () => {
    const stickyResource = createResource({}, 'amp-sticky-ad');
    const resources = [stickyResource, createResource({}, 'amp-foo')];
    // Do not expect ampAdResource to be returned by getMeasuredResources
    // as its owned by amp-sticky-ad.  It will locate associated element
    // and block on whenUpgradedToCustomElement so override createdCallback
    // to cause it to return immediately.
    const ampAdResource = createResource(
      {type: 'doubleclick'},
      'amp-ad',
      stickyResource.element
    );
    ampAdResource.element.createdCallback = true;
    env.sandbox
      .stub(IniLoad, 'getMeasuredResources')
      .callsFake((doc, win, fn) => Promise.resolve(resources.filter(fn)));
    return groupAmpAdsByType(win, 'doubleclick', () => 'foo').then((result) => {
      expect(Object.keys(result).length).to.equal(1);
      expect(result['foo']).to.be.ok;
      expect(result['foo'].length).to.equal(1);
      return result['foo'][0].then((baseElement) =>
        expect(baseElement.element.getAttribute('type')).to.equal('doubleclick')
      );
    });
  });

  it('should find and group multiple, some in containers', () => {
    const stickyResource = createResource({}, 'amp-sticky-ad');
    const resources = [
      stickyResource,
      createResource({}, 'amp-foo'),
      createResource({type: 'doubleclick', foo: 'bar'}),
      createResource({type: 'doubleclick', foo: 'hello'}),
    ];
    // Do not expect ampAdResource to be returned by getMeasuredResources
    // as its owned by amp-sticky-ad.  It will locate associated element
    // and block on whenUpgradedToCustomElement so override createdCallback
    // to cause it to return immediately.
    const ampAdResource = createResource(
      {type: 'doubleclick', foo: 'bar'},
      'amp-ad',
      stickyResource.element
    );
    ampAdResource.element.createdCallback = true;
    env.sandbox
      .stub(IniLoad, 'getMeasuredResources')
      .callsFake((doc, win, fn) => Promise.resolve(resources.filter(fn)));
    return groupAmpAdsByType(win, 'doubleclick', (element) =>
      element.getAttribute('foo')
    ).then((result) => {
      expect(Object.keys(result).length).to.equal(2);
      expect(result['bar']).to.be.ok;
      expect(result['bar'].length).to.equal(2);
      expect(result['hello']).to.be.ok;
      expect(result['hello'].length).to.equal(1);
      return Promise.all(
        result['bar'].concat(result['hello'])
      ).then((baseElements) =>
        baseElements.forEach((baseElement) =>
          expect(baseElement.element.getAttribute('type')).to.equal(
            'doubleclick'
          )
        )
      );
    });
  });
});
