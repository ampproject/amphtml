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
import * as sinon from 'sinon';
import {
  AmpA4A,
  RENDERING_TYPE_HEADER,
  XORIGIN_MODE,
} from '../../../amp-a4a/0.1/amp-a4a';
import {
  AmpAdNetworkDoubleclickImpl,
  TFCD,
  constructSRABlockParameters,
  getNetworkId,
  resetSraStateForTesting,
} from '../amp-ad-network-doubleclick-impl';
import {BaseElement} from '../../../../src/base-element';
import {
  EXPERIMENT_ATTRIBUTE,
} from '../../../../ads/google/a4a/utils';
import {FetchResponseHeaders, Xhr} from '../../../../src/service/xhr-impl';
import {
  MANUAL_EXPERIMENT_ID,
} from '../../../../ads/google/a4a/traffic-experiments';
import {createElementWithAttributes} from '../../../../src/dom';
import {dev} from '../../../../src/log';
import {layoutRectLtwh} from '../../../../src/layout-rect';
import {utf8Encode} from '../../../../src/utils/bytes';

const config = {amp: true, allowExternalResources: true};

/**
  Need to set allowExternalResources to true, because otherwise when the iframes
  for testing are created, their underlying resources are not actually loaded,
  and most importantly for iframes their srcdoc gets set, which breaks
  calling setAttribute('src', 'foo') on the iframe, which will cause all these
  tests to fail.
*/
describes.realWin('amp-ad-network-doubleclick-impl', config , env => {
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
        doc, opt_type || 'amp-ad',
        Object.assign(
            {type: 'doubleclick', height: 320, width: 50}, opt_attributes));
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
          {name: 'amp-ad-doubleclick-sra'}, 'meta', doc.head);
      const element = createAndAppendAdElement({'data-enable-refresh': 30});
      const impl = new AmpAdNetworkDoubleclickImpl(element);
      expect(impl.useSra).to.be.true;
      impl.layoutCallback();
      expect(impl.refreshManager_).to.be.null;
    });
  });

  describe('#SRA AMP creative unlayoutCallback', () => {
    let impl;

    beforeEach(() => {
      const element = createAndAppendAdElement(
          {'data-a4a-upgrade-type': 'amp-ad-network-doubleclick-impl'});
      // Testing competitive exclusion when we have an AMP ad and a non-AMP ad
      // on the same page. Need to add the child frame of the element to stand
      // in as the non-AMP ad.
      createAndAppendAdElement(
          {
            src: 'https://foo.com',
            height: 320,
            width: 50,
          }, 'iframe', element);
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
    [true, false].forEach(force => {
      it(`should combine for SRA request, forceSafeframe ${force}`, () => {
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
          'data-force-safeframe': force ? '1' : '0',
        };
        const element1 =
          createElementWithAttributes(doc, 'amp-ad', config1);
        const impl1 = new AmpAdNetworkDoubleclickImpl(element1);
        element1.setAttribute(EXPERIMENT_ATTRIBUTE, MANUAL_EXPERIMENT_ID);
        sandbox.stub(impl1, 'generateAdKey_').withArgs('50x320')
            .returns('13579');
        impl1.populateAdUrlState();
        impl1.identityToken =
          /**@type {!../../../ads/google/a4a/utils.IdentityToken}*/({
            token: 'abcdef', jar: 'some_jar', pucrd: 'some_pucrd',
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
        };
        const element2 =
          createElementWithAttributes(doc, 'amp-ad', config2);
        const impl2 = new AmpAdNetworkDoubleclickImpl(element2);
        sandbox.stub(impl2, 'generateAdKey_').withArgs('250x300')
            .returns('2468');
        element2.setAttribute(EXPERIMENT_ATTRIBUTE, MANUAL_EXPERIMENT_ID);
        impl2.populateAdUrlState();
        const exp = {
          'iu_parts': '1234,abc,def,xyz',
          'enc_prev_ius': '0/1/2,0/2/3',
          adks: '13579,2468',
          'prev_iu_szs': '50x320,250x300',
          'prev_scp':
            'foo=bar&names=x,y,z&excl_cat=sports|hello=world&excl_cat=food',
          co: '1',
          adtest: 'on',
          tfcd: 'some_tfcd',
          eid: MANUAL_EXPERIMENT_ID,
          output: 'ldjh',
          impl: 'fifs',
          adsid: 'abcdef',
          jar: 'some_jar',
          pucrd: 'some_pucrd',
        };
        if (force) {
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
      validInstances, networkId, responses, opt_xhrFail, opt_allInvalid) {
      dev().assert(validInstances.length > 1);
      dev().assert(!(opt_xhrFail && opt_allInvalid));
      // Start with nameframe method, SRA will override to use safeframe.
      const headers = {};
      headers[RENDERING_TYPE_HEADER] = XORIGIN_MODE.NAMEFRAME;
      // Assume all implementations have same data slot.
      const iuParts = encodeURIComponent(
          validInstances[0].element.getAttribute('data-slot').split(/\//)
              .splice(1).join());
      sandbox.stub(validInstances[0], 'getLocationQueryParameterValue')
          .withArgs('google_preview').returns('abcdef');
      const xhrWithArgs = xhrMock.withArgs(
          sinon.match(new RegExp(
              '^https:\/\/securepubads\\.g\\.doubleclick\\.net' +
              '\/gampad\/ads\\?output=ldjh&impl=fifs&iu_parts=' +
              `${iuParts}&enc_prev_ius=.*&gct=abcdef`)),
          {
            mode: 'cors',
            method: 'GET',
            credentials: 'include',
          });
      if (opt_xhrFail) {
        xhrWithArgs.returns(Promise.reject(
            new TypeError('some random network error')));
      } else if (opt_allInvalid) {
        xhrWithArgs.throws(new Error('invalid should not make xhr!'));
      } else {
        xhrWithArgs.returns(Promise.resolve({
          arrayBuffer: () => { throw new Error('Expected SRA!'); },
          bodyUsed: false,
          text: () => {
            let slotDataString = '';
            responses.forEach(slot => {
              slotDataString +=
                `${JSON.stringify(slot.headers)}\n${slot.creative}\n`;
            });
            return Promise.resolve(slotDataString);
          },
          headers: new FetchResponseHeaders({
            getResponseHeader(name) {
              return headers[name];
            },
          }),
        }));
      }
    }

    function generateNonSraXhrMockCall(impl, creative) {
      // Start with nameframe method, SRA will override to use safeframe.
      const headers = {};
      headers[RENDERING_TYPE_HEADER] = XORIGIN_MODE.NAMEFRAME;
      const iu = encodeURIComponent(impl.element.getAttribute('data-slot'));
      const urlRegexp = new RegExp(
          '^https:\/\/securepubads\\.g\\.doubleclick\\.net' +
        `\/gampad\/ads\\?iu=${iu}&`);
      xhrMock.withArgs(
          sinon.match(urlRegexp),
          {
            mode: 'cors',
            method: 'GET',
            credentials: 'include',
          }).returns(Promise.resolve({
        arrayBuffer: () => Promise.resolve(utf8Encode(creative)),
        bodyUsed: false,
        headers: new FetchResponseHeaders({
          getResponseHeader(name) {
            return headers[name];
          },
        }),
        text: () => {
          throw new Error('should not be SRA!');
        },
      }));
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
     *    xhrFail:boolean|undefined,
     *    invalidInstances:number}}>} items
     */
    function executeTest(items) {
      // Store if XHR will fail by networkId.
      const networkXhrFailure = {};
      // Store if all elements for a given network are invalid.
      const networkValidity = {};
      const doubleclickInstances = [];
      const attemptCollapseSpy =
        sandbox.spy(BaseElement.prototype, 'attemptCollapse');
      let expectedAttemptCollapseCalls = 0;
      items.forEach(network => {
        if (typeof network == 'number') {
          network = {networkId: network, instances: 1};
        }
        dev().assert(network.instances || network.invalidInstances);
        const createInstances = (instanceCount, invalid) => {
          for (let i = 0; i < instanceCount; i++) {
            const impl = createA4aSraInstance(network.networkId);
            doubleclickInstances.push(impl);
            sandbox.stub(impl, 'isValidElement').returns(!invalid);
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
        expectedAttemptCollapseCalls += network.xhrFail ? network.instances : 0;
      });
      const grouping = {};
      const groupingPromises = {};
      doubleclickInstances.forEach(impl => {
        const networkId = getNetworkId(impl.element);
        (grouping[networkId] || (grouping[networkId] = []))
            .push(impl);
        (groupingPromises[networkId] || (groupingPromises[networkId] = []))
            .push(Promise.resolve(impl));
      });
      sandbox.stub(AmpAdNetworkDoubleclickImpl.prototype, 'groupSlotsForSra')
          .returns(Promise.resolve(groupingPromises));
      let idx = 0;
      const layoutCallbacks = [];
      const getLayoutCallback = (impl, creative, isSra, noRender) => {
        impl.buildCallback();
        impl.onLayoutMeasure();
        return impl.layoutCallback().then(() => {
          if (noRender) {
            expect(impl.iframe).to.not.be.ok;
            return;
          }
          expect(impl.iframe).to.be.ok;
          const name = impl.iframe.getAttribute('name');
          if (isSra) {
            // Expect safeframe.
            expect(name).to.match(
                new RegExp(`^\\d+-\\d+-\\d+;\\d+;${creative}`));
          } else {
            // Expect nameframe render.
            expect(JSON.parse(name).creative).to.equal(creative);
          }
        });
      };
      Object.keys(grouping).forEach(networkId => {
        const validInstances = grouping[networkId].filter(impl =>
          impl.element.getAttribute('data-test-invalid') != 'true');
        const isSra = validInstances.length > 1;
        const sraResponses = [];
        validInstances.forEach(impl => {
          const creative = `slot${idx++}`;
          if (isSra) {
            sraResponses.push({creative, headers: {slot: idx}});
          } else {
            generateNonSraXhrMockCall(impl, creative);
          }
          layoutCallbacks.push(getLayoutCallback(
              impl, creative, isSra,
              networkXhrFailure[networkId] ||
            impl.element.getAttribute('data-test-invalid') == 'true'));
        });
        if (isSra) {
          generateSraXhrMockCall(validInstances, networkId, sraResponses,
              networkXhrFailure[networkId], networkValidity[networkId]);
        }
      });
      return Promise.all(layoutCallbacks).then(() => expect(
          attemptCollapseSpy.callCount).to.equal(expectedAttemptCollapseCalls));
    }

    beforeEach(() => {
      xhrMock = sandbox.stub(Xhr.prototype, 'fetch');
      const xhrMockJson = sandbox.stub(Xhr.prototype, 'fetchJson');
      sandbox.stub(AmpA4A.prototype,
          'getSigningServiceNames').returns(['google']);
      xhrMockJson.withArgs(
          'https://cdn.ampproject.org/amp-ad-verifying-keyset.json',
          {
            mode: 'cors',
            method: 'GET',
            ampCors: false,
            credentials: 'omit',
          }).returns(
          Promise.resolve({keys: []}));
    });

    afterEach(() => {
      resetSraStateForTesting();
    });

    it('should not use SRA if single slot', () => executeTest([1234]));

    it('should not use SRA if single slot, multiple networks',
        () => executeTest([1234, 4567]));

    it('should correctly use SRA for multiple slots',
        () => executeTest([1234, 1234]));

    it('should not send SRA request if slots are invalid',
        () => executeTest([{networkId: 1234, invalidInstances: 2}]));

    it('should send SRA request if more than 1 slot is valid', () =>
      executeTest([{networkId: 1234, instances: 2, invalidInstances: 2}]));

    it('should not send SRA request if only 1 slot is valid', () =>
      executeTest([{networkId: 1234, instances: 1, invalidInstances: 2}]));

    it('should handle xhr failure by not sending subsequent request',
        () => executeTest([{networkId: 1234, instances: 2, xhrFail: true}]));

    it('should handle mixture of xhr and non xhr failures', () => executeTest(
        [{networkId: 1234, instances: 2, xhrFail: true}, 4567, 4567]));

    it('should correctly use SRA for multiple slots. multiple networks',
        () => executeTest([1234, 4567, 1234, 4567]));

    it('should handle mixture of all possible scenarios', () => executeTest(
        [1234, 1234, 101, {networkId: 4567, instances: 2, xhrFail: true}, 202,
          {networkId: 8901, instances: 3, invalidInstances: 1}]));
  });

});
