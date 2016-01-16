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

import {createIframePromise} from '../../testing/iframe';
import {urlReplacementsFor} from '../../src/url-replacements';
import {markElementScheduledForTesting} from '../../src/service';
import {installCidService} from '../../src/service/cid-impl';
import {setCookie} from '../../src/cookies';


describe('UrlReplacements', () => {

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
    setCookie(window, 'url-xyz', 'cid-for-xyz');
    return expand('?a=CLIENT_ID(url-abc)&b=CLIENT_ID(url-xyz)', true)
        .then(res => {
          expect(res).to.equal('?a=cid-for-abc&b=cid-for-xyz');
        });
  });

  it('should replace TIMESTAMP', () => {
    return expand('?ts=TIMESTAMP').then(res => {
      expect(res).to.match(/ts=\d+/);
    });
  });

  it('should replace TIMEZONE', () => {
    return expand('?tz=TIMEZONE').then(res => {
      expect(res).to.match(/tz=\d+/);
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
});
