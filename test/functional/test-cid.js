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
import {installCidService, getSourceOrigin, isProxyOrigin} from
    '../../src/service/cid-impl';
import {parseUrl} from '../../src/url';
import {timer} from '../../src/timer';
import * as sinon from 'sinon';

describe('cid', () => {

  let sandbox;
  let clock;
  let fakeWin;
  let storage;

  const hasConsent = Promise.resolve();

  beforeEach(() => {
    let call = 1;
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    storage = {};
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
        }
      },
      document: {},
      ampExtendedElements: {
        'amp-analytics': true
      }
    };
    installCidService(fakeWin);
    return cidFor(fakeWin).then(c => {
      cid = c;
      cid.origSha384Base64_ = cid.sha384Base64_;
      cid.sha384Base64_ = val => {
        if (val instanceof Array) {
          val = '[' + val + ']';
        }

        return 'sha384(' + val + ')';
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
        'sha384(sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])http://www.DIFFERENT.come2)');
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
    cid.sha384Base64_ = cid.origSha384Base64_;
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
      time: timer.now(),
    });
    return compare(
        'e2',
        'sha384(YYYhttp://www.origin.come2)');
  });

  it('should work without mocking', () => {
    const win = {
      location: {
        href: 'https://cdn.ampproject.org/v/www.origin.com/',
      },
      services: {},
      ampExtendedElements: {
        'amp-analytics': true
      }
    };
    win.__proto__ = window;
    expect(win.location.href).to.equal('https://cdn.ampproject.org/v/www.origin.com/');
    installCidService(win);
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
    const DAY = 24 * 3600 * 1000;
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

  it('should set last access time once a day', () => {
    const DAY = 24 * 3600 * 1000;
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

  it('should wait for consent', () => {
    let nonce = 'before';
    const consent = timer.promise(100).then(() => {
      nonce = 'timer fired';
    });
    const p = cid.get('', consent).then(c => {
      expect(nonce).to.equal('timer fired');
    });
    clock.tick(100);
    return p;
  });

  it('should fail on failed consent', () => {
    return expect(cid.get('abc', Promise.reject())).to.be.rejected;
  });

  it('should not store until persistence promise resolves', () => {
    let resolve;
    const persistencePromise = new Promise(r => {
      resolve = r;
    });

    return cid.get('e2', hasConsent, persistencePromise).then(c => {
      expect(c).to.equal('sha384(sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])http://www.origin.come2)');
      expect(storage['amp-cid']).to.be.undefined;
      clock.tick(777);
      resolve();
      return persistencePromise.then(() => {
        expect(storage['amp-cid']).to.be.string;
        const stored = JSON.parse(storage['amp-cid']);
        expect(stored.cid).to.equal(
            'sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])');
        expect(stored.time).to.equal(777);
      });
    });
  });

  it('fallback with no window.crypto', () => {
    fakeWin.crypto = undefined;
    fakeWin.screen = {
      width: '111',
      height: '222'
    };
    fakeWin.Math = {
      random: () => {
        return 999;
      }
    };
    clock.tick(7777);
    return compare(
        'e2',
        'sha384(sha384(https://cdn.ampproject.org/v' +
        '/www.origin.com/foo/?f=07777999111222)http://www.origin.come2)');
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

describe('getSourceOrigin', () => {

  function testOrigin(href, origin) {
    it('should return the origin from ' + href, () => {
      expect(getSourceOrigin(parseUrl(href))).to.equal(origin);
    });
  }

  testOrigin(
      'https://cdn.ampproject.org/v/www.origin.com/foo/?f=0',
      'http://www.origin.com');
  testOrigin(
      'https://cdn.ampproject.org/v/s/www.origin.com/foo/?f=0',
      'https://www.origin.com');
  testOrigin(
      'https://cdn.ampproject.org/c/www.origin.com/foo/?f=0',
      'http://www.origin.com');
  testOrigin(
      'https://cdn.ampproject.org/c/s/www.origin.com/foo/?f=0',
      'https://www.origin.com');
  testOrigin(
      'https://cdn.ampproject.org/c/s/origin.com/foo/?f=0',
      'https://origin.com');

  it('should fail on invalid source origin', () => {
    expect(() => {
      getSourceOrigin(parseUrl('https://cdn.ampproject.org/v/yyy/'));
    }).to.throw(/Expected a \. in origin http:\/\/yyy/);
  });

  it('should fail on non-proxy origin', () => {
    expect(() => {
      getSourceOrigin(parseUrl('https://abc.org/v/foo.com/'));
    }).to.throw(/Expected proxy origin/);
  });
});

describe('isProxyOrigin', () => {

  function testProxyOrigin(href, bool) {
    it('should return whether it is a proxy origin origin for ' + href, () => {
      expect(isProxyOrigin(parseUrl(href))).to.equal(bool);
    });
  }

  testProxyOrigin(
      'https://cdn.ampproject.org/v/www.origin.com/foo/?f=0', true);
  testProxyOrigin(
      'http://localhost:123', true);
  testProxyOrigin(
      'https://cdn.ampproject.net/v/www.origin.com/foo/?f=0', false);
  testProxyOrigin(
      'https://medium.com/swlh/nobody-wants-your-app-6af1f7f69cb7', false);
  testProxyOrigin(
      'http://www.spiegel.de/politik/deutschland/angela-merkel-a-1062761.html',
      false);
});
