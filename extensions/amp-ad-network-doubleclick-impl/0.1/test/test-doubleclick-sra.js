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
import {
  AmpA4A,
  EXPERIMENT_FEATURE_HEADER_NAME,
  RENDERING_TYPE_HEADER,
  XORIGIN_MODE,
} from '../../../amp-a4a/0.1/amp-a4a';
import {
  AmpAdNetworkDoubleclickImpl,
  getNetworkId,
  resetSraStateForTesting,
} from '../amp-ad-network-doubleclick-impl';
import {BaseElement} from '../../../../src/base-element';
import {Deferred} from '../../../../src/utils/promise';
import {EXPERIMENT_ATTRIBUTE} from '../../../../ads/google/a4a/utils';
import {MANUAL_EXPERIMENT_ID} from '../../../../ads/google/a4a/traffic-experiments';
import {SignatureVerifier} from '../../../amp-a4a/0.1/signature-verifier';
import {
  TFCD,
  combineInventoryUnits,
  constructSRABlockParameters,
  getAdks,
  getContainers,
  getCookieOptOut,
  getExperimentIds,
  getForceSafeframe,
  getIdentity,
  getIsFluid,
  getPageOffsets,
  getSizes,
  getTargetingAndExclusions,
  getTfcd,
  isAdTest,
  sraBlockCallbackHandler,
} from '../sra-utils';
import {Xhr} from '../../../../src/service/xhr-impl';
import {createElementWithAttributes} from '../../../../src/dom';
import {devAssert} from '../../../../src/log';
import {layoutRectLtwh} from '../../../../src/layout-rect';
import {utf8Decode, utf8Encode} from '../../../../src/utils/bytes';

const config = {amp: true, allowExternalResources: true};

