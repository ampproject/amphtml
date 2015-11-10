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
import {installPixel} from '../../builtins/amp-pixel';
import {parseQueryString, parseUrl} from '../../src/url';


describe('amp-pixel', () => {

  function getPixel(src) {
    return createIframePromise().then(iframe => {
      installPixel(iframe.win);
      const p = iframe.doc.createElement('amp-pixel');
      p.setAttribute('src', src);
      iframe.doc.title = 'Pixel Test';
      const link = iframe.doc.createElement('link');
      link.setAttribute('href', 'https://pinterest.com/pin1');
      link.setAttribute('rel', 'canonical');
      iframe.doc.head.appendChild(link);
      return iframe.addElement(p);
    });
  }

  it('should load a pixel', () => {
    return getPixel(
        'https://pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=1?'
        ).then(p => {
          expect(p.querySelector('img')).to.not.be.null;
          expect(p.children[0].src).to.equal(
              'https://pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=1?');
          expect(p.getAttribute('aria-hidden')).to.equal('true');
        });
  });

  it('should load a pixel with protocol relative URL', () => {
    return getPixel(
        '//pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=1?'
        ).then(p => {
          expect(p.querySelector('img')).to.not.be.null;
          expect(p.children[0].src).to.equal(
              'http://pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=1?');
        });
  });

  it('replace RANDOM', () => {
    return getPixel(
        'https://pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=RANDOM?'
        ).then(p => {
          expect(p.querySelector('img')).to.not.be.null;
          expect(p.children[0].src).to.match(/ord=(\d\.\d+)\?$/);
        });
  });

  it('replace CANONICAL_URL', () => {
    return getPixel(
        'https://foo.com?href=CANONICAL_URL'
        ).then(p => {
          expect(p.querySelector('img')).to.not.be.null;
          expect(p.children[0].src).to.equal(
              'https://foo.com/?href=https%3A%2F%2Fpinterest.com%2Fpin1');
        });
  });

  it('replace CANONICAL_HOST', () => {
    return getPixel(
        'https://foo.com?host=CANONICAL_HOST'
        ).then(p => {
          expect(p.querySelector('img')).to.not.be.null;
          expect(p.children[0].src).to.equal(
              'https://foo.com/?host=pinterest.com');
        });
  });

  it('replace CANONICAL_PATH', () => {
    return getPixel(
        'https://foo.com?path=CANONICAL_PATH'
        ).then(p => {
          expect(p.querySelector('img')).to.not.be.null;
          expect(p.children[0].src).to.equal(
              'https://foo.com/?path=%2Fpin1');
        });
  });

  it('replace DOCUMENT_REFERRER', () => {
    return getPixel(
        'https://foo.com?ref=DOCUMENT_REFERRER'
        ).then(p => {
          expect(p.querySelector('img')).to.not.be.null;
          expect(p.children[0].src).to.equal(
              'https://foo.com/?ref=' +
              'http%3A%2F%2Flocalhost%3A9876%2Fcontext.html');
        });
  });

  it('replace TITLE', () => {
    return getPixel(
        'https://foo.com?title=TITLE'
        ).then(p => {
          expect(p.querySelector('img')).to.not.be.null;
          expect(p.children[0].src).to.equal(
              'https://foo.com/?title=Pixel%20Test');
        });
  });

  it('replace AMPDOC_URL', () => {
    return getPixel(
        'https://foo.com?ref=AMPDOC_URL'
        ).then(p => {
          expect(p.querySelector('img')).to.not.be.null;
          const query = parseQueryString(parseUrl(p.children[0].src).search);
          expect(query['ref']).to.not.equal('$AMPDOC_URL');
        });
  });

  it('replace AMPDOC_HOST', () => {
    return getPixel(
        'https://foo.com?ref=AMPDOC_HOST'
        ).then(p => {
          expect(p.querySelector('img')).to.not.be.null;
          const query = parseQueryString(parseUrl(p.children[0].src).search);
          expect(query['ref']).to.not.equal('$AMPDOC_HOST');
        });
  });

  it('replace $CANONICAL_URL', () => {
    return getPixel(
        'https://foo.com?href=$CANONICAL_URL'
        ).then(p => {
          expect(p.querySelector('img')).to.not.be.null;
          expect(p.children[0].src).to.equal(
              'https://foo.com/?href=https%3A%2F%2Fpinterest.com%2Fpin1');
        });
  });

  it('replace several substitutions', () => {
    return getPixel(
        'https://foo.com/?a=UNKNOWN&href=CANONICAL_URL&title=TITLE'
        ).then(p => {
          expect(p.querySelector('img')).to.not.be.null;
          expect(p.children[0].src).to.equal(
              'https://foo.com/?a=UNKNOWN' +
              '&href=https%3A%2F%2Fpinterest.com%2Fpin1' +
              '&title=Pixel%20Test');
        });
  });

  it('should throw for invalid URL', () => {
    return getPixel(
        'http://pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=RANDOM?')
        .should.be.rejectedWith(/src attribute must start with/);
  });
});
