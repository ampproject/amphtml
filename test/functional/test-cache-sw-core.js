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

/**
 * Cache SW has some side-effects, so we've got to do a little jig to test.
 */
const old = window.self;
const self = window.self = {
  AMP_CONFIG: {
    'cache-service-worker-blacklist': ['1313131313131'],
  },
  events: {},
  addEventListener(event, handler) {
    this.events[event] = handler;
  },
  registration: {
    scope: '/'
  },
  cache: {
    put() {},
    keys() {},
    delete() {},
    match() {},
  },
  caches: {
    open() {
      return Promise.resolve(this.cache);
    }
  }
};
// Yes, a require. `import` gets hoisted before user code, and we need to
// setup our mock self before that.
const sw = require('../../src/service-worker/core');
window.self = old;

describe.only('Cache SW', () => {
  const version = '1234567891234';
  const rtv = `00${version}`;
  const url = `https://cdn.ampproject.org/rtv/${rtv}/v0.js`;

  beforeEach(() => {
    // The version is a 13+ char number, the millisecond timestamp of the date.
    sw.setVersionForTesting(version);
  });

  describe('ampVersion', () => {
    it('matches the RTV version of a url', () => {
      expect(sw.ampVersion(url)).to.equal(rtv);
    });

    it('defaults RTV-less url to the current prod rtv', () => {
      const rtvless = url.replace(/rtv\/\d+\//, '');
      expect(sw.ampVersion(rtvless)).to.equal(`01${version}`);
    });

    it('only recognizes prefix and timestamp RTVs', () => {
      const prefixless = url.replace(rtv, version);
      expect(sw.ampVersion(prefixless)).to.equal(`01${version}`);
    });
  });

  describe('basename', () => {
    it('matches everything following the last slash of a url', () => {
      expect(sw.basename(url)).to.equal('v0.js');
    });

    it('handles god-forsaken urls', () => {
      expect(sw.basename(`${url}?1`)).to.equal('v0.js');
      expect(sw.basename(`${url}?1#1`)).to.equal('v0.js');
      expect(sw.basename(`${url}#1`)).to.equal('v0.js');
    });
  });

  describe('urlWithVersion', () => {
    it('changes RTV version to match version param', () => {
      expect(sw.urlWithVersion(url, '123')).to.equal(
        'https://cdn.ampproject.org/rtv/123/v0.js'
      );
    });

    it('changes RTV-less url to the RTV equivalent', () => {
      const rtvless = url.replace(/rtv\/\d+\//, '');
      expect(sw.urlWithVersion(rtvless, '123')).to.equal(
        'https://cdn.ampproject.org/rtv/123/v0.js'
      );
    });
  });

  describe('normalizedRequest', () => {
    const request = new Request(url, {
      method: 'POST',
    });

    it('makes a new request to match version', () => {
      const newRequest = sw.normalizedRequest(request, '123');
      expect(newRequest.url).to.equal(
        'https://cdn.ampproject.org/rtv/123/v0.js'
      );
      // Ensure `init` is copied over
      expect(newRequest.method).to.equal('POST');
    });

    it('makes a new request for versionless RTVs', () => {
      const rtvless = url.replace(/rtv\/\d+\//, '');
      const request = new Request(rtvless);
      const newRequest = sw.normalizedRequest(request, '123');
      expect(newRequest.url).to.equal(
        'https://cdn.ampproject.org/rtv/123/v0.js'
      );
    });

    it('returns same request if version matches', () => {
      const newRequest = sw.normalizedRequest(request, rtv);
      expect(newRequest).to.equal(request);
    });
  });

  describe('isCdnJsFile', () => {
    it('matches for CDN JS files', () => {
      const rtvless = url.replace(/rtv\/\d+\//, '');
      expect(sw.isCdnJsFile(url)).to.be.true;
      expect(sw.isCdnJsFile(rtvless)).to.be.true;
    });

    it('matches for CDN JS extension files', () => {
      const url = `https://cdn.ampproject.org/rtv/${rtv}/v0/amp-test.js`;
      const rtvless = url.replace(/rtv\/\d+\//, '');
      expect(sw.isCdnJsFile(url)).to.be.true;
      expect(sw.isCdnJsFile(rtvless)).to.be.true;
    });

    it('does not match for other CDN RTV files', () => {
      const url = `https://cdn.ampproject.org/rtv/${rtv}/v0.json`;
      const rtvless = url.replace(/rtv\/\d+\//, '');
      expect(sw.isCdnJsFile(url)).to.be.false;
      expect(sw.isCdnJsFile(rtvless)).to.be.false;
    });

    it('does not match for other CDN files', () => {
      const url = `https://cdn.ampproject.org/c/amp/`;
      expect(sw.isCdnJsFile(url)).to.be.false;
    });

    it('does not match for non CDN domains', () => {
      const url = `https://www.malicious.com/rtv/${rtv}/v0.js`;
      const rtvless = url.replace(/rtv\/\d+\//, '');
      expect(sw.isCdnJsFile(url)).to.be.false;
      expect(sw.isCdnJsFile(rtvless)).to.be.false;
    });
  });

  describe('isBlacklisted', () => {
    it('blacklists anything in the blacklist AMP_CONFIG', () => {
      const blacklisted = self.AMP_CONFIG['cache-service-worker-blacklist'][0];
      debugger;
      expect(sw.isBlacklisted(blacklisted)).to.be.true;
    });

    it('ignores anything in the blacklist AMP_CONFIG', () => {
      expect(sw.isBlacklisted(version)).to.be.false;
    });
  });

  describe('fetchAndCache', () => {
  });

  describe('getCachedVersion', () => {
  });

  describe('handleFetch', () => {
  });
});
