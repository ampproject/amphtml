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
  calculateEntryPointScriptUrl,
  calculateExtensionScriptUrl,
  parseExtensionUrl,
} from '../../src/service/extension-location';
import {initLogConstructor, resetLogConstructorForTesting} from '../../src/log';

describes.sandboxed('Extension Location', {}, () => {
  describe('get correct script source', () => {
    beforeEach(() => {
      // These functions must not rely on log for cases in SW.
      resetLogConstructorForTesting();
    });

    afterEach(() => {
      initLogConstructor();
    });

    it('with local mode', () => {
      window.AMP_MODE = {rtvVersion: '123'};
      const script = calculateExtensionScriptUrl(
        {
          pathname: 'examples/ads.amp.html',
          host: 'localhost:8000',
          protocol: 'http:',
        },
        'amp-ad',
        /*opt_extensionVersion*/ undefined,
        true
      );
      expect(script).to.equal(
        'http://localhost:8000/dist/rtv/123/v0/amp-ad-0.1.js'
      );
    });

    it('with remote mode', () => {
      window.AMP_MODE = {rtvVersion: '123'};
      const script = calculateExtensionScriptUrl(
        {
          pathname: 'examples/ads.amp.html',
          host: 'localhost:8000',
          protocol: 'http:',
        },
        'amp-ad',
        /*opt_extensionVersion*/ undefined,
        false
      );
      expect(script).to.equal(
        'https://cdn.ampproject.org/rtv/123/v0/amp-ad-0.1.js'
      );
    });

    it('should allow no versions', () => {
      window.AMP_MODE = {rtvVersion: '123'};
      const script = calculateExtensionScriptUrl(
        {
          pathname: 'examples/ads.amp.html',
          host: 'localhost:8000',
          protocol: 'http:',
        },
        'no-version',
        /* version is empty but defined */ '',
        true
      );
      expect(script).to.equal(
        'http://localhost:8000/dist/rtv/123/v0/no-version.js'
      );
    });

    it('should handles single pass experiment', () => {
      window.AMP_MODE = {rtvVersion: '123', singlePassType: 'sp'};
      const script = calculateExtensionScriptUrl(
        {
          pathname: 'examples/ads.amp.html',
          host: 'localhost:8000',
          protocol: 'http:',
        },
        'no-version',
        /* version is empty but defined */ '',
        true
      );
      expect(script).to.equal(
        'http://localhost:8000/dist/rtv/123/sp/v0/no-version.js'
      );
    });
  });

  describe('get correct entry point source', () => {
    beforeEach(() => {
      // These functions must not rely on log for cases in SW.
      resetLogConstructorForTesting();
    });

    afterEach(() => {
      initLogConstructor();
    });

    it('with local mode', () => {
      const script = calculateEntryPointScriptUrl(
        {
          pathname: 'examples/ads.amp.html',
          host: 'localhost:8000',
          protocol: 'http:',
        },
        'sw',
        true
      );
      expect(script).to.equal('http://localhost:8000/dist/sw.js');
    });

    it('with remote mode', () => {
      window.AMP_MODE = {rtvVersion: '123'};
      const script = calculateEntryPointScriptUrl(
        {
          pathname: 'examples/ads.amp.html',
          host: 'localhost:8000',
          protocol: 'http:',
        },
        'sw',
        /* isLocalDev */ false
      );
      expect(script).to.equal('https://cdn.ampproject.org/sw.js');
    });

    it('with remote mode & rtv', () => {
      window.AMP_MODE = {rtvVersion: '123'};
      const script = calculateEntryPointScriptUrl(
        {
          pathname: 'examples/ads.amp.html',
          host: 'localhost:8000',
          protocol: 'http:',
        },
        'ww',
        /* isLocalDev */ false,
        /* opt_rtv */ true
      );
      expect(script).to.equal('https://cdn.ampproject.org/rtv/123/ww.js');
    });

    it('should handle single pass experiment', () => {
      window.AMP_MODE = {rtvVersion: '123', singlePassType: 'sp'};
      const script = calculateEntryPointScriptUrl(
        {
          pathname: 'examples/ads.amp.html',
          host: 'localhost:8000',
          protocol: 'http:',
        },
        'ww',
        /* isLocalDev */ false,
        /* opt_rtv */ true
      );
      expect(script).to.equal('https://cdn.ampproject.org/rtv/123/sp/ww.js');
    });
  });

  describe('get correct URL parts', () => {
    it('unversioned urls', () => {
      const urlParts = parseExtensionUrl(
        'https://cdn.ampproject.org/v0/amp-ad-1.0.js'
      );
      expect(urlParts.extensionId).to.equal('amp-ad');
      expect(urlParts.extensionVersion).to.equal('1.0');
    });

    it('versioned urls', () => {
      const urlParts = parseExtensionUrl(
        'https://cdn.ampproject.org/rtv/123' + '/v0/amp-ad-0.1.js'
      );
      expect(urlParts.extensionId).to.equal('amp-ad');
      expect(urlParts.extensionVersion).to.equal('0.1');
    });
  });
});
