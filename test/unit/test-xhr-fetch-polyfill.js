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

import {Response, fetchPolyfill} from '../../src/polyfills/fetch';
import {Services} from '../../src/services';
import {createFormDataWrapper} from '../../src/form-data-wrapper';

describes.sandboxed('fetch', {}, () => {
  describe('fetch method', () => {
    let xhrCreated;

    function setupMockXhr() {
      const mockXhr = sandbox.useFakeXMLHttpRequest();
      xhrCreated = new Promise(resolve => (mockXhr.onCreate = resolve));
    }

    function mockOkResponse() {
      xhrCreated.then(xhr =>
        xhr.respond(
          200,
          {
            'Content-Type': 'text/xml',
          },
          '<html></html>'
        )
      );
    }

    beforeEach(() => {
      sandbox = sinon.sandbox;
      setupMockXhr();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should allow GET method', () => {
      mockOkResponse();
      return fetchPolyfill('/get?k=v1').then(response => {
        expect(response.ok).to.be.equal(true);
      });
    });

    it('should allow POST method', () => {
      mockOkResponse();
      return fetchPolyfill('/post', {
        method: 'POST',
        body: {
          hello: 'world',
        },
      }).then(response => {
        expect(response.ok).to.be.equal(true);
      });
    });

    it('should not allow PUT method', () => {
      mockOkResponse();
      return expect(
        fetchPolyfill('/post', {
          method: 'PUT',
          body: {
            hello: 'world',
          },
        })
      ).to.be.rejectedWith(/Only one of GET, POST is currently allowed./);
    });

    it('should not allow PATCH method', () => {
      mockOkResponse();
      return expect(
        fetchPolyfill('/post', {
          method: 'PATCH',
          body: {
            hello: 'world',
          },
        })
      ).to.be.rejectedWith(/Only one of GET, POST is currently allowed./);
    });

    it('should not allow DELETE method', () => {
      mockOkResponse();
      return expect(
        fetchPolyfill('/post', {
          method: 'DELETE',
          body: {
            hello: 'world',
          },
        })
      ).to.be.rejectedWith(/Only one of GET, POST is currently allowed./);
    });

    it('should allow FormData as body', () => {
      const fakeWin = null;
      sandbox.stub(Services, 'platformFor').returns({
        isIos() {
          return false;
        },
      });

      const formData = createFormDataWrapper(fakeWin);
      sandbox.stub(JSON, 'stringify');
      formData.append('name', 'John Miller');
      formData.append('age', 56);
      const post = fetchPolyfill.bind(this, '/post', {
        method: 'POST',
        body: formData,
      });
      expect(post).to.not.throw();
      expect(JSON.stringify.called).to.be.false;
    });

    it('should do `GET` as default method', () => {
      fetchPolyfill('/get?k=v1');
      return xhrCreated.then(xhr => expect(xhr.method).to.equal('GET'));
    });

    it('should normalize POST method name to uppercase', () => {
      fetchPolyfill('/get?k=v1', {
        method: 'post',
      });
      return xhrCreated.then(xhr => expect(xhr.method).to.equal('POST'));
    });

    it('should parse and pass the headers', () => {
      const headers = {
        'Content-type': 'application/json;charset=utf-8',
        'HEADER-2': 'VALUE-2',
      };
      fetchPolyfill('/get?k=v1', {
        method: 'post',
        headers,
      });
      return xhrCreated.then(xhr => {
        for (const key in headers) {
          expect(xhr.requestHeaders[key]).to.be.equal(headers[key]);
        }
      });
    });

    it('should pass the body to xhr request', () => {
      const bodyData = {
        hello: 'world',
      };

      fetchPolyfill('/get?k=v1', {
        method: 'post',
        body: JSON.stringify(bodyData),
      });
      return xhrCreated.then(xhr => {
        expect(xhr.requestBody).to.be.equal(JSON.stringify(bodyData));
      });
    });

    it('should make xhr request withCredentials for creds include', () => {
      fetchPolyfill('/get?k=v1', {
        credentials: 'include',
      });
      return xhrCreated.then(xhr => {
        expect(xhr.withCredentials).to.be.equal(true);
      });
    });
  });

  describe('Response', () => {
    const TEST_TEXT = 'this is some test text';

    it('should keep default status as 200 OK', () => {
      const response = new Response(TEST_TEXT);
      expect(response.status).to.be.equals(200);
    });

    it(
      'should default status as 200 OK when an explicit ' +
        'for undefined status',
      () => {
        let response = new Response(TEST_TEXT, {status: undefined});
        expect(response.status).to.be.equals(200);
        response = new Response(TEST_TEXT);
        expect(response.status).to.be.equals(200);
      }
    );

    it('should construct with body and explicit header uses header', () => {
      const response = new Response(TEST_TEXT, {
        headers: {
          'content-type': 'application/json',
          'random': 'random-value',
        },
      });
      expect(response.status).to.be.equals(200);
      expect(response.headers.get('content-type')).to.be.equal(
        'application/json'
      );
      expect(response.headers.get('random')).to.be.equal('random-value');
    });

    it('should reflect given status', () => {
      let response = new Response(TEST_TEXT, {
        status: 400,
      });
      expect(response.status).to.be.equals(400);
      response = new Response(TEST_TEXT, {
        status: 415,
      });
      expect(response.status).to.be.equals(415);
      response = new Response(TEST_TEXT, {
        status: 500,
      });
      expect(response.status).to.be.equals(500);
    });

    it('should provide text', () => {
      const response = new Response(TEST_TEXT);
      return response.text().then(result => {
        expect(result).to.equal(TEST_TEXT);
      });
    });

    it('should provide text only once', () => {
      const response = new Response(TEST_TEXT);
      return response.text().then(result => {
        expect(result).to.equal(TEST_TEXT);
        expect(response.text.bind(response), 'should throw').to.throw(
          Error,
          /Body already used/
        );
      });
    });

    it('should provide json', () => {
      const RESPONSE_JSON = {
        'Key1': 'value',
        'key2': 'Value2',
      };
      const response = new Response(JSON.stringify(RESPONSE_JSON));
      return response.json().then(result => {
        expect(result).to.deep.equal(RESPONSE_JSON);
      });
    });

    it('should be cloneable and each instance should provide text', () => {
      const response = new Response(TEST_TEXT);
      const clone = response.clone();
      return Promise.all([response.text(), clone.text()]).then(results => {
        expect(results[0]).to.equal(TEST_TEXT);
        expect(results[1]).to.equal(TEST_TEXT);
      });
    });

    it('should not be cloneable if body is already accessed', () => {
      const response = new Response(TEST_TEXT);
      return response.text().then(() => {
        expect(() => response.clone(), 'should throw').to.throw(
          Error,
          /Body already used/
        );
      });
    });
  });
});
