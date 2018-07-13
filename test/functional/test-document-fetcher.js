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

import {DocumentFetcher} from '../../src/document-fetcher';
import {Services} from '../../src/services';

describes.realWin('DocumentFetcher', {amp: true}, function(env) {
  let xhrCreated;
  let docFetcher;
  let win;
  let ampdocServiceForStub;
  let ampdocViewerStub;

  // Given XHR calls give tests more time.
  this.timeout(5000);

  function setupMockXhr() {
    const mockXhr = sandbox.useFakeXMLHttpRequest();
    xhrCreated = new Promise(resolve => mockXhr.onCreate = resolve);
  }

  beforeEach(() => {
    win = env.win;
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

  describe('#fetchDocument', () => {
    beforeEach(() => {
      setupMockXhr();
      docFetcher = new DocumentFetcher({
        location: {href: 'https://acme.com/path'},
      });
    });

    it('should be able to fetch a document', () => {
      const promise = docFetcher.fetchDocument('/index.html').then(doc => {
        expect(doc.nodeType).to.equal(9);
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
            '<html></html>');
        expect(xhr.responseType).to.equal('document');
      });
      return promise;
    });

    it('should mark 400 as not retriable', () => {
      //setupMockXhr();
      const promise = docFetcher.fetchDocument('/index.html');
      xhrCreated.then(
          xhr => xhr.respond(
              400, {
                'Content-Type': 'text/xml',
              },
              '<html></html>'));
      return promise.catch(e => {
        expect(e.retriable).to.be.undefined;
        expect(e.retriable).to.not.equal(true);
      });
    });

    it('should mark 415 as retriable', () => {
      //setupMockXhr();
      const promise = docFetcher.fetchDocument('/index.html');
      xhrCreated.then(
          xhr => xhr.respond(
              415, {
                'Content-Type': 'text/xml',
                'Access-Control-Expose-Headers':
                    'AMP-Access-Control-Allow-Source-Origin',
                'AMP-Access-Control-Allow-Source-Origin': 'https://acme.com',
              },
              '<html></html>'));
      return promise.catch(e => {
        expect(e.retriable).to.exist;
        expect(e.retriable).to.be.true;
      });
    });

    it('should mark 500 as retriable', () => {
      //setupMockXhr();
      const promise = docFetcher.fetchDocument('/index.html');
      xhrCreated.then(
          xhr => xhr.respond(
              415, {
                'Content-Type': 'text/xml',
                'Access-Control-Expose-Headers':
                    'AMP-Access-Control-Allow-Source-Origin',
                'AMP-Access-Control-Allow-Source-Origin': 'https://acme.com',
              },
              '<html></html>'));
      return promise.catch(e => {
        expect(e.retriable).to.exist;
        expect(e.retriable).to.be.true;
      });
    });

    it('should error on non truthy responseXML', () => {
      //setupMockXhr();
      const promise = docFetcher.fetchDocument('/index.html');
      xhrCreated.then(
          xhr => xhr.respond(
              200, {
                'Content-Type': 'application/json',
                'Access-Control-Expose-Headers':
                    'AMP-Access-Control-Allow-Source-Origin',
                'AMP-Access-Control-Allow-Source-Origin': 'https://acme.com',
              },
              '{"hello": "world"}'));
      return promise.catch(e => {
        expect(e.message)
            .to.contain('responseXML should exist');
      });
    });
  });
});
