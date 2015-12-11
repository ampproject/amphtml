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


describe('UrlReplacements', () => {

  function createTestFrame() {
    return createIframePromise().then(iframe => {
      iframe.doc.title = 'Pixel Test';
      const link = iframe.doc.createElement('link');
      link.setAttribute('href', 'https://pinterest.com/pin1');
      link.setAttribute('rel', 'canonical');
      iframe.doc.head.appendChild(link);
      return urlReplacementsFor(iframe.win);
    });
  }

  function expand(url) {
    return createTestFrame().then(replacements => {
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
    expect(replacements.expand('?a=ONE')).to.equal('?a=a');

    replacements.set_('ONE', () => 'b');
    expect(replacements.expand('?a=ONE')).to.equal('?a=b');

    replacements.set_('TWO', () => 'b');
    expect(replacements.expand('?b=TWO')).to.equal('?b=b');
  });

  it('should allow direct value access', () => {
    return createTestFrame().then(replacements => {
      expect(replacements.get('RANDOM')).to.match(/\d\.\d+/);
      expect(replacements.get('CANONICAL_URL')).to.equal(
          'https://pinterest.com/pin1');
      expect(replacements.get('CANONICAL_HOST')).to.equal('pinterest.com');
      expect(replacements.get('CANONICAL_PATH')).to.equal('/pin1');
      expect(replacements.get('DOCUMENT_REFERRER')).to.equal(
          'http://localhost:9876/context.html');
      expect(replacements.get('TITLE')).to.equal('Pixel Test');
      expect(replacements.get('AMPDOC_URL')).to.not.match(/AMPDOC_URL/);
      expect(replacements.get('AMPDOC_HOST')).to.not.match(/AMPDOC_HOST/);
      expect(replacements.get('PAGE_VIEW_ID')).to.match(/\d+/);
      expect(replacements.get('UNKNOWN')).to.equal('');
    });
  });
});
