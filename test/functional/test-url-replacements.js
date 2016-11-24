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

import {Observable} from '../../src/observable';
import {createIframePromise} from '../../testing/iframe';
import {user} from '../../src/log';
import {urlReplacementsForDoc} from '../../src/url-replacements';
import {markElementScheduledForTesting} from '../../src/custom-element';
import {installCidService} from '../../extensions/amp-analytics/0.1/cid-impl';
import {installCryptoService,} from
    '../../extensions/amp-analytics/0.1/crypto-impl';
import {installDocService} from '../../src/service/ampdoc-impl';
import {installDocumentInfoServiceForDoc,} from
    '../../src/service/document-info-impl';
import {installActivityService,} from
    '../../extensions/amp-analytics/0.1/activity-impl';
import {
  installUrlReplacementsServiceForDoc,
} from '../../src/service/url-replacements-impl';
import {getService} from '../../src/service';
import {setCookie} from '../../src/cookies';
import {parseUrl} from '../../src/url';
import {toggleExperiment} from '../../src/experiments';
import {viewerForDoc} from '../../src/viewer';
import * as trackPromise from '../../src/impression';
import * as sinon from 'sinon';


describe('UrlReplacements', () => {

  let canonical;
  let sandbox;
  let loadObservable;
  let replacements;
  let viewerService;
  let userErrorStub;

  beforeEach(() => {
    canonical = 'https://canonical.com/doc1';
    sandbox = sinon.sandbox.create();
    userErrorStub = sandbox.stub(user(), 'error');
  });

  afterEach(() => {
    sandbox.restore();
  });

  function getReplacements(opt_options) {
    return createIframePromise().then(iframe => {
      iframe.doc.title = 'Pixel Test';
      const link = iframe.doc.createElement('link');
      link.setAttribute('href', 'https://pinterest.com:8080/pin1');
      link.setAttribute('rel', 'canonical');
      iframe.doc.head.appendChild(link);
      installDocumentInfoServiceForDoc(iframe.ampdoc);
      if (opt_options) {
        if (opt_options.withCid) {
          markElementScheduledForTesting(iframe.win, 'amp-analytics');
          installCidService(iframe.win);
          installCryptoService(iframe.win);
        }
        if (opt_options.withActivity) {
          markElementScheduledForTesting(iframe.win, 'amp-analytics');
          installActivityService(iframe.win);
        }
        if (opt_options.withVariant) {
          markElementScheduledForTesting(iframe.win, 'amp-experiment');
          getService(iframe.win, 'variant', () => Promise.resolve({
            'x1': 'v1',
            'x2': null,
          }));
        }
        if (opt_options.withShareTracking) {
          markElementScheduledForTesting(iframe.win, 'amp-share-tracking');
          getService(iframe.win, 'share-tracking', () => Promise.resolve({
            incomingFragment: '12345',
            outgoingFragment: '54321',
          }));
        }
      }
      viewerService = viewerForDoc(iframe.ampdoc);
      replacements = urlReplacementsForDoc(iframe.ampdoc);
      return replacements;
    });
  }

  function expandAsync(url, opt_bindings, opt_options) {
    return getReplacements(opt_options).then(
          replacements => replacements.expandAsync(url, opt_bindings)
        );
  }

  function getFakeWindow() {
    loadObservable = new Observable();
    const win = {
      addEventListener: function(type, callback) {
        loadObservable.add(callback);
      },
      Object,
      performance: {
        timing: {
          navigationStart: 100,
          loadEventStart: 0,
        },
      },
      removeEventListener: function(type, callback) {
        loadObservable.remove(callback);
      },
      document: {
        nodeType: /* document */ 9,
        querySelector: () => {return {href: canonical};},
        cookie: '',
      },
      Math: window.Math,
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
    const ampdocService = installDocService(win, true);
    const ampdoc = ampdocService.getAmpDoc(win.document);
    installDocumentInfoServiceForDoc(ampdoc);
    win.ampdoc = ampdoc;
    return win;
  }

  it('should replace RANDOM', () => {
    return expandAsync('ord=RANDOM?').then(res => {
      expect(res).to.match(/ord=(\d+(\.\d+)?)\?$/);
    });
  });

  it('should replace COUNTER', () => {
    return expandAsync(
        'COUNTER(foo),COUNTER(bar),COUNTER(foo),COUNTER(bar),COUNTER(bar)')
            .then(res => {
              expect(res).to.equal('1,1,2,2,3');
            });
  });

  it('should replace CANONICAL_URL', () => {
    return expandAsync('?href=CANONICAL_URL').then(res => {
      expect(res).to.equal('?href=https%3A%2F%2Fpinterest.com%3A8080%2Fpin1');
    });
  });

  it('should replace CANONICAL_HOST', () => {
    return expandAsync('?host=CANONICAL_HOST').then(res => {
      expect(res).to.equal('?host=pinterest.com%3A8080');
    });
  });

  it('should replace CANONICAL_HOSTNAME', () => {
    return expandAsync('?host=CANONICAL_HOSTNAME').then(res => {
      expect(res).to.equal('?host=pinterest.com');
    });
  });

  it('should replace CANONICAL_PATH', () => {
    return expandAsync('?path=CANONICAL_PATH').then(res => {
      expect(res).to.equal('?path=%2Fpin1');
    });
  });

  it('should replace DOCUMENT_REFERRER', () => {
    return expandAsync('?ref=DOCUMENT_REFERRER').then(res => {
      expect(res).to.equal('?ref=http%3A%2F%2Flocalhost%3A9876%2Fcontext.html');
    });
  });

  it('should replace TITLE', () => {
    return expandAsync('?title=TITLE').then(res => {
      expect(res).to.equal('?title=Pixel%20Test');
    });
  });

  it('should replace AMPDOC_URL', () => {
    return expandAsync('?ref=AMPDOC_URL').then(res => {
      expect(res).to.not.match(/AMPDOC_URL/);
    });
  });

  it('should replace AMPDOC_HOST', () => {
    return expandAsync('?ref=AMPDOC_HOST').then(res => {
      expect(res).to.not.match(/AMPDOC_HOST/);
    });
  });

  it('should replace AMPDOC_HOSTNAME', () => {
    return expandAsync('?ref=AMPDOC_HOSTNAME').then(res => {
      expect(res).to.not.match(/AMPDOC_HOSTNAME/);
    });
  });

  it('should replace SOURCE_URL and _HOST', () => {
    sandbox.stub(trackPromise, 'getTrackImpressionPromise', () => {
      return Promise.resolve();
    });
    return expandAsync('?url=SOURCE_URL&host=SOURCE_HOST').then(res => {
      expect(res).to.not.match(/SOURCE_URL/);
      expect(res).to.not.match(/SOURCE_HOST/);
    });
  });

  it('should replace SOURCE_URL and _HOSTNAME', () => {
    sandbox.stub(trackPromise, 'getTrackImpressionPromise', () => {
      return Promise.resolve();
    });
    return expandAsync('?url=SOURCE_URL&host=SOURCE_HOSTNAME').then(res => {
      expect(res).to.not.match(/SOURCE_URL/);
      expect(res).to.not.match(/SOURCE_HOSTNAME/);
    });
  });

  it('should update SOURCE_URL after track impression', () => {
    const win = getFakeWindow();
    win.location = parseUrl('https://wrong.com');
    sandbox.stub(trackPromise, 'getTrackImpressionPromise', () => {
      return new Promise(resolve => {
        win.location = parseUrl('https://example.com?gclid=123456');
        resolve();
      });
    });
    return installUrlReplacementsServiceForDoc(win.ampdoc)
      .expandAsync('?url=SOURCE_URL')
      .then(res => {
        expect(res).to.contain('example.com');
      });
  });

  it('should replace SOURCE_PATH', () => {
    return expandAsync('?path=SOURCE_PATH').then(res => {
      expect(res).to.not.match(/SOURCE_PATH/);
    });
  });

  it('should replace PAGE_VIEW_ID', () => {
    return expandAsync('?pid=PAGE_VIEW_ID').then(res => {
      expect(res).to.match(/pid=\d+/);
    });
  });

  it('should replace CLIENT_ID', () => {
    setCookie(window, 'url-abc', 'cid-for-abc');
    // Make sure cookie does not exist
    setCookie(window, 'url-xyz', '');
    return expandAsync('?a=CLIENT_ID(url-abc)&b=CLIENT_ID(url-xyz)',
        /*opt_bindings*/undefined, {withCid: true}).then(res => {
          expect(res).to.match(/^\?a=cid-for-abc\&b=amp-([a-zA-Z0-9_-]+){10,}/);
        });
  });

  it('should replace CLIENT_ID synchronously when available', () => {
    return getReplacements({withCid: true}).then(urlReplacements => {
      setCookie(window, 'url-abc', 'cid-for-abc');
      setCookie(window, 'url-xyz', 'cid-for-xyz');
      // Only requests cid-for-xyz in async path
      return urlReplacements.expandAsync('b=CLIENT_ID(url-xyz)').then(res => {
        expect(res).to.equal('b=cid-for-xyz');
      }).then(() => {
        const result = urlReplacements.expandSync(
            '?a=CLIENT_ID(url-abc)&b=CLIENT_ID(url-xyz)&c=CLIENT_ID(other)');
        expect(result).to.equal('?a=&b=cid-for-xyz&c=');
      });
    });
  });

  it('should replace VARIANT', () => {
    return expect(expandAsync('?x1=VARIANT(x1)&x2=VARIANT(x2)&x3=VARIANT(x3)',
        /*opt_bindings*/undefined, {withVariant: true}))
        .to.eventually.equal('?x1=v1&x2=none&x3=');
  });

  it('should replace VARIANT with empty string if ' +
      'amp-experiment is not configured ', () => {
    return expect(expandAsync('?x1=VARIANT(x1)&x2=VARIANT(x2)&x3=VARIANT(x3)'))
        .to.eventually.equal('?x1=&x2=&x3=');
  });

  it('should replace VARIANTS', () => {
    return expect(expandAsync('?VARIANTS', /*opt_bindings*/undefined,
        {withVariant: true})).to.eventually.equal('?x1.v1!x2.none');
  });

  it('should replace VARIANTS with empty string if ' +
      'amp-experiment is not configured ', () => {
    return expect(expandAsync('?VARIANTS')).to.eventually.equal('?');
  });

  it('should replace SHARE_TRACKING_INCOMING and' +
      'SHARE_TRACKING_OUTGOING', () => {
    return expect(
        expandAsync('?in=SHARE_TRACKING_INCOMING&out=SHARE_TRACKING_OUTGOING',
        /*opt_bindings*/undefined, {withShareTracking: true}))
        .to.eventually.equal('?in=12345&out=54321');
  });

  it('should replace SHARE_TRACKING_INCOMING and SHARE_TRACKING_OUTGOING' +
      'with empty string if amp-share-tracking is not configured', () => {
    return expect(
        expandAsync('?in=SHARE_TRACKING_INCOMING&out=SHARE_TRACKING_OUTGOING'))
        .to.eventually.equal('?in=&out=');
  });

  it('should replace TIMESTAMP', () => {
    return expandAsync('?ts=TIMESTAMP').then(res => {
      expect(res).to.match(/ts=\d+/);
    });
  });

  it('should replace TIMEZONE', () => {
    return expandAsync('?tz=TIMEZONE').then(res => {
      expect(res).to.match(/tz=-?\d+/);
    });
  });

  it('should replace SCROLL_TOP', () => {
    return expandAsync('?scrollTop=SCROLL_TOP').then(res => {
      expect(res).to.match(/scrollTop=\d+/);
    });
  });

  it('should replace SCROLL_LEFT', () => {
    return expandAsync('?scrollLeft=SCROLL_LEFT').then(res => {
      expect(res).to.match(/scrollLeft=\d+/);
    });
  });

  it('should replace SCROLL_HEIGHT', () => {
    return expandAsync('?scrollHeight=SCROLL_HEIGHT').then(res => {
      expect(res).to.match(/scrollHeight=\d+/);
    });
  });

  it('should replace SCREEN_WIDTH', () => {
    return expandAsync('?sw=SCREEN_WIDTH').then(res => {
      expect(res).to.match(/sw=\d+/);
    });
  });

  it('should replace SCREEN_HEIGHT', () => {
    return expandAsync('?sh=SCREEN_HEIGHT').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace VIEWPORT_WIDTH', () => {
    return expandAsync('?vw=VIEWPORT_WIDTH').then(res => {
      expect(res).to.match(/vw=\d+/);
    });
  });

  it('should replace VIEWPORT_HEIGHT', () => {
    return expandAsync('?vh=VIEWPORT_HEIGHT').then(res => {
      expect(res).to.match(/vh=\d+/);
    });
  });

  it('should replace PAGE_LOAD_TIME', () => {
    return expandAsync('?sh=PAGE_LOAD_TIME').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should reject protocol changes', () => {
    const win = getFakeWindow();
    const urlReplacements = installUrlReplacementsServiceForDoc(win.ampdoc);
    return urlReplacements.expandAsync(
        'PROTOCOL://example.com/?r=RANDOM', {
          'PROTOCOL': Promise.resolve('abc'),
        }).then(expanded => {
          expect(expanded).to.equal('PROTOCOL://example.com/?r=RANDOM');
        });
  });

  it('Should replace BACKGROUND_STATE with 0', () => {
    const win = getFakeWindow();
    win.services.viewer = {
      obj: {isVisible: () => true},
    };
    return installUrlReplacementsServiceForDoc(win.ampdoc)
      .expandAsync('?sh=BACKGROUND_STATE')
      .then(res => {
        expect(res).to.equal('?sh=0');
      });
  });

  it('Should replace BACKGROUND_STATE with 1', () => {
    const win = getFakeWindow();
    win.services.viewer = {
      obj: {isVisible: () => false},
    };
    return installUrlReplacementsServiceForDoc(win.ampdoc)
      .expandAsync('?sh=BACKGROUND_STATE')
      .then(res => {
        expect(res).to.equal('?sh=1');
      });
  });

  describe('PAGE_LOAD_TIME', () => {
    let win;
    let ampdoc;
    let eventListeners;
    beforeEach(() => {
      win = getFakeWindow();
      ampdoc = win.ampdoc;
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
      return installUrlReplacementsServiceForDoc(ampdoc)
          .expandAsync('?sh=PAGE_LOAD_TIME&s')
          .then(res => {
            expect(res).to.match(/sh=&s/);
          });
    });

    it('is replaced if PAGE_LOAD_TIME is available within a delay', () => {
      const urlReplacements = installUrlReplacementsServiceForDoc(ampdoc);
      const validMetric = urlReplacements.expandAsync('?sh=PAGE_LOAD_TIME&s');
      urlReplacements.ampdoc.win.performance.timing.loadEventStart = 109;
      win.document.readyState = 'complete';
      eventListeners['readystatechange']();
      return validMetric.then(res => {
        expect(res).to.match(/sh=9&s/);
      });
    });
  });

  it('should replace NAV_REDIRECT_COUNT', () => {
    return expandAsync('?sh=NAV_REDIRECT_COUNT').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace NAV_TIMING', () => {
    return expandAsync('?a=NAV_TIMING(navigationStart)' +
        '&b=NAV_TIMING(navigationStart,responseStart)').then(res => {
          expect(res).to.match(/a=\d+&b=\d+/);
        });
  });

  it('should replace NAV_TIMING when attribute names are invalid', () => {
    return expandAsync('?a=NAV_TIMING(invalid)&b=NAV_TIMING(invalid,invalid)' +
        '&c=NAV_TIMING(navigationStart,invalid)' +
        '&d=NAV_TIMING(invalid,responseStart)').then(res => {
          expect(res).to.match(/a=&b=&c=&d=/);
        });
  });

  it('should replace NAV_TYPE', () => {
    return expandAsync('?sh=NAV_TYPE').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace DOMAIN_LOOKUP_TIME', () => {
    return expandAsync('?sh=DOMAIN_LOOKUP_TIME').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace TCP_CONNECT_TIME', () => {
    return expandAsync('?sh=TCP_CONNECT_TIME').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace SERVER_RESPONSE_TIME', () => {
    return expandAsync('?sh=SERVER_RESPONSE_TIME').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace PAGE_DOWNLOAD_TIME', () => {
    return expandAsync('?sh=PAGE_DOWNLOAD_TIME').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace REDIRECT_TIME', () => {
    return expandAsync('?sh=REDIRECT_TIME').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace DOM_INTERACTIVE_TIME', () => {
    return expandAsync('?sh=DOM_INTERACTIVE_TIME').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace CONTENT_LOAD_TIME', () => {
    return expandAsync('?sh=CONTENT_LOAD_TIME').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace AVAILABLE_SCREEN_HEIGHT', () => {
    return expandAsync('?sh=AVAILABLE_SCREEN_HEIGHT').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace AVAILABLE_SCREEN_WIDTH', () => {
    return expandAsync('?sh=AVAILABLE_SCREEN_WIDTH').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace SCREEN_COLOR_DEPTH', () => {
    return expandAsync('?sh=SCREEN_COLOR_DEPTH').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace BROWSER_LANGUAGE', () => {
    return expandAsync('?sh=BROWSER_LANGUAGE').then(res => {
      expect(res).to.match(/sh=\w+/);
    });
  });

  it('should replace VIEWER with origin', () => {
    return getReplacements().then(replacements => {
      sandbox.stub(viewerService, 'getViewerOrigin').returns(
          Promise.resolve('https://www.google.com'));
      return replacements.expandAsync('?sh=VIEWER').then(res => {
        expect(res).to.equal('?sh=https%3A%2F%2Fwww.google.com');
      });
    });
  });

  it('should replace VIEWER with empty string', () => {
    return getReplacements().then(replacements => {
      sandbox.stub(viewerService, 'getViewerOrigin').returns(
          Promise.resolve(''));
      return replacements.expandAsync('?sh=VIEWER').then(res => {
        expect(res).to.equal('?sh=');
      });
    });
  });

  it('should replace TOTAL_ENGAGED_TIME', () => {
    return expandAsync('?sh=TOTAL_ENGAGED_TIME', /*opt_bindings*/undefined,
        {withActivity: true}).then(res => {
          expect(res).to.match(/sh=\d+/);
        });
  });

  it('should replace AMP_VERSION', () => {
    return expandAsync('?sh=AMP_VERSION').then(res => {
      expect(res).to.equal('?sh=%24internalRuntimeVersion%24');
    });
  });

  it('should accept $expressions', () => {
    return expandAsync('?href=$CANONICAL_URL').then(res => {
      expect(res).to.equal('?href=https%3A%2F%2Fpinterest.com%3A8080%2Fpin1');
    });
  });

  it('should ignore unknown substitutions', () => {
    return expandAsync('?a=UNKNOWN').then(res => {
      expect(res).to.equal('?a=UNKNOWN');
    });
  });

  it('should replace several substitutions', () => {
    return expandAsync('?a=UNKNOWN&href=CANONICAL_URL&title=TITLE')
        .then(res => {
          expect(res).to.equal('?a=UNKNOWN' +
              '&href=https%3A%2F%2Fpinterest.com%3A8080%2Fpin1' +
              '&title=Pixel%20Test');
        });
  });

  it('should replace new substitutions', () => {
    const replacements = urlReplacementsForDoc(window.document);
    replacements.getVariableSource().set('ONE', () => 'a');
    expect(replacements.expandAsync('?a=ONE')).to.eventually.equal('?a=a');
    replacements.getVariableSource().set('ONE', () => 'b');
    replacements.getVariableSource().set('TWO', () => 'b');
    return expect(replacements.expandAsync('?a=ONE&b=TWO'))
        .to.eventually.equal('?a=b&b=b');
  });

  it('should report errors & replace them with empty string (sync)', () => {
    const clock = sandbox.useFakeTimers();
    const replacements = urlReplacementsForDoc(window.document);
    replacements.getVariableSource().set('ONE', () => {
      throw new Error('boom');
    });
    const p = expect(replacements.expandAsync('?a=ONE')).to.eventually
        .equal('?a=');
    expect(() => {
      clock.tick(1);
    }).to.throw(/boom/);
    return p;
  });

  it('should report errors & replace them with empty string (promise)', () => {
    const clock = sandbox.useFakeTimers();
    const replacements = urlReplacementsForDoc(window.document);
    replacements.getVariableSource().set('ONE', () => {
      return Promise.reject(new Error('boom'));
    });
    return expect(replacements.expandAsync('?a=ONE')).to.eventually.equal('?a=')
        .then(() => {
          expect(() => {
            clock.tick(1);
          }).to.throw(/boom/);
        });
  });

  it('should support positional arguments', () => {
    const replacements = urlReplacementsForDoc(window.document);
    replacements.getVariableSource().set('FN', one => one);
    return expect(replacements.expandAsync('?a=FN(xyz1)')).to
        .eventually.equal('?a=xyz1');
  });

  it('should support multiple positional arguments', () => {
    const replacements = urlReplacementsForDoc(window.document);
    replacements.getVariableSource().set('FN', (one, two) => {
      return one + '-' + two;
    });
    return expect(replacements.expandAsync('?a=FN(xyz,abc)')).to
        .eventually.equal('?a=xyz-abc');
  });

  it('should support multiple positional arguments with dots', () => {
    const replacements = urlReplacementsForDoc(window.document);
    replacements.getVariableSource().set('FN', (one, two) => {
      return one + '-' + two;
    });
    return expect(replacements.expandAsync('?a=FN(xy.z,ab.c)')).to
        .eventually.equal('?a=xy.z-ab.c');
  });

  it('should support promises as replacements', () => {
    const replacements = urlReplacementsForDoc(window.document);
    replacements.getVariableSource().set('P1', () => Promise.resolve('abc '));
    replacements.getVariableSource().set('P2', () => Promise.resolve('xyz'));
    replacements.getVariableSource().set('P3', () => Promise.resolve('123'));
    replacements.getVariableSource().set('OTHER', () => 'foo');
    return expect(replacements.expandAsync('?a=P1&b=P2&c=P3&d=OTHER'))
        .to.eventually.equal('?a=abc%20&b=xyz&c=123&d=foo');
  });

  it('should override an existing binding', () => {
    return expandAsync('ord=RANDOM?', {'RANDOM': 'abc'}).then(res => {
      expect(res).to.match(/ord=abc\?$/);
    });
  });

  it('should add an additional binding', () => {
    return expandAsync('rid=NONSTANDARD?', {'NONSTANDARD': 'abc'}).then(res => {
      expect(res).to.match(/rid=abc\?$/);
    });
  });

  it('should NOT overwrite the cached expression with new bindings', () => {
    return expandAsync('rid=NONSTANDARD?', {'NONSTANDARD': 'abc'}).then(res => {
      expect(res).to.match(/rid=abc\?$/);
      return expandAsync('rid=NONSTANDARD?').then(res => {
        expect(res).to.match(/rid=NONSTANDARD\?$/);
      });
    });
  });

  it('should expand bindings as functions', () => {
    return expandAsync('rid=FUNC(abc)?', {'FUNC': value => 'func_' + value})
        .then(
          res => {
            expect(res).to.match(/rid=func_abc\?$/);
          });
  });

  it('should expand bindings as functions with promise', () => {
    return expandAsync('rid=FUNC(abc)?', {
      'FUNC': value => Promise.resolve('func_' + value),
    }).then(res => {
      expect(res).to.match(/rid=func_abc\?$/);
    });
  });

  it('should expand null as empty string', () => {
    return expandAsync('v=VALUE', {'VALUE': null}).then(res => {
      expect(res).to.equal('v=');
    });
  });

  it('should expand undefined as empty string', () => {
    return expandAsync('v=VALUE', {'VALUE': undefined}).then(res => {
      expect(res).to.equal('v=');
    });
  });

  it('should expand empty string as empty string', () => {
    return expandAsync('v=VALUE', {'VALUE': ''}).then(res => {
      expect(res).to.equal('v=');
    });
  });

  it('should expand zero as zero', () => {
    return expandAsync('v=VALUE', {'VALUE': 0}).then(res => {
      expect(res).to.equal('v=0');
    });
  });

  it('should expand false as false', () => {
    return expandAsync('v=VALUE', {'VALUE': false}).then(res => {
      expect(res).to.equal('v=false');
    });
  });

  it('should resolve sub-included bindings', () => {
    // RANDOM is a standard property and we add RANDOM_OTHER.
    return expandAsync('r=RANDOM&ro=RANDOM_OTHER?', {'RANDOM_OTHER': 'ABC'})
        .then(
          res => {
            expect(res).to.match(/r=(\d+(\.\d+)?)&ro=ABC\?$/);
          });
  });

  it('should expand multiple vars', () => {
    return expandAsync('a=VALUEA&b=VALUEB?', {
      'VALUEA': 'aaa',
      'VALUEB': 'bbb',
    }).then(res => {
      expect(res).to.match(/a=aaa&b=bbb\?$/);
    });
  });

  it('should replace QUERY_PARAM with foo', () => {
    const win = getFakeWindow();
    win.location = parseUrl('https://example.com?query_string_param1=wrong');
    sandbox.stub(trackPromise, 'getTrackImpressionPromise', () => {
      return new Promise(resolve => {
        win.location =
            parseUrl('https://example.com?query_string_param1=foo');
        resolve();
        console.log('promise resolve');
      });
    });
    return installUrlReplacementsServiceForDoc(win.ampdoc)
      .expandAsync('?sh=QUERY_PARAM(query_string_param1)&s')
      .then(res => {
        console.log('compare happend', res);
        expect(res).to.match(/sh=foo&s/);
      });
  });

  it('should replace QUERY_PARAM with ""', () => {
    const win = getFakeWindow();
    win.location = parseUrl('https://example.com');
    sandbox.stub(trackPromise, 'getTrackImpressionPromise', () => {
      return Promise.resolve();
    });
    return installUrlReplacementsServiceForDoc(win.ampdoc)
      .expandAsync('?sh=QUERY_PARAM(query_string_param1)&s')
      .then(res => {
        expect(res).to.match(/sh=&s/);
      });
  });

  it('should replace QUERY_PARAM with default_value', () => {
    const win = getFakeWindow();
    win.location = parseUrl('https://example.com');
    sandbox.stub(trackPromise, 'getTrackImpressionPromise', () => {
      return Promise.resolve();
    });
    return installUrlReplacementsServiceForDoc(win.ampdoc)
      .expandAsync('?sh=QUERY_PARAM(query_string_param1,default_value)&s')
      .then(res => {
        expect(res).to.match(/sh=default_value&s/);
      });
  });

  it('should collect vars', () => {
    const win = getFakeWindow();
    win.location = parseUrl('https://example.com?p1=foo');
    sandbox.stub(trackPromise, 'getTrackImpressionPromise', () => {
      return Promise.resolve();
    });
    return installUrlReplacementsServiceForDoc(win.ampdoc)
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

  it('should reject javascript protocol', () => {
    const win = getFakeWindow();
    const urlReplacements = installUrlReplacementsServiceForDoc(win.ampdoc);
    return urlReplacements.expandAsync(`javascript://example.com/?r=RANDOM`)
        .then(
          () => { throw new Error('never here'); },
          err => {
            expect(err.message).to.match(/Illegal javascript/);
          }
        );
  });

  describe('sync expansion', () => {
    it('should expand w/ collect vars (skip async macro)', () => {
      const win = getFakeWindow();
      const urlReplacements = installUrlReplacementsServiceForDoc(win.ampdoc);
      urlReplacements.ampdoc.win.performance.timing.loadEventStart = 109;
      const collectVars = {};
      const expanded = urlReplacements.expandSync(
        'r=RANDOM&c=CONST&f=FUNCT(hello,world)&a=b&d=PROM&e=PAGE_LOAD_TIME',
        {
          'CONST': 'ABC',
          'FUNCT': function(a, b) { return a + b; },
          // Will ignore promise based result and instead insert empty string.
          'PROM': function() { return Promise.resolve('boo'); },
        }, collectVars);
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
      const urlReplacements = installUrlReplacementsServiceForDoc(win.ampdoc);
      let expanded = urlReplacements.expandSync(
          'PROTOCOL://example.com/?r=RANDOM', {
            'PROTOCOL': 'abc',
          });
      expect(expanded).to.equal('PROTOCOL://example.com/?r=RANDOM');
      expanded = urlReplacements.expandSync(
          'FUNCT://example.com/?r=RANDOM', {
            'FUNCT': function() { return 'abc'; },
          });
      expect(expanded).to.equal('FUNCT://example.com/?r=RANDOM');
    });

    it('should reject javascript protocol', () => {
      const win = getFakeWindow();
      const urlReplacements = installUrlReplacementsServiceForDoc(win.ampdoc);
      expect(() => {
        urlReplacements.expandSync(`javascript://example.com/?r=RANDOM`);
      }).to.throw('Illegal javascript');
    });
  });

  it('should expand sync and respect white list', () => {
    const win = getFakeWindow();
    const urlReplacements = installUrlReplacementsServiceForDoc(win.ampdoc);
    const expanded = urlReplacements.expandSync(
      'r=RANDOM&c=CONST&f=FUNCT(hello,world)&a=b&d=PROM&e=PAGE_LOAD_TIME',
      {
        'CONST': 'ABC',
        'FUNCT': () => {
          throw Error('Should not be called');
        },
      }, undefined, {
        'CONST': true,
      });
    expect(expanded).to.equal('r=RANDOM&c=ABC&f=FUNCT(hello,world)' +
        '&a=b&d=PROM&e=PAGE_LOAD_TIME');
  });

  describe('access values', () => {

    let accessService;
    let accessServiceMock;

    beforeEach(() => {
      accessService = {
        getAccessReaderId: () => {},
        getAuthdataField: () => {},
      };
      accessServiceMock = sandbox.mock(accessService);
    });

    afterEach(() => {
      accessServiceMock.verify();
    });

    function expandAsync(url, opt_disabled) {
      return createIframePromise().then(iframe => {
        iframe.doc.title = 'Pixel Test';
        const link = iframe.doc.createElement('link');
        link.setAttribute('href', 'https://pinterest.com/pin1');
        link.setAttribute('rel', 'canonical');
        iframe.doc.head.appendChild(link);

        const replacements = urlReplacementsForDoc(iframe.ampdoc);
        replacements.getVariableSource().getAccessService_ = () => {
          if (opt_disabled) {
            return Promise.resolve(null);
          }
          return Promise.resolve(accessService);
        };
        return replacements.expandAsync(url);
      });
    }

    it('should replace ACCESS_READER_ID', () => {
      accessServiceMock.expects('getAccessReaderId')
          .returns(Promise.resolve('reader1'))
          .once();
      return expandAsync('?a=ACCESS_READER_ID') .then(res => {
        expect(res).to.match(/a=reader1/);
        expect(userErrorStub.callCount).to.equal(0);
      });
    });

    it('should replace AUTHDATA', () => {
      accessServiceMock.expects('getAuthdataField')
          .withExactArgs('field1')
          .returns(Promise.resolve('value1'))
          .once();
      return expandAsync('?a=AUTHDATA(field1)').then(res => {
        expect(res).to.match(/a=value1/);
        expect(userErrorStub.callCount).to.equal(0);
      });
    });

    it('should report error if not available', () => {
      accessServiceMock.expects('getAccessReaderId')
          .never();
      return expandAsync('?a=ACCESS_READER_ID;', /* disabled */ true)
          .then(res => {
            expect(res).to.match(/a=;/);
            expect(userErrorStub.callCount).to.equal(1);
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
      win.location = parseUrl('https://example.com/base?foo=bar&bar=abc');
      urlReplacements = installUrlReplacementsServiceForDoc(win.ampdoc);
      toggleExperiment(win, 'link-url-replace', true);
    });

    it('should replace href', () => {
      a.href = 'https://example.com/link?out=QUERY_PARAM(foo)';
      a.setAttribute('data-amp-replace', 'QUERY_PARAM');
      urlReplacements.maybeExpandLink(a);
      expect(a.href).to.equal('https://example.com/link?out=bar');
    });

    it('should replace href 2x', () => {
      a.href = 'https://example.com/link?out=QUERY_PARAM(foo)';
      a.setAttribute('data-amp-replace', 'QUERY_PARAM');
      urlReplacements.maybeExpandLink(a);
      expect(a.href).to.equal('https://example.com/link?out=bar');
      urlReplacements.maybeExpandLink(a);
      expect(a.href).to.equal('https://example.com/link?out=bar');
    });

    it('should not do anything with experiment off', () => {
      toggleExperiment(win, 'link-url-replace', false);
      a.href = 'https://example.com/link?out=QUERY_PARAM(foo)';
      a.setAttribute('data-amp-replace', 'QUERY_PARAM');
      urlReplacements.maybeExpandLink(a);
      expect(a.href).to.equal('https://example.com/link?out=QUERY_PARAM(foo)');
    });

    it('should replace href 2', () => {
      a.href = 'https://example.com/link?out=QUERY_PARAM(foo)&' +
          'out2=QUERY_PARAM(bar)';
      a.setAttribute('data-amp-replace', 'QUERY_PARAM');
      urlReplacements.maybeExpandLink(a);
      expect(a.href).to.equal('https://example.com/link?out=bar&out2=abc');
    });

    it('has nothing to replace', () => {
      a.href = 'https://example.com/link';
      a.setAttribute('data-amp-replace', 'QUERY_PARAM');
      urlReplacements.maybeExpandLink(a);
      expect(a.href).to.equal('https://example.com/link');
    });

    it('should not replace without user whitelisting', () => {
      a.href = 'https://example.com/link?out=QUERY_PARAM(foo)';
      urlReplacements.maybeExpandLink(a);
      expect(a.href).to.equal('https://example.com/link?out=QUERY_PARAM(foo)');
    });

    it('should not replace without user whitelisting 2', () => {
      a.href = 'https://example.com/link?out=QUERY_PARAM(foo)';
      a.setAttribute('data-amp-replace', 'ABC');
      urlReplacements.maybeExpandLink(a);
      expect(a.href).to.equal('https://example.com/link?out=QUERY_PARAM(foo)');
    });

    it('should not replace unwhitelisted fields', () => {
      a.href = 'https://example.com/link?out=RANDOM';
      a.setAttribute('data-amp-replace', 'RANDOM');
      urlReplacements.maybeExpandLink(a);
      expect(a.href).to.equal('https://example.com/link?out=RANDOM');
    });

    it('should replace with canonical origin', () => {
      a.href = 'https://canonical.com/link?out=QUERY_PARAM(foo)';
      a.setAttribute('data-amp-replace', 'QUERY_PARAM');
      urlReplacements.maybeExpandLink(a);
      expect(a.href).to.equal('https://canonical.com/link?out=bar');
    });

    it('should not replace to different origin', () => {
      a.href = 'https://example2.com/link?out=QUERY_PARAM(foo)';
      a.setAttribute('data-amp-replace', 'QUERY_PARAM');
      urlReplacements.maybeExpandLink(a);
      expect(a.href).to.equal(
          'https://example2.com/link?out=QUERY_PARAM(foo)');
    });

    it('should replace CID', () => {
      a.href = 'https://canonical.com/link?out=QUERY_PARAM(foo)&c=CLIENT_ID(abc)';
      a.setAttribute('data-amp-replace', 'QUERY_PARAM,CLIENT_ID');
      // No replacement without previous async replacement
      urlReplacements.maybeExpandLink(a);
      expect(a.href).to.equal(
            'https://canonical.com/link?out=bar&c=');
      // Get a cid, then proceed.
      return urlReplacements.expandAsync('CLIENT_ID(abc)').then(() => {
        urlReplacements.maybeExpandLink(a);
        expect(a.href).to.equal(
            'https://canonical.com/link?out=bar&c=test-cid(abc)');
      });
    });
  });

  describe('Expanding String', () => {
    it('should not reject protocol changes with expandStringSync', () => {
      const win = getFakeWindow();
      const urlReplacements = installUrlReplacementsServiceForDoc(win.ampdoc);
      let expanded = urlReplacements.expandStringSync(
          'PROTOCOL://example.com/?r=RANDOM', {
            'PROTOCOL': 'abc',
          });
      expect(expanded).to.match(/abc:\/\/example\.com\/\?r=(\d+(\.\d+)?)$/);
      expanded = urlReplacements.expandStringSync(
          'FUNCT://example.com/?r=RANDOM', {
            'FUNCT': function() { return 'abc'; },
          });
      expect(expanded).to.match(/abc:\/\/example\.com\/\?r=(\d+(\.\d+)?)$/);
    });

    it('should not check protocol changes with expandStringAsync', () => {
      const win = getFakeWindow();
      const urlReplacements = installUrlReplacementsServiceForDoc(win.ampdoc);
      return urlReplacements.expandStringAsync(
          'RANDOM:X:Y', {
            'RANDOM': Promise.resolve('abc'),
          }).then(expanded => {
            expect(expanded).to.equal('abc:X:Y');
          });
    });
  });
});
