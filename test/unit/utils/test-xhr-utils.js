/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
  ALLOW_SOURCE_ORIGIN_HEADER,
  getViewerInterceptResponse,
  setupAMPCors,
  setupInit,
  setupJsonFetchInit,
  verifyAmpCORSHeaders,
} from '../../../src/utils/xhr-utils';
import {Services} from '../../../src/services';
import {dict} from '../../../src/utils/object';

describes.sandboxed('utils/xhr-utils', {}, env => {

  let sandbox;

  beforeEach(() => {
    sandbox = env.sandbox;
  });

  describe('verifyAmpCORSHeaders', () => {
    it('should verify allowed source origin', () => {
      const sourceOrigin = 'https://www.da-original.org';
      const headers = {};
      headers[ALLOW_SOURCE_ORIGIN_HEADER] = sourceOrigin;
      const response = new Response({}, {headers: new Headers(headers)});
      const win = {
        location: {
          href: sourceOrigin,
        },
      };
      expect(() => {
        verifyAmpCORSHeaders(win, response, {} /* init */);}).to.not.throw;
    });

    it('should throw error if invalid origin', () => {
      const sourceOrigin = 'https://www.da-original.org';
      const headers = {};
      headers[ALLOW_SOURCE_ORIGIN_HEADER] = 'https://www.original.org';
      const response = new Response({}, {headers: new Headers(headers)});
      const win = {
        location: {
          href: sourceOrigin,
        },
      };
      expect(() => {
        verifyAmpCORSHeaders(win, response, {} /* init */);})
          .to.throw('Returned AMP-Access-Control-Allow-Source-Origin '
              + 'is not equal to the current: https://www.original.org vs '
              + 'https://www.da-original.org');
    });
  });

  describe('setupAMPCors', () => {
    describe('requireAmpResponseSourceOrigin', () => {
      it('should be false if ampCors is false', () => {
        const fetchInitDef = setupAMPCors(
            {origin: 'http://www.origin.org'}, 'http://www.origin.org', {ampCors: false});
        expect(fetchInitDef.requireAmpResponseSourceOrigin).to.equal(false);
      });

      it('should be set if not defined', () => {
        const fetchInitDef = setupAMPCors(
            {origin: 'http://www.origin.org'}, 'http://www.origin.org', {});
        expect(fetchInitDef.requireAmpResponseSourceOrigin).to.equal(true);
      });
    });

    it('should set AMP-Same-Origin header', () => {
      // Given a same origin request.
      const fetchInitDef = setupAMPCors(
          {origin: 'http://www.origin.org'}, 'http://www.origin.org', {});
      // Expect proper header to be set.
      expect(fetchInitDef['headers']['AMP-Same-Origin']).to.equal('true');
    });

    it('should not set AMP-Same-Origin header', () => {
      // If not a same origin request.
      const fetchInitDef = setupAMPCors(
          {origin: 'http://www.originz.org'}, 'http://www.origin.org', {headers: {}});
      expect(fetchInitDef['headers']['AMP-Same-Origin']).to.be.undefined;
    });
  });

  describe('setupInit', () => {
    it('should set up init', () => {
      const init = setupInit();
      expect(init).to.deep.equal({method: 'GET', headers: {}});
    });

    it('should set up init with Accept header value', () => {
      const init = setupInit(undefined, 'text/html');
      expect(init['headers']['Accept']).to.equal('text/html');
    });

    it('should handle null credentials', () => {
      allowConsoleError(() => { expect(() => {
        setupInit({credentials: null}, 'text/html');
      }).to.throw(/Only credentials=include\|omit support: null/); });
    });
  });

  describe('setupJsonFetchInit', () => {
    it('set proper properties', () => {
      expect(setupJsonFetchInit({body: {}})).to.deep.equal({
        headers: {
          'Accept': 'application/json',
        },
        body: {},
        method: 'GET',
      });

      expect(setupJsonFetchInit({body: {}, method: 'POST'})).to.deep.equal({
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: '{}',
        method: 'POST',
      });
    });
  });

  describe('getViewerInterceptResponse', () => {
    let viewer;
    let viewerForDoc;
    beforeEach(() => {
      viewer = {
        hasCapability: unusedParam => false,
        whenFirstVisible: () => Promise.resolve(),
        sendMessageAwaitResponse: sandbox.stub(),
      };
      viewerForDoc = sandbox.stub(Services, 'viewerForDoc');
    });

    it('should be no-op if amp doc is absent', () => {
      return getViewerInterceptResponse({}, null, '', {}).then(() => {
        expect(viewerForDoc).to.not.have.been.called;
      });
    });

    it('should be no-op if amp doc does not support xhr interception', () => {
      viewerForDoc.returns(viewer);
      const doc = document.createElement('html');
      const ampDoc = {
        getRootNode: () => {
          return {documentElement: doc};
        },
      };
      return getViewerInterceptResponse({}, ampDoc, 'https://www.googz.org')
          .then(() => {
            expect(viewer.sendMessageAwaitResponse).to.not.have.been.called;
          });
    });

    it('should send xhr request to viewer', () => {
      const win = {AMP_MODE: {development: false}};
      viewer = Object.assign(viewer, {
        hasCapability: unusedParam => true,
        isTrustedViewer: () => Promise.resolve(true),
      });
      viewerForDoc.returns(viewer);
      const doc = document.createElement('html');
      doc.setAttribute('allow-xhr-interception', 'true');
      const ampDoc = {
        getRootNode: () => {
          return {documentElement: doc};
        },
      };
      viewer.sendMessageAwaitResponse.returns(Promise.resolve({}));
      return getViewerInterceptResponse(
          win, ampDoc, 'https://www.googz.org', {body: {}})
          .then(() => {
            const msgPayload = dict({
              'originalRequest': {
                'input': 'https://www.googz.org',
                'init': {
                  'body': {},
                },
              },
            });
            expect(viewer.sendMessageAwaitResponse).to.have.been.called;
            expect(viewer.sendMessageAwaitResponse)
                .to.have.been.calledWith('xhr', msgPayload);
          });
    });
  });

});
