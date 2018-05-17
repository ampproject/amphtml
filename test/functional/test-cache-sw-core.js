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
const version = '1234567891234';
const cache = {
  cached: [],
  put(req, resp) {
    this.cached.push([req, resp]);
  },
  keys() {
    return Promise.resolve(this.cached.map(pair => {
      return pair[0];
    }));
  },
  delete(req) {
    for (let i = 0; i < this.cached.length; i++) {
      if (this.cached[i][0].url === req.url) {
        this.cached.splice(i, 1);
        break;
      }
    }
  },
  match(req) {
    for (let i = 0; i < this.cached.length; i++) {
      if (this.cached[i][0].url === req.url) {
        const resp = this.cached[i][1];
        return Promise.resolve(resp.clone());
      }
    }

    return Promise.resolve();
  },
};
const self = window.self = {
  AMP_CONFIG: {
    'cache-service-worker-blacklist': ['1313131313131'],
    'v': `01${version}`,
  },
  events: {},
  addEventListener(event, handler) {
    this.events[event] = handler;
  },
  registration: {
    scope: '/',
  },
  caches: {
    open() {
      return Promise.resolve(cache);
    },
  },
};
// Yes, a require. `import` gets hoisted before user code, and we need to
// setup our mock self before that.
const sw =
    require('../../src/service-worker/core'); // eslint-disable-line no-undef
window.self = old;

