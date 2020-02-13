/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-izlesene';

describes.realWin(
  'amp-izlesene',
  {
    amp: {
      extensions: ['amp-izlesene'],
    },
  },
  env => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getIzlesene(videoId, opt_responsive) {
      const izlesene = doc.createElement('amp-izlesene');
      izlesene.setAttribute('data-videoid', videoId);
      izlesene.setAttribute('width', '111');
      izlesene.setAttribute('height', '222');
      if (opt_responsive) {
        izlesene.setAttribute('layout', 'responsive');
      }
      doc.body.appendChild(izlesene);
      return izlesene
        .build()
        .then(() => {
          return izlesene.layoutCallback();
        })
        .then(() => izlesene);
    }

    it('renders', () => {
      return getIzlesene('7221390').then(izlesene => {
        const iframe = izlesene.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.src).to.equal(
          'https://www.izlesene.com/embedplayer/7221390/?'
        );
      });
    });

    it('renders responsively', () => {
      return getIzlesene('7221390', true).then(izlesene => {
        const iframe = izlesene.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.className).to.match(/i-amphtml-fill-content/);
      });
    });

    it('requires data-videoid', () => {
      return allowConsoleError(() => {
        return getIzlesene('').should.eventually.be.rejectedWith(
          /The data-videoid attribute is required for/
        );
      });
    });
  }
);
