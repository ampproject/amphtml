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
  calculateExtensionScriptUrl,
  calculateEntryPointScriptUrl,
} from '../../src/service/extension-location';
import {
  initLogConstructor,
  resetLogConstructorForTesting,
} from '../../src/log';

describes.sandboxed('Extension Location', {}, () => {
  describe('get correct script source', () => {
    beforeEach(() => {
      // These functions must not rely on log for cases in SW.
      resetLogConstructorForTesting();
    });

    afterEach(() => {
      initLogConstructor();
    });

    it('with local mode and version 0.1', () => {
      window.AMP_MODE = {rtvVersion: '123'};
      const script = calculateExtensionScriptUrl({
        pathname: 'examples/ads.amp.html',
        host: 'localhost:8000',
        protocol: 'http:',
<<<<<<< HEAD
      }, 'amp-ad', true);
      expect(script).to.equal(
          'http://localhost:8000/dist/rtv/123/v0/amp-ad-0.1.js');
=======
      }, 'amp-ad', '0.1', true);
      expect(script).to.equal('http://localhost:8000/dist/rtv/123/v0/amp-ad-0.1.js');
>>>>>>> Refactored metadata extensions.
    });

    it('with local mode and version 1.0', () => {
      window.AMP_MODE = {rtvVersion: '123'};
      const script = calculateExtensionScriptUrl({
        pathname: 'examples/ads.amp.html',
        host: 'localhost:8000',
        protocol: 'http:',
      }, 'amp-ad', '1.0', true);
      expect(script).to.equal('http://localhost:8000/dist/rtv/123/v0/amp-ad-1.0.js');
    });

    it('with remote mode', () => {
      window.AMP_MODE = {rtvVersion: '123'};
      const script = calculateExtensionScriptUrl({
        pathname: 'examples/ads.amp.min.html',
        host: 'localhost:8000',
        protocol: 'http:',
      }, 'amp-ad', '0.1', false);
      expect(script).to.equal(
          'https://cdn.ampproject.org/rtv/123/v0/amp-ad-0.1.js');
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
      const script = calculateEntryPointScriptUrl({
        pathname: 'examples/ads.amp.html',
        host: 'localhost:8000',
        protocol: 'http:',
      }, 'sw', true);
      expect(script).to.equal('http://localhost:8000/dist/sw.js');
    });

    it('with remote mode', () => {
      window.AMP_MODE = {rtvVersion: '123'};
      const script = calculateEntryPointScriptUrl({
        pathname: 'examples/ads.amp.min.html',
        host: 'localhost:8000',
        protocol: 'http:',
      }, 'sw', /* isLocalDev */ false);
      expect(script).to.equal(
          'https://cdn.ampproject.org/sw.js');
    });

    it('with remote mode & rtv', () => {
      window.AMP_MODE = {rtvVersion: '123'};
      const script = calculateEntryPointScriptUrl({
        pathname: 'examples/ads.amp.min.html',
        host: 'localhost:8000',
        protocol: 'http:',
      }, 'ww', /* isLocalDev */ false, /* opt_rtv */ true);
      expect(script).to.equal(
          'https://cdn.ampproject.org/rtv/123/ww.js');
    });
  });
});
