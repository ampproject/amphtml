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

import * as trackPromise from '../../src/impression';
import {Observable} from '../../src/observable';
import {Services} from '../../src/services';
import {cidServiceForDocForTesting} from '../../src/service/cid-impl';
import {createIframePromise} from '../../testing/iframe';
import {
  extractClientIdFromGaCookie,
  installUrlReplacementsServiceForDoc,
} from '../../src/service/url-replacements-impl';
import {getMode} from '../../src/mode';
import {installActivityServiceForTesting} from '../../extensions/amp-analytics/0.1/activity-impl';
import {installCryptoService} from '../../src/service/crypto-impl';
import {installDocService} from '../../src/service/ampdoc-impl';
import {installDocumentInfoServiceForDoc} from '../../src/service/document-info-impl';
import {
  markElementScheduledForTesting,
  resetScheduledElementForTesting,
} from '../../src/service/custom-element-registry';
import {
  mockWindowInterface,
  stubServiceForDoc,
} from '../../testing/test-helper';
import {parseUrlDeprecated} from '../../src/url';
import {registerServiceBuilder} from '../../src/service';
import {setCookie} from '../../src/cookies';
import {user} from '../../src/log';

describes.sandboxed('UrlReplacements', {}, () => {
  let canonical;
  let loadObservable;
  let replacements;
  let viewerService;
  let userErrorStub;
  let ampdoc;

  beforeEach(() => {
    canonical = 'https://canonical.com/doc1';
    userErrorStub = sandbox.stub(user(), 'error');
  });

  function getReplacements(opt_options) {
    return createIframePromise().then(iframe => {
      ampdoc = iframe.ampdoc;
      iframe.doc.title = 'Pixel Test';
      const link = iframe.doc.createElement('link');
      link.setAttribute('href', 'https://pinterest.com:8080/pin1');
      link.setAttribute('rel', 'canonical');
      iframe.doc.head.appendChild(link);
      installDocumentInfoServiceForDoc(iframe.ampdoc);
      resetScheduledElementForTesting(iframe.win, 'amp-analytics');
      resetScheduledElementForTesting(iframe.win, 'amp-experiment');
      resetScheduledElementForTesting(iframe.win, 'amp-share-tracking');
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
          registerServiceBuilder(iframe.win, 'variant', function() {
            return {
              getVariants: () =>
                Promise.resolve({
                  'x1': 'v1',
                  'x2': null,
                }),
            };
          });
        }
        if (opt_options.withShareTracking) {
          markElementScheduledForTesting(iframe.win, 'amp-share-tracking');
          registerServiceBuilder(iframe.win, 'share-tracking', function() {
            return Promise.resolve({
              incomingFragment: '12345',
              outgoingFragment: '54321',
            });
          });
        }
        if (opt_options.withStoryVariableService) {
          markElementScheduledForTesting(iframe.win, 'amp-story');
          registerServiceBuilder(iframe.win, 'story-variable', function() {
            return Promise.resolve({
              pageIndex: 546,
              pageId: 'id-123',
            });
          });
        }
        if (opt_options.withViewerIntegrationVariableService) {
          markElementScheduledForTesting(iframe.win, 'amp-viewer-integration');
          registerServiceBuilder(
            iframe.win,
            'viewer-integration-variable',
            function() {
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
      replacements = Services.urlReplacementsForDoc(iframe.doc.documentElement);
      return replacements;
    });
  }

  function expandUrlAsync(url, opt_bindings, opt_options) {
    return getReplacements(opt_options).then(replacements =>
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
        querySelector: selector => {
          if (selector.startsWith('meta')) {
            return {
              getAttribute: () => {
                return 'https://whitelisted.com https://greylisted.com http://example.com';
              },
              hasAttribute: () => {
                return true;
              },
            };
          } else {
            return {href: canonical};
          }
        },
        getElementById: () => {},
        cookie: '',
        documentElement: {
          nodeType: /* element */ 1,
        },
      },
      Math: {
        random: () => 0.1234,
      },
      services: {
        'viewport': {obj: {}},
        'cid': {
          promise: Promise.resolve({
            get: config => Promise.resolve('test-cid(' + config.scope + ')'),
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
    };
    installDocService(win, /* isSingleDoc */ true);
    const ampdoc = Services.ampdocServiceFor(win).getAmpDoc();
    installDocumentInfoServiceForDoc(ampdoc);
    win.ampdoc = ampdoc;
    installUrlReplacementsServiceForDoc(ampdoc);
    return win;
  }

  it('limit replacement params size', () => {
    return getReplacements().then(replacements => {
      replacements.getVariableSource().initialize();
      const variables = Object.keys(
        replacements.getVariableSource().replacements_
      );
      // Restrict the number of replacement params to globalVaraibleSource
      // Please consider adding the logic to amp-analytics instead.
      // Please contact @lannka or @zhouyx if the test fail.
      expect(variables.length).to.equal(71);
    });
  });

  it('should replace RANDOM', () => {
    return expandUrlAsync('ord=RANDOM?').then(res => {
      expect(res).to.match(/ord=(\d+(\.\d+)?)\?$/);
    });
  });

  it('should replace COUNTER', () => {
    return expandUrlAsync(
      'COUNTER(foo),COUNTER(bar),COUNTER(foo),COUNTER(bar),COUNTER(bar)'
    ).then(res => {
      expect(res).to.equal('1,1,2,2,3');
    });
  });

  it('should replace CANONICAL_URL', () => {
    return expandUrlAsync('?href=CANONICAL_URL').then(res => {
      expect(res).to.equal('?href=https%3A%2F%2Fpinterest.com%3A8080%2Fpin1');
    });
  });

  it('should replace CANONICAL_HOST', () => {
    return expandUrlAsync('?host=CANONICAL_HOST').then(res => {
      expect(res).to.equal('?host=pinterest.com%3A8080');
    });
  });

  it('should replace CANONICAL_HOSTNAME', () => {
    return expandUrlAsync('?host=CANONICAL_HOSTNAME').then(res => {
      expect(res).to.equal('?host=pinterest.com');
    });
  });

  it('should replace CANONICAL_PATH', () => {
    return expandUrlAsync('?path=CANONICAL_PATH').then(res => {
      expect(res).to.equal('?path=%2Fpin1');
    });
  });

  it('should replace DOCUMENT_REFERRER', () => {
    return expandUrlAsync('?ref=DOCUMENT_REFERRER').then(res => {
      expect(res).to.equal('?ref=http%3A%2F%2Flocalhost%3A9876%2Fcontext.html');
    });
  });

  it('should replace EXTERNAL_REFERRER', () => {
    const windowInterface = mockWindowInterface(sandbox);
    windowInterface.getHostname.returns('different.org');
    return getReplacements()
      .then(replacements => {
        stubServiceForDoc(sandbox, ampdoc, 'viewer', 'getReferrerUrl').returns(
          Promise.resolve('http://example.org/page.html')
        );
        return replacements.expandUrlAsync('?ref=EXTERNAL_REFERRER');
      })
      .then(res => {
        expect(res).to.equal('?ref=http%3A%2F%2Fexample.org%2Fpage.html');
      });
  });

  it(
    'should replace EXTERNAL_REFERRER to empty string ' +
      'if referrer is of same domain',
    () => {
      const windowInterface = mockWindowInterface(sandbox);
      windowInterface.getHostname.returns('example.org');
      return getReplacements()
        .then(replacements => {
          stubServiceForDoc(
            sandbox,
            ampdoc,
            'viewer',
            'getReferrerUrl'
          ).returns(Promise.resolve('http://example.org/page.html'));
          return replacements.expandUrlAsync('?ref=EXTERNAL_REFERRER');
        })
        .then(res => {
          expect(res).to.equal('?ref=');
        });
    }
  );

  it(
    'should replace EXTERNAL_REFERRER to empty string ' +
      'if referrer is CDN proxy of same domain',
    () => {
      const windowInterface = mockWindowInterface(sandbox);
      windowInterface.getHostname.returns('example.org');
      return getReplacements()
        .then(replacements => {
          stubServiceForDoc(
            sandbox,
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
        .then(res => {
          expect(res).to.equal('?ref=');
        });
    }
  );

  it(
    'should replace EXTERNAL_REFERRER to empty string ' +
      'if referrer is CDN proxy of same domain (before CURLS)',
    () => {
      const windowInterface = mockWindowInterface(sandbox);
      windowInterface.getHostname.returns('example.org');
      return getReplacements()
        .then(replacements => {
          stubServiceForDoc(
            sandbox,
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
        .then(res => {
          expect(res).to.equal('?ref=');
        });
    }
  );

  it('should replace TITLE', () => {
    return expandUrlAsync('?title=TITLE').then(res => {
      expect(res).to.equal('?title=Pixel%20Test');
    });
  });

  it('should prefer original title for TITLE', () => {
    return expandUrlAsync('?title=TITLE', /*opt_bindings*/ undefined, {
      withOriginalTitle: true,
    }).then(res => {
      expect(res).to.equal('?title=Original%20Pixel%20Test');
    });
  });

  describe('AMPDOC_URL', () => {
    it('should replace AMPDOC_URL', () => {
      return expandUrlAsync('?ref=AMPDOC_URL').then(res => {
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
        .then(res => {
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
        .then(res => {
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
        .then(res => {
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
        .then(res => {
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
        .then(res => {
          expect(res).to.contain(
            encodeURIComponent(
              'https://cdn.ampproject.org/a/o.com/foo/?test=case&a&hello=you&goodnight=moon'
            )
          );
        });
    });
  });

  it('should replace AMPDOC_HOST', () => {
    return expandUrlAsync('?ref=AMPDOC_HOST').then(res => {
      expect(res).to.not.match(/AMPDOC_HOST/);
    });
  });

  it('should replace AMPDOC_HOSTNAME', () => {
    return expandUrlAsync('?ref=AMPDOC_HOSTNAME').then(res => {
      expect(res).to.not.match(/AMPDOC_HOSTNAME/);
    });
  });

  describe('SOURCE_URL', () => {
    it('should replace SOURCE_URL and SOURCE_HOST', () => {
      const win = getFakeWindow();
      win.location = parseUrlDeprecated('https://wrong.com');
      sandbox.stub(trackPromise, 'getTrackImpressionPromise').callsFake(() => {
        return new Promise(resolve => {
          win.location = parseUrlDeprecated('https://example.com/test');
          resolve();
        });
      });
      return Services.urlReplacementsForDoc(win.document.documentElement)
        .expandUrlAsync('?url=SOURCE_URL&host=SOURCE_HOST')
        .then(res => {
          expect(res).to.equal(
            '?url=https%3A%2F%2Fexample.com%2Ftest&host=example.com'
          );
        });
    });

    it('should replace SOURCE_URL and SOURCE_HOSTNAME', () => {
      const win = getFakeWindow();
      win.location = parseUrlDeprecated('https://wrong.com');
      sandbox.stub(trackPromise, 'getTrackImpressionPromise').callsFake(() => {
        return new Promise(resolve => {
          win.location = parseUrlDeprecated('https://example.com/test');
          resolve();
        });
      });
      return Services.urlReplacementsForDoc(win.document.documentElement)
        .expandUrlAsync('?url=SOURCE_URL&hostname=SOURCE_HOSTNAME')
        .then(res => {
          expect(res).to.equal(
            '?url=https%3A%2F%2Fexample.com%2Ftest&hostname=example.com'
          );
        });
    });

    it('should update SOURCE_URL after track impression', () => {
      const win = getFakeWindow();
      win.location = parseUrlDeprecated('https://wrong.com');
      sandbox.stub(trackPromise, 'getTrackImpressionPromise').callsFake(() => {
        return new Promise(resolve => {
          win.location = parseUrlDeprecated('https://example.com?gclid=123456');
          resolve();
        });
      });
      return Services.urlReplacementsForDoc(win.document.documentElement)
        .expandUrlAsync('?url=SOURCE_URL')
        .then(res => {
          expect(res).to.contain('example.com');
        });
    });

    it('should add extra params to SOURCE_URL', () => {
      const win = getFakeWindow();
      win.location = parseUrlDeprecated(
        'https://cdn.ampproject.org/a/o.com/foo/?a&amp_r=hello%3Dworld'
      );
      sandbox.stub(trackPromise, 'getTrackImpressionPromise').callsFake(() => {
        return Promise.resolve();
      });
      return Services.urlReplacementsForDoc(win.document.documentElement)
        .expandUrlAsync('?url=SOURCE_URL')
        .then(res => {
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
      sandbox.stub(trackPromise, 'getTrackImpressionPromise').callsFake(() => {
        return Promise.resolve();
      });
      return Services.urlReplacementsForDoc(win.document.documentElement)
        .expandUrlAsync('?url=SOURCE_URL')
        .then(res => {
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
      sandbox.stub(trackPromise, 'getTrackImpressionPromise').callsFake(() => {
        return Promise.resolve();
      });
      return Services.urlReplacementsForDoc(win.document.documentElement)
        .expandUrlAsync('?url=SOURCE_URL')
        .then(res => {
          expect(res).to.equal(
            '?url=' + encodeURIComponent('http://o.com/foo/?a')
          );
        });
    });
  });

  it('should replace SOURCE_PATH', () => {
    return expandUrlAsync('?path=SOURCE_PATH').then(res => {
      expect(res).to.not.match(/SOURCE_PATH/);
    });
  });

  it('should replace PAGE_VIEW_ID', () => {
    return expandUrlAsync('?pid=PAGE_VIEW_ID').then(res => {
      expect(res).to.match(/pid=\d+/);
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
    ).then(res => {
      expect(res).to.match(/^\?a=cid-for-abc\&b=amp-([a-zA-Z0-9_-]+){10,}/);
    });
  });

  it('should allow empty CLIENT_ID', () => {
    return getReplacements()
      .then(replacements => {
        stubServiceForDoc(sandbox, ampdoc, 'cid', 'get').returns(
          Promise.resolve()
        );
        return replacements.expandUrlAsync('?a=CLIENT_ID(_ga)');
      })
      .then(res => {
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
    ).then(res => {
      expect(res).to.match(/^\?a=cid-for-abc\&b=amp-([a-zA-Z0-9_-]+){10,}/);
    });
  });

  it('should replace CLIENT_ID with empty string for inabox', () => {
    setCookie(window, '_ga', 'GA1.2.12345.54321');
    const origMode = getMode().runtime;
    getMode().runtime = 'inabox';
    return expandUrlAsync(
      '?a=CLIENT_ID(url-abc)&b=CLIENT_ID(url-xyz)',
      /*opt_bindings*/ undefined,
      {withCid: true}
    ).then(res => {
      getMode().runtime = origMode;
      expect(res).to.equal('?a=&b=');
    });
  });

  it('should parse _ga cookie correctly', () => {
    setCookie(window, '_ga', 'GA1.2.12345.54321');
    return expandUrlAsync(
      '?a=CLIENT_ID(AMP_ECID_GOOGLE,,_ga)&b=CLIENT_ID(_ga)',
      /*opt_bindings*/ undefined,
      {withCid: true}
    ).then(res => {
      expect(res).to.match(/^\?a=12345.54321&b=12345.54321/);
    });
  });

  // TODO(alanorozco, #11827): Make this test work on Safari.
  it.configure()
    .skipSafari()
    .run('should replace CLIENT_ID synchronously when available', () => {
      return getReplacements({withCid: true}).then(urlReplacements => {
        setCookie(window, 'url-abc', 'cid-for-abc');
        setCookie(window, 'url-xyz', 'cid-for-xyz');
        // Only requests cid-for-xyz in async path
        return urlReplacements
          .expandUrlAsync('b=CLIENT_ID(url-xyz)')
          .then(res => {
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
    sandbox.stub(Services, 'bindForDocOrNull').returns(
      Promise.resolve({
        getStateValue(key) {
          expect(key).to.equal('foo.bar');
          return Promise.resolve('baz');
        },
      })
    );
    return Services.urlReplacementsForDoc(win.document.documentElement)
      .expandUrlAsync('?state=AMP_STATE(foo.bar)')
      .then(res => {
        expect(res).to.equal('?state=baz');
      });
  });

  // TODO(#16916): Make this test work with synchronous throws.
  it.skip('should replace VARIANT', () => {
    return expect(
      expandUrlAsync(
        '?x1=VARIANT(x1)&x2=VARIANT(x2)&x3=VARIANT(x3)',
        /*opt_bindings*/ undefined,
        {withVariant: true}
      )
    ).to.eventually.equal('?x1=v1&x2=none&x3=');
  });

  // TODO(#16916): Make this test work with synchronous throws.
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

  // TODO(#16916): Make this test work with synchronous throws.
  it.skip(
    'should replace VARIANTS with empty string if ' +
      'amp-experiment is not configured ',
    () => {
      return expect(expandUrlAsync('?VARIANTS')).to.eventually.equal('?');
    }
  );

  it('should replace SHARE_TRACKING_INCOMING and SHARE_TRACKING_OUTGOING', () => {
    return expect(
      expandUrlAsync(
        '?in=SHARE_TRACKING_INCOMING&out=SHARE_TRACKING_OUTGOING',
        /*opt_bindings*/ undefined,
        {withShareTracking: true}
      )
    ).to.eventually.equal('?in=12345&out=54321');
  });

  // TODO(#16916): Make this test work with synchronous throws.
  it.skip(
    'should replace SHARE_TRACKING_INCOMING and SHARE_TRACKING_OUTGOING' +
      ' with empty string if amp-share-tracking is not configured',
    () => {
      return expect(
        expandUrlAsync(
          '?in=SHARE_TRACKING_INCOMING&out=SHARE_TRACKING_OUTGOING'
        )
      ).to.eventually.equal('?in=&out=');
    }
  );

  it('should replace STORY_PAGE_INDEX and STORY_PAGE_ID', () => {
    return expect(
      expandUrlAsync(
        '?index=STORY_PAGE_INDEX&id=STORY_PAGE_ID',
        /*opt_bindings*/ undefined,
        {withStoryVariableService: true}
      )
    ).to.eventually.equal('?index=546&id=id-123');
  });

  // TODO(#16916): Make this test work with synchronous throws.
  it.skip(
    'should replace STORY_PAGE_INDEX and STORY_PAGE_ID' +
      ' with empty string if amp-story is not configured',
    () => {
      return expect(
        expandUrlAsync('?index=STORY_PAGE_INDEX&id=STORY_PAGE_ID')
      ).to.eventually.equal('?index=&id=');
    }
  );

  it('should replace TIMESTAMP', () => {
    return expandUrlAsync('?ts=TIMESTAMP').then(res => {
      expect(res).to.match(/ts=\d+/);
    });
  });

  it('should replace TIMESTAMP_ISO', () => {
    return expandUrlAsync('?tsf=TIMESTAMP_ISO').then(res => {
      expect(res).to.match(/tsf=\d+/);
    });
  });

  it('should return correct ISO timestamp', () => {
    const fakeTime = 1499979336612;
    sandbox.useFakeTimers(fakeTime);
    return expect(expandUrlAsync('?tsf=TIMESTAMP_ISO')).to.eventually.equal(
      '?tsf=2017-07-13T20%3A55%3A36.612Z'
    );
  });

  it('should replace TIMEZONE', () => {
    return expandUrlAsync('?tz=TIMEZONE').then(res => {
      expect(res).to.match(/tz=-?\d+/);
    });
  });

  it('should replace TIMEZONE_CODE', () => {
    return expandUrlAsync('?tz_code=TIMEZONE_CODE').then(res => {
      expect(res).to.match(/tz_code=\w+|^$/);
    });
  });

  it('should replace SCROLL_TOP', () => {
    return expandUrlAsync('?scrollTop=SCROLL_TOP').then(res => {
      expect(res).to.match(/scrollTop=\d+/);
    });
  });

  it('should replace SCROLL_LEFT', () => {
    return expandUrlAsync('?scrollLeft=SCROLL_LEFT').then(res => {
      expect(res).to.match(/scrollLeft=\d+/);
    });
  });

  it('should replace SCROLL_HEIGHT', () => {
    return expandUrlAsync('?scrollHeight=SCROLL_HEIGHT').then(res => {
      expect(res).to.match(/scrollHeight=\d+/);
    });
  });

  it('should replace SCREEN_WIDTH', () => {
    return expandUrlAsync('?sw=SCREEN_WIDTH').then(res => {
      expect(res).to.match(/sw=\d+/);
    });
  });

  it('should replace SCREEN_HEIGHT', () => {
    return expandUrlAsync('?sh=SCREEN_HEIGHT').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace VIEWPORT_WIDTH', () => {
    return expandUrlAsync('?vw=VIEWPORT_WIDTH').then(res => {
      expect(res).to.match(/vw=\d+/);
    });
  });

  it('should replace VIEWPORT_HEIGHT', () => {
    return expandUrlAsync('?vh=VIEWPORT_HEIGHT').then(res => {
      expect(res).to.match(/vh=\d+/);
    });
  });

  it('should replace PAGE_LOAD_TIME', () => {
    return expandUrlAsync('?sh=PAGE_LOAD_TIME').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace FIRST_CONTENTFUL_PAINT', () => {
    const win = getFakeWindow();
    sandbox.stub(Services, 'performanceFor').returns({
      getFirstContentfulPaint() {
        return 1;
      },
    });
    return Services.urlReplacementsForDoc(win.document.documentElement)
      .expandUrlAsync('FIRST_CONTENTFUL_PAINT')
      .then(res => {
        expect(res).to.match(/^\d+$/);
      });
  });

  it('should replace FIRST_VIEWPORT_READY', () => {
    const win = getFakeWindow();
    sandbox.stub(Services, 'performanceFor').returns({
      getFirstViewportReady() {
        return 1;
      },
    });
    return Services.urlReplacementsForDoc(win.document.documentElement)
      .expandUrlAsync('FIRST_VIEWPORT_READY')
      .then(res => {
        expect(res).to.match(/^\d+$/);
      });
  });

  it('should replace MAKE_BODY_VISIBLE', () => {
    const win = getFakeWindow();
    sandbox.stub(Services, 'performanceFor').returns({
      getMakeBodyVisible() {
        return 1;
      },
    });
    return Services.urlReplacementsForDoc(win.document.documentElement)
      .expandUrlAsync('MAKE_BODY_VISIBLE')
      .then(res => {
        expect(res).to.match(/^\d+$/);
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
      .then(expanded => {
        expect(expanded).to.equal('PROTOCOL://example.com/?r=RANDOM');
      });
  });

  it('Should replace BACKGROUND_STATE with 0', () => {
    const win = getFakeWindow();
    win.services.viewer = {
      obj: {isVisible: () => true},
    };
    return Services.urlReplacementsForDoc(win.document.documentElement)
      .expandUrlAsync('?sh=BACKGROUND_STATE')
      .then(res => {
        expect(res).to.equal('?sh=0');
      });
  });

  it('Should replace BACKGROUND_STATE with 1', () => {
    const win = getFakeWindow();
    win.services.viewer = {
      obj: {isVisible: () => false},
    };
    return Services.urlReplacementsForDoc(win.document.documentElement)
      .expandUrlAsync('?sh=BACKGROUND_STATE')
      .then(res => {
        expect(res).to.equal('?sh=1');
      });
  });

  it('Should replace VIDEO_STATE(video,parameter) with video data', () => {
    const win = getFakeWindow();
    sandbox.stub(Services, 'videoManagerForDoc').returns({
      getAnalyticsDetails() {
        return Promise.resolve({currentTime: 1.5});
      },
    });
    sandbox
      .stub(win.document, 'getElementById')
      .withArgs('video')
      .returns(document.createElement('video'));

    return Services.urlReplacementsForDoc(win.document.documentElement)
      .expandUrlAsync('?sh=VIDEO_STATE(video,currentTime)')
      .then(res => {
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
      win.document.addEventListener = function(eventType, handler) {
        eventListeners[eventType] = handler;
      };
      win.document.removeEventListener = function(eventType, handler) {
        if (eventListeners[eventType] == handler) {
          delete eventListeners[eventType];
        }
      };
    });

    it('is replaced if timing info is not available', () => {
      win.document.readyState = 'complete';
      return Services.urlReplacementsForDoc(win.document.documentElement)
        .expandUrlAsync('?sh=PAGE_LOAD_TIME&s')
        .then(res => {
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
      return validMetric.then(res => {
        expect(res).to.match(/sh=9&s/);
      });
    });
  });

  it('should replace NAV_REDIRECT_COUNT', () => {
    return expandUrlAsync('?sh=NAV_REDIRECT_COUNT').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  // TODO(cvializ, #12336): unskip
  it.skip('should replace NAV_TIMING', () => {
    return expandUrlAsync(
      '?a=NAV_TIMING(navigationStart)' +
        '&b=NAV_TIMING(navigationStart,responseStart)'
    ).then(res => {
      expect(res).to.match(/a=\d+&b=\d+/);
    });
  });

  it('should replace NAV_TIMING when attribute names are invalid', () => {
    return expandUrlAsync(
      '?a=NAV_TIMING(invalid)' +
        '&b=NAV_TIMING(invalid,invalid)' +
        '&c=NAV_TIMING(navigationStart,invalid)' +
        '&d=NAV_TIMING(invalid,responseStart)'
    ).then(res => {
      expect(res).to.match(/a=&b=&c=&d=/);
    });
  });

  it('should replace NAV_TYPE', () => {
    return expandUrlAsync('?sh=NAV_TYPE').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace DOMAIN_LOOKUP_TIME', () => {
    return expandUrlAsync('?sh=DOMAIN_LOOKUP_TIME').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace TCP_CONNECT_TIME', () => {
    return expandUrlAsync('?sh=TCP_CONNECT_TIME').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace SERVER_RESPONSE_TIME', () => {
    return expandUrlAsync('?sh=SERVER_RESPONSE_TIME').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace PAGE_DOWNLOAD_TIME', () => {
    return expandUrlAsync('?sh=PAGE_DOWNLOAD_TIME').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  // TODO(cvializ, #12336): unskip
  it.skip('should replace REDIRECT_TIME', () => {
    return expandUrlAsync('?sh=REDIRECT_TIME').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace DOM_INTERACTIVE_TIME', () => {
    return expandUrlAsync('?sh=DOM_INTERACTIVE_TIME').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace CONTENT_LOAD_TIME', () => {
    return expandUrlAsync('?sh=CONTENT_LOAD_TIME').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace AVAILABLE_SCREEN_HEIGHT', () => {
    return expandUrlAsync('?sh=AVAILABLE_SCREEN_HEIGHT').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace AVAILABLE_SCREEN_WIDTH', () => {
    return expandUrlAsync('?sh=AVAILABLE_SCREEN_WIDTH').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace SCREEN_COLOR_DEPTH', () => {
    return expandUrlAsync('?sh=SCREEN_COLOR_DEPTH').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace BROWSER_LANGUAGE', () => {
    return expandUrlAsync('?sh=BROWSER_LANGUAGE').then(res => {
      expect(res).to.match(/sh=\w+/);
    });
  });

  it('should replace USER_AGENT', () => {
    return expandUrlAsync('?sh=USER_AGENT').then(res => {
      expect(res).to.match(/sh=\w+/);
    });
  });

  it('should replace VIEWER with origin', () => {
    return getReplacements().then(replacements => {
      sandbox
        .stub(viewerService, 'getViewerOrigin')
        .returns(Promise.resolve('https://www.google.com'));
      return replacements.expandUrlAsync('?sh=VIEWER').then(res => {
        expect(res).to.equal('?sh=https%3A%2F%2Fwww.google.com');
      });
    });
  });

  it('should replace VIEWER with empty string', () => {
    return getReplacements().then(replacements => {
      sandbox
        .stub(viewerService, 'getViewerOrigin')
        .returns(Promise.resolve(''));
      return replacements.expandUrlAsync('?sh=VIEWER').then(res => {
        expect(res).to.equal('?sh=');
      });
    });
  });

  it('should replace TOTAL_ENGAGED_TIME', () => {
    return expandUrlAsync(
      '?sh=TOTAL_ENGAGED_TIME',
      /*opt_bindings*/ undefined,
      {withActivity: true}
    ).then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace INCREMENTAL_ENGAGED_TIME', () => {
    return expandUrlAsync(
      '?sh=INCREMENTAL_ENGAGED_TIME',
      /*opt_bindings*/ undefined,
      {withActivity: true}
    ).then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace AMP_VERSION', () => {
    return expandUrlAsync('?sh=AMP_VERSION').then(res => {
      expect(res).to.equal('?sh=%24internalRuntimeVersion%24');
    });
  });

  it('should replace ANCESTOR_ORIGIN', () => {
    return expect(
      expandUrlAsync('ANCESTOR_ORIGIN/recipes', /*opt_bindings*/ undefined, {
        withViewerIntegrationVariableService: {
          ancestorOrigin: () => {
            return 'http://margarine-paradise.com';
          },
          fragmentParam: (param, defaultValue) => {
            return param == 'ice_cream' ? '2' : defaultValue;
          },
        },
      })
    ).to.eventually.equal('http://margarine-paradise.com/recipes');
  });

  it('should replace FRAGMENT_PARAM with 2', () => {
    return expect(
      expandUrlAsync(
        '?sh=FRAGMENT_PARAM(ice_cream)&s',
        /*opt_bindings*/ undefined,
        {
          withViewerIntegrationVariableService: {
            ancestorOrigin: () => {
              return 'http://margarine-paradise.com';
            },
            fragmentParam: (param, defaultValue) => {
              return param == 'ice_cream' ? '2' : defaultValue;
            },
          },
        }
      )
    ).to.eventually.equal('?sh=2&s');
  });

  it('should accept $expressions', () => {
    return expandUrlAsync('?href=$CANONICAL_URL').then(res => {
      expect(res).to.equal('?href=https%3A%2F%2Fpinterest.com%3A8080%2Fpin1');
    });
  });

  it('should ignore unknown substitutions', () => {
    return expandUrlAsync('?a=UNKNOWN').then(res => {
      expect(res).to.equal('?a=UNKNOWN');
    });
  });

  it('should replace several substitutions', () => {
    return expandUrlAsync('?a=UNKNOWN&href=CANONICAL_URL&title=TITLE').then(
      res => {
        expect(res).to.equal(
          '?a=UNKNOWN' +
            '&href=https%3A%2F%2Fpinterest.com%3A8080%2Fpin1' +
            '&title=Pixel%20Test'
        );
      }
    );
  });

  it('should replace new substitutions', () => {
    const {documentElement} = window.document;
    const replacements = Services.urlReplacementsForDoc(documentElement);
    replacements.getVariableSource().set('ONE', () => 'a');
    expect(replacements.expandUrlAsync('?a=ONE')).to.eventually.equal('?a=a');
    replacements.getVariableSource().set('ONE', () => 'b');
    replacements.getVariableSource().set('TWO', () => 'b');
    return expect(
      replacements.expandUrlAsync('?a=ONE&b=TWO')
    ).to.eventually.equal('?a=b&b=b');
  });

  // TODO(#16916): Make this test work with synchronous throws.
  it.skip('should report errors & replace them with empty string (sync)', () => {
    const clock = sandbox.useFakeTimers();
    const {documentElement} = window.document;
    const replacements = Services.urlReplacementsForDoc(documentElement);
    replacements.getVariableSource().set('ONE', () => {
      throw new Error('boom');
    });
    const p = expect(replacements.expandUrlAsync('?a=ONE')).to.eventually.equal(
      '?a='
    );
    allowConsoleError(() => {
      expect(() => {
        clock.tick(1);
      }).to.throw(/boom/);
    });
    return p;
  });

  // TODO(#16916): Make this test work with synchronous throws.
  it.skip('should report errors & replace them with empty string (promise)', () => {
    const clock = sandbox.useFakeTimers();
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
    const {documentElement} = window.document;
    const replacements = Services.urlReplacementsForDoc(documentElement);
    replacements.getVariableSource().set('FN', one => one);
    return expect(
      replacements.expandUrlAsync('?a=FN(xyz1)')
    ).to.eventually.equal('?a=xyz1');
  });

  it('should support multiple positional arguments', () => {
    const {documentElement} = window.document;
    const replacements = Services.urlReplacementsForDoc(documentElement);
    replacements.getVariableSource().set('FN', (one, two) => {
      return one + '-' + two;
    });
    return expect(
      replacements.expandUrlAsync('?a=FN(xyz,abc)')
    ).to.eventually.equal('?a=xyz-abc');
  });

  it('should support multiple positional arguments with dots', () => {
    const {documentElement} = window.document;
    const replacements = Services.urlReplacementsForDoc(documentElement);
    replacements.getVariableSource().set('FN', (one, two) => {
      return one + '-' + two;
    });
    return expect(
      replacements.expandUrlAsync('?a=FN(xy.z,ab.c)')
    ).to.eventually.equal('?a=xy.z-ab.c');
  });

  it('should support promises as replacements', () => {
    const {documentElement} = window.document;
    const replacements = Services.urlReplacementsForDoc(documentElement);
    replacements.getVariableSource().set('P1', () => Promise.resolve('abc '));
    replacements.getVariableSource().set('P2', () => Promise.resolve('xyz'));
    replacements.getVariableSource().set('P3', () => Promise.resolve('123'));
    replacements.getVariableSource().set('OTHER', () => 'foo');
    return expect(
      replacements.expandUrlAsync('?a=P1&b=P2&c=P3&d=OTHER')
    ).to.eventually.equal('?a=abc%20&b=xyz&c=123&d=foo');
  });

  it('should override an existing binding', () => {
    return expandUrlAsync('ord=RANDOM?', {'RANDOM': 'abc'}).then(res => {
      expect(res).to.match(/ord=abc\?$/);
    });
  });

  it('should add an additional binding', () => {
    return expandUrlAsync('rid=NONSTANDARD?', {'NONSTANDARD': 'abc'}).then(
      res => {
        expect(res).to.match(/rid=abc\?$/);
      }
    );
  });

  it('should NOT overwrite the cached expression with new bindings', () => {
    return expandUrlAsync('rid=NONSTANDARD?', {'NONSTANDARD': 'abc'}).then(
      res => {
        expect(res).to.match(/rid=abc\?$/);
        return expandUrlAsync('rid=NONSTANDARD?').then(res => {
          expect(res).to.match(/rid=NONSTANDARD\?$/);
        });
      }
    );
  });

  it('should expand bindings as functions', () => {
    return expandUrlAsync('rid=FUNC(abc)?', {
      'FUNC': value => 'func_' + value,
    }).then(res => {
      expect(res).to.match(/rid=func_abc\?$/);
    });
  });

  it('should expand bindings as functions with promise', () => {
    return expandUrlAsync('rid=FUNC(abc)?', {
      'FUNC': value => Promise.resolve('func_' + value),
    }).then(res => {
      expect(res).to.match(/rid=func_abc\?$/);
    });
  });

  it('should expand null as empty string', () => {
    return expandUrlAsync('v=VALUE', {'VALUE': null}).then(res => {
      expect(res).to.equal('v=');
    });
  });

  it('should expand undefined as empty string', () => {
    return expandUrlAsync('v=VALUE', {'VALUE': undefined}).then(res => {
      expect(res).to.equal('v=');
    });
  });

  it('should expand empty string as empty string', () => {
    return expandUrlAsync('v=VALUE', {'VALUE': ''}).then(res => {
      expect(res).to.equal('v=');
    });
  });

  it('should expand zero as zero', () => {
    return expandUrlAsync('v=VALUE', {'VALUE': 0}).then(res => {
      expect(res).to.equal('v=0');
    });
  });

  it('should expand false as false', () => {
    return expandUrlAsync('v=VALUE', {'VALUE': false}).then(res => {
      expect(res).to.equal('v=false');
    });
  });

  it('should resolve sub-included bindings', () => {
    // RANDOM is a standard property and we add RANDOM_OTHER.
    return expandUrlAsync('r=RANDOM&ro=RANDOM_OTHER?', {
      'RANDOM_OTHER': 'ABC',
    }).then(res => {
      expect(res).to.match(/r=(\d+(\.\d+)?)&ro=ABC\?$/);
    });
  });

  it('should expand multiple vars', () => {
    return expandUrlAsync('a=VALUEA&b=VALUEB?', {
      'VALUEA': 'aaa',
      'VALUEB': 'bbb',
    }).then(res => {
      expect(res).to.match(/a=aaa&b=bbb\?$/);
    });
  });

  describe('QUERY_PARAM', () => {
    it('should replace QUERY_PARAM with foo', () => {
      const win = getFakeWindow();
      win.location = parseUrlDeprecated(
        'https://example.com?query_string_param1=wrong'
      );
      sandbox.stub(trackPromise, 'getTrackImpressionPromise').callsFake(() => {
        return new Promise(resolve => {
          win.location = parseUrlDeprecated(
            'https://example.com?query_string_param1=foo'
          );
          resolve();
        });
      });
      return Services.urlReplacementsForDoc(win.document.documentElement)
        .expandUrlAsync('?sh=QUERY_PARAM(query_string_param1)&s')
        .then(res => {
          expect(res).to.match(/sh=foo&s/);
        });
    });

    it('should replace QUERY_PARAM with ""', () => {
      const win = getFakeWindow();
      win.location = parseUrlDeprecated('https://example.com');
      sandbox.stub(trackPromise, 'getTrackImpressionPromise').callsFake(() => {
        return Promise.resolve();
      });
      return Services.urlReplacementsForDoc(win.document.documentElement)
        .expandUrlAsync('?sh=QUERY_PARAM(query_string_param1)&s')
        .then(res => {
          expect(res).to.match(/sh=&s/);
        });
    });

    it('should replace QUERY_PARAM with default_value', () => {
      const win = getFakeWindow();
      win.location = parseUrlDeprecated('https://example.com');
      sandbox.stub(trackPromise, 'getTrackImpressionPromise').callsFake(() => {
        return Promise.resolve();
      });
      return Services.urlReplacementsForDoc(win.document.documentElement)
        .expandUrlAsync('?sh=QUERY_PARAM(query_string_param1,default_value)&s')
        .then(res => {
          expect(res).to.match(/sh=default_value&s/);
        });
    });

    it('should replace QUERY_PARAM with extra param', () => {
      const win = getFakeWindow();
      win.location = parseUrlDeprecated(
        'https://cdn.ampproject.org/a/o.com/foo/?x=wrong'
      );
      sandbox.stub(trackPromise, 'getTrackImpressionPromise').callsFake(() => {
        return new Promise(resolve => {
          win.location = parseUrlDeprecated(
            'https://cdn.ampproject.org/a/o.com/foo/?amp_r=x%3Dfoo'
          );
          resolve();
        });
      });
      return Services.urlReplacementsForDoc(win.document.documentElement)
        .expandUrlAsync('?sh=QUERY_PARAM(x)&s')
        .then(res => {
          expect(res).to.match(/sh=foo&s/);
        });
    });

    it('should replace QUERY_PARAM, preferring original over extra', () => {
      const win = getFakeWindow();
      win.location = parseUrlDeprecated(
        'https://cdn.ampproject.org/a/o.com/foo/?x=wrong'
      );
      sandbox.stub(trackPromise, 'getTrackImpressionPromise').callsFake(() => {
        return new Promise(resolve => {
          win.location = parseUrlDeprecated(
            'https://cdn.ampproject.org/a/o.com/foo/?x=foo&amp_r=x%3Devil'
          );
          resolve();
        });
      });
      return Services.urlReplacementsForDoc(win.document.documentElement)
        .expandUrlAsync('?sh=QUERY_PARAM(x)&s')
        .then(res => {
          expect(res).to.match(/sh=foo&s/);
        });
    });
  });

  it('should collect vars', () => {
    const win = getFakeWindow();
    win.location = parseUrlDeprecated('https://example.com?p1=foo');
    sandbox.stub(trackPromise, 'getTrackImpressionPromise').callsFake(() => {
      return Promise.resolve();
    });
    return Services.urlReplacementsForDoc(win.document.documentElement)
      .collectVars('?SOURCE_HOST&QUERY_PARAM(p1)&SIMPLE&FUNC&PROMISE', {
        'SIMPLE': 21,
        'FUNC': () => 22,
        'PROMISE': () => Promise.resolve(23),
      })
      .then(res => {
        expect(res).to.deep.equal({
          'SOURCE_HOST': 'example.com',
          'QUERY_PARAM(p1)': 'foo',
          'SIMPLE': 21,
          'FUNC': 22,
          'PROMISE': 23,
        });
      });
  });

  it('should collect unwhitelisted vars', () => {
    const win = getFakeWindow();
    win.location = parseUrlDeprecated(
      'https://example.com/base?foo=bar&bar=abc&gclid=123'
    );
    const element = document.createElement('amp-foo');
    element.setAttribute('src', '?SOURCE_HOST&QUERY_PARAM(p1)&COUNTER');
    element.setAttribute('data-amp-replace', 'QUERY_PARAM');
    const {documentElement} = win.document;
    const urlReplacements = Services.urlReplacementsForDoc(documentElement);
    const unwhitelisted = urlReplacements.collectUnwhitelistedVarsSync(element);
    expect(unwhitelisted).to.deep.equal(['SOURCE_HOST', 'COUNTER']);
  });

  it('should reject javascript protocol', () => {
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
        err => {
          expect(err.message).to.match(/invalid protocol/);
        }
      );
  });

  describe('sync expansion', () => {
    it('should expand w/ collect vars (skip async macro)', () => {
      const win = getFakeWindow();
      const {documentElement} = win.document;
      const urlReplacements = Services.urlReplacementsForDoc(documentElement);
      urlReplacements.ampdoc.win.performance.timing.loadEventStart = 109;
      const collectVars = {};
      const expanded = urlReplacements.expandUrlSync(
        'r=RANDOM&c=CONST&f=FUNCT(hello,world)&a=b&d=PROM&e=PAGE_LOAD_TIME',
        {
          'CONST': 'ABC',
          'FUNCT': function(a, b) {
            return a + b;
          },
          // Will ignore promise based result and instead insert empty string.
          'PROM': function() {
            return Promise.resolve('boo');
          },
        },
        collectVars
      );
      expect(expanded).to.match(/^r=\d(\.\d+)?&c=ABC&f=helloworld&a=b&d=&e=9$/);
      expect(collectVars).to.deep.equal({
        'RANDOM': parseFloat(/^r=(\d+(\.\d+)?)/.exec(expanded)[1]),
        'CONST': 'ABC',
        'FUNCT(hello,world)': 'helloworld',
        'PAGE_LOAD_TIME': 9,
      });
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
          'FUNCT': function() {
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

  it('should expand sync and respect white list', () => {
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
      undefined,
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
      accessServiceMock = sandbox.mock(accessService);
      sandbox.stub(Services, 'accessServiceForDocOrNull').callsFake(() => {
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
      return createIframePromise().then(iframe => {
        iframe.doc.title = 'Pixel Test';
        const link = iframe.doc.createElement('link');
        link.setAttribute('href', 'https://pinterest.com/pin1');
        link.setAttribute('rel', 'canonical');
        iframe.doc.head.appendChild(link);
        const {documentElement} = iframe.doc;
        const replacements = Services.urlReplacementsForDoc(documentElement);
        return replacements.expandUrlAsync(url);
      });
    }

    it('should replace ACCESS_READER_ID', () => {
      accessServiceMock
        .expects('getAccessReaderId')
        .returns(Promise.resolve('reader1'))
        .once();
      return expandUrlAsync('?a=ACCESS_READER_ID').then(res => {
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
      return expandUrlAsync('?a=AUTHDATA(field1)').then(res => {
        expect(res).to.match(/a=value1/);
        expect(userErrorStub).to.have.not.been.called;
      });
    });

    it('should report error if not available', () => {
      accessServiceMock.expects('getAccessReaderId').never();
      return expandUrlAsync('?a=ACCESS_READER_ID;', /* disabled */ true).then(
        res => {
          expect(res).to.match(/a=;/);
          expect(userErrorStub).to.be.calledOnce;
        }
      );
    });
  });

  describe('access values via amp-subscriptions', () => {
    let accessService;
    let accessServiceMock;

    beforeEach(() => {
      accessService = {
        getAccessReaderId: () => {},
        getAuthdataField: () => {},
      };
      accessServiceMock = sandbox.mock(accessService);
      sandbox
        .stub(Services, 'subscriptionsServiceForDocOrNull')
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
      return createIframePromise().then(iframe => {
        iframe.doc.title = 'Pixel Test';
        const link = iframe.doc.createElement('link');
        link.setAttribute('href', 'https://pinterest.com/pin1');
        link.setAttribute('rel', 'canonical');
        iframe.doc.head.appendChild(link);
        const {documentElement} = iframe.doc;
        const replacements = Services.urlReplacementsForDoc(documentElement);
        return replacements.expandUrlAsync(url);
      });
    }

    it('should replace ACCESS_READER_ID', () => {
      accessServiceMock
        .expects('getAccessReaderId')
        .returns(Promise.resolve('reader1'))
        .once();
      return expandUrlAsync('?a=ACCESS_READER_ID').then(res => {
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
      return expandUrlAsync('?a=AUTHDATA(field1)').then(res => {
        expect(res).to.match(/a=value1/);
        expect(userErrorStub).to.have.not.been.called;
      });
    });

    it('should report error if not available', () => {
      accessServiceMock.expects('getAccessReaderId').never();
      return expandUrlAsync('?a=ACCESS_READER_ID;', /* disabled */ true).then(
        res => {
          expect(res).to.match(/a=;/);
          expect(userErrorStub).to.be.calledOnce;
        }
      );
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

    it('should not replace without user whitelisting', () => {
      a.href = 'https://example.com/link?out=QUERY_PARAM(foo)';
      urlReplacements.maybeExpandLink(a, null);
      expect(a.href).to.equal('https://example.com/link?out=QUERY_PARAM(foo)');
    });

    it('should not replace without user whitelisting 2', () => {
      a.href = 'https://example.com/link?out=QUERY_PARAM(foo)';
      a.setAttribute('data-amp-replace', 'ABC');
      urlReplacements.maybeExpandLink(a, null);
      expect(a.href).to.equal('https://example.com/link?out=QUERY_PARAM(foo)');
    });

    it('should replace default append params regardless of whitelist', () => {
      a.href = 'https://example.com/link?out=QUERY_PARAM(foo)';
      urlReplacements.maybeExpandLink(a, 'gclid=QUERY_PARAM(gclid)');
      expect(a.href).to.equal(
        'https://example.com/link?out=QUERY_PARAM(foo)&gclid=123'
      );
    });

    it('should not replace unwhitelisted fields', () => {
      a.href = 'https://example.com/link?out=RANDOM';
      a.setAttribute('data-amp-replace', 'RANDOM');
      urlReplacements.maybeExpandLink(a, null);
      expect(a.href).to.equal('https://example.com/link?out=RANDOM');
    });

    it('should replace for http (non-secure) whitelisted origin', () => {
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

    it('should replace with whitelisted origin', () => {
      a.href = 'https://whitelisted.com/link?out=QUERY_PARAM(foo)';
      a.setAttribute('data-amp-replace', 'QUERY_PARAM');
      urlReplacements.maybeExpandLink(a, null);
      expect(a.href).to.equal('https://whitelisted.com/link?out=bar');
    });

    it('should not replace to different origin', () => {
      a.href = 'https://example2.com/link?out=QUERY_PARAM(foo)';
      a.setAttribute('data-amp-replace', 'QUERY_PARAM');
      urlReplacements.maybeExpandLink(a, null);
      expect(a.href).to.equal('https://example2.com/link?out=QUERY_PARAM(foo)');
    });

    it('should not append default param to different origin', () => {
      a.href = 'https://example2.com/link?out=QUERY_PARAM(foo)';
      a.setAttribute('data-amp-replace', 'QUERY_PARAM');
      urlReplacements.maybeExpandLink(a, 'gclid=QUERY_PARAM(gclid)');
      expect(a.href).to.equal('https://example2.com/link?out=QUERY_PARAM(foo)');
    });

    it('should replace whitelisted fields', () => {
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
      a.href = 'http://whitelisted.com/link?out=QUERY_PARAM(foo)';
      a.setAttribute('data-amp-addparams', 'guid=123');
      urlReplacements.maybeExpandLink(a, null);
      expect(a.href).to.equal(
        'http://whitelisted.com/link?out=QUERY_PARAM(foo)&guid=123'
      );
    });

    it(
      'should add URL parameters and repalce whitelisted' +
        " values for http whitelisted URL's(non-secure)",
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
      'should add URL parameters and not repalce whitelisted' +
        " values for non whitelisted http URL's(non-secure)",
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

    it('should append query parameters and repalce whitelisted values', () => {
      a.href = 'https://whitelisted.com/link?out=QUERY_PARAM(foo)';
      a.setAttribute('data-amp-replace', 'QUERY_PARAM CLIENT_ID');
      a.setAttribute('data-amp-addparams', 'guid=123&c=CLIENT_ID(abc)');
      // Get a cid, then proceed.
      return urlReplacements.expandUrlAsync('CLIENT_ID(abc)').then(() => {
        urlReplacements.maybeExpandLink(a, null);
        expect(a.href).to.equal(
          'https://whitelisted.com/link?out=bar&guid=123&c=test-cid(abc)'
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
          'FUNCT': function() {
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
        .then(expanded => {
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
        .then(expanded => {
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

    it('should not replace not whitelisted vars', () => {
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
        .then(expandedValue => {
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
      expect(extractClientIdFromGaCookie('1.1.430749005.1489527047')).to.equal(
        '430749005.1489527047'
      );
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
