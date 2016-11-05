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

import {cidFor} from '../../src/cid';
import {
  installCidService,
  getProxySourceOrigin,
} from '../../extensions/amp-analytics/0.1/cid-impl';
import {installCryptoService, Crypto,}
    from '../../extensions/amp-analytics/0.1/crypto-impl';
import {installDocService} from '../../src/service/ampdoc-impl';
import {parseUrl} from '../../src/url';
import {timerFor} from '../../src/timer';
import {installPlatformService} from '../../src/service/platform-impl';
import {installViewerServiceForDoc} from '../../src/service/viewer-impl';
import {installTimerService} from '../../src/service/timer-impl';
import * as sinon from 'sinon';

const DAY = 24 * 3600 * 1000;

describe('cid', () => {

  let isIframed;
  let sandbox;
  let clock;
  let fakeWin;
  let ampdoc;
  let storage;
  let viewerStorage;
  let cid;
  let crypto;
  let viewerBaseCidStub;
  let whenFirstVisible;

  const hasConsent = Promise.resolve();
  const timer = timerFor(window);

  beforeEach(() => {
    let call = 1;
    isIframed = false;
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    whenFirstVisible = Promise.resolve();
    storage = {};
    viewerStorage = null;
    fakeWin = {
      localStorage: {
        setItem: (key, value) => {
          expect(key).to.equal('amp-cid');
          expect(value).to.be.string;
          storage[key] = value;
        },
        getItem: key => {
          expect(key).to.equal('amp-cid');
          return storage[key];
        },
      },
      location: {
        href: 'https://cdn.ampproject.org/v/www.origin.com/foo/?f=0',
      },
      crypto: {
        getRandomValues: array => {
          array[0] = call++;
          array[1] = 2;
          array[2] = 3;
          array[15] = 15;
        },
      },
      document: {
        nodeType: /* DOCUMENT */ 9,
        body: {},
      },
      navigator: window.navigator,
      ampExtendedElements: {
        'amp-analytics': true,
      },
      setTimeout: window.setTimeout,
    };
    fakeWin.document.defaultView = fakeWin;
    const ampdocService = installDocService(fakeWin, /* isSingleDoc */ true);
    ampdoc = ampdocService.getAmpDoc();
    installTimerService(fakeWin);
    installPlatformService(fakeWin);
    const viewer = installViewerServiceForDoc(ampdoc);
    sandbox.stub(viewer, 'isIframed', function() {
      return isIframed;
    });
    sandbox.stub(viewer, 'whenFirstVisible', function() {
      return whenFirstVisible;
    });
    viewerBaseCidStub = sandbox.stub(viewer, 'baseCid', function(opt_data) {
      if (opt_data) {
        viewerStorage = opt_data;
      }
      return Promise.resolve(viewerStorage || undefined);
    });

    return Promise
        .all([installCidService(fakeWin), installCryptoService(fakeWin)])
        .then(results => {
          cid = results[0];
          crypto = results[1];
          crypto.sha384Base64 = val => {
            if (val instanceof Uint8Array) {
              val = '[' + Array.apply([], val).join(',') + ']';
            }

            return Promise.resolve('sha384(' + val + ')');
          };
        });
  });

  afterEach(() => {
    window.localStorage.removeItem('amp-cid');
    sandbox.restore();
  });

  it('should depend on external id e1', () => {
    clock.tick(123);
    return compare(
        'e1',
        'sha384(sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])http://www.origin.come1)').then(() => {
          expect(storage['amp-cid']).to.be.string;
          const stored = JSON.parse(storage['amp-cid']);
          expect(stored.cid).to.equal(
              'sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])');
          expect(stored.time).to.equal(123);
        });
  });

  it('should depend on external id e2', () => {
    return compare(
        'e2',
        'sha384(sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])http://www.origin.come2)');
  });

  it('should depend on domain', () => {
    fakeWin.location.href =
        'https://cdn.ampproject.org/v/www.DIFFERENT.com/foo/?f=0';
    return compare(
        'e2',
        'sha384(sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])http://www.different.come2)');
  });

  it('should fallback to cookie value on custom domain.', () => {
    fakeWin.location.href =
        'https://abc.org/v/www.DIFFERENT.com/foo/?f=0';
    fakeWin.document.cookie = 'cookie_name=12345;';
    return compare(
        'cookie_name',
        '12345');
  });

  it('should depend fall back to cookies on custom ' +
      'domain and not create a cookie', () => {
    fakeWin.location.href =
        'https://some.domain/v/www.DIFFERENT.com/foo/?f=0';
    fakeWin.document.cookie = 'cookie_name=12345;';
    return compare(
        'other_cookie',
        null);
  });

  it('should produce golden value', () => {
    crypto.sha384Base64 = new Crypto(fakeWin).sha384Base64;
    return compare(
        'e2',
        'q0pPfZTWGruPrtURDJHexzs-MgOkt9SJAsAZodzr8tx8hKv8BS62AVpbttaFX8fK');
  });

  it('should be stable with respect to a saved seed', () => {
    const expected = 'sha384(sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])http://www.origin.come2)';
    return compare('e2', expected).then(() => {
      return compare('e2', expected).then(() => {
        storage['amp-cid'] = undefined;
        removeMemoryCacheOfCid();
        return compare(
            'e2',
            'sha384(sha384([' +
            // 2 because we increment the first value on each random
            // call.
            '2' +
            ',2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])http://www.origin.come2)');
      });
    });
  });

  it('should pick up the cid value from storage', () => {
    storage['amp-cid'] = JSON.stringify({
      cid: 'YYY',
      time: Date.now(),
    });
    return compare(
        'e2',
        'sha384(YYYhttp://www.origin.come2)');
  });

  it('should read from viewer storage if embedded', () => {
    isIframed = true;
    const expectedBaseCid = 'from-viewer';
    viewerStorage = JSON.stringify({
      time: 0,
      cid: expectedBaseCid,
    });
    return Promise.all([
      compare('e1', `sha384(${expectedBaseCid}http://www.origin.come1)`),
      compare('e2', `sha384(${expectedBaseCid}http://www.origin.come2)`),
    ]).then(() => {
      expect(viewerBaseCidStub).to.be.calledOnce;
      expect(viewerBaseCidStub).to.not.be.calledWith(sinon.match.string);

      // Ensure it's called only once since we cache it in memory.
      return compare('e3', `sha384(${expectedBaseCid}http://www.origin.come3)`);
    }).then(() => {
      expect(viewerBaseCidStub).to.be.calledOnce;
      expect(viewerBaseCidStub).to.not.be.calledWith(sinon.match.string);
      return expect(cid.baseCid_).to.eventually.equal(expectedBaseCid);
    });
  });

  it('should store to viewer storage if embedded', () => {
    isIframed = true;
    const expectedBaseCid = 'sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])';
    return compare('e2', `sha384(${expectedBaseCid}http://www.origin.come2)`)
        .then(() => {
          expect(viewerBaseCidStub).to.be.calledWith(JSON.stringify({
            time: 0,
            cid: expectedBaseCid,
          }));

          // Ensure it's called only once since we cache it in memory.
          return compare('e3', `sha384(${expectedBaseCid}http://www.origin.come3)`);
        })
        .then(() => {
          expect(viewerBaseCidStub).to.be.calledWith(sinon.match.string);
          return expect(cid.baseCid_).to.eventually.equal(expectedBaseCid);
        });
  });

  it('should prefer value in storage if present', () => {
    isIframed = true;
    storage['amp-cid'] = JSON.stringify({
      cid: 'in-storage',
      time: Date.now(),
    });
    return compare(
        'e2',
        'sha384(in-storagehttp://www.origin.come2)');
  });

  it('should work without mocking', () => {
    const win = {
      location: {
        href: 'https://cdn.ampproject.org/v/www.origin.com/',
      },
      services: {},
      ampExtendedElements: {
        'amp-analytics': true,
      },
    };
    win.__proto__ = window;
    expect(win.location.href).to.equal('https://cdn.ampproject.org/v/www.origin.com/');
    installTimerService(win);
    installPlatformService(win);
    installViewerServiceForDoc(ampdoc).isIframed = () => false;
    installCidService(win);
    installCryptoService(win);
    return cidFor(win).then(cid => {
      return cid.get('foo', hasConsent).then(c1 => {
        return cid.get('foo', hasConsent).then(c2 => {
          expect(c1).to.equal(c2);
          window.localStorage.removeItem('amp-cid');
          removeMemoryCacheOfCid(cid);
          return cid.get('foo', hasConsent).then(c3 => {
            expect(c1).to.not.equal(c3);
          });
        });
      });
    });
  });

  it('should expire on read after 365 days', () => {
    const expected = 'sha384(sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])http://www.origin.come2)';
    return compare('e2', expected).then(() => {
      clock.tick(364 * DAY);
      return compare('e2', expected).then(() => {
        clock.tick(365 * DAY + 1);
        removeMemoryCacheOfCid();
        return compare(
            'e2',
            'sha384(sha384([' +
            // 2 because we increment the first value on each random
            // call.
            '2' +
            ',2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])http://www.origin.come2)');
      });
    });
  });

  it('should expire on read after 365 days when embedded', () => {
    isIframed = true;
    const expectedBaseCid = 'from-viewer';
    viewerStorage = JSON.stringify({
      time: 0,
      cid: expectedBaseCid,
    });

    const expectedIdFromViewer = 'sha384(from-viewerhttp://www.origin.come2)';
    const expectedNewId = 'sha384(sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])http://www.origin.come2)';
    return compare('e2', expectedIdFromViewer).then(() => {
      clock.tick(364 * DAY);
      return compare('e2', expectedIdFromViewer).then(() => {
        clock.tick(365 * DAY + 1);
        removeMemoryCacheOfCid();
        return compare('e2', expectedNewId);
      });
    });
  });

  it('should set last access time once a day', () => {
    const expected = 'sha384(sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])http://www.origin.come2)';
    function getStoredTime() {
      return JSON.parse(storage['amp-cid']).time;
    }
    clock.tick(100);
    return compare('e2', expected).then(() => {
      expect(getStoredTime()).to.equal(100);
      removeMemoryCacheOfCid();
      clock.tick(3600);
      return compare('e2', expected).then(() => {
        expect(getStoredTime()).to.equal(100);
        removeMemoryCacheOfCid();
        clock.tick(DAY);
        return compare('e2', expected).then(() => {
          expect(getStoredTime()).to.equal(100 + 3600 + DAY);
        });
      });
    });
  });

  it('should set last access time once a day when embedded', () => {
    isIframed = true;
    const expected = 'sha384(sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])http://www.origin.come2)';
    function getStoredTime() {
      return JSON.parse(viewerStorage).time;
    }
    clock.tick(100);
    return compare('e2', expected).then(() => {
      expect(getStoredTime()).to.equal(100);
      removeMemoryCacheOfCid();
      clock.tick(3600);
      return compare('e2', expected).then(() => {
        expect(getStoredTime()).to.equal(100);
        removeMemoryCacheOfCid();
        clock.tick(DAY);
        return compare('e2', expected).then(() => {
          expect(getStoredTime()).to.equal(100 + 3600 + DAY);
        });
      });
    });
  });

  it('should wait until after pre-rendering', () => {
    let nonce = 'not visible';
    whenFirstVisible = timer.promise(100).then(() => {
      nonce = 'visible';
    });
    const p = cid.get('test', hasConsent).then(unusedC => {
      expect(nonce).to.equal('visible');
    });
    clock.tick(100);
    return p;
  });

  it('should wait for consent', () => {
    let nonce = 'before';
    const consent = timer.promise(100).then(() => {
      nonce = 'timer fired';
    });
    const p = cid.get('test', consent).then(unusedC => {
      expect(nonce).to.equal('timer fired');
    });
    clock.tick(100);
    return p;
  });

  it('should fail on failed consent', () => {
    return expect(cid.get('abc', Promise.reject())).to.be.rejected;
  });

  it('should fail on invalid scope', () => {
    expect(() => {
      cid.get('$$$', Promise.resolve());
    }).to.throw(/\$\$\$/);
  });

  it('should not store until persistence promise resolves', () => {
    let resolve;
    const persistencePromise = new Promise(r => {
      resolve = r;
    });

    let sha384Promise;
    crypto.sha384Base64 = val => {
      if (val instanceof Uint8Array) {
        val = '[' + Array.apply([], val).join(',') + ']';
      }

      return sha384Promise = Promise.resolve('sha384(' + val + ')');
    };

    return cid.get('e2', hasConsent, persistencePromise).then(c => {
      expect(c).to.equal('sha384(sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])http://www.origin.come2)');
      expect(storage['amp-cid']).to.be.undefined;
      clock.tick(777);
      resolve();
      return Promise.all([persistencePromise, sha384Promise]).then(() => {
        expect(storage['amp-cid']).to.be.string;
        const stored = JSON.parse(storage['amp-cid']);
        expect(stored.cid).to.equal(
            'sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])');
        expect(stored.time).to.equal(777);
      });
    });
  });

  it('should not wait persistence consent for viewer storage', () => {
    isIframed = true;
    const persistencePromise = new Promise(() => {/* never resolves */});
    return cid.get('e2', hasConsent, persistencePromise).then(() => {
      expect(viewerStorage).to.equal(JSON.stringify({
        time: 0,
        cid: 'sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])',
      }));
    });
  });

  it('fallback with no window.crypto', () => {
    fakeWin.crypto = undefined;
    fakeWin.screen = {
      width: '111',
      height: '222',
    };
    fakeWin.Math = {
      random: () => {
        return 999;
      },
    };
    clock.tick(7777);
    return compare(
        'e2',
        'sha384(sha384(https://cdn.ampproject.org/v' +
        '/www.origin.com/foo/?f=07777999111222)http://www.origin.come2)');
  });

  it('should NOT create fallback cookie by default with string scope', () => {
    fakeWin.location.href =
        'https://abc.org/v/www.DIFFERENT.com/foo/?f=0';
    return cid.get('cookie_name', hasConsent).then(c => {
      expect(c).to.not.exist;
      expect(fakeWin.document.cookie).to.not.exist;
    });
  });

  it('should NOT create fallback cookie by default with struct scope', () => {
    fakeWin.location.href =
        'https://abc.org/v/www.DIFFERENT.com/foo/?f=0';
    return cid.get({scope: 'cookie_name'}, hasConsent).then(c => {
      expect(c).to.not.exist;
      expect(fakeWin.document.cookie).to.not.exist;
    });
  });

  it('should create fallback cookie when asked', () => {
    fakeWin.location.href =
        'https://foo.abc.org/v/www.DIFFERENT.com/foo/?f=0';
    fakeWin.location.hostname = 'foo.abc.org';
    return cid.get({scope: 'cookie_name', createCookieIfNotPresent: true},
        hasConsent).then(c => {
          expect(c).to.exist;
          expect(c).to.equal('amp-sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])');
          expect(fakeWin.document.cookie).to.equal(
              'cookie_name=' + encodeURIComponent(c) +
              '; path=/' +
              '; domain=abc.org' +
              '; expires=Fri, 01 Jan 1971 00:00:00 GMT');  // 1 year from 0.
        });
  });

  it('should update fallback cookie expiration when present', () => {
    fakeWin.location.href = 'https://foo.abc.org/v/www.DIFFERENT.com/foo/?f=0';
    fakeWin.location.hostname = 'foo.abc.org';
    fakeWin.document.cookie = 'cookie_name=amp-12345';

    return cid.get('cookie_name', hasConsent).then(c => {
      expect(fakeWin.document.cookie).to.equal(
        'cookie_name=' + encodeURIComponent(c) +
        '; path=/' +
        '; domain=abc.org' +
        '; expires=Fri, 01 Jan 1971 00:00:00 GMT'  // 1 year from 0.
      );
    });
  });

  it('should not update expiration when created externally', () => {
    fakeWin.location.href = 'https://foo.abc.org/v/www.DIFFERENT.com/foo/?f=0';
    fakeWin.location.hostname = 'foo.abc.org';
    fakeWin.document.cookie = 'cookie_name=12345';

    return cid.get('cookie_name', hasConsent).then(() => {
      expect(fakeWin.document.cookie).to.equal('cookie_name=12345');
    });
  });

  it('should return same value for multiple calls on non-proxied urls', () => {
    fakeWin.location.href = 'https://abc.org/foo/?f=0';
    fakeWin.location.hostname = 'foo.abc.org';
    const cid1 = cid.get({scope: 'cookie', createCookieIfNotPresent: true},
        hasConsent);
    const cid2 = cid.get({scope: 'cookie', createCookieIfNotPresent: true},
        hasConsent);
    return cid1.then(c1 => {
      return cid2.then(c2 => {
        expect(c1).to.equal(c2);
      });
    });
  });

  it('should return same value for multiple calls on proxied urls', () => {
    fakeWin.location.href = 'https://cdn.ampproject.org/v/abc.org/foo/?f=0';
    fakeWin.location.hostname = 'cdn.ampproject.org';
    const cid1 = cid.get({scope: 'cookie', createCookieIfNotPresent: true},
        hasConsent);
    return cid1.then(c1 => {
      const cid2 = cid.get({scope: 'cookie', createCookieIfNotPresent: true},
          hasConsent);
      return cid2.then(c2 => {
        expect(c1).to.equal(c2);
      });
    });
  });

  it('should retreive cookie value with . in name', () => {
    fakeWin.location.href =
        'https://abc.org/';
    fakeWin.document.cookie = '_sp_id.44=4567;';
    return compare(
        '_sp_id.44',
        '4567');
  });

  function compare(externalCidScope, compareValue) {
    return cid.get(externalCidScope, hasConsent).then(c => {
      expect(c).to.equal(compareValue);
    });
  }

  function removeMemoryCacheOfCid(opt_cid) {
    (opt_cid || cid).baseCid_ = null;
  }
});

describe('getProxySourceOrigin', () => {
  it('should fail on non-proxy origin', () => {
    expect(() => {
      getProxySourceOrigin(parseUrl('https://abc.org/v/foo.com/'));
    }).to.throw(/Expected proxy origin/);
  });
});
