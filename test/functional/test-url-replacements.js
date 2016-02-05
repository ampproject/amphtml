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
import {urlReplacementsFor} from '../../src/url-replacements';
import {markElementScheduledForTesting} from '../../src/custom-element';
import {installCidService} from '../../src/service/cid-impl';
import {setCookie} from '../../src/cookies';


describe('UrlReplacements', () => {

  let loadObservable;
  afterEach(() => {
    loadObservable = null;
  });

  function expand(url, withCid, opt_bindings) {
    return createIframePromise().then(iframe => {
      iframe.doc.title = 'Pixel Test';
      const link = iframe.doc.createElement('link');
      link.setAttribute('href', 'https://pinterest.com/pin1');
      link.setAttribute('rel', 'canonical');
      iframe.doc.head.appendChild(link);
      if (withCid) {
        markElementScheduledForTesting(iframe.win, 'amp-analytics');
        installCidService(iframe.win);
      }

      const replacements = urlReplacementsFor(iframe.win);
      return replacements.expand(url, opt_bindings);
    });
  }

  function getFakeWindow() {
    loadObservable = new Observable();
    const win = {
      addEventListener: function(type, callback) {
        loadObservable.add(callback);
      },
      complete: false,
      Object: Object,
      performance: {
        timing: {
          navigationStart: 100,
          loadEventStart: 0
        }
      },
      removeEventListener: function(type, callback) {
        loadObservable.remove(callback);
      }
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
      expect(res).to.equal('?href=https%3A%2F%2Fpinterest.com%2Fpin1');
    });
  });

  it('should replace CANONICAL_HOST', () => {
    return expand('?host=CANONICAL_HOST').then(res => {
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

  it('should replace PAGE_LOAD_TIME', () => {
    return expand('?sh=PAGE_LOAD_TIME').then(res => {
      expect(res).to.match(/sh=\d+/);
    });
  });

  it('should replace PAGE_LOAD_TIME if timing info is not available', () => {
    const win = getFakeWindow();
    win.complete = true;
    return urlReplacementsFor(win).expand('?sh=PAGE_LOAD_TIME&s')
        .then(res => {
          expect(res).to.match(/sh=&s/);
        });
  });

  it('should replace PAGE_LOAD_TIME if available within a delay', () => {
    const win = getFakeWindow();
    const urlReplacements = urlReplacementsFor(win);
    const validMetric = urlReplacements.expand('?sh=PAGE_LOAD_TIME&s');
    urlReplacements.win_.performance.timing.loadEventStart = 109;
    loadObservable.fire(document.createEvent('Event')); // Mimics load event.
    return validMetric.then(res => {
      expect(res).to.match(/sh=9&s/);
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

  it('should accept $expressions', () => {
    return expand('?href=$CANONICAL_URL').then(res => {
      expect(res).to.equal('?href=https%3A%2F%2Fpinterest.com%2Fpin1');
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
          '&href=https%3A%2F%2Fpinterest.com%2Fpin1' +
          '&title=Pixel%20Test');
    });
  });

  it('should replace new substitutions', () => {
    const replacements = urlReplacementsFor(window);
    replacements.set_('ONE', () => 'a');
    expect(replacements.expand('?a=ONE')).to.eventually.equal('?a=a');
    replacements.set_('ONE', () => 'b');
    replacements.set_('TWO', () => 'b');
    return expect(replacements.expand('?a=ONE&b=TWO'))
        .to.eventually.equal('?a=b&b=b');
  });

  it('should support positional arguments', () => {
    const replacements = urlReplacementsFor(window);
    replacements.set_('FN', one => one);
    return expect(replacements.expand('?a=FN(xyz1)')).to
        .eventually.equal('?a=xyz1');
  });

  it('should support multiple positional arguments', () => {
    const replacements = urlReplacementsFor(window);
    replacements.set_('FN', (one, two) => {
      return one + '-' + two;
    });
    return expect(replacements.expand('?a=FN(xyz,abc)')).to
        .eventually.equal('?a=xyz-abc');
  });

  it('should support promises as replacements', () => {
    const replacements = urlReplacementsFor(window);
    replacements.set_('P1', () => Promise.resolve('abc '));
    replacements.set_('P2', () => Promise.resolve('xyz'));
    replacements.set_('P3', () => Promise.resolve('123'));
    replacements.set_('OTHER', () => 'foo');
    return expect(replacements.expand('?a=P1&b=P2&c=P3&d=OTHER'))
        .to.eventually.equal('?a=abc%20&b=xyz&c=123&d=foo');
  });

  it('should override an existing binding', () => {
    return expand('ord=RANDOM?', false, {'RANDOM': 'abc'}).then(res => {
      expect(res).to.match(/ord=abc\?$/);
    });
  });

  it('should add an additional binding', () => {
    return expand('rid=NONSTANDARD?', false, {'NONSTANDARD': 'abc'}).then(
        res => {
          expect(res).to.match(/rid=abc\?$/);
        });
  });

  it('should NOT overwrite the cached expression with new bindings', () => {
    return expand('rid=NONSTANDARD?', false, {'NONSTANDARD': 'abc'}).then(
      res => {
        expect(res).to.match(/rid=abc\?$/);
        return expand('rid=NONSTANDARD?').then(res => {
          expect(res).to.match(/rid=NONSTANDARD\?$/);
        });
      });
  });

  it('should expand bindings as functions', () => {
    return expand('rid=FUNC(abc)?', false, {
      'FUNC': value => 'func_' + value
    }).then(res => {
      expect(res).to.match(/rid=func_abc\?$/);
    });
  });

  it('should expand bindings as functions with promise', () => {
    return expand('rid=FUNC(abc)?', false, {
      'FUNC': value => Promise.resolve('func_' + value)
    }).then(res => {
      expect(res).to.match(/rid=func_abc\?$/);
    });
  });

  it('should expand null as empty string', () => {
    return expand('v=VALUE', false, {
      'VALUE': null
    }).then(res => {
      expect(res).to.equal('v=');
    });
  });

  it('should expand undefined as empty string', () => {
    return expand('v=VALUE', false, {
      'VALUE': undefined
    }).then(res => {
      expect(res).to.equal('v=');
    });
  });

  it('should expand empty string as empty string', () => {
    return expand('v=VALUE', false, {
      'VALUE': ''
    }).then(res => {
      expect(res).to.equal('v=');
    });
  });

  it('should expand zero as zero', () => {
    return expand('v=VALUE', false, {
      'VALUE': 0
    }).then(res => {
      expect(res).to.equal('v=0');
    });
  });

  it('should expand false as false', () => {
    return expand('v=VALUE', false, {
      'VALUE': false
    }).then(res => {
      expect(res).to.equal('v=false');
    });
  });

  it('should resolve sub-included bindings', () => {
    // RANDOM is a standard property and we add RANDOM_OTHER.
    return expand('r=RANDOM&ro=RANDOM_OTHER?', false, {'RANDOM_OTHER': 'ABC'})
        .then(res => {
          expect(res).to.match(/r=(\d\.\d+)&ro=ABC\?$/);
        });
  });

  it('should expand multiple vars', () => {
    return expand('a=VALUEA&b=VALUEB?', false, {
      'VALUEA': 'aaa',
      'VALUEB': 'bbb',
    }).then(res => {
      expect(res).to.match(/a=aaa&b=bbb\?$/);
    });
  });
});
