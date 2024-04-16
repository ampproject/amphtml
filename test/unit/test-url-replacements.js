import {Observable} from '#core/data-structures/observable';

import {Services} from '#service';
import {installDocService} from '#service/ampdoc-impl';
import {cidServiceForDocForTesting} from '#service/cid-impl';
import {installCryptoService} from '#service/crypto-impl';
import {
  markElementScheduledForTesting,
  resetScheduledElementForTesting,
} from '#service/custom-element-registry';
import {installDocumentInfoServiceForDoc} from '#service/document-info-impl';
import {
  extractClientIdFromGaCookie,
  installUrlReplacementsServiceForDoc,
} from '#service/url-replacements-impl';

import {user} from '#utils/log';

import {mockWindowInterface, stubServiceForDoc} from '#testing/helpers/service';
import {createIframePromise} from '#testing/iframe';

import {installActivityServiceForTesting} from '../../extensions/amp-analytics/0.1/activity-impl';
import {setCookie} from '../../src/cookies';
import * as trackPromise from '../../src/impression';
import {registerServiceBuilder} from '../../src/service-helpers';
import {parseUrlDeprecated} from '../../src/url';

describes.sandboxed('UrlReplacements', {}, (env) => {
  let canonical;
  let loadObservable;
  let replacements;
  let viewerService;
  let userErrorStub;
  let ampdoc;

  describe('UrlReplacements', () => {
    beforeEach(() => {
      canonical = 'https://canonical.com/doc1';
      userErrorStub = env.sandbox.stub(user(), 'error');
    });

    function getReplacements(opt_options) {
      return createIframePromise().then((iframe) => {
        ampdoc = iframe.ampdoc;
        iframe.doc.title = 'Pixel Test';
        const link = iframe.doc.createElement('link');
        link.setAttribute('href', 'https://pinterest.com:8080/pin1');
        link.setAttribute('rel', 'canonical');
        iframe.doc.head.appendChild(link);
        iframe.win.__AMP_SERVICES.documentInfo = null;
        installDocumentInfoServiceForDoc(iframe.ampdoc);
        resetScheduledElementForTesting(iframe.win, 'amp-analytics');
        resetScheduledElementForTesting(iframe.win, 'amp-experiment');
        if (opt_options) {
          if (opt_options.withCid) {
            markElementScheduledForTesting(iframe.win, 'amp-analytics');
            cidServiceForDocForTesting(iframe.ampdoc);
            installCryptoService(iframe.win);
          }
          if (opt_options.withActivity) {
            markElementScheduledForTesting(iframe.win, 'amp-analytics');
            installActivityServiceForTesting(iframe.ampdoc);
          }
          if (opt_options.withVariant) {
            markElementScheduledForTesting(iframe.win, 'amp-experiment');
            registerServiceBuilder(iframe.win, 'variant', function () {
              return {
                getVariants: () =>
                  Promise.resolve({
                    'x1': 'v1',
                    'x2': null,
                  }),
              };
            });
          }
          if (opt_options.withViewerIntegrationVariableService) {
            markElementScheduledForTesting(
              iframe.win,
              'amp-viewer-integration'
            );
            registerServiceBuilder(
              iframe.win,
              'viewer-integration-variable',
              function () {
                return Promise.resolve(
                  opt_options.withViewerIntegrationVariableService
                );
              }
            );
          }
          if (opt_options.withOriginalTitle) {
            iframe.doc.originalTitle = 'Original Pixel Test';
          }
        }
        viewerService = Services.viewerForDoc(iframe.ampdoc);
        replacements = Services.urlReplacementsForDoc(
          iframe.doc.documentElement
        );
        return replacements;
      });
    }

    function expandUrlAsync(url, opt_bindings, opt_options) {
      return getReplacements(opt_options).then((replacements) =>
        replacements.expandUrlAsync(url, opt_bindings)
      );
    }

    function getFakeWindow() {
      loadObservable = new Observable();
      const win = {
        addEventListener(type, callback) {
          loadObservable.add(callback);
        },
        Object,
        performance: {
          timing: {
            navigationStart: 100,
            loadEventStart: 0,
          },
        },
        removeEventListener(type, callback) {
          loadObservable.remove(callback);
        },
        document: {
          nodeType: /* document */ 9,
          querySelector: () => {
            return {href: canonical};
          },
          getElementById: () => {},
          cookie: '',
          documentElement: {
            nodeType: /* element */ 1,
            getRootNode() {
              return win.document;
            },
            hasAttribute: () => {},
          },
        },
        Math: {
          random: () => 0.1234,
        },
        crypto: {
          getRandomValues: (array) => {
            array[0] = 1;
            array[1] = 2;
            array[2] = 3;
            array[15] = 15;
          },
        },
        __AMP_SERVICES: {
          'viewport': {obj: {}, ctor: Object},
          'cid': {
            promise: Promise.resolve({
              get: (config) =>
                Promise.resolve('test-cid(' + config.scope + ')'),
            }),
          },
        },
      };
      win.document.defaultView = win;
      win.document.documentElement.ownerDocument = win.document;
      win.document.head = {
        nodeType: /* element */ 1,
        // Fake query selectors needed to bypass <meta> tag checks.
        querySelector: () => null,
        querySelectorAll: () => [],
        getRootNode() {
          return win.document;
        },
      };
      installDocService(win, /* isSingleDoc */ true);
      const ampdoc = Services.ampdocServiceFor(win).getSingleDoc();
      win.__AMP_SERVICES.documentInfo = null;
      installDocumentInfoServiceForDoc(ampdoc);
      win.ampdoc = ampdoc;
      env.sandbox.stub(win.ampdoc, 'getMeta').returns({
        'amp-link-variable-allowed-origin':
          'https://allowlisted.com http://example.com',
      });
      installUrlReplacementsServiceForDoc(ampdoc);
      return win;
    }

    it('limit replacement params size', () => {
      return getReplacements().then((replacements) => {
        replacements.getVariableSource().initialize();
        const variables = Object.keys(
          replacements.getVariableSource().replacements_
        );
        // Restrict the number of replacement params to globalVariableSource
        // Please consider adding the logic to amp-analytics instead.
        // Please contact @lannka or @zhouyx if the test fail.
        expect(variables.length).to.equal(60);
      });
    });

    it('should replace RANDOM', () => {
      return expandUrlAsync('ord=RANDOM?').then((res) => {
        expect(res).to.match(/ord=(\d+(\.\d+)?)\?$/);
      });
    });

    it('should replace COUNTER', () => {
      return expandUrlAsync(
        'COUNTER(foo),COUNTER(bar),COUNTER(foo),COUNTER(bar),COUNTER(bar)'
      ).then((res) => {
        expect(res).to.equal('1,1,2,2,3');
      });
    });

    it('should replace CANONICAL_URL', () => {
      return expandUrlAsync('?href=CANONICAL_URL').then((res) => {
        expect(res).to.equal('?href=https%3A%2F%2Fpinterest.com%3A8080%2Fpin1');
      });
    });

    it('should replace CANONICAL_HOST', () => {
      return expandUrlAsync('?host=CANONICAL_HOST').then((res) => {
        expect(res).to.equal('?host=pinterest.com%3A8080');
      });
    });

    it('should replace CANONICAL_HOSTNAME', () => {
      return expandUrlAsync('?host=CANONICAL_HOSTNAME').then((res) => {
        expect(res).to.equal('?host=pinterest.com');
      });
    });

    it('should replace CANONICAL_PATH', () => {
      return expandUrlAsync('?path=CANONICAL_PATH').then((res) => {
        expect(res).to.equal('?path=%2Fpin1');
      });
    });

    it('should replace DOCUMENT_REFERRER', async () => {
      const replacements = await getReplacements();
      env.sandbox
        .stub(viewerService, 'getReferrerUrl')
        .returns('http://fake.example/?foo=bar');
      const res = await replacements.expandUrlAsync('?ref=DOCUMENT_REFERRER');
      expect(res).to.equal('?ref=http%3A%2F%2Ffake.example%2F%3Ffoo%3Dbar');
    });

    it('should replace EXTERNAL_REFERRER', () => {
      const windowInterface = mockWindowInterface(env.sandbox);
      windowInterface.getHostname.returns('different.org');
      return getReplacements()
        .then((replacements) => {
          stubServiceForDoc(
            env.sandbox,
            ampdoc,
            'viewer',
            'getReferrerUrl'
          ).returns(Promise.resolve('http://example.org/page.html'));
          return replacements.expandUrlAsync('?ref=EXTERNAL_REFERRER');
        })
        .then((res) => {
          expect(res).to.equal('?ref=http%3A%2F%2Fexample.org%2Fpage.html');
        });
    });

    it(
      'should replace EXTERNAL_REFERRER to empty string ' +
        'if referrer is of same domain',
      () => {
        const windowInterface = mockWindowInterface(env.sandbox);
        windowInterface.getHostname.returns('example.org');
        return getReplacements()
          .then((replacements) => {
            stubServiceForDoc(
              env.sandbox,
              ampdoc,
              'viewer',
              'getReferrerUrl'
            ).returns(Promise.resolve('http://example.org/page.html'));
            return replacements.expandUrlAsync('?ref=EXTERNAL_REFERRER');
          })
          .then((res) => {
            expect(res).to.equal('?ref=');
          });
      }
    );

    it(
      'should replace EXTERNAL_REFERRER to empty string ' +
        'if referrer is CDN proxy of same domain',
      () => {
        const windowInterface = mockWindowInterface(env.sandbox);
        windowInterface.getHostname.returns('example.org');
        return getReplacements()
          .then((replacements) => {
            stubServiceForDoc(
              env.sandbox,
              ampdoc,
              'viewer',
              'getReferrerUrl'
            ).returns(
              Promise.resolve(
                'https://example-org.cdn.ampproject.org/v/example.org/page.html'
              )
            );
            return replacements.expandUrlAsync('?ref=EXTERNAL_REFERRER');
          })
          .then((res) => {
            expect(res).to.equal('?ref=');
          });
      }
    );

    it(
      'should replace EXTERNAL_REFERRER to empty string ' +
        'if referrer is CDN proxy of same domain (before CURLS)',
      () => {
        const windowInterface = mockWindowInterface(env.sandbox);
        windowInterface.getHostname.returns('example.org');
        return getReplacements()
          .then((replacements) => {
            stubServiceForDoc(
              env.sandbox,
              ampdoc,
              'viewer',
              'getReferrerUrl'
            ).returns(
              Promise.resolve(
                'https://cdn.ampproject.org/v/example.org/page.html'
              )
            );
            return replacements.expandUrlAsync('?ref=EXTERNAL_REFERRER');
          })
          .then((res) => {
            expect(res).to.equal('?ref=');
          });
      }
    );

    it('should replace TITLE', () => {
      return expandUrlAsync('?title=TITLE').then((res) => {
        expect(res).to.equal('?title=Pixel%20Test');
      });
    });

    it('should prefer original title for TITLE', () => {
      return expandUrlAsync('?title=TITLE', /*opt_bindings*/ undefined, {
        withOriginalTitle: true,
      }).then((res) => {
        expect(res).to.equal('?title=Original%20Pixel%20Test');
      });
    });

    describe('AMPDOC_URL', () => {
      it('should replace AMPDOC_URL', () => {
        return expandUrlAsync('?ref=AMPDOC_URL').then((res) => {
          expect(res).to.not.match(/AMPDOC_URL/);
        });
      });

      it('should add extra params to AMPDOC_URL', () => {
        const win = getFakeWindow();
        win.location = parseUrlDeprecated(
          'https://cdn.ampproject.org/a/o.com/foo/?amp_r=hello%3Dworld'
        );
        return Services.urlReplacementsForDoc(win.document.documentElement)
          .expandUrlAsync('?url=AMPDOC_URL')
          .then((res) => {
            expect(res).to.contain(
              encodeURIComponent(
                'https://cdn.ampproject.org/a/o.com/foo/?hello=world'
              )
            );
          });
      });

      it('should merge extra params in AMPDOC_URL', () => {
        const win = getFakeWindow();
        win.location = parseUrlDeprecated(
          'https://cdn.ampproject.org/a/o.com/foo/?test=case&amp_r=hello%3Dworld'
        );
        return Services.urlReplacementsForDoc(win.document.documentElement)
          .expandUrlAsync('?url=AMPDOC_URL')
          .then((res) => {
            expect(res).to.contain(
              encodeURIComponent(
                'https://cdn.ampproject.org/a/o.com/foo/?test=case&hello=world'
              )
            );
          });
      });

      it('should allow an embedded amp_r parameter', () => {
        const win = getFakeWindow();
        win.location = parseUrlDeprecated(
          'https://cdn.ampproject.org/a/o.com/foo/?amp_r=amp_r%3Dweird'
        );
        return Services.urlReplacementsForDoc(win.document.documentElement)
          .expandUrlAsync('?url=AMPDOC_URL')
          .then((res) => {
            expect(res).to.contain(
              encodeURIComponent(
                'https://cdn.ampproject.org/a/o.com/foo/?amp_r=weird'
              )
            );
          });
      });

      it('should prefer original params in AMPDOC_URL', () => {
        const win = getFakeWindow();
        win.location = parseUrlDeprecated(
          'https://cdn.ampproject.org/a/o.com/foo/?test=case&amp_r=test%3Devil'
        );
        return Services.urlReplacementsForDoc(win.document.documentElement)
          .expandUrlAsync('?url=AMPDOC_URL')
          .then((res) => {
            expect(res).to.contain(
              encodeURIComponent(
                'https://cdn.ampproject.org/a/o.com/foo/?test=case'
              )
            );
          });
      });

      it('should merge multiple extra params safely in AMPDOC_URL', () => {
        const win = getFakeWindow();
        win.location = parseUrlDeprecated(
          'https://cdn.ampproject.org/a/o.com/foo/?test=case&a&hello=you&amp_r=hello%3Dworld%26goodnight%3Dmoon'
        );
        return Services.urlReplacementsForDoc(win.document.documentElement)
          .expandUrlAsync('?url=AMPDOC_URL')
          .then((res) => {
            expect(res).to.contain(
              encodeURIComponent(
                'https://cdn.ampproject.org/a/o.com/foo/?test=case&a&hello=you&goodnight=moon'
              )
            );
          });
      });
    });

    it('should replace AMPDOC_HOST', () => {
      return expandUrlAsync('?ref=AMPDOC_HOST').then((res) => {
        expect(res).to.not.match(/AMPDOC_HOST/);
      });
    });

    it('should replace AMPDOC_HOSTNAME', () => {
      return expandUrlAsync('?ref=AMPDOC_HOSTNAME').then((res) => {
        expect(res).to.not.match(/AMPDOC_HOSTNAME/);
      });
    });

    describe('SOURCE_URL', () => {
      it('should replace SOURCE_URL and SOURCE_HOST', () => {
        const win = getFakeWindow();
        win.location = parseUrlDeprecated('https://wrong.com');
        env.sandbox
          .stub(trackPromise, 'getTrackImpressionPromise')
          .callsFake(() => {
            return new Promise((resolve) => {
              win.location = parseUrlDeprecated('https://example.com/test');
              resolve();
            });
          });
        return Services.urlReplacementsForDoc(win.document.documentElement)
          .expandUrlAsync('?url=SOURCE_URL&host=SOURCE_HOST')
          .then((res) => {
            expect(res).to.equal(
              '?url=https%3A%2F%2Fexample.com%2Ftest&host=example.com'
            );
          });
      });

      it('should replace SOURCE_URL and SOURCE_HOSTNAME', () => {
        const win = getFakeWindow();
        win.location = parseUrlDeprecated('https://wrong.com');
        env.sandbox
          .stub(trackPromise, 'getTrackImpressionPromise')
          .callsFake(() => {
            return new Promise((resolve) => {
              win.location = parseUrlDeprecated('https://example.com/test');
              resolve();
            });
          });
        return Services.urlReplacementsForDoc(win.document.documentElement)
          .expandUrlAsync('?url=SOURCE_URL&hostname=SOURCE_HOSTNAME')
          .then((res) => {
            expect(res).to.equal(
              '?url=https%3A%2F%2Fexample.com%2Ftest&hostname=example.com'
            );
          });
      });

      it('should update SOURCE_URL after track impression', () => {
        const win = getFakeWindow();
        win.location = parseUrlDeprecated('https://wrong.com');
        env.sandbox
          .stub(trackPromise, 'getTrackImpressionPromise')
          .callsFake(() => {
            return new Promise((resolve) => {
              win.location = parseUrlDeprecated(
                'https://example.com?gclid=123456'
              );
              resolve();
            });
          });
        return Services.urlReplacementsForDoc(win.document.documentElement)
          .expandUrlAsync('?url=SOURCE_URL')
          .then((res) => {
            expect(res).to.contain('example.com');
          });
      });

      it('should add extra params to SOURCE_URL', () => {
        const win = getFakeWindow();
        win.location = parseUrlDeprecated(
          'https://cdn.ampproject.org/a/o.com/foo/?a&amp_r=hello%3Dworld'
        );
        env.sandbox
          .stub(trackPromise, 'getTrackImpressionPromise')
          .callsFake(() => {
            return Promise.resolve();
          });
        return Services.urlReplacementsForDoc(win.document.documentElement)
          .expandUrlAsync('?url=SOURCE_URL')
          .then((res) => {
            expect(res).to.equal(
              '?url=' + encodeURIComponent('http://o.com/foo/?a&hello=world')
            );
          });
      });

      it('should ignore extra params that already exists in SOURCE_URL', () => {
        const win = getFakeWindow();
        win.location = parseUrlDeprecated(
          'https://cdn.ampproject.org/a/o.com/foo/?a=1&safe=1&amp_r=hello%3Dworld%26safe=evil'
        );
        env.sandbox
          .stub(trackPromise, 'getTrackImpressionPromise')
          .callsFake(() => {
            return Promise.resolve();
          });
        return Services.urlReplacementsForDoc(win.document.documentElement)
          .expandUrlAsync('?url=SOURCE_URL')
          .then((res) => {
            expect(res).to.equal(
              '?url=' +
                encodeURIComponent('http://o.com/foo/?a=1&safe=1&hello=world')
            );
          });
      });

      it('should not change SOURCE_URL if is not ad landing page', () => {
        const win = getFakeWindow();
        win.location = parseUrlDeprecated(
          'https://cdn.ampproject.org/v/o.com/foo/?a&amp_r=hello%3Dworld'
        );
        env.sandbox
          .stub(trackPromise, 'getTrackImpressionPromise')
          .callsFake(() => {
            return Promise.resolve();
          });
        return Services.urlReplacementsForDoc(win.document.documentElement)
          .expandUrlAsync('?url=SOURCE_URL')
          .then((res) => {
            expect(res).to.equal(
              '?url=' + encodeURIComponent('http://o.com/foo/?a')
            );
          });
      });
    });

    it('should replace SOURCE_PATH', () => {
      return expandUrlAsync('?path=SOURCE_PATH').then((res) => {
        expect(res).to.not.match(/SOURCE_PATH/);
      });
    });

    it('should replace PAGE_VIEW_ID', () => {
      return expandUrlAsync('?pid=PAGE_VIEW_ID').then((res) => {
        expect(res).to.match(/pid=\d+/);
      });
    });

    it('should replace PAGE_VIEW_ID_64', () => {
      return expandUrlAsync('?pid=PAGE_VIEW_ID_64').then((res) => {
        expect(res).to.match(/pid=([a-zA-Z0-9_-]{10,})/);
      });
    });

    it('should replace CLIENT_ID', () => {
      setCookie(window, 'url-abc', 'cid-for-abc');
      // Make sure cookie does not exist
      setCookie(window, 'url-xyz', '');
      return expandUrlAsync(
        '?a=CLIENT_ID(url-abc)&b=CLIENT_ID(url-xyz)',
        /*opt_bindings*/ undefined,
        {withCid: true}
      ).then((res) => {
        expect(res).to.match(/^\?a=cid-for-abc\&b=amp-([a-zA-Z0-9_-]{10,})/);
      });
    });

    it('should allow empty CLIENT_ID', () => {
      return getReplacements()
        .then((replacements) => {
          stubServiceForDoc(env.sandbox, ampdoc, 'cid', 'get').returns(
            Promise.resolve()
          );
          return replacements.expandUrlAsync('?a=CLIENT_ID(_ga)');
        })
        .then((res) => {
          expect(res).to.equal('?a=');
        });
    });

    it('should replace CLIENT_ID with opt_cookieName', () => {
      setCookie(window, 'url-abc', 'cid-for-abc');
      // Make sure cookie does not exist
      setCookie(window, 'url-xyz', '');
      return expandUrlAsync(
        '?a=CLIENT_ID(abc,,url-abc)&b=CLIENT_ID(xyz,,url-xyz)',
        /*opt_bindings*/ undefined,
        {withCid: true}
      ).then((res) => {
        expect(res).to.match(/^\?a=cid-for-abc\&b=amp-([a-zA-Z0-9_-]{10,})/);
      });
    });

    it('should parse _ga cookie correctly', () => {
      setCookie(window, '_ga', 'GA1.2.12345.54321');
      return expandUrlAsync(
        '?a=CLIENT_ID(AMP_ECID_GOOGLE,,_ga)&b=CLIENT_ID(_ga)',
        /*opt_bindings*/ undefined,
        {withCid: true}
      ).then((res) => {
        expect(res).to.match(/^\?a=12345.54321&b=12345.54321/);
      });
    });

    it('should replace CLIENT_ID synchronously when available', () => {
      return getReplacements({withCid: true}).then((urlReplacements) => {
        setCookie(window, 'url-abc', 'cid-for-abc');
        setCookie(window, 'url-xyz', 'cid-for-xyz');
        // Only requests cid-for-xyz in async path
        return urlReplacements
          .expandUrlAsync('b=CLIENT_ID(url-xyz)')
          .then((res) => {
            expect(res).to.equal('b=cid-for-xyz');
          })
          .then(() => {
            const result = urlReplacements.expandUrlSync(
              '?a=CLIENT_ID(url-abc)&b=CLIENT_ID(url-xyz)' +
                '&c=CLIENT_ID(other)'
            );
            expect(result).to.equal('?a=&b=cid-for-xyz&c=');
          });
      });
    });

    it('should replace AMP_STATE(key)', () => {
      const win = getFakeWindow();
      env.sandbox.stub(Services, 'bindForDocOrNull').returns(
        Promise.resolve({
          getStateValue(key) {
            expect(key).to.equal('foo.bar');
            return Promise.resolve('baz');
          },
        })
      );
      return Services.urlReplacementsForDoc(win.document.documentElement)
        .expandUrlAsync('?state=AMP_STATE(foo.bar)')
        .then((res) => {
          expect(res).to.equal('?state=baz');
        });
    });

    it.skip('should replace VARIANT', () => {
      return expect(
        expandUrlAsync(
          '?x1=VARIANT(x1)&x2=VARIANT(x2)&x3=VARIANT(x3)',
          /*opt_bindings*/ undefined,
          {withVariant: true}
        )
      ).to.eventually.equal('?x1=v1&x2=none&x3=');
    });

    it.skip(
      'should replace VARIANT with empty string if ' +
        'amp-experiment is not configured ',
      () => {
        return expect(
          expandUrlAsync('?x1=VARIANT(x1)&x2=VARIANT(x2)&x3=VARIANT(x3)')
        ).to.eventually.equal('?x1=&x2=&x3=');
      }
    );

    it('should replace VARIANTS', () => {
      return expect(
        expandUrlAsync('?VARIANTS', /*opt_bindings*/ undefined, {
          withVariant: true,
        })
      ).to.eventually.equal('?x1.v1!x2.none');
    });

    it.skip(
      'should replace VARIANTS with empty string if ' +
        'amp-experiment is not configured ',
      () => {
        return expect(expandUrlAsync('?VARIANTS')).to.eventually.equal('?');
      }
    );

    it('should replace TIMESTAMP', () => {
      return expandUrlAsync('?ts=TIMESTAMP').then((res) => {
        expect(res).to.match(/ts=\d+/);
      });
    });

    it('should replace TIMESTAMP_ISO', () => {
      return expandUrlAsync('?tsf=TIMESTAMP_ISO').then((res) => {
        expect(res).to.match(/tsf=\d+/);
      });
    });

    it('should return correct ISO timestamp', () => {
      const fakeTime = 1499979336612;
      env.sandbox.useFakeTimers(fakeTime);
      return expect(expandUrlAsync('?tsf=TIMESTAMP_ISO')).to.eventually.equal(
        '?tsf=2017-07-13T20%3A55%3A36.612Z'
      );
    });

    it('should replace TIMEZONE', () => {
      return expandUrlAsync('?tz=TIMEZONE').then((res) => {
        expect(res).to.match(/tz=-?\d+/);
      });
    });

    it('should replace SCROLL_HEIGHT', () => {
      return expandUrlAsync('?scrollHeight=SCROLL_HEIGHT').then((res) => {
        expect(res).to.match(/scrollHeight=\d+/);
      });
    });

    it('should replace SCREEN_WIDTH', () => {
      return expandUrlAsync('?sw=SCREEN_WIDTH').then((res) => {
        expect(res).to.match(/sw=\d+/);
      });
    });

    it('should replace SCREEN_HEIGHT', () => {
      return expandUrlAsync('?sh=SCREEN_HEIGHT').then((res) => {
        expect(res).to.match(/sh=\d+/);
      });
    });

    it('should replace VIEWPORT_WIDTH', () => {
      return expandUrlAsync('?vw=VIEWPORT_WIDTH').then((res) => {
        expect(res).to.match(/vw=\d+/);
      });
    });

    it('should replace VIEWPORT_HEIGHT', () => {
      return expandUrlAsync('?vh=VIEWPORT_HEIGHT').then((res) => {
        expect(res).to.match(/vh=\d+/);
      });
    });

    it('should replace PAGE_LOAD_TIME', () => {
      return expandUrlAsync('?sh=PAGE_LOAD_TIME').then((res) => {
        expect(res).to.match(/sh=\d+/);
      });
    });

    it('should reject protocol changes', () => {
      const win = getFakeWindow();
      const {documentElement} = win.document;
      const urlReplacements = Services.urlReplacementsForDoc(documentElement);
      return urlReplacements
        .expandUrlAsync('PROTOCOL://example.com/?r=RANDOM', {
          'PROTOCOL': Promise.resolve('abc'),
        })
        .then((expanded) => {
          expect(expanded).to.equal('PROTOCOL://example.com/?r=RANDOM');
        });
    });

    it('Should replace BACKGROUND_STATE with 0', () => {
      const win = getFakeWindow();
      const {ampdoc} = win;
      env.sandbox.stub(ampdoc, 'isVisible').returns(true);
      return Services.urlReplacementsForDoc(win.document.documentElement)
        .expandUrlAsync('?sh=BACKGROUND_STATE')
        .then((res) => {
          expect(res).to.equal('?sh=0');
        });
    });

    it('Should replace BACKGROUND_STATE with 1', () => {
      const win = getFakeWindow();
      const {ampdoc} = win;
      env.sandbox.stub(ampdoc, 'isVisible').returns(false);
      return Services.urlReplacementsForDoc(win.document.documentElement)
        .expandUrlAsync('?sh=BACKGROUND_STATE')
        .then((res) => {
          expect(res).to.equal('?sh=1');
        });
    });

    it('Should replace VIDEO_STATE(video,parameter) with video data', () => {
      const win = getFakeWindow();
      env.sandbox.stub(Services, 'videoManagerForDoc').returns({
        getVideoStateProperty() {
          return Promise.resolve('1.5');
        },
      });
      env.sandbox
        .stub(win.document, 'getElementById')
        .withArgs('video')
        .returns(document.createElement('video'));

      return Services.urlReplacementsForDoc(win.document.documentElement)
        .expandUrlAsync('?sh=VIDEO_STATE(video,currentTime)')
        .then((res) => {
          expect(res).to.equal('?sh=1.5');
        });
    });

    describe('PAGE_LOAD_TIME', () => {
      let win;
      let eventListeners;
      beforeEach(() => {
        win = getFakeWindow();
        eventListeners = {};
        win.document.readyState = 'loading';
        win.document.addEventListener = function (eventType, handler) {
          eventListeners[eventType] = handler;
        };
        win.document.removeEventListener = function (eventType, handler) {
          if (eventListeners[eventType] == handler) {
            delete eventListeners[eventType];
          }
        };
      });

      it('is replaced if timing info is not available', () => {
        win.document.readyState = 'complete';
        return Services.urlReplacementsForDoc(win.document.documentElement)
          .expandUrlAsync('?sh=PAGE_LOAD_TIME&s')
          .then((res) => {
            expect(res).to.match(/sh=&s/);
          });
      });

      it('is replaced if PAGE_LOAD_TIME is available within a delay', () => {
        const {documentElement} = win.document;
        const urlReplacements = Services.urlReplacementsForDoc(documentElement);
        const validMetric = urlReplacements.expandUrlAsync(
          '?sh=PAGE_LOAD_TIME&s'
        );
        urlReplacements.ampdoc.win.performance.timing.loadEventStart = 109;
        win.document.readyState = 'complete';
        loadObservable.fire({type: 'load'});
        return validMetric.then((res) => {
          expect(res).to.match(/sh=9&s/);
        });
      });
    });

    it('should replace NAV_REDIRECT_COUNT', () => {
      return expandUrlAsync('?sh=NAV_REDIRECT_COUNT').then((res) => {
        expect(res).to.match(/sh=\d+/);
      });
    });

    it.skip('should replace NAV_TIMING', () => {
      return expandUrlAsync(
        '?a=NAV_TIMING(navigationStart)' +
          '&b=NAV_TIMING(navigationStart,responseStart)'
      ).then((res) => {
        expect(res).to.match(/a=\d+&b=\d+/);
      });
    });

    it('should replace NAV_TIMING when attribute names are invalid', () => {
      return expandUrlAsync(
        '?a=NAV_TIMING(invalid)' +
          '&b=NAV_TIMING(invalid,invalid)' +
          '&c=NAV_TIMING(navigationStart,invalid)' +
          '&d=NAV_TIMING(invalid,responseStart)'
      ).then((res) => {
        expect(res).to.match(/a=&b=&c=&d=/);
      });
    });

    it('should replace NAV_TYPE', () => {
      return expandUrlAsync('?sh=NAV_TYPE').then((res) => {
        expect(res).to.match(/sh=\d+/);
      });
    });

    it('should replace DOMAIN_LOOKUP_TIME', () => {
      return expandUrlAsync('?sh=DOMAIN_LOOKUP_TIME').then((res) => {
        expect(res).to.match(/sh=\d+/);
      });
    });

    it('should replace TCP_CONNECT_TIME', () => {
      return expandUrlAsync('?sh=TCP_CONNECT_TIME').then((res) => {
        expect(res).to.match(/sh=\d+/);
      });
    });

    it('should replace SERVER_RESPONSE_TIME', () => {
      return expandUrlAsync('?sh=SERVER_RESPONSE_TIME').then((res) => {
        expect(res).to.match(/sh=\d+/);
      });
    });

    it('should replace PAGE_DOWNLOAD_TIME', () => {
      return expandUrlAsync('?sh=PAGE_DOWNLOAD_TIME').then((res) => {
        expect(res).to.match(/sh=\d+/);
      });
    });

    it.skip('should replace REDIRECT_TIME', () => {
      return expandUrlAsync('?sh=REDIRECT_TIME').then((res) => {
        expect(res).to.match(/sh=\d+/);
      });
    });

    it('should replace DOM_INTERACTIVE_TIME', () => {
      return expandUrlAsync('?sh=DOM_INTERACTIVE_TIME').then((res) => {
        expect(res).to.match(/sh=\d+/);
      });
    });

    it('should replace CONTENT_LOAD_TIME', () => {
      return expandUrlAsync('?sh=CONTENT_LOAD_TIME').then((res) => {
        expect(res).to.match(/sh=\d+/);
      });
    });

    it('should replace AVAILABLE_SCREEN_HEIGHT', () => {
      return expandUrlAsync('?sh=AVAILABLE_SCREEN_HEIGHT').then((res) => {
        expect(res).to.match(/sh=\d+/);
      });
    });

    it('should replace AVAILABLE_SCREEN_WIDTH', () => {
      return expandUrlAsync('?sh=AVAILABLE_SCREEN_WIDTH').then((res) => {
        expect(res).to.match(/sh=\d+/);
      });
    });

    it('should replace SCREEN_COLOR_DEPTH', () => {
      return expandUrlAsync('?sh=SCREEN_COLOR_DEPTH').then((res) => {
        expect(res).to.match(/sh=\d+/);
      });
    });

    it('should replace BROWSER_LANGUAGE', () => {
      return expandUrlAsync('?sh=BROWSER_LANGUAGE').then((res) => {
        expect(res).to.match(/sh=\w+/);
      });
    });

    it('should replace UACH platform', () => {
      return expandUrlAsync('?sh=UACH(platform)').then((res) => {
        expect(res).to.match(/sh=\w?/);
      });
    });

    it('should replace UACH brands', () => {
      return expandUrlAsync('?sh=UACH(brands)').then((res) => {
        expect(res).to.match(/sh=\w?/);
      });
    });

    it('should replace USER_AGENT', () => {
      return expandUrlAsync('?sh=USER_AGENT').then((res) => {
        expect(res).to.match(/sh=\w+/);
      });
    });

    it('should replace VIEWER with origin', () => {
      return getReplacements().then((replacements) => {
        env.sandbox
          .stub(viewerService, 'getViewerOrigin')
          .returns(Promise.resolve('https://www.google.com'));
        return replacements.expandUrlAsync('?sh=VIEWER').then((res) => {
          expect(res).to.equal('?sh=https%3A%2F%2Fwww.google.com');
        });
      });
    });

    it('should replace VIEWER with empty string', () => {
      return getReplacements().then((replacements) => {
        env.sandbox
          .stub(viewerService, 'getViewerOrigin')
          .returns(Promise.resolve(''));
        return replacements.expandUrlAsync('?sh=VIEWER').then((res) => {
          expect(res).to.equal('?sh=');
        });
      });
    });

    it('should replace TOTAL_ENGAGED_TIME', () => {
      return expandUrlAsync(
        '?sh=TOTAL_ENGAGED_TIME',
        /*opt_bindings*/ undefined,
        {withActivity: true}
      ).then((res) => {
        expect(res).to.match(/sh=\d+/);
      });
    });

    it('should replace INCREMENTAL_ENGAGED_TIME', () => {
      return expandUrlAsync(
        '?sh=INCREMENTAL_ENGAGED_TIME',
        /*opt_bindings*/ undefined,
        {withActivity: true}
      ).then((res) => {
        expect(res).to.match(/sh=\d+/);
      });
    });

    it('should replace AMP_VERSION', () => {
      return expandUrlAsync('?sh=AMP_VERSION').then((res) => {
        expect(res).to.equal('?sh=%24internalRuntimeVersion%24');
      });
    });

    it('should replace FRAGMENT_PARAM with 2', () => {
      const win = getFakeWindow();
      win.location = {originalHash: '#margarine=1&ice=2&cream=3'};
      return Services.urlReplacementsForDoc(win.document.documentElement)
        .expandUrlAsync('?sh=FRAGMENT_PARAM(ice)&s')
        .then((res) => {
          expect(res).to.equal('?sh=2&s');
        });
    });

    it('should async replace AMP_GEO(ISOCountry) and AMP_GEO', () => {
      env.sandbox.stub(Services, 'geoForDocOrNull').returns(
        Promise.resolve({
          'ISOCountry': 'unknown',
          'ISOCountryGroups': ['nafta', 'waldo'],
          'nafta': true,
          'waldo': true,
          'matchedISOCountryGroups': ['nafta', 'waldo'],
        })
      );
      return expandUrlAsync('?geo=AMP_GEO,country=AMP_GEO(ISOCountry)').then(
        (res) => {
          expect(res).to.equal('?geo=nafta%2Cwaldo,country=unknown');
        }
      );
    });

    it('should sync replace AMP_GEO(ISOCountry) and AMP_GEO', () => {
      env.sandbox.stub(Services, 'geoForDocOrNull').returns(
        Promise.resolve({
          'ISOCountry': 'unknown',
          'ISOCountryGroups': ['nafta', 'waldo'],
          'nafta': true,
          'waldo': true,
          'matchedISOCountryGroups': ['nafta', 'waldo'],
        })
      );
      getReplacements().then((replacements) =>
        expect(
          replacements.expandUrlSync('?geo=AMP_GEO,country=AMP_GEO(ISOCountry)')
        ).to.equal('?geo=nafta%2Cwaldo,country=unknown')
      );
    });

    it('should sync replace AMP_GEO(ISOCountry) and AMP_GEO with unknown when geo is not available', () => {
      env.sandbox.stub(Services, 'geoForDocOrNull').returns(null);
      getReplacements().then((replacements) =>
        expect(
          replacements.expandUrlSync('?geo=AMP_GEO,country=AMP_GEO(ISOCountry)')
        ).to.equal('?geo=unknown,country=unknown')
      );
    });

    it('should sync replace AMP_GEO(ISOCountry) and AMP_GEO with unknown when geo is unknown', () => {
      getReplacements().then((replacements) =>
        expect(
          replacements.expandUrlSync('?geo=AMP_GEO,country=AMP_GEO(ISOCountry)')
        ).to.equal('?geo=unknown,country=unknown')
      );
    });

    it('should accept $expressions', () => {
      return expandUrlAsync('?href=$CANONICAL_URL').then((res) => {
        expect(res).to.equal('?href=https%3A%2F%2Fpinterest.com%3A8080%2Fpin1');
      });
    });

    it('should ignore unknown substitutions', () => {
      return expandUrlAsync('?a=UNKNOWN').then((res) => {
        expect(res).to.equal('?a=UNKNOWN');
      });
    });

    it('should replace several substitutions', () => {
      return expandUrlAsync('?a=UNKNOWN&href=CANONICAL_URL&title=TITLE').then(
        (res) => {
          expect(res).to.equal(
            '?a=UNKNOWN' +
              '&href=https%3A%2F%2Fpinterest.com%3A8080%2Fpin1' +
              '&title=Pixel%20Test'
          );
        }
      );
    });

    it('should replace new substitutions', () => {
      return getReplacements().then((replacements) => {
        replacements.getVariableSource().set('ONE', () => 'a');
        expect(replacements.expandUrlAsync('?a=ONE')).to.eventually.equal(
          '?a=a'
        );
        replacements.getVariableSource().set('ONE', () => 'b');
        replacements.getVariableSource().set('TWO', () => 'b');
        return expect(
          replacements.expandUrlAsync('?a=ONE&b=TWO')
        ).to.eventually.equal('?a=b&b=b');
      });
    });

    it.skip('should report errors & replace them with empty string (sync)', () => {
      const clock = env.sandbox.useFakeTimers();
      const {documentElement} = window.document;
      const replacements = Services.urlReplacementsForDoc(documentElement);
      replacements.getVariableSource().set('ONE', () => {
        throw new Error('boom');
      });
      const p = expect(
        replacements.expandUrlAsync('?a=ONE')
      ).to.eventually.equal('?a=');
      allowConsoleError(() => {
        expect(() => {
          clock.tick(1);
        }).to.throw(/boom/);
      });
      return p;
    });

    it.skip('should report errors & replace them with empty string (promise)', () => {
      const clock = env.sandbox.useFakeTimers();
      const {documentElement} = window.document;
      const replacements = Services.urlReplacementsForDoc(documentElement);
      replacements.getVariableSource().set('ONE', () => {
        return Promise.reject(new Error('boom'));
      });
      return expect(replacements.expandUrlAsync('?a=ONE'))
        .to.eventually.equal('?a=')
        .then(() => {
          allowConsoleError(() => {
            expect(() => {
              clock.tick(1);
            }).to.throw(/boom/);
          });
        });
    });

    it('should support positional arguments', () => {
      return getReplacements().then((replacements) => {
        replacements.getVariableSource().set('FN', (one) => one);
        return expect(
          replacements.expandUrlAsync('?a=FN(xyz1)')
        ).to.eventually.equal('?a=xyz1');
      });
    });

    it('should support multiple positional arguments', () => {
      return getReplacements().then((replacements) => {
        replacements.getVariableSource().set('FN', (one, two) => {
          return one + '-' + two;
        });
        return expect(
          replacements.expandUrlAsync('?a=FN(xyz,abc)')
        ).to.eventually.equal('?a=xyz-abc');
      });
    });

    it('should support multiple positional arguments with dots', () => {
      return getReplacements().then((replacements) => {
        replacements.getVariableSource().set('FN', (one, two) => {
          return one + '-' + two;
        });
        return expect(
          replacements.expandUrlAsync('?a=FN(xy.z,ab.c)')
        ).to.eventually.equal('?a=xy.z-ab.c');
      });
    });

    it('should support promises as replacements', () => {
      return getReplacements().then((replacements) => {
        replacements
          .getVariableSource()
          .set('P1', () => Promise.resolve('abc '));
        replacements
          .getVariableSource()
          .set('P2', () => Promise.resolve('xyz'));
        replacements
          .getVariableSource()
          .set('P3', () => Promise.resolve('123'));
        replacements.getVariableSource().set('OTHER', () => 'foo');
        return expect(
          replacements.expandUrlAsync('?a=P1&b=P2&c=P3&d=OTHER')
        ).to.eventually.equal('?a=abc%20&b=xyz&c=123&d=foo');
      });
    });

    it('should override an existing binding', () => {
      return expandUrlAsync('ord=RANDOM?', {'RANDOM': 'abc'}).then((res) => {
        expect(res).to.match(/ord=abc\?$/);
      });
    });

    it('should add an additional binding', () => {
      return expandUrlAsync('rid=NONSTANDARD?', {'NONSTANDARD': 'abc'}).then(
        (res) => {
          expect(res).to.match(/rid=abc\?$/);
        }
      );
    });

    it('should NOT overwrite the cached expression with new bindings', () => {
      return expandUrlAsync('rid=NONSTANDARD?', {'NONSTANDARD': 'abc'}).then(
        (res) => {
          expect(res).to.match(/rid=abc\?$/);
          return expandUrlAsync('rid=NONSTANDARD?').then((res) => {
            expect(res).to.match(/rid=NONSTANDARD\?$/);
          });
        }
      );
    });

    it('should expand bindings as functions', () => {
      return expandUrlAsync('rid=FUNC(abc)?', {
        'FUNC': (value) => 'func_' + value,
      }).then((res) => {
        expect(res).to.match(/rid=func_abc\?$/);
      });
    });

    it('should expand bindings as functions with promise', () => {
      return expandUrlAsync('rid=FUNC(abc)?', {
        'FUNC': (value) => Promise.resolve('func_' + value),
      }).then((res) => {
        expect(res).to.match(/rid=func_abc\?$/);
      });
    });

    it('should expand null as empty string', () => {
      return expandUrlAsync('v=VALUE', {'VALUE': null}).then((res) => {
        expect(res).to.equal('v=');
      });
    });

    it('should expand undefined as empty string', () => {
      return expandUrlAsync('v=VALUE', {'VALUE': undefined}).then((res) => {
        expect(res).to.equal('v=');
      });
    });

    it('should expand empty string as empty string', () => {
      return expandUrlAsync('v=VALUE', {'VALUE': ''}).then((res) => {
        expect(res).to.equal('v=');
      });
    });

    it('should expand zero as zero', () => {
      return expandUrlAsync('v=VALUE', {'VALUE': 0}).then((res) => {
        expect(res).to.equal('v=0');
      });
    });

    it('should expand false as false', () => {
      return expandUrlAsync('v=VALUE', {'VALUE': false}).then((res) => {
        expect(res).to.equal('v=false');
      });
    });

    it('should resolve sub-included bindings', () => {
      // RANDOM is a standard property and we add RANDOM_OTHER.
      return expandUrlAsync('r=RANDOM&ro=RANDOM_OTHER?', {
        'RANDOM_OTHER': 'ABC',
      }).then((res) => {
        expect(res).to.match(/r=(\d+(\.\d+)?)&ro=ABC\?$/);
      });
    });

    it('should expand multiple vars', () => {
      return expandUrlAsync('a=VALUEA&b=VALUEB?', {
        'VALUEA': 'aaa',
        'VALUEB': 'bbb',
      }).then((res) => {
        expect(res).to.match(/a=aaa&b=bbb\?$/);
      });
    });

    describe('QUERY_PARAM', () => {
      it('should replace QUERY_PARAM with foo', () => {
        const win = getFakeWindow();
        win.location = parseUrlDeprecated(
          'https://example.com?query_string_param1=wrong'
        );
        env.sandbox
          .stub(trackPromise, 'getTrackImpressionPromise')
          .callsFake(() => {
            return new Promise((resolve) => {
              win.location = parseUrlDeprecated(
                'https://example.com?query_string_param1=foo'
              );
              resolve();
            });
          });
        return Services.urlReplacementsForDoc(win.document.documentElement)
          .expandUrlAsync('?sh=QUERY_PARAM(query_string_param1)&s')
          .then((res) => {
            expect(res).to.match(/sh=foo&s/);
          });
      });

      it('should replace QUERY_PARAM with ""', () => {
        const win = getFakeWindow();
        win.location = parseUrlDeprecated('https://example.com');
        env.sandbox
          .stub(trackPromise, 'getTrackImpressionPromise')
          .callsFake(() => {
            return Promise.resolve();
          });
        return Services.urlReplacementsForDoc(win.document.documentElement)
          .expandUrlAsync('?sh=QUERY_PARAM(query_string_param1)&s')
          .then((res) => {
            expect(res).to.match(/sh=&s/);
          });
      });

      it('should replace QUERY_PARAM with default_value', () => {
        const win = getFakeWindow();
        win.location = parseUrlDeprecated('https://example.com');
        env.sandbox
          .stub(trackPromise, 'getTrackImpressionPromise')
          .callsFake(() => {
            return Promise.resolve();
          });
        return Services.urlReplacementsForDoc(win.document.documentElement)
          .expandUrlAsync(
            '?sh=QUERY_PARAM(query_string_param1,default_value)&s'
          )
          .then((res) => {
            expect(res).to.match(/sh=default_value&s/);
          });
      });

      it('should replace QUERY_PARAM with extra param', () => {
        const win = getFakeWindow();
        win.location = parseUrlDeprecated(
          'https://cdn.ampproject.org/a/o.com/foo/?x=wrong'
        );
        env.sandbox
          .stub(trackPromise, 'getTrackImpressionPromise')
          .callsFake(() => {
            return new Promise((resolve) => {
              win.location = parseUrlDeprecated(
                'https://cdn.ampproject.org/a/o.com/foo/?amp_r=x%3Dfoo'
              );
              resolve();
            });
          });
        return Services.urlReplacementsForDoc(win.document.documentElement)
          .expandUrlAsync('?sh=QUERY_PARAM(x)&s')
          .then((res) => {
            expect(res).to.match(/sh=foo&s/);
          });
      });

      it('should replace QUERY_PARAM, preferring original over extra', () => {
        const win = getFakeWindow();
        win.location = parseUrlDeprecated(
          'https://cdn.ampproject.org/a/o.com/foo/?x=wrong'
        );
        env.sandbox
          .stub(trackPromise, 'getTrackImpressionPromise')
          .callsFake(() => {
            return new Promise((resolve) => {
              win.location = parseUrlDeprecated(
                'https://cdn.ampproject.org/a/o.com/foo/?x=foo&amp_r=x%3Devil'
              );
              resolve();
            });
          });
        return Services.urlReplacementsForDoc(win.document.documentElement)
          .expandUrlAsync('?sh=QUERY_PARAM(x)&s')
          .then((res) => {
            expect(res).to.match(/sh=foo&s/);
          });
      });
    });

    it('should collect vars', () => {
      const win = getFakeWindow();
      win.location = parseUrlDeprecated('https://example.com?p1=foo');
      env.sandbox
        .stub(trackPromise, 'getTrackImpressionPromise')
        .callsFake(() => {
          return Promise.resolve();
        });
      return Services.urlReplacementsForDoc(win.document.documentElement)
        .collectVars('?SOURCE_HOST&QUERY_PARAM(p1)&SIMPLE&FUNC&PROMISE', {
          'SIMPLE': 21,
          'FUNC': () => 22,
          'PROMISE': () => Promise.resolve(23),
        })
        .then((res) => {
          expect(res).to.deep.equal({
            'SOURCE_HOST': 'example.com',
            'QUERY_PARAM(p1)': 'foo',
            'SIMPLE': 21,
            'FUNC': 22,
            'PROMISE': 23,
          });
        });
    });

    it('should collect unallowlisted vars', () => {
      const win = getFakeWindow();
      win.location = parseUrlDeprecated(
        'https://example.com/base?foo=bar&bar=abc&gclid=123'
      );
      const element = document.createElement('amp-foo');
      element.setAttribute('src', '?SOURCE_HOST&QUERY_PARAM(p1)&COUNTER');
      element.setAttribute('data-amp-replace', 'QUERY_PARAM');
      const {documentElement} = win.document;
      const urlReplacements = Services.urlReplacementsForDoc(documentElement);
      const unallowlisted = urlReplacements.collectDisallowedVarsSync(element);
      expect(unallowlisted).to.deep.equal(['SOURCE_HOST', 'COUNTER']);
    });

    it('should reject javascript protocol', () => {
      const protocolErrorRegex = /invalid protocol/;
      expectAsyncConsoleError(protocolErrorRegex);
      const win = getFakeWindow();
      const {documentElement} = win.document;
      const urlReplacements = Services.urlReplacementsForDoc(documentElement);
      /*eslint no-script-url: 0*/
      return urlReplacements
        .expandUrlAsync('javascript://example.com/?r=RANDOM')
        .then(
          () => {
            throw new Error('never here');
          },
          (err) => {
            expect(err.message).to.match(protocolErrorRegex);
          }
        );
    });

    describe('sync expansion', () => {
      it('should expand w/ collect vars (skip async macro)', () => {
        const win = getFakeWindow();
        const {documentElement} = win.document;
        const urlReplacements = Services.urlReplacementsForDoc(documentElement);
        urlReplacements.ampdoc.win.performance.timing.loadEventStart = 109;
        const expanded = urlReplacements.expandUrlSync(
          'r=RANDOM&c=CONST&f=FUNCT(hello,world)&a=b&d=PROM&e=PAGE_LOAD_TIME',
          {
            'CONST': 'ABC',
            'FUNCT': function (a, b) {
              return a + b;
            },
            // Will ignore promise based result and instead insert empty string.
            'PROM': function () {
              return Promise.resolve('boo');
            },
          }
        );
        expect(expanded).to.match(
          /^r=\d(\.\d+)?&c=ABC&f=helloworld&a=b&d=&e=9$/
        );
      });

      it('should reject protocol changes', () => {
        const win = getFakeWindow();
        const {documentElement} = win.document;
        const urlReplacements = Services.urlReplacementsForDoc(documentElement);
        let expanded = urlReplacements.expandUrlSync(
          'PROTOCOL://example.com/?r=RANDOM',
          {
            'PROTOCOL': 'abc',
          }
        );
        expect(expanded).to.equal('PROTOCOL://example.com/?r=RANDOM');
        expanded = urlReplacements.expandUrlSync(
          'FUNCT://example.com/?r=RANDOM',
          {
            'FUNCT': function () {
              return 'abc';
            },
          }
        );
        expect(expanded).to.equal('FUNCT://example.com/?r=RANDOM');
      });

      it('should reject javascript protocol', () => {
        const win = getFakeWindow();
        const {documentElement} = win.document;
        const urlReplacements = Services.urlReplacementsForDoc(documentElement);
        allowConsoleError(() => {
          expect(() => {
            /*eslint no-script-url: 0*/
            urlReplacements.expandUrlSync('javascript://example.com/?r=RANDOM');
          }).to.throw('invalid protocol');
        });
      });
    });

    it('should expand sync and respect allowlisted', () => {
      const win = getFakeWindow();
      const {documentElement} = win.document;
      const urlReplacements = Services.urlReplacementsForDoc(documentElement);
      const expanded = urlReplacements.expandUrlSync(
        'r=RANDOM&c=CONST&f=FUNCT(hello,world)&a=b&d=PROM&e=PAGE_LOAD_TIME',
        {
          'CONST': 'ABC',
          'FUNCT': () => {
            throw Error('Should not be called');
          },
        },
        {
          'CONST': true,
        }
      );
      expect(expanded).to.equal(
        'r=RANDOM&c=ABC&f=FUNCT(hello,world)&a=b&d=PROM&e=PAGE_LOAD_TIME'
      );
    });

    describe('access values via amp-access', () => {
      let accessService;
      let accessServiceMock;

      beforeEach(() => {
        accessService = {
          getAccessReaderId: () => {},
          getAuthdataField: () => {},
        };
        accessServiceMock = env.sandbox.mock(accessService);
        env.sandbox
          .stub(Services, 'accessServiceForDocOrNull')
          .callsFake(() => {
            return Promise.resolve(accessService);
          });
      });

      afterEach(() => {
        accessServiceMock.verify();
      });

      function expandUrlAsync(url, opt_disabled) {
        if (opt_disabled) {
          accessService = null;
        }
        return createIframePromise().then((iframe) => {
          iframe.doc.title = 'Pixel Test';
          const link = iframe.doc.createElement('link');
          link.setAttribute('href', 'https://pinterest.com/pin1');
          link.setAttribute('rel', 'canonical');
          iframe.doc.head.appendChild(link);
          const {documentElement} = iframe.doc;
          Services.ampdoc(documentElement).setExtensionsKnown();
          const replacements = Services.urlReplacementsForDoc(documentElement);
          return replacements.expandUrlAsync(url);
        });
      }

      it('should replace ACCESS_READER_ID', () => {
        accessServiceMock
          .expects('getAccessReaderId')
          .returns(Promise.resolve('reader1'))
          .once();
        return expandUrlAsync('?a=ACCESS_READER_ID').then((res) => {
          expect(res).to.match(/a=reader1/);
          expect(userErrorStub).to.have.not.been.called;
        });
      });

      it('should replace AUTHDATA', () => {
        accessServiceMock
          .expects('getAuthdataField')
          .withExactArgs('field1')
          .returns(Promise.resolve('value1'))
          .once();
        return expandUrlAsync('?a=AUTHDATA(field1)').then((res) => {
          expect(res).to.match(/a=value1/);
          expect(userErrorStub).to.have.not.been.called;
        });
      });

      it('should report error if not available', () => {
        accessServiceMock.expects('getAccessReaderId').never();
        return expandUrlAsync('?a=ACCESS_READER_ID;', /* disabled */ true).then(
          (res) => {
            expect(res).to.match(/a=;/);
            expect(userErrorStub).to.be.calledOnce;
          }
        );
      });
    });

    describe('access values via amp-subscriptions', () => {
      let subscriptionsService;
      let subscriptionsServiceMock;

      beforeEach(() => {
        subscriptionsService = {
          getAccessReaderId: () => {},
          getAuthdataField: () => {},
        };
        subscriptionsServiceMock = env.sandbox.mock(subscriptionsService);
        env.sandbox
          .stub(Services, 'subscriptionsServiceForDocOrNull')
          .callsFake(() => {
            return Promise.resolve(subscriptionsService);
          });
      });

      afterEach(() => {
        subscriptionsServiceMock.verify();
      });

      function expandUrlAsync(url, opt_disabled) {
        if (opt_disabled) {
          subscriptionsService = null;
        }
        return createIframePromise().then((iframe) => {
          iframe.doc.title = 'Pixel Test';
          const link = iframe.doc.createElement('link');
          link.setAttribute('href', 'https://pinterest.com/pin1');
          link.setAttribute('rel', 'canonical');
          iframe.doc.head.appendChild(link);
          const {documentElement} = iframe.doc;
          Services.ampdoc(documentElement).setExtensionsKnown();
          const replacements = Services.urlReplacementsForDoc(documentElement);
          return replacements.expandUrlAsync(url);
        });
      }

      it('should replace ACCESS_READER_ID', () => {
        subscriptionsServiceMock
          .expects('getAccessReaderId')
          .returns(Promise.resolve('reader1'))
          .once();
        return expandUrlAsync('?a=ACCESS_READER_ID').then((res) => {
          expect(res).to.match(/a=reader1/);
          expect(userErrorStub).to.have.not.been.called;
        });
      });

      it('should replace AUTHDATA', () => {
        subscriptionsServiceMock
          .expects('getAuthdataField')
          .withExactArgs('field1')
          .returns(Promise.resolve('value1'))
          .once();
        return expandUrlAsync('?a=AUTHDATA(field1)').then((res) => {
          expect(res).to.match(/a=value1/);
          expect(userErrorStub).to.have.not.been.called;
        });
      });

      it('should report error if not available', () => {
        subscriptionsServiceMock.expects('getAccessReaderId').never();
        return expandUrlAsync('?a=ACCESS_READER_ID;', /* disabled */ true).then(
          (res) => {
            expect(res).to.match(/a=;/);
            expect(userErrorStub).to.be.calledOnce;
          }
        );
      });

      it('should prefer amp-subscriptions if amp-access also available', () => {
        const accessService = {
          getAccessReaderId: () => {},
          getAuthdataField: () => {},
        };
        const accessServiceMock = env.sandbox.mock(accessService);
        env.sandbox
          .stub(Services, 'accessServiceForDocOrNull')
          .callsFake(() => {
            return Promise.resolve(accessService);
          });
        accessServiceMock.expects('getAuthdataField').never();

        subscriptionsServiceMock
          .expects('getAuthdataField')
          .withExactArgs('field1')
          .returns(Promise.resolve('value1'))
          .once();
        return expandUrlAsync('?a=AUTHDATA(field1)').then((res) => {
          expect(res).to.match(/a=value1/);
          expect(userErrorStub).to.have.not.been.called;
          accessServiceMock.verify();
        });
      });
    });

    describe('link expansion', () => {
      let urlReplacements;
      let a;
      let win;

      beforeEach(() => {
        a = document.createElement('a');
        win = getFakeWindow();
        win.location = parseUrlDeprecated(
          'https://example.com/base?foo=bar&bar=abc&gclid=123'
        );
        const {documentElement} = win.document;
        urlReplacements = Services.urlReplacementsForDoc(documentElement);
      });

      it('should replace href', () => {
        a.href = 'https://example.com/link?out=QUERY_PARAM(foo)';
        a.setAttribute('data-amp-replace', 'QUERY_PARAM');
        urlReplacements.maybeExpandLink(a, null);
        expect(a.href).to.equal('https://example.com/link?out=bar');
      });

      it('should append default outgoing decoration', () => {
        a.href = 'https://example.com/link?out=QUERY_PARAM(foo)';
        a.setAttribute('data-amp-replace', 'QUERY_PARAM');
        urlReplacements.maybeExpandLink(a, 'gclid=QUERY_PARAM(gclid)');
        expect(a.href).to.equal('https://example.com/link?out=bar&gclid=123');
      });

      it('should replace href 2x', () => {
        a.href = 'https://example.com/link?out=QUERY_PARAM(foo)';
        a.setAttribute('data-amp-replace', 'QUERY_PARAM');
        urlReplacements.maybeExpandLink(a, null);
        expect(a.href).to.equal('https://example.com/link?out=bar');
        urlReplacements.maybeExpandLink(a, null);
        expect(a.href).to.equal('https://example.com/link?out=bar');
      });

      it('should replace href 2', () => {
        a.href =
          'https://example.com/link?out=QUERY_PARAM(foo)&' +
          'out2=QUERY_PARAM(bar)';
        a.setAttribute('data-amp-replace', 'QUERY_PARAM');
        urlReplacements.maybeExpandLink(a, null);
        expect(a.href).to.equal('https://example.com/link?out=bar&out2=abc');
      });

      it('has nothing to replace', () => {
        a.href = 'https://example.com/link';
        a.setAttribute('data-amp-replace', 'QUERY_PARAM');
        urlReplacements.maybeExpandLink(a, null);
        expect(a.href).to.equal('https://example.com/link');
      });

      it('should not replace without user allowance', () => {
        a.href = 'https://example.com/link?out=QUERY_PARAM(foo)';
        urlReplacements.maybeExpandLink(a, null);
        expect(a.href).to.equal(
          'https://example.com/link?out=QUERY_PARAM(foo)'
        );
      });

      it('should not replace without user allowance 2', () => {
        a.href = 'https://example.com/link?out=QUERY_PARAM(foo)';
        a.setAttribute('data-amp-replace', 'ABC');
        urlReplacements.maybeExpandLink(a, null);
        expect(a.href).to.equal(
          'https://example.com/link?out=QUERY_PARAM(foo)'
        );
      });

      it('should replace default append params regardless of allowlist', () => {
        a.href = 'https://example.com/link?out=QUERY_PARAM(foo)';
        urlReplacements.maybeExpandLink(a, 'gclid=QUERY_PARAM(gclid)');
        expect(a.href).to.equal(
          'https://example.com/link?out=QUERY_PARAM(foo)&gclid=123'
        );
      });

      it('should not replace unallowlisted fields', () => {
        a.href = 'https://example.com/link?out=RANDOM';
        a.setAttribute('data-amp-replace', 'RANDOM');
        urlReplacements.maybeExpandLink(a, null);
        expect(a.href).to.equal('https://example.com/link?out=RANDOM');
      });

      it('should replace for http (non-secure) allowlisted origin', () => {
        canonical = 'http://example.com/link';
        a.href = 'http://example.com/link?out=QUERY_PARAM(foo)';
        a.setAttribute('data-amp-replace', 'QUERY_PARAM');
        urlReplacements.maybeExpandLink(a, null);
        expect(a.href).to.equal('http://example.com/link?out=bar');
      });

      it('should replace with canonical origin', () => {
        a.href = 'https://canonical.com/link?out=QUERY_PARAM(foo)';
        a.setAttribute('data-amp-replace', 'QUERY_PARAM');
        urlReplacements.maybeExpandLink(a, null);
        expect(a.href).to.equal('https://canonical.com/link?out=bar');
      });

      it('should replace with allowlisted origin', () => {
        a.href = 'https://allowlisted.com/link?out=QUERY_PARAM(foo)';
        a.setAttribute('data-amp-replace', 'QUERY_PARAM');
        urlReplacements.maybeExpandLink(a, null);
        expect(a.href).to.equal('https://allowlisted.com/link?out=bar');
      });

      it('should not replace to different origin', () => {
        a.href = 'https://example2.com/link?out=QUERY_PARAM(foo)';
        a.setAttribute('data-amp-replace', 'QUERY_PARAM');
        urlReplacements.maybeExpandLink(a, null);
        expect(a.href).to.equal(
          'https://example2.com/link?out=QUERY_PARAM(foo)'
        );
      });

      it('should not append default param to different origin', () => {
        a.href = 'https://example2.com/link?out=QUERY_PARAM(foo)';
        a.setAttribute('data-amp-replace', 'QUERY_PARAM');
        urlReplacements.maybeExpandLink(a, 'gclid=QUERY_PARAM(gclid)');
        expect(a.href).to.equal(
          'https://example2.com/link?out=QUERY_PARAM(foo)'
        );
      });

      it('should replace allowlisted fields', () => {
        a.href =
          'https://canonical.com/link?' +
          'out=QUERY_PARAM(foo)' +
          '&c=PAGE_VIEW_IDCLIENT_ID(abc)NAV_TIMING(navigationStart)';
        a.setAttribute(
          'data-amp-replace',
          'QUERY_PARAM CLIENT_ID PAGE_VIEW_ID NAV_TIMING'
        );
        // No replacement without previous async replacement
        urlReplacements.maybeExpandLink(a, null);
        expect(a.href).to.equal('https://canonical.com/link?out=bar&c=1234100');
        // Get a cid, then proceed.
        return urlReplacements.expandUrlAsync('CLIENT_ID(abc)').then(() => {
          urlReplacements.maybeExpandLink(a, null);
          expect(a.href).to.equal(
            'https://canonical.com/link?out=bar&c=1234test-cid(abc)100'
          );
        });
      });

      it('should add URL parameters for different origin', () => {
        a.href = 'https://example2.com/link';
        a.setAttribute('data-amp-addparams', 'guid=123');
        urlReplacements.maybeExpandLink(a, null);
        expect(a.href).to.equal('https://example2.com/link?guid=123');
      });

      it("should add URL parameters for http URL's(non-secure)", () => {
        a.href = 'http://allowlisted.com/link?out=QUERY_PARAM(foo)';
        a.setAttribute('data-amp-addparams', 'guid=123');
        urlReplacements.maybeExpandLink(a, null);
        expect(a.href).to.equal(
          'http://allowlisted.com/link?out=QUERY_PARAM(foo)&guid=123'
        );
      });

      it('should concatenate and expand additional params w/ allowlist', () => {
        a.href = 'http://example.com/link?first=QUERY_PARAM(src,YYYY)';
        a.setAttribute('data-amp-replace', 'QUERY_PARAM');
        a.setAttribute(
          'data-amp-addparams',
          'second=QUERY_PARAM(baz,XXXX)&third=CLIENT_ID(AMP_ECID_GOOGLE,,_ga)&' +
            'fourth=link123'
        );
        urlReplacements.maybeExpandLink(a, null);
        expect(a.href).to.equal(
          'http://example.com/link?first=YYYY&second=XXXX&' +
            'third=CLIENT_ID(AMP_ECID_GOOGLE%2C%2C_ga)&fourth=link123'
        );
      });

      it(
        'should add URL parameters and repalce allowlisted' +
          " values for http allowlisted URL's(non-secure)",
        () => {
          a.href = 'http://example.com/link?out=QUERY_PARAM(foo)';
          a.setAttribute('data-amp-replace', 'CLIENT_ID');
          a.setAttribute('data-amp-addparams', 'guid=123&c=CLIENT_ID(abc)');
          // Get a cid, then proceed.
          return urlReplacements.expandUrlAsync('CLIENT_ID(abc)').then(() => {
            urlReplacements.maybeExpandLink(a, null);
            expect(a.href).to.equal(
              'http://example.com/link?out=QUERY_PARAM(foo)&guid=123&c=test-cid(abc)'
            );
          });
        }
      );

      it(
        'should add URL parameters and not repalce allowlisted' +
          " values for non allowlisted http URL's(non-secure)",
        () => {
          a.href = 'http://example2.com/link?out=QUERY_PARAM(foo)';
          a.setAttribute('data-amp-replace', 'CLIENT_ID');
          a.setAttribute('data-amp-addparams', 'guid=123&c=CLIENT_ID(abc)');
          // Get a cid, then proceed.
          return urlReplacements.expandUrlAsync('CLIENT_ID(abc)').then(() => {
            urlReplacements.maybeExpandLink(a, null);
            expect(a.href).to.equal(
              'http://example2.com/link?out=QUERY_PARAM(foo)&guid=123&c=CLIENT_ID(abc)'
            );
          });
        }
      );

      it('should append query parameters and repalce allowlisted values', () => {
        a.href = 'https://allowlisted.com/link?out=QUERY_PARAM(foo)';
        a.setAttribute('data-amp-replace', 'QUERY_PARAM CLIENT_ID');
        a.setAttribute('data-amp-addparams', 'guid=123&c=CLIENT_ID(abc)');
        // Get a cid, then proceed.
        return urlReplacements.expandUrlAsync('CLIENT_ID(abc)').then(() => {
          urlReplacements.maybeExpandLink(a, null);
          expect(a.href).to.equal(
            'https://allowlisted.com/link?out=bar&guid=123&c=test-cid(abc)'
          );
        });
      });
    });

    describe('Expanding String', () => {
      it('should not reject protocol changes with expandStringSync', () => {
        const win = getFakeWindow();
        const {documentElement} = win.document;
        const urlReplacements = Services.urlReplacementsForDoc(documentElement);
        let expanded = urlReplacements.expandStringSync(
          'PROTOCOL://example.com/?r=RANDOM',
          {
            'PROTOCOL': 'abc',
          }
        );
        expect(expanded).to.match(/abc:\/\/example\.com\/\?r=(\d+(\.\d+)?)$/);
        expanded = urlReplacements.expandStringSync(
          'FUNCT://example.com/?r=RANDOM',
          {
            'FUNCT': function () {
              return 'abc';
            },
          }
        );
        expect(expanded).to.match(/abc:\/\/example\.com\/\?r=(\d+(\.\d+)?)$/);
      });

      it('should not encode values returned by expandStringSync', () => {
        const win = getFakeWindow();
        const {documentElement} = win.document;
        const urlReplacements = Services.urlReplacementsForDoc(documentElement);
        const expanded = urlReplacements.expandStringSync('title=TITLE', {
          'TITLE': 'test with spaces',
        });
        expect(expanded).to.equal('title=test with spaces');
      });

      it('should not check protocol changes with expandStringAsync', () => {
        const win = getFakeWindow();
        const {documentElement} = win.document;
        const urlReplacements = Services.urlReplacementsForDoc(documentElement);
        return urlReplacements
          .expandStringAsync('RANDOM:X:Y', {
            'RANDOM': Promise.resolve('abc'),
          })
          .then((expanded) => {
            expect(expanded).to.equal('abc:X:Y');
          });
      });

      it('should not encode values returned by expandStringAsync', () => {
        const win = getFakeWindow();
        const {documentElement} = win.document;
        const urlReplacements = Services.urlReplacementsForDoc(documentElement);
        return urlReplacements
          .expandStringAsync('title=TITLE', {
            'TITLE': Promise.resolve('test with spaces'),
          })
          .then((expanded) => {
            expect(expanded).to.equal('title=test with spaces');
          });
      });
    });

    describe('Expanding Input Value', () => {
      it('should fail for non-inputs', () => {
        const win = getFakeWindow();
        const {documentElement} = win.document;
        const urlReplacements = Services.urlReplacementsForDoc(documentElement);
        const input = document.createElement('textarea');
        input.value = 'RANDOM';
        input.setAttribute('data-amp-replace', 'RANDOM');
        allowConsoleError(() => {
          expect(() => urlReplacements.expandInputValueSync(input)).to.throw(
            /Input value expansion only works on hidden input fields/
          );
        });
        expect(input.value).to.equal('RANDOM');
      });

      it('should fail for non-hidden inputs', () => {
        const win = getFakeWindow();
        const {documentElement} = win.document;
        const urlReplacements = Services.urlReplacementsForDoc(documentElement);
        const input = document.createElement('input');
        input.value = 'RANDOM';
        input.setAttribute('data-amp-replace', 'RANDOM');
        allowConsoleError(() => {
          expect(() => urlReplacements.expandInputValueSync(input)).to.throw(
            /Input value expansion only works on hidden input fields/
          );
        });
        expect(input.value).to.equal('RANDOM');
      });

      it('should not replace not allowlisted vars', () => {
        const win = getFakeWindow();
        const {documentElement} = win.document;
        const urlReplacements = Services.urlReplacementsForDoc(documentElement);
        const input = document.createElement('input');
        input.value = 'RANDOM';
        input.type = 'hidden';
        input.setAttribute('data-amp-replace', 'CANONICAL_URL');
        let expandedValue = urlReplacements.expandInputValueSync(input);
        expect(expandedValue).to.equal('RANDOM');
        input.setAttribute('data-amp-replace', 'CANONICAL_URL RANDOM');
        expandedValue = urlReplacements.expandInputValueSync(input);
        expect(expandedValue).to.match(/(\d+(\.\d+)?)/);
        expect(input.value).to.match(/(\d+(\.\d+)?)/);
        expect(input['amp-original-value']).to.equal('RANDOM');
      });

      it('should replace input value with var subs - sync', () => {
        const win = getFakeWindow();
        const {documentElement} = win.document;
        const urlReplacements = Services.urlReplacementsForDoc(documentElement);
        const input = document.createElement('input');
        input.value = 'RANDOM';
        input.type = 'hidden';
        input.setAttribute('data-amp-replace', 'RANDOM');
        let expandedValue = urlReplacements.expandInputValueSync(input);
        expect(expandedValue).to.match(/(\d+(\.\d+)?)/);

        input['amp-original-value'] = 'RANDOM://example.com/RANDOM';
        expandedValue = urlReplacements.expandInputValueSync(input);
        expect(expandedValue).to.match(
          /(\d+(\.\d+)?):\/\/example\.com\/(\d+(\.\d+)?)$/
        );
        expect(input.value).to.match(
          /(\d+(\.\d+)?):\/\/example\.com\/(\d+(\.\d+)?)$/
        );
        expect(input['amp-original-value']).to.equal(
          'RANDOM://example.com/RANDOM'
        );
      });

      it('should replace input value with var subs - sync', () => {
        const win = getFakeWindow();
        const {documentElement} = win.document;
        const urlReplacements = Services.urlReplacementsForDoc(documentElement);
        const input = document.createElement('input');
        input.value = 'RANDOM';
        input.type = 'hidden';
        input.setAttribute('data-amp-replace', 'RANDOM');
        return urlReplacements
          .expandInputValueAsync(input)
          .then((expandedValue) => {
            expect(input['amp-original-value']).to.equal('RANDOM');
            expect(input.value).to.match(/(\d+(\.\d+)?)/);
            expect(expandedValue).to.match(/(\d+(\.\d+)?)/);
          });
      });
    });

    describe('extractClientIdFromGaCookie', () => {
      it('should extract correct Client ID', () => {
        expect(
          extractClientIdFromGaCookie('GA1.2.430749005.1489527047')
        ).to.equal('430749005.1489527047');
        expect(
          extractClientIdFromGaCookie('GA1.12.430749005.1489527047')
        ).to.equal('430749005.1489527047');
        expect(
          extractClientIdFromGaCookie('GA1.1-2.430749005.1489527047')
        ).to.equal('430749005.1489527047');
        expect(
          extractClientIdFromGaCookie('1.1.430749005.1489527047')
        ).to.equal('430749005.1489527047');
        expect(
          extractClientIdFromGaCookie(
            'GA1.3.amp-JTHCVn-4iMhzv5oEIZIspaXUSnEF0PwNVoxs' +
              'NDrFP4BtPQJMyxE4jb9FDlp37OJL'
          )
        ).to.equal(
          'amp-JTHCVn-4iMhzv5oEIZIspaXUSnEF0PwNVoxs' +
            'NDrFP4BtPQJMyxE4jb9FDlp37OJL'
        );
        expect(
          extractClientIdFromGaCookie(
            '1.3.amp-JTHCVn-4iMhzv5oEIZIspaXUSnEF0PwNVoxs' +
              'NDrFP4BtPQJMyxE4jb9FDlp37OJL'
          )
        ).to.equal(
          'amp-JTHCVn-4iMhzv5oEIZIspaXUSnEF0PwNVoxs' +
            'NDrFP4BtPQJMyxE4jb9FDlp37OJL'
        );
        expect(
          extractClientIdFromGaCookie(
            'amp-JTHCVn-4iMhzv5oEIZIspaXUSnEF0PwNVoxs' +
              'NDrFP4BtPQJMyxE4jb9FDlp37OJL'
          )
        ).to.equal(
          'amp-JTHCVn-4iMhzv5oEIZIspaXUSnEF0PwNVoxs' +
            'NDrFP4BtPQJMyxE4jb9FDlp37OJL'
        );
      });
    });
  });
});
