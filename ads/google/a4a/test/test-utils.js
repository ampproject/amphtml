import * as fakeTimers from '@sinonjs/fake-timers';

import '../../../../extensions/amp-ad/0.1/amp-ad-ui';
import '../../../../extensions/amp-ad/0.1/amp-ad-xorigin-iframe-handler';
import {buildUrl} from '#ads/google/a4a/shared/url-builder';
import {
  AMP_EXPERIMENT_ATTRIBUTE,
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
  getServeNpaPromise,
  googleAdUrl,
  groupAmpAdsByType,
  maybeAppendErrorParameter,
  mergeExperimentIds,
} from '#ads/google/a4a/utils';

import {createElementWithAttributes} from '#core/dom';

import {toggleExperiment} from '#experiments';

import {Services} from '#service';
import {installDocService} from '#service/ampdoc-impl';
import {installExtensionsService} from '#service/extensions-impl';

import {user} from '#utils/log';

import {createIframePromise} from '#testing/iframe';

import {MockA4AImpl} from '../../../../extensions/amp-a4a/0.1/test/utils';
import {GEO_IN_GROUP} from '../../../../extensions/amp-geo/0.1/amp-geo-in-group';
import * as IniLoad from '../../../../src/ini-load';

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
    width: 0,
    height: 0,
  }
) {
  const noop = () => {};
  impl.element.buildInternal = noop;
  impl.element.getPlaceholder = noop;
  impl.element.createPlaceholder = noop;
  sandbox.stub(impl, 'getAmpDoc').returns(ampdoc);
  sandbox.stub(impl.element, 'offsetParent').value(null);
  sandbox.stub(impl.element, 'offsetTop').value(pageLayoutBox.top);
  sandbox.stub(impl.element, 'offsetLeft').value(pageLayoutBox.left);
  sandbox.stub(impl.element, 'offsetWidth').value(pageLayoutBox.width);
  sandbox.stub(impl.element, 'offsetHeight').value(pageLayoutBox.height);
}

