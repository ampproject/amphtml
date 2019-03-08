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

import * as mode from '../../../src/mode';
import * as url from '../../../src/url';
import {
  ALLOW_SOURCE_ORIGIN_HEADER,
  getViewerInterceptResponse,
  setupAMPCors,
  setupInit,
  verifyAmpCORSHeaders,
} from '../../../src/utils/xhr-utils';
import {Services} from '../../../src/services';

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
      allowConsoleError(() => {
        expect(() => {
          verifyAmpCORSHeaders(win, response, {} /* init */);})
            .to.throw('Returned AMP-Access-Control-Allow-Source-Origin '
                + 'is not equal to the current: https://www.original.org vs '
                + 'https://www.da-original.org');
      });
    });
  });

  describe('setupAMPCors', () => {
    let getWinOrigin;
    let parseUrlDeprecated;

    beforeEach(() => {
      getWinOrigin = sandbox.stub(url, 'getWinOrigin');
      parseUrlDeprecated = sandbox.stub(url, 'parseUrlDeprecated');
    });

    describe('requireAmpResponseSourceOrigin', () => {
      it('should be false if ampCors is false', () => {
        getWinOrigin.returns('http://www.origin.org');
        parseUrlDeprecated.returns({origin: 'http://www.origin.org'});
        const fetchInitDef = setupAMPCors({}, 'http://www.origin.org', {ampCors: false});
        expect(fetchInitDef.requireAmpResponseSourceOrigin).to.equal(false);
      });

      it('should be set if not defined', () => {
        getWinOrigin.returns('http://www.origin.org');
        parseUrlDeprecated.returns({origin: 'http://www.origin.org'});
        const fetchInitDef = setupAMPCors({}, 'http://www.origin.org', {});
        expect(fetchInitDef.requireAmpResponseSourceOrigin).to.equal(true);
      });
    });

    it('should set AMP-Same-Origin header', () => {
      getWinOrigin.returns('http://www.origin.org');
      parseUrlDeprecated.returns({origin: 'http://www.origin.org'});
      const fetchInitDef = setupAMPCors({}, 'http://www.origin.org', {});
      expect(fetchInitDef['headers']['AMP-Same-Origin']).to.equal('true');
    });

    it('should not set AMP-Same-Origin header', () => {
      getWinOrigin.returns('http://www.origin.org');
      parseUrlDeprecated.returns({origin: 'http://www.different.org'});
      const fetchInitDef = setupAMPCors({}, 'http://www.origin.org', {headers: {}});
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

  describe('getViewerInterceptResponse', () => {
    let viewerForDoc;
    beforeEach(() => {
      viewerForDoc = sandbox.stub(Services, 'viewerForDoc');
    });

    it('should be no opt if amp doc is absent', () => {
      return getViewerInterceptResponse({}, null, '', {}).then(() => {
        expect(viewerForDoc).to.not.have.been.called;
      });
    });

    it('should be no opt if amp doc does not support xhr interception', () => {
      const viewer = {
        hasCapability: unusedParam => false,
        whenFirstVisible: () => Promise.resolve(),
        sendMessageAwaitResponse: sandbox.stub(),
      };
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
      sandbox.stub(mode, 'getMode').returns({development: false});
      const viewer = {
        hasCapability: unusedParam => true,
        whenFirstVisible: () => Promise.resolve(),
        sendMessageAwaitResponse: sandbox.stub(),
        isTrustedViewer: () => Promise.resolve(true),
      };
      viewerForDoc.returns(viewer);
      const doc = document.createElement('html');
      doc.setAttribute('allow-xhr-interception', 'true');
      const ampDoc = {
        getRootNode: () => {
          return {documentElement: doc};
        },
      };
      viewer.sendMessageAwaitResponse.returns(Promise.resolve({}));
      return getViewerInterceptResponse({}, ampDoc, 'https://www.googz.org', {body: {}})
          .then(() => {
            expect(viewer.sendMessageAwaitResponse).to.have.been.called;
          });
    });
  });

});
