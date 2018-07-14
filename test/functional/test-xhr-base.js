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

import {FetchResponse, fetchPolyfill} from '../../src/service/xhr-impl';
import {Services} from '../../src/services';
import {assertSuccess, setupInit, XhrBase} from '../../src/xhr-base';
import { getCorsUrl, getSourceOrigin } from '../../src/url';


describes.realWin('XhrBase', {amp: true}, function() {
  let ampdocServiceForStub;
  let ampdocViewerStub;
  let xhrCreated;
  // Given XHR calls give tests more time.
  this.timeout(5000);

  beforeEach(() => {
    ampdocServiceForStub = sandbox.stub(Services, 'ampdocServiceFor');
    ampdocViewerStub = sandbox.stub(Services, 'viewerForDoc');
    ampdocViewerStub.returns({
      whenFirstVisible: () => Promise.resolve(),
    });
    ampdocServiceForStub.returns({
      isSingleDoc: () => false,
      getAmpDoc: () => ampdocViewerStub,
    });
  });

  function setupMockXhr() {
    const mockXhr = sandbox.useFakeXMLHttpRequest();
    xhrCreated = new Promise(resolve => mockXhr.onCreate = resolve);
  }

  const nativeWin = {
    location,
    fetch: window.fetch,
  };

  const polyfillWin = {
    location,
    fetch: fetchPolyfill,
  };

  const scenarios = [
    {
      win: nativeWin,
      desc: 'Native',
    }, {
      win: polyfillWin, // TODO(prateek): update this ref to fetch-polyfill when implemented.
      desc: 'Polyfill',
    },
  ];

  scenarios.forEach(test => {
    beforeEach(() => {
    });
    describe('assertSuccess', () => {
      function createResponseInstance(body, init) {
        if (test.desc == 'Native' && 'Response' in Window) {
          return new Response(body, init);
        } else {
          init.responseText = body;
          return new FetchResponse(init);
        }
      }
      const mockXhr = {
        status: 200,
        headers: {
          'Content-Type': 'plain/text',
        },
        getResponseHeader: () => '',
      };

      it('should resolve if success', () => {
        mockXhr.status = 200;
        return assertSuccess(createResponseInstance('', mockXhr))
            .then(response => {
              expect(response.status).to.equal(200);
            }).should.not.be.rejected;
      });

      it('should reject if error', () => {
        mockXhr.status = 500;
        return assertSuccess(createResponseInstance('', mockXhr))
            .should.be.rejected;
      });

      it('should include response in error', () => {
        mockXhr.status = 500;
        return assertSuccess(createResponseInstance('', mockXhr))
            .catch(error => {
              expect(error.response).to.exist;
              expect(error.response.status).to.equal(500);
            });
      });

      it('should not resolve after rejecting promise', () => {
        mockXhr.status = 500;
        mockXhr.responseText = '{"a": "hello"}';
        mockXhr.headers['Content-Type'] = 'application/json';
        mockXhr.getResponseHeader = () => 'application/json';
        return assertSuccess(createResponseInstance('{"a": 2}', mockXhr))
            .should.not.be.fulfilled;
      });

      it('should mark 415 as retriable', () => {
        mockXhr.status = 415;
        return assertSuccess(createResponseInstance('', mockXhr))
            .catch(e => {
              expect(e.retriable).to.be.equals(true);
            });
      });
      it('should mark 500 as retriable', () => {
        mockXhr.status = 500;
        return assertSuccess(createResponseInstance('', mockXhr))
            .catch(e => {
              expect(e.retriable).to.be.equals(true);
            });
      });
      it('should not mark 400 as retriable', () => {
        mockXhr.status = 400;
        return assertSuccess(createResponseInstance('', mockXhr))
            .catch(e => {
              expect(e.retriable).to.be.equals(false);
            });
      });
    });
    describe('setupInit', () => {
      it('should normalize method names for get/post', () => {
        expect(setupInit({
          method: 'get',
        }).method).to.equals('GET');
        expect(setupInit({
          method: 'post',
        }).method).to.equals('POST');
        expect(setupInit({}).method).to.equals('GET');
        expect(setupInit({},'text/html').headers['Accept'])
            .to.equals('text/html');
      });
    });
  });
  describe('fetchAmpCors_', () => {
    let xhrBase;
    let fetchStub;
    beforeEach(() => {
      xhrBase = new XhrBase(window);
      fetchStub = sandbox.stub(xhrBase, 'fetchFromNetwork_').callsFake(
          () => Promise.resolve(new Response('ok', {
            headers: {
              'AMP-Access-Control-Allow-Source-Origin':
                getSourceOrigin(window.location.href),
            },
          })));
    });
    it('should modify url to AMPCors url if ampCors!=false', () => {
      const promise = xhrBase.fetchAmpCors_('/', {});
      expect(fetchStub).to.be.calledOnce;
      expect(fetchStub.getCall(0).args[0]).to.be.equal(getCorsUrl(window, '/'));
      return promise;
    });
    it('should not modify url to AMPCors url if ampCors==false', () => {
      const promise = xhrBase.fetchAmpCors_('/', {
        ampCors: false,
      });
      expect(fetchStub).to.be.calledOnce;
      expect(fetchStub.getCall(0).args[0]).to.be.equal('/');
      return promise;
    });
    it('should add AMP-Same-Origin header if target'
      + ' and current origin are same', () => {
      const promise = xhrBase.fetchAmpCors_('/', {});
      expect(fetchStub).to.be.calledOnce;
      expect(fetchStub.getCall(0).args[1].headers).to.not.be.null;
      expect(fetchStub.getCall(0).args[1].headers['AMP-Same-Origin'])
          .to.be.equal('true');
      return promise;
    });
    it('should check for ALLOW_SOURCE_ORIGIN_HEADER if required', () => {
      fetchStub.restore();
      fetchStub = sandbox.stub(xhrBase, 'fetchFromNetwork_').callsFake(
          () => Promise.resolve(new Response('ok', {
            headers: {},
          })));
      expect(xhrBase.fetchAmpCors_('/', {})).to.be.rejectedWith(/Response must contain the AMP-Access-Control-Allow-Source-Origin header​​​/);
    });
  });
});
