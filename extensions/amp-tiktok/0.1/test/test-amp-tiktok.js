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
import * as dom from '../../../../src/dom';
import {Services} from '../../../../src/services';
import {computedStyle} from '../../../../src/style';

const VIDEOID = '6948210747285441798';

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
    let createElementWithAttributes;
    let clock;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      clock = env.sandbox.useFakeTimers();
      createElementWithAttributes = dom.createElementWithAttributes;

      env.sandbox
        .stub(dom, 'createElementWithAttributes')
        .callsFake((document, tagName, attributes) => {
          if (tagName === 'iframe' && attributes.src) {
            // Serve a blank page, since these tests don't require an actual page.
            // hash # at the end so path is not affected by param concat
            attributes.src = `http://localhost:${location.port}/test/fixtures/served/blank.html#${attributes.src}`;
          }
          return createElementWithAttributes(document, tagName, attributes);
        });

      const oEmbedJsonResponse = {
        'thumbnail_url': '/examples/img/ampicon.png',
        'title': 'Test TikTok Title',
      };
      env.sandbox
        .stub(Services.xhrFor(win), 'fetchJson')
        .resolves({json: () => Promise.resolve(oEmbedJsonResponse)});
    });

    function getTiktokBuildOnly(attrs = {}) {
      const tiktok = dom.createElementWithAttributes(
        win.document,
        'amp-tiktok',
        {
          layout: 'responsive',
          width: '325px',
          height: '730px',
          ...attrs,
        }
      );
      doc.body.appendChild(tiktok);
      return tiktok.buildInternal().then(() => tiktok);
    }

    async function getTiktok(attrs = {}) {
      const tiktok = await getTiktokBuildOnly(attrs);
      const impl = await tiktok.getImpl();
      return impl.layoutCallback().then(() => tiktok);
    }

    it('renders with videoId', async () => {
      const player = await getTiktok({'data-src': VIDEOID});
      const iframe = player.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.getAttribute('src')).to.contain(VIDEOID);
      expect(iframe.getAttribute('src')).to.contain('en-US');
    });

    it('renders with video src url', async () => {
      const videoSrc =
        'https://www.tiktok.com/@scout2015/video/6948210747285441798';
      const player = await getTiktok({'data-src': videoSrc});
      const iframe = player.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.getAttribute('src')).to.contain(VIDEOID);
      expect(iframe.getAttribute('src')).to.contain('en-US');
    });

    it('renders with videoId and locale', async () => {
      const player = await getTiktok({
        'data-src': VIDEOID,
        'data-locale': 'fr-FR',
      });
      const iframe = player.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.getAttribute('src')).to.contain(VIDEOID);
      expect(iframe.getAttribute('src')).to.contain('fr-FR');
    });

    it.skip('resizes using the fallback mechanism when no messages are received', async () => {
      // TODO(rnthomas) Debug race condition in this test.
      const player = await getTiktokBuildOnly({'data-src': VIDEOID});
      const impl = await player.getImpl(false);

      await impl.layoutCallback();
      // Wait 1100ms for resize fallback to be invoked.
      clock.tick(1100);

      const playerIframe = player.querySelector('iframe');
      env.sandbox.stub(impl, 'handleTiktokMessages_');

      expect(computedStyle(win, playerIframe).height).to.equal('775.25px');
    });

    it('renders placeholder', async () => {
      const videoSrc =
        'https://www.tiktok.com/@scout2015/video/6948210747285441798';
      const player = await getTiktok({'data-src': videoSrc});
      const placeholder = player.querySelector('img');
      expect(placeholder).to.not.be.null;
      expect(placeholder.getAttribute('src')).to.equal(
        '/examples/img/ampicon.png'
      );
    });

    it.skip('renders aria title without oEmbed Request', async () => {
      // TODO(rnthomas) Debug race condition in this test.
      const player = await getTiktokBuildOnly({'data-src': VIDEOID});
      const impl = await player.getImpl();

      // Wait 1100ms for resize fallback to be invoked because aria-title is set in that call.
      clock.tick(1100);
      await impl.layoutCallback();

      const playerIframe = player.querySelector('iframe');
      const ariaTitle = playerIframe.getAttribute('aria-title');
      expect(ariaTitle).to.equal('TikTok');
    });

    it('renders aria title with oEmbed request', async () => {
      const videoSrc =
        'https://www.tiktok.com/@scout2015/video/6948210747285441798';
      const player = await getTiktok({'data-src': videoSrc});

      // Wait 1100ms for resize fallback to be invoked because aria-title is set in that call.
      clock.tick(1100);
      const playerIframe = player.querySelector('iframe');
      const ariaTitle = playerIframe.getAttribute('aria-title');
      expect(ariaTitle).to.equal('TikTok: Test TikTok Title');
    });

    it('removes iframe after unlayoutCallback', async () => {
      const player = await getTiktok({'data-src': VIDEOID});
      const playerIframe = player.querySelector('iframe');
      expect(playerIframe).to.not.be.null;

      const impl = await player.getImpl(false);
      impl.unlayoutCallback();
      expect(player.querySelector('iframe')).to.be.null;
      expect(impl.iframe_).to.be.null;
    });
  }
);
