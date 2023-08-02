import * as fakeTimers from '@sinonjs/fake-timers';

import {Services} from '#service';
import {installDocService} from '#service/ampdoc-impl';
import {
  cidServiceForDocForTesting,
  getProxySourceOrigin,
  isOptedOutOfCid,
  optOutOfCid,
} from '#service/cid-impl';
import {Crypto, installCryptoService} from '#service/crypto-impl';
import {installDocumentInfoServiceForDoc} from '#service/document-info-impl';
import {installExtensionsService} from '#service/extensions-impl';
import {installPlatformService} from '#service/platform-impl';
import {installTimerService} from '#service/timer-impl';
import {installViewerServiceForDoc} from '#service/viewer-impl';

import {FakePerformance} from '#testing/fake-dom';
import {macroTask} from '#testing/helpers';
import {stubServiceForDoc} from '#testing/helpers/service';

import {installCryptoPolyfill} from '../../extensions/amp-crypto-polyfill/0.1/amp-crypto-polyfill';
import {getCookie, setCookie} from '../../src/cookies';
import * as cookie from '../../src/cookies';
import {
  registerServiceBuilder,
  resetServiceForTesting,
} from '../../src/service-helpers';
import {parseUrlDeprecated} from '../../src/url';
import * as url from '../../src/url';

const DAY = 24 * 3600 * 1000;

