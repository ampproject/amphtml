/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
  extractGoogleAdCreativeAndSignature,
} from '../utils';

describe('Google A4A utils', () => {
  describe('#extractGoogleAdCreativeAndSignature', () => {
    it('should return body and signature', () => {
      const text = 'some test data';
      const headerData = {
        'X-AmpAdSignature': 'a test header',
      };
      const headers = {
        has: h => { return h in headerData; },
        get: h => { return headerData[h]; },
      };
      return expect(extractGoogleAdCreativeAndSignature(text, headers))
          .to.eventually.deep.equal({
            creativeArrayBuffer: 'some test data',
            signature: 'a test header',
          });
    });

    it('should return null when no signature header is present', () => {
      const text = 'some test data';
      const headers = {
        has: unused => { return false; },
        get: h => { throw new Error('Tried to get ' + h); },
      };
      return expect(extractGoogleAdCreativeAndSignature(text, headers))
          .to.eventually.deep.equal({
            creativeArrayBuffer: 'some test data',
            signature: null,
          });
    });
  });
});
