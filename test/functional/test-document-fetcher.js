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

describe('DocumentFetcher', function() {
  let sandbox;
  let xhrCreated;

  // Given XHR calls give tests more time.
  this.timeout(5000);

  function setupMockXhr() {
    const mockXhr = sandbox.useFakeXMLHttpRequest();
    xhrCreated = new Promise(resolve => mockXhr.onCreate = resolve);
  }

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    setupMockXhr();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('#fetchDocument', () => {
    it('should be able to fetch a document', () => {
      expect(xhrCreated).to.not.be.null;
    });
  });
});
