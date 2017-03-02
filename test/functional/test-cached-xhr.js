/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {cachedXhrServiceForTesting} from '../../src/service/cached-xhr-impl';


describes.realWin('CachedXhr', {}, env => {
  const location = {href: 'https://acme.com/path'};

  function getPolyfillWin() {
    return {
      location,
      fetch: fetchPolyfill,
    };
  }

  // Since if it's the Native fetch, it won't use the XHR object so
  // mocking and testing the request becomes not doable.
  const xhr = cachedXhrServiceForTesting(getPolyfillWin());

  beforeEach(() => {
    location.href = 'https://acme.com/path';
  });

  describe('#fetchJson', () => {
    it('should fetch JSON GET requests with fragments once ' +
        'for identical URLs', () => {
      const TEST_OBJECT = {a: {b: [{c: 2}, {d: 4}]}};
      const TEST_RESPONSE = JSON.stringify(TEST_OBJECT);
      const mockXhr = {
        status: 200,
        responseText: TEST_RESPONSE,
        responseType: 'json',
      };
      const fetchStub = sandbox.stub(xhr, 'fetchAmpCors_',
          () => Promise.resolve(new FetchResponse(mockXhr)));

      return Promise.all([
        xhr.fetchJson('/get?k=v1'),
        xhr.fetchJson('/get?k=v1'),
      ]).then(results => {
        expect(fetchStub.calledOnce).to.be.true;
        expect(results[0]).to.jsonEqual(TEST_OBJECT);
        expect(results[1]).to.jsonEqual(TEST_OBJECT);
      });
    });
  });

  describe('#fetchDocument', () => {
    it('should fetch document GET requests with fragments once ' +
        'for identical URLs', () => {
      const doc = env.win.document;
      const TEST_CONTENT = '<b>Hello, world';
      const TEST_RESPONSE_TEXT = '<!doctype html><html><body>' + TEST_CONTENT;
      const TEST_RESPONSE_DOC = doc.implementation.createHTMLDocument();
      TEST_RESPONSE_DOC.body.innerHTML = TEST_CONTENT;

      const mockXhr = {
        status: 200,
        responseText: TEST_RESPONSE_TEXT,
        responseXML: TEST_RESPONSE_DOC,
        responseType: 'text/html',
      };
      const fetchStub = sandbox.stub(xhr, 'fetchAmpCors_',
          () => Promise.resolve(new FetchResponse(mockXhr)));

      return Promise.all([
        xhr.fetchDocument('/get?k=v1'),
        xhr.fetchDocument('/get?k=v1'),
      ]).then(results => {
        expect(fetchStub.calledOnce).to.be.true;
        expect(results[0].isEqualNode(TEST_RESPONSE_DOC)).to.be.true;
        expect(results[1].isEqualNode(TEST_RESPONSE_DOC)).to.be.true;
      });
    });
  });

  describe('#fetchText', () => {
    it('should fetch document GET requests with fragments once ' +
        'for identical URLs', () => {
      const TEST_RESPONSE = 'Hello, world!';
      const mockXhr = {
        status: 200,
        responseText: TEST_RESPONSE,
      };
      const fetchStub = sandbox.stub(xhr, 'fetchAmpCors_',
          () => Promise.resolve(new FetchResponse(mockXhr)));

      return Promise.all([
        xhr.fetchText('/get?k=v1'),
        xhr.fetchText('/get?k=v1'),
      ]).then(results => {
        expect(fetchStub.calledOnce).to.be.true;
        expect(results[0]).to.equal(TEST_RESPONSE);
        expect(results[1]).to.equal(TEST_RESPONSE);
      });
    });
  });
});