/**
  Need to set allowExternalResources to true, because otherwise when the iframes
  for testing are created, their underlying resources are not actually loaded,
  and most importantly for iframes their srcdoc gets set, which breaks
  calling setAttribute('src', 'foo') on the iframe, which will cause all these
  tests to fail.
*/
describes.realWin('Doubleclick SRA', config, env => {
  let sandbox;
  let doc;

  beforeEach(() => {
    doc = env.win.document;
    sandbox = env.sandbox;
    // ensures window location == AMP cache passes
    env.win.AMP_MODE.test = true;
  });

  function createAndAppendAdElement(opt_attributes, opt_type, opt_domElement) {
    const element = createElementWithAttributes(
      doc,
      opt_type || 'amp-ad',
      Object.assign(
        {type: 'doubleclick', height: 320, width: 50},
        opt_attributes
      )
    );
    (opt_domElement || doc.body).appendChild(element);
    return element;
  }

  describe('#SRA enabled', () => {
    it('should be disabled by default', () => {
      const element = createAndAppendAdElement();
      const impl = new AmpAdNetworkDoubleclickImpl(element);
      expect(impl.useSra).to.be.false;
    });

    // Refresh should yield to SRA when the latter is enabled. This can be
    // verified by checking that refreshManager is null on the impl after
    // layoutCallback is executed.
    it('should be enabled if meta tag present, and force refresh off', () => {
      createAndAppendAdElement(
        {name: 'amp-ad-doubleclick-sra'},
        'meta',
        doc.head
      );
      const element = createAndAppendAdElement({'data-enable-refresh': 30});
      const impl = new AmpAdNetworkDoubleclickImpl(element);
      impl.buildCallback();
      expect(impl.useSra).to.be.true;
      impl.layoutCallback();
      expect(impl.refreshManager_).to.be.null;
    });
  });

  describe('block parameter joining', () => {
    let impls;
    beforeEach(() => (impls = []));

    it('should join IUs', () => {
      for (let i = 0; i < 2; i++) {
        impls.push({
          element: {
            getAttribute: name => {
              expect(name).to.equal('data-slot');
              return '/1234/foo.com/news/world/2018/06/17/article';
            },
          },
        });
      }
      expect(combineInventoryUnits(impls)).to.jsonEqual({
        'iu_parts': '1234,foo.com,news,world,2018,06,17,article',
        'enc_prev_ius': '0/1/2/3/4/5/6/7,0/1/2/3/4/5/6/7',
      });
    });
    it('should determine cookie opt out', () => {
      expect(getCookieOptOut(impls)).to.be.null;
      impls[0] = {};
      expect(getCookieOptOut(impls)).to.be.null;
      impls[1] = {jsonTargeting: {}};
      expect(getCookieOptOut(impls)).to.be.null;
      impls[2] = {jsonTargeting: {'cookieOptOut': 1}};
      expect(getCookieOptOut(impls)).to.jsonEqual({'co': '1'});
    });
    it('should combine adks', () => {
      expect(getAdks(impls)).to.jsonEqual({'adks': ''});
      const expected = [];
      for (let i = 1; i <= 10; i++) {
        impls.push({adKey: i});
        expected.push(i);
      }
      expect(getAdks(impls)).to.jsonEqual({'adks': expected.join()});
    });
    it('should combine sizes', () => {
      expect(getSizes(impls)).to.jsonEqual({'prev_iu_szs': ''});
      const expected = [];
      for (let i = 1; i <= 10; i++) {
        impls.push({parameterSize: i});
        expected.push(i);
      }
      expect(getSizes(impls)).to.jsonEqual({'prev_iu_szs': expected.join()});
    });
    it('should determine tagForChildDirectedTreatment', () => {
      expect(getTfcd(impls)).to.be.null;
      expect(getTfcd([{}])).to.be.null;
      impls[0] = {};
      impls[1] = {jsonTargeting: {}};
      impls[2] = {jsonTargeting: {[TFCD]: 'foo'}};
      impls[3] = {jsonTargeting: {[TFCD]: 'bar'}};
      expect(getTfcd(impls)).to.jsonEqual({'tfcd': 'foo'});
    });
    it('should determine if ad test', () => {
      expect(isAdTest(impls)).to.be.null;
      impls[0] = {
        element: {
          getAttribute: name => {
            expect(name).to.equal('data-experiment-id');
            return undefined;
          },
        },
      };
      expect(isAdTest(impls)).to.be.null;
      impls[1] = {
        element: {
          getAttribute: name => {
            expect(name).to.equal('data-experiment-id');
            return '123,117152632,456';
          },
        },
      };
      expect(isAdTest(impls)).to.jsonEqual({'adtest': 'on'});
    });
    it('should combine targeting and exclusions', () => {
      expect(getTargetingAndExclusions(impls)).to.be.null;
      impls[0] = {jsonTargeting: {}};
      expect(getTargetingAndExclusions(impls)).to.be.null;
      impls[1] = {jsonTargeting: {targeting: {a: 1, b: 2}}};
      expect(getTargetingAndExclusions(impls)).to.jsonEqual({
        'prev_scp': '|a=1&b=2',
      });
      impls[2] = {
        jsonTargeting: {
          targeting: {c: 1, d: 'l=d'},
          categoryExclusions: ['a', 'b'],
        },
      };
      impls[3] = {};
      expect(getTargetingAndExclusions(impls)).to.jsonEqual({
        'prev_scp': '|a=1&b=2|c=1&d=l%3Dd&excl_cat=a,b|',
      });
    });
    it('should determine experiment ids', () => {
      expect(getExperimentIds(impls)).to.be.null;
      impls[0] = {
        win: {location: {hash: '#deid=123,456,7'}},
        experimentIds: [],
      };
      // NOTE(keithwrightbos): let's hope this doesn't flake given eids
      // are stored in object.
      expect(getExperimentIds(impls)).to.jsonEqual({'eid': '7,123,456'});
      impls[0].experimentIds = ['901', '902'];
      expect(getExperimentIds(impls)).to.jsonEqual({
        'eid': '7,123,456,901,902',
      });
      impls[1] = {experimentIds: ['902', '903']};
      expect(getExperimentIds(impls)).to.jsonEqual({
        'eid': '7,123,456,901,902,903',
      });
    });
    it('should determine identity', () => {
      impls[0] = new AmpAdNetworkDoubleclickImpl(
        env.win.document.createElement('span')
      );
      impls[0].identityToken = {token: 'foo', jar: 'bar', pucrd: 'oof'};
      impls[1] = {};
      expect(getIdentity(impls)).to.jsonEqual({
        adsid: 'foo',
        jar: 'bar',
        pucrd: 'oof',
      });
    });
    it('should combine force safeframe', () => {
      expect(getForceSafeframe(impls)).to.be.null;
      impls[0] = {forceSafeframe: false};
      expect(getForceSafeframe(impls)).to.be.null;
      impls[1] = {forceSafeframe: true};
      expect(getForceSafeframe(impls)).to.jsonEqual({'fsfs': '0,1'});
      impls[2] = {forceSafeframe: true};
      expect(getForceSafeframe(impls)).to.jsonEqual({'fsfs': '0,1,1'});
    });
    it('should combine page offsets', () => {
      impls[0] = {getPageLayoutBox: () => ({left: 123, top: 456})};
      expect(getPageOffsets(impls)).to.jsonEqual({
        'adxs': '123',
        'adys': '456',
      });
      impls[1] = {getPageLayoutBox: () => ({left: 123, top: 789})};
      expect(getPageOffsets(impls)).to.jsonEqual({
        'adxs': '123,123',
        'adys': '456,789',
      });
    });
    it('should combine contained state', () => {
      expect(getContainers(impls)).to.be.null;
      impls[0] = {element: {}};
      expect(getContainers(impls)).to.be.null;
      impls[1] = {element: {parentElement: {tagName: 'AMP-CAROUSEL'}}};
      expect(getContainers(impls)).to.jsonEqual({'acts': '|ac'});
      impls[2] = {
        element: {
          parentElement: {
            tagName: 'AMP-CAROUSEL',
            parentElement: {tagName: 'AMP-STICKY-AD'},
          },
        },
      };
      expect(getContainers(impls)).to.jsonEqual({'acts': '|ac|ac,sa'});
    });
    it('should combine fluid state', () => {
      impls[0] = {isFluidRequest: () => true};
      impls[1] = {isFluidRequest: () => false};
      impls[2] = {isFluidRequest: () => true};
      expect(getIsFluid(impls)).to.jsonEqual({'fluid': 'height,0,height'});
    });
  });

  describe('#SRA AMP creative unlayoutCallback', () => {
    let impl;

    beforeEach(() => {
      const element = createAndAppendAdElement({
        'data-a4a-upgrade-type': 'amp-ad-network-doubleclick-impl',
      });
      // Testing competitive exclusion when we have an AMP ad and a non-AMP ad
      // on the same page. Need to add the child frame of the element to stand
      // in as the non-AMP ad.
      createAndAppendAdElement(
        {
          src: 'https://foo.com',
          height: 320,
          width: 50,
        },
        'iframe',
        element
      );
      impl = new AmpAdNetworkDoubleclickImpl(element);
      impl.buildCallback();
      impl.isAmpCreative_ = true;
    });

    it('should not remove if not SRA', () => {
      expect(impl.unlayoutCallback()).to.be.false;
    });

    it('should remove if SRA and has frame', () => {
      impl.useSra = true;
      expect(impl.unlayoutCallback()).to.be.true;
    });
  });

  describe('#constructSRABlockParameters', () => {
    [true, false].forEach(forceSafeFrame => {
      it(`should combine for SRA, forceSafeframe ${forceSafeFrame}`, () => {
        const targeting1 = {
          cookieOptOut: 1,
          categoryExclusions: 'sports',
          targeting: {foo: 'bar', names: ['x', 'y', 'z']},
        };
        targeting1[TFCD] = 'some_tfcd';
        const config1 = {
          type: 'doubleclick',
          height: 320,
          width: 50,
          'data-slot': '/1234/abc/def',
          'json': JSON.stringify(targeting1),
          'data-force-safeframe': forceSafeFrame ? '1' : '0',
          'data-multi-size': '9999x9999',
        };
        const element1 = createElementWithAttributes(doc, 'amp-ad', config1);
        const impl1 = new AmpAdNetworkDoubleclickImpl(element1);
        sandbox.stub(impl1, 'getPageLayoutBox').returns({top: 123, left: 456});
        impl1.experimentIds = [MANUAL_EXPERIMENT_ID];
        sandbox
          .stub(impl1, 'generateAdKey_')
          .withArgs('50x320')
          .returns('13579');
        impl1.populateAdUrlState();
        impl1.identityToken = /**@type {!../../../ads/google/a4a/utils.IdentityToken}*/ ({
          token: 'abcdef',
          jar: 'some_jar',
          pucrd: 'some_pucrd',
        });
        const targeting2 = {
          cookieOptOut: 1,
          categoryExclusions: 'food',
          targeting: {hello: 'world'},
        };
        targeting2[TFCD] = 'some_other_tfcd';
        const config2 = {
          type: 'doubleclick',
          height: 300,
          width: 250,
          'data-slot': '/1234/def/xyz',
          'json': JSON.stringify(targeting2),
          'data-multi-size-validation': 'false',
          'data-multi-size': '1x2,3x4',
        };
        const element2 = createElementWithAttributes(doc, 'amp-ad', config2);
        const impl2 = new AmpAdNetworkDoubleclickImpl(element2);
        sandbox.stub(impl2, 'getPageLayoutBox').returns({top: 789, left: 101});
        sandbox
          .stub(impl2, 'generateAdKey_')
          .withArgs('250x300')
          .returns('2468');
        element2.setAttribute(EXPERIMENT_ATTRIBUTE, MANUAL_EXPERIMENT_ID);
        impl2.populateAdUrlState();
        const exp = {
          'iu_parts': '1234,abc,def,xyz',
          'enc_prev_ius': '0/1/2,0/2/3',
          adks: '13579,2468',
          'prev_iu_szs': '50x320,250x300|1x2|3x4',
          'prev_scp':
            'foo=bar&names=x,y,z&excl_cat=sports|hello=world&excl_cat=food',
          co: '1',
          adtest: 'on',
          adxs: '456,101',
          adys: '123,789',
          tfcd: 'some_tfcd',
          eid: MANUAL_EXPERIMENT_ID,
          output: 'ldjh',
          impl: 'fifs',
          adsid: 'abcdef',
          jar: 'some_jar',
          pucrd: 'some_pucrd',
        };
        if (forceSafeFrame) {
          exp['fsfs'] = '1,0';
        }
        expect(constructSRABlockParameters([impl1, impl2])).to.jsonEqual(exp);
      });
    });
  });

  describe('#initiateSraRequests', () => {
    let xhrMock;

    function createA4aSraInstance(networkId) {
      const element = createAndAppendAdElement({
        type: 'doubleclick',
        height: 320,
        width: 50,
        'data-slot': `/${networkId}/abc/def`,
      });
      element.getLayoutBox = () => {
        return layoutRectLtwh(0, 0, 200, 50);
      };
      const impl = new AmpAdNetworkDoubleclickImpl(element);
      impl.useSra = true;
      return impl;
    }

    function generateSraXhrMockCall(
      validInstances,
      networkId,
      responses,
      opt_xhrFail,
      opt_allInvalid
    ) {
      devAssert(validInstances.length > 1);
      devAssert(!(opt_xhrFail && opt_allInvalid));
      // Start with nameframe method, SRA will override to use safeframe.
      const headers = {};
      headers[RENDERING_TYPE_HEADER] = XORIGIN_MODE.NAMEFRAME;
      // Assume all implementations have same data slot.
      const iuParts = encodeURIComponent(
        validInstances[0].element
          .getAttribute('data-slot')
          .split(/\//)
          .splice(1)
          .join()
      );
      sandbox
        .stub(validInstances[0], 'getLocationQueryParameterValue')
        .withArgs('google_preview')
        .returns('abcdef');
      const xhrWithArgs = xhrMock.withArgs(
        sinon.match(
          new RegExp(
            '^https://securepubads\\.g\\.doubleclick\\.net' +
              '/gampad/ads\\?output=ldjh&impl=fifs&iu_parts=' +
              `${iuParts}&enc_prev_ius=.*&gct=abcdef`
          )
        ),
        {
          mode: 'cors',
          method: 'GET',
          credentials: 'include',
        }
      );
      if (opt_xhrFail) {
        xhrWithArgs.returns(
          Promise.reject(new TypeError('some random network error'))
        );
      } else if (opt_allInvalid) {
        xhrWithArgs.throws(new Error('invalid should not make xhr!'));
      } else {
        xhrWithArgs.returns(
          Promise.resolve({
            arrayBuffer: () => {
              throw new Error('Expected SRA!');
            },
            bodyUsed: false,
            text: () => {
              let slotDataString = '';
              responses.forEach(slot => {
                slotDataString += `${JSON.stringify(slot.headers)}\n${
                  slot.creative
                }\n`;
              });
              return Promise.resolve(slotDataString);
            },
            headers,
          })
        );
      }
    }

    function generateNonSraXhrMockCall(impl, creative) {
      // Start with nameframe method, SRA will override to use safeframe.
      const headers = {
        [RENDERING_TYPE_HEADER]: XORIGIN_MODE.NAMEFRAME,
        [EXPERIMENT_FEATURE_HEADER_NAME]: 'foo=bar',
      };
      const iu = encodeURIComponent(impl.element.getAttribute('data-slot'));
      const urlRegexp = new RegExp(
        '^https://securepubads\\.g\\.doubleclick\\.net' +
          `\/gampad\/ads\\?iu=${iu}&`
      );
      xhrMock
        .withArgs(sinon.match(urlRegexp), {
          mode: 'cors',
          method: 'GET',
          credentials: 'include',
        })
        .returns(
          Promise.resolve({
            arrayBuffer: () => Promise.resolve(utf8Encode(creative)),
            bodyUsed: false,
            headers: {
              get: header => headers[header],
              has: header => header in headers,
            },
            text: () => {
              throw new Error('should not be SRA!');
            },
          })
        );
    }

    /**
     * Tests SRA behavior by creating multiple doubleclick instances with the
     * following dimensions: networkId, number of instances, number of
     * invalid instances (meaning isValidElement returns false), and if SRA
     * XHR should fail.  Generates expected behaviors including XHR
     * requests, layoutCallback iframe state, and collapse.
     *
     * @param {!Array<number|{{
     *    networkId:number,
     *    instances:number,
     *    xhrFail:(boolean|undefined),
     *    invalidInstances:number,
     *    nestHeaders:(boolean|undefined),
     *    expIds:(boolean|Array<string>)}}>} items
     * @param {boolean=} opt_implicitSra where SRA implicitly enabled (meaning
     *    pub did not enable via meta).
     */
    function executeTest(items, opt_implicitSra) {
      if (!opt_implicitSra) {
        createAndAppendAdElement(
          {name: 'amp-ad-doubleclick-sra'},
          'meta',
          doc.head
        );
      }
      // Store if XHR will fail by networkId.
      const networkXhrFailure = {};
      // Store if all elements for a given network are invalid.
      const networkValidity = {};
      const doubleclickInstances = [];
      const networkNestHeaders = [];
      const attemptCollapseSpy = sandbox.spy(
        BaseElement.prototype,
        'attemptCollapse'
      );
      const expIds = [];
      let expectedAttemptCollapseCalls = 0;
      items.forEach(network => {
        if (typeof network == 'number') {
          network = {networkId: network, instances: 1};
        }
        devAssert(network.instances || network.invalidInstances);
        const createInstances = (instanceCount, invalid) => {
          for (let i = 0; i < instanceCount; i++) {
            const impl = createA4aSraInstance(network.networkId);
            doubleclickInstances.push(impl);
            sandbox.stub(impl, 'isValidElement').returns(!invalid);
            sandbox.stub(impl, 'promiseErrorHandler_');
            sandbox.stub(impl, 'warnOnError');
            if (invalid) {
              impl.element.setAttribute('data-test-invalid', 'true');
            }
          }
        };
        createInstances(network.instances);
        createInstances(network.invalidInstances, true);
        networkValidity[network.networkId] =
          network.invalidInstances && !network.instances;
        networkXhrFailure[network.networkId] = !!network.xhrFail;
        networkNestHeaders[network.networkId] = network.nestHeaders;
        expectedAttemptCollapseCalls +=
          network.xhrFail && !opt_implicitSra ? network.instances : 0;
        expIds[network.networkId] = network.expIds || [];
      });
      const grouping = {};
      const groupingPromises = {};
      doubleclickInstances.forEach(impl => {
        const networkId = getNetworkId(impl.element);
        (grouping[networkId] || (grouping[networkId] = [])).push(impl);
        (
          groupingPromises[networkId] || (groupingPromises[networkId] = [])
        ).push(Promise.resolve(impl));
      });
      sandbox
        .stub(AmpAdNetworkDoubleclickImpl.prototype, 'groupSlotsForSra')
        .returns(Promise.resolve(groupingPromises));
      let idx = 0;
      const layoutCallbacks = [];
      const getLayoutCallback = (impl, creative, isSra, noRender) => {
        impl.experimentIds.concat(expIds);
        impl.buildCallback();
        impl.onLayoutMeasure();
        return impl.layoutCallback().then(() => {
          if (noRender) {
            expect(impl.iframe).to.not.be.ok;
            return;
          }
          if (opt_implicitSra) {
            expect(impl.iframe).to.be.ok;
            expect(impl.iframe.src).to.match(
              /securepubads\.g\.doubleclick\.net/
            );
            return;
          }
          expect(impl.postAdResponseExperimentFeatures['foo']).to.equal('bar');
          expect(impl.iframe).to.be.ok;
          const name = impl.iframe.getAttribute('name');
          if (isSra) {
            // Expect safeframe.
            expect(name).to.match(
              new RegExp(`^\\d+-\\d+-\\d+;\\d+;${creative}`)
            );
          } else {
            // Expect nameframe render.
            expect(JSON.parse(name).creative).to.equal(creative);
          }
        });
      };
      Object.keys(grouping).forEach(networkId => {
        const validInstances = grouping[networkId].filter(
          impl => impl.element.getAttribute('data-test-invalid') != 'true'
        );
        const isSra =
          validInstances.length > 1 &&
          !validInstances[0].experimentIds.includes('21062235');
        const sraResponses = [];
        validInstances.forEach(impl => {
          const creative = `slot${idx++}`;
          if (isSra) {
            let headers = {
              slot: idx,
              [EXPERIMENT_FEATURE_HEADER_NAME]: 'foo=bar',
            };
            if (networkNestHeaders[networkId]) {
              headers = {'nested': headers};
            }
            sraResponses.push({creative, headers});
          } else {
            generateNonSraXhrMockCall(impl, creative);
          }
          layoutCallbacks.push(
            getLayoutCallback(
              impl,
              creative,
              isSra,
              (!opt_implicitSra && networkXhrFailure[networkId]) ||
                impl.element.getAttribute('data-test-invalid') == 'true'
            )
          );
        });
        if (isSra) {
          generateSraXhrMockCall(
            validInstances,
            networkId,
            sraResponses,
            networkXhrFailure[networkId],
            networkValidity[networkId]
          );
        }
      });
      return Promise.all(layoutCallbacks).then(() =>
        expect(attemptCollapseSpy.callCount).to.equal(
          expectedAttemptCollapseCalls
        )
      );
    }

    beforeEach(() => {
      xhrMock = sandbox.stub(Xhr.prototype, 'fetch');
      sandbox
        .stub(AmpA4A.prototype, 'getSigningServiceNames')
        .returns(['google']);
      sandbox
        .stub(SignatureVerifier.prototype, 'loadKeyset')
        .callsFake(() => {});
    });

    afterEach(() => {
      resetSraStateForTesting();
    });

    it('should not use SRA if single slot', () => executeTest([1234]));

    it('should not use SRA if single slot, multiple networks', () =>
      executeTest([1234, 4567]));

    it('should correctly use SRA for multiple slots', () =>
      executeTest([1234, 1234]));

    it('should correctly handle SRA response with nested headers', () =>
      executeTest([{networkId: 1234, instances: 2, nestHeaders: true}]));

    it('should not send SRA request if slots are invalid', () =>
      executeTest([{networkId: 1234, invalidInstances: 2}]));

    it('should send SRA request if more than 1 slot is valid', () =>
      executeTest([{networkId: 1234, instances: 2, invalidInstances: 2}]));

    it('should not send SRA request if only 1 slot is valid', () =>
      executeTest([{networkId: 1234, instances: 1, invalidInstances: 2}]));

    it('should send SRA request if only 1 slot and no recovery exp', () =>
      executeTest([{networkId: 1234, instances: 1, expIds: ['21062235']}]));

    it('should handle xhr failure by not sending subsequent request', () =>
      executeTest([{networkId: 1234, instances: 2, xhrFail: true}]));

    it('should handle xhr failure by via subsequent request if implicit', () =>
      executeTest([{networkId: 1234, instances: 2, xhrFail: true}], true));

    it('should handle mixture of xhr and non xhr failures', () =>
      executeTest([
        {networkId: 1234, instances: 2, xhrFail: true},
        4567,
        4567,
      ]));

    it('should correctly use SRA for multiple slots. multiple networks', () =>
      executeTest([1234, 4567, 1234, 4567]));

    it('should handle mixture of all possible scenarios', () =>
      executeTest([
        1234,
        1234,
        101,
        {networkId: 4567, instances: 2, xhrFail: true},
        202,
        {networkId: 8901, instances: 3, invalidInstances: 1},
      ]));
  });

  describe('#sraBlockCallbackHandler', () => {
    const creative = 'foo';
    it('should call top resolver with FetchResponse', () => {
      const headerObj = {a: 'b', c: 123};
      const slotDeferred = new Deferred();
      const sraRequestAdUrlResolvers = [
        slotDeferred.resolve,
        {
          resolve: () => {
            throw new Error();
          },
        },
      ];
      sraBlockCallbackHandler(
        creative,
        headerObj,
        /* done */ false,
        sraRequestAdUrlResolvers
      );
      expect(sraRequestAdUrlResolvers.length).to.equal(1);
      return slotDeferred.promise.then(fetchResponse => {
        expect(fetchResponse.headers.get('a')).to.equal('b');
        expect(fetchResponse.headers.get('c')).to.equal('123');
        expect(
          fetchResponse.headers.get(RENDERING_TYPE_HEADER.toLowerCase())
        ).to.equal(XORIGIN_MODE.SAFEFRAME);
        expect(fetchResponse.headers.has('unknown')).to.be.false;
        return fetchResponse
          .arrayBuffer()
          .then(buffer => expect(utf8Decode(buffer)).to.equal(creative));
      });
    });

    it('should handle multiple blocks', () => {
      const blocks = [
        {
          headers: {foo: 'bar', yes: false, who: 123},
          creative: 'creative1',
          deferred: new Deferred(),
        },
        {
          headers: {bar: 'foo', no: true, who: 456},
          creative: '2creative',
          deferred: new Deferred(),
        },
        {
          headers: {asd: 'asd', gsd: 'sdf', basd: 123},
          creative: 'crea3tive',
          deferred: new Deferred(),
        },
      ];
      const promises = [];
      const resolvers = blocks.map(block => block.deferred.resolve);
      for (let i = 1; i <= blocks.length; i++) {
        const {creative, headers, deferred} = blocks[i - 1];
        sraBlockCallbackHandler(
          creative,
          headers,
          resolvers.length == 1,
          resolvers
        );
        expect(resolvers.length).to.equal(blocks.length - i);
        promises.push(
          deferred.promise.then(fetchResponse => {
            Object.keys(headers).forEach(name =>
              expect(fetchResponse.header.get(name)).to.equal(
                String(headers[name])
              )
            );
            expect(
              fetchResponse.headers.get(RENDERING_TYPE_HEADER.toLowerCase())
            ).to.equal(XORIGIN_MODE.SAFEFRAME);
            expect(fetchResponse.headers.has('unknown')).to.be.false;
            return fetchResponse
              .arrayBuffer()
              .then(buffer => expect(utf8Decode(buffer)).to.equal(creative));
          })
        );
      }
      return promises;
    });
  });
});
