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
import {urlReplacementsFor} from '../../src/url-replacements';
import {markElementScheduledForTesting} from '../../src/custom-element';
import {installCidService} from '../../extensions/amp-analytics/0.1/cid-impl';
import {installCryptoService,} from
    '../../extensions/amp-analytics/0.1/crypto-impl';
import {installViewerService} from '../../src/service/viewer-impl';
import {installActivityService,} from
    '../../extensions/amp-analytics/0.1/activity-impl';
import {
  installUrlReplacementsService,
} from '../../src/service/url-replacements-impl';
import {getService} from '../../src/service';
import {setCookie} from '../../src/cookies';
import {parseUrl} from '../../src/url';

import * as sinon from 'sinon';

describe('UrlReplacements', () => {

  let sandbox;
  let loadObservable;
  let replacements;
  let viewerService;
  let userErrorStub;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    userErrorStub = sandbox.stub(user, 'error');
  });

  afterEach(() => {
    sandbox.restore();
  });

  function getReplacements(withCid, withActivity, withVariant) {
    return createIframePromise().then(iframe => {
      iframe.doc.title = 'Pixel Test';
      const link = iframe.doc.createElement('link');
      link.setAttribute('href', 'https://pinterest.com:8080/pin1');
      link.setAttribute('rel', 'canonical');
      iframe.doc.head.appendChild(link);
      if (withCid) {
        markElementScheduledForTesting(iframe.win, 'amp-analytics');
        installCidService(iframe.win);
        installCryptoService(iframe.win);
      }
      if (withActivity) {
        markElementScheduledForTesting(iframe.win, 'amp-analytics');
        installActivityService(iframe.win);
      }
      if (withVariant) {
        markElementScheduledForTesting(iframe.win, 'amp-experiment');
        getService(iframe.win, 'variant', () => Promise.resolve({
          'x1': 'v1',
          'x2': null,
        }));
      }
      viewerService = installViewerService(iframe.win);
      installUrlReplacementsService(iframe.win);
      replacements = urlReplacementsFor(iframe.win);
      return replacements;
    });
  }

  function expand(url, withCid, withActivity, opt_bindings) {
    return getReplacements(withCid, withActivity)
        .then(replacements => replacements.expand(url, opt_bindings));
  }

  function expandWithVariant(url) {
    return getReplacements(false, false, true)
        .then(replacements => replacements.expand(url));
  }

  function getFakeWindow() {
    loadObservable = new Observable();
    const win = {
      addEventListener: function(type, callback) {
        loadObservable.add(callback);
      },
      complete: false,
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
    };
    return win;
  }

  it('should replace RANDOM', () => {
    return expand('ord=RANDOM?').then(res => {
      expect(res).to.match(/ord=(\d\.\d+)\?$/);
    });
  });

  it('should replace CANONICAL_URL', () => {
    return expand('?href=CANONICAL_URL').then(res => {
      expect(res).to.equal('?href=https%3A%2F%2Fpinterest.com%3A8080%2Fpin1');
    });
  });

  it('should replace CANONICAL_HOST', () => {
    return expand('?host=CANONICAL_HOST').then(res => {
      expect(res).to.equal('?host=pinterest.com%3A8080');
    });
  });

  it('should replace CANONICAL_HOSTNAME', () => {
    return expand('?host=CANONICAL_HOSTNAME').then(res => {
      expect(res).to.equal('?host=pinterest.com');
    });
  });

  it('should replace CANONICAL_PATH', () => {
    return expand('?path=CANONICAL_PATH').then(res => {
      expect(res).to.equal('?path=%2Fpin1');
    });
  });

  it('should replace DOCUMENT_REFERRER', () => {
    return expand('?ref=DOCUMENT_REFERRER').then(res => {
      expect(res).to.equal('?ref=http%3A%2F%2Flocalhost%3A9876%2Fcontext.html');
    });
  });

  it('should replace TITLE', () => {
    return expand('?title=TITLE').then(res => {
      expect(res).to.equal('?title=Pixel%20Test');
    });
  });

  it('should replace AMPDOC_URL', () => {
    return expand('?ref=AMPDOC_URL').then(res => {
      expect(res).to.not.match(/AMPDOC_URL/);
    });
  });

  it('should replace AMPDOC_HOST', () => {
    return expand('?ref=AMPDOC_HOST').then(res => {
      expect(res).to.not.match(/AMPDOC_HOST/);
    });
  });

  it('should replace AMPDOC_HOSTNAME', () => {
    return expand('?ref=AMPDOC_HOSTNAME').then(res => {
      expect(res).to.not.match(/AMPDOC_HOSTNAME/);
    });
  });

  it('should replace SOURCE_URL and _HOST', () => {
    return expand('?url=SOURCE_URL&host=SOURCE_HOST').then(res => {
      expect(res).to.not.match(/SOURCE_URL/);
      expect(res).to.not.match(/SOURCE_HOST/);
    });
  });

  it('should replace SOURCE_URL and _HOSTNAME', () => {
    return expand('?url=SOURCE_URL&host=SOURCE_HOSTNAME').then(res => {
      expect(res).to.not.match(/SOURCE_URL/);
      expect(res).to.not.match(/SOURCE_HOSTNAME/);
    });
  });

  it('should replace SOURCE_PATH', () => {
    return expand('?path=SOURCE_PATH').then(res => {
      expect(res).to.not.match(/SOURCE_PATH/);
    });
  });

  it('should replace PAGE_VIEW_ID', () => {
    return expand('?pid=PAGE_VIEW_ID').then(res => {
      expect(res).to.match(/pid=\d+/);
    });
  });

  it('should replace CLIENT_ID', () => {
    setCookie(window, 'url-abc', 'cid-for-abc');
    // Make sure cookie does not exist
    setCookie(window, 'url-xyz', '');
    return expand('?a=CLIENT_ID(url-abc)&b=CLIENT_ID(url-xyz)', true)
        .then(res => {
          expect(res).to.match(/^\?a=cid-for-abc\&b=amp-([a-zA-Z0-9_-]+){10,}/);
        });
  });

  it('should replace VARIANT', () => {
    return expect(
        expandWithVariant('?x1=VARIANT(x1)&x2=VARIANT(x2)&x3=VARIANT(x3)'))
            .to.eventually.equal('?x1=v1&x2=none&x3=');
  });

  it('should replace VARIANT with empty string if ' +
      'amp-experiment is not configured ', () => {
    return expect(expand('?x1=VARIANT(x1)&x2=VARIANT(x2)&x3=VARIANT(x3)'))
        .to.eventually.equal('?x1=&x2=&x3=');
  });

  it('should replace VARIANTS', () => {
    return expect(
        expandWithVariant('?VARIANTS'))
        .to.eventually.equal('?x1.v1!x2.none');
  });

  it('should replace VARIANTS with empty string if ' +
      'amp-experiment is not configured ', () => {
    return expect(expand('?VARIANTS')).to.eventually.equal('?');
  });

  it('should replace TIMESTAMP', () => {
    return expand('?ts=TIMESTAMP').then(res => {
      expect(res).to.match(/ts=\d+/);
    });
  });

  it('should replace TIMEZONE', () => {
    return expand('?tz=TIMEZONE').then(res => {
      expect(res).to.match(/tz=-?\d+/);
    });
  });

  it('should replace SCROLL_TOP', () => {
    return expand('?scrollTop=SCROLL_TOP').then(res => {
      expect(res).to.match(/scrollTop=\d+/);
    });
  });

  it('should replace SCROLL_LEFT', () => {
    return expand('?scrollLeft=SCROLL_LEFT').then(res => {
      expect(res).to.match(/scrollLeft=\d+/);
    });
  });

  it('should replace SCROLL_HEIGHT', () => {
    return expand('?scrollHeight=SCROLL_HEIGHT').then(res => {
      expect(res).to.match(/scrollHeight=\d+/);
    });
  });

  it('should replace SCREEN_WIDTH', () => {
    return expand('?sw=SCREEN_WIDTH').then(res => {
      expect(res).to.match(/sw=\d+/);
    });
  });

  it('should replace SCREEN_HEIGHT', () => {
    return expand('?sh=SCREEN_HEIGHT').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace VIEWPORT_WIDTH', () => {
    return expand('?vw=VIEWPORT_WIDTH').then(res => {
      expect(res).to.match(/vw=\d+/);
    });
  });

  it('should replace VIEWPORT_HEIGHT', () => {
    return expand('?vh=VIEWPORT_HEIGHT').then(res => {
      expect(res).to.match(/vh=\d+/);
    });
  });

  it('should replace PAGE_LOAD_TIME', () => {
    return expand('?sh=PAGE_LOAD_TIME').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace PAGE_LOAD_TIME if timing info is not available', () => {
    const win = getFakeWindow();
    win.complete = true;
    return installUrlReplacementsService(win).expand('?sh=PAGE_LOAD_TIME&s')
        .then(res => {
          expect(res).to.match(/sh=&s/);
        });
  });

  it('should replace PAGE_LOAD_TIME if available within a delay', () => {
    const win = getFakeWindow();
    const urlReplacements = installUrlReplacementsService(win);
    const validMetric = urlReplacements.expand('?sh=PAGE_LOAD_TIME&s');
    urlReplacements.win_.performance.timing.loadEventStart = 109;
    loadObservable.fire({
      target: win,
    }); // Mimics load event.
    return validMetric.then(res => {
      expect(res).to.match(/sh=9&s/);
    });
  });

  it('should replace NAV_REDIRECT_COUNT', () => {
    return expand('?sh=NAV_REDIRECT_COUNT').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace NAV_TIMING', () => {
    return expand('?a=NAV_TIMING(navigationStart)' +
        '&b=NAV_TIMING(navigationStart,responseStart)').then(res => {
          expect(res).to.match(/a=\d+&b=\d+/);
        });
  });

  it('should replace NAV_TIMING when attribute names are invalid', () => {
    return expand('?a=NAV_TIMING(invalid)&b=NAV_TIMING(invalid,invalid)' +
        '&c=NAV_TIMING(navigationStart,invalid)' +
        '&d=NAV_TIMING(invalid,responseStart)').then(res => {
          expect(res).to.match(/a=&b=&c=&d=/);
        });
  });

  it('should replace NAV_TYPE', () => {
    return expand('?sh=NAV_TYPE').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace DOMAIN_LOOKUP_TIME', () => {
    return expand('?sh=DOMAIN_LOOKUP_TIME').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace TCP_CONNECT_TIME', () => {
    return expand('?sh=TCP_CONNECT_TIME').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace SERVER_RESPONSE_TIME', () => {
    return expand('?sh=SERVER_RESPONSE_TIME').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace PAGE_DOWNLOAD_TIME', () => {
    return expand('?sh=PAGE_DOWNLOAD_TIME').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace REDIRECT_TIME', () => {
    return expand('?sh=REDIRECT_TIME').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace DOM_INTERACTIVE_TIME', () => {
    return expand('?sh=DOM_INTERACTIVE_TIME').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace CONTENT_LOAD_TIME', () => {
    return expand('?sh=CONTENT_LOAD_TIME').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace AVAILABLE_SCREEN_HEIGHT', () => {
    return expand('?sh=AVAILABLE_SCREEN_HEIGHT').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace AVAILABLE_SCREEN_WIDTH', () => {
    return expand('?sh=AVAILABLE_SCREEN_WIDTH').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace SCREEN_COLOR_DEPTH', () => {
    return expand('?sh=SCREEN_COLOR_DEPTH').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace BROWSER_LANGUAGE', () => {
    return expand('?sh=BROWSER_LANGUAGE').then(res => {
      expect(res).to.match(/sh=\w+/);
    });
  });

  it('should replace VIEWER with origin', () => {
    return getReplacements().then(replacements => {
      sandbox.stub(viewerService, 'getViewerOrigin').returns(
          Promise.resolve('https://www.google.com'));
      return replacements.expand('?sh=VIEWER').then(res => {
        expect(res).to.equal('?sh=https%3A%2F%2Fwww.google.com');
      });
    });
  });

  it('should replace VIEWER with empty string', () => {
    return getReplacements().then(replacements => {
      sandbox.stub(viewerService, 'getViewerOrigin').returns(
          Promise.resolve(''));
      return replacements.expand('?sh=VIEWER').then(res => {
        expect(res).to.equal('?sh=');
      });
    });
  });

  it('should replace TOTAL_ENGAGED_TIME', () => {
    return expand('?sh=TOTAL_ENGAGED_TIME', false, true).then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace AMP_VERSION', () => {
    return expand('?sh=AMP_VERSION').then(res => {
      expect(res).to.equal('?sh=%24internalRuntimeVersion%24');
    });
  });

  it('should accept $expressions', () => {
    return expand('?href=$CANONICAL_URL').then(res => {
      expect(res).to.equal('?href=https%3A%2F%2Fpinterest.com%3A8080%2Fpin1');
    });
  });

  it('should ignore unknown substitutions', () => {
    return expand('?a=UNKNOWN').then(res => {
      expect(res).to.equal('?a=UNKNOWN');
    });
  });

  it('should replace several substitutions', () => {
    return expand('?a=UNKNOWN&href=CANONICAL_URL&title=TITLE').then(res => {
      expect(res).to.equal('?a=UNKNOWN' +
          '&href=https%3A%2F%2Fpinterest.com%3A8080%2Fpin1' +
          '&title=Pixel%20Test');
    });
  });

  it('should replace new substitutions', () => {
    const replacements = installUrlReplacementsService(window);
    replacements.set_('ONE', () => 'a');
    expect(replacements.expand('?a=ONE')).to.eventually.equal('?a=a');
    replacements.set_('ONE', () => 'b');
    replacements.set_('TWO', () => 'b');
    return expect(replacements.expand('?a=ONE&b=TWO'))
        .to.eventually.equal('?a=b&b=b');
  });

  it('should report errors & replace them with empty string (sync)', () => {
    const clock = sandbox.useFakeTimers();
    const replacements = installUrlReplacementsService(window);
    replacements.set_('ONE', () => {
      throw new Error('boom');
    });
    const p = expect(replacements.expand('?a=ONE')).to.eventually.equal('?a=');
    expect(() => {
      clock.tick(1);
    }).to.throw(/boom/);
    return p;
  });

  it('should report errors & replace them with empty string (promise)', () => {
    const clock = sandbox.useFakeTimers();
    const replacements = installUrlReplacementsService(window);
    replacements.set_('ONE', () => {
      return Promise.reject(new Error('boom'));
    });
    return expect(replacements.expand('?a=ONE')).to.eventually.equal('?a=')
        .then(() => {
          expect(() => {
            clock.tick(1);
          }).to.throw(/boom/);
        });
  });

  it('should support positional arguments', () => {
    const replacements = installUrlReplacementsService(window);
    replacements.set_('FN', one => one);
    return expect(replacements.expand('?a=FN(xyz1)')).to
        .eventually.equal('?a=xyz1');
  });

  it('should support multiple positional arguments', () => {
    const replacements = installUrlReplacementsService(window);
    replacements.set_('FN', (one, two) => {
      return one + '-' + two;
    });
    return expect(replacements.expand('?a=FN(xyz,abc)')).to
        .eventually.equal('?a=xyz-abc');
  });

  it('should support multiple positional arguments with dots', () => {
    const replacements = installUrlReplacementsService(window);
    replacements.set_('FN', (one, two) => {
      return one + '-' + two;
    });
    return expect(replacements.expand('?a=FN(xy.z,ab.c)')).to
        .eventually.equal('?a=xy.z-ab.c');
  });

  it('should support promises as replacements', () => {
    const replacements = installUrlReplacementsService(window);
    replacements.set_('P1', () => Promise.resolve('abc '));
    replacements.set_('P2', () => Promise.resolve('xyz'));
    replacements.set_('P3', () => Promise.resolve('123'));
    replacements.set_('OTHER', () => 'foo');
    return expect(replacements.expand('?a=P1&b=P2&c=P3&d=OTHER'))
        .to.eventually.equal('?a=abc%20&b=xyz&c=123&d=foo');
  });

  it('should override an existing binding', () => {
    return expand('ord=RANDOM?', false, false, {'RANDOM': 'abc'}).then(res => {
      expect(res).to.match(/ord=abc\?$/);
    });
  });

  it('should add an additional binding', () => {
    return expand('rid=NONSTANDARD?', false, false, {
      'NONSTANDARD': 'abc',
    }).then(
        res => {
          expect(res).to.match(/rid=abc\?$/);
        });
  });

  it('should NOT overwrite the cached expression with new bindings', () => {
    return expand('rid=NONSTANDARD?', false, false, {
      'NONSTANDARD': 'abc',
    }).then(
      res => {
        expect(res).to.match(/rid=abc\?$/);
        return expand('rid=NONSTANDARD?').then(res => {
          expect(res).to.match(/rid=NONSTANDARD\?$/);
        });
      });
  });

  it('should expand bindings as functions', () => {
    return expand('rid=FUNC(abc)?', false, false, {
      'FUNC': value => 'func_' + value,
    }).then(res => {
      expect(res).to.match(/rid=func_abc\?$/);
    });
  });

  it('should expand bindings as functions with promise', () => {
    return expand('rid=FUNC(abc)?', false, false, {
      'FUNC': value => Promise.resolve('func_' + value),
    }).then(res => {
      expect(res).to.match(/rid=func_abc\?$/);
    });
  });

  it('should expand null as empty string', () => {
    return expand('v=VALUE', false, false, {
      'VALUE': null,
    }).then(res => {
      expect(res).to.equal('v=');
    });
  });

  it('should expand undefined as empty string', () => {
    return expand('v=VALUE', false, false, {
      'VALUE': undefined,
    }).then(res => {
      expect(res).to.equal('v=');
    });
  });

  it('should expand empty string as empty string', () => {
    return expand('v=VALUE', false, false, {
      'VALUE': '',
    }).then(res => {
      expect(res).to.equal('v=');
    });
  });

  it('should expand zero as zero', () => {
    return expand('v=VALUE', false, false, {
      'VALUE': 0,
    }).then(res => {
      expect(res).to.equal('v=0');
    });
  });

  it('should expand false as false', () => {
    return expand('v=VALUE', false, false, {
      'VALUE': false,
    }).then(res => {
      expect(res).to.equal('v=false');
    });
  });

  it('should resolve sub-included bindings', () => {
    // RANDOM is a standard property and we add RANDOM_OTHER.
    return expand('r=RANDOM&ro=RANDOM_OTHER?', false, false, {
      'RANDOM_OTHER': 'ABC',
    }).then(res => {
      expect(res).to.match(/r=(\d\.\d+)&ro=ABC\?$/);
    });
  });

  it('should expand multiple vars', () => {
    return expand('a=VALUEA&b=VALUEB?', false, false, {
      'VALUEA': 'aaa',
      'VALUEB': 'bbb',
    }).then(res => {
      expect(res).to.match(/a=aaa&b=bbb\?$/);
    });
  });

  it('should replace QUERY_PARAM with foo', () => {
    const win = getFakeWindow();
    win.location = parseUrl('https://example.com?query_string_param1=foo');
    return installUrlReplacementsService(win)
      .expand('?sh=QUERY_PARAM(query_string_param1)&s')
      .then(res => {
        expect(res).to.match(/sh=foo&s/);
      });
  });

  it('should replace QUERY_PARAM with ""', () => {
    const win = getFakeWindow();
    win.location = parseUrl('https://example.com');
    return installUrlReplacementsService(win)
      .expand('?sh=QUERY_PARAM(query_string_param1)&s')
      .then(res => {
        expect(res).to.match(/sh=&s/);
      });
  });

  it('should replace QUERY_PARAM with default_value', () => {
    const win = getFakeWindow();
    win.location = parseUrl('https://example.com');
    return installUrlReplacementsService(win)
      .expand('?sh=QUERY_PARAM(query_string_param1,default_value)&s')
      .then(res => {
        expect(res).to.match(/sh=default_value&s/);
      });
  });

  it('should collect vars', () => {
    const win = getFakeWindow();
    win.location = parseUrl('https://example.com?p1=foo');
    return installUrlReplacementsService(win)
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

    function expand(url, opt_disabled) {
      return createIframePromise().then(iframe => {
        iframe.doc.title = 'Pixel Test';
        const link = iframe.doc.createElement('link');
        link.setAttribute('href', 'https://pinterest.com/pin1');
        link.setAttribute('rel', 'canonical');
        iframe.doc.head.appendChild(link);

        const replacements = installUrlReplacementsService(iframe.win);
        replacements.getAccessService_ = () => {
          if (opt_disabled) {
            return Promise.resolve(null);
          }
          return Promise.resolve(accessService);
        };
        return replacements.expand(url);
      });
    }

    it('should replace ACCESS_READER_ID', () => {
      accessServiceMock.expects('getAccessReaderId')
          .returns(Promise.resolve('reader1'))
          .once();
      return expand('?a=ACCESS_READER_ID') .then(res => {
        expect(res).to.match(/a=reader1/);
        expect(userErrorStub.callCount).to.equal(0);
      });
    });

    it('should replace AUTHDATA', () => {
      accessServiceMock.expects('getAuthdataField')
          .withExactArgs('field1')
          .returns(Promise.resolve('value1'))
          .once();
      return expand('?a=AUTHDATA(field1)').then(res => {
        expect(res).to.match(/a=value1/);
        expect(userErrorStub.callCount).to.equal(0);
      });
    });

    it('should report error if not available', () => {
      accessServiceMock.expects('getAccessReaderId')
          .never();
      return expand('?a=ACCESS_READER_ID;', /* disabled */ true) .then(res => {
        expect(res).to.match(/a=;/);
        expect(userErrorStub.callCount).to.equal(1);
      });
    });
  });
});
