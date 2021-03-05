/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-tiktok';
import {createElementWithAttributes, isAmpElement} from '../../../../src/dom';

describes.realWin(
  'amp-tiktok',
  {
    amp: {
      extensions: ['amp-tiktok'],
    },
  },
  (env) => {
    let win;
    let doc;
    let clock;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      clock = env.sandbox.useFakeTimers();
      clock.tick(0);
    });

    async function getTiktok(videoId, isFullSrcUrl, opt_locale) {
      const tiktok = createElementWithAttributes(win.document, 'amp-tiktok', {
        layout: 'responsive',
        width: '325px',
        height: '730px',
      });
      if (isFullSrcUrl) {
        tiktok.setAttribute(
          'data-src',
          `https://www.tiktok.com/@scout2015/video/${videoId}?lang=en-US`
        );
      } else if (opt_locale) {
        tiktok.setAttribute('data-locale', opt_locale);
        tiktok.setAttribute('data-src', videoId);
      } else {
        tiktok.setAttribute('data-src', videoId);
      }
      doc.body.appendChild(tiktok);
      return tiktok
        .buildInternal()
        .then(() => {
          return tiktok.layoutCallback();
        })
        .then(() => tiktok);
    }

    it('renders with full src url', async () => {
      const videoId = '6718335390845095173';
      const player = await getTiktok(videoId, true);
      const iframe = player.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.src).to.contain(videoId);
      expect(iframe.src).to.contain('en-US');
    });

    it('renders with videoId', async () => {
      const videoId = '6718335390845095173';
      const player = await getTiktok(videoId, false);
      const iframe = player.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.src).to.contain(videoId);
      expect(iframe.src).to.contain('en-US');
    });

    it('renders with videoId and locale', async () => {
      const videoId = '6718335390845095173';
      const player = await getTiktok(videoId, false, 'fr-FR');
      const iframe = player.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.src).to.contain(videoId);
      expect(iframe.src).to.contain('fr-FR');
    });

    it('removes iframe after unlayoutCallback', async () => {
      const videoId = '6718335390845095173';
      const player = await getTiktok(videoId, true);
      const playerIframe = player.querySelector('iframe');
      expect(playerIframe).to.not.be.null;

      const impl = await player.getImpl(false);
      impl.unlayoutCallback();
      expect(player.querySelector('iframe')).to.be.null;
      expect(impl.iframe_).to.be.null;
    });
  }
);
