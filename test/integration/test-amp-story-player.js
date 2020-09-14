/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {BrowserController} from '../../testing/test-helper';
import {poll} from '../../testing/iframe';

const config = describe.configure().skipEdge().skipSafari();

config.run('amp-story-player', () => {
  const extensions = ['amp-story:1.0', 'amp-social-share'];
  describes.integration(
    'amp-story-player',
    {
      body: `
      <script async src="/dist/amp-story-player.js"></script>
      <amp-story-player style="width: 360px; height: 600px;">
        <a href="/examples/amp-story/advance-after-background-audio.html"
          style="--story-player-poster: url('./img/overview.jpg');"
          class="story">
          <span class="title">A local’s guide to what to eat and do in New York City</span>
        </a>
      </amp-story-player>
    `,
      extensions,
    },
    (env) => {
      let browser;
      let playerShadowDoc;

      beforeEach(async () => {
        browser = new BrowserController(env.win);

        env.iframe.style.height = '732px';
        env.iframe.style.width = '412px';

        await browser.waitForShadowRoot('amp-story-player', 25000);
        playerShadowDoc = env.win.document.querySelector('amp-story-player')
          .shadowRoot;
      });

      it('should auto advance story with audio after unmuting', async () => {
        const iframeDoc = playerShadowDoc.querySelector('iframe')
          .contentDocument;
        const iframeDocController = new BrowserController(env.win, iframeDoc);

        await iframeDocController.waitForElementLayout('amp-story');
        await iframeDocController.waitForElementLayout(
          'amp-story-page[active]'
        );

        const systemLayer = iframeDoc.querySelector(
          '.i-amphtml-system-layer-host'
        ).shadowRoot;
        const unmute = systemLayer.querySelector(
          'button.i-amphtml-story-unmute-audio-control'
        );

        unmute.click();

        await poll(
          'wait for audio to be over',
          () => {
            return !!iframeDoc.querySelector('#page2[active]');
          },
          undefined,
          10000
        );

        return expect(iframeDoc.querySelector('#page2[active]')).to.exist;
      });
    }
  );
});
