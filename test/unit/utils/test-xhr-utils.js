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
  getViewerAuthTokenIfAvailable,
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
        verifyAmpCORSHeaders(win, response, /* init */ {});
      }).to.not.throw;
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
    let ampDocSingle = null;
    let doc;
    let init = {};
    let input = '';
    let viewer;
    let viewerForDoc;
    let win = {};
    beforeEach(() => {
      viewer = {
        hasCapability: unusedParam => false,
        whenFirstVisible: () => Promise.resolve(),
        sendMessageAwaitResponse: sandbox.stub(),
      };
      doc = document.createElement('html');
      doc.setAttribute('allow-xhr-interception', 'true');
      ampDocSingle = {
        getRootNode: () => {
          return {documentElement: doc};
        },
      };
      viewerForDoc = sandbox.stub(Services, 'viewerForDoc').returns(viewer);
    });

    it('should be no-op if amp doc is absent', () => {
      ampDocSingle = null;
      return getViewerInterceptResponse(win, ampDocSingle, input, init)
          .then(() => {
            expect(viewerForDoc).to.not.have.been.called;
          });
    });

    it('should be no-op if amp doc does not support xhr interception', () => {
      doc.removeAttribute('allow-xhr-interception');
      input = 'https://www.googz.org';
      return getViewerInterceptResponse(win, ampDocSingle, input, init)
          .then(() => {
            expect(viewer.sendMessageAwaitResponse).to.not.have.been.called;
          });
    });

    it('should send xhr request to viewer', () => {
      win = {AMP_MODE: {development: false}};
      viewer.hasCapability = () => true;
      viewer.isTrustedViewer = () => Promise.resolve(true);
      input = 'https://www.googz.org';
      init = {body: {}};
      viewer.sendMessageAwaitResponse.returns(Promise.resolve({}));
      return getViewerInterceptResponse(win, ampDocSingle, input, init)
          .then(() => {
            const msgPayload = dict({
              'originalRequest': {
                'input': 'https://www.googz.org',
                'init': {
                  'body': {},
                },
              },
            });
            expect(viewer.sendMessageAwaitResponse).to.have.been.calledOnce;
            expect(viewer.sendMessageAwaitResponse)
                .to.have.been.calledWith('xhr', msgPayload);
          });
    });
  });

  describe('getViewerAuthTokenIfAvailable', () => {
    it('should return undefined if crossorigin attr is not present', () => {
      const el = document.createElement('html');
      return getViewerAuthTokenIfAvailable(el)
          .then(token => {
            expect(token).to.equal(undefined);
          });
    });

    it('should return undefined if crossorigin attr does not contain ' +
       'exactly "amp-viewer-auth-token-post"', () => {
      const el = document.createElement('html');
      el.setAttribute('crossorigin', '');
      return getViewerAuthTokenIfAvailable(el)
          .then(token => {
            expect(token).to.be.undefined;
          });
    });

    it('should return an auth token if one is present', () => {
      sandbox.stub(Services, 'viewerAssistanceForDocOrNull').returns(
          Promise.resolve({
            getIdTokenPromise: (() => Promise.resolve('idToken')),
          }));
      const el = document.createElement('html');
      el.setAttribute('crossorigin', 'amp-viewer-auth-token-via-post');
      return getViewerAuthTokenIfAvailable(el)
          .then(token => {
            expect(token).to.equal('idToken');
          });
    });

    it('should return an empty auth token if there is not one present', () => {
      sandbox.stub(Services, 'viewerAssistanceForDocOrNull').returns(
          Promise.resolve({
            getIdTokenPromise: (() => Promise.resolve(undefined)),
          }));
      const el = document.createElement('html');
      el.setAttribute('crossorigin', 'amp-viewer-auth-token-via-post');
      return getViewerAuthTokenIfAvailable(el)
          .then(token => {
            expect(token).to.equal('');
          });
    });

    it('should return an empty auth token if there is an issue retrieving ' +
        'the identity token', () => {
      sandbox.stub(Services, 'viewerAssistanceForDocOrNull').returns(
          Promise.reject({
            getIdTokenPromise: (() => Promise.reject()),
          }));
      const el = document.createElement('html');
      el.setAttribute('crossorigin', 'amp-viewer-auth-token-via-post');
      return getViewerAuthTokenIfAvailable(el)
          .then(token => {
            expect(token).to.equal('');
          });
    });

    it('should assert that amp-viewer-assistance extension is present', () => {
      sandbox.stub(Services, 'viewerAssistanceForDocOrNull').returns(
          Promise.resolve());
      const el = document.createElement('html');
      el.setAttribute('crossorigin', 'amp-viewer-auth-token-via-post');
      expectAsyncConsoleError(
          'crossorigin="amp-viewer-auth-token-post" ' +
          'requires amp-viewer-assistance extension.', 1);
      return getViewerAuthTokenIfAvailable(el)
          .then(undefined,
              e => expect(e).to.not.be.undefined);
    });
  });
});
