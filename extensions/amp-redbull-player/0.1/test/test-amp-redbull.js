/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-redbull-player';

describes.realWin(
  'amp-redbull-player',
  {
    amp: {
      extensions: ['amp-redbull-player'],
    },
  },
  (env) => {
    let win, doc;
    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getRedBullElement(videoId) {
      const player = doc.createElement('amp-redbull-player');

      if (videoId) {
        player.setAttribute('data-param-videoid', videoId);
      }

      player.setAttribute('width', '222');
      player.setAttribute('height', '111');
      player.setAttribute('layout', 'responsive');

      doc.body.appendChild(player);
      return player.build().then(() => {
        player.layoutCallback();
        return player;
      });
    }

    it('renders the Red Bull player', async () => {
      const player = await getRedBullElement(
        'rrn:content:videos:3965a26c-052e-575f-a28b-ded6bee23ee1:en-INT'
      );
      const playerIframe = player.querySelector('iframe');
      expect(playerIframe).to.not.be.null;
      expect(playerIframe.src).to.equal(
        'https://player.redbull.com/amp/amp-iframe.html?videoId=' +
          encodeURIComponent(
            'rrn:content:videos:3965a26c-052e-575f-a28b-ded6bee23ee1:en-INT'
          ) +
          '&skinId=com&ampTagId=rbvideo&locale=global'
      );
    });

    it('fails without videoId', () => {
      return getRedBullElement(null).should.eventually.be.rejectedWith(
        /The data-param-videoid attribute is required/
      );
    });
  }
);