describes.sandboxed('Google A4A utils', {}, (env) => {
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
        btr1: 'https://example.test?id=1',
        btr2: 'https://example.test?id=2',
      },
      triggers: {
        beginToRender: {
          on: 'ini-load',
          request: ['btr1', 'btr2'],
          selector: 'amp-ad',
          selectionMethod: 'closest',
        },
      },
    };

    const fullConfig = {
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
          [EXPERIMENT_ATTRIBUTE]: '00000001,0000002',
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
        btrUrl = [];
        expect(extractAmpAnalyticsConfig(a4a, headers)).to.not.be.ok;
        expect(extractAmpAnalyticsConfig(a4a, headers)).to.be.null;

        url = ['https://foo.com?hello=world', 'https://bar.com?a=b'];
        btrUrl = [];
        let config = extractAmpAnalyticsConfig(a4a, headers);
        expect(config).to.deep.equal(builtConfig);

        url = [];
        btrUrl = ['https://example.test?id=1', 'https://example.test?id=2'];
        config = extractAmpAnalyticsConfig(a4a, headers);
        expect(config).to.deep.equal(btrConfig);

        url = ['https://foo.com?hello=world', 'https://bar.com?a=b'];
        btrUrl = ['https://example.test?id=1', 'https://example.test?id=2'];
        config = extractAmpAnalyticsConfig(a4a, headers);
        expect(config).to.deep.equal(fullConfig);

        headers.has = function (name) {
          expect(name).to.equal('X-AmpAnalytics');
          return false;
        };
        expect(extractAmpAnalyticsConfig(a4a, headers)).to.not.be.ok;
      });
    });

    it('should add the correct CSI signals', () => {
      env.sandbox
        .stub(Services, 'documentInfoForDoc')
        .returns({pageViewId: 777});
      const mockElement = {
        getAttribute: function (name) {
          switch (name) {
            case EXPERIMENT_ATTRIBUTE:
              return '00000001,00000002';
            case AMP_EXPERIMENT_ATTRIBUTE:
              return '103,204';
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
        /(\?|&)aexp=103!204(&|$)/,
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
        impl.uiHandler = {isStickyAd: () => false};
        noopMethods(impl, fixture.ampdoc, env.sandbox);
        return fixture.addElement(elem).then(() =>
          googleAdUrl(impl, '', 0, [], []).then((url1) => {
            expect(url1).to.match(/ady=11/);
            expect(url1).to.match(/adx=12/);
          })
        );
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
        impl.uiHandler = {isStickyAd: () => false};
        noopMethods(impl, fixture.ampdoc, env.sandbox);
        const getRect = () => {
          return {'width': 100, 'height': 200};
        };
        const getSize = () => {
          return {'width': 100, 'height': 200};
        };
        const getScrollLeft = () => 12.1;
        const getScrollTop = () => 34.2;
        const viewportStub = env.sandbox.stub(Services, 'viewportForDoc');
        viewportStub.returns({getRect, getSize, getScrollTop, getScrollLeft});
        return googleAdUrl(impl, '', 0, {}, []).then((url1) => {
          expect(url1).to.match(/scr_x=12&scr_y=34/);
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
          [EXPERIMENT_ATTRIBUTE]: '123,456',
          [AMP_EXPERIMENT_ATTRIBUTE]: '111,222',
        });
        const impl = new MockA4AImpl(elem);
        impl.uiHandler = {isStickyAd: () => false};
        noopMethods(impl, fixture.ampdoc, env.sandbox);
        return fixture.addElement(elem).then(() => {
          return googleAdUrl(impl, '', 0, {}, ['789', '098']).then((url1) => {
            expect(url1).to.match(/eid=123%2C456%2C789%2C098/);
            expect(url1).to.match(/aexp=111!222/);
          });
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
        impl.uiHandler = {isStickyAd: () => false};
        noopMethods(impl, fixture.ampdoc, env.sandbox);
        impl.win.AMP_CONFIG = {type: 'production'};
        impl.win.location.hash = 'foo,deid=123456,654321,bar';
        return fixture.addElement(elem).then(() => {
          return googleAdUrl(impl, '', 0, [], []).then((url1) => {
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
        impl.uiHandler = {isStickyAd: () => false};
        noopMethods(impl, fixture.ampdoc, env.sandbox);
        impl.win.gaGlobal = {cid: 'foo', hid: 'bar'};
        return fixture.addElement(elem).then(() => {
          return googleAdUrl(impl, '', 0, [], []).then((url) => {
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
        impl.uiHandler = {isStickyAd: () => false};
        noopMethods(impl, fixture.ampdoc, env.sandbox);
        const createElementStub = env.sandbox.stub(
          impl.win.document,
          'createElement'
        );
        createElementStub.withArgs('iframe').returns({
          sandbox: {
            supports: () => true,
          },
        });
        return fixture.addElement(elem).then(() => {
          return expect(googleAdUrl(impl, '', 0, {}, [])).to.eventually.match(
            /[&?]bc=7[&$]/
          );
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
        impl.uiHandler = {isStickyAd: () => false};
        noopMethods(impl, fixture.ampdoc, env.sandbox);
        const createElementStub = env.sandbox.stub(
          impl.win.document,
          'createElement'
        );
        createElementStub.withArgs('iframe').returns({
          sandbox: {},
        });
        return fixture.addElement(elem).then(() => {
          return expect(googleAdUrl(impl, '', 0, {}, [])).to.eventually.match(
            /[&?]bc=1[&$]/
          );
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
        impl.uiHandler = {isStickyAd: () => false};
        noopMethods(impl, fixture.ampdoc, env.sandbox);
        impl.win.SVGElement = undefined;
        const createElementStub = env.sandbox.stub(
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
            googleAdUrl(impl, '', 0, {}, [])
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
        impl.uiHandler = {isStickyAd: () => false};
        noopMethods(impl, fixture.ampdoc, env.sandbox);
        env.sandbox
          .stub(Services.viewerForDoc(impl.getAmpDoc()), 'getReferrerUrl')
          .returns(new Promise(() => {}));
        const createElementStub = env.sandbox.stub(
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
            googleAdUrl(impl, '', 0, {}, [])
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
        impl.uiHandler = {isStickyAd: () => false};
        noopMethods(impl, fixture.ampdoc, env.sandbox);
        return fixture.addElement(elem).then(() => {
          return googleAdUrl(impl, '', Date.now(), [], []).then((url) => {
            expect(url).to.match(/[&?]bdt=[1-9][0-9]*[&$]/);
          });
        });
      });
    });

    it('should include user agent hint params', () => {
      return createIframePromise().then((fixture) => {
        setupForAdTesting(fixture);
        const {doc} = fixture;
        doc.win = fixture.win;
        const elem = createElementWithAttributes(doc, 'amp-a4a', {});
        const impl = new MockA4AImpl(elem);
        impl.uiHandler = {isStickyAd: () => false};
        noopMethods(impl, fixture.ampdoc, env.sandbox);
        Object.defineProperty(impl.win.navigator, 'userAgentData', {
          'value': {
            'getHighEntropyValues': () =>
              Promise.resolve({
                platform: 'Windows',
                platformVersion: 10,
                architecture: 'x86',
                model: 'Pixel',
                uaFullVersion: 3.14159,
                bitness: 42,
                fullVersionList: [{brand: 'Chrome', version: '3.14159'}],
                wow64: true,
              }),
          },
        });
        return fixture.addElement(elem).then(() => {
          return googleAdUrl(impl, '', Date.now(), [], []).then((url) => {
            expect(url).to.match(
              /[&?]uap=Windows&uapv=10&uaa=x86&uam=Pixel&uafv=3.14159&uab=42&uafvl=%5B%7B%22brand%22%3A%22Chrome%22%2C%22version%22%3A%223.14159%22%7D%5D&uaw=true[&$]/
            );
          });
        });
      });
    });

    it('should proceed if user agent hint params time outs', () => {
      return createIframePromise().then((fixture) => {
        setupForAdTesting(fixture);
        const clock = fakeTimers.withGlobal(fixture.win).install({
          toFake: ['Date', 'setTimeout', 'clearTimeout'],
        });
        const {doc} = fixture;
        doc.win = fixture.win;
        const elem = createElementWithAttributes(doc, 'amp-a4a', {});
        const impl = new MockA4AImpl(elem);
        impl.uiHandler = {isStickyAd: () => false};
        noopMethods(impl, fixture.ampdoc, env.sandbox);
        Object.defineProperty(impl.win.navigator, 'userAgentData', {
          'value': {
            // Promise that never resolves
            'getHighEntropyValues': () => new Promise(() => {}),
          },
        });
        expectAsyncConsoleError('[AMP-A4A] UACH timeout!', 1);
        return fixture.addElement(elem).then(() => {
          const promise = googleAdUrl(impl, '', Date.now(), [], []).then(
            (url) => {
              expect(url).to.not.match(
                /[&?]uap=Windows&uapv=10&uaa=x86&uam=Pixel&uafv=3.14159&uab=42&uafvl=%5B%7B%22brand%22%3A%22Chrome%22%2C%22version%22%3A%223.14159%22%7D%5D&uaw=true[&$]/
              );
            }
          );
          clock.tick(1001);
          return promise;
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
      env.sandbox.stub(ampdoc, 'getLastVisibleTime').returns(300);

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

  describes.realWin('#getServeNpaPromise', {}, (env) => {
    let win, doc, element, geoService;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      element = doc.createElement('amp-ad');
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
    });

    it('should return false if no attribute found', async () => {
      expect(await getServeNpaPromise(element)).to.false;
    });

    it('should return true, regardless of geo location if empty string', async () => {
      element.setAttribute('always-serve-npa', '');
      expect(await getServeNpaPromise(element)).to.true;
    });

    it('should return if doc is served from a defined geo group', async () => {
      env.sandbox
        .stub(Services, 'geoForDocOrNull')
        .returns(Promise.resolve(geoService));
      element.setAttribute('always-serve-npa', 'gdpr,usca');
      expect(await getServeNpaPromise(element)).to.true;
    });

    it('should return false when doc is in an undefined group or not in', async () => {
      const warnSpy = env.sandbox.stub(user(), 'warn');
      env.sandbox
        .stub(Services, 'geoForDocOrNull')
        .returns(Promise.resolve(geoService));

      // Undefined group
      element.setAttribute('always-serve-npa', 'tx');
      expect(await getServeNpaPromise(element)).to.false;
      expect(warnSpy.args[0][0]).to.match(/AMP-AD/);
      expect(warnSpy.args[0][1]).to.match(/Geo group "tx" was not defined./);
      expect(warnSpy).to.have.been.calledOnce;
      // Not in
      element.setAttribute('always-serve-npa', 'gdpr');
      expect(await getServeNpaPromise(element)).to.false;
    });

    it('should return true when geoService is null', async () => {
      geoService = null;
      env.sandbox
        .stub(Services, 'geoForDocOrNull')
        .returns(Promise.resolve(geoService));
      element.setAttribute('always-serve-npa', 'gdpr');
      expect(await getServeNpaPromise(element)).to.true;
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
      return Promise.all(result['bar'].concat(result['hello'])).then(
        (baseElements) =>
          baseElements.forEach((baseElement) =>
            expect(baseElement.element.getAttribute('type')).to.equal(
              'doubleclick'
            )
          )
      );
    });
  });
});
