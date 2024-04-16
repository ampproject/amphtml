// Need the following side-effect import because in actual production code,
// Fast Fetch impls are always loaded via an AmpAd tag, which means AmpAd is
// always available for them. However, when we test an impl in isolation,
// AmpAd is not loaded already, so we need to load it separately.
import {CONSENT_POLICY_STATE} from '#core/constants/consent-state';
import {createElementWithAttributes} from '#core/dom';
import {isFiniteNumber} from '#core/types';

import {Services} from '#service';
import {
  RTC_ERROR_ENUM,
  RealTimeConfigManager,
} from '#service/real-time-config/real-time-config-impl';
import {Xhr} from '#service/xhr-impl';

import {dev, user} from '#utils/log';

import {cancellation} from '../../src/error-reporting';

describes.realWin('real-time-config service', {amp: true}, (env) => {
  let element;
  let fetchJsonStub;
  let getCalloutParam_, execute_, validateRtcConfig_;
  let truncUrl_, inflateAndSendRtc_, sendErrorMessage;
  let rtc;

  beforeEach(() => {
    // Ensures window location == AMP cache passes.
    env.win.__AMP_MODE.test = true;

    const doc = env.win.document;
    doc.win = env.win;
    element = createElementWithAttributes(env.win.document, 'amp-ad', {
      'width': '200',
      'height': '50',
      'type': 'doubleclick',
      'layout': 'fixed',
    });
    doc.body.appendChild(element);
    fetchJsonStub = env.sandbox.stub(Xhr.prototype, 'fetchJson');

    // RealTimeConfigManager uses the UrlReplacements service scoped to the A4A
    // (FIE), but for testing stub in the parent service for simplicity.
    const urlReplacements = Services.urlReplacementsForDoc(element);
    env.sandbox
      .stub(Services, 'urlReplacementsForDoc')
      .withArgs(doc)
      .returns(urlReplacements);

    rtc = new RealTimeConfigManager(doc);
    execute_ = rtc.execute.bind(rtc);
    getCalloutParam_ = rtc.getCalloutParam_.bind(rtc);
    validateRtcConfig_ = rtc.validateRtcConfig_.bind(rtc);
    truncUrl_ = rtc.truncUrl_.bind(rtc);
    inflateAndSendRtc_ = rtc.inflateAndSendRtc_.bind(rtc);
    sendErrorMessage = rtc.sendErrorMessage.bind(rtc);
  });

  function setFetchJsonStubBehavior(params, response, isString, shouldFail) {
    if (shouldFail) {
      fetchJsonStub.withArgs(params).returns(Promise.reject('FAIL'));
    } else {
      const textFunction = () => {
        return !isString
          ? Promise.resolve(JSON.stringify(response))
          : Promise.resolve(response);
      };
      fetchJsonStub.withArgs(params).returns(
        Promise.resolve({
          status: 200,
          text: textFunction,
        })
      );
    }
  }

  function setRtcConfig(rtcConfig) {
    element.setAttribute('rtc-config', JSON.stringify(rtcConfig));
  }

  describe('#truncUrl_', () => {
    it('truncates URL', () => {
      let url = 'https://www.example.biz/?';
      for (let i = 0; i < 1000; i++) {
        url += '&23456=8901234567';
      }
      expect(url.length).to.be.above(16384);
      url = truncUrl_(url);
      expect(url.length).to.be.at.most(16384);
      expect(url).to.contain('&__trunc__=1');
    });
  });

  describe('#getCalloutParam_', () => {
    it('should convert url to callout param when parseable', () => {
      const url = 'https://www.example.test/endpoint.php?unincluded';
      const ard = getCalloutParam_(url);
      expect(ard).to.equal('www.example.test/endpoint.php');
    });

    it('should convert & trunc url when parseable', () => {
      const url =
        'https://www.example.test/thisIsTooMany' +
        'Characters1234567891011121314.php';
      const ard = getCalloutParam_(url);
      expect(ard).to.equal(
        'www.example.test/thisIsTooManyCharacters1234567891'
      );
    });
  });

  describe('#execute_', () => {
    function executeTest(args) {
      const {
        calloutCount,
        expectedCalloutUrls,
        expectedRtcArray,
        failXhr,
        responseIsString,
        rtcCalloutResponses,
        timeoutMillis,
        urls,
        vendors,
      } = args;
      setRtcConfig({urls, vendors, timeoutMillis});
      (expectedCalloutUrls || []).forEach((expectedUrl, i) => {
        setFetchJsonStubBehavior(
          expectedUrl,
          rtcCalloutResponses[i],
          responseIsString,
          failXhr
        );
      });
      const customMacros = args['customMacros'] || {};
      const rtcResponsePromiseArray = execute_(
        element,
        customMacros,
        /* consentState */ undefined,
        /* consentString */ undefined,
        /* consentMetadata */ undefined,
        () => {}
      );
      return rtcResponsePromiseArray.then((rtcResponseArray) => {
        expect(rtcResponseArray.length).to.equal(expectedRtcArray.length);
        expect(fetchJsonStub.callCount).to.equal(calloutCount);
        (expectedCalloutUrls || []).forEach((url) => {
          expect(fetchJsonStub).to.have.been.calledWith(url);
        });
        rtcResponseArray.forEach((rtcResponse, i) => {
          expect(rtcResponse.response).to.deep.equal(
            expectedRtcArray[i].response
          );
          expect(rtcResponse.callout).to.equal(expectedRtcArray[i].callout);
          expect(rtcResponse.error).to.equal(expectedRtcArray[i].error);
          expect(Object.keys(rtcResponse).sort()).to.deep.equal(
            Object.keys(expectedRtcArray[i]).sort()
          );
          expect(isFiniteNumber(rtcResponse.rtcTime)).to.be.true;
        });
      });
    }

    const urlMacros = [
      'slot_id=SLOT_ID',
      'page_id=PAGE_ID',
      'adx=ADX',
      'ady=ADY',
    ];

    function generateUrls(numUrls, numMacroUrls) {
      const urls = [];
      for (let i = 0; i < numUrls; i++) {
        urls.push(`https://www.${i}.com/`);
      }
      for (let i = 0; i < numMacroUrls; i++) {
        urls.push(
          `https://www.${i + numUrls}.com/?${urlMacros
            .slice(0, i + 1)
            .join('&')}`
        );
      }
      return urls;
    }

    function rtcEntry(response, url, error, isVendor) {
      // If this is an entry for a vendor, then the callout is just
      // the vendor name passed in to url here.
      const callout = !!isVendor ? url : getCalloutParam_(url);
      return response
        ? {response, callout, rtcTime: 10}
        : {callout, error, rtcTime: 10};
    }

    function generateCalloutResponses(numGoodResponses) {
      const rtcCalloutResponses = [];
      let response;
      for (let i = 0; i < numGoodResponses; i++) {
        response = {};
        response[`response${i}`] = {};
        response[`response${i}`][`foo${i}`] = [`a${i}`, `b${i}`, `c${i}`];
        rtcCalloutResponses.push(response);
      }
      return rtcCalloutResponses;
    }

    it('should send RTC callouts for all specified URLS without macros', () => {
      const calloutCount = 5;
      const urls = generateUrls(5);
      const rtcCalloutResponses = [
        {'response1': {'fooArray': ['foo']}},
        {'response2': {'test': 'test2'}},
        {'response3': {'apple': 'banana'}},
        {
          'response4': {
            'animalArray': ['cat', 'dog'],
            'foodObject': {'apple': true, 'car': false},
          },
        },
        {'response5': [1, 2, 3]},
      ];
      const expectedRtcArray = [];
      urls.forEach((url, i) => {
        expectedRtcArray.push({
          callout: getCalloutParam_(url),
          rtcTime: 10,
          response: rtcCalloutResponses[i],
        });
      });
      return executeTest({
        urls,
        inflatedUrls: urls,
        rtcCalloutResponses,
        calloutCount,
        expectedCalloutUrls: urls,
        expectedRtcArray,
      });
    });

    it('should send only 5 RTC callouts for all URLS without macros', () => {
      const urls = generateUrls(7);
      const expectedCalloutUrls = generateUrls(5);
      const rtcCalloutResponses = generateCalloutResponses(7);
      const calloutCount = 5;
      const expectedRtcArray = [];
      for (let i = 0; i < 5; i++) {
        expectedRtcArray.push(rtcEntry(rtcCalloutResponses[i], urls[i]));
      }
      expectedRtcArray.push(
        rtcEntry(null, urls[5], RTC_ERROR_ENUM.MAX_CALLOUTS_EXCEEDED)
      );
      expectedRtcArray.push(
        rtcEntry(null, urls[6], RTC_ERROR_ENUM.MAX_CALLOUTS_EXCEEDED)
      );
      return executeTest({
        urls,
        inflatedUrls: urls,
        rtcCalloutResponses,
        calloutCount,
        expectedCalloutUrls,
        expectedRtcArray,
      });
    });

    it('should send RTC callouts to inflated publisher URLs', () => {
      const urls = generateUrls(1, 2);
      const inflatedUrls = [
        'https://www.0.com/',
        'https://www.1.com/?slot_id=1',
        'https://www.2.com/?slot_id=1&page_id=2',
      ];
      const rtcCalloutResponses = generateCalloutResponses(3);
      const customMacros = {
        SLOT_ID: 1,
        PAGE_ID: () => 2,
        FOO_ID: () => 3,
      };
      const expectedRtcArray = [];
      rtcCalloutResponses.forEach((rtcResponse, i) => {
        expectedRtcArray.push(rtcEntry(rtcResponse, inflatedUrls[i]));
      });
      const calloutCount = 3;
      return executeTest({
        urls,
        customMacros,
        inflatedUrls,
        rtcCalloutResponses,
        calloutCount,
        expectedCalloutUrls: inflatedUrls,
        expectedRtcArray,
      });
    });

    it('should fetch RTC from amp-script URIs', async () => {
      const ampScriptFetch = env.sandbox.stub();
      ampScriptFetch.returns(Promise.resolve({targeting: ['sports']}));
      env.sandbox
        .stub(Services, 'scriptForDocOrNull')
        .returns(Promise.resolve({fetch: ampScriptFetch}));

      const urls = ['amp-script:scriptId.functionName'];
      setRtcConfig({urls, vendors: {}, timeoutMillis: 500});
      const rtcResponse = await execute_(
        element,
        /* customMacros */ {},
        /* consentState */ undefined,
        /* consentString */ undefined,
        /* consentMetadata */ undefined,
        () => {}
      );
      expect(ampScriptFetch).calledWithExactly(
        'amp-script:scriptId.functionName'
      );
      expect(rtcResponse[0].response).deep.equal({targeting: ['sports']});
    });

    it('should send RTC callouts to inflated vendor URLs', () => {
      const vendors = {
        'fAkeVeNdOR': {SLOT_ID: 1, PAGE_ID: 2},
      };
      const inflatedUrls = [
        'https://localhost:8000/examples/rtcE1.json?slot_id=1&page_id=3&foo_id=4',
      ];
      const rtcCalloutResponses = [{'response1': {'fooArray': ['foo']}}];
      const customMacros = {
        PAGE_ID: () => 3,
        FOO_ID: () => 4,
      };
      const calloutCount = 1;
      const expectedRtcArray = [];
      expectedRtcArray.push(
        rtcEntry(
          rtcCalloutResponses[0],
          Object.keys(vendors)[0].toLowerCase(),
          undefined,
          true
        )
      );
      return executeTest({
        vendors,
        customMacros,
        inflatedUrls,
        rtcCalloutResponses,
        calloutCount,
        expectedCalloutUrls: inflatedUrls,
        expectedRtcArray,
      });
    });
    it('should send callouts to vendor URLs with object/array macros', () => {
      const vendors = {
        'fAkeVeNdOR': {
          SLOT_ID: {'key': 'value'},
          PAGE_ID: [1, 2, 3],
          FOO_ID: 'String',
        },
      };
      const inflatedUrls = [
        'https://localhost:8000/examples/rtcE1.json?slot_id=%7B%22key%22%3A%22' +
          'value%22%7D&page_id=%5B1%2C2%2C3%5D&foo_id=String',
      ];
      const rtcCalloutResponses = [{'response1': {'fooArray': ['foo']}}];
      const calloutCount = 1;
      const expectedRtcArray = [];
      expectedRtcArray.push(
        rtcEntry(
          rtcCalloutResponses[0],
          Object.keys(vendors)[0].toLowerCase(),
          undefined,
          true
        )
      );
      return executeTest({
        vendors,
        inflatedUrls,
        rtcCalloutResponses,
        calloutCount,
        expectedCalloutUrls: inflatedUrls,
        expectedRtcArray,
      });
    });
    it('should send RTC callouts to inflated publisher and vendor URLs', () => {
      const urls = generateUrls(2, 2);
      const vendors = {
        'fAkeVeNdOR': {SLOT_ID: 0, PAGE_ID: 1},
      };
      const inflatedUrls = [
        'https://www.0.com/',
        'https://www.1.com/',
        'https://www.2.com/?slot_id=1',
        'https://www.3.com/?slot_id=1&page_id=2',
        'https://localhost:8000/examples/rtcE1.json?slot_id=1&page_id=2&foo_id=3',
      ];
      const rtcCalloutResponses = generateCalloutResponses(5);
      const customMacros = {
        SLOT_ID: 1,
        PAGE_ID: () => 2,
        FOO_ID: () => 3,
      };
      const expectedRtcArray = [];
      for (let i = 0; i < 4; i++) {
        expectedRtcArray.push(
          rtcEntry(rtcCalloutResponses[i], inflatedUrls[i])
        );
      }
      expectedRtcArray.push(
        rtcEntry(
          rtcCalloutResponses[4],
          Object.keys(vendors)[0].toLowerCase(),
          undefined,
          true
        )
      );
      const calloutCount = 5;
      return executeTest({
        urls,
        vendors,
        customMacros,
        inflatedUrls,
        rtcCalloutResponses,
        calloutCount,
        expectedCalloutUrls: inflatedUrls,
        expectedRtcArray,
      });
    });
    it('should ignore bad macros for vendor urls', () => {
      const vendors = {
        'fAkeVeNdOR': {'slot_id=SLOT_ID': 0, PAGE_ID: 1},
      };
      const inflatedUrls = [
        'https://localhost:8000/examples/rtcE1.json?slot_id=SLOT_ID&page_id=1&foo_id=FOO_ID',
      ];
      const rtcCalloutResponses = generateCalloutResponses(1);
      const expectedRtcArray = [];
      for (let i = 0; i < 1; i++) {
        expectedRtcArray.push(
          rtcEntry(
            rtcCalloutResponses[i],
            Object.keys(vendors)[0].toLowerCase(),
            undefined,
            true
          )
        );
      }
      const calloutCount = 1;
      env.sandbox.stub(user(), 'error').callsFake(() => {});
      return executeTest({
        vendors,
        inflatedUrls,
        rtcCalloutResponses,
        calloutCount,
        expectedCalloutUrls: inflatedUrls,
        expectedRtcArray,
      });
    });

    it('should favor publisher URLs over vendor URLs', () => {
      const urls = generateUrls(3, 2);
      const vendors = {
        'fAkeVeNdOR': {SLOT_ID: 0, PAGE_ID: 1},
      };
      const inflatedUrls = [
        'https://www.0.com/',
        'https://www.1.com/',
        'https://www.2.com/',
        'https://www.3.com/?slot_id=1',
        'https://www.4.com/?slot_id=1&page_id=2',
      ];
      const rtcCalloutResponses = generateCalloutResponses(6);
      const customMacros = {
        SLOT_ID: 1,
        PAGE_ID: () => 2,
        FOO_ID: () => 3,
      };
      const expectedRtcArray = [];
      for (let i = 0; i < 5; i++) {
        expectedRtcArray.push(
          rtcEntry(rtcCalloutResponses[i], inflatedUrls[i])
        );
      }
      expectedRtcArray.push(
        rtcEntry(
          null,
          Object.keys(vendors)[0].toLowerCase(),
          RTC_ERROR_ENUM.MAX_CALLOUTS_EXCEEDED,
          true
        )
      );
      const calloutCount = 5;
      return executeTest({
        urls,
        vendors,
        customMacros,
        rtcCalloutResponses,
        calloutCount,
        expectedCalloutUrls: inflatedUrls,
        expectedRtcArray,
      });
    });
    it('should not send more than one RTC callout to the same url', () => {
      const urls = ['https://www.0.com/', 'https://www.0.com/'];
      const rtcCalloutResponses = generateCalloutResponses(1);
      const calloutCount = 1;
      const expectedCalloutUrls = ['https://www.0.com/'];
      const expectedRtcArray = [
        {
          response: rtcCalloutResponses[0],
          callout: getCalloutParam_(urls[0]),
          rtcTime: 10,
        },
        {
          callout: getCalloutParam_(urls[1]),
          error: RTC_ERROR_ENUM.DUPLICATE_URL,
          rtcTime: 10,
        },
      ];
      return executeTest({
        urls,
        inflatedUrls: urls,
        rtcCalloutResponses,
        calloutCount,
        expectedCalloutUrls,
        expectedRtcArray,
      });
    });

    it('should not send an RTC callout to an insecure url', () => {
      const urls = [
        'https://www.1.com/',
        'https://www.2.com',
        'http://www.insecure.biz/',
      ];
      const rtcCalloutResponses = [
        {'response1': {'fooArray': ['foo']}},
        {'response2': {'insecure': ['virus']}},
      ];
      const calloutCount = 2;
      const expectedCalloutUrls = ['https://www.1.com/', 'https://www.2.com'];
      const expectedRtcArray = [
        {
          response: rtcCalloutResponses[0],
          callout: getCalloutParam_(urls[0]),
          rtcTime: 10,
        },
        {
          response: rtcCalloutResponses[1],
          callout: getCalloutParam_(urls[1]),
          rtcTime: 10,
        },
        {
          callout: getCalloutParam_(urls[2]),
          error: RTC_ERROR_ENUM.INSECURE_URL,
          rtcTime: 10,
        },
      ];
      return executeTest({
        urls,
        inflatedUrls: urls,
        rtcCalloutResponses,
        calloutCount,
        expectedCalloutUrls,
        expectedRtcArray,
      });
    });
    it('should not send RTC callout to unknown vendor', () => {
      const vendors = {
        'unknownvendor': {SLOT_ID: 1, PAGE_ID: 2},
      };
      const calloutCount = 0;
      const expectedRtcArray = [];
      expectedRtcArray.push(
        rtcEntry(
          null,
          Object.keys(vendors)[0].toLowerCase(),
          RTC_ERROR_ENUM.UNKNOWN_VENDOR,
          true
        )
      );
      return executeTest({vendors, calloutCount, expectedRtcArray});
    });
    it('should handle bad JSON response', () => {
      const urls = generateUrls(1);
      const rtcCalloutResponses = ['{foo:bar'];
      const expectedRtcArray = [];
      rtcCalloutResponses.forEach((rtcResponse, i) => {
        expectedRtcArray.push(
          rtcEntry(null, urls[i], RTC_ERROR_ENUM.MALFORMED_JSON_RESPONSE)
        );
      });
      const calloutCount = 1;
      return executeTest({
        urls,
        inflatedUrls: urls,
        rtcCalloutResponses,
        calloutCount,
        expectedCalloutUrls: urls,
        expectedRtcArray,
        responseIsString: true,
      });
    });
    it('should catch errors due to network failure', () => {
      const urls = generateUrls(1);
      const rtcCalloutResponses = generateCalloutResponses(1);
      const expectedRtcArray = [];
      rtcCalloutResponses.forEach((rtcResponse, i) => {
        expectedRtcArray.push(
          rtcEntry(null, urls[i], RTC_ERROR_ENUM.NETWORK_FAILURE)
        );
      });
      const calloutCount = 1;
      return executeTest({
        urls,
        inflatedUrls: urls,
        rtcCalloutResponses,
        calloutCount,
        expectedCalloutUrls: urls,
        expectedRtcArray,
        failXhr: true,
      });
    });
    for (const consentState in CONSENT_POLICY_STATE) {
      it(`should handle consentState ${consentState}`, () => {
        setRtcConfig({urls: ['https://foo.com']});
        const rtcResult = execute_(
          element,
          {},
          CONSENT_POLICY_STATE[consentState],
          /* consentString */ undefined,
          /* consentMetadata */ undefined,
          () => {}
        );
        switch (CONSENT_POLICY_STATE[consentState]) {
          case CONSENT_POLICY_STATE.SUFFICIENT:
          case CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED:
            expect(rtcResult).to.be.ok;
            return rtcResult.then(() => expect(fetchJsonStub).to.be.calledOnce);
          case CONSENT_POLICY_STATE.UNKNOWN:
          case CONSENT_POLICY_STATE.INSUFFICIENT:
            return rtcResult.then((result) => {
              expect(result).to.deep.equal([]);
              expect(fetchJsonStub).to.not.be.called;
            });
            break;
          default:
            throw new Error(`unknown consent state ${consentState}`);
        }
      });
    }
  });

  describe('#validateRtcConfig', () => {
    let validatedRtcConfig;
    afterEach(() => {
      element.removeAttribute('rtc-config');
    });

    it('should return parsed rtcConfig for valid rtcConfig', () => {
      const rtcConfig = {
        'vendors': {
          'fakeVendor': {'SLOT_ID': '1', 'PAGE_ID': '1'},
          'nonexistent-vendor': {'SLOT_ID': '1'},
          'fakeVendor2': {'SLOT_ID': '1'},
        },
        'urls': [
          'https://localhost:4443/posts?slot_id=SLOT_ID',
          'https://broken.zzzzzzz',
        ],
        'timeoutMillis': 500,
      };
      setRtcConfig(rtcConfig);
      validateRtcConfig_(element);
      expect(rtc.rtcConfig_).to.be.ok;
      expect(rtc.rtcConfig_).to.deep.equal(rtcConfig);
    });

    it('should allow timeout of 0', () => {
      const rtcConfig = {
        'vendors': {
          'fakeVendor': {'SLOT_ID': '1', 'PAGE_ID': '1'},
          'nonexistent-vendor': {'SLOT_ID': '1'},
          'fakeVendor2': {'SLOT_ID': '1'},
        },
        'urls': [
          'https://localhost:4443/posts?slot_id=SLOT_ID',
          'https://broken.zzzzzzz',
        ],
        'timeoutMillis': 0,
      };
      setRtcConfig(rtcConfig);
      validateRtcConfig_(element);
      expect(rtc.rtcConfig_).to.be.ok;
      expect(rtc.rtcConfig_).to.deep.equal(rtcConfig);
    });

    it('should not allow timeout greater than default', () => {
      const rtcConfig = {
        'vendors': {
          'fakeVendor': {'SLOT_ID': '1', 'PAGE_ID': '1'},
          'nonexistent-vendor': {'SLOT_ID': '1'},
          'fakeVendor2': {'SLOT_ID': '1'},
        },
        'urls': [
          'https://localhost:4443/posts?slot_id=SLOT_ID',
          'https://broken.zzzzzzz',
        ],
        'timeoutMillis': 1000000,
      };
      const expectedRtcConfig = {
        'vendors': {
          'fakeVendor': {'SLOT_ID': '1', 'PAGE_ID': '1'},
          'nonexistent-vendor': {'SLOT_ID': '1'},
          'fakeVendor2': {'SLOT_ID': '1'},
        },
        'urls': [
          'https://localhost:4443/posts?slot_id=SLOT_ID',
          'https://broken.zzzzzzz',
        ],
        'timeoutMillis': 1000,
      };
      setRtcConfig(rtcConfig);
      validateRtcConfig_(element);
      expect(rtc.rtcConfig_).to.be.ok;
      expect(rtc.rtcConfig_).to.deep.equal(expectedRtcConfig);
    });

    it('should return false if rtc-config not specified', () => {
      expect(validateRtcConfig_(element)).to.be.false;
    });

    // Test various misconfigurations that are missing vendors or urls.
    [
      {'timeoutMillis': 500},
      {'vendors': {}},
      {'urls': []},
      {'vendors': {}, 'urls': []},
      {'vendors': 'incorrect', 'urls': 'incorrect'},
    ].forEach((rtcConfig) => {
      it('should return false for rtcConfig missing required values', () => {
        setRtcConfig(rtcConfig);
        allowConsoleError(() => {
          dev().error('RTCTESTS', 'Error');
          validatedRtcConfig = validateRtcConfig_(element);
        });
        expect(validatedRtcConfig).to.be.false;
      });
    });

    it('should return false for bad JSON rtcConfig', () => {
      const rtcConfig = '{"urls" : ["https://google.com"]';
      element.setAttribute('rtc-config', rtcConfig);
      validatedRtcConfig = validateRtcConfig_(element);
      expect(validatedRtcConfig).to.be.false;
    });
  });

  describe('#inflateAndSendRtc_', () => {
    it('should not send RTC if macro expansion exceeds timeout', () => {
      const url = 'https://www.example.biz/?dummy=DUMMY';
      rtc.rtcConfig_ = {
        timeoutMillis: 10,
      };
      const macroDelay = 20;
      const macros = {
        DUMMY: () => {
          return Services.timerFor(env.win)
            .promise(macroDelay)
            .then(() => {
              return 'foo';
            });
        },
      };
      inflateAndSendRtc_(url, macros);
      return rtc.promiseArray_[0].then((errorResponse) => {
        expect(errorResponse.error).to.equal(
          RTC_ERROR_ENUM.MACRO_EXPAND_TIMEOUT
        );
      });
    });

    it('should not send RTC if no longer current', () => {
      const url = 'https://www.example.biz/';
      rtc.rtcConfig_ = {
        timeoutMillis: 1000,
      };
      const macros = {};
      inflateAndSendRtc_(url, macros, /* errorReportingUrl */ undefined, () => {
        throw cancellation();
      });
      return rtc.promiseArray_[0].then((errorResponse) => {
        expect(errorResponse).to.be.undefined;
      });
    });

    it('should expand globally allowed macros', async () => {
      /**
       * todo(keshavvi):
       * This test conflicts with `should resolve element dependent vars and macros` in test-linker-manager.js
       * Both save and retrieve to a cookie named `foo`. They should be isolated and the cookies should not be shared.
       * But, for some reason they are. So, for now use a cookie called bar here.
       */
      const url =
        'https://www.foo.example/?title=TITLE&src=SOURCE_URL&cid=CLIENT_ID(bar)';
      rtc.rtcConfig_ = {
        timeoutMillis: 1000,
      };
      const macros = {};
      inflateAndSendRtc_(
        url,
        macros,
        /* errorReportingUrl */ undefined,
        () => {} // checkStillCurrent
      );
      await rtc.promiseArray_[0];
      expect(fetchJsonStub).to.be.called;
      expect(fetchJsonStub).to.be.calledWithMatch(
        /https:\/\/www\.foo\.example\/\?title=[^&]*&src=[^&]*&cid=amp-\S+$/
      );
    });
  });

  describe('modifyRtcConfigForConsentStateSettings', () => {
    beforeEach(() => {
      rtc.rtcConfig_ = {
        'vendors': {
          'vendorA': {'SLOT_ID': '1', 'PAGE_ID': '1'},
          'vendorB': {'SLOT_ID': '1'},
          'vendorC': {'PAGE_ID': '1'},
        },
        'urls': [
          'https://www.rtc.com/example1',
          'https://www.other-rtc.com/example2',
        ],
        'timeoutMillis': 500,
      };
    });

    it('should not modify rtcConfig if consent state is valid', () => {
      const expectedRtcConfig = {...rtc.rtcConfig_};
      rtc.consentState_ = CONSENT_POLICY_STATE.SUFFICIENT;
      rtc.modifyRtcConfigForConsentStateSettings();
      expect(rtc.rtcConfig_).to.deep.equal(expectedRtcConfig);
    });

    it('should clear all callouts if global setting mismatched', () => {
      rtc.rtcConfig_.sendRegardlessOfConsentState = ['INSUFFICIENT'];
      const expectedRtcConfig = {...rtc.rtcConfig_};
      expectedRtcConfig.vendors = {};
      expectedRtcConfig.urls = [];
      rtc.consentState_ = CONSENT_POLICY_STATE.UNKNOWN;
      rtc.modifyRtcConfigForConsentStateSettings();
      expect(rtc.rtcConfig_).to.deep.equal(expectedRtcConfig);
    });

    it('should handle empty urls array', () => {
      rtc.consentState_ = CONSENT_POLICY_STATE.UNKNOWN;
      rtc.rtcConfig_.urls = [];
      expect(() => rtc.modifyRtcConfigForConsentStateSettings()).not.to.throw();
    });

    it('should handle empty vendors object', () => {
      rtc.consentState_ = CONSENT_POLICY_STATE.UNKNOWN;
      rtc.rtcConfig_.vendors = {};
      expect(() => rtc.modifyRtcConfigForConsentStateSettings()).not.to.throw();
    });

    it('should handle missing urls array', () => {
      rtc.consentState_ = CONSENT_POLICY_STATE.UNKNOWN;
      rtc.rtcConfig_.urls = undefined;
      expect(() => rtc.modifyRtcConfigForConsentStateSettings()).not.to.throw();
    });

    it('should handle missing vendors object', () => {
      rtc.consentState_ = CONSENT_POLICY_STATE.UNKNOWN;
      rtc.rtcConfig_.vendors = undefined;
      expect(() => rtc.modifyRtcConfigForConsentStateSettings()).not.to.throw();
    });

    it('should clear just invalid custom URLs', () => {
      rtc.rtcConfig_.vendors = {
        'vendorA': {
          'sendRegardlessOfConsentState': true,
          'macros': {'SLOT_ID': '1', 'PAGE_ID': '1'},
        },
        'vendorB': {
          'sendRegardlessOfConsentState': ['INSUFFICIENT', 'UNKNOWN'],
          'macros': {'SLOT_ID': '1'},
        },
        'vendorC': {
          'sendRegardlessOfConsentState': ['UNKNOWN'],
          'macros': {'SLOT_ID': '1'},
        },
      };
      const expectedRtcConfig = {...rtc.rtcConfig_};
      expectedRtcConfig.urls = [];
      rtc.consentState_ = CONSENT_POLICY_STATE.UNKNOWN;
      rtc.modifyRtcConfigForConsentStateSettings();
      expect(rtc.rtcConfig_).to.deep.equal(expectedRtcConfig);
    });

    it('should clear just invalid vendor callouts', () => {
      rtc.rtcConfig_.urls = [
        {
          'sendRegardlessOfConsentState': true,
          'url': 'https://www.rtc.com/example1',
        },
        {
          'sendRegardlessOfConsentState': ['INSUFFICIENT', 'UNKNOWN'],
          'url': 'https://www.other-rtc.com/example2',
        },
      ];
      const expectedRtcConfig = {...rtc.rtcConfig_};
      expectedRtcConfig.vendors = {};
      rtc.consentState_ = CONSENT_POLICY_STATE.INSUFFICIENT;
      rtc.modifyRtcConfigForConsentStateSettings();
      expect(rtc.rtcConfig_).to.deep.equal(expectedRtcConfig);
    });

    it('should not clear callouts if per-callout setting valid', () => {
      rtc.rtcConfig_.vendors = {
        'vendorA': {
          'sendRegardlessOfConsentState': true,
          'macros': {'SLOT_ID': '1', 'PAGE_ID': '1'},
        },
        'vendorB': {
          'sendRegardlessOfConsentState': ['UNKNOWN'],
          'macros': {'SLOT_ID': '1'},
        },
        'vendorC': {'SLOT_ID': '1'},
      };
      rtc.rtcConfig_.urls = [
        {
          'sendRegardlessOfConsentState': true,
          'url': 'https://www.rtc.com/example1',
        },
        'https://www.other-rtc.com/example2',
      ];
      const expectedRtcConfig = {...rtc.rtcConfig_};
      expectedRtcConfig.vendors = {
        'vendorA': {
          'sendRegardlessOfConsentState': true,
          'macros': {'SLOT_ID': '1', 'PAGE_ID': '1'},
        },
      };
      expectedRtcConfig.urls = [
        {
          'sendRegardlessOfConsentState': true,
          'url': 'https://www.rtc.com/example1',
        },
      ];
      rtc.consentState_ = CONSENT_POLICY_STATE.INSUFFICIENT;
      rtc.modifyRtcConfigForConsentStateSettings();
      expect(rtc.rtcConfig_).to.deep.equal(expectedRtcConfig);
    });

    it('should handle mix of global and individual consent settings', () => {
      rtc.rtcConfig_.vendors = {
        'vendorA': {
          'sendRegardlessOfConsentState': true,
          'macros': {'SLOT_ID': '1', 'PAGE_ID': '1'},
        },
        'vendorB': {
          'sendRegardlessOfConsentState': ['UNKNOWN'],
          'macros': {'SLOT_ID': '1'},
        },
        'vendorC': {'SLOT_ID': '1'},
      };
      rtc.rtcConfig_.urls = [
        {
          'sendRegardlessOfConsentState': true,
          'url': 'https://www.rtc.com/example1',
        },
        'https://www.other-rtc.com/example2',
      ];
      rtc.rtcConfig_.sendRegardlessOfConsentState = ['INSUFFICIENT'];
      const expectedRtcConfig = {...rtc.rtcConfig_};
      expectedRtcConfig.vendors = {
        'vendorA': {
          'sendRegardlessOfConsentState': true,
          'macros': {'SLOT_ID': '1', 'PAGE_ID': '1'},
        },
        'vendorC': {'SLOT_ID': '1'},
      };
      expectedRtcConfig.urls = [
        {
          'sendRegardlessOfConsentState': true,
          'url': 'https://www.rtc.com/example1',
        },
        'https://www.other-rtc.com/example2',
      ];
      rtc.consentState_ = CONSENT_POLICY_STATE.INSUFFICIENT;
      rtc.modifyRtcConfigForConsentStateSettings();
      expect(rtc.rtcConfig_).to.deep.equal(expectedRtcConfig);
    });

    it('should always clear RTC for a new consent state', () => {
      rtc.consentState_ = 'FAKE_NEW_CONSENT_STATE';
      const expectedRtcConfig = {...rtc.rtcConfig_};

      rtc.modifyRtcConfigForConsentStateSettings();
      expectedRtcConfig.urls = [];
      expectedRtcConfig.vendors = {};
      expect(rtc.rtcConfig_).to.deep.equal(expectedRtcConfig);
    });

    it('should not clear RTC for a null consent state', () => {
      rtc.consentState_ = null;
      const expectedRtcConfig = {...rtc.rtcConfig_};
      rtc.modifyRtcConfigForConsentStateSettings();
      expect(rtc.rtcConfig_).to.deep.equal(expectedRtcConfig);
    });
  });

  describe('sendErrorMessage', () => {
    let imageStub;
    let errorType, errorReportingUrl;
    let imageMock;

    beforeEach(() => {
      // Make sure that we always send the message, as we are using
      // the check Math.random() < reporting frequency.
      env.sandbox.stub(Math, 'random').returns(0);
      env.sandbox.stub(Xhr.prototype, 'fetch');
      imageMock = {};
      imageStub = env.sandbox.stub(env.win, 'Image').returns(imageMock);
      errorType = RTC_ERROR_ENUM.TIMEOUT;
      errorReportingUrl = 'https://www.example.test?e=ERROR_TYPE&h=HREF';
    });

    it('should send error message pingback to correct url', () => {
      sendErrorMessage(errorType, errorReportingUrl);
      expect(imageStub).to.be.calledOnce;
      const href = encodeURIComponent(env.win.location.href);
      expect(imageMock.src).to.equal(
        `https://www.example.test?e=${errorType}&h=${href}`
      );
    });
  });
});