const runner = describe.configure().skip(() => typeof Request == 'undefined');
runner.run('Cache SW', () => {
  const prevVersion = parseInt(version, 10) - 1;
  const blacklistedVersion =
      self.AMP_CONFIG['cache-service-worker-blacklist'][0];

  const rtv = `01${version}`;
  const prodRtv = self.AMP_CONFIG.v;
  const prevRtv = `01${prevVersion}`;
  const blacklistedRtv = `01${blacklistedVersion}`;
  const diversionRtv = `02${version}`;
  const prevDiversionRtv = `02${prevVersion}`;

  const url = `https://cdn.ampproject.org/rtv/${rtv}/v0.js`;
  let sandbox;

  function rtvVersion(url) {
    const data = sw.requestData(url);
    return data && data.explicitRtv;
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
    cache.cached.length = 0;
    sw.resetMemosForTesting();
  });

  describe('urlWithVersion', () => {
    describe('with RTVless file', () => {
      const v0 = 'https://cdn.ampproject.org/v0.js';
      const v1 = 'https://cdn.ampproject.org/v1.js';
      const comp = 'https://cdn.ampproject.org/v0/amp-comp-0.1.js';
      const v1comp = 'https://cdn.ampproject.org/v1/amp-comp-0.1.js';

      it('rewrites v0 to versioned v0', () => {
        expect(sw.urlWithVersion(v0, '123')).to.equal(
            'https://cdn.ampproject.org/rtv/123/v0.js');
      });

      it.skip('rewrites v1 to versioned v1', () => {
        expect(sw.urlWithVersion(v1, '123')).to.equal(
            'https://cdn.ampproject.org/rtv/123/v1.js');
      });

      it('rewrites comp to versioned comp', () => {
        expect(sw.urlWithVersion(comp, '123')).to.equal(
            'https://cdn.ampproject.org/rtv/123/v0/amp-comp-0.1.js');
      });

      it.skip('rewrites v1 comp to versioned v1 comp', () => {
        expect(sw.urlWithVersion(v1comp, '123')).to.equal(
            'https://cdn.ampproject.org/rtv/123/v1/amp-comp-0.1.js');
      });
    });

    describe('with RTV versioned file', () => {
      const v0 = `https://cdn.ampproject.org/rtv/${rtv}/v0.js`;
      const v1 = `https://cdn.ampproject.org/rtv/${rtv}/v1.js`;
      const comp = `https://cdn.ampproject.org/rtv/${rtv}/v0/amp-comp-0.1.js`;
      const v1comp = `https://cdn.ampproject.org/rtv/${rtv}/v1/amp-comp-0.1.js`;

      it('rewrites versioned v0 to other version', () => {
        expect(sw.urlWithVersion(v0, '123')).to.equal(
            'https://cdn.ampproject.org/rtv/123/v0.js');
      });

      // When we finally release AMP v1
      it.skip('rewrites versioned v1 to other version', () => {
        expect(sw.urlWithVersion(v1, '123')).to.equal(
            'https://cdn.ampproject.org/rtv/123/v1.js');
      });

      it('rewrites versioned comp to other version', () => {
        expect(sw.urlWithVersion(comp, '123')).to.equal(
            'https://cdn.ampproject.org/rtv/123/v0/amp-comp-0.1.js');
      });

      // When we finally release AMP v1
      it.skip('rewrites versioned v1 comp to other version', () => {
        expect(sw.urlWithVersion(v1comp, '123')).to.equal(
            'https://cdn.ampproject.org/rtv/123/v1/amp-comp-0.1.js');
      });
    });
  });

  describe('isCdnJsFile', () => {
    it('matches for CDN JS files', () => {
      const rtvless = 'https://cdn.ampproject.org/v0.js';
      expect(sw.isCdnJsFile(url)).to.be.true;
      expect(sw.isCdnJsFile(rtvless)).to.be.true;
    });

    it('matches for CDN JS extension files', () => {
      const url = `https://cdn.ampproject.org/rtv/${rtv}/v0/amp-comp-0.1.js`;
      const rtvless = 'https://cdn.ampproject.org/v0/amp-comp-0.1.js';
      const versioned = `https://cdn.ampproject.org/rtv/${rtv}/v0/amp-comp-0.1.js`;
      const rtvlessVersioned = 'https://cdn.ampproject.org/v0/amp-comp-0.1.js';
      expect(sw.isCdnJsFile(url)).to.be.true;
      expect(sw.isCdnJsFile(rtvless)).to.be.true;
      expect(sw.isCdnJsFile(versioned)).to.be.true;
      expect(sw.isCdnJsFile(rtvlessVersioned)).to.be.true;
    });

    it('does not match for fake extensions', () => {
      expect(sw.isCdnJsFile('https://cdn.ampproject.org/v0/experiments.js'))
          .to.be.false;
      expect(sw.isCdnJsFile('https://cdn.ampproject.org/v0/validator.js'))
          .to.be.false;
    });

    it('does not match for other CDN files', () => {
      expect(sw.isCdnJsFile('https://cdn.ampproject.org/c/amp.js')).to.be.false;
      expect(sw.isCdnJsFile('https://cdn.ampproject.org/v/amp.js')).to.be.false;
      expect(sw.isCdnJsFile('https://cdn.ampproject.org/i/amp.js')).to.be.false;
      expect(sw.isCdnJsFile(`https://cdn.ampproject.org/rtv/${rtv}/v0.json`)).to.be.false;
      expect(sw.isCdnJsFile('https://cdn.ampproject.org/v0.json')).to.be.false;
    });

    it('does not match for non CDN domains', () => {
      const url = `https://www.malicious.com/rtv/${rtv}/v0.js`;
      const rtvless = 'https://www.malicious.com/v0.js';
      expect(sw.isCdnJsFile(url)).to.be.false;
      expect(sw.isCdnJsFile(rtvless)).to.be.false;
    });
  });

  describe('isBlacklisted', () => {
    it('blacklists anything in the blacklist AMP_CONFIG', () => {
      const blacklisted = self.AMP_CONFIG['cache-service-worker-blacklist'][0];
      // We blacklist AmpVersions (regardless of prefix).
      expect(sw.isBlacklisted(`00${blacklisted}`)).to.be.true;
      expect(sw.isBlacklisted(`01${blacklisted}`)).to.be.true;
      expect(sw.isBlacklisted(`02${blacklisted}`)).to.be.true;
    });

    it('ignores anything in the blacklist AMP_CONFIG', () => {
      expect(sw.isBlacklisted(version)).to.be.false;
    });
  });

  describe('generateFallbackClientId', () => {
    let clock;
    const referrer = 'https://publisher.com/amp/article';
    const other = 'https://publisher.com/amp/other';

    beforeEach(() => {
      clock = sandbox.useFakeTimers();
    });

    it('generates a clientId lumped in 60 second blocks', () => {
      const clientId = sw.generateFallbackClientId(referrer);
      expect(sw.generateFallbackClientId(referrer)).to.equal(clientId);
    });

    it('generates a new clientId after 60 seconds', () => {
      const clientId = sw.generateFallbackClientId(referrer);
      clock.tick(60 * 1000);
      expect(sw.generateFallbackClientId(referrer)).to.equal(clientId);
      clock.tick(1);
      expect(sw.generateFallbackClientId(referrer)).not.to.equal(clientId);
    });

    it('generates a different clientId for different referrers', () => {
      const clientId = sw.generateFallbackClientId(referrer);
      const otherId = sw.generateFallbackClientId(other);
      expect(otherId).not.to.equal(clientId);
      expect(sw.generateFallbackClientId(other)).to.equal(otherId);
    });
  });

  describe('expired', () => {
    let response;
    let clock;

    beforeEach(() => {
      clock = sandbox.useFakeTimers();
      clock.setSystemTime(Date.parse('Mon, 06 Mar 2017 00:00:00 GMT'));
      response = new Response('');
    });

    describe('with cache-control and date', () => {
      describe('date in the past', () => {
        beforeEach(() => {
          response.headers.set('date', 'Sun, 05 Mar 2017 00:00:00 GMT');
        });

        it('cache-control no-cache', () => {
          response.headers.set('cache-control', 'public, no-cache');
          expect(sw.expired(response)).to.be.true;
        });

        it('cache-control max-age=-1', () => {
          response.headers.set('cache-control', 'public, max-age=-1');
          expect(sw.expired(response)).to.be.true;
        });

        it('cache-control max-age=0', () => {
          response.headers.set('cache-control', 'public, max-age=0');
          expect(sw.expired(response)).to.be.true;
        });

        it('cache-control max-age=year', () => {
          response.headers.set('cache-control', 'public, max-age=31536000');
          expect(sw.expired(response)).to.be.false;
        });
      });

      describe('date is now', () => {
        beforeEach(() => {
          response.headers.set('date', 'Mon, 06 Mar 2017 00:00:00 GMT');
        });

        it('cache-control no-cache', () => {
          response.headers.set('cache-control', 'public, no-cache');
          expect(sw.expired(response)).to.be.true;
        });

        it('cache-control max-age=-1', () => {
          response.headers.set('cache-control', 'public, max-age=-1');
          expect(sw.expired(response)).to.be.true;
        });

        it('cache-control max-age=0', () => {
          response.headers.set('cache-control', 'public, max-age=0');
          expect(sw.expired(response)).to.be.true;
        });

        it('cache-control max-age=year', () => {
          response.headers.set('cache-control', 'public, max-age=31536000');
          expect(sw.expired(response)).to.be.false;
        });
      });

      describe('date in the future', () => {
        beforeEach(() => {
          response.headers.set('date', 'Tue, 07 Mar 2017 00:00:00 GMT');
        });

        it('cache-control no-cache', () => {
          response.headers.set('cache-control', 'public, no-cache');
          expect(sw.expired(response)).to.be.true;
        });

        it('cache-control max-age=-1', () => {
          response.headers.set('cache-control', 'public, max-age=-1');
          expect(sw.expired(response)).to.be.true;
        });

        it('cache-control max-age=0', () => {
          response.headers.set('cache-control', 'public, max-age=0');
          expect(sw.expired(response)).to.be.false;
        });

        it('cache-control max-age=year', () => {
          response.headers.set('cache-control', 'public, max-age=31536000');
          expect(sw.expired(response)).to.be.false;
        });
      });
    });

    describe('with no cache information', () => {
      it('is expired', () => {
        expect(sw.expired(response)).to.be.true;
      });
    });
  });

  describe('fetchAndCache', () => {
    const request = new Request(url);
    const response = new Response('');
    let fetch;
    let put;
    let calls;

    beforeEach(() => {
      calls = 0;
      sandbox.stub(response, 'clone').callsFake(() => response);
      fetch = sandbox.stub(window, 'fetch').callsFake(() => {
        calls++;
        if (calls == 1) {
          return Promise.resolve(response);
        }
        return Promise.resolve(new Response(''));
      });
      put = sandbox.spy(cache, 'put');
    });

    it('batches fetch to same url', () => {
      const v1 = new Request(`https://cdn.ampproject.org/rtv/${rtv}/v1.js`);
      const v2 = new Request(`https://cdn.ampproject.org/rtv/${rtv}/v2.js`);

      return Promise.all([
        sw.fetchAndCache(cache, request),
        sw.fetchAndCache(cache, request),
        sw.fetchAndCache(cache, v1),
        sw.fetchAndCache(cache, v2),
      ]).then(responses => {
        const first = responses[0];
        const v1 = responses[2];
        const v2 = responses[3];

        expect(first).to.equal(responses[1]);
        expect(v1).not.to.equal(first);
        expect(v2).not.to.equal(first);
        expect(v1).not.to.equal(v2);
      });
    });

    describe('when already in cache', () => {
      let response;
      beforeEach(() => {
        response = new Response('', {
          headers: {
            'cache-control': 'private, max-age=60',
            'date': new Date().toUTCString(),
          },
        });
        cache.put(request, response);
      });

      it('returns cached response if fresh', () => {
        return sw.fetchAndCache(cache, request).then(() => {
          expect(fetch).to.not.have.been.called;
        });
      });

      it('fetches response if expired', () => {
        response.headers.set('cache-control', 'private, no-cache');
        return sw.fetchAndCache(cache, request).then(() => {
          expect(fetch).to.have.been.called;
        });
      });
    });

    describe('when response is ok', () => {
      beforeEach(() => {
        response.ok = true;
      });

      it('fetches the url', () => {
        return sw.fetchAndCache(cache, request).then(resp => {
          expect(fetch).to.have.been.called;
          expect(resp).to.equal(response);
        });
      });

      it('fetches the request', () => {
        return sw.fetchAndCache(cache, request).then(resp => {
          expect(fetch).to.have.been.called;
          expect(resp).to.equal(response);
        });
      });

      it('stores response into cache', () => {
        response.clone.restore();
        const cloned = {};
        sandbox.stub(response, 'clone').callsFake(() => cloned);
        return sw.fetchAndCache(cache, request).then(() => {
          expect(put).to.have.been.calledWith(request, cloned);
        });
      });
    });

    describe('when response is not ok', () => {
      beforeEach(() => {
        Object.defineProperty(response, 'ok', {value: false});
      });

      it('returns rejected promise', () => {
        return sw.fetchAndCache(cache, request).then(() => {
          throw new Error('should have rejected');
        }, () => {
          // noop.
        });
      });

      it('does not store response into cache', () => {
        return sw.fetchAndCache(cache, request).catch(() => {
          expect(put).to.not.have.been.called;
        });
      });
    });
  });

  describe('fetchJsFile', () => {
    const request = {url};
    const rejected = Promise.reject();
    rejected.catch(() => {});
    let response;
    let fetch;
    let deleter;

    beforeEach(() => {
      const expires = {
        'cache-control': 'public, max-age=60',
        date: new Date().toUTCString(),
      };

      response = new Response('', {headers: expires});

      // "Previous" cached requests
      cache.cached.push(
          [{url: `https://cdn.ampproject.org/rtv/${prevRtv}/v0.js`}, new Response('')],
          // A different file
          [{url: `https://cdn.ampproject.org/rtv/${prevRtv}/v0/amp-comp-0.1.js`}, new Response('')],
          // A diversion of v0
          [{url: `https://cdn.ampproject.org/rtv/${prevDiversionRtv}/v0.js`}, new Response('', {headers: expires})],
          // A diversion of amp-comp
          [{url: `https://cdn.ampproject.org/rtv/${prevDiversionRtv}/v0/amp-comp-0.1.js`}, , new Response('', {headers: expires})]
      );
      deleter = sandbox.stub(cache, 'delete');
      fetch = sandbox.stub(window, 'fetch');
      fetch.onCall(0).returns(Promise.resolve(response));
      fetch.onCall(1).returns(rejected);
    });

    describe('when response is ok', () => {
      beforeEach(() => {
        response.ok = true;
      });

      it('prunes previous cached responses for file', () => {
        return sw.fetchJsFile(cache, request, rtv, '/v0.js').then(() => {
          return new Promise(resolve => setTimeout(resolve, 25));
        }).then(() => {
          expect(deleter).to.have.been.calledWith(cache.cached[0][0]);
          expect(deleter).to.not.have.been.calledWith(cache.cached[1][0]);
        });
      });

      describe('when diversions request fails', () => {
        it('does not prune new production of new script', () => {
          return sw.fetchJsFile(cache, request, rtv, '/v0.js').then(() => {
            return new Promise(resolve => setTimeout(resolve, 25));
          }).then(() => {
            expect(deleter).to.not.have.been.calledWith(cache.cached[4][0]);
          });
        });

        it('does not prune production of any other script', () => {
          return sw.fetchJsFile(cache, request, rtv, '/v0.js').then(() => {
            return new Promise(resolve => setTimeout(resolve, 25));
          }).then(() => {
            expect(deleter).to.not.have.been.calledWith(cache.cached[1][0]);
          });
        });

        it('does not prune diversions of new script', () => {
          return sw.fetchJsFile(cache, request, rtv, '/v0.js').then(() => {
            return new Promise(resolve => setTimeout(resolve, 25));
          }).then(() => {
            expect(deleter).to.not.have.been.calledWith(cache.cached[2][0]);
          });
        });

        it('does not prune diversions of any other script', () => {
          return sw.fetchJsFile(cache, request, rtv, '/v0.js').then(() => {
            return new Promise(resolve => setTimeout(resolve, 25));
          }).then(() => {
            expect(deleter).to.not.have.been.calledWith(cache.cached[3][0]);
          });
        });
      });

      describe('when diversions request succeeds with diversions', () => {
        beforeEach(() => {
          fetch.onCall(1).returns(Promise.resolve(
              new Response(`["${diversionRtv}","${prevDiversionRtv}"]`)));
          fetch.onCall(2).returns(Promise.resolve(new Response('02')));
          fetch.onCall(3).returns(Promise.resolve(new Response('03')));
        });

        function waitForDiversions() {
          return sw.fetchJsFile(cache, request, rtv, '/v0.js').then(() => {
            const setTimeout =
                sandbox.stub(window, 'setTimeout').callsFake(callback => {
                  setTimeout.restore();
                  callback();
                });
            return sw.diversions(cache).then(() => {
              return new Promise(resolve => setTimeout(resolve, 10));
            });
          });
        }

        it('fetches new diversions', () => {
          return waitForDiversions().then(() => {
            expect(fetch).calledThrice;
            expect(fetch.getCall(2).args[0].url).to.equal(
                `https://cdn.ampproject.org/rtv/${diversionRtv}/v0.js`);
          });
        });

        it('does not prune new production of new script', () => {
          return waitForDiversions().then(() => {
            expect(deleter).to.not.have.been.calledWith(cache.cached[4][0]);
          });
        });

        it('does not prune production of any other script', () => {
          return waitForDiversions().then(() => {
            expect(deleter).to.not.have.been.calledWith(cache.cached[1][0]);
          });
        });

        it('prunes old diversions of new script', () => {
          // Remove prevDiversionRtv from diversions response
          fetch.onCall(1).returns(Promise.resolve(
              new Response(`["${diversionRtv}"]`)));
          return waitForDiversions().then(() => {
            expect(deleter).to.have.been.calledWith(cache.cached[2][0]);
          });
        });

        it('prunes old diversions of any other script', () => {
          // Remove prevDiversionRtv from diversions response
          fetch.onCall(1).returns(Promise.resolve(
              new Response(`["${diversionRtv}"]`)));
          return waitForDiversions().then(() => {
            expect(deleter).to.have.been.calledWith(cache.cached[3][0]);
          });
        });

        it('does not prune current diversion of new script', () => {
          // prevDiversionRtv is in diversions response
          return waitForDiversions().then(() => {
            expect(deleter).to.not.have.been.calledWith(cache.cached[2][0]);
          });
        });
        it('does not prune current diversion of any other script', () => {
          // prevDiversionRtv is in diversions response
          return waitForDiversions().then(() => {
            expect(deleter).to.not.have.been.calledWith(cache.cached[3][0]);
          });
        });
      });
    });

    describe('when a diversion is requested by page', () => {
      const request = {
        url: `https://cdn.ampproject.org/rtv/${diversionRtv}/v0.js`,
      };

      beforeEach(() => {
        fetch.onCall(1).returns(Promise.resolve(
            new Response(`["${diversionRtv}","${prevDiversionRtv}"]`)));
        fetch.onCall(2).returns(Promise.resolve(new Response('02')));
        fetch.onCall(3).returns(Promise.resolve(new Response('03')));
      });

      function waitForDiversions() {
        return sw.fetchJsFile(cache, request, diversionRtv, '/v0.js')
            .then(() => {
              const setTimeout =
                  sandbox.stub(window, 'setTimeout').callsFake(cb => {
                    setTimeout.restore();
                    cb();
                  });
              return sw.diversions(cache).then(() => {
                return new Promise(resolve => setTimeout(resolve, 10));
              });
            });
      }

      it('fetches new diversions', () => {
        return waitForDiversions().then(() => {
          expect(fetch).calledTwice;
          expect(fetch.getCall(0).args[0].url).to.equal(
              `https://cdn.ampproject.org/rtv/${diversionRtv}/v0.js`);
        });
      });

      it('does not prune production of new script', () => {
        return waitForDiversions().then(() => {
          expect(deleter).to.not.have.been.calledWith(cache.cached[4][0]);
        });
      });

      it('does not prune production of any other script', () => {
        return waitForDiversions().then(() => {
          expect(deleter).to.not.have.been.calledWith(cache.cached[1][0]);
        });
      });

      it('prunes old diversions of new script', () => {
        // Remove prevDiversionRtv from diversions response
        fetch.onCall(1).returns(Promise.resolve(
            new Response(`["${diversionRtv}"]`)));
        return waitForDiversions().then(() => {
          expect(deleter).to.have.been.calledWith(cache.cached[2][0]);
        });
      });

      it('prunes old diversions of any other script', () => {
        // Remove prevDiversionRtv from diversions response
        fetch.onCall(1).returns(Promise.resolve(
            new Response(`["${diversionRtv}"]`)));
        return waitForDiversions().then(() => {
          expect(deleter).to.have.been.calledWith(cache.cached[3][0]);
        });
      });

      it('does not prune current diversion of new script', () => {
        // prevDiversionRtv is in diversions response
        return waitForDiversions().then(() => {
          expect(deleter).to.not.have.been.calledWith(cache.cached[2][0]);
        });
      });
      it('does not prune current diversion of any other script', () => {
        // prevDiversionRtv is in diversions response
        return waitForDiversions().then(() => {
          expect(deleter).to.not.have.been.calledWith(cache.cached[3][0]);
        });
      });
    });

    describe('when response is not ok', () => {
      beforeEach(() => {
        response.ok = false;
      });

      it('does not prune requests for file', () => {
        return sw.fetchJsFile(cache, request, rtv, '/v0.js').catch(() => {
          return new Promise(resolve => setTimeout(resolve, 25));
        }).then(() => {
          expect(deleter).to.not.have.been.called;
        });
      });
    });
  });

  describe('getCachedVersion', () => {
    let keys;
    beforeEach(() => {
      keys = [{url: `https://cdn.ampproject.org/rtv/${prevRtv}/v0.js`}];
      sandbox.stub(cache, 'keys').callsFake(() => {
        return Promise.resolve(keys);
      });
    });

    it('returns cached rtv version, if file is cached', () => {
      return sw.getCachedVersion(cache, rtv, '/v0.js').then(version => {
        expect(version).to.equal(prevRtv);
      });
    });

    it('defaults to requested version, if file no files are cached', () => {
      keys.length = 0;
      return sw.getCachedVersion(cache, prevRtv, '/v0.js')
          .then(version => {
            expect(version).to.equal(prevRtv);
          });
    });

    it('returns version with most responses', () => {
      keys.splice(0, 1,
          {url: `https://cdn.ampproject.org/rtv/${prevRtv}/v0/amp-1-0.1.js`},
          {url: `https://cdn.ampproject.org/rtv/${prevRtv}/v0/amp-2-0.1.js`},
          {url: `https://cdn.ampproject.org/rtv/${rtv}/v0/amp-3-0.1.js`});
      return sw.getCachedVersion(cache, rtv, '/v0.js').then(version => {
        expect(version).to.equal(prevRtv);
      });
    });

    it('weights requested file cached version', () => {
      keys.splice(0, 1,
          {url: `https://cdn.ampproject.org/rtv/${prevRtv}/v0/amp-1-0.1.js`},
          {url: `https://cdn.ampproject.org/rtv/${prevRtv}/v0/amp-2-0.1.js`},
          {url: `https://cdn.ampproject.org/rtv/${rtv}/v0/amp-3-0.1.js`},
          {url: `https://cdn.ampproject.org/rtv/${rtv}/v0/amp-4-0.1.js`});

      return sw.getCachedVersion(cache, '01123', '/v0/amp-4-0.1.js')
          .then(version => {
            expect(version).to.equal(rtv);
          });
    });

    it('heavily weights main binary version', () => {
      keys.splice(0, 1,
          {url: `https://cdn.ampproject.org/rtv/${prevRtv}/v0/amp-1-0.1.js`},
          {url: `https://cdn.ampproject.org/rtv/${prevRtv}/v0/amp-2-0.1.js`},
          {url: `https://cdn.ampproject.org/rtv/${prevRtv}/v0/amp-3-0.1.js`},
          {url: `https://cdn.ampproject.org/rtv/${rtv}/v0.js`});
      return sw.getCachedVersion(cache, '01123', '/v0.js')
          .then(version => {
            expect(version).to.equal(rtv);
          });
    });

    it('ignores cached blacklisted versions', () => {
      keys.splice(0, 1,
          {url: `https://cdn.ampproject.org/rtv/${blacklistedRtv}/v0.js`},
          {url: `https://cdn.ampproject.org/rtv/${blacklistedRtv}/v0/amp-2-0.1.js`},
          {url: `https://cdn.ampproject.org/rtv/${prevRtv}/v0/amp-3-0.1.js`});
      return sw.getCachedVersion(cache, rtv, '/v0.js').then(version => {
        expect(version).to.equal(prevRtv);
      });
    });

    it('ignores cached diversions', () => {
      keys.splice(0, 1,
          {url: `https://cdn.ampproject.org/rtv/${diversionRtv}/v0.js`},
          {url: `https://cdn.ampproject.org/rtv/${diversionRtv}/v0/amp-2-0.1.js`},
          {url: `https://cdn.ampproject.org/rtv/${prevRtv}/v0/amp-3-0.1.js`});
      return sw.getCachedVersion(cache, rtv, '/v0.js').then(version => {
        expect(version).to.equal(prevRtv);
      });
    });

    describe('when requesting diversion', () => {
      it('returns diversion explicitly', () => {
        return sw.getCachedVersion(cache, diversionRtv, '/v0.js')
            .then(version => {
              expect(version).to.equal(diversionRtv);
            });
      });

      it('returns diversion explicitly, even with previous diversion', () => {
        keys.splice(0, 1,
            {url: `https://cdn.ampproject.org/rtv/${prevDiversionRtv}/v0.js`});
        return sw.getCachedVersion(cache, diversionRtv, '/v0.js')
            .then(version => {
              expect(version).to.equal(diversionRtv);
            });
      });
    });
  });

  describe('handleFetch', () => {
    const prodUrl = `https://cdn.ampproject.org/rtv/${prodRtv}/v0.js`;
    let clientId = 0;
    let fetch;

    let request;
    let compRequest;
    let prevRequest;
    let blacklistedRequest;

    function responseFromRequest(req) {
      const res = new Response('');
      Object.defineProperty(res, 'url', {value: req.url});
      sandbox.stub(res, 'clone').callsFake(() => res);
      return res;
    }

    beforeEach(() => {
      request = new Request(url);
      compRequest = new Request(`https://cdn.ampproject.org/rtv/${rtv}/v0/amp-comp-0.1.js`);
      prevRequest = new Request(`https://cdn.ampproject.org/rtv/${prevRtv}/v0/amp-comp-0.1.js`);
      blacklistedRequest = new Request(`https://cdn.ampproject.org/rtv/${blacklistedRtv}/v0/amp-comp-0.1.js`);

      clientId++;
      fetch = sandbox.stub(window, 'fetch').callsFake(req => {
        return Promise.resolve(responseFromRequest(req));
      });
    });

    it('does nothing without a clientId', () => {
      expect(sw.handleFetch(request, undefined)).to.be.null;
    });

    it('does nothing for non-CdnJs files', () => {
      const request = new Request(`${url}on`);
      expect(sw.handleFetch(request, clientId)).to.be.null;
    });

    describe('with non-RTV request', () => {
      let rtvless;

      beforeEach(() => {
        rtvless = new Request('https://cdn.ampproject.org/v0.js');
      });

      it('fetches current prod RTV', () => {
        return sw.handleFetch(rtvless, clientId).then(resp => {
          expect(resp.url).to.equal(prodUrl);
          expect(cache.cached[0][0].url).to.equal(prodUrl);
          expect(cache.cached[0][1]).to.equal(resp);
        });
      });

      it('forces later fetches to use same prod RTV', () => {
        return sw.handleFetch(rtvless, clientId).then(() => {
          return sw.handleFetch(compRequest, clientId);
        }).then(resp => {
          expect(rtvVersion(resp.url)).to.equal(rtvVersion(prodUrl));
        });
      });
    });

    describe('with RTV request', () => {
      it('fetches the request', () => {
        return sw.handleFetch(request, clientId).then(resp => {
          expect(resp.url).to.equal(url);
          expect(cache.cached[0][0].url).to.equal(url);
          expect(cache.cached[0][1]).to.equal(resp);
        });
      });

      it('forces later fetches to use same RTV', () => {
        return sw.handleFetch(request, clientId).then(() => {
          return sw.handleFetch(prevRequest, clientId);
        }).then(resp => {
          expect(rtvVersion(resp.url)).to.equal(rtvVersion(request.url));
        });
      });

      describe('with cached files', () => {
        beforeEach(() => {
          cache.cached.push([prevRequest, responseFromRequest(prevRequest)]);
        });

        describe('with multiple parallel requests', () => {
          it('forces uniform RTV version of winner', () => {
            return Promise.all([
              sw.handleFetch(request, clientId),
              sw.handleFetch(compRequest, clientId),
            ]).then(responses => {
              expect(rtvVersion(responses[0].url)).to.equal(
                  rtvVersion(prevRequest.url));
              expect(rtvVersion(responses[1].url)).to.equal(
                  rtvVersion(prevRequest.url));
            });
          });
        });

        it('fulfills with cached version', () => {
          return sw.handleFetch(compRequest, clientId).then(resp => {
            expect(resp.url).to.equal(prevRequest.url);
          });
        });

        it('forces later fetches to use same RTV', () => {
          return sw.handleFetch(compRequest, clientId).then(() => {
            return sw.handleFetch(request, clientId);
          }).then(resp => {
            expect(rtvVersion(resp.url)).to.equal(
                rtvVersion(prevRequest.url));
          });
        });

        describe('with blacklisted file', () => {
          beforeEach(() => {
            cache.cached.splice(0, 1,
                [blacklistedRequest, responseFromRequest(blacklistedRequest)]);
          });

          it('will cache the blacklisted file', () => {
            return sw.handleFetch(blacklistedRequest, clientId).then(() => {
              expect(fetch).to.not.have.been.called;
            });
          });

          it('will not stale-serve blacklisted cache version', () => {
            return sw.handleFetch(compRequest, clientId).then(resp => {
              expect(resp.url).to.equal(compRequest.url);
            });
          });
        });

        it('updates cached file if new one is the latest RTV', () => {
          const prodRequest = new Request(
              `https://cdn.ampproject.org/rtv/${prodRtv}/v0/amp-comp-0.1.js`);
          return sw.handleFetch(prodRequest, clientId).then(() => {
            return new Promise(resolve => {
              // Update is out of band with response.
              setTimeout(resolve, 50);
            });
          }).then(() => {
            expect(cache.cached[0][0]).to.equal(prodRequest);
          });
        });

        it('leaves cached file if new one is not the latest RTV', () => {
          cache.cached.splice(1, 1,
              [compRequest, responseFromRequest(compRequest)]);
          return sw.handleFetch(prevRequest, clientId).then(() => {
            return new Promise(resolve => {
              // Update is out of band with response.
              setTimeout(resolve, 50);
            });
          }).then(() => {
            expect(cache.cached[1][0]).to.equal(compRequest);
          });
        });
      });

      describe('without cached files', () => {
        describe('with multiple parallel requests', () => {
          it('forces uniform RTV version of winner', () => {
            return Promise.all([
              sw.handleFetch(request, clientId),
              sw.handleFetch(prevRequest, clientId),
            ]).then(responses => {
              expect(rtvVersion(responses[0].url)).to.equal(
                  rtvVersion(request.url));
              expect(rtvVersion(responses[1].url)).to.equal(
                  rtvVersion(request.url));
            });
          });
        });
      });
    });
  });
});
