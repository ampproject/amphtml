/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {
  createIframePromise,
  doNotLoadExternalResourcesInTest,
} from '../../../../testing/iframe';
import '../amp-reddit';
import {adopt} from '../../../../src/runtime';
import {reddit} from '../../../../3p/reddit';

adopt(window);

describe('amp-reddit', () => {
  function getReddit(src, type) {
    return createIframePromise().then(iframe => {
      doNotLoadExternalResourcesInTest(iframe.win);
      const link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', 'https://foo.bar/baz');
      iframe.doc.head.appendChild(link);

      const ampReddit = iframe.doc.createElement('amp-reddit');
      ampReddit.setAttribute('height', 400);
      ampReddit.setAttribute('width', 400);
      ampReddit.setAttribute('data-src', src);
      ampReddit.setAttribute('data-embedtype', type);
      ampReddit.setAttribute('layout', 'responsive');

      return iframe.addElement(ampReddit);
    });
  }

  it('renders post iframe', () => {
    return getReddit('https://www.reddit.com/r/me_irl/comments/52rmir/me_irl/?ref=share&amp;ref_source=embed', 'post')
        .then(ampReddit => {
          const iframe = ampReddit.querySelector('iframe');
          expect(iframe).to.not.be.null;
          expect(iframe.tagName).to.equal('IFRAME');
          expect(iframe.getAttribute('width')).to.equal('400');
          expect(iframe.getAttribute('height')).to.equal('400');
        });
  });

  it('adds post embed', () => {
    return createIframePromise().then(iframe => {
      const div = document.createElement('div');
      div.setAttribute('id', 'c');
      iframe.doc.body.appendChild(div);

      reddit(iframe.win, {
        src: 'https://www.reddit.com/r/me_irl/comments/52rmir/me_irl/?ref=share&amp;ref_source=embed',
        embedtype: 'post',
        width: 400,
        height: 400,
      });

      const embedlyEmbed = iframe.doc.body.querySelector('.embedly-card');
      expect(embedlyEmbed).not.to.be.undefined;
    });
  });

  it('renders comment iframe', () => {
    return getReddit('https://www.reddit.com/r/sports/comments/54loj1/50_cents_awful_1st_pitch_given_a_historical/d8306kw', 'comment')
        .then(ampReddit => {
          const iframe = ampReddit.querySelector('iframe');
          expect(iframe).to.not.be.null;
          expect(iframe.tagName).to.equal('IFRAME');
          expect(iframe.getAttribute('width')).to.equal('400');
          expect(iframe.getAttribute('height')).to.equal('400');
        });
  });

  it('adds comment embed', () => {
    return createIframePromise().then(iframe => {
      const div = document.createElement('div');
      div.setAttribute('id', 'c');
      iframe.doc.body.appendChild(div);

      reddit(iframe.win, {
        src: 'https://www.reddit.com/r/sports/comments/54loj1/50_cents_awful_1st_pitch_given_a_historical/d8306kw',
        embedtype: 'comment',
        width: 400,
        height: 400,
      });

      const redditEmbed = iframe.doc.body.querySelector('.reddit-embed');
      expect(redditEmbed).not.to.be.undefined;
    });
  });

  it('requires data-src', () => {
    return getReddit('', 'post').should.eventually.be.rejectedWith(
      /The data-src attribute is required for/);
  });

  it('requires data-embedtype', () => {
    return getReddit('https://www.reddit.com/r/me_irl/comments/52rmir/me_irl/?ref=share&amp;ref_source=embed', '')
        .should.eventually.be.rejectedWith(
            /The data-embedtype attribute is required for/);
  });

});
