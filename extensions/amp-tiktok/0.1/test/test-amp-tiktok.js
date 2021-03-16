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
import {Services} from '../../../../src/services';
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
    let createElmentWithAttributesStub;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      clock.tick(0);
    });

    async function getTiktok(attrs = {}) {
      const tiktok = createElementWithAttributes(win.document, 'amp-tiktok', {
        layout: 'responsive',
        width: '325px',
        height: '730px',
        ...attrs,
      });
      doc.body.appendChild(tiktok);
      env.sandbox.stub(Services, 'createElementWithAttributes').returns();
      const impl = await tiktok.getImpl(false);
      impl.baseURL_ =
        // Serve a blank page, since these tests don't require an actual page.
        // hash # at the end so path is not affected by param concat
        `http://localhost:${location.port}/test/fixtures/served/blank.html#`;
      return tiktok
        .buildInternal()
        .then(() => {
          return tiktok.layoutCallback();
        })
        .then(() => tiktok);
    }

    it('renders with videoId', async () => {
      const videoId = '6718335390845095173';
      const player = await getTiktok({'data-src': videoId});
      const iframe = player.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.getAttribute('src')).to.contain(videoId);
      expect(iframe.getAttribute('src')).to.contain('en-US');
    });

    it('renders with videoId', async () => {
      const videoId = '6718335390845095173';
      const videoSrc =
        'https://www.tiktok.com/@scout2015/video/6718335390845095173';
      const player = await getTiktok({'data-src': videoSrc});
      const iframe = player.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.getAttribute('src')).to.contain(videoId);
      expect(iframe.getAttribute('src')).to.contain('en-US');
    });

    it('renders with videoId and locale', async () => {
      const videoId = '6718335390845095173';
      const player = await getTiktok({
        'data-src': videoId,
        'data-locale': 'fr-FR',
      });
      const iframe = player.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.getAttribute('src')).to.contain(videoId);
      expect(iframe.getAttribute('src')).to.contain('fr-FR');
    });

    it('removes iframe after unlayoutCallback', async () => {
      const videoId = '6718335390845095173';
      const player = await getTiktok({'data-src': videoId});
      const playerIframe = player.querySelector('iframe');
      expect(playerIframe).to.not.be.null;

      const impl = await player.getImpl(false);
      impl.unlayoutCallback();
      expect(player.querySelector('iframe')).to.be.null;
      expect(impl.iframe_).to.be.null;
    });
  }
);
