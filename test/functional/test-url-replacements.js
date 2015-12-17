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

  function expand(url, withCid) {
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
      return replacements.expand(url);
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
    replacements.set_('FN', (data, one) => one);
    expect(replacements.expand('?a=FN(xyz)')).to.eventually.equal('?a=xyz');
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
});
