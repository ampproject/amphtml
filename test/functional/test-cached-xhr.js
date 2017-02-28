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

import * as sinon from 'sinon';
import {
  fetchPolyfill,
  FetchResponse,
} from '../../src/service/xhr-impl';
import {installCachedXhrService} from '../../src/service/cached-xhr-impl';

describe('XHR', function() {
  let sandbox;
  const location = {href: 'https://acme.com/path'};

  function getPolyfillWin() {
    return {
      location,
      fetch: fetchPolyfill,
    };
  }

  // Since if it's the Native fetch, it won't use the XHR object so
  // mocking and testing the request becomes not doable.
  const xhr = installCachedXhrService(getPolyfillWin());

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    location.href = 'https://acme.com/path';
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#XHR', () => {

    it('should fetch GET requests with fragments once ' +
        'for identical URLs', () => {
      const TEST_RESPONSE = JSON.stringify({a: {b: [{c: 2}, {d: 4}]}});
      const mockXhr = {
        status: 200,
        responseText: TEST_RESPONSE,
        responseType: 'json',
      };
      const fetchStub = sandbox.stub(xhr, 'fetchAmpCors_',
          () => Promise.resolve(new FetchResponse(mockXhr)));

      return Promise.all([
        xhr.fetchJson('/get?k=v1#a.b[0].c').then(json => {
          expect(json).to.equal(2);
        }),
        xhr.fetchJson('/get?k=v1#a.b[1].d').then(json => {
          expect(json).to.equal(4);
        }),
      ]).then(() => {
        expect(fetchStub.calledOnce).to.be.true;
      });
    });

    it('should reject for paths that do not exist', () => {
      return xhr.fetchJson('/get?k=v1#a.b[0].c.y').then(() => {
        throw new Error('Expected fetch to fail!');
      }, err => {
        expect(err).to.be.an('error');
        expect(err.message).to.contain('a.b[0].c.y');
      });
    });
  });
});
