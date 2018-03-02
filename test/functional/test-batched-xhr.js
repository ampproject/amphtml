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

import {FetchResponse} from '../../src/service/xhr-impl';
import {Services} from '../../src/services';
import {batchedXhrServiceForTesting} from '../../src/service/batched-xhr-impl';

describes.sandboxed('BatchedXhr', {}, env => {
  beforeEach(() => {
    env.sandbox.stub(Services, 'ampdocServiceFor').returns({
      isSingleDoc: () => false,
    });
  });

  describes.fakeWin('#fetch', {}, env => {
    const TEST_OBJECT = {a: {b: [{c: 2}, {d: 4}]}};
    const TEST_RESPONSE = JSON.stringify(TEST_OBJECT);
    const mockXhr = {
      status: 200,
      responseText: TEST_RESPONSE,
    };
    const textInit = {headers: {'Accept': 'text/plain'}};
    const jsonInit = {headers: {'Accept': 'application/json'}};
    let xhr;
    let fetchStub;

    beforeEach(() => {
      xhr = batchedXhrServiceForTesting(env.win);
      fetchStub = env.sandbox.stub(xhr, 'fetchAmpCors_').callsFake(
          () => Promise.resolve(new FetchResponse(mockXhr)));
    });

    it('should fetch a generic request once for identical URLs', () => {
      return Promise.all([
        xhr.fetch('/get?k=v1').then(response => response.text()),
        xhr.fetch('/get?k=v1').then(response => response.text()),
        xhr.fetch('/get?k=v1').then(response => response.text()),
      ]).then(results => {
        expect(fetchStub).to.be.calledOnce;
        expect(results[0]).to.equal(TEST_RESPONSE);
        expect(results[1]).to.equal(TEST_RESPONSE);
        expect(results[2]).to.equal(TEST_RESPONSE);
      });
    });

    it('should separately cache generic fetches with identical URLs' +
        'but different "Accept" headers', () => {
      return Promise.all([
        xhr.fetch('/get?k=v1', textInit).then(response => response.text()),
        xhr.fetch('/get?k=v1', textInit).then(response => response.text()),
        xhr.fetch('/get?k=v1', jsonInit).then(response => response.json()),
        xhr.fetch('/get?k=v1', jsonInit).then(response => response.json()),
      ]).then(results => {
        expect(fetchStub).to.be.calledTwice;
        expect(results[0]).to.equal(TEST_RESPONSE);
        expect(results[1]).to.equal(TEST_RESPONSE);
        expect(results[2]).to.jsonEqual(TEST_OBJECT);
        expect(results[3]).to.jsonEqual(TEST_OBJECT);
      });
    });

    it('should cache the same as the convenience methods', () => {
      return Promise.all([
        xhr.fetch('/get?k=v1', jsonInit).then(response => response.json()),
        xhr.fetchJson('/get?k=v1').then(res => res.json()),
      ]).then(results => {
        expect(fetchStub).to.be.calledOnce;
        expect(results[0]).to.jsonEqual(TEST_OBJECT);
        expect(results[1]).to.jsonEqual(TEST_OBJECT);
      });
    });
  });

  describes.fakeWin('#fetchJson', {}, env => {
    const TEST_OBJECT = {a: {b: [{c: 2}, {d: 4}]}};
    const TEST_RESPONSE = JSON.stringify(TEST_OBJECT);
    const mockXhr = {
      status: 200,
      responseText: TEST_RESPONSE,
      responseType: 'json',
    };
    let xhr;
    let fetchStub;

    beforeEach(() => {
      xhr = batchedXhrServiceForTesting(env.win);
      fetchStub = env.sandbox.stub(xhr, 'fetchAmpCors_').callsFake(
          () => Promise.resolve(new FetchResponse(mockXhr)));
    });

    it('should fetch JSON GET requests once for identical URLs', () => {
      return Promise.all([
        xhr.fetchJson('/get?k=v1').then(res => res.json()),
        xhr.fetchJson('/get?k=v1').then(res => res.json()),
      ]).then(results => {
        expect(fetchStub).to.be.calledOnce;
        expect(results[0]).to.jsonEqual(TEST_OBJECT);
        expect(results[1]).to.jsonEqual(TEST_OBJECT);
      });
    });

    it('should not be affected by fragments passed in the URL', () => {
      return Promise.all([
        xhr.fetchJson('/get?k=v1#a.b[0].c').then(res => res.json()),
        xhr.fetchJson('/get?k=v1#a.b[1].d').then(res => res.json()),
      ]).then(results => {
        expect(fetchStub).to.be.calledOnce;
        expect(results[0]).to.jsonEqual(TEST_OBJECT);
        expect(results[1]).to.jsonEqual(TEST_OBJECT);
      });
    });

    it('should not cache for POST requests', () => {
      return Promise.all([
        xhr.fetchJson('/get?k=v1', {method: 'POST', body: {}}),
        xhr.fetchJson('/get?k=v1', {method: 'POST', body: {}}),
      ]).then(() => {
        expect(fetchStub).to.be.calledTwice;
      });
    });
  });

  describes.realWin('#fetchDocument', {}, env => {
    const TEST_CONTENT = '<b>Hello, world';
    const TEST_RESPONSE_TEXT = '<!doctype html><html><body>' + TEST_CONTENT;
    let xhr;
    let fetchStub;
    let testResponseDoc;

    beforeEach(() => {
      const doc = env.win.document;
      testResponseDoc = doc.implementation.createHTMLDocument();
      testResponseDoc.body.innerHTML = TEST_CONTENT;
      const mockXhr = {
        status: 200,
        responseText: TEST_RESPONSE_TEXT,
        responseXML: testResponseDoc,
        responseType: 'text/html',
      };
      xhr = batchedXhrServiceForTesting(env.win);
      fetchStub = env.sandbox.stub(xhr, 'fetchAmpCors_').callsFake(
          () => Promise.resolve(new FetchResponse(mockXhr)));
    });

    it('should fetch document GET requests once for identical URLs', () => {
      return Promise.all([
        xhr.fetchDocument('/get?k=v1'),
        xhr.fetchDocument('/get?k=v1'),
      ]).then(results => {
        expect(fetchStub).to.be.calledOnce;
        expect(results[0].isEqualNode(testResponseDoc)).to.be.true;
        expect(results[1].isEqualNode(testResponseDoc)).to.be.true;
      });
    });

    it('should not cache for POST requests', () => {
      return Promise.all([
        xhr.fetchDocument('/get?k=v1', {method: 'POST', body: {}}),
        xhr.fetchDocument('/get?k=v1', {method: 'POST', body: {}}),
      ]).then(results => {
        expect(fetchStub).to.be.calledTwice;
        expect(results[0].isEqualNode(testResponseDoc)).to.be.true;
        expect(results[1].isEqualNode(testResponseDoc)).to.be.true;
      });
    });
  });

  describes.fakeWin('#fetchText', {}, env => {
    const TEST_RESPONSE = 'Hello, world!';
    const mockXhr = {
      status: 200,
      responseText: TEST_RESPONSE,
    };
    let xhr;
    let fetchStub;

    beforeEach(() => {
      xhr = batchedXhrServiceForTesting(env.win);
      fetchStub = env.sandbox.stub(xhr, 'fetchAmpCors_').callsFake(
          () => Promise.resolve(new FetchResponse(mockXhr)));
    });

    it('should fetch text GET requests once for identical URLs', () => {
      return Promise.all([
        xhr.fetchText('/get?k=v1').then(res => res.text()),
        xhr.fetchText('/get?k=v1').then(res => res.text()),
      ]).then(results => {
        expect(fetchStub).to.be.calledOnce;
        expect(results[0]).to.equal(TEST_RESPONSE);
        expect(results[1]).to.equal(TEST_RESPONSE);
      });
    });

    it('should not cache for POST requests', () => {
      return Promise.all([
        xhr.fetchText('/get?k=v1', {method: 'POST', body: {}}),
        xhr.fetchText('/get?k=v1', {method: 'POST', body: {}}),
      ]).then(() => {
        expect(fetchStub).to.be.calledTwice;
      });
    });
  });
});