describes.sandboxed('cid', {}, (env) => {
  let clock;
  let fakeWin;
  let ampdoc;
  let viewer;
  let storage;
  let viewerStorage;
  let cid;
  let crypto;
  let viewerSendMessageStub;
  let whenFirstVisible;
  let trustedViewer;
  let shouldSendMessageTimeout;
  let storageGetStub;
  let seed;

  const hasConsent = Promise.resolve();
  const timer = Services.timerFor(window);

  beforeEach(() => {
    seed = 1;
    clock = env.sandbox.useFakeTimers();
    whenFirstVisible = Promise.resolve();
    trustedViewer = true;
    shouldSendMessageTimeout = false;
    storage = {};
    viewerStorage = null;
    fakeWin = {
      localStorage: {
        setItem: (key, value) => {
          expect(key).to.equal('amp-cid');
          expect(value).to.be.a('string');
          storage[key] = value;
        },
        getItem: (key) => {
          // isExperimentOn() in the code paths causes "amp-experiment-toggles".
          expect(['amp-cid', 'amp-experiment-toggles']).to.contain(key);
          return storage[key];
        },
      },
      location: {
        href: 'https://cdn.ampproject.org/v/www.origin.com/foo/?f=0',
        search: 'f=0',
      },
      crypto: {
        getRandomValues: (array) => {
          array[0] = seed;
          array[1] = 2;
          array[2] = 3;
          array[15] = 15;
        },
      },
      document: {
        nodeType: /* DOCUMENT */ 9,
        body: {},
        querySelector: () => {},
        head: {
          nodeType: /* ELEMENT */ 1,
          querySelector: () => null,
          querySelectorAll: () => [],
        },
      },
      navigator: window.navigator,
      setTimeout: window.setTimeout,
      clearTimeout: window.clearTimeout,
      Math: window.Math,
      Promise: window.Promise,
      performance: new FakePerformance(window),
    };
    fakeWin.document.defaultView = fakeWin;
    installDocService(fakeWin, /* isSingleDoc */ true);
    ampdoc = Services.ampdocServiceFor(fakeWin).getSingleDoc();
    installTimerService(fakeWin);
    installPlatformService(fakeWin);
    installDocumentInfoServiceForDoc(ampdoc);

    installExtensionsService(fakeWin);
    const extensions = Services.extensionsFor(fakeWin);
    // stub extensions service to provide crypto-polyfill
    env.sandbox
      .stub(extensions, 'preloadExtension')
      .callsFake((extensionId) => {
        expect(extensionId).to.equal('amp-crypto-polyfill');
        installCryptoPolyfill(fakeWin);
        return Promise.resolve();
      });

    installViewerServiceForDoc(ampdoc);
    storageGetStub = stubServiceForDoc(env.sandbox, ampdoc, 'storage', 'get');

    viewer = Services.viewerForDoc(ampdoc);
    env.sandbox.stub(ampdoc, 'whenFirstVisible').callsFake(function () {
      return whenFirstVisible;
    });
    env.sandbox
      .stub(viewer, 'isTrustedViewer')
      .callsFake(() => Promise.resolve(trustedViewer));
    viewerSendMessageStub = env.sandbox
      .stub(viewer, 'sendMessageAwaitResponse')
      .callsFake((eventType, opt_data) => {
        if (eventType != 'cid') {
          return Promise.reject();
        }
        if (shouldSendMessageTimeout) {
          return timer.promise(15000);
        }
        if (opt_data) {
          viewerStorage = opt_data;
        }
        return Promise.resolve(viewerStorage || undefined);
      });

    cid = cidServiceForDocForTesting(ampdoc);
    env.sandbox.stub(cid, 'isScopeOptedIn_').callsFake(() => null);
    installCryptoService(fakeWin);
    crypto = Services.cryptoFor(fakeWin);
    env.sandbox.stub(cid.cacheCidApi_, 'isSupported').returns(false);
  });

  afterEach(() => {
    window.localStorage.removeItem('amp-cid');
  });

  describe('with real crypto', () => {
    it('should hash domain name and scope', () => {
      // domain name: 'http://www.origin.com'
      // scope: 'custom-cid-scope'
      return compare(
        'custom-cid-scope',
        'tSSEaSFEU2-vkEO0Mb9HZejJui-npGRhXf3fD3H3iWeYQrjkQOTaRYdPyFTogNXA'
      );
    });

    it('should hash domain name and scope', () => {
      fakeWin.location.href =
        'https://cdn.ampproject.org/v/www.DIFFERENT.com/foo/?f=0';
      // domain name: 'http://www.different.com'
      // scope: 'another-custom-cid-scope'
      return compare(
        'another-custom-cid-scope',
        '25lYHB6Luck8Z5ddpiB-FBbj2pa9zx3WdnJlZVgFneJRcFsDT3kIoPoi6k6-oxrB'
      );
    });
  });

  describe('with crypto stub', () => {
    const doesNotProvideError = '[CID] Viewer does not provide cap=cid';
    const invalidFormatError = '[CID] invalid cid format';
    beforeEach(() => {
      crypto.sha384Base64 = (val) => {
        if (val instanceof Uint8Array) {
          val = '[' + Array.apply([], val).join(',') + ']';
        }

        return Promise.resolve('sha384(' + val + ')');
      };
    });

    it('should depend on external id e1', () => {
      clock.tick(123);
      return compare(
        'e1',
        'sha384(sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])http://www.origin.come1)'
      ).then(() => {
        expect(storage['amp-cid']).to.be.a('string');
        const stored = JSON.parse(storage['amp-cid']);
        expect(stored.cid).to.equal(
          'sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])'
        );
        expect(stored.time).to.equal(123);
      });
    });

    it('should depend on external id e2', () => {
      return compare(
        'e2',
        'sha384(sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])http://www.origin.come2)'
      );
    });

    it('should depend on domain', () => {
      fakeWin.location.href =
        'https://cdn.ampproject.org/v/www.DIFFERENT.com/foo/?f=0';
      return compare(
        'e2',
        'sha384(sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])http://www.different.come2)'
      );
    });

    it('should fallback to cookie value on custom domain.', () => {
      fakeWin.location.href = 'https://abc.org/v/www.DIFFERENT.com/foo/?f=0';
      fakeWin.document.cookie = 'cookie_name=12345;scope_name=54321;';
      return cid
        .get(
          {
            scope: 'scope_name',
          },
          hasConsent
        )
        .then((c) => {
          expect(c).to.equal('54321');
        });
    });

    it('should fallback to cookie of given name on custom domain.', () => {
      fakeWin.location.href = 'https://abc.org/v/www.DIFFERENT.com/foo/?f=0';
      fakeWin.document.cookie = 'cookie_name=12345;scope_name=54321;';
      return cid
        .get(
          {
            scope: 'scope_name',
            cookieName: 'cookie_name',
          },
          hasConsent
        )
        .then((c) => {
          expect(c).to.equal('12345');
        });
    });

    it(
      'should depend fall back to cookies on custom ' +
        'domain and not create a cookie',
      () => {
        fakeWin.location.href =
          'https://some.domain/v/www.DIFFERENT.com/foo/?f=0';
        fakeWin.document.cookie = 'cookie_name=12345;';
        return compare('other_cookie', null);
      }
    );

    it('should produce golden value', () => {
      crypto.sha384Base64 = new Crypto(fakeWin).sha384Base64;
      return compare(
        'e2',
        'q0pPfZTWGruPrtURDJHexzs-MgOkt9SJAsAZodzr8tx8hKv8BS62AVpbttaFX8fK'
      );
    });

    it('should be stable with respect to a saved seed', () => {
      const expected =
        'sha384(sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])http://www.origin.come2)';
      return compare('e2', expected).then(() => {
        seed = 2;
        return compare('e2', expected).then(() => {
          storage['amp-cid'] = undefined;
          removeMemoryCacheOfCid();
          return compare(
            'e2',
            'sha384(sha384([' +
              // 2 because we set the seed to 2
              '2' +
              ',2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])http://www.origin.come2)'
          );
        });
      });
    });

    it('should pick up the cid value from storage', () => {
      storage['amp-cid'] = JSON.stringify({
        cid: 'YYY',
        time: Date.now(),
      });
      return compare('e2', 'sha384(YYYhttp://www.origin.come2)');
    });

    it('should return empty if opted out', () => {
      storageGetStub.withArgs('amp-cid-optout').returns(Promise.resolve(true));

      storage['amp-cid'] = JSON.stringify({
        cid: 'YYY',
        time: Date.now(),
      });
      return compare('e2', '');
    });

    it('should read from viewer storage if embedded', () => {
      expectAsyncConsoleError(doesNotProvideError);
      fakeWin.parent = {};
      const expectedBaseCid = 'from-viewer';
      viewerStorage = JSON.stringify({
        time: 0,
        cid: expectedBaseCid,
      });
      return Promise.all([
        compare('e1', `sha384(${expectedBaseCid}http://www.origin.come1)`),
        compare('e2', `sha384(${expectedBaseCid}http://www.origin.come2)`),
      ])
        .then(() => {
          expect(viewerSendMessageStub).to.be.calledOnce;
          expect(viewerSendMessageStub).to.be.calledWith('cid');
          seed = 2;
          // Ensure it's called only once since we cache it in memory.
          return compare(
            'e3',
            `sha384(${expectedBaseCid}http://www.origin.come3)`
          );
        })
        .then(() => {
          expect(viewerSendMessageStub).to.be.calledOnce;
          return expect(cid.baseCid_).to.eventually.equal(expectedBaseCid);
        });
    });

    it(
      'should read from viewer storage if embedded and convert cid to ' +
        'new format',
      () => {
        expectAsyncConsoleError(doesNotProvideError);
        expectAsyncConsoleError(invalidFormatError);
        fakeWin.parent = {};
        const expectedBaseCid = 'from-viewer';
        // baseCid returned by legacy API
        viewerStorage = expectedBaseCid;
        return Promise.all([
          compare('e1', `sha384(${expectedBaseCid}http://www.origin.come1)`),
          compare('e2', `sha384(${expectedBaseCid}http://www.origin.come2)`),
        ]).then(() => {
          expect(viewerSendMessageStub).to.be.calledOnce;
          expect(viewerSendMessageStub).to.be.calledWith('cid');
        });
      }
    );

    it('should not read from untrusted viewer', () => {
      fakeWin.parent = {};
      trustedViewer = false;
      const viewerBaseCid = 'from-viewer';
      viewerStorage = JSON.stringify({
        time: 0,
        cid: viewerBaseCid,
      });
      return Promise.all([
        compare(
          'e1',
          'sha384(sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])http://www.origin.come1)'
        ),
        compare(
          'e2',
          'sha384(sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])http://www.origin.come2)'
        ),
      ]).then(() => {
        expect(viewerSendMessageStub).to.not.be.called;
      });
    });

    it('should store to viewer storage if embedded', () => {
      expectAsyncConsoleError(doesNotProvideError, 2);
      fakeWin.parent = {};
      const expectedBaseCid = 'sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])';
      return compare('e2', `sha384(${expectedBaseCid}http://www.origin.come2)`)
        .then(() => {
          expect(viewerSendMessageStub).to.be.calledWith(
            'cid',
            JSON.stringify({
              time: 0,
              cid: expectedBaseCid,
            })
          );
          seed = 2;
          // Ensure it's called only once since we cache it in memory.
          return compare(
            'e3',
            `sha384(${expectedBaseCid}http://www.origin.come3)`
          );
        })
        .then(() => {
          expect(viewerSendMessageStub).to.be.calledWith(
            env.sandbox.match.string
          );
          return expect(cid.baseCid_).to.eventually.equal(expectedBaseCid);
        });
    });

    it('should prefer value in storage if present', () => {
      fakeWin.parent = {};
      storage['amp-cid'] = JSON.stringify({
        cid: 'in-storage',
        time: Date.now(),
      });
      return compare('e2', 'sha384(in-storagehttp://www.origin.come2)');
    });

    it('should expire on read after 365 days', () => {
      const expected =
        'sha384(sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])http://www.origin.come2)';
      return compare('e2', expected).then(() => {
        clock.tick(364 * DAY);
        seed = 2;
        return compare('e2', expected).then(() => {
          clock.tick(365 * DAY + 1);
          removeMemoryCacheOfCid();
          return compare(
            'e2',
            'sha384(sha384([' +
              // 2 because we set the seed to 2
              '2' +
              ',2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])http://www.origin.come2)'
          );
        });
      });
    });

    it('should expire on read after 365 days when embedded', () => {
      expectAsyncConsoleError(doesNotProvideError, 3);
      fakeWin.parent = {};
      const expectedBaseCid = 'from-viewer';
      viewerStorage = JSON.stringify({
        time: 0,
        cid: expectedBaseCid,
      });

      const expectedIdFromViewer = 'sha384(from-viewerhttp://www.origin.come2)';
      const expectedNewId =
        'sha384(sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])http://www.origin.come2)';
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
      const expected =
        'sha384(sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])http://www.origin.come2)';
      function getStoredTime() {
        return JSON.parse(storage['amp-cid']).time;
      }
      clock.tick(100);
      return compare('e2', expected).then(() => {
        seed = 2;
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
      expectAsyncConsoleError(doesNotProvideError, 5);
      fakeWin.parent = {};
      const expected =
        'sha384(sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])http://www.origin.come2)';
      function getStoredTime() {
        return JSON.parse(viewerStorage).time;
      }
      clock.tick(100);
      return compare('e2', expected).then(() => {
        seed = 2;
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
      const p = cid.get({scope: 'test'}, hasConsent).then((unusedC) => {
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
      const p = cid.get({scope: 'test'}, consent).then((unusedC) => {
        expect(nonce).to.equal('timer fired');
      });
      clock.tick(100);
      return p;
    });

    it('should fail on failed consent', () => {
      return expect(cid.get({scope: 'abc'}, Promise.reject())).to.be.rejected;
    });

    it('should fail on invalid scope', () => {
      allowConsoleError(() => {
        expect(() => {
          cid.get({scope: '$$$'}, Promise.resolve());
        }).to.throw(/\$\$\$/);
      });
    });

    it('should not store until persistence promise resolves', () => {
      let resolve;
      const persistencePromise = new Promise((r) => {
        resolve = r;
      });

      let sha384Promise;
      crypto.sha384Base64 = (val) => {
        if (val instanceof Uint8Array) {
          val = '[' + Array.apply([], val).join(',') + ']';
        }

        return (sha384Promise = Promise.resolve('sha384(' + val + ')'));
      };

      return cid
        .get({scope: 'e2'}, hasConsent, persistencePromise)
        .then((c) => {
          expect(c).to.equal(
            'sha384(sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])http://www.origin.come2)'
          );
          expect(storage['amp-cid']).to.be.undefined;
          clock.tick(777);
          resolve();
          return Promise.all([persistencePromise, sha384Promise]).then(() => {
            expect(storage['amp-cid']).to.be.a('string');
            const stored = JSON.parse(storage['amp-cid']);
            expect(stored.cid).to.equal(
              'sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])'
            );
            expect(stored.time).to.equal(777);
          });
        });
    });

    it('should not wait persistence consent for viewer storage', () => {
      expectAsyncConsoleError(doesNotProvideError, 2);
      fakeWin.parent = {};
      const persistencePromise = new Promise(() => {
        /* never resolves */
      });
      return cid.get({scope: 'e2'}, hasConsent, persistencePromise).then(() => {
        expect(viewerStorage).to.equal(
          JSON.stringify({
            time: 0,
            cid: 'sha384([1,2,3,0,0,0,0,0,0,0,0,0,0,0,0,15])',
          })
        );
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
          '/www.origin.com/foo/?f=07777999111222)http://www.origin.come2)'
      );
    });

    it('should NOT create fallback cookie by default with string scope', () => {
      fakeWin.location.href = 'https://abc.org/v/www.DIFFERENT.com/foo/?f=0';
      return cid.get({scope: 'cookie_name'}, hasConsent).then((c) => {
        expect(c).to.not.exist;
        expect(fakeWin.document.cookie).to.not.exist;
      });
    });

    it('should NOT create fallback cookie by default with struct scope', () => {
      fakeWin.location.href = 'https://abc.org/v/www.DIFFERENT.com/foo/?f=0';
      return cid.get({scope: 'cookie_name'}, hasConsent).then((c) => {
        expect(c).to.not.exist;
        expect(fakeWin.document.cookie).to.not.exist;
      });
    });

    it('should create fallback cookie when asked', () => {
      fakeWin.location.href =
        'https://foo.abc.org/v/www.DIFFERENT.com/foo/?f=0';
      fakeWin.location.hostname = 'foo.abc.org';
      fakeWin.crypto.getRandomValues = (array) => {
        array[0] = 0;
        array[1] = 2;
        array[2] = 4;
        array[3] = 8;
        array[4] = 16;
        array[5] = 32;
        array[6] = 64;
        array[7] = 128;
        array[8] = 255;
        array[9] = 7;
        array[10] = 11;
        array[11] = 22;
        array[12] = 33;
        array[13] = 66;
        array[14] = 200;
        array[15] = 39;
      };
      return cid
        .get({scope: 'scope_name', createCookieIfNotPresent: true}, hasConsent)
        .then((c) => {
          expect(c).to.exist;
          // Since various parties depend on the cookie values, please be careful
          // about changing the format.
          expect(c).to.equal('amp-AAIECBAgQID_BwsWIULIJw');
          expect(fakeWin.document.cookie).to.equal(
            'scope_name=' +
              encodeURIComponent(c) +
              '; path=/' +
              '; domain=abc.org' +
              '; expires=Fri, 01 Jan 1971 00:00:00 GMT'
          ); // 1 year from 0.
        });
    });

    it('should create fallback cookie with provided name', () => {
      fakeWin.location.href =
        'https://foo.abc.org/v/www.DIFFERENT.com/foo/?f=0';
      fakeWin.location.hostname = 'foo.abc.org';
      return cid
        .get(
          {
            scope: 'scope_name',
            createCookieIfNotPresent: true,
            cookieName: 'cookie_name',
          },
          hasConsent
        )
        .then((c) => {
          expect(c).to.exist;
          expect(c).to.equal('amp-AQIDAAAAAAAAAAAAAAAADw');
          expect(fakeWin.document.cookie).to.equal(
            'cookie_name=' +
              encodeURIComponent(c) +
              '; path=/' +
              '; domain=abc.org' +
              '; expires=Fri, 01 Jan 1971 00:00:00 GMT'
          ); // 1 year from 0.
        });
    });

    it('should update fallback cookie expiration when present', () => {
      fakeWin.location.href =
        'https://foo.abc.org/v/www.DIFFERENT.com/foo/?f=0';
      fakeWin.location.hostname = 'foo.abc.org';
      fakeWin.document.cookie = 'cookie_name=amp-12345';

      return cid.get({scope: 'cookie_name'}, hasConsent).then((c) => {
        expect(fakeWin.document.cookie).to.equal(
          'cookie_name=' +
            encodeURIComponent(c) +
            '; path=/' +
            '; domain=abc.org' +
            '; expires=Fri, 01 Jan 1971 00:00:00 GMT' // 1 year from 0.
        );
      });
    });

    it('should not update expiration when created externally', () => {
      fakeWin.location.href =
        'https://foo.abc.org/v/www.DIFFERENT.com/foo/?f=0';
      fakeWin.location.hostname = 'foo.abc.org';
      fakeWin.document.cookie = 'cookie_name=12345';

      return cid.get({scope: 'cookie_name'}, hasConsent).then(() => {
        expect(fakeWin.document.cookie).to.equal('cookie_name=12345');
      });
    });

    it('should return same value for multiple calls on non-proxied urls', () => {
      fakeWin.location.href = 'https://abc.org/foo/?f=0';
      fakeWin.location.hostname = 'foo.abc.org';
      const cid1 = cid.get(
        {scope: 'cookie', createCookieIfNotPresent: true},
        hasConsent
      );
      const cid2 = cid.get(
        {scope: 'cookie', createCookieIfNotPresent: true},
        hasConsent
      );
      return cid1.then((c1) => {
        return cid2.then((c2) => {
          expect(c1).to.equal(c2);
        });
      });
    });

    it('should return same value for multiple calls on proxied urls', () => {
      fakeWin.location.href = 'https://cdn.ampproject.org/v/abc.org/foo/?f=0';
      fakeWin.location.hostname = 'cdn.ampproject.org';
      const cid1 = cid.get(
        {scope: 'cookie', createCookieIfNotPresent: true},
        hasConsent
      );
      return cid1.then((c1) => {
        const cid2 = cid.get(
          {scope: 'cookie', createCookieIfNotPresent: true},
          hasConsent
        );
        return cid2.then((c2) => {
          expect(c1).to.equal(c2);
        });
      });
    });

    it('should retreive cookie value with . in name', () => {
      fakeWin.location.href = 'https://abc.org/';
      fakeWin.document.cookie = '_sp_id.44=4567;';
      return compare('_sp_id.44', '4567');
    });
  });

  function compare(externalCidScope, compareValue) {
    return cid.get({scope: externalCidScope}, hasConsent).then((c) => {
      expect(c).to.equal(compareValue);
    });
  }

  function removeMemoryCacheOfCid(opt_cid) {
    (opt_cid || cid).baseCid_ = null;
  }
});

describes.sandboxed('getProxySourceOrigin', {}, () => {
  it('should fail on non-proxy origin', () => {
    allowConsoleError(() => {
      expect(() => {
        getProxySourceOrigin(parseUrlDeprecated('https://abc.org/v/foo.com/'));
      }).to.throw(/Expected proxy origin/);
    });
  });
});

describes.realWin('cid', {amp: true}, (env) => {
  let cid;
  let win;
  let ampdoc;
  let clock;
  let storage;
  let storageMock;
  let storageValue;
  const hasConsent = Promise.resolve();

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    clock = fakeTimers.withGlobal(win).install({
      toFake: ['Date', 'setTimeout', 'clearTimeout'],
    });
    cid = cidServiceForDocForTesting(ampdoc);
    env.sandbox.stub(cid.cacheCidApi_, 'isSupported').returns(false);
    storageValue = {};
    storage = {
      setNonBoolean: (name, value) => {
        storageValue[name] = value;
        return Promise.resolve();
      },
      get: (name) => {
        return Promise.resolve(storageValue[name]);
      },
      isViewerStorage: () => false,
    };
    storageMock = env.sandbox.mock(storage);

    resetServiceForTesting(win, 'storage');
    registerServiceBuilder(win, 'storage', function () {
      return Promise.resolve(storage);
    });
  });

  afterEach(() => {
    storageMock.verify();
    clock.uninstall();
  });

  it('should store CID in cookie when not in Viewer', function* () {
    env.sandbox
      .stub(cid.viewerCidApi_, 'isSupported')
      .returns(Promise.resolve(false));
    setCookie(win, 'foo', '', 0);
    const fooCid = yield cid.get(
      {
        scope: 'foo',
        createCookieIfNotPresent: true,
      },
      hasConsent
    );
    expect(fooCid).to.have.string('amp-');
    const fooCid2 = yield cid.get(
      {
        scope: 'foo',
        createCookieIfNotPresent: true,
      },
      hasConsent
    );
    expect(fooCid).to.equal(fooCid2);
  });

  describe('CID backup', () => {
    beforeEach(() => {
      cid.isBackupCidExpOn = true;
      env.sandbox
        .stub(cid.viewerCidApi_, 'isSupported')
        .returns(Promise.resolve(false));
    });

    it('generates a new CID and backup', async () => {
      setCookie(win, 'foo', '', 0);
      const fooCid = await cid.get(
        {
          scope: 'foo',
          createCookieIfNotPresent: true,
        },
        hasConsent
      );
      expect(fooCid).to.have.string('amp-');
      expect(storageValue['amp-cid:foo']).to.equal(fooCid);
    });

    it('should find AMP generated CID in cookie and backup', async () => {
      const cidString = 'amp-abc123';
      win.document.cookie = `foo=${cidString};`;

      const fooCid = await cid.get(
        {
          scope: 'foo',
          createCookieIfNotPresent: true,
        },
        hasConsent
      );
      expect(fooCid).to.equal(cidString);
      expect(storageValue['amp-cid:foo']).to.equal(fooCid);

      const nonAmpCidString = 'xyz987';
      win.document.cookie = `bar=${nonAmpCidString};`;
      expect(
        await cid.get(
          {
            scope: 'bar',
            createCookieIfNotPresent: true,
          },
          hasConsent
        )
      ).to.equal(nonAmpCidString);
      expect(storageValue['amp-cid:bar']).to.not.equal(nonAmpCidString);
    });

    it('only use backup when necessary and update accordingly', async () => {
      storageValue['amp-cid:foo'] = 'amp-foo-bar';
      const cidString = 'amp-abc123';
      win.document.cookie = `foo=${cidString};`;
      storageMock
        .expects('setNonBoolean')
        .withExactArgs('amp-cid:foo', cidString)
        .once();

      const fooCid = await cid.get(
        {
          scope: 'foo',
          createCookieIfNotPresent: true,
        },
        hasConsent
      );
      expect(fooCid).to.equal(cidString);
    });

    it('should use CID backup', async () => {
      const cidString = 'amp-abc123';
      storageMock.expects('setNonBoolean').once();
      setCookie(win, 'foo', '', 0);
      env.sandbox.stub(cookie, 'setCookie').callsFake((win, name, value) => {
        win.document.cookie = `${name}=${value}`;
      });
      storageValue['amp-cid:foo'] = cidString;

      const fooCid = await cid.get(
        {
          scope: 'foo',
          createCookieIfNotPresent: true,
        },
        hasConsent
      );

      expect(fooCid).to.equal(cidString);
      expect(getCookie(win, 'foo')).to.equal(cidString);
    });

    it('should not use or store CID backup if opt-out', async () => {
      const cidString = 'amp-abc123';
      setCookie(win, 'foo', '', 0);
      env.sandbox.stub(cookie, 'setCookie').callsFake((win, name, value) => {
        win.document.cookie = `${name}=${value}`;
      });
      storageMock.expects('setNonBoolean').never();
      // To check amp-cid-optout
      storageMock.expects('get').once();
      storageValue['amp-cid:foo'] = cidString;

      const fooCid = await cid.get(
        {
          scope: 'foo',
          createCookieIfNotPresent: true,
          disableBackup: true,
        },
        hasConsent
      );

      expect(fooCid).to.not.equal(cidString);
    });
  });

  it('get method should return CID when in Viewer ', () => {
    env.sandbox
      .stub(cid.viewerCidApi_, 'isSupported')
      .returns(Promise.resolve(true));
    win.parent = {};
    stubServiceForDoc(
      env.sandbox,
      ampdoc,
      'viewer',
      'sendMessageAwaitResponse'
    ).returns(Promise.resolve('cid-from-viewer'));
    stubServiceForDoc(env.sandbox, ampdoc, 'viewer', 'isTrustedViewer').returns(
      Promise.resolve(true)
    );
    stubServiceForDoc(env.sandbox, ampdoc, 'viewer', 'hasCapability')
      .withArgs('cid')
      .returns(true);
    env.sandbox.stub(url, 'isProxyOrigin').returns(true);
    return expect(cid.get({scope: 'foo'}, hasConsent)).to.eventually.equal(
      'cid-from-viewer'
    );
  });

  it('get method should time out when in Viewer', function* () {
    env.sandbox
      .stub(cid.viewerCidApi_, 'isSupported')
      .returns(Promise.resolve(true));
    win.parent = {};
    stubServiceForDoc(
      env.sandbox,
      ampdoc,
      'viewer',
      'sendMessageAwaitResponse'
    ).returns(new Promise(() => {}));
    stubServiceForDoc(env.sandbox, ampdoc, 'viewer', 'isTrustedViewer').returns(
      Promise.resolve(true)
    );
    storage['amp-cid-optout'] = false;
    env.sandbox.stub(url, 'isProxyOrigin').returns(true);
    let scopedCid = undefined;
    let resolved = false;
    cid.get({scope: 'foo'}, hasConsent).then((result) => {
      scopedCid = result;
      resolved = true;
    });
    yield macroTask();
    clock.tick(9999);
    yield macroTask();
    expect(resolved).to.be.false;
    expect(scopedCid).to.be.undefined;
    yield macroTask();
  });

  describe('pub origin, CID API opt in', () => {
    beforeEach(() => {
      env.sandbox.stub(url, 'isProxyOrigin').returns(false);
      ampdoc.win.document.head.innerHTML +=
        '<meta name="amp-google-client-id-api" content="googleanalytics">';
      setCookie(win, '_ga', '', 0);
    });

    afterEach(() => {
      setCookie(win, '_ga', '', 0);
    });

    it('should use cid api on pub origin if opted in', () => {
      cid.apiKeyMap_ = {'AMP_ECID_GOOGLE': 'cid-api-key'};
      const getScopedCidStub = env.sandbox.stub(cid.cidApi_, 'getScopedCid');
      getScopedCidStub.returns(Promise.resolve('cid-from-api'));
      return cid
        .get(
          {
            scope: 'AMP_ECID_GOOGLE',
            cookieName: '_ga',
            createCookieIfNotPresent: true,
          },
          hasConsent
        )
        .then((scopedCid) => {
          expect(getScopedCidStub).to.be.calledWith(
            'cid-api-key',
            'AMP_ECID_GOOGLE'
          );
          expect(scopedCid).to.equal('cid-from-api');
          expect(getCookie(win, '_ga')).to.equal('cid-from-api');
        });
    });

    it('should fallback to cookie if cid api returns nothing', () => {
      env.sandbox.stub(cid.cidApi_, 'getScopedCid').returns(Promise.resolve());
      return cid
        .get(
          {
            scope: 'AMP_ECID_GOOGLE',
            cookieName: '_ga',
            createCookieIfNotPresent: true,
          },
          hasConsent
        )
        .then((scopedCid) => {
          expect(scopedCid).to.contain('amp-');
          expect(getCookie(win, '_ga')).to.equal(scopedCid);
        });
    });

    it('should respect CID API opt out', () => {
      env.sandbox
        .stub(cid.cidApi_, 'getScopedCid')
        .returns(Promise.resolve('$OPT_OUT'));
      return cid
        .get(
          {
            scope: 'AMP_ECID_GOOGLE',
            cookieName: '_ga',
            createCookieIfNotPresent: true,
          },
          hasConsent
        )
        .then((scopedCid) => {
          expect(scopedCid).to.be.null;
          expect(getCookie(win, '_ga')).to.be.null;
        });
    });

    it(
      'should not store CID in storage if opt-in,' +
        ' since CID is stored on servers',
      () => {
        storageMock.expects('setNonBoolean').never();
        cid.apiKeyMap_ = {'AMP_ECID_GOOGLE': 'cid-api-key'};
        const getScopedCidStub = env.sandbox.stub(cid.cidApi_, 'getScopedCid');
        getScopedCidStub.returns(Promise.resolve('cid-from-api'));
        return cid.get(
          {
            scope: 'AMP_ECID_GOOGLE',
            cookieName: '_ga',
            createCookieIfNotPresent: true,
          },
          hasConsent
        );
      }
    );
  });

  describe('isScopeOptedIn', () => {
    it('should read predefined clients and custom API keys correctly', () => {
      ampdoc.win.document.head.innerHTML +=
        '<meta name="amp-google-client-id-api" ' +
        'content="googleanalytics, ' +
        'foo = foo-api-key,' +
        'bar=bar-api-key ,' +
        'hello=hello-api-key">';
      expect(cid.isScopeOptedIn_('AMP_ECID_GOOGLE')).to.equal(
        'AIzaSyA65lEHUEizIsNtlbNo-l2K18dT680nsaM'
      );
      expect(cid.isScopeOptedIn_('foo')).to.equal('foo-api-key');
      expect(cid.isScopeOptedIn_('bar')).to.equal('bar-api-key');
      expect(cid.isScopeOptedIn_('hello')).to.equal('hello-api-key');
      expect(cid.isScopeOptedIn_('non-existing')).to.be.undefined;
    });

    it('should work if meta only contains predefined clients', () => {
      ampdoc.win.document.head.innerHTML +=
        '<meta name="amp-google-client-id-api" content="googleanalytics">';
      expect(cid.isScopeOptedIn_('AMP_ECID_GOOGLE')).to.equal(
        'AIzaSyA65lEHUEizIsNtlbNo-l2K18dT680nsaM'
      );
    });

    it('should work if meta only contains custom scopes', () => {
      ampdoc.win.document.head.innerHTML +=
        '<meta name="amp-google-client-id-api" ' +
        'content="' +
        'foo=foo-api-key,' +
        'bar=bar-api-key">';
      expect(cid.isScopeOptedIn_('foo')).to.equal('foo-api-key');
      expect(cid.isScopeOptedIn_('bar')).to.equal('bar-api-key');
    });

    it('should not work if vendor not allowlisted', () => {
      ampdoc.win.document.head.innerHTML +=
        '<meta name="amp-google-client-id-api" content="abodeanalytics">';
      expect(cid.isScopeOptedIn_('AMP_ECID_GOOGLE')).to.equal(undefined);
    });
  });
});

describes.fakeWin('cid optout:', {amp: true}, (env) => {
  let storageGetStub;
  let storageSetStub;
  let viewerSendMessageStub;
  let ampdoc;

  beforeEach(() => {
    ampdoc = env.ampdoc;
    storageSetStub = stubServiceForDoc(env.sandbox, ampdoc, 'storage', 'set');
    storageGetStub = stubServiceForDoc(env.sandbox, ampdoc, 'storage', 'get');
    viewerSendMessageStub = stubServiceForDoc(
      env.sandbox,
      ampdoc,
      'viewer',
      'sendMessage'
    );
  });

  describe('optOutOfCid()', () => {
    it('should send a message to viewer', () => {
      return optOutOfCid(ampdoc).then(() => {
        expect(viewerSendMessageStub).to.be.calledWith('cidOptOut');
      });
    });

    it('should save bit in storage', () => {
      optOutOfCid(ampdoc).then(() => {
        expect(storageSetStub).to.be.calledWith('amp-cid-optout', true);
      });
    });

    it('should reject promise if storage set fails', () => {
      storageSetStub.returns(Promise.reject('failed!'));
      return optOutOfCid(ampdoc).should.eventually.be.rejectedWith('failed!');
    });
  });

  describe('isOptedOutOfCid()', () => {
    it('should return true if bit is set in storage', () => {
      storageGetStub.withArgs('amp-cid-optout').returns(Promise.resolve(true));
      return isOptedOutOfCid(ampdoc).then((isOut) => {
        expect(isOut).to.be.true;
      });
    });

    it('should return false if bit is not set in storage', () => {
      storageGetStub.withArgs('amp-cid-optout').returns(Promise.resolve(null));
      return isOptedOutOfCid(ampdoc).then((isOut) => {
        expect(isOut).to.be.false;
      });
    });

    it('should return false if storage get fails', () => {
      storageGetStub.withArgs('amp-cid-optout').returns(Promise.reject('Fail'));
      return isOptedOutOfCid(ampdoc).then((isOut) => {
        expect(isOut).to.be.false;
      });
    });
  });
});
