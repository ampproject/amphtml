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
import {DocumentFetcher} from '../../src/document-fetcher';
import {Services} from '../../src/services';

describe('DocumentFetcher', function() {
  let sandbox;
  let xhrCreated;
  let docFetcher;
  let ampdocServiceForStub;
  let ampdocViewerStub;

  // Given XHR calls give tests more time.
  this.timeout(5000);

  function setupMockXhr() {
    const mockXhr = sandbox.useFakeXMLHttpRequest();
    xhrCreated = new Promise(resolve => mockXhr.onCreate = resolve);
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
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

  after(() => {
    sandbox.restore();
  });

  describe('#fetchDocument', () => {
    beforeEach(() => {
      setupMockXhr();
      docFetcher = new DocumentFetcher({
        location: {href: 'https://acme.com/path'},
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should be able to fetch a document', () => {
      const promise = docFetcher.fetchDocument('/index.html').then(doc => {
        expect(doc.nodeType).to.equal(9);
        expect(docFetcher.viewerResponded_).to.equals(false);
        expect(doc.firstChild.textContent).to.equals('Foo');
      });
      xhrCreated.then(xhr => {
        expect(xhr.requestHeaders['Accept']).to.equal('text/html');
        xhr.respond(
            200, {
              'Content-Type': 'text/xml',
              'Access-Control-Expose-Headers':
                  'AMP-Access-Control-Allow-Source-Origin',
              'AMP-Access-Control-Allow-Source-Origin': 'https://acme.com',
            },
            '<html><body>Foo</body></html>');
        expect(xhr.responseType).to.equal('document');
      });
      return promise;
    });
  });
});
