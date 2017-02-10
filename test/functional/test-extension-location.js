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

    it('with local mode for testing with compiled js', () => {
      const script = calculateExtensionScriptUrl({
        pathname: 'examples/ads.amp.html',
        host: 'localhost:8000',
        protocol: 'http:',
      }, 'amp-ad', true, true, true);
      expect(script).to.equal('http://localhost:8000/dist/v0/amp-ad-0.1.js');
    });

    it('with local mode for testing without compiled js', () => {
      const script = calculateExtensionScriptUrl({
        pathname: 'examples/ads.amp.html',
        host: 'localhost:80',
        protocol: 'https:',
      }, 'amp-ad', true, true, false);
      expect(script).to.equal('https://localhost:80/dist/v0/amp-ad-0.1.max.js');
    });

    it('with local mode normal pathname', () => {
      const script = calculateExtensionScriptUrl({
        pathname: 'examples/ads.amp.html',
        host: 'localhost:8000',
        protocol: 'https:',
      }, 'amp-ad', true);
      expect(script).to.equal('https://cdn.ampproject.org/v0/amp-ad-0.1.js');
    });

    it('with local mode min pathname', () => {
      const script = calculateExtensionScriptUrl({
        pathname: 'examples/ads.amp.min.html',
        host: 'localhost:8000',
        protocol: 'http:',
      }, 'amp-ad', true);
      expect(script).to.equal('http://localhost:8000/dist/v0/amp-ad-0.1.js');
    });

    it('with local mode max pathname', () => {
      const script = calculateExtensionScriptUrl({
        pathname: 'examples/ads.amp.max.html',
        host: 'localhost:8000',
        protocol: 'http:',
      }, 'amp-ad', true);
      expect(script).to.equal('http://localhost:8000/dist/v0/amp-ad-0.1.max.js');
    });

    it('with remote mode', () => {
      window.AMP_MODE = {rtvVersion: '123'};
      const script = calculateExtensionScriptUrl({
        pathname: 'examples/ads.amp.min.html',
        host: 'localhost:8000',
        protocol: 'http:',
      }, 'amp-ad', false);
      expect(script).to.equal(
          'https://cdn.ampproject.org/rtv/123/v0/amp-ad-0.1.js');
    });

    it('with document proxy mode: max', () => {
      const script = calculateExtensionScriptUrl({
        pathname: '/max/output.jsbin.com/pegizoq/quiet',
        host: 'localhost:80',
        protocol: 'http:',
      }, 'amp-ad', true);
      expect(script).to.equal('http://localhost:80/dist/v0/amp-ad-0.1.max.js');
    });

    it('with document proxy mode: min', () => {
      const script = calculateExtensionScriptUrl({
        pathname: '/min/output.jsbin.com/pegizoq/quiet',
        host: 'localhost:80',
        protocol: 'http:',
      }, 'amp-ad', true);
      expect(script).to.equal('http://localhost:80/dist/v0/amp-ad-0.1.js');
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

    it('with local mode for testing', () => {
      const script = calculateEntryPointScriptUrl({
        pathname: 'examples/ads.amp.html',
        host: 'localhost:8000',
        protocol: 'http:',
      }, 'sw', true, true);
      expect(script).to.equal('http://localhost:8000/dist/sw.js');
    });

    it('with local mode normal pathname', () => {
      const script = calculateEntryPointScriptUrl({
        pathname: 'examples/ads.amp.html',
        host: 'localhost:8000',
        protocol: 'https:',
      }, 'sw', true);
      expect(script).to.equal('https://cdn.ampproject.org/sw.js');
    });

    it('with local mode min pathname', () => {
      const script = calculateEntryPointScriptUrl({
        pathname: 'examples/ads.amp.min.html',
        host: 'localhost:8000',
        protocol: 'http:',
      }, 'sw', true);
      expect(script).to.equal('http://localhost:8000/dist/sw.js');
    });

    it('with local mode max pathname', () => {
      const script = calculateEntryPointScriptUrl({
        pathname: 'examples/ads.amp.max.html',
        host: 'localhost:8000',
        protocol: 'http:',
      }, 'sw', true);
      expect(script).to.equal('http://localhost:8000/dist/sw.max.js');
    });

    it('with remote mode', () => {
      window.AMP_MODE = {rtvVersion: '123'};
      const script = calculateEntryPointScriptUrl({
        pathname: 'examples/ads.amp.min.html',
        host: 'localhost:8000',
        protocol: 'http:',
      }, 'sw', false);
      expect(script).to.equal(
          'https://cdn.ampproject.org/sw.js');
    });

    it('with document proxy mode: min', () => {
      const script = calculateEntryPointScriptUrl({
        pathname: '/min/output.jsbin.com/pegizoq/quiet',
        host: 'localhost:80',
        protocol: 'http:',
      }, 'sw', true);
      expect(script).to.equal('http://localhost:80/dist/sw.js');
    });
  });
});
