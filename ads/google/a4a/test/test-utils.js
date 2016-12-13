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
  setGoogleLifecycleVarsFromHeaders,
  QQID_HEADER,
} from '../utils';
import {GoogleAdLifecycleReporter} from '../performance';
import {base64UrlDecodeToBytes} from '../../../../src/utils/base64';

describe('Google A4A utils', () => {
  describe('#extractGoogleAdCreativeAndSignature', () => {
    it('should return body and signature', () => {
      const creative = 'some test data';
      const headerData = {
        'X-AmpAdSignature': 'AQAB',
      };
      const headers = {
        has: h => { return h in headerData; },
        get: h => { return headerData[h]; },
      };
      return expect(extractGoogleAdCreativeAndSignature(creative, headers))
          .to.eventually.deep.equal({
            creative,
            signature: base64UrlDecodeToBytes('AQAB'),
          });
    });

    it('should return null when no signature header is present', () => {
      const creative = 'some test data';
      const headers = {
        has: unused => { return false; },
        get: h => { throw new Error('Tried to get ' + h); },
      };
      return expect(extractGoogleAdCreativeAndSignature(creative, headers))
          .to.eventually.deep.equal({
            creative,
            signature: null,
          });
    });
  });

  describes.fakeWin('#setGoogleLifecycleVarsFromHeaders', {amp: true}, env => {
    const headerData = {};
    const headerMock = {
      get: h => { return h in headerData ? headerData[h] : null; },
    };
    let mockReporter;
    beforeEach(() => {
      const fakeElt = env.win.document.createElement('div');
      env.win.document.body.appendChild(fakeElt);
      mockReporter = new GoogleAdLifecycleReporter(
          env.win, fakeElt, 'test', 69, 37);
    });

    it('should pick up qqid from headers', () => {
      headerData[QQID_HEADER] = 'test qqid';
      expect(mockReporter.extraVariables_).to.be.empty;
      setGoogleLifecycleVarsFromHeaders(headerMock, mockReporter);
      expect(mockReporter.extraVariables_).to.have.property(
          'qqid.37', 'test qqid');
    });

    it('should pick up rendering method from headers', () => {
      headerData['X-AmpAdRender'] = 'fnord';
      expect(mockReporter.extraVariables_).to.be.empty;
      setGoogleLifecycleVarsFromHeaders(headerMock, mockReporter);
      expect(mockReporter.extraVariables_).to.have.property(
          'rm.37', 'fnord');
    });

  });
});
