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
import {timerFor} from '../../src/timer';

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
        return Promise.resolve(this.cached[i][1]);
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
  const rtv = `00${version}`;
  const file = 'v0.js';
  const url = `https://cdn.ampproject.org/rtv/${rtv}/${file}`;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
    cache.cached.length = 0;
  });

  describe('rtvVersion', () => {
    it('matches the RTV version of a url', () => {
      expect(sw.rtvVersion(url)).to.equal(rtv);
    });

    it('defaults RTV-less url to the current prod rtv', () => {
      const rtvless = url.replace(/rtv\/\d+\//, '');
      expect(sw.rtvVersion(rtvless)).to.equal(`01${version}`);
    });

    it('only recognizes prefix and timestamp RTVs', () => {
      const prefixless = url.replace(rtv, version);
      expect(sw.rtvVersion(prefixless)).to.equal(`01${version}`);
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
      // We blacklist AmpVersions (regardless of prefix).
      expect(sw.isBlacklisted(`00${blacklisted}`)).to.be.true;
      expect(sw.isBlacklisted(`01${blacklisted}`)).to.be.true;
      expect(sw.isBlacklisted(`02${blacklisted}`)).to.be.true;
    });

    it('ignores anything in the blacklist AMP_CONFIG', () => {
      expect(sw.isBlacklisted(version)).to.be.false;
    });
  });

  describe('fetchAndCache', () => {
    const request = {url};
    const response = {
      ok: true,
      clone() {},
    };
    let fetch;
    let put;

    beforeEach(() => {
      // "Previous" cached requests
      cache.cached.push(
        [{url: url.replace(/\d+/, '1234')}, null],
        // A different file
        [{url: url.replace('v0.js', 'v0/amp-comp.js')}, null]
      );
      fetch = sandbox.stub(window, 'fetch', () => {
        return Promise.resolve(response);
      });
      put = sandbox.spy(cache, 'put');
    });

    describe('when response is ok', () => {
      beforeEach(() => {
        response.ok = true;
      });

      it('fetches the request', () => {
        return sw.fetchAndCache(cache, request, file, rtv).then(resp => {
          expect(fetch).to.have.been.called;
          expect(resp).to.equal(response);
        });
      });

      it('stores response into cache', () => {
        const cloned = {};
        sandbox.stub(response, 'clone', () => cloned);
        return sw.fetchAndCache(cache, request, file, rtv).then(() => {
          expect(put).to.have.been.calledWith(request, cloned);
        });
      });

      it('prunes previous cached responses for file', () => {
        const deleter = sandbox.stub(cache, 'delete');
        return sw.fetchAndCache(cache, request, file, rtv).then(() => {
          expect(deleter).to.have.been.calledWith(cache.cached[0][0]);
          expect(deleter).to.not.have.been.calledWith(cache.cached[1][0]);
        });
      });
    });

    describe('when response is not ok', () => {
      beforeEach(() => {
        response.ok = false;
      });

      it('fetches the request', () => {
        return sw.fetchAndCache(cache, request, file, rtv).then(resp => {
          expect(resp).to.equal(response);
        });
      });

      it('does not store response into cache', () => {
        return sw.fetchAndCache(cache, request, file, rtv).then(() => {
          expect(put).to.not.have.been.called;
        });
      });

      it('does not prune requests for file', () => {
        const deleter = sandbox.stub(cache, 'delete');
        return sw.fetchAndCache(cache, request, file, rtv).then(() => {
          expect(deleter).to.not.have.been.called;
        });
      });
    });
  });

  describe('getCachedVersion', () => {
    beforeEach(() => {
      sandbox.stub(cache, 'keys', () => {
        return Promise.resolve([{url}]);
      });
    });
    it('returns cached rtv version, if file is cached', () => {
      return sw.getCachedVersion(cache, file).then(version => {
        expect(version).to.equal(rtv);
      });
    });

    it('returns empty string, if file is not cached', () => {
      return sw.getCachedVersion(cache, 'amp-comp.js').then(version => {
        expect(version).to.equal('');
      });
    });
  });

  describe('handleFetch', () => {
    const prod = url.replace('00', '01');
    const blacklisted = url.replace(version, '1313131313131');
    const request = new Request(url);
    const compRequest = new Request(url.replace('v0.js', 'amp-comp.js'));
    const otherVersion = new Request(url.replace(/(\d+)\/v0.js/, (match, v) => {
      return `00${parseInt(v, 10) - 1}/amp-comp.js`;
    }));
    const blacklistedRequest = new Request(
        blacklisted.replace('v0.js', 'amp-comp.js'));
    let clientId = 0;
    let fetch;

    function responseFromRequest(request) {
      return {
        ok: true,
        url: request.url,
        clone() {
          return this;
        },
      };
    }

    beforeEach(() => {
      clientId++;
      fetch = sandbox.stub(window, 'fetch', req => {
        return Promise.resolve({
          ok: true,
          url: req.url,
          clone() {
            return this;
          },
        });
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
      const rtvless = new Request(url.replace(/rtv\/\d+\//, ''));

      it('fetches current prod RTV', () => {
        return sw.handleFetch(rtvless, clientId).then(resp => {
          expect(resp.url).to.equal(prod);
          expect(cache.cached[0][0].url).to.equal(prod);
          expect(cache.cached[0][1]).to.equal(resp);
        });
      });

      it('forces later fetches to use same prod RTV', () => {
        return sw.handleFetch(rtvless, clientId).then(() => {
          return sw.handleFetch(compRequest, clientId);
        }).then(resp => {
          expect(sw.rtvVersion(resp.url)).to.equal(sw.rtvVersion(prod));
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
          return sw.handleFetch(otherVersion, clientId);
        }).then(resp => {
          expect(sw.rtvVersion(resp.url)).to.equal(sw.rtvVersion(request.url));
        });
      });

      describe('with multiple parallel requests', () => {
        it('forces uniform RTV version of winner', () => {
          const timer = timerFor(window);
          // First call will resolve after the first.
          const keys = sandbox.stub(cache, 'keys');
          keys.returns(Promise.resolve([]));
          keys.onCall(0).returns(timer.promise(100, []));
          return Promise.all([
            sw.handleFetch(request, clientId),
            sw.handleFetch(otherVersion, clientId),
          ]).then(responses => {
            expect(sw.rtvVersion(responses[0].url)).to.equal(sw.rtvVersion(
                otherVersion.url));
            expect(sw.rtvVersion(responses[1].url)).to.equal(sw.rtvVersion(
                otherVersion.url));
          });
        });
      });

      describe('with cached files', () => {
        beforeEach(() => {
          cache.cached.push([request, responseFromRequest(request)]);
          cache.cached.push([otherVersion, responseFromRequest(otherVersion)]);
        });

        it('fulfills with cached version', () => {
          return sw.handleFetch(compRequest, clientId).then(resp => {
            expect(resp.url).to.equal(otherVersion.url);
          });
        });

        it('forces later fetches to use same RTV', () => {
          return sw.handleFetch(compRequest, clientId).then(() => {
            return sw.handleFetch(request, clientId);
          }).then(resp => {
            expect(sw.rtvVersion(resp.url)).to.equal(sw.rtvVersion(
                otherVersion.url));
          });
        });

        describe('with blacklisted file', () => {
          beforeEach(() => {
            cache.cached.splice(1, 1,
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
          const prodRequest = new Request(prod.replace('v0.js', 'amp-comp.js'));
          return sw.handleFetch(prodRequest, clientId).then(() => {
            return new Promise(resolve => {
              // Update is out of band with response.
              setTimeout(resolve, 50);
            });
          }).then(() => {
            expect(cache.cached[1][0]).to.equal(prodRequest);
          });
        });

        it('leaves cached file if new one is not the latest RTV', () => {
          cache.cached.splice(1, 1,
              [compRequest, responseFromRequest(compRequest)]);
          return sw.handleFetch(otherVersion, clientId).then(() => {
            return new Promise(resolve => {
              // Update is out of band with response.
              setTimeout(resolve, 50);
            });
          }).then(() => {
            expect(cache.cached[1][0]).to.equal(compRequest);
          });
        });
      });
    });
  });
});
